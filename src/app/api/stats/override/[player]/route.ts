import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { clearStatsOverride } from '@/lib/stats-overrides';

interface Params {
  params: Promise<{ player: string }>;
}

/**
 * DELETE /api/stats/override/[player]
 * Usuwa override dla gracza. Wymaga admina.
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { player } = await params;
    const decoded = decodeURIComponent(player);
    const ok = clearStatsOverride(decoded);
    if (!ok) {
      return NextResponse.json({ error: 'Nie znaleziono override dla tego gracza' }, { status: 404 });
    }
    revalidatePath('/stats');
    revalidatePath(`/players/${encodeURIComponent(decoded)}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}