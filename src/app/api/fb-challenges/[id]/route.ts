import { NextResponse } from 'next/server';
import { getFbChallengeById, updateFbChallenge, deleteFbChallenge } from '@/lib/fb-challenges';
import { getYouTubeThumbnail } from '@/lib/youtube';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const challenge = getFbChallengeById(Number(id));
  if (!challenge) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  return NextResponse.json(challenge);
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Jeżeli thumbnail pusty i mamy video — auto-generuj miniaturkę
    if ((body.thumbnail === '' || !body.thumbnail) && (body.video || getFbChallengeById(Number(id))?.video)) {
      const videoUrl = body.video || getFbChallengeById(Number(id))?.video || '';
      if (videoUrl) {
        body.thumbnail = getYouTubeThumbnail(videoUrl) || '';
      }
    }

    const updated = updateFbChallenge(Number(id), body);
    if (!updated) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ok = deleteFbChallenge(Number(id));
  if (!ok) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  return NextResponse.json({ ok: true });
}