# demonlist.szympixel.pl

Prywatna lista najtrudniejszych poziomów typu Demon w grze Geometry Dash, inspirowana serwisem Pointercrate.

## Funkcje
- 🏆 **Ranking Demonów** - wykaz poziomów z informacjami o twórcy, ID i dowodami wideo.
- 🎮 **Lista Zwycięzców** - każdy demon posiada listę graczy (victorów), którzy go ukończyli.
- 🔐 **Panel Administracyjny** - bezpieczny panel do zarządzania listą (dodawanie/edycja demonów i victorów).
- 🎨 **Dark Theme** - dopracowany ciemny motyw inspirowany estetyką Pointercrate.

## Technologie
- **Next.js 14** (App Router)
- **React**
- **TypeScript**
- **Vanilla CSS**
- **YAML** (przechowywanie danych bez bazy danych)
- **Bcrypt** (hashowanie haseł)
- **Iron-Session** (bezpieczne sesje oparte na ciasteczkach)

## Struktura Danych
Wszystkie dane zapisywane są w pliku `data/demons.yml`. Dzięki temu projekt można łatwo hostować bez potrzeby konfiguracji bazy danych (SQLite/PostgreSQL itp.).
Konta użytkowników i ich hashe haseł przechowywane są w `config/users.yml`.

## Uruchomienie lokalnie

### Wymagania
- Node.js (v20+)
- npm

### Instalacja i uruchomienie

1. Zainstaluj zależności:
```bash
npm install
```

2. Skonfiguruj zmienne środowiskowe:
Skopiuj plik z przykładowymi zmiennymi środowiskowymi. Ważne: przed wdrożeniem na produkcję zmień wartość `SESSION_SECRET` w pliku `.env.local` na bezpieczny, losowy ciąg znaków!
```bash
echo "SESSION_SECRET=$(openssl rand -base64 32)" > .env.local
```

3. Uruchom serwer developerski:
```bash
npm run dev
```

Strona będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000)

## Zarządzanie kontami
Aby zalogować się do panelu administratora (domyślnie pod adresem `/admin`), użyj domyślnego konta zdefiniowanego w pliku `config/users.yml`.

**Domyślne dane logowania:**
- **Login:** `admin`
- **Hasło:** `changeme123`

⚠️ **UWAGA:** Zmień hasło domyślne! Aby to zrobić, użyj wbudowanego skryptu:
```bash
npm run hash-password <nowe_haslo>
```
Następnie wklej wygenerowany hash do pliku `config/users.yml` w sekcji `password_hash`.
