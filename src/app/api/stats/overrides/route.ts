import { NextResponse } from 'next/server';
import { getDemonlistLeaderboard } from '@/lib/stats';
import { readStatsOverrides } from '@/lib/stats-overrides';
import { readDemons } from '@/lib/yaml';

/**
 * GET /api/stats/overrides
 * Zwraca leaderboard + overrides + listę demonów (do dropdownu w modalu).
 * Wymaga zalogowania (dowolna rola).
 */
export async function GET() {
  try {
    const players = getDemonlistLeaderboard();
    const overrides = readStatsOverrides();
    const demons = readDemons();
    return NextResponse.json({ players, overrides, demons });
  } catch {
    return NextResponse.json({ error: 'Błąd odczytu' }, { status: 500 });
  }
}
