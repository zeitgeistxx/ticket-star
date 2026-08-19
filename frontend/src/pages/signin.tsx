import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { connectFreighter, isFreighterInstalled } from '../lib/freighter';
import { api } from '../lib/api';
import {
  Wallet, ShieldCheck, Cpu, ArrowRight, CheckCircle2, AlertCircle,
  Sparkles, RefreshCw, KeyRound
} from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { loginWithStellarWallet, user } = useAuth();

  const [walletInput, setWalletInput] = useState('');
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee');
  const [freighterAvailable, setFreighterAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    isFreighterInstalled().then(installed => {
      setFreighterAvailable(installed);
    });
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleFreighterConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      const publicKey = await connectFreighter();
      await loginWithStellarWallet(publicKey, role);
      setSuccessMsg(`Authenticated via Freighter Wallet (${publicKey.slice(0, 6)}...${publicKey.slice(-4)})`);
      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Freighter connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const addr = walletInput.trim();

    if (!addr) {
      setError('Please enter a valid Stellar Public Key address.');
      return;
    }
    if (!addr.startsWith('G') || addr.length !== 56) {
      setError('Stellar Public Key must be exactly 56 characters starting with "G" (e.g. GABH...)');
      return;
    }

    setLoading(true);
    try {
      await loginWithStellarWallet(addr, role);
      setSuccessMsg(`Signed in with Stellar Wallet ID (${addr.slice(0, 6)}...${addr.slice(-4)})`);
      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Stellar Wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestnetWallet = async () => {
    setError(null);
    setLoading(true);
    try {
      const generated = await api.generateWallet('');
      await loginWithStellarWallet(generated.publicKey, role);
      setSuccessMsg(`Generated & funded Testnet Wallet (${generated.publicKey.slice(0, 6)}...${generated.publicKey.slice(-4)})`);
      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to generate testnet wallet');
    } finally {
      setLoading(false);
    }
  };

  const isValidStellarFormat = walletInput.trim().startsWith('G') && walletInput.trim().length === 56;

  return (
    <>
      <Head>
        <title>Sign In | TicketStar — Stellar Wallet Authentication</title>
        <meta name="description" content="Sign in to TicketStar strictly using your Stellar Wallet ID or Freighter browser extension." />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'var(--surface-dark)',
        color: 'var(--on-dark)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow ambient background elements */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, maxWidth: 440, zIndex: 1 }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: 'rgba(0,82,255,0.08)',
            border: '1px solid rgba(0,82,255,0.2)',
            borderRadius: 99,
            marginBottom: 20,
            textDecoration: 'none',
          }}>
            <Sparkles size={14} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-dark)', letterSpacing: '0.5px' }}>
              TICKETSTAR
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, background: 'rgba(0,82,255,0.15)',
              color: '#6ba3ff', border: '1px solid rgba(0,82,255,0.3)',
              padding: '1px 6px', borderRadius: 99, letterSpacing: '0.5px'
            }}>STELLAR</span>
          </Link>

          <h1 style={{
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--on-dark)',
            marginBottom: 8,
            letterSpacing: '-0.4px',
          }}>
            Stellar Wallet Authentication
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-soft)', lineHeight: 1.6 }}>
            Non-custodial, keyless sign in powered by Stellar Network & Soroban
          </p>
        </div>

        {/* Main Card (24px radius, #16181c elevated surface) */}
        <div style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--surface-dark-elevated)',
          border: '1px solid var(--hairline-dark)',
          borderRadius: 'var(--r-xl)',
          padding: 32,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          zIndex: 1,
          position: 'relative',
        }}>

          {/* Error Banner */}
          {error && (
            <div className="warn-box" style={{ marginBottom: 20 }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="success-box" style={{ marginBottom: 20 }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Role Selection Toggle */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Select Account Role</label>
            <div className="toggle-group" style={{ width: '100%' }}>
              <button
                type="button"
                className={`toggle-opt ${role === 'attendee' ? 'active' : ''}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38 }}
                onClick={() => setRole('attendee')}
              >
                <ShieldCheck size={14} />
                Attendee
              </button>
              <button
                type="button"
                className={`toggle-opt ${role === 'organizer' ? 'active' : ''}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38 }}
                onClick={() => setRole('organizer')}
              >
                <Cpu size={14} />
                Event Organizer
              </button>
            </div>
          </div>

          {/* METHOD 1: FREIGHTER WALLET EXTENSION */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
              Recommended Method
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleFreighterConnect}
              disabled={loading}
            >
              <Wallet size={18} />
              {loading ? 'Connecting Freighter...' : 'Connect Freighter Wallet'}
              <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
            </button>

            {/* Freighter Status indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 12, color: 'var(--muted-soft)' }}>
              <span>Freighter Extension:</span>
              {freighterAvailable === true ? (
                <span style={{ color: 'var(--up)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--up)' }} />
                  Detected & Ready
                </span>
              ) : freighterAvailable === false ? (
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  Install Extension →
                </a>
              ) : (
                <span style={{ color: 'var(--muted)' }}>Checking extension...</span>
              )}
            </div>
          </div>

          <div className="divider" style={{ margin: '24px 0' }} />

          {/* METHOD 2: MANUAL STELLAR PUBLIC KEY INPUT */}
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="stellarAddress">
                Stellar Wallet Address (Public Key)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="stellarAddress"
                  type="text"
                  className="form-input mono"
                  style={{ paddingRight: isValidStellarFormat ? 36 : 14 }}
                  value={walletInput}
                  onChange={e => setWalletInput(e.target.value)}
                  placeholder="e.g. GABH... (56 characters)"
                />
                {isValidStellarFormat && (
                  <CheckCircle2 size={16} color="var(--up)" style={{ position: 'absolute', right: 12, top: 14 }} />
                )}
              </div>
              <span className="form-hint">Enter your public key starting with 'G'. No secret key required.</span>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading || !walletInput.trim()}
            >
              <KeyRound size={16} />
              Sign In with Wallet Address
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />

          {/* METHOD 3: ONE-CLICK DEMO TESTNET WALLET GENERATOR */}
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
            onClick={handleGenerateTestnetWallet}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Generate & Sign In with Demo Testnet Wallet
          </button>
        </div>

        {/* Footer Link */}
        <div style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)' }}>
          Need help? Return to{' '}
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Home Page
          </Link>
        </div>
      </div>
    </>
  );
}
