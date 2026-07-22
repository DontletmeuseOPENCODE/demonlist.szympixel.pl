'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Demon } from '@/lib/yaml';

interface Props {
  player: string;
  initial: {
    main_completed?: number;
    verified_count?: number;
    created_count?: number;
    score?: number;
    hardest_demon_id?: number | null;
  };
  demons: Demon[];
  onClose: () => void;
}

/**
 * Modal edycji nadpisań statystyk gracza.
 * Checkbox przy każdym polu = czy pole jest nadpisane (checkbox odznaczony = wraca do obliczania).
 */
export default function EditStatsOverrideForm({ player, initial, demons, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Stan: czy pole jest aktywne (nadpisane) + jego wartość
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    main_completed: initial.main_completed !== undefined,
    verified_count: initial.verified_count !== undefined,
    created_count: initial.created_count !== undefined,
    score: initial.score !== undefined,
    hardest_demon_id: initial.hardest_demon_id !== undefined,
  });
  const [values, setValues] = useState({
    main_completed: initial.main_completed ?? 0,
    verified_count: initial.verified_count ?? 0,
    created_count: initial.created_count ?? 0,
    score: initial.score ?? 0,
    hardest_demon_id: initial.hardest_demon_id ?? undefined as number | undefined | null,
  });

  const handleChange = (field: keyof typeof values, raw: string) => {
    if (field === 'hardest_demon_id') {
      // 'none' → null, liczba → number, puste → undefined
      if (raw === 'none') setValues({ ...values, hardest_demon_id: null });
      else if (raw === '') setValues({ ...values, hardest_demon_id: undefined });
      else setValues({ ...values, hardest_demon_id: Number(raw) });
    } else {
      setValues({ ...values, [field]: Number(raw) });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Buduj body: tylko włączone pola
    const fields: Record<string, unknown> = {};
    if (enabled.main_completed) fields.main_completed = values.main_completed;
    if (enabled.verified_count) fields.verified_count = values.verified_count;
    if (enabled.created_count) fields.created_count = values.created_count;
    if (enabled.score) fields.score = values.score;
    if (enabled.hardest_demon_id) fields.hardest_demon_id = values.hardest_demon_id;

    try {
      const res = await fetch('/api/stats/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player, fields }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Wystąpił błąd');
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(`Usunąć wszystkie nadpisania dla gracza "${player}"?`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/stats/override/${encodeURIComponent(player)}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 404) {
        const data = await res.json();
        throw new Error(data.error || 'Wystąpił błąd');
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2 className="modal-title">Edytuj statystyki: {player}</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          Zaznacz checkbox, aby ręcznie nadpisać pole. Odznaczone pola wracają do wartości obliczanych z demonów.
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <FieldRow
            label="Main completed"
            enabled={enabled.main_completed}
            onToggle={(v) => setEnabled({ ...enabled, main_completed: v })}
            input={
              <input
                type="number"
                min="0"
                max="200"
                value={values.main_completed}
                onChange={(e) => handleChange('main_completed', e.target.value)}
                disabled={!enabled.main_completed}
              />
            }
          />
          <FieldRow
            label="Verified count"
            enabled={enabled.verified_count}
            onToggle={(v) => setEnabled({ ...enabled, verified_count: v })}
            input={
              <input
                type="number"
                min="0"
                max="50"
                value={values.verified_count}
                onChange={(e) => handleChange('verified_count', e.target.value)}
                disabled={!enabled.verified_count}
              />
            }
          />
          <FieldRow
            label="Created count"
            enabled={enabled.created_count}
            onToggle={(v) => setEnabled({ ...enabled, created_count: v })}
            input={
              <input
                type="number"
                min="0"
                max="50"
                value={values.created_count}
                onChange={(e) => handleChange('created_count', e.target.value)}
                disabled={!enabled.created_count}
              />
            }
          />
          <FieldRow
            label="Score (0-1000)"
            enabled={enabled.score}
            onToggle={(v) => setEnabled({ ...enabled, score: v })}
            input={
              <input
                type="number"
                min="0"
                max="1000"
                step="0.01"
                value={values.score}
                onChange={(e) => handleChange('score', e.target.value)}
                disabled={!enabled.score}
              />
            }
          />
          <FieldRow
            label="Hardest demon"
            enabled={enabled.hardest_demon_id}
            onToggle={(v) => setEnabled({ ...enabled, hardest_demon_id: v })}
            input={
              <select
                value={
                  values.hardest_demon_id === null
                    ? 'none'
                    : values.hardest_demon_id === undefined
                    ? ''
                    : String(values.hardest_demon_id)
                }
                onChange={(e) => handleChange('hardest_demon_id', e.target.value)}
                disabled={!enabled.hardest_demon_id}
              >
                <option value="">— wybierz —</option>
                <option value="none">Brak</option>
                {demons.map((d) => (
                  <option key={d.id} value={d.id}>
                    #{d.rank} · {d.name}
                  </option>
                ))}
              </select>
            }
          />

          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={handleReset} disabled={loading} style={{ marginRight: 'auto' }}>
              Reset tego gracza
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldRow({ label, enabled, onToggle, input }: { label: string; enabled: boolean; onToggle: (v: boolean) => void; input: React.ReactNode }) {
  return (
    <div className="form-group" style={{ opacity: enabled ? 1 : 0.55 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          style={{ width: 'auto', cursor: 'pointer' }}
        />
        <span style={{ fontWeight: 600 }}>{label}</span>
        {enabled && <span className="stats-override-badge override">override</span>}
      </label>
      {input}
    </div>
  );
}