import { getDemonlistLeaderboard } from '@/lib/stats';
import StatsLeaderboard from '@/components/StatsLeaderboard';

export default function StatsPage() {
  const leaderboard = getDemonlistLeaderboard();
  return <StatsLeaderboard players={leaderboard} />;
}
