import { NextResponse } from 'next/server';
import { getVictorSubmissionById, updateVictorSubmissionStatus } from '@/lib/victor-submissions';
import { addVictor, getDemonById } from '@/lib/yaml';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Atomowe zatwierdzenie zgłoszenia victora:
 * 1) dopisuje victora do Demon.victors[] w data/demons.yml
 * 2) zmienia status zgłoszenia na 'approved'
 *
 * Wywoływane z panelu admina/modera.
 */
export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const subId = Number(id);

    const sub = getVictorSubmissionById(subId);
    if (!sub) {
      return NextResponse.json({ error: 'Nie znaleziono zgłoszenia' }, { status: 404 });
    }
    if (sub.status === 'approved') {
      return NextResponse.json({ error: 'To zgłoszenie jest już zatwierdzone' }, { status: 400 });
    }

    const demon = getDemonById(sub.demon_id);
    if (!demon) {
      return NextResponse.json({ error: 'Poziom nie istnieje' }, { status: 404 });
    }

    addVictor(sub.demon_id, {
      player: sub.player,
      link: sub.video,
      date: sub.submitted_at,
      isVerifier: false,
      progress: sub.progress,
    });

    const updated = updateVictorSubmissionStatus(subId, 'approved');
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}