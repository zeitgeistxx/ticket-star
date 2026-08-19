import {
  isConnected,
  isAllowed,
  setAllowed,
  getUserInfo,
} from '@stellar/freighter-api';

export class FreighterError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FreighterError';
  }
}

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res: any = await isConnected();
    if (typeof res === 'boolean') return res;
    if (res && typeof res.isConnected === 'boolean') return res.isConnected;
    return typeof window !== 'undefined' && !!(window as any).freighter;
  } catch {
    return typeof window !== 'undefined' && !!(window as any).freighter;
  }
}

export async function connectFreighter(): Promise<string> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new FreighterError(
      'Freighter extension not detected. Please install Freighter from https://www.freighter.app/ or use manual Stellar Wallet ID sign in.',
    );
  }

  try {
    const allowed: any = await setAllowed();
    if (allowed && allowed.error) {
      throw new FreighterError(allowed.error);
    }

    const userInfo: any = await getUserInfo();
    if (!userInfo || !userInfo.publicKey) {
      throw new FreighterError('Could not retrieve public key from Freighter wallet.');
    }

    return userInfo.publicKey;
  } catch (err: any) {
    if (err instanceof FreighterError) throw err;
    throw new FreighterError(err.message || 'Failed to connect Freighter wallet.');
  }
}

export async function getFreighterAddress(): Promise<string | null> {
  try {
    const allowed: any = await isAllowed();
    const isOk = typeof allowed === 'boolean' ? allowed : allowed?.isAllowed;
    if (isOk) {
      const userInfo: any = await getUserInfo();
      return userInfo?.publicKey || null;
    }
  } catch {
    // Ignore error if not permitted yet
  }
  return null;
}
