import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { setStatsOverride } from '@/lib/stats-overrides';

/**
 * POST /api/stats/override
 * Body: { player: string, fields: Partial<StatsOverride> }
 * Wymaga admina.
 */
export async function POST(request: Request) {
  try {
    const { player, fields } = await request.json();

    if (!player || typeof player !== 'string') {
      return NextResponse.json({ error: 'Brakuje player' }, { status: 400 });
    }
    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ error: 'Brakuje fields' }, { status: 400 });
    }

    // Walidacja typów
    const numKeys = ['main_completed', 'verified_count', 'created_count', 'score'] as const;
    for (const k of numKeys) {
      const v = (fields as any)[k];
      if (v !== undefined && v !== null && (typeof v !== 'number' || !Number.isFinite(v))) {
        return NextResponse.json({ error: `Pole ${k} musi być liczbą` }, { status: 400 });
      }
    }
    const idVal = (fields as any).hardest_demon_id;
    if (idVal !== undefined && idVal !== null && typeof idVal !== 'number') {
      return NextResponse.json({ error: 'hardest_demon_id musi być liczbą lub null' }, { status: 400 });
    }

    const next = setStatsOverride(player, fields);
    revalidatePath('/stats');
    revalidatePath(`/players/${encodeURIComponent(player)}`);
    return NextResponse.json(next, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}