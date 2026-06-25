import { NextResponse } from 'next/server';
import { getChallengeById, updateChallenge, deleteChallenge } from '@/lib/yaml';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const challenge = getChallengeById(Number(id));
  if (!challenge) {
    return NextResponse.json({ error: 'Nie znaleziono challenge' }, { status: 404 });
  }
  return NextResponse.json(challenge);
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateChallenge(Number(id), body);
    if (!updated) {
      return NextResponse.json({ error: 'Nie znaleziono challenge' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Błąd aktualizacji' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const success = deleteChallenge(Number(id));
  if (!success) {
    return NextResponse.json({ error: 'Nie znaleziono challenge' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
