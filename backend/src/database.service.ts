import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export enum TicketStatus {
  ISSUED = 'ISSUED',
  CHECKED_IN = 'CHECKED_IN',
  REFUNDED = 'REFUNDED',
}

export interface Ticket {
  id: number;
  eventId: number;
  category: string; // 'General', 'VIP', 'Sponsor'
  owner: string; // username
  ownerWallet: string;
  qrCode: string; // uuid or unique string
  status: TicketStatus;
  price: number; // in XLM
  txHash: string;
  timestamp: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  venue: string;
  category?: string;
  organizer: string;
  organizerWallet: string;
  priceGeneral: number;
  priceVIP: number;
  maxTickets: number;
  ticketsSold: number;
  settled: boolean;
  totalFunds: number;
  stellarContractId?: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  walletAddress: string;
  role: 'organizer' | 'attendee' | 'sponsor' | 'staff' | 'admin';
  isSubscribed: boolean;
}

export interface WebhookLog {
  id: string;
  plugin: string;
  action: string;
  payload: any;
  timestamp: string;
}

export interface AuditLog {
  action: string;
  details: string;
  timestamp: string;
}

export interface PremiumScanLog {
  ticketId: number;
  eventId: number;
  scannedAt: string;
  scannedBy: string;
  deviceIp: string;
  latitude: number;
  longitude: number;
  humidityPercentage: number;
  temperatureCelsius: number;
}

@Injectable()
export class DatabaseService {
  public users: Map<string, User> = new Map();
  public events: Map<number, Event> = new Map();
  public tickets: Map<number, Ticket> = new Map();
  public webhookLogs: WebhookLog[] = [];
  public auditLogs: AuditLog[] = [];
  public premiumScanLogs: Map<number, PremiumScanLog> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.seedDefaults();
    this.syncFromSupabase();
  }

  private seedDefaults() {
    // Seed initial users
    this.users.set('admin', {
      id: 'usr-admin',
      username: 'admin',
      walletAddress: 'GA5W247YEV2IQ2FEPMJM6FPM6FPM6FPM6FPM6FPM6FPM6FPM6FPM6FPM',
      role: 'admin',
      isSubscribed: true,
    });
    this.users.set('organizer_epic', {
      id: 'usr-org-1',
      username: 'epic_events',
      walletAddress: 'Gorg12345678901234567890123456789012345678901234567890',
      role: 'organizer',
      isSubscribed: false,
    });
    this.users.set('attendee_alice', {
      id: 'usr-att-1',
      username: 'alice_crypto',
      walletAddress: 'Gbuyer12345678901234567890123456789012345678901234567890',
      role: 'attendee',
      isSubscribed: true,
    });

    // Seed initial events
    this.events.set(101, {
      id: 101,
      title: 'Stellar Meridian Hackathon 2026',
      description: 'The premier global conference and building event for the Stellar ecosystem. Innovate and scale on Soroban.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      venue: 'Metropolitan Pavilion, New York, NY',
      organizer: 'epic_events',
      organizerWallet: 'Gorg12345678901234567890123456789012345678901234567890',
      priceGeneral: 5,
      priceVIP: 25,
      maxTickets: 500,
      ticketsSold: 1,
      settled: false,
      totalFunds: 5,
      stellarContractId: 'CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX',
    });

    // Seed initial ticket
    this.tickets.set(2001, {
      id: 2001,
      eventId: 101,
      category: 'General',
      owner: 'alice_crypto',
      ownerWallet: 'Gbuyer12345678901234567890123456789012345678901234567890',
      qrCode: 'qr-alice-meridian-101-uuid',
      status: TicketStatus.ISSUED,
      price: 5,
      txHash: 'stellar-tx-initial-ticket-purchase-hash',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    });

    // Seed telemetry logs for the premium x402 check
    this.premiumScanLogs.set(2001, {
      ticketId: 2001,
      eventId: 101,
      scannedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      scannedBy: 'Gate 2 Verifier (Device ID #9)',
      deviceIp: '192.168.1.144',
      latitude: 40.730610,
      longitude: -73.935242,
      humidityPercentage: 54,
      temperatureCelsius: 22.4,
    });
  }

  private async syncFromSupabase() {
    try {
      const dbUsers = await this.prisma.user.findMany();
      dbUsers.forEach(u => {
        this.users.set(u.username, {
          id: u.id,
          username: u.username,
          email: u.email || undefined,
          walletAddress: u.walletAddress,
          role: u.role as any,
          isSubscribed: u.isSubscribed,
        });
      });

      const dbEvents = await this.prisma.event.findMany();
      dbEvents.forEach(e => {
        this.events.set(e.id, {
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.date,
          venue: e.venue,
          category: e.category,
          organizer: e.organizer,
          organizerWallet: e.organizerWallet,
          priceGeneral: e.priceGeneral,
          priceVIP: e.priceVIP,
          maxTickets: e.maxTickets,
          ticketsSold: e.ticketsSold,
          settled: e.settled,
          totalFunds: e.totalFunds,
          stellarContractId: e.stellarContractId || undefined,
        });
      });

      const dbTickets = await this.prisma.ticket.findMany();
      dbTickets.forEach(t => {
        this.tickets.set(t.id, {
          id: t.id,
          eventId: t.eventId,
          category: t.category,
          owner: t.owner,
          ownerWallet: t.ownerWallet,
          qrCode: t.qrCode,
          status: t.status as any,
          price: t.price,
          txHash: t.txHash,
          timestamp: t.timestamp.toISOString(),
        });
      });

      this.logAudit('SUPABASE_DB_SYNC', 'Synchronized database state from Supabase PostgreSQL.');
    } catch {
      // Graceful fallback if offline
    }
  }

  async saveEventToSupabase(event: Event) {
    this.events.set(event.id, event);
    try {
      await this.prisma.event.upsert({
        where: { id: event.id },
        update: {
          title: event.title,
          description: event.description,
          date: event.date,
          venue: event.venue,
          category: event.category || 'Concert',
          organizer: event.organizer,
          organizerWallet: event.organizerWallet,
          priceGeneral: event.priceGeneral,
          priceVIP: event.priceVIP,
          maxTickets: event.maxTickets,
          ticketsSold: event.ticketsSold,
          settled: event.settled,
          totalFunds: event.totalFunds,
          stellarContractId: event.stellarContractId,
        },
        create: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          venue: event.venue,
          category: event.category || 'Concert',
          organizer: event.organizer,
          organizerWallet: event.organizerWallet,
          priceGeneral: event.priceGeneral,
          priceVIP: event.priceVIP,
          maxTickets: event.maxTickets,
          ticketsSold: event.ticketsSold,
          settled: event.settled,
          totalFunds: event.totalFunds,
          stellarContractId: event.stellarContractId,
        },
      });
    } catch (err: any) {
      // Graceful fallback if DB offline
    }
  }

  async saveUserToSupabase(user: User) {
    this.users.set(user.username, user);
    try {
      await this.prisma.user.upsert({
        where: { username: user.username },
        update: {
          walletAddress: user.walletAddress,
          role: user.role,
          isSubscribed: user.isSubscribed,
          email: user.email,
        },
        create: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          role: user.role,
          isSubscribed: user.isSubscribed,
          email: user.email,
        },
      });
    } catch {
      // Graceful fallback
    }
  }

  async logAudit(action: string, details: string) {
    this.auditLogs.unshift({
      action,
      details,
      timestamp: new Date().toISOString(),
    });

    try {
      await this.prisma.auditLog.create({
        data: { action, details },
      });
    } catch {
      // Ignore if DB offline
    }
  }
}
