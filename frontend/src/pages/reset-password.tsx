'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Ticket, ArrowLeft, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token, email } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token && router.isReady) {
      setErrorMsg('Invalid or missing reset token. Please request a new reset link.');
    }
  }, [token, router.isReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) { setErrorMsg('Please fill in all fields.'); return; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    if (!token || !email) { setErrorMsg('Invalid reset link.'); return; }

    setLoading(true);
    setErrorMsg('');
    try {
      await api.resetPassword({ token: token as string, password, email: email as string });
      setDone(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-dark)' }}>
      <Head><title>Reset Password — TicketStar</title></Head>
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0a0b0d 0%, #0d1829 60%, #0a1a3a 100%)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--hairline-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-dark)' }}>TicketStar</span>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 16, lineHeight: 1.3 }}>
          Choose a new<br />password
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.8, maxWidth: 400 }}>
          Make it strong — at least 6 characters with a mix of letters and numbers.
        </p>
      </div>

      <div style={{ width: 480, padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </Link>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(5,177,105,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={28} color="var(--up)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 8 }}>Password reset!</h2>
            <p style={{ fontSize: 14, color: 'var(--muted-soft)', marginBottom: 24 }}>
              Your password has been updated successfully.
            </p>
            <Link href="/">
              <button className="btn btn-primary"><ArrowLeft size={14} /> Sign In with New Password</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 6 }}>New password</h1>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                For {email ? <strong style={{ color: 'var(--on-dark)' }}>{email}</strong> : 'your account'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMsg(''); }} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  <Eye size={16} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrorMsg(''); }} />
            </div>

            {errorMsg && (
              <div className="warn-box"><AlertTriangle size={14} /><span>{errorMsg}</span></div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 48, fontSize: 15 }}>
              {loading ? <span className="spinner spinner-sm" /> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
