'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, refresh, setAccessToken, setBlockedHandler, type Blocked } from './client-api';
import type { Profile } from './types';

// Public pages shouldn't fire a refresh request for every anonymous visitor.
// This flag (no secret in it) only says "this browser signed in before",
// so it's worth asking the API for a session.
const HINT = 'hm-signed-in';
const hint = {
  get: () => {
    try {
      return localStorage.getItem(HINT) === '1';
    } catch {
      return false;
    }
  },
  set: (on: boolean) => {
    try {
      if (on) localStorage.setItem(HINT, '1');
      else localStorage.removeItem(HINT);
    } catch {}
  },
};

// The account-status page reads this after a redirect (same tab, no reload).
let lastBlocked: Blocked | null = null;
export const getLastBlocked = () => lastBlocked;

type Session = {
  user: Profile | null;
  ready: boolean;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const signIn = useCallback(async (token: string) => {
    setAccessToken(token);
    setUser(await api<Profile>('/auth/profile'));
    hint.set(true);
  }, []);

  const signOut = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setAccessToken(null);
    setUser(null);
    hint.set(false);
  }, []);

  // A blocked account is signed out everywhere and sent to its own page.
  useEffect(() => {
    setBlockedHandler((b) => {
      lastBlocked = b;
      setAccessToken(null);
      setUser(null);
      hint.set(false);
      router.replace(`/account-status?state=${encodeURIComponent(b.state)}`);
    });
  }, [router]);

  // Bootstrap once (refresh is single-flight, so StrictMode is safe).
  useEffect(() => {
    void (hint.get() ? refresh() : Promise.resolve(null))
      .then((token) => (token ? signIn(token) : hint.set(false)))
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, [signIn]);

  return <SessionContext.Provider value={{ user, ready, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
