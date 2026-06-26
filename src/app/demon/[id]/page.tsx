import { getDemonById } from '@/lib/yaml';
import { getNewgroundsSongUrl } from '@/lib/youtube';
import { notFound } from 'next/navigation';
import VictorList from '@/components/VictorList';
import Link from 'next/link';
import { getSession } from '@/lib/session';

interface Params {
  params: Promise<{ id: string }>;
}

export default async function DemonPage({ params }: Params) {
  const { id } = await params;
  const demon = getDemonById(Number(id));

  if (!demon) {
    notFound();
  }

  const session = await getSession();
  const isAdmin = !!(session?.isLoggedIn && session.role === 'admin');

  // Używamy miniatury YT w wyższej jakości, jeśli video to link z youtube
  let hdThumbnail = demon.thumbnail;
  if (hdThumbnail.includes('hqdefault.jpg')) {
    hdThumbnail = hdThumbnail.replace('hqdefault.jpg', 'maxresdefault.jpg');
  }

  const verifier = demon.victors?.find(v => v.isVerifier);
  const actualVictorsCount = demon.victors?.filter(v => !v.isVerifier).length || 0;

  return (
    <div className="demon-detail">
      <Link href="/" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'inline-block', fontSize: '0.9rem' }}>
        ← Powrót do listy
      </Link>
      
      <div className="demon-detail-hero">
        {demon.video ? (
          <iframe 
            className="demon-detail-video"
            src={demon.video.replace('watch?v=', 'embed/')} 
            title={`Video ${demon.name}`} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        ) : (
          <img src={hdThumbnail} alt={demon.name} className="demon-detail-video" />
        )}
      </div>

      <div className="demon-detail-meta">
        <div className="meta-item">
          <span className="meta-label">Ranking</span>
          <span className="meta-value" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>#{demon.rank}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Nazwa</span>
          <span className="meta-value" style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{demon.name}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Twórca</span>
          <span className="meta-value">{demon.creator}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Level ID</span>
          <span className="meta-value">{demon.level_id || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Dodano</span>
          <span className="meta-value">{new Date(demon.added_at).toLocaleDateString('pl-PL')}</span>
        </div>
      </div>

      <div className="demon-detail-meta">
        <div className="meta-item">
          <span className="meta-label">Level Password</span>
          <span className="meta-value">{demon.level_password || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Level Length</span>
          <span className="meta-value">{demon.level_length || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Object Count</span>
          <span className="meta-value">{demon.object_count ? demon.object_count.toLocaleString('pl-PL') : '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">In-Game Difficulty</span>
          <span className="meta-value">{demon.difficulty || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Created In</span>
          <span className="meta-value">{demon.gd_version || '—'}</span>
        </div>
        {(demon.song_url || demon.song_id) && (
          <div className="meta-item">
            <span className="meta-label">Newgrounds Song</span>
            <span className="meta-value">
              <a
                href={demon.song_url || getNewgroundsSongUrl(demon.song_id) || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {demon.song_name || 'Utwór'}
                {demon.song_author && ` by ${demon.song_author}`}
                {demon.song_id && ` (ID ${demon.song_id})`} ↗
              </a>
            </span>
          </div>
        )}
      </div>

      {verifier && (
        <div className="verifier-box" style={{ 
          background: 'rgba(233, 69, 96, 0.08)', 
          border: '1px solid var(--border-accent)', 
          borderRadius: '8px', 
          padding: '1.2rem', 
          marginBottom: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.4rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>Oficjalny Weryfikator</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent)' }}>{verifier.player}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Data weryfikacji: <strong>{new Date(verifier.date).toLocaleDateString('pl-PL')}</strong>
            </span>
          </div>
        </div>
      )}

      <h2 className="section-title">Lista Zwycięzców ({actualVictorsCount})</h2>
      <VictorList victors={demon.victors || []} demonId={demon.id} isAdmin={isAdmin} />
    </div>
  );
}
