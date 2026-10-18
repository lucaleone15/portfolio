import { useEffect, useState } from 'react';
import { logout, me } from './api';
import { Login } from './Login';
import { Shell } from './Shell';
import { Button } from './ui';

export function AdminApp() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    me().then(setSignedIn, () => setSignedIn(false));
  }, []);

  if (signedIn === null) return <div className="min-h-dvh bg-[var(--color-paper)] dark:bg-[#0A0A0C]" />;
  if (!signedIn) return <Login onSignedIn={() => setSignedIn(true)} />;

  const signOut = async () => {
    await logout().catch(() => {});
    setSignedIn(false);
  };

  return (
    <Shell
      onSignOut={signOut}
      publish={
        <Button variant="primary" disabled>
          Publier
        </Button>
      }
    >
      <div className="px-4 py-8 md:px-8">
        <p className="eyebrow text-[var(--accent)]">Contenu</p>
        <h1 className="mt-2 font-syne text-3xl font-extrabold tracking-tight">Tes projets</h1>
      </div>
    </Shell>
  );
}
