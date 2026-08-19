import { Controller, Get, Post, Body, Param, Req, Res, HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService, TicketStatus, Ticket, PremiumScanLog } from '../database.service';
import { Request, Response } from 'express';

function extractUserId(req: Request): string {
  const authHeader = req.headers['authorization'] || '';
  return authHeader.replace('Bearer mock-jwt-token-xyz-', '');
}

function mapTicket(ticket: any, db: DatabaseService) {
  const event = db.events.get(ticket.eventId);
  const user = Array.from(db.users.values()).find(u => u.username === ticket.owner);
  return {
    id: ticket.id,
    eventId: ticket.eventId,
    userId: user?.id || 'unknown',
    qrCode: ticket.qrCode,
    status: ticket.status.toLowerCase().replace('_', '-'),
    purchasePrice: ticket.price,
    stellarTxHash: ticket.txHash,
    attendeeName: ticket.owner,
    attendeeEmail: user?.email || `${ticket.owner}@demo.com`,
    eventTitle: event?.title || 'Unknown Event',
    checkedInAt: ticket.status === TicketStatus.CHECKED_IN ? ticket.timestamp : undefined,
    createdAt: ticket.timestamp,
  };
}

@Controller('tickets')
export class TicketsController {
  constructor(private readonly db: DatabaseService) {}

  // GET /tickets/my — returns tickets for the currently authed user
  @Get('my')
  async getMyTickets(@Req() req: Request) {
    const userId = extractUserId(req);
    if (!userId) return [];

    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user) return [];

    const tickets = Array.from(this.db.tickets.values()).filter(t => t.owner === user.username);
    this.db.logAudit('TICKETS_LISTED', `User ${user.username} fetched their ${tickets.length} tickets`);
    return tickets.map(t => mapTicket(t, this.db));
  }

  // GET /tickets/telemetry — x402 gated premium telemetry
  @Get('telemetry')
  async getTelemetry(@Req() req: Request, @Res() res: Response) {
    const paymentHeader = req.headers['x-payment-signature'] || req.headers['x-payment'];

    if (!paymentHeader) {
      const paymentReq = {
        scheme: 'exact',
        price: '$0.01',
        network: 'stellar:testnet',
        payTo: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        asset: 'USDC',
        memo: 'premium-telemetry',
      };

      this.db.logAudit('TELEMETRY_PAYMENT_REQUIRED', 'Telemetry x402 payment challenge sent');
      res.setHeader('X-Payment', JSON.stringify(paymentReq));
      res.setHeader('Access-Control-Expose-Headers', 'X-Payment');
      return res.status(HttpStatus.PAYMENT_REQUIRED).json({
        message: 'Payment Required: Telemetry access requires a $0.01 USDC micro-payment.',
        paymentDetails: paymentReq,
      });
    }

    const logs = Array.from(this.db.premiumScanLogs.values());
    this.db.logAudit('TELEMETRY_ACCESSED', `Telemetry data accessed (${logs.length} records) via x402`);
    res.setHeader('X-Payment-Settle', 'verified');
    res.setHeader('Access-Control-Expose-Headers', 'X-Payment-Settle');
    return res.status(HttpStatus.OK).json(logs);
  }

  // GET /tickets — all tickets (admin/organizer)
  @Get()
  async getTickets(@Req() req: Request) {
    const tickets = Array.from(this.db.tickets.values()).map(t => mapTicket(t, this.db));
    this.db.logAudit('ALL_TICKETS_LISTED', `All tickets fetched (${tickets.length} total)`);
    return tickets;
  }

  // POST /tickets/purchase
  @Post('purchase')
  async buyTicket(
    @Req() req: Request,
    @Body() payload: {
      userId?: string;
      eventId: number;
      category?: string;
      stellarTxHash?: string;
      quantity?: number;
    }
  ) {
    const userId = payload.userId || extractUserId(req);
    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('Buyer account not found');
    }

    const event = this.db.events.get(Number(payload.eventId));
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.ticketsSold >= event.maxTickets) {
      throw new ForbiddenException('Event is sold out');
    }

    const category = payload.category || 'General';
    const quantity = Math.max(1, Math.min(payload.quantity || 1, event.maxTickets - event.ticketsSold));
    const price = category === 'VIP' ? event.priceVIP : event.priceGeneral;
    const created: Ticket[] = [];

    for (let i = 0; i < quantity; i++) {
      const ticketId = 2000 + this.db.tickets.size + 1;
      const ticketQr = `qr-${user.username}-${event.id}-${ticketId}-${Math.random().toString(36).substring(2, 6)}`;

      const newTicket: Ticket = {
        id: ticketId,
        eventId: event.id,
        category,
        owner: user.username,
        ownerWallet: user.walletAddress,
        qrCode: ticketQr,
        status: TicketStatus.ISSUED,
        price,
        txHash: payload.stellarTxHash || `stellar-tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      event.ticketsSold += 1;
      event.totalFunds += price;
      this.db.tickets.set(ticketId, newTicket);

      const mockTelemetry: PremiumScanLog = {
        ticketId,
        eventId: event.id,
        scannedAt: '',
        scannedBy: '',
        deviceIp: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
        latitude: 40.730610 + (Math.random() - 0.5) * 0.01,
        longitude: -73.935242 + (Math.random() - 0.5) * 0.01,
        humidityPercentage: Math.floor(40 + Math.random() * 30),
        temperatureCelsius: parseFloat((18 + Math.random() * 10).toFixed(1)),
      };
      this.db.premiumScanLogs.set(ticketId, mockTelemetry);

      created.push(newTicket);
    }

    this.db.events.set(event.id, event);

    this.db.logAudit(
      'SOROBAN_TICKET_ISSUED',
      `Onchain contract minted ${quantity} Ticket(s) (${category}) for Event #${event.id} to ${user.username}.`
    );

    return created.map(t => mapTicket(t, this.db));
  }

  // POST /tickets/scan
  @Post('scan')
  async scanTicket(
    @Req() req: Request,
    @Body() payload: { qrCode: string; verifierId?: string }
  ) {
    const verifierId = payload.verifierId || extractUserId(req);
    const verifier = Array.from(this.db.users.values()).find(u => u.id === verifierId);
    if (!verifier) {
      throw new NotFoundException('Verifier account not found');
    }

    const ticket = Array.from(this.db.tickets.values()).find(t => t.qrCode === payload.qrCode);
    if (!ticket) {
      this.db.logAudit('TICKET_SCAN_ERROR', `Scanned invalid QR code: ${payload.qrCode}`);
      throw new NotFoundException('Ticket not found or invalid QR code');
    }

    if (ticket.status !== TicketStatus.ISSUED) {
      throw new ForbiddenException(`Ticket is already ${ticket.status}`);
    }

    const event = this.db.events.get(ticket.eventId);
    if (!event) {
      throw new NotFoundException('Associated event not found');
    }

    ticket.status = TicketStatus.CHECKED_IN;
    this.db.tickets.set(ticket.id, ticket);

    const tel = this.db.premiumScanLogs.get(ticket.id);
    if (tel) {
      tel.scannedAt = new Date().toISOString();
      tel.scannedBy = `${verifier.username} (${verifier.role.toUpperCase()})`;
      this.db.premiumScanLogs.set(ticket.id, tel);
    }

    this.db.logAudit(
      'SOROBAN_ATTENDANCE_RECORDED',
      `Check-in for Ticket #${ticket.id} (Event #${event.id}) by ${verifier.username}.`
    );

    const webhookEntry = {
      id: `wk-${Date.now()}`,
      plugin: 'corsair-event-ticketing',
      action: 'ticket.checked_in',
      payload: {
        eventId: event.id,
        eventTitle: event.title,
        ticketId: ticket.id,
        category: ticket.category,
        owner: ticket.owner,
        scannedAt: new Date().toISOString(),
        scannedBy: verifier.username,
      },
      timestamp: new Date().toISOString(),
    };
    this.db.webhookLogs.unshift(webhookEntry);

    return {
      ticket: mapTicket(ticket, this.db),
      message: `Ticket #${ticket.id} checked in successfully`,
    };
  }

  // POST /tickets/:id/refund
  @Post(':id/refund')
  async refundTicket(@Param('id') id: string, @Req() req: Request, @Body() payload?: { organizerId?: string }) {
    const ticket = this.db.tickets.get(Number(id));
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.ISSUED) {
      throw new ForbiddenException('Ticket can only be refunded if not yet scanned or already refunded');
    }

    const event = this.db.events.get(ticket.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    ticket.status = TicketStatus.REFUNDED;
    event.ticketsSold -= 1;
    event.totalFunds -= ticket.price;

    this.db.tickets.set(ticket.id, ticket);
    this.db.events.set(event.id, event);

    this.db.logAudit(
      'SOROBAN_REFUND_APPROVED',
      `Refund of ${ticket.price} XLM for Ticket #${ticket.id} to owner ${ticket.owner}.`
    );

    return { ticket: mapTicket(ticket, this.db) };
  }

  // GET /tickets/:id/premium-logs
  @Get(':id/premium-logs')
  async getPremiumTelemetry(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const ticketId = Number(id);
    const paymentHeader = req.headers['x-payment-signature'] || req.headers['x-payment'];

    if (!paymentHeader) {
      const paymentReq = {
        scheme: 'exact',
        price: '$0.01',
        network: 'stellar:testnet',
        payTo: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        asset: 'USDC',
        memo: `premium-scan-logs-${ticketId}`,
      };
      res.setHeader('X-Payment', JSON.stringify(paymentReq));
      res.setHeader('Access-Control-Expose-Headers', 'X-Payment');
      return res.status(HttpStatus.PAYMENT_REQUIRED).json({
        message: 'Payment Required: Live check-in GPS telemetry access requires a $0.01 USDC micro-payment.',
        paymentDetails: paymentReq,
      });
    }

    if (!paymentHeader) {
      this.db.logAudit('PREMIUM_LOG_PAYMENT_REQUIRED', `Premium log access for Ticket #${ticketId} requires x402 payment`);
    }

    const log = this.db.premiumScanLogs.get(ticketId);
    if (!log) {
      throw new NotFoundException(`Telemetry logs for Ticket #${ticketId} not found`);
    }

    this.db.logAudit('PREMIUM_LOG_ACCESSED', `Premium telemetry log for Ticket #${ticketId} accessed`);
    res.setHeader('X-Payment-Settle', 'verified');
    res.setHeader('Access-Control-Expose-Headers', 'X-Payment-Settle');
    return res.status(HttpStatus.OK).json(log);
  }
}
