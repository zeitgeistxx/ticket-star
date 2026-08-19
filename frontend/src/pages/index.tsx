'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Ticket, Calendar, Users, QrCode, Zap, Shield, Globe,
  Plus, Search, Filter, MoreVertical, CheckCircle, XCircle,
  AlertTriangle, Info, ArrowRight, LogOut, Settings, Bell,
  ChevronDown, BarChart2, Activity, Layers, Lock, Star,
  CreditCard, Edit, Trash2, RefreshCw, Download, Eye, Copy,
  Check, Hash, MapPin, Clock, Tag, Sparkles, TrendingUp,
  ScanLine, Wallet, Link2, FileText, ChevronLeft, ChevronRight, Menu,
  Home as HomeIcon, HelpCircle
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { api, Event, Ticket as TicketType, AuditLog, WebhookLog } from '../lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function fmtXLM(n: number) { return `${n.toFixed(2)} XLM`; }
function truncate(s: string, n = 12) { return s.length > n ? s.slice(0, n) + '…' : s; }

// ─── Pagination Bar ─────────────────────────────────────────────────────────
function PaginationBar({ current, total, onChange }: { current: number; total: number; onChange: (n: number) => void }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 24 }}>
      <button className="btn btn-icon-only btn-sm" disabled={current <= 1} onClick={() => onChange(current - 1)}><ChevronLeft size={14} /></button>
      {pages.map(p => (
        <button key={p} className={`btn btn-icon-only btn-sm ${p === current ? 'btn-primary' : ''}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="btn btn-icon-only btn-sm" disabled={current >= total} onClick={() => onChange(current + 1)}><ChevronRight size={14} /></button>
    </div>
  );
}

// ─── QR Code (canvas) ────────────────────────────────────────────────────────
function QRCanvas({ value, size = 120 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(ref.current!, value, { width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
    });
  }, [value, size]);
  return <canvas ref={ref} style={{ borderRadius: 6 }} />;
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ onEnter }: { onEnter: (view: 'login' | 'signup') => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-dark)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid var(--hairline-dark)',
        position: 'sticky', top: 0, background: 'rgba(10,11,13,0.85)',
        backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--primary)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ticket size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-dark)' }}>TicketStar</span>
          <span style={{
            fontSize: 10, fontWeight: 700, background: 'rgba(0,82,255,0.12)',
            color: 'var(--primary)', border: '1px solid rgba(0,82,255,0.3)',
            padding: '2px 8px', borderRadius: 99, letterSpacing: '0.5px'
          }}>STELLAR</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/signin" className="btn btn-outline btn-sm">Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 48px 64px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          background: 'rgba(0,82,255,0.08)', border: '1px solid rgba(0,82,255,0.2)',
          borderRadius: 99, marginBottom: 28,
        }}>
          <Sparkles size={13} color="var(--primary)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6ba3ff', letterSpacing: '0.4px' }}>
            Powered by Stellar Blockchain + Soroban Smart Contracts
          </span>
        </div>

        <h1 style={{
          fontSize: 64, fontWeight: 800, lineHeight: 1.1,
          color: 'var(--on-dark)', marginBottom: 24, letterSpacing: '-1px',
        }}>
          The Future of<br />
          <span style={{ background: 'linear-gradient(135deg, #0052ff, #6ba3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Event Ticketing
          </span>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--muted-soft)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px' }}>
          Create events, sell tickets with on-chain XLM payments, and manage attendees with QR code check-in — all in one powerful platform.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onEnter('signup')}>
            Start Selling Tickets <ArrowRight size={18} />
          </button>
          <Link href="/signin" className="btn btn-outline btn-lg">
            Sign In with Wallet
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
          {[
            { icon: <Shield size={16} />, text: 'XLM Payments On-Chain' },
            { icon: <Zap size={16} />, text: 'x402 Protocol Support' },
            { icon: <QrCode size={16} />, text: 'QR Code Check-In' },
            { icon: <Globe size={16} />, text: 'Soroban Smart Contracts' },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted-soft)' }}>
              <span style={{ color: 'var(--primary)' }}>{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>
      </section>

      {/* Stats banner */}
      <section style={{ background: 'var(--surface-dark-elevated)', borderTop: '1px solid var(--hairline-dark)', borderBottom: '1px solid var(--hairline-dark)', padding: '40px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {[
            { v: '10,000+', l: 'Tickets Sold' },
            { v: '500+', l: 'Events Created' },
            { v: '85,000 XLM', l: 'Volume Processed' },
            { v: '99.9%', l: 'Uptime' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-dark)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>{s.v}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>EVERYTHING YOU NEED</div>
          <h2 style={{ fontSize: 38, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16 }}>Built for Modern Events</h2>
          <p style={{ fontSize: 15, color: 'var(--muted-soft)', maxWidth: 480, margin: '0 auto' }}>
            From indie concerts to enterprise conferences — TicketStar scales with your event.
          </p>
        </div>

        <div className="feature-grid">
          {[
            { icon: <Wallet size={20} />, t: 'On-Chain XLM Payments', d: 'Accept ticket payments via Stellar XLM with automatic memo verification. Every transaction is immutable and transparent.' },
            { icon: <QrCode size={20} />, t: 'QR Check-In System', d: 'Generate unique QR codes per ticket. Scan at the door with your phone — no expensive hardware needed.' },
            { icon: <BarChart2 size={20} />, t: 'Real-Time Analytics', d: 'Track ticket sales, check-in rates, and revenue in real time with x402-protected telemetry endpoints.' },
            { icon: <Shield size={20} />, t: 'Soroban Smart Contracts', d: 'Events and tickets are anchored on Stellar testnet via Soroban contracts — trustless and verifiable.' },
            { icon: <Layers size={20} />, t: 'Corsair Integrations', d: 'Trigger webhooks to Gmail, Slack, Discord, and Stripe on ticket purchase and check-in events.' },
            { icon: <Star size={20} />, t: 'Pro Organizer Tools', d: 'Unlock bulk attendee export, telemetry dashboards, and custom branding with a Pro subscription.' },
          ].map(f => (
            <div key={f.t} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.t}</div>
              <div className="feature-desc">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 48px', background: 'var(--surface-dark-elevated)', borderTop: '1px solid var(--hairline-dark)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 12 }}>Simple Pricing</h2>
            <p style={{ fontSize: 15, color: 'var(--muted-soft)' }}>Start free, scale as you grow.</p>
          </div>
          <div className="pricing-grid">
            {/* Free */}
            <div className="pricing-card">
              <div className="pricing-plan">Attendee</div>
              <div className="pricing-price">0</div>
              <div className="pricing-period">XLM / forever</div>
              <ul className="pricing-features">
                {['Browse all events', 'Purchase tickets with XLM', 'QR code tickets', 'Ticket history'].map(f => (
                  <li key={f}><CheckCircle size={14} />{f}</li>
                ))}
              </ul>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onEnter('signup')}>Get Started Free</button>
            </div>

            {/* Pro */}
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-plan">Organizer Pro</div>
              <div className="pricing-price">10</div>
              <div className="pricing-period">XLM / month</div>
              <ul className="pricing-features">
                {['Create unlimited events', 'Real-time analytics (x402)', 'QR scan check-in dashboard', 'Corsair webhook integrations', 'Attendee list export', 'Priority support'].map(f => (
                  <li key={f}><CheckCircle size={14} />{f}</li>
                ))}
              </ul>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', width: '100%', border: '1px solid rgba(255,255,255,0.2)' }}
                onClick={() => onEnter('signup')}>
                Start as Organizer
              </button>
            </div>

            {/* Enterprise */}
            <div className="pricing-card">
              <div className="pricing-plan">Enterprise</div>
              <div className="pricing-price">—</div>
              <div className="pricing-period">Custom contract</div>
              <ul className="pricing-features">
                {['Everything in Pro', 'Custom Soroban contract deploy', 'Dedicated webhook infra', 'SLA guarantees', 'On-chain settlement'].map(f => (
                  <li key={f}><CheckCircle size={14} />{f}</li>
                ))}
              </ul>
              <button className="btn btn-secondary" style={{ width: '100%' }}>Contact Us</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 48px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 36, textAlign: 'center' }}>Frequently Asked Questions</h2>
        {[
          { q: 'Do I need a Stellar wallet?', a: 'To purchase tickets you need a Stellar testnet wallet. For browsing, no wallet is required.' },
          { q: 'What is x402?', a: 'x402 is an HTTP payment protocol. Our telemetry endpoints require micro-payments (simulated XLM) to access premium analytics.' },
          { q: 'Are tickets refundable?', a: 'Organizers can issue refunds from their dashboard. Refunds are processed via Stellar transactions.' },
          { q: 'What is Soroban?', a: 'Soroban is Stellar\'s smart contract platform. Events and tickets are anchored on-chain for trustless verification.' },
        ].map(f => (
          <div key={f.q} style={{ borderBottom: '1px solid var(--hairline-dark)', padding: '20px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 8 }}>{f.q}</div>
            <div style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.7 }}>{f.a}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center', borderTop: '1px solid var(--hairline-dark)' }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16 }}>
          Ready to launch your event?
        </h2>
        <p style={{ fontSize: 16, color: 'var(--muted-soft)', marginBottom: 36 }}>Join hundreds of organizers selling tickets on Stellar.</p>
        <button className="btn btn-primary btn-lg" onClick={() => onEnter('signup')}>
          Create Free Account <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--hairline-dark)', padding: '32px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ticket size={16} color="var(--primary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)' }}>TicketStar</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Powered by Stellar · Soroban · x402 · Corsair</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>© 2025 TicketStar. All rights reserved.</div>
      </footer>
    </div>
  );
}

// ─── Auth Flow ────────────────────────────────────────────────────────────────
function AuthPage({ mode, onSwitch, onSuccess }: {
  mode: 'login' | 'signup'; onSwitch: () => void; onSuccess: () => void;
}) {
  const { login, signup } = useAuth();
  const { success, error } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { error('Missing fields', 'Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        success('Welcome back!', 'You are now signed in.');
      } else {
        if (!form.name) { error('Name required'); setLoading(false); return; }
        await signup(form.name, form.email, form.password, form.role);
        success('Account created!', 'Welcome to TicketStar 🎟️');
      }
      onSuccess();
    } catch (e: any) {
      error('Authentication failed', e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demos = [
    { label: 'Demo Organizer', email: 'organizer@demo.com', password: 'demo123', role: 'organizer' },
    { label: 'Demo Attendee', email: 'attendee@demo.com', password: 'demo123', role: 'attendee' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-dark)' }}>
      {/* Left panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #0a0b0d 0%, #0d1829 60%, #0a1a3a 100%)',
        padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        borderRight: '1px solid var(--hairline-dark)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>TicketStar</span>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16, lineHeight: 1.3 }}>
          The blockchain-powered<br />event ticketing platform
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.8, marginBottom: 40 }}>
          Create events, sell tickets with Stellar XLM payments, and manage attendees with QR code check-in.
        </p>
        <div className="milestone-list">
          {[
            { t: 'On-chain XLM payments via Stellar', d: true },
            { t: 'Soroban smart contract integration', d: true },
            { t: 'x402 premium analytics', d: true },
            { t: 'Corsair webhook automation', d: true },
          ].map(m => (
            <div key={m.t} className={`milestone-item${m.d ? ' done' : ''}`}>
              <CheckCircle size={14} />
              <span style={{ fontSize: 13 }}>{m.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 480, padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
        <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}
          onClick={() => window.history.back()}>
          ← Back to Home
        </button>

        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={onSwitch} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Demo shortcuts */}
        <div style={{ display: 'flex', gap: 8 }}>
          {demos.map(d => (
            <button key={d.label} className="btn btn-secondary btn-sm" style={{ flex: 1 }}
              onClick={() => setForm(f => ({ ...f, email: d.email, password: d.password, name: d.label, role: d.role }))}>
              <Zap size={12} /> {d.label}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Alex Johnson" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <Eye size={16} />
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">I am an…</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['attendee', 'organizer'] as const).map(r => (
                  <button key={r} type="button"
                    style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--r-md)', border: '1px solid',
                      borderColor: form.role === r ? 'var(--primary)' : 'var(--hairline-dark)',
                      background: form.role === r ? 'rgba(0,82,255,0.1)' : 'var(--surface-dark)',
                      color: form.role === r ? 'var(--primary)' : 'var(--muted)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => setForm(f => ({ ...f, role: r }))}>
                    {r === 'attendee' ? '🎫 Attendee' : '🎤 Organizer'}
                  </button>
                ))}
              </div>
              {form.role === 'organizer' && (
                <div className="info-box" style={{ marginTop: 8 }}>
                  Organizers need a Pro subscription to create events. You can upgrade after signup.
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 48, fontSize: 15, marginTop: 4 }}>
            {loading ? <span className="spinner spinner-sm" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function OnboardingPage({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const steps = [
    {
      icon: <Ticket size={32} color="var(--primary)" />,
      title: `Welcome, ${user?.name}! 🎉`,
      desc: 'TicketStar is your all-in-one event ticketing platform powered by the Stellar blockchain.',
      sub: null,
    },
    {
      icon: <Wallet size={32} color="var(--primary)" />,
      title: 'Connect Stellar Wallet',
      desc: 'Ticket purchases use XLM on the Stellar testnet. Paste your wallet address for payment verification.',
      sub: (
        <div className="form-group">
          <label className="form-label">Stellar Wallet Address (Optional for now)</label>
          <input className="form-input mono" placeholder="GABCDE..." />
          <span className="form-hint">Use testnet address. You can add this later in Settings.</span>
        </div>
      ),
    },
    {
      icon: user?.role === 'organizer' ? <Calendar size={32} color="var(--primary)" /> : <QrCode size={32} color="var(--primary)" />,
      title: user?.role === 'organizer' ? "You're an Organizer" : "You're an Attendee",
      desc: user?.role === 'organizer'
        ? 'Upgrade to Pro to create events and sell tickets. Your dashboard includes analytics, attendee management, and Corsair integrations.'
        : 'Browse upcoming events, purchase tickets with XLM, and manage your QR code tickets from one place.',
      sub: null,
    },
    {
      icon: <Sparkles size={32} color="var(--primary)" />,
      title: "You're all set!",
      desc: 'Your dashboard is ready. Explore events, create your first listing, or check your tickets.',
      sub: null,
    },
  ];

  const current = steps[step];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-dark)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 99, transition: 'all 0.3s',
              flex: 1, maxWidth: 60,
              background: i <= step ? 'var(--primary)' : 'var(--surface-dark-card)',
            }} />
          ))}
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(0,82,255,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            {current.icon}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 12 }}>{current.title}</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.7, marginBottom: 24 }}>{current.desc}</p>
          {current.sub && <div style={{ textAlign: 'left', marginBottom: 24 }}>{current.sub}</div>}

          <div style={{ display: 'flex', gap: 12 }}>
            {step > 0 && (
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>Back</button>
            )}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
              if (step < steps.length - 1) setStep(s => s + 1);
              else onDone();
            }}>
              {step === steps.length - 1 ? 'Enter Dashboard' : 'Continue'} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <button onClick={onDone} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Pro Required Banner ──────────────────────────────────────────────────────
function ProRequiredBanner({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="card animate-in" style={{ textAlign: 'center', padding: '64px 32px' }}>
      <div style={{ width: 64, height: 64, background: 'rgba(0,82,255,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Star size={28} color="var(--primary)" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 8 }}>Pro Feature</h2>
      <p style={{ fontSize: 14, color: 'var(--muted-soft)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.7 }}>
        This feature requires an Organizer Pro subscription. Upgrade to unlock QR scanning, analytics, and Corsair integrations.
      </p>
      <button className="btn btn-primary" onClick={onUpgrade}>
        <Star size={14} /> Upgrade to Pro
      </button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'events' | 'tickets' | 'scanner' | 'analytics' | 'integrations' | 'pricing' | 'settings' | 'admin';

function Dashboard() {
  const { user, token, logout, upgradeToProSimulated } = useAuth();
  const { success, error, warning } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [myTickets, setMyTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  // Use a ref for the error function so it never enters useCallback deps (prevents infinite loop)
  const errorRef = useRef(error);
  errorRef.current = error;
  const hasShownErrorRef = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    hasShownErrorRef.current = false;
    try {
      const evsRes: any = await api.getEvents(token || undefined);
      const evsList = Array.isArray(evsRes) ? evsRes : (evsRes?.events || []);
      setEvents(evsList);

      if (token) {
        const tixRes: any = await api.getMyTickets(token);
        setMyTickets(Array.isArray(tixRes) ? tixRes : []);
      }
    } catch {
      if (!hasShownErrorRef.current) {
        hasShownErrorRef.current = true;
        errorRef.current('Failed to load data', 'Check your backend connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]); // ← error intentionally omitted to prevent infinite re-render loop

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeToProSimulated();
      success('Subscription updated!', user?.subscription === 'pro' ? 'Downgraded to Free.' : 'You are now on Pro. All features unlocked!');
    } catch {
      error('Upgrade failed', 'Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode; orgOnly?: boolean; proOnly?: boolean; adminOnly?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: <HomeIcon size={17} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={17} /> },
    { id: 'tickets', label: 'My Tickets', icon: <Ticket size={17} /> },
    { id: 'scanner', label: 'QR Scanner', icon: <ScanLine size={17} />, orgOnly: true, proOnly: true },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={17} />, orgOnly: true, proOnly: true },
    { id: 'integrations', label: 'Integrations', icon: <Link2 size={17} />, orgOnly: true, proOnly: true },
    { id: 'pricing', label: 'Upgrade', icon: <Star size={17} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
    { id: 'admin', label: 'Admin', icon: <Shield size={17} />, adminOnly: true },
  ];

  const visible = navItems.filter(n => {
    if (n.adminOnly) return user?.role === 'admin';
    if (n.orgOnly) return user?.role === 'organizer' || user?.role === 'admin';
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-dark)' }}>
      {/* Mobile sidebar overlay backdrop */}
      {mobileSidebarOpen && <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 68,
        background: 'var(--surface-dark-elevated)',
        borderRight: '1px solid var(--hairline-dark)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50,
        overflow: 'hidden',
        ...(mobileSidebarOpen ? { width: 280 } : {}),
      }}
        className={mobileSidebarOpen ? '' : 'sidebar-desktop'}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--hairline-dark)', display: 'flex', alignItems: 'center', gap: 10, minWidth: 240 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ticket size={20} color="#fff" />
          </div>
          {sidebarOpen && <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', whiteSpace: 'nowrap' }}>TicketStar</span>}
          <button onClick={() => { setSidebarOpen(v => !v); setMobileSidebarOpen(false); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <Menu size={16} />
          </button>
        </div>

        {/* User pill */}
        {sidebarOpen && (
          <div style={{ padding: '16px', borderBottom: '1px solid var(--hairline-dark)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-dark)', borderRadius: 'var(--r-md)', border: '1px solid var(--hairline-dark)' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0052ff,#6ba3ff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'capitalize' }}>{user?.role} · <span style={{ color: user?.subscription === 'pro' ? 'var(--primary)' : 'var(--muted)' }}>{user?.subscription}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {visible.map(n => (
            <button key={n.id}
              onClick={() => {
                if (n.proOnly && user?.subscription !== 'pro') {
                  warning('Pro Required', 'Upgrade to Pro to access this feature.');
                  setTab('pricing');
                  return;
                }
                setTab(n.id);
                setMobileSidebarOpen(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 'var(--r-md)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                fontSize: 13, whiteSpace: 'nowrap', minWidth: 0,
                background: tab === n.id ? 'rgba(0,82,255,0.12)' : 'transparent',
                color: tab === n.id ? 'var(--primary)' : 'var(--muted-soft)',
                transition: 'all 0.15s',
                marginBottom: 2,
              }}>
              <span style={{ flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && n.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        {sidebarOpen && (
          <div style={{ padding: '12px', borderTop: '1px solid var(--hairline-dark)' }}>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }} onClick={() => { logout(); setMobileSidebarOpen(false); }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="main-content" style={{
        flex: 1,
        marginLeft: sidebarOpen ? 240 : 68,
        transition: 'margin-left 0.2s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Topbar */}
        <header style={{
          height: 64, borderBottom: '1px solid var(--hairline-dark)',
          padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(10,11,13,0.8)', backdropFilter: 'blur(8px)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="sidebar-mobile-toggle" onClick={() => setMobileSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--on-dark)', cursor: 'pointer', padding: 0 }}>
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>
                {navItems.find(n => n.id === tab)?.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {user?.subscription === 'free' && user?.role === 'organizer' && (
              <button className="btn btn-primary btn-sm" onClick={() => setTab('pricing')}>
                <Star size={12} /> Upgrade to Pro
              </button>
            )}
            <div className={`badge ${user?.subscription === 'pro' ? 'badge-pro' : 'badge-free'}`}>
              {user?.subscription === 'pro' ? <><Star size={10} /> Pro</> : 'Free'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '32px', maxWidth: 1200, width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {tab === 'overview' && <OverviewTab events={events} myTickets={myTickets} user={user} onTabChange={setTab} onRefresh={loadData} token={token!} />}
              {tab === 'events' && <EventsTab events={events} user={user} token={token!} onRefresh={loadData} onTabChange={setTab} />}
              {tab === 'tickets' && <TicketsTab myTickets={myTickets} token={token!} onRefresh={loadData} />}
              {tab === 'scanner' && (user?.subscription === 'pro' ? <ScannerTab token={token!} events={events} /> : <ProRequiredBanner onUpgrade={() => setTab('pricing')} />)}
              {tab === 'analytics' && (user?.subscription === 'pro' ? <AnalyticsTab token={token!} user={user} events={events} /> : <ProRequiredBanner onUpgrade={() => setTab('pricing')} />)}
              {tab === 'integrations' && (user?.subscription === 'pro' ? <IntegrationsTab token={token!} user={user} /> : <ProRequiredBanner onUpgrade={() => setTab('pricing')} />)}
              {tab === 'pricing' && <PricingTab user={user} onUpgrade={handleUpgrade} upgrading={upgrading} />}
              {tab === 'settings' && <SettingsTab user={user} onUpgrade={handleUpgrade} upgrading={upgrading} onLogout={logout} />}
              {tab === 'admin' && <AdminTab token={token!} user={user} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ events, myTickets, user, onTabChange, onRefresh, token }: {
  events: Event[]; myTickets: TicketType[]; user: any;
  onTabChange: (t: Tab) => void; onRefresh: () => void; token: string;
}) {
  const totalRevenue = events.filter(e => e.organizerId === user?.id).reduce((s, e) => s + (e.ticketsSold * e.price), 0);
  const myEvents = events.filter(e => e.organizerId === user?.id);
  const activeEvents = events.filter(e => e.status === 'selling');
  const checkedIn = myTickets.filter(t => t.status === 'checked-in').length;

  return (
    <div className="animate-in">
      {/* Hero */}
      <div className="hero-banner">
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <div className="hero-eyebrow">
          <Sparkles size={11} /> {user?.role === 'organizer' ? 'Organizer Dashboard' : 'Attendee Dashboard'}
        </div>
        <h1 className="hero-title">Good day, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p className="hero-desc">
          {user?.role === 'organizer'
            ? 'Manage your events, track ticket sales, and check in attendees — all from here.'
            : 'Discover events, purchase tickets with XLM, and access your QR codes.'}
        </p>
        <div className="hero-actions">
          {user?.role === 'organizer' ? (
            <>
              <button className="btn btn-primary" onClick={() => onTabChange('events')}><Plus size={16} /> Create Event</button>
              <button className="btn btn-secondary" onClick={() => onTabChange('analytics')}><BarChart2 size={16} /> View Analytics</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => onTabChange('events')}><Search size={16} /> Browse Events</button>
              <button className="btn btn-secondary" onClick={() => onTabChange('tickets')}><Ticket size={16} /> My Tickets</button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {user?.role === 'organizer' ? (
          <>
            <StatCard label="Total Revenue" value={`${totalRevenue.toFixed(0)} XLM`} sub="All time" color="var(--primary)" icon={<Wallet size={16} />} />
            <StatCard label="Events Created" value={myEvents.length.toString()} sub={`${myEvents.filter(e => e.status === 'selling').length} active`} icon={<Calendar size={16} />} />
            <StatCard label="Tickets Sold" value={myEvents.reduce((s, e) => s + e.ticketsSold, 0).toString()} sub="Across all events" color="var(--up)" icon={<Ticket size={16} />} />
            <StatCard label="Check-in Rate" value={myTickets.length ? `${Math.round(checkedIn / myTickets.length * 100)}%` : '—'} sub={`${checkedIn} checked in`} icon={<QrCode size={16} />} />
          </>
        ) : (
          <>
            <StatCard label="Available Events" value={activeEvents.length.toString()} sub="Right now" color="var(--primary)" icon={<Calendar size={16} />} />
            <StatCard label="My Tickets" value={myTickets.length.toString()} sub={`${checkedIn} checked in`} icon={<Ticket size={16} />} />
            <StatCard label="XLM Spent" value={`${myTickets.reduce((s, t) => s + t.purchasePrice, 0).toFixed(1)}`} sub="Total purchases" color="var(--warning)" icon={<Wallet size={16} />} />
            <StatCard label="Events Attended" value={new Set(myTickets.filter(t => t.status === 'checked-in').map(t => t.eventId)).size.toString()} sub="Unique events" color="var(--up)" icon={<Star size={16} />} />
          </>
        )}
      </div>

      {/* Upcoming Events */}
      <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'organizer' ? '1fr 1fr' : '1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)' }}>
              {user?.role === 'organizer' ? 'Your Events' : 'Upcoming Events'}
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onTabChange('events')}>View All</button>
          </div>
          {(user?.role === 'organizer' ? myEvents : events).slice(0, 4).length === 0 ? (
            <EmptyState icon={<Calendar size={24} />} title="No events yet" desc={user?.role === 'organizer' ? 'Create your first event to start selling tickets.' : 'No events available right now.'} cta={user?.role === 'organizer' ? <button className="btn btn-primary btn-sm" onClick={() => onTabChange('events')}><Plus size={14} /> Create Event</button> : undefined} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(user?.role === 'organizer' ? myEvents : events).slice(0, 4).map(ev => (
                <div key={ev.id} className="card-sm card-hover" style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(0,82,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={18} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 8 }}>
                      <span>{fmtDate(ev.date)}</span>
                      <span>·</span>
                      <span>{fmtXLM(ev.price)}</span>
                    </div>
                  </div>
                  <div className={`status-badge status-${ev.status}`}>{ev.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role === 'organizer' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)' }}>Recent Tickets</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => onTabChange('tickets')}>View All</button>
            </div>
            {myTickets.length === 0 ? (
              <EmptyState icon={<Ticket size={24} />} title="No tickets yet" desc="Tickets will appear here when attendees purchase." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myTickets.slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--hairline-dark)' }}>
                    <div style={{ width: 32, height: 32, background: 'var(--surface-dark-card)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <QrCode size={14} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-dark)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t.attendeeName}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.eventTitle}</div>
                    </div>
                    <div className={`status-badge status-${t.status}`}>{t.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div className="stat-label">{label}</div>
        {icon && <div style={{ color: color || 'var(--muted)', opacity: 0.7 }}>{icon}</div>}
      </div>
      <div className="stat-value" style={{ color: color || 'var(--on-dark)' }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function EmptyState({ icon, title, desc, cta }: { icon: React.ReactNode; title: string; desc: string; cta?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-desc">{desc}</div>
      {cta}
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────
function EventsTab({ events, user, token, onRefresh, onTabChange }: { events: Event[]; user: any; token: string; onRefresh: () => void; onTabChange?: (t: Tab) => void }) {
  const { success, error, warning } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [purchasing, setPurchasing] = useState<Event | null>(null);
  const [viewing, setViewing] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState<Event | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [qty, setQty] = useState(1);
  const [editing, setEditing] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({
    title: '', description: '', date: '', venue: '', category: 'Concert', price: '5', ticketCount: '100',
  });
  const [form, setForm] = useState({
    title: '', description: '', date: '', venue: '', category: 'Concert', price: '5', ticketCount: '100',
  });
  const [page, setPage] = useState(1);
  const perPage = 12;
  useEffect(() => { setPage(1); }, [search, filter]);

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || e.status === filter || (filter === 'mine' && e.organizerId === user?.id);
    return matchSearch && matchFilter;
  });

  const handleCreate = async () => {
    if (!form.title || !form.date || !form.venue) { error('Missing fields', 'Title, date, and venue are required.'); return; }
    if (user?.subscription !== 'pro') { warning('Pro Required', 'Upgrade to Pro to create events.'); return; }
    try {
      await api.createEvent({
        ...form,
        date: new Date(form.date).toISOString(),
        price: parseFloat(form.price),
        ticketCount: parseInt(form.ticketCount),
      }, token);
      success('Event created!', 'Your event is now live.');
      setCreating(false);
      setForm({ title: '', description: '', date: '', venue: '', category: 'Concert', price: '5', ticketCount: '100' });
      onRefresh();
    } catch (e: any) {
      error('Creation failed', e?.message);
    }
  };

  const handleBuy = async () => {
    if (!purchasing) return;
    setBuyLoading(true);
    try {
      const tickets = await api.purchaseTicket({ eventId: purchasing.id, stellarTxHash: txHash || undefined, quantity: qty }, token);
      success(`${tickets.length} ticket(s) purchased!`, 'Check "My Tickets" for your QR codes.');
      setPurchasing(null);
      setTxHash('');
      setQty(1);
      onRefresh();
    } catch (e: any) {
      error('Purchase failed', e?.message);
    } finally {
      setBuyLoading(false);
    }
  };

  const handleDelete = async (ev: Event) => {
    try {
      await api.deleteEvent(ev.id, token);
      success('Event deleted.');
      onRefresh();
    } catch (e: any) {
      error('Delete failed', e?.message);
    }
  };

  const handleEdit = async () => {
    if (!editing) return;
    if (!editForm.title || !editForm.date || !editForm.venue) { error('Missing fields', 'Title, date, and venue are required.'); return; }
    try {
      await api.updateEvent(editing.id, {
        ...editForm,
        date: new Date(editForm.date).toISOString(),
        price: parseFloat(editForm.price),
        ticketCount: parseInt(editForm.ticketCount),
      }, token);
      success('Event updated!', 'Your changes have been saved.');
      setEditing(null);
      onRefresh();
    } catch (e: any) {
      error('Update failed', e?.message);
    }
  };

  const categories = ['Concert', 'Conference', 'Workshop', 'Festival', 'Sports', 'Exhibition', 'Meetup'];

  return (
    <div className="animate-in">
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Events</option>
          <option value="selling">On Sale</option>
          <option value="closed">Closed</option>
          {user?.role === 'organizer' && <option value="mine">My Events</option>}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh}><RefreshCw size={14} /></button>
        {user?.role === 'organizer' && (
          <button className="btn btn-primary" onClick={() => {
            if (user?.subscription !== 'pro') { warning('Pro Required', 'Upgrade to Pro to create events.'); onTabChange?.('pricing'); return; }
            setCreating(true);
          }}>
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={28} />} title="No events found" desc="Try adjusting your search or create a new event." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.slice((page - 1) * perPage, page * perPage).map(ev => (
              <div key={ev.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                  height: 6,
                  background: ev.status === 'selling' ? 'linear-gradient(90deg, var(--primary), #6ba3ff)' :
                    ev.status === 'settled' ? 'linear-gradient(90deg, var(--warning), #f4b000)' : 'var(--surface-dark-card)',
                }} />
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div className={`status-badge status-${ev.status}`}>{ev.status}</div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface-dark)', padding: '2px 8px', borderRadius: 99 }}>{ev.category}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 8, lineHeight: 1.3 }}>{ev.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted-soft)', marginBottom: 16, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', alignItems: 'center' }}>
                      <Clock size={12} /> {fmtDate(ev.date)} at {fmtTime(ev.date)}
                    </div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', alignItems: 'center' }}>
                      <MapPin size={12} /> {ev.venue}
                    </div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', alignItems: 'center' }}>
                      <Users size={12} /> {ev.ticketsSold} / {ev.ticketCount} tickets sold
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface-dark)', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${Math.min(100, (ev.ticketsSold / ev.ticketCount) * 100)}%`,
                      background: 'var(--primary)', transition: 'width 0.5s',
                    }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-dark)', fontFamily: "'JetBrains Mono',monospace" }}>
                      {ev.price} XLM
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setViewing(ev)}><Eye size={14} /></button>
                      {user?.role === 'attendee' && ev.status === 'selling' && ev.ticketsSold < ev.ticketCount && (
                        <button className="btn btn-primary btn-sm" onClick={() => setPurchasing(ev)}>Buy Ticket</button>
                      )}
                      {ev.organizerId === user?.id && (
                        <>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditForm({ title: ev.title, description: ev.description, date: ev.date, venue: ev.venue, category: ev.category, price: ev.price.toString(), ticketCount: ev.ticketCount.toString() }); setEditing(ev); }}><Edit size={13} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleting(ev)}><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PaginationBar current={page} total={Math.ceil(filtered.length / perPage)} onChange={setPage} />
        </>
      )}

      {/* Create Event Modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Create New Event" subtitle="Your event will go live immediately."
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}><Plus size={14} /> Create Event</button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group"><label className="form-label">Event Title *</label><input className="form-input" placeholder="Annual Music Festival 2025" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Describe your event…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Date & Time *</label><input className="form-input" type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Venue *</label><input className="form-input" placeholder="Madison Square Garden, New York" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Ticket Price (XLM)</label><input className="form-input mono" type="number" min="0" step="0.5" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Total Tickets</label><input className="form-input mono" type="number" min="1" value={form.ticketCount} onChange={e => setForm(f => ({ ...f, ticketCount: e.target.value }))} /></div>
          </div>
          <div className="info-box"><Info size={14} style={{ display: 'inline', marginRight: 6 }} />Event will be anchored to the Stellar testnet via Soroban smart contract.</div>
        </div>
      </Modal>

      {/* View Event Modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title || ''} subtitle={`${fmtDate(viewing?.date || '')} · ${viewing?.venue}`}>
        {viewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.7 }}>{viewing.description || 'No description provided.'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { l: 'Price', v: `${viewing.price} XLM` },
                { l: 'Available', v: `${viewing.ticketCount - viewing.ticketsSold} left` },
                { l: 'Category', v: viewing.category },
                { l: 'Status', v: viewing.status },
              ].map(r => (
                <div key={r.l} style={{ background: 'var(--surface-dark)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{r.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)', fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</div>
                </div>
              ))}
            </div>
            {viewing.stellarContractId && (
              <div style={{ background: 'var(--surface-dark)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Soroban Contract ID</div>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: 'var(--primary)', wordBreak: 'break-all' }}>{viewing.stellarContractId}</div>
              </div>
            )}
            {user?.role === 'attendee' && viewing.status === 'selling' && (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setViewing(null); setPurchasing(viewing); }}>
                Buy Ticket — {viewing.price} XLM
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Purchase Modal */}
      <Modal open={!!purchasing} onClose={() => setPurchasing(null)} title="Purchase Ticket"
        subtitle={`${purchasing?.title} · ${fmtXLM(purchasing?.price || 0)} per ticket`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPurchasing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBuy} disabled={buyLoading}>
              {buyLoading ? <span className="spinner spinner-sm" /> : <><Wallet size={14} /> Pay {fmtXLM((purchasing?.price || 0) * qty)}</>}
            </button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="form-input mono" type="number" min="1" max={purchasing ? purchasing.ticketCount - purchasing.ticketsSold : 1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
          </div>
          <div className="form-group">
            <label className="form-label">Stellar Tx Hash (optional)</label>
            <input className="form-input mono" placeholder="leave blank to simulate payment" value={txHash} onChange={e => setTxHash(e.target.value)} />
            <span className="form-hint">Paste your Stellar testnet transaction hash, or leave blank to simulate.</span>
          </div>
          <div className="info-box">
            Total: <strong>{fmtXLM((purchasing?.price || 0) * qty)}</strong>. QR code tickets will be generated instantly.
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete Event" desc={`This will permanently delete "${deleting?.title}". This cannot be undone.`} danger onConfirm={() => deleting && handleDelete(deleting)} />

      {/* Edit Event Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Event" subtitle="Update your event details."
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEdit}><Edit size={14} /> Save Changes</button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group"><label className="form-label">Event Title *</label><input className="form-input" placeholder="Annual Music Festival 2025" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Describe your event…" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Date & Time *</label><input className="form-input" type="datetime-local" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Venue *</label><input className="form-input" placeholder="Madison Square Garden, New York" value={editForm.venue} onChange={e => setEditForm(f => ({ ...f, venue: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Ticket Price (XLM)</label><input className="form-input mono" type="number" min="0" step="0.5" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Total Tickets</label><input className="form-input mono" type="number" min="1" value={editForm.ticketCount} onChange={e => setEditForm(f => ({ ...f, ticketCount: e.target.value }))} /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Tickets Tab ──────────────────────────────────────────────────────────────
function TicketsTab({ myTickets, token, onRefresh }: { myTickets: TicketType[]; token: string; onRefresh: () => void }) {
  const { success, error } = useToast();
  const [selected, setSelected] = useState<TicketType | null>(null);
  const [refunding, setRefunding] = useState<TicketType | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 12;
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const filtered = myTickets.filter(t => {
    const match = t.eventTitle.toLowerCase().includes(search.toLowerCase()) || t.qrCode.toLowerCase().includes(search.toLowerCase());
    const status = filterStatus === 'all' || t.status === filterStatus;
    return match && status;
  });

  const handleRefund = async (ticket: TicketType) => {
    try {
      await api.refundTicket(ticket.id, token);
      success('Refund issued', 'Ticket has been refunded.');
      onRefresh();
    } catch (e: any) {
      error('Refund failed', e?.message);
    }
  };

  const copyQR = (qr: string) => {
    navigator.clipboard.writeText(qr);
    success('Copied!', 'QR code copied to clipboard.');
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="issued">Issued</option>
          <option value="checked-in">Checked In</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh}><RefreshCw size={14} /></button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Ticket size={28} />} title="No tickets found" desc="Purchase tickets from the Events tab to see them here." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.slice((page - 1) * perPage, page * perPage).map(t => (
              <div key={t.id} className="qr-ticket-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 2 }}>{t.eventTitle}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Ticket #{t.id}</div>
                  </div>
                  <div className={`status-badge status-${t.status}`}>{t.status}</div>
                </div>

                <div className="qr-code-display">
                  <QRCanvas value={t.qrCode} size={120} />
                </div>

                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)', marginBottom: 12, wordBreak: 'break-all', background: 'var(--surface-dark)', padding: '6px 8px', borderRadius: 6 }}>
                  {t.qrCode}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-soft)' }}>
                    <span>Purchased</span><span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{fmtDate(t.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-soft)' }}>
                    <span>Price</span><span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{t.purchasePrice} XLM</span>
                  </div>
                  {t.stellarTxHash && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-soft)' }}>
                      <span>Stellar Tx</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--primary)' }}>{truncate(t.stellarTxHash, 10)}</span>
                    </div>
                  )}
                  {t.checkedInAt && (
                    <div className="success-box" style={{ marginTop: 4, padding: '8px 10px' }}>
                      <CheckCircle size={13} /> Checked in at {fmtTime(t.checkedInAt)}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => copyQR(t.qrCode)}>
                    <Copy size={12} /> Copy QR
                  </button>
                  {t.status === 'issued' && (
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => setRefunding(t)}>
                      <RefreshCw size={12} /> Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <PaginationBar current={page} total={Math.ceil(filtered.length / perPage)} onChange={setPage} />
        </>
      )}

      <ConfirmDialog open={!!refunding} onClose={() => setRefunding(null)} title="Request Refund" desc={`Refund ticket for "${refunding?.eventTitle}"? This cannot be undone.`} danger onConfirm={() => refunding && handleRefund(refunding)} />
    </div>
  );
}

// ─── Scanner Tab ──────────────────────────────────────────────────────────────
function ScannerTab({ token, events }: { token: string; events: Event[] }) {
  const { success, error, warning } = useToast();
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ ticket: TicketType; message: string } | null>(null);
  const [attendees, setAttendees] = useState<TicketType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | ''>('');
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const handleScan = async () => {
    if (!qrInput.trim()) { warning('No QR Code', 'Enter a QR code to scan.'); return; }
    setScanning(true);
    setResult(null);
    try {
      const res = await api.scanTicket(qrInput.trim(), token);
      setResult(res);
      if (res.ticket.status === 'checked-in') success('Checked in!', res.message);
      else warning('Already scanned', res.message);
      setQrInput('');
    } catch (e: any) {
      error('Scan failed', e?.message);
    } finally {
      setScanning(false);
    }
  };

  const loadAttendees = async () => {
    if (!selectedEvent) return;
    setLoadingAttendees(true);
    try {
      const list = await api.getEventAttendees(Number(selectedEvent), token);
      setAttendees(list);
    } catch (e: any) {
      error('Failed to load attendees');
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => { if (selectedEvent) loadAttendees(); }, [selectedEvent]);

  return (
    <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      {/* Scanner Panel */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 4 }}>QR Code Scanner</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Enter or paste a ticket QR code to check in an attendee.</p>

        {/* Simulated scanner frame */}
        <div className="scanner-frame" style={{ marginBottom: 24 }}>
          <div className="scanner-grid" />
          <div className="scanner-line" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
            {result ? (
              result.ticket.status === 'checked-in' ? (
                <CheckCircle size={48} color="var(--up)" />
              ) : (
                <AlertTriangle size={48} color="var(--warning)" />
              )
            ) : (
              <QrCode size={48} color="rgba(0,82,255,0.4)" />
            )}
          </div>
        </div>

        {/* Scan input */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input className="form-input mono" style={{ flex: 1 }} placeholder="TKT-123456-ABCDEF" value={qrInput}
            onChange={e => setQrInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()} />
          <button className="btn btn-primary" onClick={handleScan} disabled={scanning}>
            {scanning ? <span className="spinner spinner-sm" /> : <ScanLine size={16} />}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={result.ticket.status === 'checked-in' ? 'success-box' : 'warn-box'}>
            {result.ticket.status === 'checked-in' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{result.message}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                {result.ticket.attendeeName} · {result.ticket.eventTitle}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendees Panel */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>Attendee List</h3>
          <button className="btn btn-secondary btn-sm" onClick={loadAttendees} disabled={!selectedEvent || loadingAttendees}>
            <RefreshCw size={13} />
          </button>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Select Event</label>
          <select className="form-select" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Choose an event…</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        {loadingAttendees ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
        ) : attendees.length === 0 ? (
          <EmptyState icon={<Users size={24} />} title="No attendees" desc="Select an event to view its attendee list." />
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              {attendees.filter(a => a.status === 'checked-in').length} / {attendees.length} checked in
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
              {attendees.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: 'var(--surface-dark)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ width: 32, height: 32, background: a.status === 'checked-in' ? 'rgba(5,177,105,0.12)' : 'var(--surface-dark-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {a.status === 'checked-in' ? <CheckCircle size={14} color="var(--up)" /> : <QrCode size={14} color="var(--muted)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.attendeeName}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.attendeeEmail}</div>
                  </div>
                  <div className={`status-badge status-${a.status}`}>{a.status === 'checked-in' ? '✓ In' : 'Issued'}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ token, user, events }: { token: string; user: any; events: Event[] }) {
  const { success, error, info } = useToast();
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loadingTelem, setLoadingTelem] = useState(false);
  const [paymentSig, setPaymentSig] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const myEvents = events.filter(e => e.organizerId === user?.id);
  const totalRevenue = myEvents.reduce((s, e) => s + e.ticketsSold * e.price, 0);
  const totalSold = myEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const totalCapacity = myEvents.reduce((s, e) => s + e.ticketCount, 0);

  const fetchTelemetry = async (sig?: string) => {
    setLoadingTelem(true);
    try {
      const data = await api.getTelemetry(token, sig || paymentSig || undefined);
      setTelemetry(data);
      success('Telemetry loaded', `${data.length} log entries fetched.`);
    } catch (e: any) {
      if (e?.status === 402) {
        info('Payment Required', 'This endpoint is x402-protected. Provide a payment signature.');
        setShowPaymentModal(true);
      } else {
        error('Failed to load telemetry', e?.message);
      }
    } finally {
      setLoadingTelem(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Total Revenue" value={`${totalRevenue.toFixed(0)} XLM`} color="var(--primary)" icon={<TrendingUp size={16} />} />
        <StatCard label="Tickets Sold" value={totalSold.toString()} icon={<Ticket size={16} />} />
        <StatCard label="Avg Fill Rate" value={totalCapacity ? `${Math.round(totalSold / totalCapacity * 100)}%` : '—'} color="var(--up)" icon={<BarChart2 size={16} />} />
        <StatCard label="Active Events" value={myEvents.filter(e => e.status === 'selling').length.toString()} icon={<Activity size={16} />} />
      </div>

      {/* Revenue by event */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 20 }}>Revenue by Event</h3>
        {myEvents.length === 0 ? (
          <EmptyState icon={<BarChart2 size={24} />} title="No events yet" desc="Create events to see revenue analytics." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myEvents.sort((a, b) => b.ticketsSold * b.price - a.ticketsSold * a.price).map(ev => {
              const rev = ev.ticketsSold * ev.price;
              const pct = totalRevenue ? (rev / totalRevenue) * 100 : 0;
              return (
                <div key={ev.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--on-dark)', fontWeight: 500 }}>{ev.title}</span>
                    <span style={{ fontSize: 13, color: 'var(--primary)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{rev.toFixed(1)} XLM</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-dark)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 99, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{ev.ticketsSold} sold · {ev.ticketCount - ev.ticketsSold} remaining</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* x402 Telemetry */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)' }}>
              <Lock size={14} style={{ display: 'inline', marginRight: 6 }} />
              x402 Telemetry Logs
            </h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Premium endpoint — requires x402 payment signature</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => fetchTelemetry()} disabled={loadingTelem}>
            {loadingTelem ? <span className="spinner spinner-sm" /> : <><Activity size={13} /> Fetch Logs</>}
          </button>
        </div>

        <div className="info-box" style={{ marginBottom: 16 }}>
          <strong>How x402 works:</strong> The <code style={{ fontFamily: 'monospace', fontSize: 11 }}>/tickets/telemetry</code> endpoint returns a 402 unless a valid <code style={{ fontFamily: 'monospace', fontSize: 11 }}>X-Payment-Signature</code> header is sent. Pro subscribers can simulate this payment.
        </div>

        {telemetry.length === 0 ? (
          <EmptyState icon={<FileText size={24} />} title="No telemetry loaded" desc='Click "Fetch Logs" to load telemetry. You may be prompted for a payment signature.' />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Event ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {telemetry.map((t: any) => (
                  <tr key={t.id}>
                    <td className="mono">{new Date(t.timestamp).toLocaleTimeString()}</td>
                    <td><span className="status-badge status-selling">{t.action}</span></td>
                    <td className="mono">{t.eventId}</td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>{JSON.stringify(t.details).slice(0, 60)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* x402 Payment Modal */}
      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="x402 Payment Required"
        subtitle="Provide a payment signature to access premium telemetry."
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { setShowPaymentModal(false); fetchTelemetry(paymentSig); }}>
              Submit Payment
            </button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="warn-box"><AlertTriangle size={16} />This endpoint uses the x402 payment protocol. A valid signature is required.</div>
          <div className="form-group">
            <label className="form-label">Payment Signature (simulated)</label>
            <input className="form-input mono" placeholder="sim_xlm_signature_…" value={paymentSig} onChange={e => setPaymentSig(e.target.value)} />
            <span className="form-hint">Enter any non-empty string to simulate a valid x402 payment.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Integrations Tab ─────────────────────────────────────────────────────────
function IntegrationsTab({ token, user }: { token: string; user: any }) {
  const { success, error } = useToast();
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [wh, al] = await Promise.all([api.getWebhookLogs(token), api.getAuditLogs(token)]);
      setWebhookLogs(wh);
      setAuditLogs(al);
    } catch {
      error('Failed to load integration logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const triggerWebhook = async (action: string) => {
    setTriggering(true);
    try {
      await fetch('http://localhost:3001/api/integrations/corsair/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-corsair-signature': 'sim-sig-' + Date.now() },
        body: JSON.stringify({ event: action, action, data: { timestamp: new Date().toISOString(), userId: user?.id } }),
      });
      success('Webhook triggered', `"${action}" event sent via Corsair.`);
      load();
    } catch {
      error('Webhook failed');
    } finally {
      setTriggering(false);
    }
  };

  const integrations = [
    { name: 'Gmail', desc: 'Send confirmation emails on ticket purchase', icon: '📧', enabled: true },
    { name: 'Slack', desc: 'Post check-in notifications to your channel', icon: '💬', enabled: true },
    { name: 'Discord', desc: 'Announce new events and ticket sales', icon: '🎮', enabled: true },
    { name: 'Stripe', desc: 'Sync revenue data to your Stripe dashboard', icon: '💳', enabled: false },
  ];

  const webhookActions = ['ticket.purchased', 'ticket.checked_in', 'ticket.refunded', 'event.created', 'event.sold_out'];

  return (
    <div className="animate-in">
      <div className="info-box" style={{ marginBottom: 24 }}>
        <strong>Corsair Integration:</strong> TicketStar uses Corsair webhooks to route event data to Gmail, Slack, Discord, and Stripe. Trigger test webhooks below.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          {/* Integration cards */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16 }}>Connected Integrations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {integrations.map(i => (
                <div key={i.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-dark)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ fontSize: 24 }}>{i.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 2 }}>{i.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{i.desc}</div>
                  </div>
                  <div style={{ width: 36, height: 20, background: i.enabled ? 'var(--primary)' : 'var(--surface-dark-card)', borderRadius: 99, position: 'relative', cursor: 'pointer', border: '1px solid var(--hairline-dark)' }}>
                    <div style={{ width: 14, height: 14, background: '#fff', borderRadius: 99, position: 'absolute', top: 2, left: i.enabled ? 18 : 2, transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger webhook */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 8 }}>Test Webhooks</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Trigger Corsair events to test your integration pipeline.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {webhookActions.map(a => (
                <button key={a} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}
                  disabled={triggering} onClick={() => triggerWebhook(a)}>
                  <Zap size={12} color="var(--primary)" /> <span className="mono" style={{ fontSize: 12 }}>{a}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Webhook logs */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)' }}>Webhook Logs</h3>
              <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={13} /></button>
            </div>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><div className="spinner" /></div>
              : webhookLogs.length === 0 ? <EmptyState icon={<Activity size={20} />} title="No webhooks yet" desc="Trigger a test webhook to see logs here." />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                    {webhookLogs.map(w => (
                      <div key={w.id} style={{ padding: '8px 10px', background: 'var(--surface-dark)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-dark)', fontFamily: 'monospace' }}>{w.action}</span>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(w.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{w.plugin}</div>
                      </div>
                    ))}
                  </div>
                )}
          </div>

          {/* Audit logs */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16 }}>Audit Log</h3>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><div className="spinner" /></div>
              : auditLogs.length === 0 ? <EmptyState icon={<FileText size={20} />} title="No audit events" desc="Audit logs appear as actions are performed." />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {auditLogs.map(a => (
                      <div key={a.id} style={{ padding: '8px 10px', background: 'var(--surface-dark)', borderRadius: 'var(--r-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>{a.action}</span>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(a.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-soft)', lineHeight: 1.5 }}>{a.details}</div>
                      </div>
                    ))}
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pricing Tab ──────────────────────────────────────────────────────────────
function PricingTab({ user, onUpgrade, upgrading }: { user: any; onUpgrade: () => void; upgrading: boolean }) {
  const isPro = user?.subscription === 'pro';

  return (
    <div className="animate-in">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 34, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 12 }}>
          {isPro ? 'You\'re on Pro 🚀' : 'Upgrade to Pro'}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--muted-soft)', maxWidth: 480, margin: '0 auto' }}>
          {isPro ? 'All organizer features are unlocked. Manage your subscription below.' : 'Unlock event creation, analytics, and Corsair integrations.'}
        </p>
      </div>

      <div className="pricing-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="pricing-card" style={{ opacity: isPro ? 0.6 : 1 }}>
          <div className="pricing-plan">Free / Attendee</div>
          <div className="pricing-price">0</div>
          <div className="pricing-period">XLM / month</div>
          <ul className="pricing-features">
            {['Browse events', 'Purchase tickets with XLM', 'QR code tickets', 'Ticket history & refunds'].map(f => <li key={f}><CheckCircle size={14} />{f}</li>)}
          </ul>
          <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
            {user?.subscription === 'free' ? '✓ Current Plan' : 'Basic Plan'}
          </button>
        </div>

        <div className="pricing-card featured">
          <div className="pricing-badge">{isPro ? 'Your Plan' : 'Recommended'}</div>
          <div className="pricing-plan">Organizer Pro</div>
          <div className="pricing-price">10</div>
          <div className="pricing-period">XLM / month (simulated)</div>
          <ul className="pricing-features">
            {[
              'Create unlimited events',
              'Real-time analytics dashboard',
              'x402 telemetry access',
              'QR code check-in scanner',
              'Attendee list & export',
              'Corsair webhook integrations',
              'Soroban contract events',
              'Priority support',
            ].map(f => <li key={f}><CheckCircle size={14} />{f}</li>)}
          </ul>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', width: '100%', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={onUpgrade} disabled={upgrading}>
            {upgrading ? <span className="spinner spinner-sm" /> : isPro ? 'Downgrade to Free' : 'Upgrade to Pro — 10 XLM'}
          </button>
        </div>

        <div className="pricing-card">
          <div className="pricing-plan">Enterprise</div>
          <div className="pricing-price">—</div>
          <div className="pricing-period">Custom pricing</div>
          <ul className="pricing-features">
            {['Everything in Pro', 'Custom Soroban deployment', 'Dedicated webhook infra', 'SLA & on-chain settlement', 'White-label option'].map(f => <li key={f}><CheckCircle size={14} />{f}</li>)}
          </ul>
          <button className="btn btn-secondary" style={{ width: '100%' }}>Contact Sales</button>
        </div>
      </div>

      {/* Billing info */}
      <div className="card" style={{ maxWidth: 600, margin: '40px auto 0' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16 }}>Billing & Subscription</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { l: 'Current Plan', v: user?.subscription === 'pro' ? 'Pro Organizer' : 'Free Attendee' },
            { l: 'Status', v: 'Active' },
            { l: 'Payment Method', v: 'Stellar XLM (simulated)' },
            { l: 'Next Billing', v: user?.subscription === 'pro' ? new Date(Date.now() + 30 * 24 * 3600000).toLocaleDateString() : '—' },
          ].map(r => (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--hairline-dark)' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)' }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Tab ────────────────────────────────────────────────────────────────
function AdminTab({ token }: { token: string; user: any }) {
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getUsers(token);
      setUsers(data);
    } catch {
      error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  return (
    <div className="animate-in">
      <div className="hero-banner" style={{ marginBottom: 28 }}>
        <div className="hero-glow" />
        <div className="hero-eyebrow"><Shield size={11} /> Admin Dashboard</div>
        <h1 className="hero-title">Platform Administration</h1>
        <p className="hero-desc">Manage users, monitor activity, and oversee the platform.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)' }}>User Management</h3>
          <button className="btn btn-secondary btn-sm" onClick={loadUsers} disabled={loadingUsers}>
            <RefreshCw size={13} />
          </button>
        </div>

        {loadingUsers ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="mono" style={{ fontSize: 11 }}>{u.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--on-dark)' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`status-badge status-${u.role === 'admin' ? 'settled' : u.role === 'organizer' ? 'selling' : 'issued'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.subscription === 'pro' ? 'badge-pro' : 'badge-free'}`}>{u.subscription}</span></td>
                    <td className="mono" style={{ fontSize: 11, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.walletAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 12 }}>
            <Activity size={14} style={{ display: 'inline', marginRight: 6 }} />
            Platform Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard label="Total Users" value={users.length.toString()} icon={<Users size={16} />} />
            <StatCard label="Organizers" value={users.filter(u => u.role === 'organizer').length.toString()} color="var(--primary)" icon={<Calendar size={16} />} />
            <StatCard label="Pro Subscribers" value={users.filter(u => u.subscription === 'pro').length.toString()} color="var(--up)" icon={<Star size={16} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ user, onUpgrade, upgrading, onLogout }: { user: any; onUpgrade: () => void; upgrading: boolean; onLogout: () => void }) {
  const { success, warning } = useToast();
  const [wallet, setWallet] = useState('');
  const [notifs, setNotifs] = useState({ email: true, slack: false, discord: true });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const SECTIONS = ['Profile', 'Wallet', 'Notifications', 'Billing', 'Security', 'Danger Zone'];
  const [activeSection, setActiveSection] = useState('Profile');

  return (
    <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
      {/* Settings nav */}
      <div className="card" style={{ padding: 12 }}>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px',
            borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 500,
            background: activeSection === s ? 'rgba(0,82,255,0.1)' : 'transparent',
            color: activeSection === s ? 'var(--primary)' : (s === 'Danger Zone' ? 'var(--down)' : 'var(--muted-soft)'),
            transition: 'all 0.15s', marginBottom: 2,
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Settings content */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeSection === 'Profile' && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>Profile</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#0052ff,#6ba3ff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" defaultValue={user?.name} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue={user?.email} /></div>
            <div className="form-group"><label className="form-label">Role</label><input className="form-input" value={user?.role} disabled /></div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => success('Profile saved!')}>Save Changes</button>
          </>
        )}

        {activeSection === 'Wallet' && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>Stellar Wallet</h3>
            <div className="info-box">Connect your Stellar testnet wallet for XLM payment verification on ticket purchases.</div>
            <div className="form-group">
              <label className="form-label">Wallet Address</label>
              <input className="form-input mono" placeholder="GABCDE..." value={wallet} onChange={e => setWallet(e.target.value)} />
              <span className="form-hint">Stellar testnet address (starts with G…)</span>
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => success('Wallet linked!')}>
              <Wallet size={14} /> Link Wallet
            </button>
          </>
        )}

        {activeSection === 'Notifications' && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>Notification Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive ticket confirmations and event updates via email' },
                { key: 'slack', label: 'Slack Notifications', desc: 'Post check-in events to your Slack workspace via Corsair' },
                { key: 'discord', label: 'Discord Notifications', desc: 'Announce new events to your Discord server via Corsair' },
              ].map(n => (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface-dark)', borderRadius: 'var(--r-md)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 3 }}>{n.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{n.desc}</div>
                  </div>
                  <div
                    style={{ width: 40, height: 22, background: (notifs as any)[n.key] ? 'var(--primary)' : 'var(--surface-dark-card)', borderRadius: 99, position: 'relative', cursor: 'pointer', border: '1px solid var(--hairline-dark)', transition: 'background 0.2s' }}
                    onClick={() => setNotifs(v => ({ ...v, [n.key]: !(v as any)[n.key] }))}>
                    <div style={{ width: 16, height: 16, background: '#fff', borderRadius: 99, position: 'absolute', top: 2, left: (notifs as any)[n.key] ? 20 : 2, transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => success('Preferences saved!')}>Save Preferences</button>
          </>
        )}

        {activeSection === 'Billing' && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>Billing & Subscription</h3>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px', background: 'var(--surface-dark)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline-dark)' }}>
              <div style={{ width: 40, height: 40, background: user?.subscription === 'pro' ? 'rgba(0,82,255,0.12)' : 'var(--surface-dark-card)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={20} color={user?.subscription === 'pro' ? 'var(--primary)' : 'var(--muted)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-dark)' }}>
                  {user?.subscription === 'pro' ? 'Pro Organizer' : 'Free Plan'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {user?.subscription === 'pro' ? '10 XLM/month · Renews automatically' : 'Limited features'}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={onUpgrade} disabled={upgrading}>
                {upgrading ? <span className="spinner spinner-sm" /> : user?.subscription === 'pro' ? 'Manage' : 'Upgrade'}
              </button>
            </div>
            <div className="info-box">Payments are processed via simulated Stellar XLM transactions in testnet mode.</div>
          </>
        )}

        {activeSection === 'Security' && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-dark)' }}>Security</h3>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
            <div className="form-group"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => success('Password updated!')}>Update Password</button>

            <div className="divider" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 8 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Add an extra layer of security to your account.</div>
              <button className="btn btn-secondary btn-sm"><Lock size={13} /> Enable 2FA (coming soon)</button>
            </div>
          </>
        )}

        {activeSection === 'Danger Zone' && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--down)' }}>Danger Zone</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '16px 20px', background: 'rgba(207,32,47,0.05)', border: '1px solid rgba(207,32,47,0.2)', borderRadius: 'var(--r-lg)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 4 }}>Sign Out</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Sign out from this device.</div>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmLogout(true)}><LogOut size={13} /> Sign Out</button>
              </div>
              <div style={{ padding: '16px 20px', background: 'rgba(207,32,47,0.05)', border: '1px solid rgba(207,32,47,0.2)', borderRadius: 'var(--r-lg)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-dark)', marginBottom: 4 }}>Delete Account</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Permanently delete your account and all associated data. This cannot be undone.</div>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}><Trash2 size={13} /> Delete Account</button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog open={confirmLogout} onClose={() => setConfirmLogout(false)} title="Sign Out" desc="Are you sure you want to sign out?" danger onConfirm={onLogout} />
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete Account" desc="This will permanently delete your account. Are you absolutely sure?" danger onConfirm={() => { warning('Account deletion is disabled in demo mode.'); }} />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type View = 'landing' | 'login' | 'signup' | 'onboarding' | 'dashboard';

export default function Home() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        const hasOnboarded = localStorage.getItem(`et_onboarded_${user.id}`);
        if (!hasOnboarded) setView('onboarding');
        else setView('dashboard');
      } else if (view === 'dashboard' || view === 'onboarding') {
        setView('landing');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-dark)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>Loading TicketStar…</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>TicketStar — Blockchain Event Ticketing on Stellar</title>
        <meta name="description" content="Create events, sell tickets with Stellar XLM payments, and manage attendees with QR code check-in powered by Soroban smart contracts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%230052ff'/><text y='22' x='5' font-size='18'>🎟</text></svg>" />
      </Head>

      {view === 'landing' && (
        <LandingPage onEnter={(mode) => { setAuthMode(mode); setView(mode); }} />
      )}

      {(view === 'login' || view === 'signup') && (
        <AuthPage
          mode={view}
          onSwitch={() => setView(view === 'login' ? 'signup' : 'login')}
          onSuccess={() => {
            const saved = localStorage.getItem('et_user');
            if (!saved) { setView('landing'); return; }
            const u = JSON.parse(saved);
            const hasOnboarded = localStorage.getItem(`et_onboarded_${u.id}`);
            setView(hasOnboarded ? 'dashboard' : 'onboarding');
          }}
        />
      )}

      {view === 'onboarding' && user && (
        <OnboardingPage onDone={() => {
          localStorage.setItem(`et_onboarded_${user.id}`, '1');
          setView('dashboard');
        }} />
      )}

      {view === 'dashboard' && user && <Dashboard />}
    </>
  );
}
