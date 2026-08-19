import { Controller, Get, Post, Patch, Delete, Body, Param, Req, Query, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService, TicketStatus } from '../database.service';
import { Public } from '../common/public.decorator';
import { Request } from 'express';

function extractUserId(req: Request): string {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return '';
  return authHeader.replace('Bearer mock-jwt-token-xyz-', '');
}

function mapEvent(event: any, organizerId: string = '1') {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    venue: event.venue,
    category: event.category || 'Concert',
    price: event.priceGeneral,
    ticketCount: event.maxTickets,
    ticketsSold: event.ticketsSold,
    status: event.settled ? 'settled' : (event.ticketsSold >= event.maxTickets ? 'closed' : 'selling'),
    stellarContractId: event.stellarContractId || `C${event.organizerWallet?.slice(1, 10) || 'TESTNET'}…`,
    organizerId,
    createdAt: new Date().toISOString(),
  };
}

@Controller('events')
export class EventsController {
  constructor(private readonly db: DatabaseService) {}

  @Public()
  @Get()
  async getEvents(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    let list = Array.from(this.db.events.values());

    // Search filter
    if (search) {
      list = list.filter(
        e =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.venue.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (status) {
      list = list.filter(e => {
        if (status === 'selling') return !e.settled && e.ticketsSold < e.maxTickets;
        if (status === 'closed') return !e.settled && e.ticketsSold >= e.maxTickets;
        if (status === 'settled') return e.settled;
        return true;
      });
    }

    // Sort
    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sort === 'price-asc') {
      list.sort((a, b) => a.priceGeneral - b.priceGeneral);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.priceGeneral - a.priceGeneral);
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Pagination (only when params provided, backward compatible)
    const mapped = list.map(e => {
      const orgUser = Array.from(this.db.users.values()).find(u => u.username === e.organizer);
      return mapEvent(e, orgUser?.id);
    });

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit || '50', 10) || 50));
      const total = mapped.length;
      const totalPages = Math.ceil(total / limitNum);
      const paginated = mapped.slice((pageNum - 1) * limitNum, pageNum * limitNum);
      return {
        events: paginated,
        pagination: { page: pageNum, limit: limitNum, total, totalPages },
      };
    }

    return mapped;
  }

  @Public()
  @Get(':id')
  async getEvent(@Param('id') id: string) {
    const event = this.db.events.get(Number(id));
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const orgUser = Array.from(this.db.users.values()).find(u => u.username === event.organizer);
    return mapEvent(event, orgUser?.id);
  }

  @Get(':id/attendees')
  async getEventAttendees(@Param('id') id: string, @Req() req: Request) {
    const event = this.db.events.get(Number(id));
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const userId = extractUserId(req);
    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    const tickets = Array.from(this.db.tickets.values()).filter(t => t.eventId === event.id);
    this.db.logAudit('ATTENDEES_LISTED', `Attendees listed for Event #${id} by ${user?.username || 'anonymous'} (${tickets.length} attendees)`);
    return tickets.map(t => {
      const user = Array.from(this.db.users.values()).find(u => u.username === t.owner);
      return {
        id: t.id,
        eventId: t.eventId,
        userId: user?.id || 'unknown',
        qrCode: t.qrCode,
        status: t.status.toLowerCase(),
        purchasePrice: t.price,
        stellarTxHash: t.txHash,
        attendeeName: t.owner,
        attendeeEmail: user?.email || `${t.owner}@demo.com`,
        eventTitle: event.title,
        checkedInAt: t.status === 'CHECKED_IN' ? t.timestamp : undefined,
        createdAt: t.timestamp,
      };
    });
  }

  @Post()
  async createEvent(
    @Req() req: Request,
    @Body() payload: {
      userId?: string;
      title: string;
      description: string;
      date: string;
      venue: string;
      category?: string;
      price?: number;
      priceGeneral?: number;
      priceVIP?: number;
      ticketCount?: number;
      maxTickets?: number;
    }
  ) {
    const userId = payload.userId || extractUserId(req);
    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('Organizer account not found');
    }

    // Gated by Pro subscription check
    if (!user.isSubscribed) {
      throw new ForbiddenException('Upgrade Required: Event creation requires an active Pro subscription.');
    }

    const eventId = 100 + this.db.events.size + 1;
    const priceGeneral = Number(payload.price || payload.priceGeneral || 5);
    const maxTickets = Number(payload.ticketCount || payload.maxTickets || 100);

    const newEvent = {
      id: eventId,
      title: payload.title,
      description: payload.description,
      date: payload.date,
      venue: payload.venue,
      category: payload.category || 'Concert',
      organizer: user.username,
      organizerWallet: user.walletAddress,
      priceGeneral,
      priceVIP: Number(payload.priceVIP || priceGeneral * 3),
      maxTickets,
      ticketsSold: 0,
      settled: false,
      totalFunds: 0,
      stellarContractId: 'CC' + Math.random().toString(36).slice(2).toUpperCase().padEnd(54, 'X'),
    };

    await this.db.saveEventToSupabase(newEvent);
    this.db.logAudit(
      'SOROBAN_EVENT_CREATED',
      `Onchain contract initialized Event #${eventId} ('${payload.title}') by ${user.username}.`
    );

    return mapEvent(newEvent, user.id);
  }

  @Patch(':id')
  async updateEvent(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() payload: {
      title?: string;
      description?: string;
      date?: string;
      venue?: string;
      category?: string;
      price?: number;
      priceGeneral?: number;
      ticketCount?: number;
      maxTickets?: number;
    }
  ) {
    const event = this.db.events.get(Number(id));
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const userId = extractUserId(req);
    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user || user.username !== event.organizer) {
      throw new ForbiddenException('Only the event organizer can update this event');
    }

    if (payload.title !== undefined) event.title = payload.title;
    if (payload.description !== undefined) event.description = payload.description;
    if (payload.date !== undefined) event.date = payload.date;
    if (payload.venue !== undefined) event.venue = payload.venue;
    if (payload.category !== undefined) event.category = payload.category;
    if (payload.price !== undefined || payload.priceGeneral !== undefined) {
      event.priceGeneral = Number(payload.price || payload.priceGeneral || event.priceGeneral);
    }
    if (payload.ticketCount !== undefined || payload.maxTickets !== undefined) {
      event.maxTickets = Number(payload.ticketCount || payload.maxTickets || event.maxTickets);
    }

    this.db.events.set(event.id, event);
    this.db.logAudit('EVENT_UPDATED', `Event #${event.id} updated by ${user.username}`);

    const orgUser = Array.from(this.db.users.values()).find(u => u.username === event.organizer);
    return mapEvent(event, orgUser?.id);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string, @Req() req: Request) {
    const eventId = Number(id);
    const event = this.db.events.get(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const userId = extractUserId(req);
    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user || (user.username !== event.organizer && user.role !== 'admin')) {
      throw new ForbiddenException('Only the event organizer or an admin can delete this event');
    }

    // Cascade: refund all issued tickets and delete them
    const eventTickets = Array.from(this.db.tickets.values()).filter(t => t.eventId === eventId);
    for (const ticket of eventTickets) {
      if (ticket.status === TicketStatus.ISSUED || ticket.status === TicketStatus.CHECKED_IN) {
        ticket.status = TicketStatus.REFUNDED;
        this.db.tickets.set(ticket.id, ticket);
      }
    }

    // Remove premium scan logs
    for (const ticket of eventTickets) {
      this.db.premiumScanLogs.delete(ticket.id);
    }

    this.db.events.delete(eventId);
    this.db.logAudit(
      'EVENT_DELETED',
      `Event #${eventId} ('${event.title}') deleted by ${user.username}. ${eventTickets.length} tickets refunded.`
    );

    return { message: `Event #${eventId} deleted successfully` };
  }

  @Post(':id/settle')
  async settleEvent(@Param('id') id: string, @Req() req: Request, @Body() payload?: { userId?: string }) {
    const event = this.db.events.get(Number(id));
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const userId = payload?.userId || extractUserId(req);
    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user || user.username !== event.organizer) {
      throw new ForbiddenException('Only the event organizer can settle funds');
    }

    if (event.settled) {
      throw new ForbiddenException('Event funds are already settled');
    }

    event.settled = true;
    this.db.events.set(event.id, event);
    this.db.logAudit(
      'SOROBAN_EVENT_SETTLEMENT',
      `Released escrow balance of ${event.totalFunds} XLM for Event #${event.id} to organizer wallet ${event.organizerWallet} onchain.`
    );

    return mapEvent(event, user.id);
  }
}
