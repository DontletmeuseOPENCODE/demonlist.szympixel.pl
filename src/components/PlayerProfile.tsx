import Link from 'next/link';
import type { PlayerStats, CompletedDemonEntry, VerifiedDemonEntry, CreatedDemonEntry } from '@/lib/stats';
import BanPlayerButton from '@/components/BanPlayerButton';

interface Props {
  stats: PlayerStats;
  isAdmin: boolean;
}

function rankClass(rank: number): string {
  if (rank === 1) return 'stats-demon-rank top1';
  if (rank === 2) return 'stats-demon-rank top2';
  if (rank === 3) return 'stats-demon-rank top3';
  return 'stats-demon-rank';
}

function CompletedCard({ d }: { d: CompletedDemonEntry }) {
  return (
    <Link
      href={d.list === 'main' ? `/demon/${d.id}` : `/challenges/${d.id}`}
      className={`stats-demon-card ${d.list === 'main' ? 'main' : 'extended'}`}
    >
      <div className={rankClass(d.rank)}>#{d.rank}</div>
      {d.thumbnail ? (
        <img src={d.thumbnail} alt={d.name} className="stats-demon-thumb" />
      ) : (
        <div className="stats-demon-thumb stats-demon-thumb-placeholder">∅</div>
      )}
      <div className="stats-demon-info">
        <div className="stats-demon-name">
          {d.name}
          {d.list === 'extended' && <span className="stats-list-badge">Extended</span>}
        </div>
        <div className="stats-demon-creator">by {d.creator}</div>
      </div>
      {typeof d.progress === 'number' && (
        <span className="victor-progress-badge" title={`Progress: ${d.progress}%`}>
          {d.progress}%
        </span>
      )}
    </Link>
  );
}

function VerifiedCard({ d }: { d: VerifiedDemonEntry }) {
  return (
    <Link href={`/demon/${d.id}`} className="stats-demon-card main">
      <div className={rankClass(d.rank)}>#{d.rank}</div>
      {d.thumbnail ? (
        <img src={d.thumbnail} alt={d.name} className="stats-demon-thumb" />
      ) : (
        <div className="stats-demon-thumb stats-demon-thumb-placeholder">∅</div>
      )}
      <div className="stats-demon-info">
        <div className="stats-demon-name">{d.name}</div>
        <div className="stats-demon-creator">by {d.creator}</div>
      </div>
    </Link>
  );
}

function CreatedCard({ d }: { d: CreatedDemonEntry }) {
  return (
    <Link
      href={d.list === 'main' ? `/demon/${d.id}` : `/challenges/${d.id}`}
      className={`stats-demon-card ${d.list === 'main' ? 'main' : 'extended'}`}
    >
      <div className={rankClass(d.rank)}>#{d.rank}</div>
      {d.thumbnail ? (
        <img src={d.thumbnail} alt={d.name} className="stats-demon-thumb" />
      ) : (
        <div className="stats-demon-thumb stats-demon-thumb-placeholder">∅</div>
      )}
      <div className="stats-demon-info">
        <div className="stats-demon-name">
          {d.name}
          {d.list === 'extended' && <span className="stats-list-badge">Extended</span>}
        </div>
        <div className="stats-demon-creator">
          {d.list === 'main' ? 'Main list' : 'Extended list'}
        </div>
      </div>
    </Link>
  );
}

export default function PlayerProfile({ stats, isAdmin }: Props) {
  const leaderboardPos = stats.score > 0 ? 'Active' : '—';
  return (
    <div className="stats-page">
      <Link href="/stats" className="stats-back">← Powrót do Stats</Link>

      <div className="stats-header">
        <h1 className="stats-player-name">{stats.player}</h1>
        {isAdmin && (
          <>
            <span className="stats-admin-badge">admin mode</span>
            <BanPlayerButton player={stats.player} />
          </>
        )}
      </div>

      <div className="stats-metrics">
        <div className="stats-metric">
          <div className="stats-metric-label">Demonlist rank</div>
          <div className="stats-metric-value">{leaderboardPos}</div>
        </div>
        <div className="stats-metric">
          <div className="stats-metric-label">Demonlist score</div>
          <div className="stats-metric-value">{stats.score.toFixed(2)}</div>
        </div>
        <div className="stats-metric">
          <div className="stats-metric-label">Demonlist stats</div>
          <div className="stats-metric-value stats-metric-small">
            {stats.main_completed} Main
            {stats.verified_count > 0 && `, ${stats.verified_count} Verified`}
          </div>
        </div>
        <div className="stats-metric">
          <div className="stats-metric-label">Hardest demon</div>
          <div className="stats-metric-value stats-metric-small">
            {stats.hardest_demon
              ? `${stats.hardest_demon.name} (#${stats.hardest_demon.rank})`
              : 'Brak'}
          </div>
        </div>
      </div>

      <section className="stats-section">
        <h2 className="stats-section-title">Demons completed ({stats.demons_completed.length})</h2>
        {stats.demons_completed.length === 0 ? (
          <div className="stats-empty">Brak udokumentowanych ukończeń</div>
        ) : (
          <div className="stats-demon-list">
            {stats.demons_completed.map((d) => (
              <CompletedCard key={`${d.list}-${d.id}`} d={d} />
            ))}
          </div>
        )}
      </section>

      <section className="stats-section">
        <h2 className="stats-section-title">Demons verified ({stats.demons_verified.length})</h2>
        {stats.demons_verified.length === 0 ? (
          <div className="stats-empty">Nie zweryfikował żadnego demona</div>
        ) : (
          <div className="stats-demon-list">
            {stats.demons_verified.map((d) => (
              <VerifiedCard key={`v-${d.id}`} d={d} />
            ))}
          </div>
        )}
      </section>

      <section className="stats-section">
        <h2 className="stats-section-title">Demons created ({stats.demons_created.length})</h2>
        {stats.demons_created.length === 0 ? (
          <div className="stats-empty">Nie stworzył żadnego demona</div>
        ) : (
          <div className="stats-demon-list">
            {stats.demons_created.map((d) => (
              <CreatedCard key={`c-${d.list}-${d.id}`} d={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
