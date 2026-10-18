import { useEffect, useState } from 'react';
import { logout, me } from './api';
import { Login } from './Login';
import { Shell } from './Shell';
import { Button, SaveIndicator } from './ui';
import { useAdminPath } from './nav';
import { DraftProvider, useDraftClient, useDraftState } from './DraftContext';
import { ProjectsList } from './pages/ProjectsList';

export function AdminApp() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    me().then(setSignedIn, () => setSignedIn(false));
  }, []);

  if (signedIn === null) return <div className="min-h-dvh bg-[var(--color-paper)] dark:bg-[#0A0A0C]" />;
  if (!signedIn) return <Login onSignedIn={() => setSignedIn(true)} />;

  return (
    <DraftProvider>
      <Workspace
        onSignOut={async () => {
          await logout().catch(() => {});
          setSignedIn(false);
        }}
      />
    </DraftProvider>
  );
}

function Workspace({ onSignOut }: { onSignOut: () => void }) {
  const client = useDraftClient();
  const state = useDraftState();
  const { path } = useAdminPath();
  const changes = new Set([...state.changed, ...state.pending]).size;

  let page = <ProjectsList />;
  const project = /^\/projets\/([a-z0-9-]+)$/.exec(path);
  if (project) page = <p className="px-4 py-10 md:px-8">Éditeur de {project[1]} (à venir)</p>;

  return (
    <Shell
      onSignOut={onSignOut}
      status={<SaveIndicator state={state.saveState} onReload={() => void client.load()} />}
      publish={
        <Button variant="primary" disabled>
          Publier{changes ? ` · ${changes}` : ''}
        </Button>
      }
    >
      {page}
      {state.saveState === 'signedOut' && <Login overlay onSignedIn={() => void client.resumeAfterLogin()} />}
    </Shell>
  );
}
