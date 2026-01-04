# Writing Acceptance Criteria

## Gherkin Format

Use Given-When-Then syntax:

```gherkin
Feature: Task creation

  Scenario: Successful task creation
    Given the user is logged in
    When the user submits the task form with a valid title
    Then the task is saved to the database
    And the user is redirected to the task list

  Scenario: Invalid title rejected
    Given the user is logged in
    When the user submits the task form with an empty title
    Then an error message is displayed
    And the task is not saved
```

## Key Principles

### 1. Independent of Implementation

**Bad:** "Click the submit button and wait for the API response"
**Good:** "When the user submits the task form"

### 2. Specific and Measurable

**Bad:** "The page should be fast"
**Good:** "When the user views the task list, it loads in under 2 seconds"

### 3. Testable by QA

**Bad:** "The UI should look good"
**Good:** "The task list displays all tasks in a card format with title and description"

## Common Patterns

### CRUD Operations

```gherkin
Feature: Task CRUD

  Scenario: Create
    Given user is logged in
    When user creates a task with title "Test Task"
    Then task "Test Task" appears in the task list

  Scenario: Read
    Given tasks exist for the user
    When user views the task list
    Then all user's tasks are displayed

  Scenario: Update
    Given a task exists
    When user updates the task title
    Then the task has the new title

  Scenario: Delete
    Given a task exists
    When user deletes the task
    Then the task no longer appears in the list
```

### Validation

```gherkin
  Scenario: Email validation
    Given the user is on the registration page
    When user enters invalid email "not-an-email"
    Then error message "Invalid email format" is shown

  Scenario: Required field validation
    Given the user is on the form
    When user leaves required field empty
    Then field shows "Required" error
```

### Authentication

```gherkin
  Scenario: Unauthenticated access redirected
    Given user is not logged in
    When user requests the dashboard
    Then user is redirected to login page

  Scenario: Authenticated access granted
    Given user is logged in
    When user requests the dashboard
    Then dashboard content is displayed
```

### Error Handling

```gherkin
  Scenario: Network error shows message
    Given network is unavailable
    When user attempts to save
    Then error "Connection failed, please try again" is displayed

  Scenario: Duplicate prevention
    Given a task with title "Test" exists
    When user creates another task with title "Test"
    Then error "Task with this title already exists" is shown
```

## Template for Each Scenario

```markdown
**Scenario**: [Brief title]
**Given** [initial state/context]
**When** [action taken]
**Then** [expected outcome]
**And** [additional outcomes if needed]
```

## Checklist for Good Criteria

- [ ] Each scenario tests one behavior
- [ ] Criteria are unambiguous
- [ ] Tests can be automated
- [ ] Business value is clear
- [ ] No implementation details
- [ ] Covers both happy path and edge cases

## Common Mistakes

### 1. Too Implementation-Focused
```markdown
Bad: "Click the #submit button which fires POST /api/tasks"
Good: "When the user submits the task form"
```

### 2. Too Vague
```markdown
Bad: "The system should handle errors properly"
Good: "When API returns 500, user sees 'Something went wrong'"
```

### 3. Missing Preconditions
```markdown
Bad: "When the task is created" (missing: user must be logged in)
Good: "Given the user is logged in, when the task is created"
```

## Writing Tips

1. **Start with the happy path** - What is the main success scenario?
2. **Add error cases** - What can go wrong?
3. **Consider edge cases** - Empty data, max values, duplicates
4. **Think from user perspective** - What does the user experience?
5. **Keep it simple** - One scenario per behavior
