'use client';

import type { Victor } from '@/lib/yaml';

export default function VictorList({ victors }: { victors: Victor[] }) {
  const actualVictors = (victors || []).filter(v => !v.isVerifier);

  if (actualVictors.length === 0) {
    return <div className="no-victors">Brak udokumentowanych ukończeń dla tego poziomu.</div>;
  }

  // Sortowanie po dacie (najstarsze pierwsze, czyli najszybsi victorzy)
  const sortedVictors = [...actualVictors].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="victors-list">
      {sortedVictors.map((v, i) => (
        <div key={i} className="victor-item">
          <div className="victor-position">#{i + 1}</div>
          <div className="victor-name">
            {v.player}
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
        </div>
      ))}
    </div>
  );
}
