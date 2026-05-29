import { getDemonById } from '@/lib/yaml';
import { notFound } from 'next/navigation';
import VictorList from '@/components/VictorList';
import Link from 'next/link';

interface Params {
  params: Promise<{ id: string }>;
}

export default async function DemonPage({ params }: Params) {
  const { id } = await params;
  const demon = getDemonById(Number(id));

  if (!demon) {
    notFound();
  }

  // Używamy miniatury YT w wyższej jakości, jeśli video to link z youtube
  let hdThumbnail = demon.thumbnail;
  if (hdThumbnail.includes('hqdefault.jpg')) {
    hdThumbnail = hdThumbnail.replace('hqdefault.jpg', 'maxresdefault.jpg');
  }

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
          <span className="meta-value">{demon.level_id || 'N/A'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Dodano</span>
          <span className="meta-value">{new Date(demon.added_at).toLocaleDateString('pl-PL')}</span>
        </div>
      </div>

      <h2 className="section-title">Lista Zwycięzców ({demon.victors?.length || 0})</h2>
      <VictorList victors={demon.victors || []} />
    </div>
  );
}
