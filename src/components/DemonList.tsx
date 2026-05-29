'use client';

import { useEffect, useState } from 'react';
import type { Demon } from '@/lib/yaml';
import DemonCard from './DemonCard';

export default function DemonList() {
  const [demons, setDemons] = useState<Demon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDemons() {
      try {
        const res = await fetch('/api/demons');
        if (!res.ok) throw new Error('Błąd pobierania danych');
        const data = await res.json();
        setDemons(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDemons();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Ładowanie rankingu...</div>;
  if (error) return <div style={{ color: 'var(--accent)', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  if (demons.length === 0) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Lista jest jeszcze pusta.</div>;

  return (
    <div className="demon-list">
      {demons.map((demon) => (
        <DemonCard key={demon.id} demon={demon} />
      ))}
    </div>
  );
}
