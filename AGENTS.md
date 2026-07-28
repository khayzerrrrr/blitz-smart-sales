<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Blitz CRM - Project Reference

## Tech Stack
- **Next.js** 16.2.12 (App Router, Turbopack)
- **React** 19.2.4
- **Tailwind CSS** v4 (CSS-first config via `@import "tailwindcss"`)
- **Shadcn/ui** v2 (`@base-ui/react` instead of Radix)
- **Zod** v4 (breaking changes from v3)

## Key Differences from Common Patterns

### Shadcn/ui v2 (base-ui)
- DialogTrigger does NOT support `asChild` prop (use render prop pattern instead)
- Select `onValueChange` receives `(value: string | null)` — not just `string`
- Components use `@base-ui/react` primitives, NOT `@radix-ui/react`

### Zod v4
- `z.enum()` second argument uses `{ message }` not `{ required_error }`

### Tailwind v4
- Configuration is CSS-based (`@theme inline {}` in globals.css)
- No `tailwind.config.ts` needed
- `@import "tailwindcss"` instead of `@tailwind` directives

### date-fns v4
- Locale imports may have type incompatibilities; use format without locale for mock data

## Commands
```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build (includes type checking)
npm run lint     # ESLint
npx shadcn@latest add <component>  # Add shadcn components
```

## Color Theme
- Background: `#020617` (slate-950)
- Cards/Sidebar: `#0f172a` (slate-900)
- Accent: `#f97316` (orange-500)
- Borders: `#1e293b` (slate-800)

## Project Status (Audited)
- Fase 0: Setup - 100% ✅
- Fase 1: Frontend UI with Mock Data - 100% ✅ (UI lengkap, mock data di `src/data/mock-data.ts`)
- Fase 2: Supabase Integration - 100% ✅ (client, server, migrasi final, RLS strict, service layer, server actions, GPS, auto `created_by`)
- Fase 3: Live Data & Realtime - 100% ✅ (useRealtime hook reusable, semua tabel: schools, visits, pipelines, school_photos)
- Fase 4: QA & Deployment - 15% ⏳ (Vercel terdaftar, 0 test, 0 CI/CD)

## Critical Issues
1. 🔴 `SUPABASE_SERVICE_ROLE_KEY` di `.env.local` masih placeholder — isi dari dashboard Supabase (Settings > API)
2. 🔴 **Tidak ada test** (unit/E2E) — perlu Jest/Vitest + Playwright
3. 🟡 **Mobile-app** (`mobile-app/`) — kredensial Supabase sudah diisi, tapi StockScreen perlu service layer
4. 🟢 **proxy.ts matcher** — sudah exclude static files (.apk, .png, dll)
