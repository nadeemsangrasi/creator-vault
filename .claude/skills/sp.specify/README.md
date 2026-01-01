# Feature Specification (sp.specify)

A comprehensive Claude Code skill for creating feature specifications from natural language descriptions using SpecKit Plus templates. Write user stories, define acceptance criteria, and establish measurable success metrics.

## Overview

This skill transforms user requirements into structured specifications that guide implementation and testing. It integrates with the SpecKit Plus workflow:

```
User Description → Feature Spec → Implementation Plan → Tasks → Code
                 (sp.specify)      (sp.plan)          (sp.tasks)
```

## Features

### 5-Phase Specification Process
1. **Gather Requirements** - Capture user input and identify entities
2. **Write User Stories** - Create prioritized, independent stories
3. **Define Requirements** - Document functional and non-functional requirements
4. **Document Edge Cases** - Identify boundary conditions and error scenarios
5. **Output Specification** - Generate spec.md using template

### User Story Framework
- **INVEST-aligned** - Independent, Negotiable, Valuable, Estimable, Small, Testable
- **Priority levels** - P1 (critical), P2 (important), P3 (nice-to-have)
- **Independent value** - Each story delivers MVP value alone

### Acceptance Criteria
- **Gherkin format** - Given-When-Then syntax
- **Testable** - QA can verify independently
- **Implementation-agnostic** - Focus on what, not how

## Installation

```bash
cp -r sp.specify /path/to/project/.claude/skills/
```

## Usage

### Activation

Trigger keywords:
- "spec", "specify", "feature"
- "user story", "requirements"
- "acceptance criteria", "create spec"
- "document requirements"

### Example Prompts

**Basic Specification:**
- "Create a spec for task management"
- "Write user stories for user authentication"
- "Define acceptance criteria for search feature"

**Detailed Specification:**
- "Document requirements for a REST API with CRUD operations"
- "Create a spec for a dashboard showing analytics metrics"
- "Write acceptance criteria for user profile management"

## Documentation Structure

```
sp.specify/
├── SKILL.md (383 lines)              # Main workflow
├── README.md                          # This file
├── references/
│   ├── spec-template.md               # Template reference
│   ├── acceptance-criteria.md         # Gherkin guidelines
│   ├── requirements.md                # Requirements writing
│   ├── examples.md                    # Complete examples
│   └── troubleshooting.md             # Common issues
└── assets/templates/
```

## Key Concepts

### Priority Levels

| Priority | Meaning | Description |
|----------|---------|-------------|
| P1 | Critical | MVP functionality, must-have |
| P2 | Important | Enhanced experience, should-have |
| P3 | Nice-to-have | Future consideration, could-have |

### User Story Format

```markdown
### User Story X - [Title] (Priority: P1)

**As a** [user role]
**I want to** [action]
**So that** [benefit]

**Why this priority**: [Value explanation]

**Independent Test**: [How to verify independently]

**Acceptance Scenarios**:
1. **Given** [state], **When** [action], **Then** [outcome]
```

### Gherkin Syntax

```gherkin
Feature: Feature description

  Scenario: Describe scenario
    Given initial context
    When action is taken
    Then expected outcome
```

## SpecKit Workflow

### File Locations

```
specs/[###-feature-name]/
├── spec.md              # Feature specification (sp.specify)
├── plan.md              # Implementation plan (sp.plan)
├── research.md          # Research output (sp.plan)
├── data-model.md        # Data model (sp.plan)
├── quickstart.md        # Quickstart guide (sp.plan)
├── contracts/           # API contracts (sp.plan)
└── tasks.md             # Tasks (sp.tasks)
```

### Integration Points

- **sp.specify** → Creates `spec.md`
- **sp.plan** → Uses `spec.md` to create `plan.md`
- **sp.tasks** → Uses `plan.md` to create `tasks.md`

## Common Use Cases

### Simple Feature
Single user story with basic CRUD operations.

**Pattern:** P1 story only, minimal entities

### Complex Feature
Multiple user stories with dependencies.

**Pattern:** P1, P2, P3 stories, clear entity relationships

### API Feature
REST/GraphQL endpoint specifications.

**Pattern:** API-focused stories, authentication requirements

### UI Feature
Frontend component specifications.

**Pattern:** User interaction stories, accessibility requirements

## Tools Covered

**SpecKit Templates:**
- spec-template.md: Feature specification template
- plan-template.md: Implementation plan template
- tasks-template.md: Task breakdown template

**Specification Techniques:**
- User story mapping
- Gherkin acceptance criteria
- Functional/non-functional requirements
- Entity relationship modeling

## Requirements

**Knowledge:**
- User story structure (As a/I want/So that)
- Gherkin syntax (Given/When/Then)
- Basic requirements engineering

**Files:**
- `.specify/templates/spec-template.md`
- `.specify/memory/constitution.md`

## Resources

**Local Documentation:**
- Template reference: `references/spec-template.md`
- Acceptance criteria: `references/acceptance-criteria.md`
- Requirements: `references/requirements.md`
- Examples: `references/examples.md`
- Troubleshooting: `references/troubleshooting.md`

**External:**
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [INVEST in Good Stories](https://wikipedia.org/wiki/INVEST_(test))
- [User Story Mapping](https://www.jpattonassociates.com/user-story-mapping/)

## Best Practices

1. **Prioritize stories** - P1 before P2 before P3
2. **Independent value** - Each story delivers alone
3. **Testable criteria** - QA can verify independently
4. **Measurable success** - Metrics not subjective
5. **Mark unclear** - Use [NEEDS CLARIFICATION]
6. **Follow template** - Consistent structure
7. **Use Gherkin** - Clear acceptance scenarios

## Tips for Success

1. **Start with why** - Understand the problem first
2. **Think small** - Stories should be small enough to estimate
3. **Independent value** - Each story must deliver value alone
4. **Clear acceptance** - Make criteria explicit
5. **Question assumptions** - Don't assume what user means
6. **Iterate with user** - Share drafts for feedback
7. **Keep improving** - Refine as understanding grows

## Version History

**v1.0.0 (2026-01-01)**
- Initial release
- 5-phase specification workflow
- User story prioritization
- Gherkin acceptance criteria
- Requirements templates
- SpecKit Plus integration
- Progressive disclosure structure (383 lines)

## Tips for Success

1. **Start with why** - Understand the problem first
2. **Think small** - Stories should be estimable
3. **Independent value** - Each story delivers alone
4. **Clear验收标准** - Make acceptance criteria explicit
5. **Question assumptions** - Don't assume, ask
6. **Iterate with user** - Share drafts for feedback

---

**Created with:** Claude Code + skill-creator
**Documentation Quality:** Production-ready
**Maintenance:** Self-contained, version 1.0.0
