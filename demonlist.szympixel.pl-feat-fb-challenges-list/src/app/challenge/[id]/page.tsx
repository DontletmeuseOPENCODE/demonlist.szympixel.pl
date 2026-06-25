import { getChallengeById } from '@/lib/yaml';
import { notFound } from 'next/navigation';
import VictorList from '@/components/VictorList';
import Link from 'next/link';

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ChallengePage({ params }: Params) {
  const { id } = await params;
  const challenge = getChallengeById(Number(id));

  if (!challenge) {
    notFound();
  }

  const verifier = challenge.victors?.find(v => v.isVerifier);
  const actualVictorsCount = challenge.victors?.filter(v => !v.isVerifier).length || 0;

  return (
    <div className="challenge-detail">
      <Link href="/challenges" className="challenge-back-link">
        ← Powrót do listy challenge'ów
      </Link>

      <div className="challenge-info-panel">
        <div className="challenge-info-rank">#{challenge.rank}</div>
        <div className="challenge-info-main">
          <h1 className="challenge-info-name">{challenge.name}</h1>
          <p className="challenge-info-creator">by {challenge.creator}</p>
        </div>
      </div>

      <div className="challenge-detail-meta">
        <div className="meta-item">
          <span className="meta-label">Ranking</span>
          <span className="meta-value" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>#{challenge.rank}</span>
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
      <VictorList victors={challenge.victors || []} />
    </div>
  );
}
