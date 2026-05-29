import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Brakuje danych logowania' }, { status: 400 });
    }

    const user = await verifyCredentials(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Nieprawidłowy login lub hasło' }, { status: 401 });
    }

    const session = await getSession();
    session.username = user.username;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true, role: user.role });
  } catch {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
