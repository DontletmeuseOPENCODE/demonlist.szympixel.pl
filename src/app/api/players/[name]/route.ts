import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { banPlayer } from '@/lib/yaml';
import { clearStatsOverride } from '@/lib/stats-overrides';

interface Params {
  params: Promise<{ name: string }>;
}

/**
 * DELETE /api/players/[name]
 * Ban gracza — usuwa wszystkie jego wpisy victora ze wszystkich demonów
 * i czyści ewentualne ręczne nadpisania statystyk.
 * Wymaga roli admin (moderator dostaje 403 przez middleware).
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { name } = await params;
    const playerName = decodeURIComponent(name);
    if (!playerName.trim()) {
      return NextResponse.json({ error: 'Brak nazwy gracza' }, { status: 400 });
    }

    const removed = banPlayer(playerName);
    const clearedOverride = clearStatsOverride(playerName);

    // Rewaliduj kluczowe ścieżki — ranking/leaderboard i profil
    revalidatePath('/stats');
    revalidatePath('/');
    revalidatePath(`/players/${encodeURIComponent(playerName)}`);
    // Profile wszystkich demonów (usuwane wpisy są na stronach /demon/[id])
    revalidatePath('/demon', 'page');

    return NextResponse.json({
      ok: true,
      removed_victors: removed,
      cleared_override: clearedOverride,
    });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}