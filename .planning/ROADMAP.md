# Roadmap: Health Map

## Overview

Build a Gantt-style health timeline application from foundation to polish. Starting with project infrastructure and Mantine setup, then establishing the data model for all health sections, building the core timeline visualization, adding full CRUD with drag-and-drop, implementing import/export for LLM analysis workflows, and finishing with theme support and UX polish.

## Domain Expertise

None

## Phases

- [ ] **Phase 1: Foundation** - Project setup with Mantine, routing, local storage hooks
- [ ] **Phase 2: Data Model** - Define types and storage layer for all health sections
- [ ] **Phase 3: Timeline Core** - Gantt-style visualization with time axis and section lanes
- [ ] **Phase 4: CRUD Operations** - Create, edit, delete elements with drag-and-drop
- [ ] **Phase 5: Import/Export** - JSON export for LLM analysis, import to restore
- [ ] **Phase 6: Polish** - Light/dark mode, clear data, responsive refinements

## Phase Details

### Phase 1: Foundation
**Goal**: Establish project infrastructure with Mantine UI, React Router (if needed), and reusable local storage hooks
**Depends on**: Nothing (first phase)
**Research**: Unlikely (standard React + Mantine setup)
**Plans**: TBD

Plans:
- [ ] 01-01: Install and configure Mantine with theme provider
- [ ] 01-02: Set up app shell layout and routing structure
- [ ] 01-03: Create local storage hook for persistence

### Phase 2: Data Model
**Goal**: Define TypeScript types for all health sections and implement the storage layer
**Depends on**: Phase 1
**Research**: Unlikely (internal TypeScript types, localStorage patterns)
**Plans**: TBD

Plans:
- [ ] 02-01: Define types for symptoms, medications, supplements, diet, body composition, notes
- [ ] 02-02: Implement storage service with CRUD operations

### Phase 3: Timeline Core
**Goal**: Build the Gantt-style timeline visualization with time axis, section lanes, and vertical stacking for overlaps
**Depends on**: Phase 2
**Research**: Likely (Gantt visualization approach)
**Research topics**: Gantt/timeline rendering strategies, time-scale handling (days/weeks/months/years), vertical stacking algorithm for overlapping elements
**Plans**: TBD

Plans:
- [ ] 03-01: Build time axis component with zoom/pan controls
- [ ] 03-02: Create section lanes for each health category
- [ ] 03-03: Implement element rendering with vertical stacking

### Phase 4: CRUD Operations
**Goal**: Full create, edit, delete functionality with drag-and-drop repositioning and resizing
**Depends on**: Phase 3
**Research**: Likely (drag-and-drop library)
**Research topics**: React drag-and-drop library comparison (dnd-kit vs react-dnd vs others), element resizing for time ranges, touch support considerations
**Plans**: TBD

Plans:
- [ ] 04-01: Create/edit modal forms with section-specific fields
- [ ] 04-02: Implement drag-and-drop for repositioning elements
- [ ] 04-03: Add element resizing and deletion

### Phase 5: Import/Export
**Goal**: JSON export for LLM analysis workflow, JSON import to restore data
**Depends on**: Phase 4
**Research**: Unlikely (standard JSON serialization)
**Plans**: TBD

Plans:
- [ ] 05-01: Implement JSON export with copy-to-clipboard
- [ ] 05-02: Implement JSON import with validation

### Phase 6: Polish
**Goal**: Light/dark mode toggle, clear data with confirmation, responsive refinements
**Depends on**: Phase 5
**Research**: Unlikely (Mantine theming, internal patterns)
**Plans**: TBD

Plans:
- [ ] 06-01: Add light/dark mode toggle with persistence
- [ ] 06-02: Add clear data button with confirmation modal
- [ ] 06-03: Responsive and UX refinements

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Data Model | 0/2 | Not started | - |
| 3. Timeline Core | 0/3 | Not started | - |
| 4. CRUD Operations | 0/3 | Not started | - |
| 5. Import/Export | 0/2 | Not started | - |
| 6. Polish | 0/3 | Not started | - |
