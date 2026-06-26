import { NextResponse } from 'next/server';
import { deleteVictor, updateVictor } from '@/lib/yaml';

interface Params {
  params: Promise<{ player: string }>;
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { player } = await params;
    const { demon_id } = await request.json();

    if (!demon_id) {
      return NextResponse.json({ error: 'Brakuje demon_id' }, { status: 400 });
    }

    const updated = deleteVictor(Number(demon_id), decodeURIComponent(player));
    if (!updated) {
      return NextResponse.json({ error: 'Nie znaleziono demona' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}

/**
 * PATCH /api/victors/[player]
 * Body: { demon_id, link?, date?, isVerifier?, progress? | progress: null }
 * Aktualizuje istniejącego victora. Wymaga admina lub moderatora (POST ma takie same wymogi).
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { player } = await params;
    const body = await request.json();
    const { demon_id, link, date, isVerifier, progress } = body;

    if (!demon_id) {
      return NextResponse.json({ error: 'Brakuje demon_id' }, { status: 400 });
    }

    // Walidacja progress 80-100 lub null (czyszczenie)
    let progressUpdate: number | null | undefined = undefined;
    if (progress === null) {
      progressUpdate = null;
    } else if (progress !== undefined && progress !== '') {
      const num = Number(progress);
      if (!Number.isFinite(num) || num < 80 || num > 100) {
        return NextResponse.json({ error: 'Progress musi być liczbą od 80 do 100' }, { status: 400 });
      }
      progressUpdate = num;
    }

    const result = updateVictor(
      Number(demon_id),
      decodeURIComponent(player),
      {
        link,
        date,
        isVerifier,
        progress: progressUpdate,
      }
    );

    if (!result) {
      return NextResponse.json({ error: 'Nie znaleziono victora' }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}