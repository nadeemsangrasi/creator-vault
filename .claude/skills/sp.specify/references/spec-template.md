# Spec Template Reference

## Template Structure

```markdown
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft | In Review | Approved
**Input**: User description: "$USER_DESCRIPTION"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)
[User story description]

**Why this priority**: [Value explanation]

**Independent Test**: [How to test independently]

**Acceptance Scenarios**:
1. **Given** [state], **When** [action], **Then** [outcome]
2. **Given** [state], **When** [action], **Then** [outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)
...

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [capability]
- **FR-002**: Users MUST be able to [action]
- **FR-003**: System MUST [data requirement]

### Key Entities *(if applicable)*

- **[Entity]**: [Description, key attributes]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable metric]
- **SC-002**: [Performance metric]
```

## Section Details

### User Stories Section

Must include:
- Priority label (P1, P2, P3)
- Value justification
- Independent testability
- Acceptance scenarios (Gherkin format)

### Requirements Section

Must include:
- Functional requirements (FR-###)
- Key entities (if feature involves data)
- Mark unclear with [NEEDS CLARIFICATION]

### Success Criteria Section

Must include:
- Measurable, objective metrics
- No subjective "satisfaction"
- Quantifiable outcomes

## Example: Task Management Feature

```markdown
# Feature Specification: Task Management

**Feature Branch**: `123-task-management`
**Created**: 2024-01-15
**Status**: Draft
**Input**: User description: "I want to create, view, update, and delete tasks"

## User Scenarios & Testing

### User Story 1 - Create Task (Priority: P1)

As a logged-in user, I want to create a new task with a title and description, so that I can track my work items.

**Why this priority**: Core functionality - no tasks can be managed without creation.

**Independent Test**: Create a task and verify it appears in the task list.

**Acceptance Scenarios**:
1. **Given** user is logged in, **When** user submits task form with title, **Then** task is saved and appears in list.
2. **Given** user submits empty title, **When** form is submitted, **Then** error message is shown.
3. **Given** user submits very long title (>500 chars), **When** form is submitted, **Then** error message is shown.

### User Story 2 - List Tasks (Priority: P1)

As a user, I want to see all my tasks in a list, so that I can review my work items.

**Why this priority**: Core functionality - essential for task review.

**Acceptance Scenarios**:
1. **Given** tasks exist, **When** user views task list, **Then** all tasks are displayed.
2. **Given** no tasks exist, **When** user views task list, **Then** empty state is shown.

---

### User Story 3 - Update Task (Priority: P2)

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create tasks
- **FR-002**: System MUST require title field (1-500 characters)
- **FR-003**: System MUST allow optional description (0-5000 characters)
- **FR-004**: System MUST display all tasks for the authenticated user
- **FR-005**: System MUST allow task owners to update tasks
- **FR-006**: System MUST [NEEDS CLARIFICATION: what validation on update?]

### Key Entities

- **Task**: id, title, description, status, created_at, updated_at, owner_id

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create a task in under 30 seconds
- **SC-002**: Task list loads in under 2 seconds
- **SC-003**: 95% of task creation attempts succeed
```
