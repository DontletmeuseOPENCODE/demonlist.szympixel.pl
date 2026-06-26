'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  player: string;
}

/**
 * Admin-only "Zbanuj gracza" — usuwa WSZYSTKIE wpisy victora
 * ze wszystkich demonów + czyści ręczne nadpisania statystyk.
 * Dwuetapowy confirm z przepisaniem nicku, żeby nie zbanować kogoś przypadkiem.
 */
export default function BanPlayerButton({ player }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const matches = confirmName.trim().toLowerCase() === player.toLowerCase();

  const handleBan = async () => {
    if (!matches) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/players/${encodeURIComponent(player)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Błąd banowania');
      }
      // Przekieruj na leaderboard po banie
      router.replace('/stats');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="btn-danger"
        onClick={() => setOpen(true)}
        style={{ marginLeft: '0.75rem' }}
      >
        Zbanuj gracza
      </button>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !loading) setOpen(false); }}>
      <div className="modal" style={{ maxWidth: '440px' }}>
        <h2 className="modal-title">Zbanuj gracza</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Ta akcja usunie <strong style={{ color: 'var(--text-primary)' }}>wszystkie</strong> wpisy
          victora (completed + verified) dla gracza <strong style={{ color: 'var(--accent)' }}>{player}</strong>
          {' '}ze wszystkich demonów oraz wyczyści ewentualne ręczne nadpisania statystyk.
          Nie da się tego cofnąć (trzeba ręcznie przywrócić wpisy w <code>demons.yml</code>).
        </p>
        {error && <div className="login-error">{error}</div>}
        <div className="form-group">
          <label>Wpisz nick "{player}", aby potwierdzić:</label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={player}
            disabled={loading}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)} disabled={loading}>
            Anuluj
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleBan}
            disabled={loading || !matches}
            title={!matches ? 'Nick musi się zgadzać' : ''}
          >
            {loading ? 'Banowanie…' : 'Zbanuj na zawsze'}
          </button>
        </div>
      </div>
    </div>
  );
}