import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth';

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Błąd odczytu danych' }, { status: 500 });
  }
}
