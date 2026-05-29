import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface User {
  username: string;
  password_hash: string;
  role: 'admin' | 'moderator';
}

function getUsers(): User[] {
  const filePath = path.join(process.cwd(), 'config', 'users.yml');
  const raw = fs.readFileSync(filePath, 'utf8');
  return yaml.load(raw) as User[];
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<User | null> {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function getAllUsers(): Omit<User, 'password_hash'>[] {
  return getUsers().map(({ username, role }) => ({ username, role }));
}
