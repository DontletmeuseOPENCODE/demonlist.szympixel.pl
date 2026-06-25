<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Project Conventions — szympixel demonlist

## Czym jest ten projekt
Prywatna lista najtrudniejszych demonów z Geometry Dash (inspiracja Pointercrate). Stack: **Next.js 16 (App Router) + React 19 + TypeScript + YAML-as-DB + iron-session**. Brak prawdziwej bazy danych — wszystko leży w plikach YAML.

## Struktura danych
- `data/demons.yml` — lista demonów (id, rank, name, creator, level_id, video, thumbnail, added_at, victors[]).
- `data/fb-challenges.yml` — osobna lista FB Challenges (te same pola co Demon, ale **bez victors**; `video` opcjonalne).
- `data/submissions.yml` — kolejka zgłoszeń community (tworzona dynamicznie).
- `config/users.yml` — konta admin/moderator + bcrypt hashe (`$2b$12$...`).

## Lib (`src/lib/`)
- `yaml.ts` — interfejsy `Demon`, `Victor`, `Submission`; CRUD dla demonów i submissions; sortowanie po `rank`; helper `getNextId`. **Importuj stąd, nie duplikuj typów.**
- `fb-challenges.ts` — CRUD dla FB Challenges (mirror `yaml.ts` bez logiki victors).
- `session.ts` — `getSession()` do odczytu w Server Components / Route Handlers; używa `iron-session`.
- `auth.ts` — walidacja loginu, porównanie bcrypt.
- `youtube.ts` — `getYouTubeId(url)`, `getYouTubeThumbnail(url)` (ekstrahuje ID i zwraca URL `hqdefault.jpg`).

## Autoryzacja
- Sesja `iron-session`, cookie `demonlist_session`, secret `SESSION_SECRET` w `.env.local`.
- Middleware (`src/middleware.ts`) chroni:
  - `/admin/:path*` — wymaga zalogowania; moderator przekierowywany z `/admin/users`.
  - `/api/demons`, `/api/victors`, `/api/users`, `/api/fb-challenges` — POST/PATCH/DELETE wymaga `admin` (moderator dostaje 403); GET publiczny.
- **Gdy dodajesz nowy chroniony API**, dopisz ścieżkę do `isApiProtected` i do `config.matcher`.

## Routing — konwencje Next.js 16
- Dynamiczne parametry: `params: Promise<{ ... }>` — **zawsze `await params`** (przykład: `src/app/demon/[id]/page.tsx`).
- `usePathname()` i `useRouter()` z `next/navigation` (nie z `next/router`).
- `notFound()` z `next/navigation` dla 404.
- Server Components domyślnie; `'use client'` tylko gdy używasz `useState` / `useEffect` / event handlerów.
- `cacheComponents` nie jest włączone — **nie używaj `unstable_instant` ani `'use cache'`** dopóki config tego nie włączy.

## Design (vanilla CSS, design tokens w `src/app/globals.css`)
- Kolory: `--bg-primary`, `--bg-card`, `--accent` (#e94560), `--gold`, `--text-primary`, `--text-muted`, `--text-dim`, `--border`, `--border-accent`.
- Typografia: `Inter` (body), `Rajdhani` (nagłówki / rangi).
- Klasy reużywalne: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.card`, `.form-group`, `.modal-overlay`/`.modal`, `.demon-card`, `.demon-list`, `.admin-layout`, `.admin-sidebar`, `.admin-nav-link`, `.admin-table`.
- **Nowe elementy UI powinny reużywać istniejące klasy.** Nie twórz równoległego designu.
- Iframe YouTube: `demon.video.replace('watch?v=', 'embed/')`. Thumbnail upgrade: `hqdefault.jpg` → `maxresdefault.jpg`.

## Navbar (`src/components/Navbar.tsx`)
- Linki jako tablica `links: { href, label }[]`.
- Specjalny button "Zgłoś Poziom" otwiera modal `SubmitDemonForm` — trzymaj ten wzorzec dla przyszłych modalnych akcji z navbar.
- Admin link pojawia się tylko gdy `user` jest zalogowany; "Wyloguj" czyści sesję przez `POST /api/auth/logout`.

## Admin (`src/app/admin/dashboard/page.tsx`)
- `activeTab: 'demons' | 'submissions' | 'fb-challenges'` — wzorzec `useState` + warunkowy render.
- Formularze dodawania/edycji: modalne komponenty w `src/components/admin/*Form.tsx`, każdy z `onClose: () => void` i fetchem do odpowiedniego API.
- Po każdej akcji wywołaj `loadData()` żeby odświeżyć widok.

## Lokalizacja
- Cały UI po polsku (`pl-PL`), wszystkie komunikaty błędów też po polsku.
- Język kod komentarzy: dowolny, ale spójny w obrębie pliku. Komentarze w istniejącym kodzie są po polsku.

## Czego unikać
- Brak Tailwind / CSS-in-JS — vanilla CSS tylko.
- Brak zewnętrznych bibliotek UI (Material, Chakra, shadcn). Korzystamy z design tokens w `globals.css`.
- Brak prawdziwej bazy — nie proponuj ORM-ów ani migracji.
- Nie commituj `.env.local` ani plaintext haseł.