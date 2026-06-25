'use client';

import { useEffect, useState } from 'react';
import type { FbChallenge } from '@/lib/fb-challenges';
import ChallengeCard from './ChallengeCard';

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<FbChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const res = await fetch('/api/fb-challenges');
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

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Ładowanie listy...</div>;
  if (error) return <div style={{ color: 'var(--accent)', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  if (challenges.length === 0) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Lista jest jeszcze pusta.</div>;

  return (
    <div className="demon-list">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}