import Link from 'next/link';
import type { FbChallenge } from '@/lib/fb-challenges';
import { getYouTubeThumbnail } from '@/lib/youtube';

export default function ChallengeCard({ challenge }: { challenge: FbChallenge }) {
  const getRankClass = (rank: number) => {
    if (rank === 1) return 'top1';
    if (rank === 2) return 'top2';
    if (rank === 3) return 'top3';
    return '';
  };

  // Miniaturka: preferuj jawnie podany thumbnail; jeśli brak — wyciągnij z YT (jeśli video jest); w przeciwnym razie placeholder.
  const displayThumbnail =
    challenge.thumbnail || (challenge.video ? getYouTubeThumbnail(challenge.video) : null);

  // Pokazujemy badge "Brak showcase" tylko gdy nie ma żadnej miniaturki i brak video.
  const noShowcase = !challenge.video && !challenge.thumbnail;

  return (
    <Link href={`/challenges/${challenge.id}`} className="demon-card">
      <div className={`demon-rank ${getRankClass(challenge.rank)}`}>
        #{challenge.rank}
      </div>

      {displayThumbnail ? (
        <img src={displayThumbnail} alt={challenge.name} className="demon-thumbnail" loading="lazy" />
      ) : (
        <div className="demon-thumbnail-placeholder" title={noShowcase ? 'Brak showcase' : ''}>
          {noShowcase ? '∅' : '?'}
        </div>
      )}

      <div className="demon-info">
        <div className="demon-name">{challenge.name}</div>
        <div className="demon-meta">by {challenge.creator}</div>
      </div>

      <div className="demon-victors-count" style={{ color: noShowcase ? 'var(--text-dim)' : 'var(--text-muted)' }}>
        {noShowcase ? 'brak showcase' : '—'}
      </div>
    </Link>
  );
}