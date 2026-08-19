import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Supabase PostgreSQL database...');

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: 'usr-admin',
      username: 'admin',
      email: 'admin@demo.com',
      walletAddress: 'GA5W247YEV2IQ2FEPMJM6FPM6FPM6FPM6FPM6FPM6FPM6FPM6FPM6FPM',
      role: 'admin',
      isSubscribed: true,
    },
  });

  const organizer = await prisma.user.upsert({
    where: { username: 'epic_events' },
    update: {},
    create: {
      id: 'usr-org-1',
      username: 'epic_events',
      email: 'organizer@demo.com',
      walletAddress: 'Gorg12345678901234567890123456789012345678901234567890',
      role: 'organizer',
      isSubscribed: true,
    },
  });

  const attendee = await prisma.user.upsert({
    where: { username: 'alice_crypto' },
    update: {},
    create: {
      id: 'usr-att-1',
      username: 'alice_crypto',
      email: 'attendee@demo.com',
      walletAddress: 'Gbuyer12345678901234567890123456789012345678901234567890',
      role: 'attendee',
      isSubscribed: true,
    },
  });

  // Seed Event #101
  const eventDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const event = await prisma.event.upsert({
    where: { id: 101 },
    update: {},
    create: {
      id: 101,
      title: 'Stellar Meridian Hackathon 2026',
      description: 'The premier global conference and building event for the Stellar ecosystem. Innovate and scale on Soroban.',
      date: eventDate,
      venue: 'Metropolitan Pavilion, New York, NY',
      category: 'Conference',
      organizer: organizer.username,
      organizerWallet: organizer.walletAddress,
      priceGeneral: 5.0,
      priceVIP: 25.0,
      maxTickets: 500,
      ticketsSold: 1,
      settled: false,
      totalFunds: 5.0,
      stellarContractId: 'CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX',
      userId: organizer.id,
    },
  });

  // Seed Ticket #2001
  const ticket = await prisma.ticket.upsert({
    where: { qrCode: 'qr-alice-meridian-101-uuid' },
    update: {},
    create: {
      id: 2001,
      eventId: event.id,
      category: 'General',
      owner: attendee.username,
      ownerWallet: attendee.walletAddress,
      qrCode: 'qr-alice-meridian-101-uuid',
      status: 'ISSUED',
      price: 5.0,
      txHash: 'stellar-tx-initial-ticket-purchase-hash',
      userId: attendee.id,
    },
  });

  // Seed Premium Scan Log
  await prisma.premiumScanLog.upsert({
    where: { ticketId: ticket.id },
    update: {},
    create: {
      ticketId: ticket.id,
      eventId: event.id,
      scannedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      scannedBy: 'Gate 2 Verifier (Device ID #9)',
      deviceIp: '192.168.1.144',
      latitude: 40.730610,
      longitude: -73.935242,
      humidityPercentage: 54.0,
      temperatureCelsius: 22.4,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_BOOT',
      details: 'Supabase PostgreSQL database successfully seeded with demo events and tickets.',
    },
  });

  console.log('✅ Supabase PostgreSQL database seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
