import { config } from './config';

const BASE = config.apiUrl;

async function request<T>(
  path: string,
  opts: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((opts.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err.message || 'Request failed'), {
      status: res.status,
      data: err,
    });
  }
  return res.json();
}

export const api = {
  // Auth
  signup: (body: { name: string; email: string; password: string; role: string }) =>
    request<{ token: string; user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  stellarLogin: (body: { walletAddress: string; role?: string; name?: string }) =>
    request<{ token: string; user: User }>('/auth/stellar-login', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  forgotPassword: (body: { email: string }) =>
    request<{ message: string; resetToken: string; email: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),

  resetPassword: (body: { token: string; password: string; email: string }) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  toggleSubscription: (userId: string, token: string) =>
    request<{ user: User }>(`/auth/subscribe/${userId}`, { method: 'POST' }, token),

  getUsers: (token: string) =>
    request<User[]>('/auth/users', {}, token),

  // Events
  getEvents: (token?: string) =>
    request<Event[]>('/events', {}, token),

  getEvent: (id: number, token?: string) =>
    request<Event>(`/events/${id}`, {}, token),

  createEvent: (body: Partial<Event>, token: string) =>
    request<Event>('/events', { method: 'POST', body: JSON.stringify(body) }, token),

  updateEvent: (id: number, body: Partial<Event>, token: string) =>
    request<Event>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token),

  deleteEvent: (id: number, token: string) =>
    request<void>(`/events/${id}`, { method: 'DELETE' }, token),

  getEventAttendees: (id: number, token: string) =>
    request<Ticket[]>(`/events/${id}/attendees`, {}, token),

  // Tickets
  getMyTickets: (token: string) =>
    request<Ticket[]>('/tickets/my', {}, token),

  purchaseTicket: (body: { eventId: number; stellarTxHash?: string; quantity?: number }, token: string) =>
    request<Ticket[]>('/tickets/purchase', { method: 'POST', body: JSON.stringify(body) }, token),

  scanTicket: (qrCode: string, token: string) =>
    request<{ ticket: Ticket; message: string }>('/tickets/scan', { method: 'POST', body: JSON.stringify({ qrCode }) }, token),

  refundTicket: (ticketId: number, token: string) =>
    request<{ ticket: Ticket }>(`/tickets/${ticketId}/refund`, { method: 'POST' }, token),

  getTelemetry: (token: string, paymentHeader?: string) =>
    request<TelemetryLog[]>('/tickets/telemetry', {
      headers: paymentHeader ? { 'X-Payment-Signature': paymentHeader } : {},
    }, token),

  // Corsair / Integrations
  getWebhookLogs: (token: string) =>
    request<WebhookLog[]>('/integrations/corsair/webhooks', {}, token),

  getAuditLogs: (token: string) =>
    request<AuditLog[]>('/integrations/corsair/audit-logs', {}, token),

  // Analytics
  getAnalytics: (token: string) =>
    request<any>('/analytics', {}, token),

  getRevenue: (token: string) =>
    request<any[]>('/analytics/revenue', {}, token),

  // Wallet
  connectWallet: (publicKey: string, token: string) =>
    request<{ message: string; walletAddress: string }>('/wallet/connect', { method: 'POST', body: JSON.stringify({ publicKey }) }, token),

  getWalletBalance: (token: string) =>
    request<{ xlm: string; usdc: string }>('/wallet/balance', {}, token),

  generateWallet: (token: string) =>
    request<{ message: string; publicKey: string; secretKey: string }>('/wallet/generate', { method: 'POST' }, token),

  // Notifications
  getNotifications: (token: string) =>
    request<any[]>('/notifications', {}, token),

  getUnreadCount: (token: string) =>
    request<{ count: number }>('/notifications/unread-count', {}, token),

  markNotificationRead: (id: string, token: string) =>
    request<any>(`/notifications/${id}/read`, { method: 'PATCH' }, token),

  markAllNotificationsRead: (token: string) =>
    request<{ message: string }>('/notifications/mark-all-read', { method: 'POST' }, token),
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'organizer' | 'attendee' | 'admin';
  subscription: 'free' | 'pro';
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  price: number;
  ticketCount: number;
  ticketsSold: number;
  status: 'selling' | 'closed' | 'settled';
  stellarContractId?: string;
  organizerId: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  eventId: number;
  userId: string;
  qrCode: string;
  status: 'issued' | 'checked-in' | 'refunded';
  purchasePrice: number;
  stellarTxHash?: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  checkedInAt?: string;
  createdAt: string;
}

export interface TelemetryLog {
  id: string;
  eventId: number;
  action: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface WebhookLog {
  id: string;
  plugin: string;
  action: string;
  payload: unknown;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Analytics {
  totalEvents: number;
  totalTickets: number;
  ticketsSold: number;
  ticketsRefunded: number;
  totalRevenue: number;
  totalUsers?: number;
  organizers?: number;
  attendees?: number;
  proSubscribers?: number;
  activeEvents: number;
  settledEvents: number;
}

export interface WalletBalance {
  xlm: string;
  usdc: string;
}

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

export interface PaginatedResponse<T> {
  events?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
