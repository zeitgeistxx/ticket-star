import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { AuthGuard } from '../common/auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getAnalytics(@Req() req: Request) {
    const user = (req as any).user;
    const allEvents = Array.from(this.db.events.values());
    const allTickets = Array.from(this.db.tickets.values());
    const allUsers = Array.from(this.db.users.values());

    this.db.logAudit('ANALYTICS_ACCESSED', `Analytics fetched by ${user.username} (role: ${user.role})`);

    // If user is admin, return global stats
    if (user.role === 'admin') {
      const totalRevenue = allEvents.reduce((sum, e) => sum + e.totalFunds, 0);
      const totalSold = allTickets.filter(t => t.status === 'ISSUED' || t.status === 'CHECKED_IN').length;
      const totalRefunded = allTickets.filter(t => t.status === 'REFUNDED').length;

      return {
        totalEvents: allEvents.length,
        totalTickets: allTickets.length,
        ticketsSold: totalSold,
        ticketsRefunded: totalRefunded,
        totalRevenue,
        totalUsers: allUsers.length,
        organizers: allUsers.filter(u => u.role === 'organizer').length,
        attendees: allUsers.filter(u => u.role === 'attendee').length,
        proSubscribers: allUsers.filter(u => u.isSubscribed).length,
        activeEvents: allEvents.filter(e => !e.settled).length,
        settledEvents: allEvents.filter(e => e.settled).length,
      };
    }

    // For organizers, return their stats
    const myEvents = allEvents.filter(e => e.organizer === user.username);
    const myEventIds = new Set(myEvents.map(e => e.id));
    const myTickets = allTickets.filter(t => myEventIds.has(t.eventId));

    const totalRevenue = myEvents.reduce((sum, e) => sum + e.totalFunds, 0);
    const totalSold = myTickets.filter(t => t.status === 'ISSUED' || t.status === 'CHECKED_IN').length;

    return {
      totalEvents: myEvents.length,
      totalTickets: myTickets.length,
      ticketsSold: totalSold,
      ticketsRefunded: myTickets.filter(t => t.status === 'REFUNDED').length,
      totalRevenue,
      activeEvents: myEvents.filter(e => !e.settled).length,
      settledEvents: myEvents.filter(e => e.settled).length,
    };
  }

  @Get('revenue')
  async getRevenue(@Req() req: Request) {
    const user = (req as any).user;
    const allEvents = Array.from(this.db.events.values());
    const events = user.role === 'admin'
      ? allEvents
      : allEvents.filter(e => e.organizer === user.username);

    this.db.logAudit('REVENUE_ACCESSED', `Revenue data fetched by ${user.username} (${events.length} events)`);
    return events.map(e => ({
      eventId: e.id,
      title: e.title,
      ticketsSold: e.ticketsSold,
      totalFunds: e.totalFunds,
      settled: e.settled,
    }));
  }

  @Get('users')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserAnalytics() {
    const users = Array.from(this.db.users.values());
    return {
      total: users.length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        organizer: users.filter(u => u.role === 'organizer').length,
        attendee: users.filter(u => u.role === 'attendee').length,
      },
      bySubscription: {
        pro: users.filter(u => u.isSubscribed).length,
        free: users.filter(u => !u.isSubscribed).length,
      },
    };
  }
}
