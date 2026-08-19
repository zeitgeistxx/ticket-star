import Head from 'next/head';
import Link from 'next/link';
import { Ticket, RefreshCw } from 'lucide-react';

export default function Custom500() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-dark)', padding: 24 }}>
      <Head><title>500 — Server Error | TicketStar</title></Head>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 80, height: 80, background: 'rgba(207,32,47,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Ticket size={36} color="var(--down)" />
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 700, color: 'var(--down)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, lineHeight: 1 }}>500</h1>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 12 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.7, marginBottom: 32 }}>
          Our servers hit a snag. We&apos;re working on it. Try refreshing or come back later.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}><RefreshCw size={16} /> Refresh</button>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary">Back to Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
