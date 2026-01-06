# Tasks: Frontend Implementation - Phase 2

**Feature**: 001-frontend-implementation
**Status**: Ready for Implementation
**Plan**: [plan.md](./plan.md)
**Spec**: [spec.md](./spec.md)
**Total Tasks**: 84

---

## Task List

### Phase 2.1: Foundation Setup (Priority: P1)

- [ ] T001 Create Next.js 16 project structure
- [ ] T002 Install and configure TypeScript with strict mode
- [ ] T003 Install and configure Tailwind CSS 3.4
- [ ] T004 Install and initialize shadcn/ui component library
- [ ] T005 Create frontend directory structure (app/, components/, lib/, actions/)
- [ ] T006 Install Better Auth dependencies
- [ ] T007 Set up Drizzle ORM for auth database
- [ ] T008 Configure Better Auth instance
- [ ] T009 Create auth API routes structure
- [ ] T010 Create middleware for protected routes
- [ ] T011 Create .env.example template
- [ ] T012 Configure next.config.js (images, domains, headers)
- [ ] T013 Configure ESLint and Prettier
- [ ] T014 Set up TypeScript strict mode in tsconfig.json
- [ ] T015 Verify dev server runs successfully

**Independent Test**: Dev server starts and runs at http://localhost:3000
**Files**: None (setup files only)

---

### Phase 2.2: Landing Page (Priority: P1)

#### User Story 1: Modern Landing Page Experience

- [ ] T016 Create hero section component
- [ ] T017 Implement kinetic typography with Framer Motion
- [ ] T018 Add call-to-action buttons
- [ ] T019 Implement responsive layout (mobile/tablet/desktop)
- [ ] T020 Create features section with cards
- [ ] T021 Implement scroll animations
- [ ] T022 Create "How It Works" section
- [ ] T023 Implement scrollytelling with progressive reveals
- [ ] T024 Add smooth scroll navigation
- [ ] T025 Assemble landing page from components
- [ ] T026 Test on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [ ] T027 Run Lighthouse audit (target: LCP < 2.5s, FID < 100ms, CLS < 0.1)

**Independent Test**: Landing page renders at root URL with all sections, animations, and responsiveness
**Files**: `frontend/app/(public)/page.tsx`, `frontend/components/layout/landing-nav.tsx`, `frontend/components/landing/hero.tsx`, `frontend/components/landing/features.tsx`, `frontend/components/landing/how-it-works.tsx`
**Skills**: `/landing-page-design-2026`

---

### Phase 2.3: Authentication Flow (Priority: P1)

#### User Story 2: User Authentication

- [ ] T028 Create signup page component
- [ ] T029 Implement signup form with email/password
- [ ] T030 Add OAuth buttons (Google, GitHub)
- [ ] T031 Implement real-time form validation with Zod
- [ ] T032 Add error handling and display
- [ ] T033 Create signin page component
- [ ] T034 Implement email/password authentication
- [ ] T035 Add OAuth provider buttons
- [ ] T036 Implement "Remember me" functionality
- [ ] T037 Create user menu dropdown component
- [ ] T038 Implement sign out functionality
- [ ] T039 Clear auth state on sign out
- [ ] T040 Create middleware.ts for protected routes
- [ ] T041 Implement JWT token verification
- [ ] T042 Configure auth redirects (unauthenticated → signin, authenticated → dashboard)
- [ ] T043 Test complete auth flow (signup → dashboard, sign in → dashboard, sign out → landing)

**Independent Test**: Users can sign up (email/password + OAuth), sign in, and sign out with proper redirects
**Files**: `frontend/app/(public)/signin/page.tsx`, `frontend/app/(public)/signup/page.tsx`, `frontend/components/auth/signin-form.tsx`, `frontend/components/auth/signup-form.tsx`, `frontend/components/auth/oauth-buttons.tsx`, `frontend/components/auth/user-menu.tsx`, `frontend/src/middleware/auth.ts`
**Skills**: `/better-auth-nextjs`

---

### Phase 2.4: Ideas List & CRUD (Priority: P1)

#### User Story 3: Create and Manage Content Ideas

- [ ] T044 Create ideas list page component
- [ ] T045 Create idea card component
- [ ] T046 Implement idea cards with all attributes (title, stage badge, priority badge, tags, timestamp)
- [ ] T047 Create stage badges (idea: blue, outline: yellow, draft: orange, published: green)
- [ ] T048 Create priority badges (high: red, medium: yellow, low: gray)
- [ ] T049 Display tags as badges
- [ ] T050 Create idea form component
- [ ] T051 Implement form validation with React Hook Form + Zod
- [ ] T052 Add real-time validation feedback
- [ ] T053 Create edit idea page component
- [ ] T054 Pre-fill edit form with existing data
- [ ] T055 Implement form submission logic
- [ ] T056 Add delete confirmation dialog
- [ ] T057 Implement delete action
- [ ] T058 Create idea detail page component
- [ ] T059 Display all idea information
- [ ] T060 Link to edit functionality
- [ ] T061 Implement API client with JWT injection
- [ ] T062 Create SWR data fetching hooks
- [ ] T063 Implement optimistic updates
- [ ] T064 Add loading skeletons
- [ ] T065 Implement error handling with retry
- [ ] T066 Test all CRUD operations (create, read, update, delete)

**Independent Test**: Users can create, view, edit, and delete ideas with validation, optimistic updates, and error handling
**Files**: `frontend/app/(protected)/ideas/page.tsx`, `frontend/app/(protected)/ideas/new/page.tsx`, `frontend/app/(protected)/ideas/[id]/page.tsx`, `frontend/app/(protected)/ideas/[id]/edit/page.tsx`, `frontend/components/ideas/idea-card.tsx`, `frontend/components/ideas/idea-form.tsx`, `frontend/components/ideas/delete-dialog.tsx`, `frontend/components/ideas/empty-state.tsx`, `frontend/components/ideas/loading.tsx`, `frontend/components/ideas/stage-badge.tsx`, `frontend/components/ideas/priority-badge.tsx`
**Skills**: `/nextjs16`, `/styling-with-shadcn`

---

### Phase 2.5: Filtering & Search (Priority: P2)

#### User Story 4: Filter and Search Ideas

- [ ] T067 Create stage filter dropdown component
- [ ] T068 Create priority filter dropdown component
- [ ] T069 Implement multi-select tag filter
- [ ] T070 Add clear filters button
- [ ] T071 Create search input component
- [ ] T072 Implement debounce for search (useDebounce hook)
- [ ] T073 Implement search logic (title + notes, case-insensitive)
- [ ] T074 Highlight search matches
- [ ] T075 Persist filters in URL searchParams
- [ ] T076 Handle browser back/forward navigation
- [ ] T077 Create shareable filter URLs
- [ ] T078 Apply filters to data fetching
- [ ] T079 Update displayed results
- [ ] T080 Test filter combinations (stage, tags, priority, search)
- [ ] T081 Test browser navigation

**Independent Test**: Users can filter by stage, tags, priority, and search by title/notes with URL state persistence
**Files**: `frontend/components/ideas/idea-filters.tsx`, `frontend/components/ideas/idea-search.tsx`, `frontend/app/(protected)/ideas/page.tsx` (modified)
**Skills**: `/nextjs16`

---

### Phase 2.6: Dashboard (Priority: P2)

#### User Story 5: Dashboard Overview

- [ ] T082 Create dashboard page component
- [ ] T083 Create stats card component
- [ ] T084 Display total ideas count
- [ ] T085 Show ideas by stage counts
- [ ] T086 Create recent ideas widget
- [ ] T087 Display 5 most recently updated ideas
- [ ] T088 Link to idea detail pages
- [ ] T089 Create empty state for no ideas
- [ ] T090 Add "Create Your First Idea" CTA
- [ ] T091 Test dashboard accuracy with mock data
- [ ] T092 Create quick actions section

**Independent Test**: Dashboard displays accurate statistics, recent ideas, and empty state with actionable CTAs
**Files**: `frontend/app/(protected)/dashboard/page.tsx`, `frontend/components/dashboard/stats-card.tsx`, `frontend/components/dashboard/recent-ideas.tsx`, `frontend/components/dashboard/empty-state.tsx`, `frontend/components/dashboard/quick-actions.tsx`
**Skills**: `/styling-with-shadcn`

---

### Phase 2.7: Responsive Design (Priority: P2)

#### User Story 6: Responsive Design Across Devices

- [ ] T093 Define Tailwind breakpoints (mobile: < 768px, tablet: 768-1024px, desktop: > 1024px)
- [ ] T094 Create mobile hamburger menu component
- [ ] T095 Implement sidebar for desktop/tablet
- [ ] T096 Stack form layouts on mobile
- [ ] T097 Implement 2-column idea grid for tablet
- [ ] T098 Implement 3-column idea grid for desktop
- [ ] T099 Test on physical mobile device
- [ ] T100 Test on iPad/tablet
- [ ] T101 Test on desktop
- [ ] T102 Verify touch targets meet mobile standards (44x44px minimum)
- [ ] T103 Create adaptive typography and spacing
- [ ] T104 Test touch interactions

**Independent Test**: Application works seamlessly on mobile, tablet, and desktop with proper breakpoints and touch interactions
**Files**: `frontend/app/(protected)/layout.tsx` (modified), `frontend/components/layout/sidebar.tsx`, `frontend/components/layout/mobile-menu.tsx`, `frontend/app/globals.css` (modified)
**Skills**: `/styling-with-shadcn`, `/modern-ui-ux-theming`

---

### Phase 2.8: API Integration (Priority: P1)

#### User Story 7: API Integration with Backend

- [ ] T105 Create reusable HTTP client function
- [ ] T106 Implement JWT token injection from Better Auth session
- [ ] T107 Add request/response interceptors
- [ ] T108 Implement error handling for all status codes (401, 403, 404, 500)
- [ ] T109 Configure SWR for client-side data fetching
- [ ] T110 Implement automatic revalidation strategy
- [ ] T111 Implement optimistic updates for create/update/delete
- [ ] T112 Add rollback on error
- [ ] T113 Create Ideas API client with type-safe methods
- [ ] T114 Create User API client with profile methods
- [ ] T115 Implement toast notifications for success/error
- [ ] T116 Add user-friendly error messages
- [ ] T117 Implement retry logic for 500 errors
- [ ] T118 Handle session expiry and redirect to signin
- [ ] T119 Test API integration with FastAPI backend

**Independent Test**: All data operations persist to backend with proper error handling, JWT authentication, and optimistic updates
**Files**: `frontend/lib/api/client.ts`, `frontend/lib/api/ideas.ts`, `frontend/lib/api/users.ts`, `frontend/components/shared/toast.tsx`, `frontend/components/shared/error-state.tsx`
**Skills**: `/frontend-backend-jwt-verification`

---

### Phase 2.9: E2E Testing (Priority: P3)

#### User Story 8: End-to-End Testing Coverage

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

**Independent Test**: E2E tests cover 80%+ of critical user journeys with 95%+ pass rate
**Files**: `frontend/tests/e2e/auth/signup.spec.ts`, `frontend/tests/e2e/auth/signin.spec.ts`, `frontend/tests/e2e/auth/signout.spec.ts`, `frontend/tests/e2e/ideas/crud.spec.ts`, `frontend/tests/e2e/ideas/filters.spec.ts`, `frontend/tests/e2e/fixtures/`, `playwright.config.ts`, `frontend/package.json` (modified)
**Skills**: `/systematic-debugging`, `/nextjs-dev-tool`

---

## Dependencies Graph

### User Story Completion Order

```
US1: Landing Page → US2: Auth → US3: Ideas CRUD → US4: Filters → US5: Dashboard → US6: Responsive → US7: API Integration → US8: E2E Tests
                      ↓
US1 creates: All landing page components (hero, features, how-it-works)
US2 creates: Auth forms, middleware, user menu
US3 creates: Idea cards, forms, detail pages
US4 creates: Filter components, search input
US5 creates: Stats cards, recent ideas widget
US6 creates: Layout components (mobile menu, sidebar)
US7 creates: API client, error handling
US8 creates: E2E tests
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
- Complete Phase 2.9 (E2E Testing)
- Performance optimization and polish
- **Production Milestone**: Full feature deployment

---

## Test Strategy

### Unit Tests (Target: 80%+ Coverage)

**Utility Functions to Test:**
- `lib/utils/cn.ts` - Class name merger
- `lib/utils/format.ts` - Date/string formatting
- `lib/utils/constants.ts` - App constants
- `lib/validation/idea.ts` - Zod schema validation

**Components to Test:**
- All form components with validation
- All idea components
- Filter components
- Dashboard components

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

### Foundation Setup (Phase 2.1)
- [ ] T001 Create Next.js 16 project structure
- [ ] T002 Install and configure TypeScript with strict mode
- [ ] T003 Install and configure Tailwind CSS 3.4
- [ ] T004 Install and initialize shadcn/ui component library
- [ ] T005 Create frontend directory structure (app/, components/, lib/, actions/)
- [ ] T006 Install Better Auth dependencies
- [ ] T007 Set up Drizzle ORM for auth database
- [ ] T008 Configure Better Auth instance
- [ ] T009 Create auth API routes structure
- [ ] T010 Create middleware for protected routes
- [ ] T011 Create .env.example template
- [ ] T012 Configure next.config.js (images, domains, headers)
- [ ] T013 Configure ESLint and Prettier
- [ ] T014 Set up TypeScript strict mode in tsconfig.json
- [ ] T015 Verify dev server runs successfully

### Landing Page (Phase 2.2)
- [ ] T016 Create hero section component
- [ ] T017 Implement kinetic typography with Framer Motion
- [ ] T018 Add call-to-action buttons
- [ ] T019 Implement responsive layout (mobile/tablet/desktop)
- [ ] T020 Create features section with cards
- [ ] T021 Implement scroll animations
- [ ] T022 Create "How It Works" section
- [ ] T023 Implement scrollytelling with progressive reveals
- [ ] T024 Add smooth scroll navigation
- [ ] T025 Assemble landing page from components
- [ ] T026 Test on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [ ] T027 Run Lighthouse audit (target: LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Authentication Flow (Phase 2.3)
- [ ] T028 Create signup page component
- [ ] T029 Implement signup form with email/password
- [ ] T030 Add OAuth buttons (Google, GitHub)
- [ ] T031 Implement real-time form validation with Zod
- [ ] T032 Add error handling and display
- [ ] T033 Create signin page component
- [ ] T034 Implement email/password authentication
- [ ] T035 Add OAuth provider buttons
- [ ] T036 Implement "Remember me" functionality
- [ ] T037 Create user menu dropdown component
- [ ] T038 Implement sign out functionality
- [ ] T039 Clear auth state on sign out
- [ ] T040 Create middleware.ts for protected routes
- [ ] T041 Implement JWT token verification
- [ ] T042 Configure auth redirects (unauthenticated → signin, authenticated → dashboard)
- [ ] T043 Test complete auth flow (signup → dashboard, sign in → dashboard, sign out → landing)

### Ideas List & CRUD (Phase 2.4)
- [ ] T044 Create ideas list page component
- [ ] T045 Create idea card component
- [ ] T046 Implement idea cards with all attributes (title, stage badge, priority badge, tags, timestamp)
- [ ] T047 Create stage badges (idea: blue, outline: yellow, draft: orange, published: green)
- [ ] T048 Create priority badges (high: red, medium: yellow, low: gray)
- [ ] T049 Display tags as badges
- [ ] T050 Create idea form component
- [ ] T051 Implement form validation with React Hook Form + Zod
- [ ] T052 Add real-time validation feedback
- [ ] T053 Create edit idea page component
- [ ] T054 Pre-fill edit form with existing data
- [ ] T055 Implement form submission logic
- [ ] T056 Add delete confirmation dialog
- [ ] T057 Implement delete action
- [ ] T058 Create idea detail page component
- [ ] T059 Display all idea information
- [ ] T060 Link to edit functionality
- [ ] T061 Implement API client with JWT injection
- [ ] T062 Create SWR data fetching hooks
- [ ] T063 Implement optimistic updates
- [ ] T064 Add loading skeletons
- [ ] T065 Implement error handling with retry
- [ ] T066 Test all CRUD operations (create, read, update, delete)

### Filtering & Search (Phase 2.5)
- [ ] T067 Create stage filter dropdown component
- [ ] T068 Create priority filter dropdown component
- [ ] T069 Implement multi-select tag filter
- [ ] T070 Add clear filters button
- [ ] T071 Create search input component
- [ ] T072 Implement debounce for search (useDebounce hook)
- [ ] T073 Implement search logic (title + notes, case-insensitive)
- [ ] T074 Highlight search matches
- [ ] T075 Persist filters in URL searchParams
- [ ] T076 Handle browser back/forward navigation
- [ ] T077 Create shareable filter URLs
- [ ] T078 Apply filters to data fetching
- [ ] T079 Update displayed results
- [ ] T080 Test filter combinations (stage, tags, priority, search)
- [ ] T081 Test browser navigation

### Dashboard (Phase 2.6)
- [ ] T082 Create dashboard page component
- [ ] T083 Create stats card component
- [ ] T084 Display total ideas count
- [ ] T085 Show ideas by stage counts
- [ ] T086 Create recent ideas widget
- [ ] T087 Display 5 most recently updated ideas
- [ ] T088 Link to idea detail pages
- [ ] T089 Create empty state for no ideas
- [ ] T090 Add "Create Your First Idea" CTA
- [ ] T091 Test dashboard accuracy with mock data
- [ ] T092 Create quick actions section

### Responsive Design (Phase 2.7)
- [ ] T093 Define Tailwind breakpoints (mobile: < 768px, tablet: 768-1024px, desktop: > 1024px)
- [ ] T094 Create mobile hamburger menu component
- [ ] T095 Implement sidebar for desktop/tablet
- [ ] T096 Stack form layouts on mobile
- [ ] T097 Implement 2-column idea grid for tablet
- [ ] T098 Implement 3-column idea grid for desktop
- [ ] T099 Test on physical mobile device
- [ ] T100 Test on iPad/tablet
- [ ] T101 Test on desktop
- [ ] T102 Verify touch targets meet mobile standards (44x44px minimum)
- [ ] T103 Create adaptive typography and spacing
- [ ] T104 Test touch interactions

### API Integration (Phase 2.8)
- [ ] T105 Create reusable HTTP client function
- [ ] T106 Implement JWT token injection from Better Auth session
- [ ] T107 Add request/response interceptors
- [ ] T108 Implement error handling for all status codes (401, 403, 404, 500)
- [ ] T109 Configure SWR for client-side data fetching
- [ ] T110 Implement automatic revalidation strategy
- [ ] T111 Implement optimistic updates for create/update/delete
- [ ] T112 Add rollback on error
- [ ] T113 Create Ideas API client with type-safe methods
- [ ] T114 Create User API client with profile methods
- [ ] T115 Implement toast notifications for success/error
- [ ] T116 Add user-friendly error messages
- [ ] T117 Implement retry logic for 500 errors
- [ ] T118 Handle session expiry and redirect to signin
- [ ] T119 Test API integration with FastAPI backend

### E2E Testing (Phase 2.9)
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
| 2.9 E2E Testing | 80%+ coverage, 95%+ pass rate | ✅ Test execution |

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
