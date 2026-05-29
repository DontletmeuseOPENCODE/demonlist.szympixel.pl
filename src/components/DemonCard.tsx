import Link from 'next/link';
import type { Demon } from '@/lib/yaml';

export default function DemonCard({ demon }: { demon: Demon }) {
  const getRankClass = (rank: number) => {
    if (rank === 1) return 'top1';
    if (rank <= 3) return 'top3';
    if (rank <= 10) return 'top10';
    return '';
  };

  return (
    <Link href={`/demon/${demon.id}`} className="demon-card">
      <div className={`demon-rank ${getRankClass(demon.rank)}`}>
        #{demon.rank}
      </div>
      
      {demon.thumbnail ? (
        <img src={demon.thumbnail} alt={demon.name} className="demon-thumbnail" loading="lazy" />
      ) : (
        <div className="demon-thumbnail-placeholder">?</div>
      )}

      <div className="demon-info">
        <div className="demon-name">{demon.name}</div>
        <div className="demon-meta">by {demon.creator}</div>
      </div>

      <div className="demon-victors-count">
        {demon.victors.length} {demon.victors.length === 1 ? 'victor' : 'victors'}
      </div>
    </Link>
  );
}
