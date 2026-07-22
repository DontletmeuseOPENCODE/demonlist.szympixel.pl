import { getEffectiveStats } from '@/lib/stats';
import PlayerProfile from '@/components/PlayerProfile';
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';

interface Params {
  params: Promise<{ name: string }>;
}

export default async function PlayerPage({ params }: Params) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const stats = getEffectiveStats(decoded);
  const session = await getSession();
  // isAdmin do warunkowania drag handle / edit / delete w PlayerProfile
  const isAdmin = !!(session?.isLoggedIn && session.role === 'admin');

  // Zwracamy pusty profil nawet dla gracza bez wpisów — Pointercrate tak robi.
  if (!stats) notFound();

  return <PlayerProfile stats={stats} isAdmin={isAdmin} />;
}
