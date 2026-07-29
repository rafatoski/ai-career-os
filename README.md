# AI Career OS

AI Career OS is a private, local-first workspace for becoming an exceptional AI
Product Engineer. The dashboard opens with a database-generated daily mission
that turns roadmap priorities into a focused 1–2 hour plan.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS and local shadcn/ui components
- Prisma ORM with SQLite
- React Hook Form and Zod for validated write workflows
- Lucide icons

## Run locally

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

```bash
npm run dev          # Start the local application
npm run check        # Lint, type-check, and production-build
npm run db:migrate   # Create or apply a development migration
npm run db:seed      # Reset and seed the local personal database
npm run db:studio    # Inspect data in Prisma Studio
```

## Project structure

```text
app/
  actions/           Server-side mission and resource mutations
  roadmap/           Roadmap route
  resources/         Video and reading library
  globals.css        Theme and global styles
  layout.tsx         Application shell
  page.tsx           Daily dashboard
components/
  ui/                Owned shadcn-style primitives
  app-navigation.tsx Responsive navigation
  resource-library.tsx Embedded videos, filters, and resource form
  todays-mission.tsx Interactive daily mission
lib/
  data.ts            Server-only dashboard, roadmap, and library queries
  mission.ts         Mission planning, XP rules, and persistence
  prisma.ts          One shared Prisma client
  utils.ts           Formatting and class utilities
prisma/
  schema.prisma      Data model
  seed.ts            Clean curriculum and curated real resources
```

## Architecture decisions

The app has no authentication or user table because it is intentionally a
single-user local product. SQLite is the source of truth; browser storage is not
used for learning records.

Roadmap progress is derived from completed lessons instead of stored on `Topic`.
This prevents a duplicated progress value from drifting out of sync. Dashboard
statistics are likewise computed from study sessions and lesson status.

Server Components read Prisma directly through a small data-access module. This
keeps database code off the client and leaves a clear place for later write
workflows. Server Actions validate every mission mutation with Zod, while the
personal-task form uses React Hook Form.

Today’s Mission is stored as one `DailyMission` per calendar day with ordered
`MissionTask` records. The generator ranks topics using explicit priority,
completion weakness, and active progress. It reserves time for unfinished
lessons, English, practical project work, and a GitHub commit, then fills spare
time with relevant unfinished resources. XP is derived from task duration, and
the daily bonus is awarded only when every non-skipped task is complete.

The resource library embeds valid YouTube URLs through YouTube's
privacy-enhanced player. Articles, documentation, and courses open at their
original source. Resource completion is stored in Prisma and also updates
mission planning.

The seed is intentionally progress-free: it creates the roadmap and curated
resources, but it does not invent study sessions, projects, English practice,
or completion history.

## Supabase migration

The app currently remains fully usable with local SQLite. Moving the source of
truth to Supabase requires the project's Postgres connection string and a
decision about any tables already present in that project.

Save the connection string locally—not in chat or source control—as
`SUPABASE_DATABASE_URL` in `.env.local`. Before migration, confirm whether the
Supabase database is empty or whether existing progress must be preserved. The
Prisma datasource, driver adapter, migrations, and data transfer should be
switched together so the app never writes progress to two databases.
