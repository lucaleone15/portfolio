/**
 * Sign-in lockout: 5 failures from one IP within 15 min lock that IP for 15 min; 20 failures in
 * total within an hour lock everyone for an hour (someone trying from many addresses).
 */

const MIN = 60_000;

export function createLoginLimiter(opts: { now?: () => number } = {}) {
  const now = opts.now ?? Date.now;
  const perIp = new Map<string, { fails: number[]; lockedUntil: number }>();
  let globalFails: number[] = [];
  let globalLockedUntil = 0;

  return {
    retryAfterMs(ip: string): number {
      const t = now();
      const own = perIp.get(ip)?.lockedUntil ?? 0;
      return Math.max(0, own - t, globalLockedUntil - t);
    },
    fail(ip: string): void {
      const t = now();
      const entry = perIp.get(ip) ?? { fails: [], lockedUntil: 0 };
      entry.fails = [...entry.fails.filter((f) => t - f < 15 * MIN), t];
      if (entry.fails.length >= 5) {
        entry.lockedUntil = t + 15 * MIN;
        entry.fails = [];
      }
      perIp.set(ip, entry);
      globalFails = [...globalFails.filter((f) => t - f < 60 * MIN), t];
      if (globalFails.length >= 20) {
        globalLockedUntil = t + 60 * MIN;
        globalFails = [];
      }
    },
    succeed(ip: string): void {
      perIp.delete(ip);
    },
  };
}

export type LoginLimiter = ReturnType<typeof createLoginLimiter>;
