'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Ticket, ArrowLeft, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setErrorMsg('Please enter your email address.'); return; }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.forgotPassword({ email: email.trim() });
      setSent(true);
      console.info('Reset token (dev only):', res.resetToken);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-dark)' }}>
      <Head>
        <title>Forgot Password — TicketStar</title>
      </Head>
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0a0b0d 0%, #0d1829 60%, #0a1a3a 100%)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--hairline-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>TicketStar</span>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16, lineHeight: 1.3 }}>
          Forgot your<br />password?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.8, maxWidth: 400 }}>
          Enter your email and we&apos;ll send you a reset link. No stress — we&apos;ve got you covered.
        </p>
      </div>

      <div style={{ width: 480, padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <ArrowLeft size={14} /> Back to Home
          </button>
        </Link>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(5,177,105,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={28} color="var(--up)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 8 }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.7, marginBottom: 24 }}>
              We sent a reset link to <strong style={{ color: 'var(--on-dark)' }}>{email}</strong>. It expires in 1 hour.
            </p>
            <div className="info-box" style={{ textAlign: 'left' }}>
              <strong>Demo mode:</strong> In production, an email would be sent. For this demo, the reset token is logged to the console.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 6 }}>Reset password</h1>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                Remember your password?{' '}
                <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(''); }} />
            </div>

            {errorMsg && (
              <div className="warn-box"><AlertTriangle size={14} /><span>{errorMsg}</span></div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 48, fontSize: 15 }}>
              {loading ? <span className="spinner spinner-sm" /> : <><Mail size={16} /> Send Reset Link</>}
            </button>
          </form>
        )}

        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
