# Writing Requirements

## Functional Requirements

### Format

```
**FR-###**: System MUST [capability]
```

### Keywords (RFC2119)

| Keyword | Meaning | Example |
|---------|---------|---------|
| MUST | Required | System MUST authenticate users |
| MUST NOT | Prohibition | System MUST NOT store plain text passwords |
| SHOULD | Recommended | Users SHOULD receive confirmation |
| MAY | Optional | System MAY support guest checkout |

### Examples

```markdown
### Functional Requirements

- **FR-001**: System MUST allow users to create accounts with email and password
- **FR-002**: System MUST validate email format before accepting registration
- **FR-003**: System MUST hash passwords using bcrypt (cost factor >= 10)
- **FR-004**: System MUST require minimum 8 characters for passwords
- **FR-005**: System MUST NOT store passwords in plain text
- **FR-006**: System MUST send confirmation email after registration
- **FR-007**: Users MUST be able to reset password via email
- **FR-008**: System SHOULD remember user preferences for 30 days
- **FR-009**: System MAY support OAuth login (Google, GitHub)
```

## Non-Functional Requirements

### Performance

```markdown
### Performance Requirements

- **PR-001**: Page load time MUST be under 2 seconds (p95)
- **PR-002**: API response time MUST be under 500ms (p95)
- **PR-003**: System MUST handle 1000 concurrent users
- **PR-004**: Database queries MUST complete under 100ms
```

### Security

```markdown
### Security Requirements

- **SR-001**: All API calls MUST use HTTPS
- **SR-002**: Session tokens MUST expire after 24 hours of inactivity
- **SR-003**: System MUST implement rate limiting (100 requests/minute)
- **SR-004**: User input MUST be validated and sanitized
- **SR-005**: System MUST log all authentication attempts
```

### Usability

```markdown
### Usability Requirements

- **UR-001**: Users MUST be able to complete primary task in under 5 minutes
- **UR-002**: Error messages MUST be clear and actionable
- **UR-003**: System MUST be usable on mobile devices (responsive)
- **UR-004**: Critical actions MUST have confirmation dialogs
```

## Entity Definition

### Format

```markdown
- **[EntityName]**: [Description]
  - Attributes: attr1 (type), attr2 (type)
  - Relationships: relates to [OtherEntity]
```

### Example

```markdown
### Key Entities

- **Task**: A work item owned by a user
  - id: UUID
  - title: string (1-500 chars)
  - description: string (0-5000 chars)
  - status: enum (pending, in_progress, completed)
  - created_at: datetime
  - updated_at: datetime
  - owner_id: UUID (FK to User)
  - Relationships: belongs to User, has many Comments

- **User**: An authenticated user of the system
  - id: UUID
  - email: string (valid email format)
  - name: string (1-200 chars)
  - created_at: datetime
  - Relationships: owns many Tasks
```

## Marking Unclear Requirements

Use `[NEEDS CLARIFICATION]` to flag items needing discussion:

```markdown
- **FR-010**: System MUST authenticate users via [NEEDS CLARIFICATION: email/password, OAuth, SSO?]
- **FR-011**: System MUST retain user data for [NEEDS CLARIFICATION: retention period?]
- **FR-012**: System MUST support [NEEDS CLARIFICATION: how many concurrent users?]
```

## Requirement Quality Checklist

- [ ] Each requirement is testable
- [ ] Requirements are not implementation-specific
- [ ] Each requirement has unique ID
- [ ] Language uses MUST/SHOULD/MAY correctly
- [ ] Unclear items are marked
- [ ] Requirements are traceable to user stories
- [ ] No redundant requirements
- [ ] Scope is well-defined
