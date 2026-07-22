import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { clearAllStatsOverrides } from '@/lib/stats-overrides';

/**
 * POST /api/stats/recompute
 * Czyści wszystkie nadpisania statystyk — wraca do wartości obliczanych.
 * Wymaga admina.
 */
export async function POST() {
  try {
    clearAllStatsOverrides();
    revalidatePath('/stats');
    revalidatePath('/players/[name]', 'page');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}