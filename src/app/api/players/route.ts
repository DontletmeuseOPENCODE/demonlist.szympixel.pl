import { NextResponse } from 'next/server';
import { listAllPlayers } from '@/lib/players';

export async function GET() {
  try {
    const players = listAllPlayers();
    return NextResponse.json(players);
  } catch {
    return NextResponse.json({ error: 'Błąd odczytu' }, { status: 500 });
  }
}