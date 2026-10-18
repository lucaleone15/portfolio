import { useState, type FormEvent } from 'react';
import { ApiError, login } from './api';
import { Button, Monogram, fieldClass, labelClass } from './ui';

export function Login({ onSignedIn, overlay = false }: { onSignedIn: () => void; overlay?: boolean }) {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(password, code);
      onSignedIn();
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        const minutes = Math.max(1, Math.ceil(Number((err.body as { retryAfter?: number })?.retryAfter ?? 60) / 60));
        setError(`Trop d'essais. Réessaie dans ${minutes} min.`);
      } else if (err instanceof ApiError && err.status === 401) {
        setError('Mot de passe ou code incorrect.');
      } else {
        setError('Connexion impossible. Vérifie ta connexion internet.');
      }
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`${overlay ? 'fixed inset-0 z-50 bg-[var(--color-paper)]/85 dark:bg-[#0A0A0C]/85 backdrop-blur-md' : 'min-h-dvh bg-[var(--color-paper)] dark:bg-[#0A0A0C]'} flex items-center justify-center px-4 py-10`}
    >
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Monogram size={44} />
          <div>
            <p className="font-syne text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Atelier</p>
            <p className="text-sm text-neutral-500 dark:text-[#A1A1AA]">{overlay ? 'Ta session a expiré : reconnecte-toi, rien n’est perdu.' : 'L’espace privé de luca-leone.ch'}</p>
          </div>
        </div>

        <label className={labelClass} htmlFor="password">
          Mot de passe
        </label>
        <input id="password" type="password" autoComplete="current-password" required className={fieldClass} value={password} onChange={(e) => setPassword(e.target.value)} />

        <label className={`${labelClass} mt-5`} htmlFor="code">
          Code à 6 chiffres
        </label>
        <input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          className={`${fieldClass} font-syne text-xl tracking-[0.4em]`}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))}
        />
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-[#A1A1AA]">Celui de ton app d’authentification.</p>

        <p role="alert" aria-live="polite" className="mt-4 min-h-5 text-sm font-semibold text-[var(--accent)]">
          {error}
        </p>

        <Button type="submit" variant="primary" disabled={busy} className="mt-2 w-full">
          {busy ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  );
}
