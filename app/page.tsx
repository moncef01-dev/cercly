'use client';

import { useStore } from './lib/store';
import LoginScreen from './components/LoginScreen';
import AppShell from './components/AppShell';
import type { Role } from './lib/types';
export type { Role } from './lib/types';
export type Tab = string;

export default function Home() {
  const session = useStore((s) => s.session);
  const login = useStore((s) => s.login);
  const setTab = useStore((s) => s.setTab);

  function handleLogin(role: Role) {
    login(role);
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
