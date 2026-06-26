'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LeaderboardEntry } from '@/lib/stats';

export default function StatsLeaderboard({ players }: { players: LeaderboardEntry[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.player.toLowerCase().includes(q));
  }, [players, query]);

  return (
    <div className="stats-page">
      <h1 className="stats-leaderboard-title">Stats Leaderboard</h1>
      <p className="stats-leaderboard-sub">
        {players.length} {players.length === 1 ? 'gracz' : 'graczy'} posortowanych po Demonlist score
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Szukaj gracza..."
        className="stats-search"
      />

      {filtered.length === 0 ? (
        <div className="stats-empty">Brak graczy spełniających kryteria</div>
      ) : (
        <div className="stats-leaderboard">
          {filtered.map((p) => (
            <Link
              key={p.player}
              href={`/players/${encodeURIComponent(p.player)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="stats-leaderboard-row"
            >
              <div className="stats-leaderboard-rank">#{p.rank}</div>
              <div className="stats-leaderboard-name">{p.player}</div>
              <div className="stats-leaderboard-score">{p.score.toFixed(2)}</div>
              <div className="stats-leaderboard-meta">
                {p.main_completed} main
                {p.verified_count > 0 && ` · ${p.verified_count} verified`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
