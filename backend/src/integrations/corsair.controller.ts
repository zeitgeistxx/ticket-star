import { Controller, Post, Get, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Controller('integrations/corsair')
export class CorsairController {
  constructor(private readonly db: DatabaseService) {}

  @Get('webhooks')
  async getWebhookLogs() {
    this.db.logAudit('WEBHOOK_LOGS_LISTED', `Webhook logs fetched (${this.db.webhookLogs.length} records)`);
    return this.db.webhookLogs;
  }

  @Get('audit-logs')
  async getAuditLogs() {
    this.db.logAudit('AUDIT_LOGS_LISTED', `Audit logs fetched (${this.db.auditLogs.length} records)`);
    return this.db.auditLogs;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers() headers: Record<string, string>,
    @Body() payload: {
      event: string;
      eventId?: number;
      ticketId?: number;
      action: string;
      data?: Record<string, unknown>;
    },
  ) {
    const signature = headers['x-corsair-signature'] || 'simulated-signature';

    const logEntry = {
      id: `log-${Date.now()}`,
      plugin: 'corsair-event-ticketing',
      action: payload.event || payload.action,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.db.webhookLogs.unshift(logEntry);
    this.db.logAudit(
      'CORSAIR_WEBHOOK_RECEIVED',
      `Received Corsair webhook '${payload.event || payload.action}' (sig: ${signature.slice(0, 12)}...). Routed to Gmail, Slack, Discord integrations.`,
    );

    return {
      status: 'success',
      handledBy: 'corsair-event-ticketing',
      event: payload.event || payload.action,
    };
  }
}
