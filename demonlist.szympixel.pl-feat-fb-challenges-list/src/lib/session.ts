import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  username: string;
  role: 'admin' | 'moderator';
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'demonlist_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 dni
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}
