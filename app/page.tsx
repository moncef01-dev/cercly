'use client';

import { useState, useEffect } from 'react';
import { useStore } from './lib/store';
import LoginScreen from './components/LoginScreen';
import AppShell from './components/AppShell';
import SplashScreen from './components/SplashScreen';
import type { Role } from './lib/types';
export type { Role } from './lib/types';
export type Tab = string;

export default function Home() {
  const session = useStore((s) => s.session);
  const login = useStore((s) => s.login);
  const setTab = useStore((s) => s.setTab);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleLogin(role: Role) {
    login(role);
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!session.loggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AppShell
      currentTab={session.currentTab}
      onSetTab={setTab}
    />
  );
}
