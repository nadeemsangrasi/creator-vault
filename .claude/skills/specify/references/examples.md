# Specification Examples

## Example 1: Simple Feature - User Profile

### User Input
"I want to be able to view and edit my profile information"

### Output Spec

```markdown
# Feature Specification: User Profile Management

**Feature Branch**: `123-user-profile`
**Created**: 2024-01-15
**Status**: Draft
**Input**: User description: "I want to be able to view and edit my profile information"

## User Scenarios & Testing

### User Story 1 - View Profile (Priority: P1)

As a logged-in user, I want to view my profile information, so that I can verify my account details.

**Why this priority**: Core functionality - users need to see their info.

**Independent Test**: View profile page and verify all fields display.

**Acceptance Scenarios**:
1. **Given** user is logged in, **When** user navigates to profile page, **Then** email, name, and join date are displayed.
2. **Given** user has no profile data, **When** user views profile, **Then** placeholder values are shown.

### User Story 2 - Edit Profile (Priority: P1)

As a logged-in user, I want to update my profile information, so that my account reflects current details.

**Why this priority**: Core functionality - users must be able to maintain accurate info.

**Independent Test**: Update profile and verify changes persist.

**Acceptance Scenarios**:
1. **Given** user is logged in, **When** user updates name, **Then** new name is displayed on profile.
2. **Given** user submits empty name, **When** form is submitted, **Then** error "Name is required" is shown.
3. **Given** user updates email, **When** form is submitted, **Then** email verification is triggered.

---

### User Story 3 - Change Password (Priority: P2)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display user profile information
- **FR-002**: System MUST allow users to update their name
- **FR-003**: System MUST validate name (1-100 characters)
- **FR-004**: System MUST allow users to change password
- **FR-005**: System MUST require current password for password change
- **FR-006**: System MUST validate new password (minimum 8 characters)
- **FR-007**: System MUST send email verification when email changes
- **FR-008**: System MUST [NEEDS CLARIFICATION: password complexity rules?]

### Key Entities

- **User**: id, email, name, password_hash, created_at
- **Profile**: user_id, bio, avatar_url, timezone

## Success Criteria

### Measurable Outcomes

- **SC-001**: Profile page loads in under 1 second
- **SC-002**: Profile update completes in under 2 seconds
- **SC-003**: 95% of profile updates succeed without errors
```

## Example 2: API Feature - Task API

### User Input
"We need a REST API for managing tasks that supports CRUD operations"

### Output Spec

```markdown
# Feature Specification: Task Management API

**Feature Branch**: `123-task-api`
**Created**: 2024-01-15
**Status**: Draft
**Input**: User description: "We need a REST API for managing tasks that supports CRUD operations"

## User Scenarios & Testing

### User Story 1 - Create Task (Priority: P1)

As an API client, I want to create tasks via the API, so that tasks can be created programmatically.

**Independent Test**: POST to /api/tasks creates a task and returns 201.

**Acceptance Scenarios**:
1. **Given** authenticated request with valid task data, **When** POST to /api/tasks, **Then** task is created with 201 response.
2. **Given** unauthenticated request, **When** POST to /api/tasks, **Then** 401 returned.
3. **Given** invalid data, **When** POST to /api/tasks, **Then** 400 returned with validation errors.

### User Story 2 - List Tasks (Priority: P1)

As an API client, I want to retrieve all my tasks, so that task lists can be displayed.

**Acceptance Scenarios**:
1. **Given** authenticated request, **When** GET /api/tasks, **Then** returns list of tasks with 200.
2. **Given** pagination params, **When** GET /api/tasks?page=1&limit=10, **Then** returns paginated results.

### User Story 3 - Get Task (Priority: P1)

**Acceptance Scenarios**:
1. **Given** task exists and owned by user, **When** GET /api/tasks/{id}, **Then** returns task with 200.
2. **Given** task not owned by user, **When** GET /api/tasks/{id}, **Then** returns 404.

### User Story 4 - Update Task (Priority: P2)

### User Story 5 - Delete Task (Priority: P2)

## Requirements

### Functional Requirements

- **FR-001**: API MUST support POST /api/tasks (create)
- **FR-002**: API MUST support GET /api/tasks (list with pagination)
- **FR-003**: API MUST support GET /api/tasks/{id} (retrieve)
- **FR-004**: API MUST support PATCH /api/tasks/{id} (update)
- **FR-005**: API MUST support DELETE /api/tasks/{id} (delete)
- **FR-006**: API MUST require authentication on all endpoints
- **FR-007**: API MUST return 404 for non-existent tasks
- **FR-008**: API MUST return 403 for tasks owned by other users
- **FR-009**: API MUST validate task data (title: 1-500 chars)
- **FR-010**: API MUST support pagination (page, limit params)

### Key Entities

- **Task**: id, title, description, status, owner_id, created_at, updated_at

## Success Criteria

- **SC-001**: API responds in under 200ms (p95)
- **SC-002**: CRUD operations return correct status codes
- **SC-003**: Authentication errors return 401
- **SC-004**: Authorization errors return 403/404
```

## Example 3: UI Feature - Dashboard

### User Input
"Build a dashboard that shows key metrics and allows drilling down into details"

### Output Spec

```markdown
# Feature Specification: Analytics Dashboard

**Feature Branch**: `123-dashboard`
**Created**: 2024-01-15
**Status**: Draft
**Input**: User description: "Build a dashboard that shows key metrics and allows drilling down into details"

## User Scenarios & Testing

### User Story 1 - View Dashboard (Priority: P1)

As a user, I want to see key metrics on a dashboard, so that I can quickly understand system status.

**Acceptance Scenarios**:
1. **Given** user has dashboard access, **When** visiting dashboard, **Then** summary cards display.
2. **Given** data is loading, **When** viewing dashboard, **Then** loading skeleton is shown.

### User Story 2 - Drill Down (Priority: P1)

As a user, I want to click on metrics to see details, so that I can investigate issues.

**Acceptance Scenarios**:
1. **Given** user clicks on a metric card, **When** navigation completes, **Then** detail view is displayed.

### User Story 3 - Filter Data (Priority: P2)

### User Story 4 - Export Reports (Priority: P3)

## Requirements

### Functional Requirements

- **FR-001**: Dashboard MUST display summary cards for key metrics
- **FR-002**: Dashboard MUST support date range filtering
- **FR-003**: Metric cards MUST be clickable for drill-down
- **FR-004**: Detail view MUST show relevant data
- **FR-005**: Dashboard MUST refresh data every 5 minutes
- **FR-006**: System MUST [NEEDS CLARIFICATION: which metrics?]

### Key Entities

- **Metric**: id, name, value, change_percentage, trend
- **Dashboard**: id, user_id, layout_config
```

## Tips for Writing Specs

1. **Start with user input** - Capture verbatim
2. **Break into stories** - Each delivers independent value
3. **Use Gherkin** - Clear acceptance criteria
4. **Define entities** - Data model for implementation
5. **Measure success** - Quantifiable outcomes
6. **Mark unclear** - Don't guess, ask instead
