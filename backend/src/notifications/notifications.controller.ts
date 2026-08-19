import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { AuthGuard } from '../common/auth.guard';

export interface Notification {
  id: string;
  userId: string;
  type: 'ticket_purchased' | 'event_created' | 'check_in' | 'refund' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  private notifications: Notification[] = [];

  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getNotifications(@Req() req: Request) {
    const user = (req as any).user;
    const list = this.notifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.db.logAudit('NOTIFICATIONS_LISTED', `User ${user.username} fetched ${list.length} notifications`);
    return list;
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const user = (req as any).user;
    const count = this.notifications.filter(n => n.userId === user.id && !n.read).length;
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    const notif = this.notifications.find(n => n.id === id && n.userId === user.id);
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    notif.read = true;
    this.db.logAudit('NOTIFICATION_MARKED_READ', `User ${user.username} marked notification ${id} as read`);
    return notif;
  }

  @Post('mark-all-read')
  async markAllRead(@Req() req: Request) {
    const user = (req as any).user;
    this.notifications.forEach(n => {
      if (n.userId === user.id) n.read = true;
    });
    this.db.logAudit('ALL_NOTIFICATIONS_READ', `User ${user.username} marked all notifications as read`);
    return { message: 'All notifications marked as read' };
  }

  // Internal method for other controllers to push notifications
  push(userId: string, type: Notification['type'], title: string, message: string, metadata?: Record<string, unknown>) {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      type,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.notifications.unshift(notif);
    this.db.logAudit('NOTIFICATION_SENT', `[${type}] ${title} — ${message}`);
    return notif;
  }
}
