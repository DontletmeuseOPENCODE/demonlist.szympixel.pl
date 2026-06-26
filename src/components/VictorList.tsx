'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Victor } from '@/lib/yaml';
import EditVictorForm from '@/components/admin/EditVictorForm';

interface Props {
  victors: Victor[];
  demonId?: number;
  isAdmin?: boolean;
}

export default function VictorList({ victors, demonId, isAdmin }: Props) {
  const actualVictors = (victors || []).filter(v => !v.isVerifier);
  const [editingVictor, setEditingVictor] = useState<Victor | null>(null);

  if (actualVictors.length === 0) {
    return <div className="no-victors">Brak udokumentowanych ukończeń dla tego poziomu.</div>;
  }

  // Sortowanie po dacie (najstarsze pierwsze, czyli najszybsi victorzy)
  const sortedVictors = [...actualVictors].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <div className="victors-list">
        {sortedVictors.map((v, i) => (
          <div key={i} className="victor-item">
            <div className="victor-position">#{i + 1}</div>
            <div className="victor-name">
              <Link
                href={`/players/${encodeURIComponent(v.player)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="victor-name-link"
              >
                {v.player}
              </Link>
              {typeof v.progress === 'number' && (
                <span
                  className="victor-progress-badge"
                  title={`Progress: ${v.progress}%`}
                >
                  {v.progress}%
                </span>
              )}
            </div>
            {v.link && (
              <a href={v.link} target="_blank" rel="noopener noreferrer" className="victor-link">
                Dowód wideo
              </a>
            )}
            <div className="victor-date">{new Date(v.date).toLocaleDateString('pl-PL')}</div>
            {isAdmin && demonId !== undefined && (
              <button
                className="victor-edit-btn"
                onClick={() => setEditingVictor(v)}
                title="Edytuj victora"
              >
                Edytuj
              </button>
            )}
          </div>
        ))}
      </div>

      {editingVictor && demonId !== undefined && (
        <EditVictorForm
          demonId={demonId}
          victor={editingVictor}
          onClose={() => setEditingVictor(null)}
        />
      )}
    </>
  );
}