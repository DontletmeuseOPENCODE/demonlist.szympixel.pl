import { getFbChallengeById } from '@/lib/fb-challenges';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ChallengePage({ params }: Params) {
  const { id } = await params;
  const challenge = getFbChallengeById(Number(id));

  if (!challenge) {
    notFound();
  }

  // Jeśli mamy thumbnail z YT w niższej jakości — spróbuj wyciągnąć HD.
  let hdThumbnail = challenge.thumbnail;
  if (hdThumbnail && hdThumbnail.includes('hqdefault.jpg')) {
    hdThumbnail = hdThumbnail.replace('hqdefault.jpg', 'maxresdefault.jpg');
  }

  const hasShowcase = Boolean(challenge.video);

  return (
    <div className="demon-detail">
      <Link href="/challenges" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'inline-block', fontSize: '0.9rem' }}>
        ← Powrót do listy FB Challenges
      </Link>

      <div className="demon-detail-hero">
        {hasShowcase ? (
          <iframe
            className="demon-detail-video"
            src={challenge.video.replace('watch?v=', 'embed/')}
            title={`Video ${challenge.name}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : hdThumbnail ? (
          <img src={hdThumbnail} alt={challenge.name} className="demon-detail-video" />
        ) : (
          <div
            className="demon-detail-video"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-dim)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.4rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Brak showcase
          </div>
        )}
      </div>

      {!hasShowcase && (
        <div
          style={{
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            marginBottom: '2rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          ⚠ Ten challenge nie ma showcase&apos;u — brak wideo potwierdzającego ukończenie.
        </div>
      )}

      <div className="demon-detail-meta">
        <div className="meta-item">
          <span className="meta-label">Ranking</span>
          <span className="meta-value" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>#{challenge.rank}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Nazwa</span>
          <span className="meta-value" style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{challenge.name}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Twórca</span>
          <span className="meta-value">{challenge.creator}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Level ID</span>
          <span className="meta-value">{challenge.level_id || 'N/A'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Dodano</span>
          <span className="meta-value">{new Date(challenge.added_at).toLocaleDateString('pl-PL')}</span>
        </div>
      </div>
    </div>
  );
}