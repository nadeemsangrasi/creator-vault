# Tasks: Frontend Implementation - Phase 2

**Feature**: 001-frontend-implementation
**Status**: Ready for Implementation
**Plan**: [plan.md](./plan.md)
**Spec**: [spec.md](./spec.md)
**Total Tasks**: 147 (includes T136-T147 for unit/component testing)

---

## Task List

### Phase 2.1: Foundation Setup (Priority: P1)

- [x] T001 Create Next.js 16 project structure
- [x] T002 Install and configure TypeScript with strict mode
- [x] T003 Install and configure Tailwind CSS 3.4
- [x] T004 Install and initialize shadcn/ui component library
- [x] T005 Create frontend directory structure (app/, components/, lib/, actions/)
- [x] T006 Install Better Auth dependencies
- [x] T007 Set up Drizzle ORM for auth database
- [x] T008 Configure Better Auth instance
- [x] T009 Create auth API routes structure
- [x] T010 Create middleware for protected routes
- [x] T011 Create .env.example template
- [x] T012 Configure next.config.js (images, domains, headers)
- [x] T013 Configure ESLint and Prettier
- [x] T014 Set up TypeScript strict mode in tsconfig.json
- [x] T015 Verify dev server runs successfully

**Independent Test**: Dev server starts and runs at http://localhost:3000
**Files**: None (setup files only)

---

### Phase 2.2: Landing Page (Priority: P1)

#### User Story 1: Modern Landing Page Experience

- [x] T016 Create hero section component
- [x] T017 Implement kinetic typography with Framer Motion
- [x] T018 Add call-to-action buttons
- [x] T019 Implement responsive layout (mobile/tablet/desktop)
- [x] T020 Create features section with cards
- [x] T021 Implement scroll animations
- [x] T022 Create "How It Works" section
- [x] T023 Implement scrollytelling with progressive reveals
- [x] T024 Add smooth scroll navigation
- [x] T025 Assemble landing page from components
- [x] T026 Test on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [x] T027 Run Lighthouse audit (target: LCP < 2.5s, FID < 100ms, CLS < 0.1)

**Independent Test**: Landing page renders at root URL with all sections, animations, and responsiveness
**Files**: `frontend/app/(public)/page.tsx`, `frontend/components/layout/landing-nav.tsx`, `frontend/components/landing/hero.tsx`, `frontend/components/landing/features.tsx`, `frontend/components/landing/how-it-works.tsx`
**Skills**: `/landing-page-design-2026`

---

### Phase 2.3: Authentication Flow (Priority: P1)

#### User Story 2: User Authentication

- [x] T028 Create signup page component
- [x] T029 Implement signup form with email/password
- [x] T030 Add OAuth buttons (Google, GitHub)
- [x] T031 Implement real-time form validation with Zod
- [x] T032 Add error handling and display
- [x] T033 Create signin page component
- [x] T034 Implement email/password authentication
- [x] T035 Add OAuth provider buttons
- [x] T036 Implement "Remember me" functionality
- [x] T037 Create user menu dropdown component
- [x] T038 Implement sign out functionality
- [x] T039 Clear auth state on sign out
- [x] T040 Create middleware.ts for protected routes
- [x] T041 Implement JWT token verification
- [x] T042 Configure auth redirects (unauthenticated → signin, authenticated → dashboard)
- [x] T043 Test complete auth flow (signup → dashboard, sign in → dashboard, sign out → landing)

**Independent Test**: Users can sign up (email/password + OAuth), sign in, and sign out with proper redirects
**Files**: `frontend/app/(public)/signin/page.tsx`, `frontend/app/(public)/signup/page.tsx`, `frontend/components/auth/signin-form.tsx`, `frontend/components/auth/signup-form.tsx`, `frontend/components/auth/oauth-buttons.tsx`, `frontend/components/auth/user-menu.tsx`, `frontend/src/middleware/auth.ts`
**Skills**: `/better-auth-nextjs`

---

### Phase 2.4: Ideas List & CRUD (Priority: P1)

#### User Story 3: Create and Manage Content Ideas

- [x] T044 Create ideas list page component
- [x] T045 Create idea card component
- [x] T046 Implement idea cards with all attributes (title, stage badge, priority badge, tags, timestamp)
- [x] T047 Create stage badges (idea: blue, outline: yellow, draft: orange, published: green)
- [x] T048 Create priority badges (high: red, medium: yellow, low: gray)
- [x] T049 Display tags as badges
- [x] T050 Create idea form component
- [x] T051 Implement form validation with React Hook Form + Zod
- [x] T052 Add real-time validation feedback
- [x] T053 Create edit idea page component
- [x] T054 Pre-fill edit form with existing data
- [x] T055 Implement form submission logic
- [x] T056 Add delete confirmation dialog
- [x] T057 Implement delete action
- [x] T058 Create idea detail page component
- [x] T059 Display all idea information
- [x] T060 Link to edit functionality
- [x] T061 Implement API client with JWT injection
- [x] T062 Create SWR data fetching hooks
- [x] T063 Implement optimistic updates
- [x] T064 Add loading skeletons
- [x] T065 Implement error handling with retry
- [x] T066 Test all CRUD operations (create, read, update, delete)

**Independent Test**: Users can create, view, edit, and delete ideas with validation, optimistic updates, and error handling
**Files**: `frontend/app/(protected)/ideas/page.tsx`, `frontend/app/(protected)/ideas/new/page.tsx`, `frontend/app/(protected)/ideas/[id]/page.tsx`, `frontend/app/(protected)/ideas/[id]/edit/page.tsx`, `frontend/components/ideas/idea-card.tsx`, `frontend/components/ideas/idea-form.tsx`, `frontend/components/ideas/delete-dialog.tsx`, `frontend/components/ideas/empty-state.tsx`, `frontend/components/ideas/loading.tsx`, `frontend/components/ideas/stage-badge.tsx`, `frontend/components/ideas/priority-badge.tsx`
**Skills**: `/nextjs16`, `/styling-with-shadcn`

---

### Phase 2.5: Filtering & Search (Priority: P2)

#### User Story 4: Filter and Search Ideas

- [x] T067 Create stage filter dropdown component
- [x] T068 Create priority filter dropdown component
- [x] T069 Implement multi-select tag filter
- [x] T070 Add clear filters button
- [x] T071 Create search input component
- [x] T072 Implement debounce for search (useDebounce hook)
- [x] T073 Implement search logic (title + notes, case-insensitive)
- [x] T074 Highlight search matches
- [x] T075 Persist filters in URL searchParams
- [x] T076 Handle browser back/forward navigation
- [x] T077 Create shareable filter URLs
- [x] T078 Apply filters to data fetching
- [x] T079 Update displayed results
- [x] T080 Test filter combinations (stage, tags, priority, search)
- [x] T081 Test browser navigation

**Independent Test**: Users can filter by stage, tags, priority, and search by title/notes with URL state persistence
**Files**: `frontend/components/ideas/idea-filters.tsx`, `frontend/components/ideas/idea-search.tsx`, `frontend/app/(protected)/ideas/page.tsx` (modified)
**Skills**: `/nextjs16`

---

### Phase 2.6: Dashboard (Priority: P2)

#### User Story 5: Dashboard Overview

- [x] T082 Create dashboard page component
- [x] T083 Create stats card component
- [x] T084 Display total ideas count
- [x] T085 Show ideas by stage counts
- [x] T086 Create recent ideas widget
- [x] T087 Display 5 most recently updated ideas
- [x] T088 Link to idea detail pages
- [x] T089 Create empty state for no ideas
- [x] T090 Add "Create Your First Idea" CTA
- [x] T091 Test dashboard accuracy with mock data
- [x] T092 Create quick actions section

**Independent Test**: Dashboard displays accurate statistics, recent ideas, and empty state with actionable CTAs
**Files**: `frontend/app/(protected)/dashboard/page.tsx`, `frontend/components/dashboard/stats-card.tsx`, `frontend/components/dashboard/recent-ideas.tsx`, `frontend/components/dashboard/empty-state.tsx`, `frontend/components/dashboard/quick-actions.tsx`
**Skills**: `/styling-with-shadcn`

---

### Phase 2.7: Responsive Design (Priority: P2)

#### User Story 6: Responsive Design Across Devices

- [x] T093 Define Tailwind breakpoints (mobile: < 768px, tablet: 768-1024px, desktop: > 1024px)
- [x] T094 Create mobile hamburger menu component
- [x] T095 Implement sidebar for desktop/tablet
- [x] T096 Stack form layouts on mobile
- [x] T097 Implement 2-column idea grid for tablet
- [x] T098 Implement 3-column idea grid for desktop
- [x] T099 Test on physical mobile device
- [x] T100 Test on iPad/tablet
- [x] T101 Test on desktop
- [x] T102 Verify touch targets meet mobile standards (44x44px minimum)
- [x] T103 Create adaptive typography and spacing
- [x] T104 Test touch interactions

**Independent Test**: Application works seamlessly on mobile, tablet, and desktop with proper breakpoints and touch interactions
**Files**: `frontend/app/(protected)/layout.tsx` (modified), `frontend/components/layout/sidebar.tsx`, `frontend/components/layout/mobile-menu.tsx`, `frontend/app/globals.css` (modified)
**Skills**: `/styling-with-shadcn`, `/modern-ui-ux-theming`

---

### Phase 2.8: API Integration (Priority: P1)

#### User Story 7: API Integration with Backend

- [x] T105 Create reusable HTTP client function
- [x] T106 Implement JWT token injection from Better Auth session
- [x] T107 Add request/response interceptors
- [x] T108 Implement error handling for all status codes (401, 403, 404, 500)
- [x] T109 Configure SWR for client-side data fetching
- [x] T110 Implement automatic revalidation strategy
- [x] T111 Implement optimistic updates for create/update/delete
- [x] T112 Add rollback on error
- [x] T113 Create Ideas API client with type-safe methods
- [x] T114 Create User API client with profile methods
- [x] T115 Implement toast notifications for success/error
- [x] T116 Add user-friendly error messages
- [x] T117 Implement retry logic for 500 errors
- [x] T118 Handle session expiry and redirect to signin
- [x] T119 Test API integration with FastAPI backend

**Independent Test**: All data operations persist to backend with proper error handling, JWT authentication, and optimistic updates
**Files**: `frontend/lib/api/client.ts`, `frontend/lib/api/ideas.ts`, `frontend/lib/api/users.ts`, `frontend/components/shared/toast.tsx`, `frontend/components/shared/error-state.tsx`
**Skills**: `/frontend-backend-jwt-verification`

---

### Phase 2.9.1: Unit & Component Testing (Priority: P3)

#### Requirements FR-056 and FR-057

- [x] T136 Install and configure Vitest for unit testing
- [x] T137 Install and configure React Testing Library for component testing
- [x] T138 Configure coverage reporting with @vitest/coverage-v8
- [x] T139 Write unit tests for lib/utils/cn.ts (class name merger)
- [x] T140 Write unit tests for lib/utils/format.ts (date/string formatting)
- [x] T141 Write unit tests for lib/utils/constants.ts (app constants)
- [x] T142 Write unit tests for lib/validation/idea.ts (Zod schema validation)
- [x] T143 Write component tests for IdeaCard component
- [x] T144 Write component tests for IdeaForm component
- [x] T145 Verify 80%+ unit test coverage for utility functions
- [x] T146 Verify 80%+ component test coverage for key components
- [x] T147 Set up pre-commit hook to run unit/component tests

**Independent Test**: Unit tests pass with 80%+ coverage, component tests pass for all key components
**Files**: `frontend/lib/utils/__tests__/`, `frontend/lib/validation/__tests__/`, `frontend/components/ideas/__tests__/`, `vitest.config.ts`, `vitest.workspace.ts`
**Skills**: `/systematic-debugging`

---

### Phase 2.9.2: E2E Testing (Priority: P3)

#### User Story 8: End-to-End Testing Coverage

- [x] T120 Install and configure Playwright
- [x] T121 Create test directory structure
- [x] T122 Configure test environment variables
- [x] T123 Write signup flow tests (email, Google, GitHub)
- [x] T124 Write signin flow test
- [x] T125 Write sign out flow test
- [x] T126 Write protected route redirect tests
- [x] T127 Write ideas CRUD tests (create, read, update, delete)
- [x] T128 Write filtering tests (stage, tags, priority, search)
- [x] T129 Configure cross-browser testing (Chrome, Firefox, Safari)
- [x] T130 Add mobile responsive tests
- [x] T131 Add accessibility tests (keyboard navigation, screen readers)
- [x] T132 Configure test reporting (HTML report, JSON report)
- [x] T133 Run tests and verify 80%+ coverage
- [x] T134 Verify 95%+ pass rate
- [x] T135 Set up CI/CD for automated tests (optional)

**Independent Test**: E2E tests cover 80%+ of critical user journeys with 95%+ pass rate
**Files**: `frontend/tests/e2e/auth/signup.spec.ts`, `frontend/tests/e2e/auth/signin.spec.ts`, `frontend/tests/e2e/auth/signout.spec.ts`, `frontend/tests/e2e/ideas/crud.spec.ts`, `frontend/tests/e2e/ideas/filters.spec.ts`, `frontend/tests/e2e/fixtures/`, `playwright.config.ts`, `frontend/package.json` (modified)
**Skills**: `/systematic-debugging`, `/nextjs-dev-tool`

---

## Dependencies Graph

### User Story Completion Order

```
US1: Landing Page → US2: Auth → US3: Ideas CRUD → US4: Filters → US5: Dashboard → US6: Responsive → US7: API Integration → US8: Unit/Component Tests → US9: E2E Tests
                      ↓
US1 creates: All landing page components (hero, features, how-it-works)
US2 creates: Auth forms, middleware, user menu
US3 creates: Idea cards, forms, detail pages
US4 creates: Filter components, search input
US5 creates: Stats cards, recent ideas widget
US6 creates: Layout components (mobile menu, sidebar)
US7 creates: API client, error handling
US8 creates: Unit tests, component tests
US9 creates: E2E tests
```

### Component Dependencies

```
Landing Page:
  - hero.ts (US1)
  - features.ts (US1)
  - how-it-works.ts (US1)

Auth:
  - signin-form.ts (US2)
  - signup-form.ts (US2)
  - oauth-buttons.ts (US2)
  - user-menu.ts (US2)
  - middleware.ts (US2)

Ideas:
  - idea-card.ts (US3)
  - idea-form.ts (US3)
  - idea-filters.ts (US4)
  - idea-search.ts (US4)
  - empty-state.ts (US3)
  - loading.ts (US3)
  - delete-dialog.ts (US3)
  - stage-badge.ts (US3)
  - priority-badge.ts (US3)

Dashboard:
  - stats-card.ts (US5)
  - recent-ideas.ts (US5)
  - empty-state.ts (US5)

Layout:
  - header.ts (shared - used by all)
  - footer.ts (shared - used by all)
  - sidebar.ts (US6)
  - main-nav.ts (shared - used by all)
  - landing-nav.ts (US1)

API:
  - client.ts (US7)
  - ideas.ts (US7)
  - users.ts (US7)
  - toast.ts (shared)
  - error-state.ts (shared)
```

---

## Implementation Strategy

### MVP Scope (Minimal Viable Product)

**Stories for MVP:**
- ✅ US1: Landing Page (P1)
- ✅ US2: Authentication Flow (P1)
- ✅ US3: Ideas List & CRUD (P1)

**MVP Completes When:**
- Landing page renders with kinetic typography and scrollytelling
- Users can sign up and sign in
- Users can create, read, update, and delete ideas
- All core functionality accessible and tested

**MVP Excludes (Post-MVP):**
- Filtering and search (US4) - P2
- Dashboard (US5) - P2
- Responsive design (US6) - P2
- E2E tests (US8) - P3

### Incremental Delivery (Recommended)

**Sprint 1:**
- Complete Phase 2.1 (Foundation Setup)
- Complete Phase 2.2 (Landing Page)
- Complete Phase 2.3 (Authentication Flow)
- **MVP Milestone**: Deploy and test MVP features

**Sprint 2:**
- Complete Phase 2.4 (Ideas List & CRUD)
- Complete Phase 2.8 (API Integration)
- Review and refine all P1 features

**Sprint 3 (Post-MVP):**
- Complete Phase 2.5 (Filtering & Search)
- Complete Phase 2.6 (Dashboard)
- Complete Phase 2.7 (Responsive Design)
- Complete Phase 2.9.1 (Unit & Component Testing)
- Complete Phase 2.9.2 (E2E Testing)
- Performance optimization and polish
- **Production Milestone**: Full feature deployment

---

## Test Strategy

### Unit Tests (Target: 80%+ Coverage for Utility Functions)

**Utility Functions to Test:**
- `lib/utils/cn.ts` - Class name merger
- `lib/utils/format.ts` - Date/string formatting
- `lib/utils/constants.ts` - App constants
- `lib/validation/idea.ts` - Zod schema validation

**Tools:**
- Vitest for fast unit testing
- @vitest/coverage-v8 for coverage reporting
- Pre-commit hook (Husky or simple-git-hooks) to run tests on commit

**Tasks:** T136-T147 (Phase 2.9.1)

### Component Tests (Target: 80%+ Coverage for Key Components)

**Components to Test:**
- IdeaCard component (render, interaction, badge display)
- IdeaForm component (validation, submission, error handling)
- Form components with validation
- Filter components (dropdowns, search)
- Dashboard components (stats cards, recent ideas)

**Tools:**
- React Testing Library for component testing
- Vitest as test runner
- Mock Service Worker (MSW) for API mocking (optional)

**Tasks:** T136-T147 (Phase 2.9.1)

### Integration Tests (Manual + API Mock)

**Critical User Flows:**
- Auth flow (signup → dashboard, sign in → dashboard, sign out → landing)
- Ideas CRUD (create, read, update, delete)
- Filters and search

### E2E Tests (Target: 80%+ Critical Journeys, 95%+ Pass Rate)

**Test Files by Priority:**
- **P1 (Critical):** Auth flows, Ideas CRUD
- **P2 (High):** Filtering and search
- **P3 (Medium):** Dashboard
- **P4 (Low):** Responsive design

---

## Quality Checklist

**Note**: Task checkboxes track completion. See "Task List" section above for full task descriptions (T001-T135).

### Foundation Setup (Phase 2.1)
- [x] T001 Create Next.js 16 project structure
- [x] T002 Install and configure TypeScript with strict mode
- [x] T003 Install and configure Tailwind CSS 3.4
- [x] T004 Install and initialize shadcn/ui component library
- [x] T005 Create frontend directory structure (app/, components/, lib/, actions/)
- [x] T006 Install Better Auth dependencies
- [x] T007 Set up Drizzle ORM for auth database
- [x] T008 Configure Better Auth instance
- [x] T009 Create auth API routes structure
- [x] T010 Create middleware for protected routes
- [x] T011 Create .env.example template
- [x] T012 Configure next.config.js (images, domains, headers)
- [x] T013 Configure ESLint and Prettier
- [x] T014 Set up TypeScript strict mode in tsconfig.json
- [x] T015 Verify dev server runs successfully

### Landing Page (Phase 2.2)
- [x] T016 Create hero section component
- [x] T017 Implement kinetic typography with Framer Motion
- [x] T018 Add call-to-action buttons
- [x] T019 Implement responsive layout (mobile/tablet/desktop)
- [x] T020 Create features section with cards
- [x] T021 Implement scroll animations
- [x] T022 Create "How It Works" section
- [x] T023 Implement scrollytelling with progressive reveals
- [x] T024 Add smooth scroll navigation
- [x] T025 Assemble landing page from components
- [x] T026 Test on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [x] T027 Run Lighthouse audit (target: LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Authentication Flow (Phase 2.3)
- [x] T028 Create signup page component
- [x] T029 Implement signup form with email/password
- [x] T030 Add OAuth buttons (Google, GitHub)
- [x] T031 Implement real-time form validation with Zod
- [x] T032 Add error handling and display
- [x] T033 Create signin page component
- [x] T034 Implement email/password authentication
- [x] T035 Add OAuth provider buttons
- [x] T036 Implement "Remember me" functionality
- [x] T037 Create user menu dropdown component
- [x] T038 Implement sign out functionality
- [x] T039 Clear auth state on sign out
- [x] T040 Create middleware.ts for protected routes
- [x] T041 Implement JWT token verification
- [x] T042 Configure auth redirects (unauthenticated → signin, authenticated → dashboard)
- [x] T043 Test complete auth flow (signup → dashboard, sign in → dashboard, sign out → landing)

### Ideas List & CRUD (Phase 2.4)
- [x] T044 Create ideas list page component
- [x] T045 Create idea card component
- [x] T046 Implement idea cards with all attributes (title, stage badge, priority badge, tags, timestamp)
- [x] T047 Create stage badges (idea: blue, outline: yellow, draft: orange, published: green)
- [x] T048 Create priority badges (high: red, medium: yellow, low: gray)
- [x] T049 Display tags as badges
- [x] T050 Create idea form component
- [x] T051 Implement form validation with React Hook Form + Zod
- [x] T052 Add real-time validation feedback
- [x] T053 Create edit idea page component
- [x] T054 Pre-fill edit form with existing data
- [x] T055 Implement form submission logic
- [x] T056 Add delete confirmation dialog
- [x] T057 Implement delete action
- [x] T058 Create idea detail page component
- [x] T059 Display all idea information
- [x] T060 Link to edit functionality
- [x] T061 Implement API client with JWT injection
- [x] T062 Create SWR data fetching hooks
- [x] T063 Implement optimistic updates
- [x] T064 Add loading skeletons
- [x] T065 Implement error handling with retry
- [x] T066 Test all CRUD operations (create, read, update, delete)

### Filtering & Search (Phase 2.5)
- [x] T067 Create stage filter dropdown component
- [x] T068 Create priority filter dropdown component
- [x] T069 Implement multi-select tag filter
- [x] T070 Add clear filters button
- [x] T071 Create search input component
- [x] T072 Implement debounce for search (useDebounce hook)
- [x] T073 Implement search logic (title + notes, case-insensitive)
- [x] T074 Highlight search matches
- [x] T075 Persist filters in URL searchParams
- [x] T076 Handle browser back/forward navigation
- [x] T077 Create shareable filter URLs
- [x] T078 Apply filters to data fetching
- [x] T079 Update displayed results
- [x] T080 Test filter combinations (stage, tags, priority, search)
- [x] T081 Test browser navigation

### Dashboard (Phase 2.6)
- [x] T082 Create dashboard page component
- [x] T083 Create stats card component
- [x] T084 Display total ideas count
- [x] T085 Show ideas by stage counts
- [x] T086 Create recent ideas widget
- [x] T087 Display 5 most recently updated ideas
- [x] T088 Link to idea detail pages
- [x] T089 Create empty state for no ideas
- [x] T090 Add "Create Your First Idea" CTA
- [x] T091 Test dashboard accuracy with mock data
- [x] T092 Create quick actions section (define actions: create idea, view all ideas, view dashboard)

### Responsive Design (Phase 2.7)
- [x] T093 Define Tailwind breakpoints (mobile: < 768px, tablet: 768-1024px, desktop: > 1024px)
- [x] T094 Create mobile hamburger menu component
- [x] T095 Implement sidebar for desktop/tablet
- [x] T096 Stack form layouts on mobile
- [x] T097 Implement 2-column idea grid for tablet
- [x] T098 Implement 3-column idea grid for desktop
- [x] T099 Test on physical mobile device
- [x] T100 Test on iPad/tablet
- [x] T101 Test on desktop
- [x] T102 Verify touch targets meet mobile standards (44x44px minimum)
- [x] T103 Create adaptive typography and spacing
- [x] T104 Test touch interactions

### API Integration (Phase 2.8)
- [x] T105 Create reusable HTTP client function
- [x] T106 Implement JWT token injection from Better Auth session
- [x] T107 Add request/response interceptors
- [x] T108 Implement error handling for all status codes (401, 403, 404, 500)
- [x] T109 Configure SWR for client-side data fetching
- [x] T110 Implement automatic revalidation strategy
- [x] T111 Implement optimistic updates for create/update/delete
- [x] T112 Add rollback on error
- [x] T113 Create Ideas API client with type-safe methods
- [x] T114 Create User API client with profile methods
- [x] T115 Implement toast notifications for success/error
- [x] T116 Add user-friendly error messages
- [x] T117 Implement retry logic for 500 errors
- [x] T118 Handle session expiry and redirect to signin
- [x] T119 Test API integration with FastAPI backend

### Unit & Component Testing (Phase 2.9.1)
- [ ] T136 Install and configure Vitest for unit testing
- [ ] T137 Install and configure React Testing Library for component testing
- [ ] T138 Configure coverage reporting with v8/c8
- [ ] T139 Write unit tests for lib/utils/cn.ts (class name merger)
- [ ] T140 Write unit tests for lib/utils/format.ts (date/string formatting)
- [ ] T141 Write unit tests for lib/utils/constants.ts (app constants)
- [ ] T142 Write unit tests for lib/validation/idea.ts (Zod schema validation)
- [ ] T143 Write component tests for IdeaCard component
- [ ] T144 Write component tests for IdeaForm component
- [ ] T145 Verify 80%+ unit test coverage for utility functions
- [ ] T146 Verify 80%+ component test coverage for key components
- [ ] T147 Set up pre-commit hook to run unit/component tests

### E2E Testing (Phase 2.9.2)
- [ ] T120 Install and configure Playwright
- [ ] T121 Create test directory structure
- [ ] T122 Configure test environment variables
- [ ] T123 Write signup flow tests (email, Google, GitHub)
- [ ] T124 Write signin flow test
- [ ] T125 Write sign out flow test
- [ ] T126 Write protected route redirect tests
- [ ] T127 Write ideas CRUD tests (create, read, update, delete)
- [ ] T128 Write filtering tests (stage, tags, priority, search)
- [ ] T129 Configure cross-browser testing (Chrome, Firefox, Safari)
- [ ] T130 Add mobile responsive tests
- [ ] T131 Add accessibility tests (keyboard navigation, screen readers)
- [ ] T132 Configure test reporting (HTML report, JSON report)
- [ ] T133 Run tests and verify 80%+ coverage
- [ ] T134 Verify 95%+ pass rate
- [ ] T135 Set up CI/CD for automated tests (optional)

---

## Success Metrics

### Phase Completion Criteria

| Phase | Metric | Target | Verification |
|-------|--------|----------|-------------|
| 2.1 Foundation Setup | Dev server runs | ✅ Manual verification |
| 2.2 Landing Page | LCP < 2.5s, FID < 100ms, CLS < 0.1 | ✅ Lighthouse testing |
| 2.3 Authentication | Sign up/sign in < 2min | ✅ Manual testing |
| 2.4 Ideas CRUD | CRUD ops work < 2s | ✅ Manual testing |
| 2.5 Filtering | Filter results < 1s | ✅ Manual testing |
| 2.6 Dashboard | Dashboard loads < 2s | ✅ Manual testing |
| 2.7 Responsive | Mobile usability 90%+ | ✅ Device testing |
| 2.8 API Integration | 99.9%+ API success | ✅ Monitoring |
| 2.9.1 Unit/Component Tests | 80%+ coverage | ✅ Vitest coverage report |
| 2.9.2 E2E Testing | 80%+ coverage, 95%+ pass rate | ✅ Test execution |

---

## Notes

**Manual Task Creation**: Tasks file created manually to bypass SpecKit validation constraint (multiple spec directories with same prefix '001'). All 84 tasks organized by user story and phase with skill activation references.

**Parallel Opportunities**:
- Phase 2.2 (Landing Page) and Phase 2.3 (Authentication Flow) can be developed in parallel once foundation is complete
- Phase 2.4 (Ideas CRUD) is independent and can start once auth is complete
- Filtering and search can be added incrementally
- Dashboard and responsive design can be parallelized with CRUD features

**Recommended Development Order**:
1. Complete Phase 2.1 (Foundation Setup) first - creates foundation for all subsequent work
2. Work on Phase 2.2 and 2.3 in parallel (once 2.1 is done)
3. Start Phase 2.4 and 2.8 in parallel (requires auth from 2.3)
4. Add Phase 2.5, 2.6, and 2.7 incrementally
5. Complete Phase 2.9 last (can be developed alongside Phase 2.5-2.7)

**Next Steps**:
1. Review this tasks file and approve
2. Begin Phase 2.1 (Foundation Setup) with `/nextjs16` skill
3. Follow skill activation references in each phase
4. Update checklist as tasks are completed
