'use client';

import { useEffect, useState } from 'react';
import type { Challenge } from '@/lib/yaml';
import Link from 'next/link';

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const res = await fetch('/api/challenges');
        if (!res.ok) throw new Error('Błąd pobierania danych');
        const data = await res.json();
        setChallenges(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  if (loading) return <div className="challenge-loading">Ładowanie listy challenge'ów...</div>;
  if (error) return <div className="challenge-error">{error}</div>;

  const filtered = challenges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.creator.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="challenge-list-wrapper">
      <div className="challenge-search-wrapper">
        <input
          type="text"
          className="challenge-search"
          placeholder="Szukaj challenge'a po nazwie lub twórcy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="challenge-table-wrap">
        <table className="challenge-table">
          <thead>
            <tr>
              <th className="challenge-th-rank">#</th>
              <th className="challenge-th-name">Nazwa</th>
              <th className="challenge-th-creator">Twórca</th>
              <th className="challenge-th-victors">Victorzy</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((challenge) => {
              const actualVictors = challenge.victors?.filter(v => !v.isVerifier).length || 0;
              return (
                <tr key={challenge.id} className="challenge-row">
                  <td className="challenge-cell-rank">
                    <span className={`challenge-rank ${challenge.rank <= 3 ? 'top' + challenge.rank : ''}`}>
                      {challenge.rank}
                    </span>
                  </td>
                  <td className="challenge-cell-name">
                    <Link href={`/challenge/${challenge.id}`} className="challenge-link">
                      {challenge.name}
                    </Link>
                  </td>
                  <td className="challenge-cell-creator">{challenge.creator}</td>
                  <td className="challenge-cell-victors">{actualVictors}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="challenge-no-results">
                  {search ? 'Brak wyników dla tego wyszukiwania.' : 'Lista jest jeszcze pusta.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
