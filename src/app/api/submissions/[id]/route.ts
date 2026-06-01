import { NextResponse } from 'next/server';
import { getSubmissionById, deleteSubmission, readSubmissions, writeSubmissions } from '@/lib/yaml';
import { getYouTubeThumbnail } from '@/lib/youtube';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const submissions = readSubmissions();
    const idx = submissions.findIndex((s) => s.id === Number(id));
    if (idx === -1) {
      return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
    }

    // Merge updates into submission
    submissions[idx] = { ...submissions[idx], ...body };
    
    // Auto-generate thumbnail if needed
    if (submissions[idx].thumbnail === '' || !submissions[idx].thumbnail) {
      if (submissions[idx].video) {
        submissions[idx].thumbnail = getYouTubeThumbnail(submissions[idx].video) || '';
      }
    }

    writeSubmissions(submissions);
    return NextResponse.json(submissions[idx]);
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ok = deleteSubmission(Number(id));
    if (!ok) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Błąd usuwania' }, { status: 500 });
  }
}
