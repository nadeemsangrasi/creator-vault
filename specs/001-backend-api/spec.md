# Feature Specification: Backend API for Content Idea Management

**Feature Branch**: `001-backend-api`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "Backend API implementation for CreatorVault Phase 2 with authenticated CRUD operations for content ideas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Retrieve Content Ideas (Priority: P1)

A content creator wants to capture new content ideas and view them later for planning purposes.

**Why this priority**: This is the core value proposition of CreatorVault - capturing and managing creative ideas. Without this functionality, the platform has no purpose.

**Independent Test**: Can be fully tested by creating a content idea via API with title and notes, then retrieving it by ID. Delivers immediate value by allowing users to store and access their creative concepts.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they submit a new idea with a title "AI Writing Tools Comparison", **Then** the system creates the idea with a unique ID and returns confirmation with the idea details
2. **Given** an idea exists with ID 42, **When** the user requests idea 42, **Then** the system returns the complete idea details including title, notes, creation timestamp, and current stage
3. **Given** a user with 5 saved ideas, **When** they request all their ideas, **Then** the system returns a list of all 5 ideas ordered by creation date (newest first)
4. **Given** an unauthenticated request, **When** attempting to create an idea, **Then** the system rejects the request with authentication required error

---

### User Story 2 - Update Content Idea Details and Stage (Priority: P1)

A content creator wants to edit idea details as they evolve and track progress through content stages (idea → outline → draft → published).

**Why this priority**: Ideas evolve over time. Creators need to add details, fix typos, and track where each idea is in the content creation pipeline. Stage tracking is a key differentiator from simple note apps.

**Independent Test**: Can be tested by creating an idea, then updating its title/notes and advancing its stage from "idea" to "outline". Delivers value by allowing creators to refine and track their content workflow.

**Acceptance Scenarios**:

1. **Given** an idea exists with title "AI Tools", **When** the user updates the title to "Top 5 AI Writing Tools for 2026", **Then** the system updates the title and returns the updated idea with new modification timestamp
2. **Given** an idea at "idea" stage, **When** the user advances it to "outline" stage, **Then** the system updates the stage and preserves all other idea details
3. **Given** an idea belongs to User A, **When** User B attempts to update it, **Then** the system rejects the request with authorization error
4. **Given** an idea with notes field empty, **When** the user adds detailed notes, **Then** the system saves the notes and returns success
5. **Given** a user attempts to set an invalid stage "in-progress", **When** submitting the update, **Then** the system rejects the request with validation error listing valid stages

---

### User Story 3 - Delete Unwanted Ideas (Priority: P1)

A content creator wants to remove ideas that are no longer relevant or were captured by mistake.

**Why this priority**: Clutter reduces productivity. Creators must be able to curate their idea vault by removing outdated or irrelevant entries.

**Independent Test**: Can be tested by creating an idea and then deleting it by ID. Attempting to retrieve the deleted idea should fail. Delivers value by giving users control over their content.

**Acceptance Scenarios**:

1. **Given** an idea exists with ID 10, **When** the user deletes idea 10, **Then** the system removes the idea and returns success confirmation
2. **Given** idea 10 was deleted, **When** the user attempts to retrieve idea 10, **Then** the system returns "not found" error
3. **Given** an idea belongs to User A, **When** User B attempts to delete it, **Then** the system rejects the request with authorization error
4. **Given** a non-existent idea ID 999, **When** the user attempts to delete it, **Then** the system returns "not found" error

---

### User Story 4 - Organize Ideas with Tags and Priorities (Priority: P2)

A content creator wants to categorize ideas by content type (blog, video, podcast) and importance (high, medium, low) for better organization.

**Why this priority**: As idea vaults grow, organization becomes critical. Tags and priorities help creators focus on what matters most. This is secondary to basic CRUD but essential for scaling usage.

**Independent Test**: Can be tested by creating ideas with different tags and priorities, then verifying they are stored and retrieved correctly. Delivers value by enabling content organization strategies.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they create an idea with tags ["blog", "seo"] and priority "high", **Then** the system saves these attributes and returns them with the idea
2. **Given** an idea with tags ["video"], **When** the user updates tags to ["video", "tutorial"], **Then** the system replaces the old tags with the new ones
3. **Given** a user creates an idea without specifying priority, **When** retrieving the idea, **Then** the system returns priority "medium" as the default
4. **Given** a user attempts to set priority "urgent", **When** submitting the idea, **Then** the system rejects the request with validation error listing valid priorities (high, medium, low)

---

### User Story 5 - Search and Filter Ideas (Priority: P2)

A content creator wants to find specific ideas using keyword search and filter by stage, tags, or priority.

**Why this priority**: With dozens or hundreds of ideas, manual scrolling becomes impractical. Search and filtering enable creators to quickly locate relevant content.

**Independent Test**: Can be tested by creating 10 ideas with varied attributes, then filtering by stage="draft" and verifying only draft-stage ideas return. Delivers value by making large idea collections manageable.

**Acceptance Scenarios**:

1. **Given** ideas containing "AI", "Machine Learning", and "Blockchain" in their titles, **When** the user searches for "AI", **Then** the system returns only ideas with "AI" in title or notes
2. **Given** ideas at various stages (3 at "idea", 2 at "draft", 1 at "published"), **When** the user filters by stage="draft", **Then** the system returns exactly 2 ideas
3. **Given** ideas with tags ["blog"], ["video"], and ["blog", "video"], **When** the user filters by tag="blog", **Then** the system returns both ideas containing the "blog" tag
4. **Given** 50 ideas exist, **When** the user requests ideas with limit=20, **Then** the system returns exactly 20 ideas with pagination metadata
5. **Given** a user filters by priority="high" and stage="idea", **When** both filters are applied, **Then** the system returns only ideas matching BOTH criteria

---

### User Story 6 - Set Due Dates for Content Deadlines (Priority: P3)

A content creator wants to assign due dates to ideas to track content publishing deadlines and upcoming commitments.

**Why this priority**: Professional creators work with deadlines (client deliverables, editorial calendars, content schedules). This feature adds time-based urgency to idea management.

**Independent Test**: Can be tested by creating an idea with a due date one week from today, retrieving it, and verifying the due date is stored correctly. Delivers value for deadline-driven workflows.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they create an idea with due_date set to "2026-01-15", **Then** the system stores the due date and returns it with the idea
2. **Given** an idea without a due date, **When** the user updates it to add due_date "2026-02-01", **Then** the system saves the due date
3. **Given** an idea with due_date "2026-01-20", **When** the user removes the due date (sets to null), **Then** the system clears the due date field
4. **Given** a user creates an idea without specifying due_date, **When** retrieving the idea, **Then** the due_date field is null/empty

---

### User Story 7 - Sort Ideas by Different Criteria (Priority: P3)

A content creator wants to sort their ideas by creation date, priority, stage, or title to view them in different meaningful orders.

**Why this priority**: Different workflows require different views. Sorting by priority helps focus on important work, while sorting by date shows recent captures.

**Independent Test**: Can be tested by creating 5 ideas with different priorities, then requesting them sorted by priority descending and verifying the order. Delivers value through flexible content views.

**Acceptance Scenarios**:

1. **Given** ideas created on different dates, **When** the user sorts by created_at descending, **Then** the system returns ideas with newest first
2. **Given** ideas with priorities (high, low, high, medium), **When** the user sorts by priority descending, **Then** the system returns ideas ordered: high, high, medium, low
3. **Given** ideas at stages (published, idea, draft, outline), **When** the user sorts by stage alphabetically, **Then** the system returns ideas in alphabetical stage order
4. **Given** a user sorts by title ascending, **When** requesting the list, **Then** ideas are returned in alphabetical order by title

---

### Edge Cases

- What happens when a user tries to create an idea with a title exceeding 200 characters? System rejects with validation error specifying max length.
- What happens when a user tries to retrieve ideas but has none saved? System returns empty array with success status.
- What happens when pagination offset exceeds total idea count? System returns empty array with pagination metadata showing no results.
- What happens when a user submits an empty title? System rejects with validation error requiring title.
- What happens when a user updates an idea but provides no changes? System returns success with unchanged idea.
- What happens when concurrent requests attempt to update the same idea? Last write wins, modification timestamp reflects the final update.
- What happens when a user tries to filter by both stage="idea" and stage="draft"? System interprets as OR logic and returns ideas matching either stage.
- What happens when database connection fails during idea creation? System returns service unavailable error with retry guidance.
- What happens when JWT token expires mid-session? System returns authentication error requiring re-login.
- What happens when a user provides invalid date format for due_date? System rejects with validation error specifying expected format.

## Requirements *(mandatory)*

### Functional Requirements

#### Core CRUD Operations

- **FR-001**: System MUST allow authenticated users to create content ideas with required title (max 200 characters) and optional notes (max 5000 characters)
- **FR-002**: System MUST assign each created idea a unique identifier that persists across sessions
- **FR-003**: System MUST automatically record creation timestamp and last modification timestamp for each idea
- **FR-004**: System MUST allow users to retrieve a specific idea by its unique identifier
- **FR-005**: System MUST allow users to retrieve all their ideas in a paginated list
- **FR-006**: System MUST allow users to update idea title, notes, stage, tags, priority, and due date
- **FR-007**: System MUST allow users to permanently delete ideas they own
- **FR-008**: System MUST update modification timestamp whenever an idea is changed

#### Stage Management

- **FR-009**: System MUST support exactly four content stages: "idea", "outline", "draft", "published"
- **FR-010**: System MUST default new ideas to "idea" stage unless explicitly specified
- **FR-011**: System MUST validate stage values and reject invalid stages with clear error messages
- **FR-012**: System MUST allow users to advance or change idea stage at any time

#### Tagging and Organization

- **FR-013**: System MUST allow users to assign multiple tags to each idea
- **FR-014**: System MUST store tags as an array that can be empty or contain multiple values
- **FR-015**: System MUST support tag-based filtering to retrieve ideas matching one or more tags
- **FR-016**: System MUST treat tags as case-sensitive strings

#### Priority Management

- **FR-017**: System MUST support exactly three priority levels: "high", "medium", "low"
- **FR-018**: System MUST default new ideas to "medium" priority unless explicitly specified
- **FR-019**: System MUST validate priority values and reject invalid priorities with clear error messages

#### Due Date Management

- **FR-020**: System MUST allow users to optionally assign due dates to ideas
- **FR-021**: System MUST store due dates in ISO 8601 format with timezone information
- **FR-022**: System MUST allow users to set, update, or remove due dates at any time
- **FR-023**: System MUST validate date formats and reject malformed dates with clear error messages

#### Search and Filtering

- **FR-024**: System MUST allow users to search ideas by keywords in title and notes fields
- **FR-025**: System MUST support filtering ideas by stage (single value)
- **FR-026**: System MUST support filtering ideas by tags (one or more tags using OR logic)
- **FR-027**: System MUST support filtering ideas by priority (single value)
- **FR-028**: System MUST allow combining multiple filters (stage, tags, priority, search) with AND logic
- **FR-029**: System MUST perform case-insensitive keyword search

#### Sorting and Pagination

- **FR-030**: System MUST support sorting ideas by creation date, modification date, title, priority, or stage
- **FR-031**: System MUST support both ascending and descending sort orders
- **FR-032**: System MUST default to descending creation date order when no sort specified
- **FR-033**: System MUST support pagination with configurable page size (limit) and offset
- **FR-034**: System MUST default to 20 ideas per page when limit not specified
- **FR-035**: System MUST enforce maximum page size of 100 ideas
- **FR-036**: System MUST include pagination metadata (total count, has_more flag) in list responses

#### Authentication and Authorization

- **FR-037**: System MUST require valid authentication for all idea operations
- **FR-038**: System MUST verify JWT tokens issued by the authentication service
- **FR-039**: System MUST extract user identity from validated JWT tokens
- **FR-040**: System MUST ensure users can only access ideas they own
- **FR-041**: System MUST reject requests with missing or invalid authentication tokens
- **FR-042**: System MUST reject requests where user attempts to access another user's ideas

#### Data Validation

- **FR-043**: System MUST validate all input data before processing
- **FR-044**: System MUST reject ideas with missing or empty titles
- **FR-045**: System MUST reject titles exceeding 200 characters
- **FR-046**: System MUST reject notes exceeding 5000 characters
- **FR-047**: System MUST return detailed validation errors specifying which fields failed and why

#### Error Handling

- **FR-048**: System MUST return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500, 503)
- **FR-049**: System MUST return structured error responses with error code, message, and request ID
- **FR-050**: System MUST handle database connection failures gracefully with service unavailable errors
- **FR-051**: System MUST handle concurrent update conflicts with last-write-wins strategy
- **FR-052**: System MUST log all errors with sufficient detail for debugging

#### API Documentation

- **FR-053**: System MUST provide interactive API documentation accessible via web browser
- **FR-054**: System MUST document all endpoints with request/response examples
- **FR-055**: System MUST document all error scenarios with example error responses
- **FR-056**: System MUST document authentication requirements for each endpoint

#### Health and Monitoring

- **FR-057**: System MUST provide health check endpoint that verifies API availability
- **FR-058**: System MUST provide database health check endpoint that verifies database connectivity
- **FR-059**: System MUST provide readiness probe endpoint for deployment orchestration
- **FR-060**: System MUST log all API requests with correlation IDs for tracing

### Key Entities

- **Content Idea**: Represents a creator's content concept with title, notes, stage in content pipeline, organizational tags, priority level, optional deadline, ownership information, and timestamps for audit trail
- **User**: Represents an authenticated creator who owns ideas (managed externally by authentication service, referenced by user identifier)
- **Stage**: Represents the phase of content development - idea (initial concept), outline (structured plan), draft (written content), published (completed work)
- **Priority**: Represents the importance or urgency level - high (immediate attention), medium (normal priority), low (future consideration)
- **Tag**: Represents a content type or category label used for organization (blog, video, podcast, social, seo, tutorial, etc.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can capture a new content idea in under 10 seconds from authentication to confirmation
- **SC-002**: Users can retrieve their complete idea list in under 2 seconds regardless of collection size
- **SC-003**: Users can search and filter 1000+ ideas with results returning in under 1 second
- **SC-004**: System handles 100 concurrent users creating ideas simultaneously without errors
- **SC-005**: System maintains 99.9% uptime for API availability during business hours
- **SC-006**: Users successfully complete CRUD operations on first attempt 95% of the time (no confusing errors)
- **SC-007**: System prevents unauthorized access to ideas 100% of the time (no security breaches)
- **SC-008**: Users can advance an idea through all 4 stages without losing any data
- **SC-009**: Search functionality returns relevant results (ideas containing search term) 100% of the time
- **SC-010**: System provides clear, actionable error messages that users can understand and resolve
- **SC-011**: API documentation is complete enough that developers can integrate without additional support 90% of the time
- **SC-012**: System gracefully handles database outages by returning service unavailable errors instead of crashing
- **SC-013**: Pagination works correctly with no duplicate or missing ideas when navigating pages
- **SC-014**: Users can organize 100+ ideas using tags and priorities without performance degradation
- **SC-015**: System logs all operations with enough detail to diagnose issues within 5 minutes

## Assumptions *(mandatory)*

1. **Authentication Service Exists**: A separate authentication service (Better Auth) already handles user signup, login, and JWT token issuance. This backend API only verifies JWT tokens.

2. **User Identity Format**: JWT tokens contain a "sub" claim with the user's unique identifier as a string. This identifier is used to associate ideas with owners.

3. **Token Expiration Handling**: Frontend handles JWT token expiration and renewal. Backend simply rejects expired tokens with 401 error.

4. **Content Encryption Not Required**: While CreatorVault is "privacy-first", encryption of idea content is handled at the infrastructure level (TLS in transit, database encryption at rest). Application-level encryption is not required for Phase 2.

5. **Single-User Ownership**: Each idea has exactly one owner. Collaborative editing or sharing is out of scope for Phase 2.

6. **No Soft Deletes**: Deleted ideas are permanently removed from the database. Trash/recycle bin functionality is out of scope.

7. **Standard Web Performance**: "Fast" responses mean sub-second for most operations, under 2 seconds for complex queries. These are standard web app expectations.

8. **UTF-8 Content Support**: All text fields support UTF-8 encoding for international characters. No special multilingual processing required.

9. **Date/Time Format**: All dates use ISO 8601 format with UTC timezone. Frontend handles timezone conversion for display.

10. **Sequential Consistency**: Database provides sequential consistency (last write wins). Strong consistency across distributed systems not required for Phase 2.

11. **Standard HTTP Status Codes**: API uses conventional HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error, 503 Service Unavailable).

12. **No File Uploads**: Ideas are text-only. Image/audio/video attachments are out of scope for Phase 2.

13. **Default Sorting and Pagination**: When clients don't specify sort/pagination parameters, reasonable defaults are applied (newest first, 20 per page).

14. **Tag Simplicity**: Tags are simple string labels. Tag hierarchies, tag suggestions, or tag autocomplete are out of scope.

15. **English Error Messages**: All error messages and API documentation are in English. Localization is out of scope for Phase 2.

## Out of Scope *(mandatory)*

The following features are explicitly NOT included in Phase 2 backend implementation:

1. **User Registration and Login**: Handled by separate Better Auth service, not this backend API
2. **Password Management**: Reset password, change password - managed by authentication service
3. **Email Notifications**: Reminder emails, due date notifications - deferred to Phase 3+
4. **Real-Time Sync**: WebSocket connections, live updates - deferred to Phase 5
5. **Collaboration Features**: Sharing ideas, commenting, co-authorship - not in roadmap
6. **File Attachments**: Upload images, PDFs, audio notes - Phase 3+
7. **Version History**: Track changes over time, revert to previous versions - post-Phase 5
8. **AI-Powered Features**: Content expansion, brainstorming suggestions - Phase 3 focus
9. **Bulk Operations**: Delete multiple ideas, batch updates - nice-to-have for future
10. **Export Functionality**: Download as CSV, JSON, PDF - post-Phase 2
11. **Advanced Search**: Fuzzy matching, stemming, relevance scoring - Phase 3+
12. **Tag Management**: Rename tags globally, merge tags, tag suggestions - future enhancement
13. **Analytics**: Idea creation trends, productivity metrics - Phase 4+
14. **Third-Party Integrations**: Notion, Trello, Evernote sync - post-hackathon
15. **Mobile-Specific Endpoints**: Offline sync, conflict resolution - Phase 4+
16. **Rate Limiting Per User**: Global rate limiting acceptable, per-user quotas out of scope
17. **Audit Logging**: Detailed activity logs beyond basic operation logs - Phase 5+
18. **Data Retention Policies**: Auto-delete old ideas, archive functionality - future
19. **Multi-Tenancy**: Organizations, teams, workspaces - not in roadmap
20. **Custom Fields**: User-defined attributes beyond standard schema - post-hackathon

## Dependencies *(mandatory)*

1. **Better Auth Service**: External authentication service must be operational and issuing valid JWT tokens with user identifier in "sub" claim
2. **Neon PostgreSQL Database**: Serverless PostgreSQL database must be provisioned and accessible with connection string
3. **Frontend Application**: Next.js frontend must handle user authentication, obtain JWT tokens, and include them in API requests
4. **TLS/HTTPS Infrastructure**: Production deployment requires HTTPS for secure token transmission
5. **CORS Configuration**: API must whitelist frontend domain for cross-origin requests
6. **Deployment Platform**: Railway, Render, or DigitalOcean App Platform for hosting the backend service
7. **Environment Variables**: Configuration values (database URL, JWT public key, allowed origins) must be provided at runtime
8. **Database Migrations**: Alembic migration tool must be run before API starts to ensure schema exists
9. **Logging Infrastructure**: Structured log collection system (optional but recommended for production)
10. **Health Check Monitoring**: External monitoring service to detect API downtime (optional but recommended)

## Risks and Mitigations *(mandatory)*

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Better Auth JWT verification fails | HIGH - No users can access API | MEDIUM | Implement detailed JWT verification error logging; provide fallback health check endpoint that doesn't require auth |
| Database connection pool exhaustion | HIGH - API becomes unresponsive | MEDIUM | Configure appropriate connection pool size; implement connection timeout and retry logic; monitor active connections |
| Slow query performance at scale | MEDIUM - Poor user experience with large idea collections | HIGH | Add database indexes on user_id, stage, priority, created_at; implement query timeout limits; use pagination |
| Concurrent update conflicts | LOW - Users lose changes | LOW | Accept last-write-wins strategy for Phase 2; document behavior; consider optimistic locking in future |
| Unvalidated input causes injection | HIGH - Security vulnerability | LOW | Use parameterized queries exclusively; validate all input with strict schemas; apply principle of least privilege to database user |
| API breaking changes affect frontend | HIGH - Frontend stops working | MEDIUM | Version API endpoints (/api/v1/); maintain backward compatibility within v1; coordinate deployments with frontend team |
| Missing error handling causes crashes | MEDIUM - Intermittent failures | MEDIUM | Implement global exception handler; test all error scenarios; log stack traces for debugging |
| Insufficient logging hinders debugging | MEDIUM - Cannot diagnose production issues | HIGH | Implement structured logging with correlation IDs; log all errors with context; avoid logging sensitive data |
| Deployment environment misconfiguration | HIGH - API doesn't start | MEDIUM | Validate all required environment variables on startup; fail fast with clear error messages; document all config requirements |
| Phase 3 AI integration requires schema changes | MEDIUM - Rework required | MEDIUM | Review Phase 3 requirements early; design schema with extensibility in mind; avoid hard-coded assumptions |

## Compliance and Security *(optional - include if relevant)*

### Data Privacy

- User-generated content (ideas) is private by default and only accessible to the owner
- No analytics tracking or data sharing with third parties
- Database connections use TLS encryption in transit
- Neon PostgreSQL provides encryption at rest by default

### Authentication Security

- All endpoints require valid JWT authentication except health checks and API documentation
- JWT tokens use RS256 algorithm (RSA public-key signature)
- Expired tokens are rejected immediately
- Users cannot access ideas belonging to other users

### Input Validation

- All user input is validated against strict schemas before processing
- String length limits enforced (title: 200 chars, notes: 5000 chars)
- Enum values validated against allowed sets (stage, priority)
- Date formats validated to prevent malformed data

### API Security

- CORS restricted to whitelisted frontend domains
- HTTPS required in production (TLS 1.2 minimum)
- Security headers included (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security)
- Rate limiting applied to prevent abuse (100 requests/minute per authenticated user)

### Database Security

- Parameterized queries used exclusively (no SQL injection possible)
- Database user has minimal privileges (CRUD only, no DDL)
- Connection strings stored in environment variables, never in code
- Database backups managed by Neon (automated point-in-time recovery)

### Audit Trail

- All API requests logged with timestamp, user ID, endpoint, and correlation ID
- Creation and modification timestamps tracked for all ideas
- Error logs include sufficient context for debugging without exposing sensitive data
- Request IDs enable tracing requests across distributed systems
