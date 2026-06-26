'use client';

import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/lib/stats';
import type { Demon } from '@/lib/yaml';
import type { StatsOverride } from '@/lib/stats-overrides';
import StatsAdminTable from '@/components/admin/StatsAdminTable';

interface Data {
  players: LeaderboardEntry[];
  demons: Demon[];
  overrides: StatsOverride[];
}

/**
 * Zakładka "Stats" w adminie — fetchuje dane z /api/stats/overrides.
 */
export default function StatsTab() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/stats/overrides');
        if (!res.ok) throw new Error('Błąd pobierania');
        const next = await res.json();
        setData(next);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) return <div className="login-error">{error}</div>;
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ładowanie…</div>;
  return <StatsAdminTable initialData={data} />;
}