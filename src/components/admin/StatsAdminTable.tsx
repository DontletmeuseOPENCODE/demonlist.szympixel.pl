'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LeaderboardEntry } from '@/lib/stats';
import type { Demon } from '@/lib/yaml';
import type { StatsOverride } from '@/lib/stats-overrides';
import EditStatsOverrideForm from './EditStatsOverrideForm';

interface InitialData {
  players: LeaderboardEntry[];
  demons: Demon[];
  overrides: StatsOverride[];
}

/**
 * Tabela statystyk graczy dla admina. Fetchuje dane z API na wejściu,
 * potem refreshuje po każdej akcji przez router.refresh().
 */
export default function StatsAdminTable({ initialData }: { initialData: InitialData }) {
  const router = useRouter();
  const [data, setData] = useState<InitialData>(initialData);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [recomputing, setRecomputing] = useState(false);

  const refresh = async () => {
    const res = await fetch('/api/stats/overrides');
    if (res.ok) {
      const next = await res.json();
      setData(next);
    }
  };

  // Odśwież dane po każdej zmianie (po zamknięciu modala)
  useEffect(() => {
    if (editingPlayer === null) {
      refresh();
    }
  }, [editingPlayer]);

  const handleRecompute = async () => {
    if (!confirm(`Przeliczyć wszystkie statystyki? To usunie ${data.overrides.length} ręcznych nadpisań.`)) return;
    setRecomputing(true);
    try {
      const res = await fetch('/api/stats/recompute', { method: 'POST' });
      if (!res.ok) throw new Error('Błąd');
      await refresh();
      router.refresh();
    } catch {
      alert('Błąd przeliczania');
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="admin-title" style={{ margin: 0 }}>Statystyki Graczy</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>
            {data.players.length} graczy · {data.overrides.length} {data.overrides.length === 1 ? 'nadpisanie' : 'nadpisań'}
          </p>
        </div>
        <button
          className="btn-danger"
          onClick={handleRecompute}
          disabled={recomputing || data.overrides.length === 0}
          title="Usuń wszystkie nadpisania — wróć do wartości obliczanych"
        >
          {recomputing ? 'Przeliczam…' : 'Przelicz wszystkie statystyki'}
        </button>
      </div>

      <div className="card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Rank</th>
              <th>Gracz</th>
              <th>Main</th>
              <th>Verified</th>
              <th>Score</th>
              <th>Hardest demon</th>
              <th style={{ textAlign: 'right' }}>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {data.players.map((p) => {
              const ov = data.overrides.find((o) => o.player.toLowerCase() === p.player.toLowerCase()) ?? null;
              const flags = p._override ?? {};
              const hardest = (ov && ov.hardest_demon_id != null)
                ? data.demons.find((d) => d.id === ov.hardest_demon_id)
                : null;
              return (
                <tr key={p.player}>
                  <td><strong style={{ color: 'var(--accent)' }}>#{p.rank}</strong></td>
                  <td>
                    <Link href={`/players/${encodeURIComponent(p.player)}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {p.player}
                    </Link>
                  </td>
                  <td>
                    {p.main_completed}
                    <Badge enabled={!!flags.main_completed} />
                  </td>
                  <td>
                    {p.verified_count}
                    <Badge enabled={!!flags.verified_count} />
                  </td>
                  <td>
                    <strong>{p.score.toFixed(2)}</strong>
                    <Badge enabled={!!flags.score} />
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {hardest ? (
                      <Link href={`/demon/${hardest.id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                        #{hardest.rank} · {hardest.name}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>{ov?.hardest_demon_id === null ? 'Brak (override)' : '—'}</span>
                    )}
                    {ov && 'hardest_demon_id' in ov && <Badge enabled={true} />}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-secondary" onClick={() => setEditingPlayer(p.player)}>
                      Edytuj
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.players.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Brak graczy</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingPlayer && (() => {
        const ov = data.overrides.find((o) => o.player.toLowerCase() === editingPlayer.toLowerCase()) ?? null;
        const initial = ov ? {
          main_completed: ov.main_completed,
          verified_count: ov.verified_count,
          created_count: ov.created_count,
          score: ov.score,
          hardest_demon_id: ov.hardest_demon_id,
        } : {};
        // API zwraca pełne demony, przekazujemy dalej
        return (
          <EditStatsOverrideForm
            player={editingPlayer}
            initial={initial}
            demons={data.demons}
            onClose={() => setEditingPlayer(null)}
          />
        );
      })()}
    </div>
  );
}

function Badge({ enabled }: { enabled: boolean }) {
  return (
    <span className={`stats-override-badge ${enabled ? 'override' : 'auto'}`}>
      {enabled ? 'override' : 'auto'}
    </span>
  );
}