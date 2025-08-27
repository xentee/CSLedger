## Plan d'exécution MVP (feature/mvp-dash)

### Conventions
- Naming clair et descriptif; types explicites; early returns; pas de catch silencieux.
- Dossiers: API sous `src/app/api` (App Router), UI sous `src/app/...`, util sous `src/lib`.
- Commits atomiques avec message conventional commits (`feat:`, `chore:`, `fix:`).

### Étapes et PRs
1) docs: Ajouter `REPO_MAP.md` et `NEXT_STEPS.md` (PR: audit)
2) deps: Ajouter `zod`, `@tanstack/react-query`, `react-hook-form`, `@supabase/storage-js` (si besoin), `papaparse` ou export CSV custom
3) env: Créer `.env.example` (SUPABASE_URL, SUPABASE_ANON_KEY), scripts `db:migrate`
4) db: Créer migrations SQL Supabase (tables, index, RLS, vues matérialisées)
5) api: Implémenter routes `/api/boards`, `/api/boards/:id/entries`, `/api/dashboard`, `/api/exports/csv` avec validation zod, pagination cursor
6) client: Initialiser QueryClientProvider dans `layout.tsx`, pages `/dashboard`, `/boards`, `/boards/[id]`
7) ui: Composants réutilisables (Table, Filters, Forms) + shadcn/ui si ajouté
8) jobs: Esquisse Supabase Scheduled Functions (purge 90j + refresh materialized views)
9) qualite: Tests unitaires (zod, util stats), e2e léger API, CI GitHub Actions

### Backlog priorisé
- v1: CRUD Boards/Entries + Dashboard + Export CSV + quotas boards (free: 3)
- v1.1: Cache Redis `/dashboard` (TTL 60s)
- v1.2: Purge 90j (free) + email lien signé
- v1.3: Pages améliorées (filtres avancés, virtualisation, stats détaillées)

### Notes d’implémentation
- Supabase comme source de vérité (RLS). Éviter Prisma pour ces tables RLS; garder Prisma si besoin pour autres services plus tard.
- Déplacer progressivement `pages/api` vers `app/api` et unifier la création du client Supabase côté serveur.
- Utiliser Server Actions ou route handlers Next pour opérations sensibles.


