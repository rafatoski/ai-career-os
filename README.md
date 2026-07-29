# Learning Companion

A calm, local-first application for following one personal learning roadmap.
The product is deliberately single-user: there is no authentication, cloud
sync, LMS administration, gamification, or statistics dashboard.

## Run locally

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run dev          # Start the local application
npm run check        # Lint, type-check and production build
npm run db:migrate   # Apply committed SQLite migrations
npm run db:dev       # Create a migration while changing the schema
npm run db:studio    # Inspect local progress
```

## How content and progress work

Course content lives in `roadmaps/*.json`. Those files are the canonical,
human-authored curriculum: the application never generates a course. Files are
discovered automatically and displayed by their `order` value.

SQLite stores only personal state:

- exact YouTube playback position and watched percentage;
- reading and quiz completion;
- per-lesson Markdown notes;
- practical-project URL and status.

This separation keeps course editing predictable and prevents mutable progress
from being duplicated inside content files.

Configured non-English modules form one sequence. The first configured module
is available; completing all its lessons unlocks the next configured module.
Empty modules are shown as “Not configured” and do not block the sequence.
English uses `alwaysAvailable: true` and remains accessible independently.

Within a regular module, completing one lesson unlocks the next. A lesson can
only be completed after the video is watched, the lesson reading is confirmed,
and the quiz is passed with at least 80%.

## Roadmap format

Add or edit JSON files in `roadmaps/`:

```json
{
  "slug": "example",
  "order": 20,
  "category": {
    "title": "07 · New section",
    "order": 7
  },
  "alwaysAvailable": false,
  "title": "Example module",
  "description": "What this module teaches.",
  "thumbnail": "https://...",
  "lessons": [
    {
      "id": "first-lesson",
      "title": "First lesson",
      "youtubeUrl": "https://www.youtube.com/watch?v=...",
      "duration": 1200,
      "description": "What to learn.",
      "notes": "# Reading\n\nHuman-authored Markdown.",
      "quiz": [
        {
          "id": "q1",
          "question": "Question?",
          "options": ["A", "B"],
          "answerIndex": 0,
          "explanation": "Why A is correct."
        }
      ],
      "flashcards": [
        { "front": "Concept", "back": "Explanation" }
      ],
      "exercise": "A small practice task.",
      "resources": [
        { "title": "Reference", "url": "https://..." }
      ]
    }
  ]
}
```

`duration` is expressed in seconds. A lesson may also include:

```json
{
  "project": {
    "title": "Build something",
    "description": "Project outcome.",
    "requirements": ["Requirement one"]
  }
}
```

Invalid content fails fast with a readable Zod validation error, so a malformed
roadmap cannot silently corrupt the learning flow.

Modules are grouped in the sidebar by their `category`. Categories and modules
are sorted by their numeric `order`, so the learning structure remains entirely
controlled by JSON rather than UI code.

## Architecture

The App Router uses Server Components for initial reads and small Server
Actions for validated SQLite writes. The YouTube IFrame API runs only in the
client; it saves every ten seconds, on pause, on completion, and again with
`sendBeacon` when the page closes. Returning to a lesson seeks to that saved
timestamp.

The right panel is scoped to the active lesson. Notes autosave locally. The quiz
is checked against answers in the JSON file. Flashcards are rendered directly
from that same lesson. The “AI Tutor” is intentionally offline and constrained:
it retrieves the most relevant explanation from the current lesson content and
does not send questions to an external service.

## Project structure

```text
app/
  actions/learning.ts                 Validated progress writes
  api/progress/playback/route.ts      Page-close playback persistence
  learn/[moduleSlug]/[lessonId]/      Lesson route
  page.tsx                            Minimal Continue Learning screen
components/
  assistant-panel.tsx                 Notes, tutor, quiz, cards, resources
  lesson-workspace.tsx                Video-first center panel
  roadmap-sidebar.tsx                 Sequential roadmap
lib/
  learning-data.ts                    Unlock and current-lesson logic
  learning-progress.ts                Playback persistence
  roadmaps.ts                         JSON discovery and validation
prisma/
  schema.prisma                       Local personal-state models
roadmaps/
  *.json                              Human-authored curriculum
```
