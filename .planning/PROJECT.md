# Health Map

## What This Is

A Gantt-style health timeline application for documenting symptoms, medications, supplements, diet, body composition, and notes over multiple years. Users can visualize their health history, identify patterns, and export structured data for analysis with external LLMs to help identify underlying health issues.

## Core Value

Data entry must be fast and frictionless — if it's tedious to log health information, users won't maintain the habit and the timeline becomes useless.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Gantt-style timeline visualization with multiple sections (symptoms, medications, supplements, diet, body composition, notes)
- [ ] Drag-and-drop time-based elements that stack vertically when overlapping
- [ ] Custom fields per section (symptoms: title/description/severity; medications: name/dosage/frequency/duration/side effects; etc.)
- [ ] Create, edit, delete timeline elements with intuitive UX
- [ ] Local storage persistence
- [ ] JSON export for LLM analysis (copy-paste workflow)
- [ ] JSON import to restore data
- [ ] Light/dark mode toggle
- [ ] Clear data button with confirmation

### Out of Scope

- Multi-user accounts / cloud sync — local-only for v1, keeps it simple and private
- Direct LLM API integration — manual export/paste workflow is sufficient
- Mobile app — desktop/web focus for v1, complex drag-and-drop on mobile is hard
- Markdown/narrative export — JSON export covers the LLM use case

## Context

Existing codebase has Vite + TypeScript setup with ESLint configured. The app will use Mantine component library for UI and React Router if multi-page navigation is needed. All data stays local in browser storage — no backend, no network calls.

The target workflow: user logs health events over time, sees patterns visually in the Gantt chart, then exports JSON to paste into ChatGPT/Claude for analysis and pattern identification.

## Constraints

- **Tech stack**: Mantine components + React + TypeScript + Vite — as specified in project requirements
- **Offline-first**: Must work without network connectivity, pure local storage
- **Browser-only**: No backend services, all logic runs client-side

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local storage over backend | Privacy, simplicity, offline-first | — Pending |
| JSON export for LLM workflow | Simple copy-paste, no API complexity | — Pending |
| Mantine component library | Modern React components, good defaults | — Pending |

---
*Last updated: 2026-01-28 after initialization*
