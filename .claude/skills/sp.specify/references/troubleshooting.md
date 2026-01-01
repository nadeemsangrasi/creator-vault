# Specification Troubleshooting

## Common Issues

### Issue: Unclear User Intent

**Problem:** User description is vague or ambiguous.

**Example:**
```
User says: "I want a better search"
```

**Solution:** Ask clarifying questions:
```
1. What type of search? (text, filters, faceted)
2. What data is being searched?
3. What should results look like?
4. Any performance requirements?
```

**Document the Q&A:**
```markdown
### Clarification

Q: What type of search?
A: Full-text search with filters

Q: What data?
A: Product catalog with 10,000 items
```

### Issue: Scope Creep

**Problem:** Feature keeps growing as user thinks of more requirements.

**Solution:**
- Document all additions
- Re-prioritize P1, P2, P3
- Move P3 to future scope

```markdown
### Scope Decisions

- Included in P1: Core search functionality
- Included in P2: Advanced filters
- Moved to backlog: Search suggestions (requires additional API)
```

### Issue: Missing Entities

**Problem:** Data model is unclear or inconsistent.

**Solution:** List all entities and their relationships.

```markdown
### Key Entities Identified

- **User**: Account holder
- **Task**: Work item (owned by User)
- **Comment**: Feedback on Task (created by User, belongs to Task)
- **Project**: Container for Tasks (owned by User)
```

### Issue: Untestable Acceptance Criteria

**Problem:** Criteria are subjective or vague.

**Example:**
```
Bad: "The interface should be intuitive"
Bad: "Search should be fast"
```

**Solution:** Make objective and measurable.

```markdown
Good: "User can complete search in 3 clicks or less"
Good: "Search results appear in under 500ms"
```

### Issue: Conflicting Requirements

**Problem:** Different user stories suggest different behaviors.

**Solution:** Resolve with user and document decision.

```markdown
### Conflict Resolution

**Issue:** Story 1 says "Show all tasks", Story 2 says "Show only active tasks"

**Resolution:** Default to showing all with filter option (Story 2 becomes filter implementation)
```

### Issue: Missing Edge Cases

**Problem:** Only happy path is documented.

**Solution:** Systematically identify edge cases.

```markdown
### Edge Cases

- Empty state: What shows when no data exists?
- Maximum data: What happens with 1000+ items?
- Concurrent edits: What happens when two users edit same item?
- Network failure: How are errors displayed?
- Invalid input: What validation is needed?
```

## Validation Checklist

### Before Submitting

- [ ] All user stories have priorities
- [ ] Each story can be tested independently
- [ ] Acceptance criteria are specific and measurable
- [ ] Requirements use MUST/SHOULD correctly
- [ ] Entities are clearly defined
- [ ] Success criteria are objective
- [ ] Unclear items are marked
- [ ] Edge cases are considered

### Template Compliance

- [ ] Required sections present:
  - User Scenarios & Testing
  - Requirements (Functional)
  - Success Criteria
- [ ] Format matches template
- [ ] Status is set
- [ ] Feature branch is named correctly

## Review Questions

1. Can someone implement from this spec alone?
2. Can someone test from this spec alone?
3. Are all priorities clear?
4. Is the scope well-defined?
5. Are success metrics measurable?

## Feedback Integration

When receiving feedback:

```markdown
### Feedback Log

| Date | Reviewer | Comment | Resolution |
|------|----------|---------|------------|
| 2024-01-15 | QA | Add error scenarios | Added to acceptance criteria |
| 2024-01-16 | PM | Change priority of Story 3 to P2 | Updated |
```
