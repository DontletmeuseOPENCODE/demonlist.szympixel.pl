import Link from 'next/link';
import type { Demon } from '@/lib/yaml';
import { getYouTubeThumbnail } from '@/lib/youtube';

export default function DemonCard({ demon }: { demon: Demon }) {
  const getRankClass = (rank: number) => {
    if (rank === 1) return 'top1';
    if (rank <= 3) return 'top3';
    if (rank <= 10) return 'top10';
    return '';
  };

  const displayThumbnail = demon.thumbnail || (demon.video ? getYouTubeThumbnail(demon.video) : null);

  return (
    <Link href={`/demon/${demon.id}`} className="demon-card">
      <div className={`demon-rank ${getRankClass(demon.rank)}`}>
        #{demon.rank}
      </div>
      
      {displayThumbnail ? (
        <img src={displayThumbnail} alt={demon.name} className="demon-thumbnail" loading="lazy" />
      ) : (
        <div className="demon-thumbnail-placeholder">?</div>
      )}

      <div className="demon-info">
        <div className="demon-name">{demon.name}</div>
        <div className="demon-meta">by {demon.creator}</div>
      </div>

      <div className="demon-victors-count">
        {(demon.victors?.length ?? 0)} {(demon.victors?.length ?? 0) === 1 ? 'victor' : 'victors'}
      </div>
    </Link>
  );
}
