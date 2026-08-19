'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User } from './api';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithStellarWallet: (walletAddress: string, role?: string, name?: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  upgradeToProSimulated: () => Promise<void>;
  loading: boolean;
}

const Context = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('et_token');
    const savedUser = localStorage.getItem('et_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const persist = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('et_token', t);
    localStorage.setItem('et_user', JSON.stringify(u));
  };

  const loginWithStellarWallet = async (walletAddress: string, role?: string, name?: string) => {
    const res = await api.stellarLogin({ walletAddress, role, name });
    persist(res.token, res.user);
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    persist(res.token, res.user);
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    const res = await api.signup({ name, email, password, role });
    persist(res.token, res.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_user');
  };

  const upgradeToProSimulated = async () => {
    if (!user || !token) return;
    const res = await api.toggleSubscription(user.id, token);
    const updated = res.user;
    setUser(updated);
    localStorage.setItem('et_user', JSON.stringify(updated));
  };

  return (
    <Context.Provider value={{ user, token, login, loginWithStellarWallet, signup, logout, upgradeToProSimulated, loading }}>
      {children}
    </Context.Provider>
  );
}

export const useAuth = () => useContext(Context);
