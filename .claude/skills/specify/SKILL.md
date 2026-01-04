---
name: specify
description: Create feature specifications from natural language descriptions using SpecKit Plus templates. Use when defining requirements, writing user stories, or documenting acceptance criteria. Integrates with Context7 for spec writing best practices.
version: 1.0.0
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
author: Claude Code
tags:
  [
    specification,
    requirements,
    user-stories,
    acceptance-criteria,
    feature-spec,
    sp.specify,
    spec-writing,
    requirements-engineering,
    gherkin,
    backlog,
  ]
---

# Feature Specification (sp.specify)

Create comprehensive feature specifications from natural language descriptions using SpecKit Plus templates. Write user stories, define acceptance criteria, and establish measurable success metrics.

## Overview

This skill transforms user requirements into structured specifications that:

- Guide implementation with clear requirements
- Enable independent testing of each user story
- Provide measurable success criteria
- Support the full SpecKit Plus workflow (spec → plan → tasks)

## When to Use This Skill

**Activate when:**

- User describes a feature to build
- Requirements need to be documented
- User stories need to be written
- Acceptance criteria need definition
- Starting a new feature implementation
- Clarifying ambiguous requirements

**Trigger keywords:** "spec", "specify", "feature", "user story", "requirements", "acceptance criteria", "user scenarios", "create spec", "document requirements"

**NOT for:**

- Writing implementation code
- Creating test cases (use test skills)
- Planning architecture (use sp.plan)
- Writing tasks (use sp.tasks)

## Prerequisites

**Required:**

- Natural language feature description from user
- Understanding of user intent and goals
- Access to `.specify/templates/spec-template.md`

**Recommended:**

- Understanding of project constitution
- Knowledge of similar existing features
- Access to related specifications

## Instructions

### Phase 1: Gather Requirements

#### Step 1: Capture User Input

**Record the user's raw description verbatim:**

```markdown
**Input**: User description: "$USER_DESCRIPTION"
```

**Clarify if needed:**

- What is the primary goal?
- Who are the users?
- What problem does it solve?
- Are there constraints?

**Ask clarifying questions:**

```markdown
### Clarifying Questions

1. [Question about scope]
2. [Question about priority]
3. [Question about constraints]
```

#### Step 2: Identify Key Entities

**Determine if feature involves data:**

- User accounts
- Tasks/items
- Products
- Transactions

**Document entities:**

```markdown
### Key Entities

- **[Entity]**: What it represents, key attributes
- **[Relationship]**: How entities relate
```

### Phase 2: Write User Stories

#### Step 3: Prioritize Stories

**Priority levels:**

- **P1 (Critical)**: MVP functionality, must-have
- **P2 (Important)**: Enhanced experience, should-have
- **P3 (Nice-to-have)**: Future consideration, could-have

**Each story MUST be independently testable:**

- Implementing ONE story delivers value
- Each story can be developed separately
- Each story can be deployed independently

**Write story format:**

```markdown
### User Story X - [Brief Title] (Priority: P1)

**As a** [user role]
**I want to** [action/goal]
**So that** [benefit/value]

**Why this priority**: [Explain value]

**Independent Test**: [How this delivers value alone]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [outcome]
2. **Given** [initial state], **When** [action], **Then** [outcome]
```

#### Step 4: Define Acceptance Criteria

**Use Gherkin format:**

```gherkin
Feature: Feature description

  Scenario: Describe scenario
    Given context
    When action
    Then outcome

  Scenario: Edge case
    Given edge condition
    When action
    Then outcome
```

**Make criteria:**

- Specific and measurable
- Independent of implementation
- Testable by QA

**See:** `references/acceptance-criteria.md`

### Phase 3: Define Requirements

#### Step 5: Write Functional Requirements

**Format:** FR-###: System MUST [capability]

```markdown
### Functional Requirements

- **FR-001**: System MUST [key capability]
- **FR-002**: System MUST [data requirement]
- **FR-003**: Users MUST be able to [key interaction]
- **FR-004**: System MUST [validation/behavior]
- **FR-005**: System MUST [data persistence]
```

**Mark unclear requirements:**

```markdown
- **FR-006**: System MUST [capability] [NEEDS CLARIFICATION: what's the exact requirement?]
```

**See:** `references/requirements.md`

#### Step 6: Define Success Criteria

**Make metrics measurable:**

```markdown
### Success Criteria

- **SC-001**: [Measurable metric, e.g., "Users complete task in under 2 minutes"]
- **SC-002**: [Performance metric, e.g., "System handles 1000 concurrent users"]
- **SC-003**: [User satisfaction, e.g., "90% success on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce time by 50%"]
```

### Phase 4: Document Edge Cases

#### Step 7: Identify Edge Cases

**Categories:**

- Error handling
- Boundary conditions
- Race conditions
- Missing data
- Concurrent access

**Document:**

```markdown
### Edge Cases

- What happens when [boundary condition]?
- How does system handle [error scenario]?
- What is the behavior for [edge case]?
```

### Phase 5: Output Specification

#### Step 8: Generate spec.md

**Use the template:**

```bash
# Read template
cat .specify/templates/spec-template.md

# Create spec file
cat > specs/[feature-branch]/spec.md << 'EOF'
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[feature-branch]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$USER_DESCRIPTION"

## User Scenarios & Testing

### User Story 1 - [Title] (Priority: P1)
...

## Requirements

### Functional Requirements
...

### Key Entities
...

## Success Criteria

### Measurable Outcomes
...
EOF
```

**See:** `references/spec-template.md`

## Common Patterns

### Pattern 1: Simple Feature

**Quick:** Single user story, basic requirements

**See:** `references/examples.md#simple-feature`

### Pattern 2: Complex Feature

**Quick:** Multiple user stories, dependencies, entities

**See:** `references/examples.md#complex-feature`

### Pattern 3: API Feature

**Quick:** REST/GraphQL endpoint specifications

**See:** `references/examples.md#api-feature`

### Pattern 4: UI Feature

**Quick:** Frontend component specifications

**See:** `references/examples.md#ui-feature`

## Project Structure

```
specs/[###-feature-name]/
└── spec.md                    # Feature specification (this skill)

specs/[###-feature-name]/plan.md          # Plan (sp.plan)
specs/[###-feature-name]/research.md      # Research (sp.plan)
specs/[###-feature-name]/data-model.md    # Data model (sp.plan)
specs/[###-feature-name]/quickstart.md    # Quickstart (sp.plan)
specs/[###-feature-name]/contracts/       # API contracts (sp.plan)
specs/[###-feature-name]/tasks.md         # Tasks (sp.tasks)
```

## Error Handling

| Issue                  | Cause                  | Solution                 |
| ---------------------- | ---------------------- | ------------------------ |
| Unclear requirements   | Ambiguous user input   | Ask clarifying questions |
| Missing entities       | Feature not understood | Identify data domains    |
| Untestable criteria    | Too vague              | Make measurable          |
| Conflicting priorities | Unclear user needs     | Re-prioritize with user  |

**See:** `references/troubleshooting.md`

## Best Practices

1. **Prioritize stories** - P1, P2, P3 in order
2. **Independent value** - Each story delivers alone
3. **Testable criteria** - QA can verify independently
4. **Measurable success** - Metrics not subjective
5. **Mark unclear** - Use [NEEDS CLARIFICATION]
6. **Follow template** - Consistent structure
7. **Use Gherkin** - Clear acceptance scenarios

## Validation Checklist

**Requirements Gathering:**

- [ ] User description captured verbatim
- [ ] Clarifying questions asked
- [ ] Key entities identified

**User Stories:**

- [ ] All stories prioritized (P1, P2, P3)
- [ ] Each story independently testable
- [ ] Acceptance criteria defined

**Requirements:**

- [ ] Functional requirements written
- [ ] Requirements are specific
- [ ] Unclear items marked

**Success Criteria:**

- [ ] Metrics are measurable
- [ ] Criteria are objective
- [ ] Scope is realistic

## Quick Commands

**Start specification:**

```bash
# Create feature directory
mkdir -p specs/[###-feature-name]

# Copy template
cp .specify/templates/spec-template.md specs/[###-feature-name]/spec.md

# Edit with user requirements
```

**Validate spec:**

```bash
# Check required sections
grep -q "User Scenarios" spec.md && echo "✓ User stories"
grep -q "Functional Requirements" spec.md && echo "✓ Requirements"
grep -q "Success Criteria" spec.md && echo "✓ Success criteria"
```

## References

**Local Documentation:**

- Spec template: `references/spec-template.md`
- Acceptance criteria: `references/acceptance-criteria.md`
- Requirements writing: `references/requirements.md`
- Examples: `references/examples.md`
- Troubleshooting: `references/troubleshooting.md`

**SpecKit Templates:**

- spec-template.md: `.specify/templates/spec-template.md`
- plan-template.md: `.specify/templates/plan-template.md`
- tasks-template.md: `.specify/templates/tasks-template.md`

**External Resources:**

- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [User Story Mapping](https://www.jpattonassociations.com/user-story-mapping/)
- [INVEST in Good Stories](<://wikipedia.org/wiki/INVEST_(test)>)

## Tips for Success

1. **Start with why** - Understand the problem first
2. **Think small** - Stories should be small enough to estimate
3. **Independent value** - Each story must deliver value alone
4. **Clear 验收标准** - Make acceptance criteria explicit
5. **Question assumptions** - Don't assume what user means
6. **Iterate with user** - Share drafts for feedback
7. **Keep improving** - Refine as understanding grows

## Version History

**v1.0.0 (2026-01-01)** - Initial release with 5-phase specification workflow, user story prioritization, Gherkin acceptance criteria, requirement templates, and SpecKit Plus integration

## Sources

- SpecKit Plus templates: `.specify/templates/`
- OpenTelemetry Specification patterns (RFC2119 keywords)
- Gherkin syntax conventions
- User story best practices (INVEST criteria)
- Acceptance criteria guidelines
