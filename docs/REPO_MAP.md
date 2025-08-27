## Cartographie du repo CSLedger

### Aperçu général
- Framework: Next.js 15 (App Router en `src/app` + Pages API en `src/pages/api`)
- Langage: TypeScript
- UI: Tailwind CSS
- Auth/Data: Supabase (`@supabase/supabase-js`) – client présent mais non initialisé
- ORM: Prisma (datasource PostgreSQL, client généré vers `src/generated/prisma`)

### Arborescence
```
src/
  app/
    layout.tsx        # Layout racine (App Router)
    globals.css       # Styles globaux Tailwind
    page.tsx          # Landing marketing (client)
    login/page.tsx    # Formulaire de connexion (POST /api/login)
    register/page.tsx # Formulaire d'inscription (POST /api/register)
  components/
    authModal.tsx
    heroParticlesBackground.tsx
  lib/
    supabaseClient.ts # createClient commenté (à initialiser via env)
  pages/
    api/
      login.ts        # Next Pages API: login via Supabase
      register.ts     # Next Pages API: signup + insert users
prisma/
  schema.prisma       # Datasource PostgreSQL, client Prisma
public/               # Assets
```

### Dépendances notables
- Runtime: `next`, `react`, `react-dom`
- Style: `tailwindcss`, `postcss`, `autoprefixer`
- Data/Auth: `@supabase/supabase-js`, `next-auth` (non utilisé actuellement)
- ORM/DB: `prisma`, `@prisma/client`
- Divers UI/FX: `aos`, `framer-motion`, `react-tsparticles`, `swiper`

### Scripts npm
- `dev`: next dev
- `build`: next build
- `start`: next start
- `lint`: next lint

### Configuration
- Tailwind: `tailwind.config.js`, `postcss.config.(js|mjs)`
- TypeScript: `tsconfig.json`
- Next: `next.config.ts`
- ESLint: `eslint.config.mjs`

### Observations techniques
- Mix App Router + Pages API: OK pour MVP; API à déplacer plus tard sous `app/api`.
- `supabaseClient.ts` est commenté → les API actuelles importent `supabase` inexistant à l'exécution.
- Aucune page `/dashboard`, `/boards`, `/boards/[id]` pour le moment.
- Pas de migrations SQL pour les tables métier (boards, entries, subscriptions) – à ajouter côté Supabase (SQL) plutôt que Prisma pour RLS.

### Manques vs MVP
- Schéma SQL Supabase (tables, index, RLS, vues matérialisées)
- Endpoints REST pour dashboard, boards, entries, export CSV
- Pages front `/dashboard`, `/boards`, `/boards/[id]` + composants CRUD
- Zod pour validation inputs, TanStack Query pour data‑fetch, react-hook-form pour forms
- .env.example, docs setup, tests unitaires + e2e légers, CI


