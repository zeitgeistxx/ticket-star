import Head from 'next/head';
import Link from 'next/link';
import { Ticket, Home } from 'lucide-react';

export default function Custom404() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-dark)', padding: 24 }}>
      <Head><title>404 — Page Not Found | TicketStar</title></Head>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 80, height: 80, background: 'rgba(0,82,255,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Ticket size={36} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 700, color: 'var(--primary)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 12 }}>Lost in the crowd?</h2>
        <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.7, marginBottom: 32 }}>
          This page doesn&apos;t exist. Maybe it was moved, or the link is wrong. Let&apos;s get you back on track.
        </p>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary"><Home size={16} /> Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
