import { NextResponse } from 'next/server';
import { readDemons } from '@/lib/yaml';
import { getYouTubeId } from '@/lib/youtube';
import {
  readVictorSubmissions,
  addVictorSubmission,
} from '@/lib/victor-submissions';

export async function GET() {
  try {
    const subs = readVictorSubmissions();
    return NextResponse.json(subs);
  } catch {
    return NextResponse.json({ error: 'Błąd odczytu danych' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { demon_id, player, progress, video, raw_footage, notes } = body;

    // Walidacja wymaganych pól
    if (!demon_id || !player || progress === undefined || !video || !raw_footage) {
      return NextResponse.json(
        { error: 'Brakuje wymaganych pól: demon_id, player, progress, video, raw_footage' },
        { status: 400 }
      );
    }

    // Demon musi istnieć w MAIN liście (nie FB Challenge)
    const demon = readDemons().find((d) => d.id === Number(demon_id));
    if (!demon) {
      return NextResponse.json(
        { error: 'Ten poziom nie jest z main listy' },
        { status: 400 }
      );
    }

    // Progress 80..100
    const progressNum = Number(progress);
    if (!Number.isFinite(progressNum) || progressNum < 80 || progressNum > 100) {
      return NextResponse.json(
        { error: 'Progress musi być liczbą od 80 do 100' },
        { status: 400 }
      );
    }

    // YouTube
    if (!getYouTubeId(video)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy link YouTube' },
        { status: 400 }
      );
    }

    // Raw footage URL
    try {
      new URL(raw_footage);
    } catch {
      return NextResponse.json(
        { error: 'Nieprawidłowy link raw_footage' },
        { status: 400 }
      );
    }

    const newSub = addVictorSubmission({
      demon_id: Number(demon_id),
      player: String(player).trim(),
      progress: progressNum,
      video: String(video),
      raw_footage: String(raw_footage),
      notes: notes ? String(notes).trim() : '',
      submitted_at: new Date().toISOString().split('T')[0],
      status: 'pending',
    });

    return NextResponse.json(newSub, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu danych' }, { status: 500 });
  }
}