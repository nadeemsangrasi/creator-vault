# Building Effective Claude Code Agents: Complete Guide

## Table of Contents

1. [Agent Fundamentals](#fundamentals)
2. [Agent Architecture](#architecture)
3. [Subagent Design Patterns](#subagents)
4. [Workflow Patterns](#workflows)
5. [Context Management](#context-management)
6. [CLAUDE.md Best Practices](#claude-md)
7. [Agent Orchestration](#orchestration)
8. [Testing & Validation](#testing)
9. [Production Patterns](#production)
10. [Advanced Techniques](#advanced)

---

## Agent Fundamentals {#fundamentals}

### What is an Agent?

An **agent** is an LLM system that:

1. **Receives a goal** from a user
2. **Dynamically decides** which tools to use
3. **Maintains control** over its own workflow
4. **Iterates** until the goal is achieved

**Key Distinction:**

- **Traditional Chatbot**: Responds to prompts
- **Agent**: Pro-actively uses tools to achieve goals

### The Claude Code Agent Loop

```
┌─────────────────────────────────────────┐
│  1. User Goal                           │
│     "Add authentication to the API"     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  2. Gather Context                      │
│     - Read relevant files               │
│     - Search codebase                   │
│     - Understand architecture           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  3. Take Action                         │
│     - Write code                        │
│     - Run tests                         │
│     - Execute commands                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  4. Verify Work                         │
│     - Check output                      │
│     - Run validation                    │
│     - Identify issues                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  5. Repeat or Complete                  │
│     - Iterate if needed                 │
│     - Commit when done                  │
└─────────────────────────────────────────┘
```

### Agent Capabilities

**Core Tools:**

- **Bash**: Execute shell commands
- **Read**: Read file contents
- **Write**: Create/modify files
- **Edit**: Make targeted edits
- **Grep**: Search file contents
- **Glob**: Find files by pattern
- **Task**: Spawn subagents

**Extended Capabilities:**

- **MCP Servers**: External integrations
- **Skills**: Domain-specific workflows
- **Hooks**: Lifecycle event handling
- **Memory**: Cross-session context

---

## Agent Architecture {#architecture}

### Three Types of Agents in Claude Code

#### 1. Main Agent (Claude)

**Characteristics:**

- Full context of conversation
- Access to all tools
- Orchestrates overall workflow
- Makes high-level decisions

**When to Use:**

- Primary interface for all work
- Complex multi-step tasks
- Tasks requiring full context

**Example:**

```
User: "Refactor the authentication module to use JWT"

Main Agent:
1. Reads current auth implementation
2. Creates plan
3. Delegates research to Explore agent
4. Implements changes
5. Runs tests
6. Commits result
```

#### 2. Built-in Subagents

**Explore Agent:**

- **Purpose**: Fast, read-only codebase exploration
- **Tools**: Read, Glob, Grep (no Write)
- **Thoroughness**: quick | medium | very thorough
- **Use When**: Searching code without modifications

**Plan Agent:**

- **Purpose**: Research for planning phase
- **Tools**: All tools (read-only mode)
- **Use When**: Plan mode is active

**General-Purpose Agent:**

- **Purpose**: Complex multi-step tasks
- **Tools**: All tools
- **Use When**: Delegating substantial work

**Task Agent:**

- **Purpose**: Parallel task execution
- **Tools**: All tools
- **Use When**: Running multiple things simultaneously

#### 3. Custom Subagents

**User-defined specialists** for specific workflows.

**Structure:**

```markdown
---
name: code-reviewer
description: Review code for quality, security, and best practices. Use when reviewing PRs or code changes.
tools: Read, Glob, Grep
model: sonnet
---

You are a code review specialist.

## Review Checklist

1. **Code Quality**

   - Functions under 50 lines
   - Descriptive variable names
   - No commented-out code

2. **Security**

   - No hardcoded credentials
   - Input validation present
   - SQL injection prevention

3. **Performance**
   - No obvious bottlenecks
   - Efficient algorithms
   - Proper resource cleanup

## Output Format

Provide review as:

- ✅ Strengths
- ⚠️ Issues (with severity)
- 💡 Suggestions
```

### Agent Selection Strategy

| Scenario               | Agent                   | Rationale                 |
| ---------------------- | ----------------------- | ------------------------- |
| Quick file search      | Explore (quick)         | Fast, minimal context     |
| Deep codebase analysis | Explore (very thorough) | Comprehensive search      |
| Complex implementation | Main Agent              | Needs full context        |
| Parallel research      | Task Agent              | Speed through parallelism |
| Code review            | Custom Subagent         | Specialized checklist     |
| Testing                | Custom Subagent         | Consistent test patterns  |

---

## Subagent Design Patterns {#subagents}

### Pattern 1: Lightweight Single-Purpose Agents

**Philosophy**: Create focused agents with minimal context overhead.

**Example: Commit Message Generator**

```markdown
---
name: commit-msg
description: Generate semantic commit messages from git diffs. Use when writing commits.
tools: Bash, Read
model: haiku
---

Generate commit message from staged changes:

1. Run: `git diff --staged`
2. Analyze changes
3. Format as:
```

<type>(<scope>): <subject>

   <body>
   
   <footer>
   ```

Types: feat, fix, docs, style, refactor, test, chore

````

**Cost Analysis:**
- Haiku 4.5: $1 input / $5 output per million tokens
- Sonnet 4.5: $3 input / $15 output per million tokens
- **3x cost savings** with 90% performance retention

**Best For:**
- Frequent operations
- Well-defined tasks
- Speed-critical workflows

### Pattern 2: Research Agents (Parallel)

**Philosophy**: Run multiple research agents simultaneously to gather context fast.

**Implementation:**
```markdown
---
name: research-coordinator
description: Coordinate parallel research across multiple sources. Use when deep research is needed.
tools: Task
model: sonnet
---

## Research Strategy

For comprehensive understanding, spawn parallel agents:

### Step 1: Launch Research Team

Use Task tool to spawn these agents IN PARALLEL:

1. **Documentation Agent**
````

Task: Search official docs for [topic]
Type: general-purpose
Goal: Find best practices and patterns

```

2. **Codebase Agent**
```

Task: Search our codebase for similar implementations
Type: Explore
Thoroughness: very thorough
Goal: Find existing patterns

```

3. **Stack Overflow Agent**
```

Task: Research common issues and solutions
Type: general-purpose
Goal: Find gotchas and solutions

```

### Step 2: Synthesize Results

After all agents complete:
1. Create research doc in `docs/research/[topic].md`
2. Include findings from all sources
3. Highlight conflicts or discrepancies
4. Provide recommendations
```

**Performance:**

- **Sequential**: 3 agents × 2 min = 6 minutes
- **Parallel**: max(2 min, 2 min, 2 min) = 2 minutes
- **Speedup**: 3x faster

### Pattern 3: Validation Pipeline

**Philosophy**: Multi-stage validation with specialized agents.

**Pipeline Structure:**

```
Input → Syntax Agent → Security Agent → Performance Agent → Output
```

**Implementation:**

```markdown
---
name: syntax-validator
description: Validate code syntax and formatting
tools: Bash, Read
model: haiku
---

1. Run linters (eslint, pylint, etc.)
2. Check formatting (prettier, black, etc.)
3. Report issues with line numbers
4. Exit with status code (0=pass, 1=fail)
```

```markdown
---
name: security-validator
description: Check for security vulnerabilities
tools: Bash, Read, Grep
model: sonnet
---

1. Scan for hardcoded secrets
2. Check for SQL injection patterns
3. Verify input validation
4. Review authentication/authorization
5. Generate security report
```

```markdown
---
name: performance-validator
description: Analyze performance implications
tools: Bash, Read
model: sonnet
---

1. Identify O(n²) or worse algorithms
2. Check for memory leaks
3. Review database query efficiency
4. Analyze network calls
5. Suggest optimizations
```

### Pattern 4: Context Isolation

**Philosophy**: Prevent context pollution by isolating specialized workflows.

**Problem Without Isolation:**

```
Main Agent Context (100k tokens):
- Current task discussion (20k)
- Code review history (30k)
- Testing details (25k)
- Documentation (25k)
← Context is bloated, performance degrades
```

**Solution With Subagents:**

```
Main Agent Context (30k tokens):
- Current task discussion (20k)
- Subagent results only (10k)

Code Reviewer Subagent (20k tokens):
- Review checklist
- Code being reviewed
- Results

Test Runner Subagent (15k tokens):
- Test patterns
- Test execution
- Results
```

**Implementation:**

```markdown
## Main Agent Workflow

1. Implement feature
2. Invoke code-reviewer subagent
   - Returns: Summary of issues found
3. Invoke test-runner subagent
   - Returns: Test results
4. Fix issues based on subagent feedback
5. Commit

Main agent never loads full review checklist or test details.
```

### Pattern 5: Progressive Delegation

**Philosophy**: Start simple, delegate when needed.

**Decision Tree:**

```
Is task simple?
├─ Yes → Main agent handles it
└─ No → Is it well-defined?
    ├─ Yes → Use specialized subagent
    └─ No → Use general-purpose agent with guidance
```

**Example:**

```
User: "Add login endpoint"

Main Agent Reasoning:
1. Task requires:
   - Understanding existing auth
   - Implementing new endpoint
   - Writing tests
   - Updating docs

2. Decision: Use codebase-analyzer subagent first
   → Returns: Auth system overview

3. Main agent implements using context from subagent

4. Use test-writer subagent for tests
   → Returns: Test cases

5. Main agent reviews and commits
```

### Model Selection by Agent Type

| Agent Type      | Model      | Cost       | Speed  | Use Case                      |
| --------------- | ---------- | ---------- | ------ | ----------------------------- |
| **Lightweight** | Haiku 4.5  | 💰         | ⚡⚡⚡ | Formatting, simple transforms |
| **Balanced**    | Sonnet 4.5 | 💰💰💰     | ⚡⚡   | Most subagents, orchestration |
| **Complex**     | Opus 4.5   | 💰💰💰💰💰 | ⚡     | Deep analysis, architecture   |

**Economic Impact:**

```
Scenario: 100 agent invocations/day

All Sonnet: 100 × $3 input = $300/day
Mixed Strategy:
- 70 Haiku (lightweight): 70 × $1 = $70
- 25 Sonnet (balanced): 25 × $3 = $75
- 5 Opus (complex): 5 × $15 = $75
Total: $220/day (27% savings)
```

---

## Workflow Patterns {#workflows}

### Pattern 1: Research → Plan → Implement (RPI)

**The Gold Standard** for complex features.

**Phase 1: Research**

```
Goal: Understand before building

Actions:
1. Use Explore agent to search codebase
2. Read relevant files
3. Identify patterns to follow
4. Document findings

Output: Research document with:
- How existing code works
- Patterns to follow
- Dependencies
- Constraints
```

**Phase 2: Plan**

```
Goal: Design before coding

Actions:
1. Create step-by-step plan
2. Identify files to change
3. Consider edge cases
4. Estimate complexity

Output: Implementation plan with:
- Ordered steps
- Files to modify
- Testing strategy
- Rollback plan
```

**Phase 3: Implement**

```
Goal: Execute the plan

Actions:
1. Follow plan step-by-step
2. Verify each step
3. Run tests continuously
4. Commit incrementally

Output: Working feature with:
- Implementation
- Tests
- Documentation
- Git commits
```

**Example:**

```
User: "Add rate limiting to API endpoints"

Research Phase:
↓
Claude: "I'll research the existing middleware system"
- Spawns Explore agent to find middleware files
- Reads authentication middleware for patterns
- Checks if rate limiting library exists
- Documents findings in research/rate-limiting.md

Plan Phase:
↓
Claude: "Here's my implementation plan"
1. Install express-rate-limit package
2. Create rate-limit middleware in middleware/rateLimit.js
3. Apply to routes in routes/api.js
4. Add tests in tests/rateLimit.test.js
5. Update documentation

Implement Phase:
↓
Claude executes each step:
- Installs package
- Creates middleware (follows existing patterns)
- Applies to routes
- Writes tests
- Updates docs
- Commits with clear message
```

**Why This Works:**

- **Fewer mistakes**: Understanding first prevents wrong assumptions
- **Better code**: Following existing patterns ensures consistency
- **Easier review**: Clear plan makes changes predictable
- **Faster iterations**: Less back-and-forth fixing issues

### Pattern 2: Test-Driven Development (TDD)

**Philosophy**: Write tests first, code second.

**Workflow:**

```
1. Write failing tests
2. Verify tests fail
3. Implement code
4. Verify tests pass
5. Refactor
6. Commit
```

**Implementation:**

```
User: "Add password reset functionality"

Claude: "I'll use TDD approach"

Step 1: Write Tests
↓
Create tests/auth/passwordReset.test.js:
- Test: Request reset token
- Test: Verify email sent
- Test: Reset with valid token
- Test: Reject invalid token
- Test: Expire old tokens

Step 2: Run Tests (Should Fail)
↓
npm test -- passwordReset
→ All tests fail (functionality doesn't exist)

Step 3: Implement Feature
↓
Create src/auth/passwordReset.js:
- Generate reset tokens
- Send email
- Validate tokens
- Update password

Step 4: Run Tests (Should Pass)
↓
npm test -- passwordReset
→ All tests pass ✓

Step 5: Refactor
↓
- Extract email logic
- Improve error handling
- Add comments

Step 6: Commit
↓
git add .
git commit -m "feat(auth): add password reset functionality

Implements password reset flow with:
- Token generation with 1hr expiration
- Email notification
- Token validation
- Password update

All tests passing"
```

**Pro Tip:**
Tell Claude explicitly:

> "Use TDD. Write tests first, ensure they fail, then implement. Don't create mock implementations."

### Pattern 3: Parallel Execution

**Philosophy**: Speed up independent tasks with concurrency.

**Sequential (Slow):**

```
Task A (5 min) → Task B (5 min) → Task C (5 min)
Total: 15 minutes
```

**Parallel (Fast):**

```
Task A (5 min) ⎫
Task B (5 min) ⎬ → All complete
Task C (5 min) ⎭
Total: 5 minutes
```

**Implementation:**

```markdown
User: "Analyze this codebase for tech debt"

Main Agent: "I'll run parallel analysis"

Spawn 4 agents simultaneously:

1. **Code Quality Agent**

   - Task: Find code smells
   - Focus: Complexity, duplication, naming

2. **Security Agent**

   - Task: Find vulnerabilities
   - Focus: Auth, injection, secrets

3. **Performance Agent**

   - Task: Find bottlenecks
   - Focus: Algorithms, queries, caching

4. **Documentation Agent**
   - Task: Find missing docs
   - Focus: README, comments, API docs

Wait for all to complete (5 minutes total)

Synthesize results:

- Combined tech debt report
- Prioritized by severity
- Action items with estimates
```

**Code Example:**

```
Prompt to Claude:

"Use the Task tool to spawn these agents IN PARALLEL:
1. general-purpose agent: Search for TODO comments
2. general-purpose agent: Find deprecated dependencies
3. Explore agent (very thorough): Identify unused code
4. general-purpose agent: Check test coverage

Wait for ALL agents to finish, then compile a report."
```

### Pattern 4: Iterative Refinement

**Philosophy**: Build → Test → Refine → Repeat.

**Loop Structure:**

```
┌─────────────────────────────────┐
│  Build Initial Version          │
└──────────────┬──────────────────┘
               ↓
┌──────────────────────────────────┐
│  Test & Identify Issues          │
└──────────────┬───────────────────┘
               ↓
┌──────────────────────────────────┐
│  Refine Based on Feedback        │
└──────────────┬───────────────────┘
               ↓
        Are tests passing?
        ├─ No → Loop back
        └─ Yes → Done
```

**Example:**

```
User: "Create a data visualization dashboard"

Iteration 1:
→ Claude builds basic structure
→ Runs development server
→ Reviews output
→ Issues: Chart not rendering, data format wrong

Iteration 2:
→ Fixes chart library initialization
→ Transforms data format
→ Tests again
→ Issues: Performance slow with large datasets

Iteration 3:
→ Adds data pagination
→ Implements memoization
→ Tests performance
→ Issues: None, tests pass

→ Commits final version
```

**Prompt Pattern:**

```
"Build this feature iteratively:
1. Create basic version
2. Test thoroughly
3. Identify specific issues
4. Fix issues one at a time
5. Repeat until all tests pass

Don't move to next iteration until current one is validated."
```

### Pattern 5: Context-Aware Workflow

**Philosophy**: Adapt workflow based on context window usage.

**Decision Tree:**

```
Check context usage
├─ < 30%: Full RPI workflow
├─ 30-60%: Simplified planning
├─ 60-80%: Direct implementation
└─ > 80%: Clear context, restart
```

**Implementation:**

```markdown
## Dynamic Workflow Selection

### High Context Available (< 30%)

Use full Research → Plan → Implement:

- Deep research with subagents
- Comprehensive planning
- Detailed documentation

### Medium Context (30-60%)

Use streamlined workflow:

- Quick research (main agent only)
- Brief plan outline
- Implement with incremental verification

### Low Context (60-80%)

Use direct approach:

- Minimal research
- Implement immediately
- Test frequently

### Critical Context (> 80%)

Emergency procedures:

1. Save current state to thoughts/
2. /clear to reset
3. Load saved context
4. Continue with fresh window
```

### Pattern 6: Progressive Feature Building

**Philosophy**: Build in small, testable increments.

**Anti-Pattern (Bad):**

```
→ Build entire feature at once (2000 lines)
→ Test
→ Multiple issues found
→ Hard to debug
→ Wasted time
```

**Best Practice (Good):**

```
→ Build component A (200 lines)
→ Test A ✓
→ Build component B (200 lines)
→ Test B ✓
→ Build component C (200 lines)
→ Test C ✓
→ Integrate A + B + C
→ Test integration ✓
→ Done
```

**Example:**

```
User: "Build user dashboard with profile, settings, and activity feed"

Instead of: "Build entire dashboard"

Do:
1. "Build profile component with display logic"
   → Test: Profile renders correctly

2. "Build settings component with form handling"
   → Test: Settings save and load

3. "Build activity feed component with data fetching"
   → Test: Feed loads and updates

4. "Integrate all components in dashboard layout"
   → Test: Dashboard loads all sections

5. "Add navigation and routing"
   → Test: Navigation works

Each step is testable, debuggable, and committable.
```

---

## Context Management {#context-management}

### The Context Window Problem

**Context Window**: Maximum tokens Claude can work with at once (200k tokens ≈ 150k words).

**Problem**: As conversation grows, performance degrades.

**Symptoms:**

- Slower responses
- Forgotten earlier instructions
- Inconsistent behavior
- Hallucinations increase

### Context Management Strategies

#### Strategy 1: Proactive Clearing

**When to Clear:**

- Starting new major task
- After completing a feature
- Context > 60%
- Switching domains

**How to Clear:**

```bash
# Simple clear
/clear

# Save state then clear
1. "Summarize current state in thoughts/session-YYYY-MM-DD.md"
2. Wait for summary
3. /clear
4. "Read thoughts/session-YYYY-MM-DD.md and continue"
```

#### Strategy 2: Subagent Delegation

**Before (Main Agent):**

```
Context Usage: 85%
- Task discussion (20k)
- File contents (40k)
- Research notes (25k)
```

**After (With Subagents):**

```
Main Agent: 30%
- Task discussion (20k)
- Subagent summaries (10k)

Research Subagent: 45% (separate context)
- Research details
- Returns summary only
```

#### Strategy 3: External Memory

**Use `thoughts/` directory** for persistent context.

**Structure:**

```
thoughts/
├── research/
│   ├── 001-auth-system.md
│   └── 002-database-schema.md
├── plans/
│   ├── 001-add-oauth.md
│   └── 002-refactor-api.md
└── sessions/
    ├── 2025-01-10-oauth-implementation.md
    └── 2025-01-11-bug-fixes.md
```

**Setup:**

```bash
# Initialize thoughts directory
npx humanlayer thoughts init

# Creates symlinked directory accessible globally
```

**Usage:**

```
Phase 1: Research
→ Save findings to thoughts/research/oauth-integration.md

Phase 2: Plan
→ Save plan to thoughts/plans/oauth-plan.md

Phase 3: Implement
→ Reference saved research and plan
→ Main context stays clean

Future Sessions:
→ "Read thoughts/research/oauth-integration.md for context"
→ Continue with full knowledge
```

#### Strategy 4: Compaction

Claude Code automatically compacts context when approaching limits.

**Compaction Process:**

```
Original Context (180k tokens):
- System prompts (10k)
- Early messages (100k) ← Can be compressed
- Tool calls (30k) ← Can be summarized
- Recent messages (40k) ← Keep detailed

Compacted Context (100k tokens):
- System prompts (10k)
- Early summary (20k) ← Compressed
- Tool summaries (10k) ← Summarized
- Recent messages (40k) ← Kept
- Buffer (20k) ← Room to continue
```

**Limitations:**

- Loses fine details from early conversation
- May forget specific earlier decisions
- Can't recover compressed information

**Best Practice:**
Save important decisions to `thoughts/` BEFORE compaction occurs.

#### Strategy 5: Session Management

**Pattern: Document & Clear**

```markdown
When approaching context limits:

1. **Document State**
   "Create a comprehensive summary in thoughts/sessions/[date]-[task].md with:

   - What we've accomplished
   - Current progress
   - Next steps
   - Important decisions
   - Code patterns we're following"

2. **Wait for completion**
   Verify document is created and complete

3. **Clear context**
   /clear

4. **Resume**
   "Read thoughts/sessions/[date]-[task].md and continue from where we left off"
```

**Example Session Document:**

```markdown
# Session: OAuth Integration

Date: 2025-01-10

## Accomplished

- ✓ Researched OAuth 2.0 flow
- ✓ Created auth middleware
- ✓ Implemented token generation
- ✓ Added tests for auth endpoints

## Current Status

Working on: Refresh token functionality
Last file modified: src/auth/tokenRefresh.js
Tests passing: 23/25 (2 failing on edge cases)

## Next Steps

1. Fix edge case: Expired refresh tokens
2. Add rate limiting to token endpoint
3. Update documentation
4. Review security checklist

## Important Decisions

- Using JWT with RS256 algorithm
- Tokens expire after 15 minutes
- Refresh tokens valid for 30 days
- Store refresh tokens in Redis

## Code Patterns

- All auth middleware in src/middleware/auth/
- Tests follow pattern in tests/auth/\*.test.js
- Error responses use standard format from src/utils/errors.js
```

### Context Monitoring

**Check Context Usage:**

```
Look at status bar in Claude Code:
Context: 45% (90k/200k tokens)
```

**Rules of Thumb:**

- **0-30%**: Plenty of room, use fully
- **30-60%**: Good, watch for growth
- **60-80%**: Start planning to clear
- **80%+**: Clear immediately

### Context Optimization Tips

**1. Avoid Reading Large Files Repeatedly**

```
# Bad: Reads 10k token file each time
"Check if function exists in utils.js"
"Check if another function exists in utils.js"
"Check if third function exists in utils.js"
→ 30k tokens wasted

# Good: Read once, ask multiple questions
"Read utils.js and tell me if these functions exist:
- formatDate
- validateEmail
- sanitizeInput"
→ 10k tokens used
```

**2. Use Grep Instead of Read**

```
# Bad: Reading entire large file
"Read logs/app.log and find errors"
→ 50k tokens

# Good: Targeted search
"Grep for 'ERROR' in logs/app.log"
→ 2k tokens
```

**3. Summarize Research Before Moving On**

```
After research:
"Summarize key findings in 3-5 bullets"
→ Use summary for implementation
→ Original research can be forgotten
```

**4. Use Subagents for One-Off Tasks**

```
Main task: Implementing feature

One-off: "Format all code with prettier"
→ Spawn general-purpose agent
→ Returns: "Formatted 45 files"
→ Main context unaffected
```

---

## CLAUDE.md Best Practices {#claude-md}

### What is CLAUDE.md?

Project-specific configuration file that guides Claude's behavior.

**Location**: Root of project directory

**Purpose**: Provide universal, always-relevant context

### The 150-200 Instruction Limit

**Research Finding**: LLMs can reliably follow ~150-200 instructions.

**Claude Code Uses**: ~50 instructions already in system prompt

**Your Budget**: ~100-150 instructions maximum

**Implication**: Be extremely selective about what goes in CLAUDE.md

### What to Include

#### ✅ Universal Context

**Project Structure:**

```markdown
## Project Overview

This is a Node.js REST API for e-commerce built with Express.

## Directory Structure
```

src/
├── controllers/ # Route handlers
├── models/ # Database models
├── middleware/ # Custom middleware
├── services/ # Business logic
└── utils/ # Helper functions

```

## Tech Stack
- Runtime: Node.js 20
- Framework: Express 4.18
- Database: PostgreSQL 15 with Prisma
- Testing: Jest
- Linting: ESLint with Airbnb config
```

**Key Patterns:**

````markdown
## Code Patterns

### Error Handling

All controllers use try-catch with standardized error responses:

```javascript
try {
  const result = await service.doSomething();
  res.json({ success: true, data: result });
} catch (error) {
  next(error); // Error middleware handles formatting
}
```
````

### Database Access

Always use Prisma client, never raw SQL:

```javascript
const user = await prisma.user.findUnique({
  where: { id },
});
```

````

**Testing Approach:**
```markdown
## Testing

### Test Location
Tests mirror src structure in tests/ directory

### Test Pattern
```javascript
describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle happy path', async () => {
    // Test
  });

  it('should handle error case', async () => {
    // Test
  });
});
````

### Running Tests

```bash
npm test              # All tests
npm test -- auth      # Specific feature
npm run test:watch    # Watch mode
```

````

#### ✅ Critical Constraints

**Security Requirements:**
```markdown
## Security Requirements

### CRITICAL: Never hardcode secrets
- Use environment variables from .env
- All secrets must be in .env.example (with dummy values)
- Check for secrets before committing

### Authentication
- All API routes except /auth/* require JWT
- Tokens expire after 15 minutes
- Refresh tokens stored in Redis

### Input Validation
- Validate all user inputs with Joi
- Sanitize HTML to prevent XSS
- Use parameterized queries (Prisma handles this)
````

**Performance Guidelines:**

```markdown
## Performance

### Database Queries

- Always use indexes for WHERE clauses
- Limit results to 100 rows default
- Use pagination for list endpoints

### Caching

- Cache frequently accessed data in Redis
- TTL: 5 minutes for dynamic, 1 hour for static
```

#### ✅ Development Workflow

```markdown
## Workflow

### Before Starting

1. Pull latest: `git pull origin main`
2. Install dependencies: `npm install`
3. Start database: `docker-compose up -d`
4. Run migrations: `npx prisma migrate dev`

### During Development

1. Create feature branch: `git checkout -b feature/name`
2. Write tests first (TDD)
3. Implement feature
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Commit with conventional commits

### Before Committing

- [ ] All tests pass
- [ ] No lint errors
- [ ] No console.logs
- [ ] Updated relevant documentation
```

### What NOT to Include

#### ❌ Code Style Guidelines

**Bad:**

```markdown
## Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Max line length 80 characters
- No trailing commas
- Use === not ==
```

**Why Bad:**

- LLMs learn from example code
- Linters enforce style (ESLint, Prettier)
- Wastes instruction budget
- Degrades performance

**Better:**

```markdown
## Code Style

Run linter before committing: `npm run lint`
```

#### ❌ Exhaustive Command Lists

**Bad:**

```markdown
## Commands

- npm start - Start server
- npm test - Run tests
- npm run build - Build for production
- npm run dev - Development mode
- npm run lint - Run linter
- npm run format - Format code
- npm run db:migrate - Run migrations
- npm run db:seed - Seed database
  [...50 more commands]
```

**Why Bad:**

- Claude can discover commands from package.json
- Clogs instruction budget
- Hard to maintain

**Better:**

````markdown
## Key Commands

```bash
npm run dev          # Development
npm test             # Tests
npm run db:migrate   # Migrations
```
````

See package.json for full command list.

````

#### ❌ Implementation Details

**Bad:**
```markdown
## Authentication Implementation

The authentication system works as follows:

1. User submits credentials to POST /auth/login
2. Server validates credentials against database
3. If valid, generates JWT token with RS256 algorithm
4. Token includes payload: { userId, email, role }
5. Token expires after 15 minutes
6. Returns token to client
7. Client stores token in localStorage
8. Client sends token in Authorization header
9. Server validates token on each request
10. If invalid, returns 401 error
[...detailed step-by-step of entire auth flow]
````

**Why Bad:**

- Implementation can be discovered by reading code
- Changes frequently
- Wastes massive instruction budget

**Better:**

```markdown
## Authentication

JWT-based auth with 15min expiry. See src/auth/ for implementation.
```

### CLAUDE.md Structure Template

````markdown
# Project Name

Brief one-sentence description

## Project Overview

### Purpose

What this project does and why it exists

### Tech Stack

Key technologies (not exhaustive list)

### Architecture

High-level system design

## Getting Started

### Prerequisites

What must be installed

### Setup

```bash
# Minimal setup commands
```
````

### Running

```bash
# Key commands only
```

## Project Structure

```
Directory layout with brief explanations
```

## Development Workflow

### Before Starting

Checklist for starting work

### During Development

Key practices to follow

### Before Committing

Pre-commit checklist

## Critical Patterns

### [Pattern Name]

Why it exists and how to follow it

## Testing

### Approach

TDD, integration tests, etc.

### Running Tests

Key test commands

## Security

### Critical Requirements

Non-negotiable security rules

## Performance

### Guidelines

Key performance constraints

## Common Issues

### [Issue]

Quick solution

## Links

- Documentation: [url]
- API Docs: [url]
- Contributing: [url]

````

### CLAUDE.md Anti-Patterns

**1. The Novel**
```markdown
# ❌ BAD: 5000-line CLAUDE.md
Everything about everything in extreme detail
````

**Impact**: Performance degrades, instructions ignored, context bloat

**Fix**: Keep under 1000 lines, link to external docs

**2. The Tutorial**

```markdown
# ❌ BAD: Step-by-step coding instructions

"To add a new endpoint:

1. Create file in controllers/
2. Import express
3. Define route handler
4. Export handler
   [...20 more steps]"
```

**Impact**: Wastes instructions, Claude can figure this out

**Fix**: Show one example, Claude generalizes

**3. The Time Capsule**

```markdown
# ❌ BAD: Outdated information

"We use Express 3.0 [actually using 4.18]"
"Tests are in spec/ directory [moved to tests/]"
```

**Impact**: Claude follows wrong info, creates bugs

**Fix**: Review and update quarterly

**4. The Config Dump**

```markdown
# ❌ BAD: Paste entire config files

[Entire eslintrc.json - 200 lines]
[Entire tsconfig.json - 150 lines]
[Entire jest.config.js - 100 lines]
```

**Impact**: Instruction budget exhausted

**Fix**: Link to files, mention key settings only

### Dynamic CLAUDE.md Techniques

**1. Conditional Sections**

```markdown
## Environment-Specific Notes

<!-- For development environment -->

{{#if development}}

### Development Mode

- Hot reloading enabled
- Detailed error logging
- Mock external APIs
  {{/if}}

<!-- For production environment -->

{{#if production}}

### Production Mode

- Optimized builds
- Error tracking with Sentry
- Real external APIs
  {{/if}}
```

**2. Template Variables**

```markdown
## API Configuration

Base URL: {{BASE_URL}}
API Version: {{API_VERSION}}
Database: {{DB_NAME}}
```

**3. Generated Sections**

```bash
# Generate CLAUDE.md sections from code
npm run generate:claude-md

# Creates sections like:
# - Available API endpoints (from routes)
# - Database schema (from Prisma)
# - Environment variables (from .env.example)
```

---

## Agent Orchestration {#orchestration}

### Orchestration Patterns

#### Pattern 1: Sequential Pipeline

**Use When**: Tasks have dependencies

**Structure:**

```
Agent A → Agent B → Agent C → Result
```

**Example:**

```
Prompt: "Refactor auth module"

Main Agent:
↓
1. Research Agent
   Task: "Analyze current auth implementation"
   Output: Research report
   ↓
2. Planning Agent
   Task: "Create refactoring plan based on research"
   Input: Research report
   Output: Implementation plan
   ↓
3. Implementation Agent
   Task: "Execute refactoring following plan"
   Input: Implementation plan
   Output: Refactored code
   ↓
4. Test Agent
   Task: "Verify refactoring"
   Input: Refactored code
   Output: Test results

Main Agent: Reviews all outputs, commits if tests pass
```

#### Pattern 2: Parallel Fan-Out

**Use When**: Independent tasks can run simultaneously

**Structure:**

```
        ┌→ Agent A →┐
Main →  ├→ Agent B →├→ Synthesize → Result
        └→ Agent C →┘
```

**Example:**

```
Prompt: "Audit entire codebase"

Main Agent spawns simultaneously:
├─ Code Quality Agent
│  └─ Returns: Quality report
├─ Security Agent
│  └─ Returns: Security report
├─ Performance Agent
│  └─ Returns: Performance report
└─ Documentation Agent
   └─ Returns: Documentation report

Wait for ALL to complete (uses max time, not sum)

Main Agent:
- Combines all reports
- Prioritizes findings
- Creates action plan
```

#### Pattern 3: Map-Reduce

**Use When**: Processing many items in same way

**Structure:**

```
        ┌→ Process Item 1 →┐
Items → ├→ Process Item 2 →├→ Combine → Result
        └→ Process Item 3 →┘
```

**Example:**

```
Prompt: "Migrate all API endpoints to TypeScript"

Main Agent:
1. Lists all endpoint files (20 files)
2. Spawns agents to process in parallel:
   - Agent 1: Files 1-5
   - Agent 2: Files 6-10
   - Agent 3: Files 11-15
   - Agent 4: Files 16-20

Each agent:
- Converts JavaScript to TypeScript
- Adds type annotations
- Updates imports
- Runs type checker
- Returns: Status and any errors

Main Agent:
- Waits for all agents
- Collects results
- Runs full test suite
- Commits if all pass
```

#### Pattern 4: Hierarchical Delegation

**Use When**: Complex task needs multiple levels of breakdown

**Structure:**

```
            Main Agent
               ↓
      ┌────────┴────────┐
Coordinator A      Coordinator B
      ↓                  ↓
  ┌───┴───┐          ┌───┴───┐
Work 1  Work 2     Work 3  Work 4
```

**Example:**

```
Prompt: "Build complete authentication system"

Main Agent:
Creates two coordinator agents:
├─ Backend Auth Coordinator
│  └─ Spawns:
│     ├─ Database Schema Agent
│     ├─ API Endpoints Agent
│     ├─ Middleware Agent
│     └─ Testing Agent
│
└─ Frontend Auth Coordinator
   └─ Spawns:
      ├─ Login Component Agent
      ├─ Registration Component Agent
      ├─ Auth Context Agent
      └─ UI Testing Agent

Each level reports up:
Worker → Coordinator → Main Agent

Main Agent:
- Monitors progress
- Resolves conflicts
- Ensures integration
- Final testing
```

#### Pattern 5: Feedback Loop

**Use When**: Quality must improve iteratively

**Structure:**

```
Generate → Validate → Pass? → Done
              ↑         ↓ Fail
              └─ Refine ←┘
```

**Example:**

```
Prompt: "Write production-grade API documentation"

Main Agent:
↓
1. Documentation Generator Agent
   Creates initial docs
   ↓
2. Documentation Validator Agent
   Checks against checklist:
   - [ ] All endpoints documented
   - [ ] Examples provided
   - [ ] Error codes listed
   - [ ] Authentication explained
   ↓
   Fails: Missing error codes
   ↓
3. Documentation Refiner Agent
   Input: Original docs + validation errors
   Adds missing error codes
   ↓
4. Documentation Validator Agent (again)
   Re-validates
   ↓
   Passes all checks ✓
   ↓
5. Main Agent: Commits documentation
```

### Orchestration Best Practices

**1. Clear Task Boundaries**

```markdown
# ❌ Bad: Vague delegation

"Agent: Do something with the authentication"

# ✅ Good: Specific task

"Agent: Extract the JWT token validation logic from middleware/auth.js
into a separate utils/jwtValidator.js module. Include error handling
and unit tests. Return the new file path when complete."
```

**2. Explicit Success Criteria**

```markdown
# ❌ Bad: No definition of done

"Agent: Improve performance"

# ✅ Good: Measurable success

"Agent: Optimize database queries to achieve:

- < 100ms response time for user lookup
- < 500ms for dashboard data load
- < 50 queries per request (currently 200)
  Verify with performance tests."
```

**3. Error Handling Strategy**

```markdown
## Orchestrator Error Handling

### Agent Failure

If agent returns error:

1. Log error details
2. Attempt retry (max 2 retries)
3. If still failing, escalate to main agent
4. Main agent decides: skip, fix manually, or abort

### Partial Success

If 3 of 5 agents succeed:

1. Process successful results
2. Re-attempt failed agents with adjusted parameters
3. If critical agent fails, halt pipeline

### Timeout

If agent exceeds time limit:

1. Terminate agent
2. Use partial results if available
3. Mark task as incomplete
4. Allow main agent to decide next step
```

**4. Result Aggregation**

```markdown
## Aggregating Parallel Results

### Quality Scores

If agents return quality scores:
```

Agent A: 85/100
Agent B: 92/100
Agent C: 78/100

Aggregate: Average = 85/100
Decision: Pass threshold (80+)

```

### Conflict Resolution
If agents return conflicting recommendations:
```

Agent A: Use Redis for caching
Agent B: Use Memcached for caching

Resolution Strategy:

1. Present both options to main agent
2. Main agent evaluates based on:
   - Project requirements
   - Existing infrastructure
   - Team expertise
3. Main agent makes final decision

```

### Error Collection
If multiple agents report errors:
```

Agent A: 3 errors (2 critical, 1 warning)
Agent B: 1 error (1 critical)
Agent C: 0 errors

Aggregate Report:

- Total: 4 errors
- Critical: 3
- Warnings: 1
- Prioritize by criticality

```

```

**5. Progress Tracking**

```markdown
## Progress Monitoring

For long-running orchestrations:
```

Main Task: Database Migration
├─ [✓] Schema Analysis (Agent A) - 2min
├─ [✓] Backup Creation (Agent B) - 5min
├─ [⋯] Migration Execution (Agent C) - In Progress (8min)
├─ [ ] Validation (Agent D) - Waiting
└─ [ ] Rollback Preparation (Agent E) - Waiting

Current: 7/20 minutes elapsed
Estimated: 13 minutes remaining

```

Update user every 2-3 minutes with progress
```

---

## Testing & Validation {#testing}

### Testing Agent Workflows

#### Unit Testing Agents

**Test Individual Agent Behavior:**

```markdown
## Testing: Code Review Agent

### Test 1: Detects Security Issues

Input: Code with hardcoded API key
Expected: Agent flags security issue
Actual: ✓ "CRITICAL: Hardcoded credential found on line 42"

### Test 2: Recognizes Best Practices

Input: Well-written, clean code
Expected: Agent provides positive feedback
Actual: ✓ "Code follows best practices. No issues found."

### Test 3: Handles Edge Cases

Input: Empty file
Expected: Agent handles gracefully
Actual: ✓ "No code to review in empty file."

### Test 4: Performance

Input: 1000-line file
Expected: Completes in < 30 seconds
Actual: ✓ Completed in 18 seconds
```

#### Integration Testing

**Test Agent Interactions:**

```markdown
## Testing: RPI Workflow

### Test: Happy Path

1. Main agent receives: "Add login endpoint"
2. Research agent searches codebase → Returns auth patterns
3. Plan agent creates implementation plan → Returns 6 steps
4. Implementation agent executes → Creates files
5. Test agent verifies → All tests pass ✓

Result: ✓ Feature complete and tested

### Test: Research Fails

1. Main agent receives: "Add login endpoint"
2. Research agent searches → No auth patterns found
3. Expected: Main agent proceeds with standard patterns
4. Actual: ✓ Used industry-standard JWT pattern

### Test: Tests Fail

1. Main agent receives: "Add login endpoint"
2. Research, plan, implement complete
3. Test agent runs tests → 2 failures
4. Expected: Implementation agent fixes issues
5. Actual: ✓ Agent identified issue, fixed, retested successfully
```

#### Load Testing

**Test Agent Performance at Scale:**

```markdown
## Load Testing: Parallel Execution

### Test: 10 Concurrent Agents

Spawn 10 agents simultaneously
Expected: All complete in reasonable time
Actual:

- Completion time: 5.2 minutes (vs 52 min sequential)
- All agents succeeded
- No errors or timeouts
- 10x speedup achieved ✓

### Test: 50 Concurrent Agents

Spawn 50 agents simultaneously
Expected: Some may queue, but all eventually complete
Actual:

- Completion time: 12 minutes
- 47 succeeded immediately
- 3 queued and completed within 2 minutes
- 4.2x speedup vs 10-agent test ✓
- Diminishing returns observed

Recommendation: Optimal concurrency ~20-30 agents
```

### Validation Patterns

#### Pattern 1: Verification Loop

```markdown
## Verification Loop Pattern
```

Implement → Verify → Pass?
↑ ↓ Fail
└─ Fix ←─┘

````

### Implementation

```python
def implement_feature():
    max_attempts = 3
    attempt = 0

    while attempt < max_attempts:
        # Implementation step
        code = generate_code()

        # Verification step
        results = run_tests(code)

        if results.all_pass:
            return code  # Success

        # Fix step
        issues = analyze_failures(results)
        apply_fixes(issues)
        attempt += 1

    # Escalate if can't fix
    raise Exception("Unable to fix after 3 attempts")
````

````

#### Pattern 2: Multi-Level Validation

```markdown
## Multi-Level Validation

### Level 1: Syntax
- Linter passes
- Type checker passes
- Compiles successfully

### Level 2: Unit Tests
- All unit tests pass
- Code coverage > 80%
- No console warnings

### Level 3: Integration Tests
- API endpoints respond correctly
- Database operations succeed
- External services integrate

### Level 4: Manual Review
- Code review checklist complete
- Security checklist verified
- Performance acceptable

Each level must pass before proceeding to next.
````

#### Pattern 3: Checkpoint Validation

```markdown
## Checkpoint Validation

For long workflows, validate at checkpoints:
```

Research Phase
↓
[Checkpoint 1: Research quality check]
↓
Planning Phase
↓
[Checkpoint 2: Plan completeness check]
↓
Implementation Phase
↓
[Checkpoint 3: Code quality check]
↓
Testing Phase
↓
[Checkpoint 4: Test coverage check]
↓
Done

```

If any checkpoint fails:
- Stop pipeline
- Report specific failure
- Allow fix before continuing
```

### Quality Metrics

**Track Agent Performance:**

```markdown
## Agent Performance Metrics

### Success Rate
```

Total Tasks: 100
Successful: 94
Failed: 6
Success Rate: 94%

```

### Time Efficiency
```

Average Task Duration: 8.3 minutes
Fastest: 2.1 minutes
Slowest: 45.2 minutes
Median: 6.8 minutes

```

### Code Quality
```

Average Test Coverage: 87%
Linter Issues: 0.3 per task
Security Issues: 0.1 per task

```

### User Satisfaction
```

Tasks Requiring Fixes: 12%
Tasks Requiring Major Rework: 3%
Tasks Accepted First Try: 85%

```

**Use metrics to improve agent instructions and workflows.**
```

---

## Production Patterns {#production}

### Pattern 1: Safety-First Implementation

**Philosophy**: Prevent catastrophic failures

**Implementation:**

```markdown
## Safety Checklist

Before ANY production change:

### 1. Backup

- [ ] Database backed up
- [ ] Configuration saved
- [ ] Current code tagged in git

### 2. Validation

- [ ] All tests pass locally
- [ ] Linters show no errors
- [ ] Security scan clean
- [ ] Performance acceptable

### 3. Review

- [ ] Code reviewed by human
- [ ] Security team approved (if needed)
- [ ] Stakeholders notified

### 4. Deployment Plan

- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured
- [ ] Runbook updated

### 5. Gradual Rollout

- [ ] Deploy to staging first
- [ ] Smoke tests on staging
- [ ] Canary deployment (10% traffic)
- [ ] Monitor for 1 hour
- [ ] Full deployment if stable

**NEVER skip these steps for production.**
```

**Agent Configuration:**

````markdown
---
name: production-deployer
description: Deploy changes to production with safety checks
tools: Bash, Read
---

# Production Deployment Agent

## CRITICAL: Safety Protocol

This agent follows strict safety protocol:

1. **Verify Environment**
   ```bash
   if [ "$NODE_ENV" != "production" ]; then
     echo "ERROR: Not in production environment"
     exit 1
   fi
   ```
````

2. **Create Backup**

   ```bash
   timestamp=$(date +%Y%m%d_%H%M%S)
   pg_dump $DATABASE_URL > "backups/db_$timestamp.sql"
   git tag "pre-deploy-$timestamp"
   ```

3. **Run Pre-Deploy Tests**

   ```bash
   npm test
   npm run lint
   npm run security-scan
   ```

4. **Human Confirmation Required**
   Present deployment plan to user.
   Get explicit "yes" before proceeding.

5. **Deploy with Monitoring**

   ```bash
   pm2 deploy production
   # Monitor for 5 minutes
   sleep 300
   # Check error rate
   check_error_rate.sh
   ```

6. **Rollback if Issues**
   If error rate > 1%:
   ```bash
   pm2 deploy production revert
   git reset --hard pre-deploy-$timestamp
   ```

## Never Deploy Without

- Passing tests
- Human approval
- Backup
- Rollback plan

````

### Pattern 2: Gradual Rollout

**Philosophy**: Minimize blast radius of failures

```markdown
## Gradual Rollout Strategy

### Stage 1: Canary (10%)
- Deploy to 10% of servers
- Monitor for 30 minutes
- Check metrics:
  - Error rate < 0.5%
  - Response time < +10%
  - CPU usage stable

### Stage 2: Partial (50%)
- Deploy to 50% of servers
- Monitor for 1 hour
- Same metric thresholds

### Stage 3: Full (100%)
- Deploy to all servers
- Monitor for 2 hours
- Watch for issues

### Rollback Triggers
Automatic rollback if:
- Error rate > 1%
- Response time > +25%
- CPU usage > 80%
- Any critical service down
````

### Pattern 3: Feature Flags

**Philosophy**: Deploy code without activating features

````markdown
## Feature Flag Pattern

### Implementation

```javascript
// features.js
const features = {
  newAuthSystem: process.env.FEATURE_NEW_AUTH === "true",
  enhancedLogging: process.env.FEATURE_LOGGING === "true",
  betaDashboard: process.env.FEATURE_BETA_DASH === "true",
};

// In code
if (features.newAuthSystem) {
  return newAuthFlow(req);
} else {
  return legacyAuthFlow(req);
}
```
````

### Rollout Process

1. Deploy code with feature OFF
2. Verify deployment stable
3. Enable for internal users only
4. Monitor for issues
5. Gradually increase percentage
6. Full rollout when confident
7. Remove old code after 2 weeks

### Benefits

- Deploy and test separately
- Instant rollback (just toggle flag)
- A/B testing possible
- Progressive activation

````

### Pattern 4: Monitoring & Alerting

**Philosophy**: Know immediately when things break

```markdown
## Monitoring Strategy

### Key Metrics

**Error Rate**
- Threshold: < 0.1%
- Alert: > 1%
- Critical: > 5%

**Response Time**
- P50: < 100ms
- P95: < 500ms
- P99: < 1000ms
- Alert: P95 > 1000ms

**Throughput**
- Normal: 1000 req/min
- Alert: < 500 req/min
- Critical: < 100 req/min

**Resource Usage**
- CPU: < 70%
- Memory: < 80%
- Disk: < 85%

### Alert Channels
- Slack: All alerts
- PagerDuty: Critical only
- Email: Daily summary

### Dashboards
- Real-time: Grafana
- Historical: DataDog
- Business metrics: Amplitude
````

### Pattern 5: Automated Testing in Production

**Philosophy**: Continuously verify production works

````markdown
## Production Smoke Tests

### Every 5 Minutes

```bash
#!/bin/bash
# smoke-test.sh

# Test critical paths
test_health_endpoint
test_user_login
test_data_retrieval
test_payment_processing

# If any fail, alert immediately
```
````

### Synthetic Monitoring

- Simulate user journeys
- Test from multiple regions
- Verify third-party integrations
- Check SSL certificates
- Monitor DNS resolution

### Chaos Engineering

- Randomly terminate instances
- Introduce network latency
- Simulate database failures
- Verify system recovers

Run chaos tests:

- Staging: Daily
- Production: Weekly (off-peak)

````

---

## Advanced Techniques {#advanced}

### Technique 1: Agent Specialization

**Create domain-specific agents** for repeated tasks.

**Example: Security Audit Agent**

```markdown
---
name: security-auditor
description: Comprehensive security audit of code and infrastructure. Use before production deployments.
tools: Bash, Read, Grep
model: opus
---

# Security Audit Agent

You are a security specialist.

## Audit Process

### 1. Static Analysis
```bash
# Scan for vulnerabilities
npm audit
snyk test
semgrep --config=auto
````

### 2. Secrets Detection

```bash
# Find hardcoded secrets
trufflehog git file://. --only-verified
gitleaks detect
```

### 3. Dependency Analysis

- Check for outdated packages
- Review package licenses
- Identify supply chain risks

### 4. Code Review

Search for:

- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication bypasses
- Authorization issues
- Insecure cryptography
- Sensitive data exposure

### 5. Infrastructure Audit

- Check firewall rules
- Review IAM permissions
- Verify encryption at rest
- Confirm encryption in transit
- Check logging/monitoring

## Report Format

```markdown
# Security Audit Report

Date: [date]
Auditor: Security Agent

## Summary

- Critical Issues: X
- High Priority: Y
- Medium Priority: Z
- Low Priority: W

## Critical Issues

### Issue 1: [Title]

**Severity**: Critical
**Location**: file.js:42
**Description**: [detailed description]
**Impact**: [potential impact]
**Recommendation**: [fix recommendation]
**References**: [CVE, CWE, etc.]

## Compliance

- [x] OWASP Top 10
- [x] CWE Top 25
- [ ] PCI DSS (2 findings)
- [x] GDPR

## Action Items

1. Fix critical issues immediately
2. Address high priority within 7 days
3. Plan for medium/low priority
```

**Usage:**

```
Main Agent: "Before we deploy, run comprehensive security audit"
→ Spawns security-auditor agent
→ Receives detailed security report
→ Fixes critical issues before deployment
```

### Technique 2: Multi-Agent Voting

**Use multiple agents for consensus on ambiguous decisions.**

```markdown
## Multi-Agent Voting Pattern

### Use Case: Architecture Decisions

Spawn 3 architectural review agents:

1. Performance-focused agent
2. Maintainability-focused agent
3. Cost-focused agent

Each evaluates proposed architecture and votes:

- Approve
- Approve with concerns
- Reject

### Example

**Proposal**: Migrate to microservices

**Agent 1 (Performance)**:
Vote: Approve with concerns
Reasoning: Better scalability, but network latency increases
Score: 7/10

**Agent 2 (Maintainability)**:
Vote: Reject
Reasoning: Increased complexity, harder debugging, more overhead
Score: 4/10

**Agent 3 (Cost)**:
Vote: Reject  
Reasoning: Higher infrastructure costs, more services to manage
Score: 5/10

**Consensus**: 2 Reject, 1 Approve → Decision: Do not migrate

**Main Agent**: Presents analysis to user with reasoning from all agents
```

### Technique 3: Adaptive Workflows

**Adjust workflow based on task complexity.**

````markdown
## Adaptive Workflow Selection

### Complexity Assessment

```python
def assess_complexity(task):
    score = 0

    # Check various factors
    if files_to_modify > 10:
        score += 3
    if requires_new_dependencies:
        score += 2
    if touches_critical_paths:
        score += 4
    if requires_database_changes:
        score += 3
    if affects_multiple_services:
        score += 3

    return score

complexity = assess_complexity(task)

if complexity < 5:
    workflow = "simple"  # Direct implementation
elif complexity < 10:
    workflow = "standard"  # Research → Implement
else:
    workflow = "complex"  # Full RPI with multiple agents
```
````

### Workflow Selection

**Simple (score < 5):**

- Main agent implements directly
- Run tests
- Commit

**Standard (score 5-10):**

- Quick research
- Create brief plan
- Implement
- Test thoroughly
- Commit

**Complex (score > 10):**

- Deep research (spawn Explore agent)
- Detailed planning (spawn Plan agent)
- Parallel implementation (multiple agents)
- Comprehensive testing (spawn Test agent)
- Security review (spawn Security agent)
- Performance validation
- Staged commits

````

### Technique 4: Learning from Failures

**Capture failures and improve agent instructions.**

```markdown
## Failure Learning System

### 1. Capture Failure
When agent fails:
```javascript
{
  timestamp: "2025-01-10T14:32:00Z",
  agent: "code-reviewer",
  task: "Review PR #123",
  failure_type: "missed_security_issue",
  details: "Failed to detect SQL injection in user input",
  impact: "Critical vulnerability deployed"
}
````

### 2. Analyze Pattern

```
Review last 50 failures:
- SQL injection: 3 occurrences
- XSS vulnerabilities: 2 occurrences
- Authentication bypass: 1 occurrence

Pattern: Input validation frequently missed
```

### 3. Update Agent

Add to code-reviewer agent:

```markdown
## CRITICAL: Input Validation

For EVERY user input, verify:

- [ ] Type validation
- [ ] Length limits
- [ ] Format validation
- [ ] Sanitization applied
- [ ] Parameterized queries used

Common vulnerabilities to check:

1. SQL Injection: Look for string concatenation in queries
2. XSS: Look for unescaped user input in HTML
3. Command Injection: Look for user input in shell commands

Be extra vigilant with:

- Search queries
- Form inputs
- URL parameters
- API request bodies
```

### 4. Validate Improvement

- Test on previous failures
- Verify all now caught
- Monitor for new failures

````

### Technique 5: Context Persistence

**Maintain knowledge across sessions.**

```markdown
## Context Persistence Strategy

### Session Memory
At end of each session:
````

1. "Create session summary in thoughts/sessions/[date]-[task].md"
2. Include:

   - Accomplished tasks
   - Important decisions
   - Patterns learned
   - Blockers encountered
   - Next steps

3. Tag related files:
   ```
   thoughts/
   ├── sessions/
   │   ├── 2025-01-10-oauth-impl.md
   │   └── 2025-01-11-testing.md
   └── knowledge/
       ├── oauth-patterns.md  ← Extracted patterns
       └── testing-strategy.md
   ```

```

### Knowledge Base
Extract reusable knowledge:
```

From sessions → Extract patterns → Update knowledge base

Example:
Session notes mention "JWT with RS256 works well"
→ Extract to knowledge/security-patterns.md:
"Use RS256 for JWT signing (more secure than HS256)"

```

### Next Session
```

1. "Read thoughts/sessions/[last-date].md for context"
2. "Check thoughts/knowledge/ for relevant patterns"
3. Continue work with full context

```

**Benefits:**
- No context loss between sessions
- Build organizational knowledge
- Improve over time
- Onboard new team members
```

### Technique 6: Agent Telemetry

**Monitor agent performance to optimize.**

````markdown
## Agent Telemetry

### Metrics to Track

```javascript
{
  agent_id: "code-reviewer",
  invocation_id: "uuid",
  timestamp: "2025-01-10T14:30:00Z",

  // Performance
  duration_ms: 45000,
  tokens_used: 12500,
  files_read: 8,

  // Quality
  issues_found: 12,
  false_positives: 2,
  false_negatives: 1,

  // Resource Usage
  cost_dollars: 0.038,

  // Outcome
  status: "success",
  user_satisfaction: 4.5
}
```
````

### Analysis Dashboard

**Performance Over Time:**

```
Week 1: Avg 60s per review
Week 2: Avg 52s per review (13% improvement)
Week 3: Avg 48s per review (20% improvement)
```

**Quality Trends:**

```
False Positive Rate:
Week 1: 25%
Week 2: 18%
Week 3: 12% (52% improvement)

**Cost Optimization:**
```

Haiku vs Sonnet usage ratio improving
Total cost per review decreasing
Quality maintained or improved

```

### Use telemetry to continuously improve agent design.
```

---

## Agent Locations & File Structure {#locations}

### Where Agents Live

Claude Code discovers agents from **three locations** in priority order:

#### 1. Project-Level Agents (Highest Priority)

```
your-project/
└── .claude/
    └── agents/
        ├── code-reviewer.md
        ├── security-auditor.md
        └── test-generator.md
```

**Characteristics:**

- **Location**: `.claude/agents/` in project root
- **Scope**: Only available in this project
- **Version Control**: Committed to git (team-wide)
- **Priority**: Overrides user and built-in agents with same name
- **Use For**: Project-specific workflows

**Example:**

```bash
cd your-project
mkdir -p .claude/agents
# Create agent files here
git add .claude/agents/
git commit -m "Add project agents"
```

#### 2. User-Level Agents (Medium Priority)

```
~/.claude/
└── agents/
    ├── personal-formatter.md
    ├── quick-commit.md
    └── research-helper.md
```

**Characteristics:**

- **Location**: `~/.claude/agents/` in home directory
- **Scope**: Available across all projects
- **Version Control**: Not in git (personal)
- **Priority**: Overrides built-in agents, but not project agents
- **Use For**: Personal preferences and workflows

**Example:**

```bash
mkdir -p ~/.claude/agents
# Create agent files here
```

#### 3. Built-in Agents (Lowest Priority)

```
Claude Code Installation/
└── built-in/
    ├── Explore
    ├── Plan
    ├── general-purpose
    └── Task
```

**Characteristics:**

- **Location**: Internal to Claude Code
- **Scope**: Always available
- **Customization**: Cannot be modified
- **Priority**: Lowest (can be overridden by user or project agents)

### Agent Discovery Process

```
User runs Claude Code
        ↓
Load built-in agents (Explore, Plan, etc.)
        ↓
Load user-level agents (~/.claude/agents/)
        ↓
Load project-level agents (.claude/agents/)
        ↓
If duplicate names exist, project > user > built-in
        ↓
All agents available, highest priority wins
```

**Example Priority Resolution:**

```
Built-in: code-reviewer (generic code review)
User: code-reviewer.md (personal style preferences)
Project: code-reviewer.md (team standards)

→ Claude uses: Project's code-reviewer (highest priority)
```

### Complete Directory Structure

**Full Claude Code Project Setup:**

```
your-project/
├── CLAUDE.md                      # Project instructions (150-200 instruction limit)
├── .mcp.json                      # MCP server configuration
│
├── .claude/                       # Claude Code configuration
│   ├── settings.json              # Hooks, environment vars
│   ├── settings.local.json        # Personal overrides (gitignored)
│   ├── settings.md                # Human-readable docs
│   ├── .gitignore                 # Ignore local files
│   │
│   ├── agents/                    # Custom subagents
│   │   ├── codebase-analyzer.md
│   │   ├── codebase-locator.md
│   │   ├── codebase-pattern-finder.md
│   │   ├── security-auditor.md
│   │   └── test-generator.md
│   │
│   ├── commands/                  # Slash commands
│   │   ├── research_codebase.md  # /research_codebase
│   │   ├── create_plan.md        # /create_plan
│   │   ├── implement_plan.md     # /implement_plan
│   │   ├── validate_plan.md      # /validate_plan
│   │   └── commit.md             # /commit
│   │
│   └── skills/                    # Skills (SKILL.md pattern)
│       ├── code-review/
│       │   ├── SKILL.md
│       │   ├── scripts/
│       │   └── references/
│       └── api-testing/
│           ├── SKILL.md
│           └── scripts/
│
└── thoughts/                      # Persistent memory
    └── shared/
        ├── research/              # Research findings
        │   ├── 001-auth-system.md
        │   └── 002-payment-flow.md
        ├── plans/                 # Implementation plans
        │   ├── 001-oauth-integration.md
        │   └── 002-stripe-upgrade.md
        ├── sessions/              # Session handoffs
        │   └── 2025-01-11-feature-work.md
        └── cloud/                 # Cloud infrastructure
            └── azure-production.md
```

### Managing Agent Files

**View All Agents:**

```bash
# In Claude Code
/agents

# Shows:
# Built-in: Explore, Plan, general-purpose, Task
# User: personal-formatter, research-helper
# Project: code-reviewer, security-auditor
```

**Create Agent:**

```bash
# Interactive creation
/agents

# Or manually create
touch .claude/agents/my-agent.md
```

**Agent File Format:**

```markdown
---
name: agent-name
description: What the agent does and when to use it
tools: Read, Write, Bash
model: sonnet
color: "#3B82F6"
---

# Agent System Prompt

You are a specialized agent for [purpose].

## Instructions

[Detailed instructions here]
```

### Built-in Agent Types Reference

| Agent               | Type     | Tools                 | Context Inheritance | Use Case                 |
| ------------------- | -------- | --------------------- | ------------------- | ------------------------ |
| **Explore**         | Built-in | Read, Glob, Grep      | ❌ Fresh context    | Fast codebase search     |
| **Plan**            | Built-in | All tools (read mode) | ✅ Full context     | Research for planning    |
| **general-purpose** | Built-in | All tools             | ✅ Full context     | Complex multi-step tasks |
| **Task**            | Built-in | All tools             | ✅ Full context     | Parallel execution       |

### Agent File Patterns

**Minimal Agent:**

```markdown
---
name: quick-formatter
description: Format code with prettier. Use when formatting is needed.
tools: Bash
model: haiku
---

Run prettier on the specified files and report results.
```

**Complete Agent:**

````markdown
---
name: security-auditor
description: Comprehensive security audit of code. Use before production deployments.
tools: Bash, Read, Grep
model: opus
color: "#DC2626"
permissionMode: requireApprovalForEditedToolUse
---

# Security Audit Agent

You are a security specialist.

## Audit Process

### 1. Static Analysis

```bash
npm audit
snyk test
semgrep --config=auto
```
````

### 2. Secrets Detection

Search for hardcoded secrets...

[Continue with detailed instructions]

```

---

## Common Agent Patterns {#agent-patterns}

### Pattern 1: Research-Plan-Implement (RPI)

**The Gold Standard** for complex features. Most widely adopted pattern in Claude Code community.

**Directory Structure:**
```

.claude/
├── agents/
│ ├── codebase-analyzer.md # Understands how code works
│ ├── codebase-locator.md # Finds relevant files
│ └── codebase-pattern-finder.md # Discovers patterns
└── commands/
├── 1_research_codebase.md # Phase 1: Research
├── 2_create_plan.md # Phase 2: Plan
├── 3_validate_plan.md # Validation
└── 4_implement_plan.md # Phase 3: Implement

thoughts/
└── shared/
├── research/ # Research outputs
├── plans/ # Plan documents
└── sessions/ # Session handoffs

````

**Workflow:**
```bash
# Phase 1: Research
/research_codebase > How does authentication work?

# Claude spawns 3 parallel agents:
# - codebase-locator (finds auth files)
# - codebase-analyzer (understands implementation)
# - codebase-pattern-finder (discovers patterns)

# Outputs to: thoughts/shared/research/001-auth-system.md

# Phase 2: Plan
/create_plan > Add OAuth integration

# Reads research doc
# Creates detailed plan
# Outputs to: thoughts/shared/plans/001-oauth-integration.md

# Phase 3: Validate (Optional)
/validate_plan thoughts/shared/plans/001-oauth-integration.md

# Phase 4: Implement
/implement_plan thoughts/shared/plans/001-oauth-integration.md

# Executes plan step-by-step
# Commits incrementally
````

**Why RPI Works:**

- ✅ **Fewer mistakes**: Understanding before building
- ✅ **Better code**: Following existing patterns
- ✅ **Easier review**: Clear plan makes changes predictable
- ✅ **Faster iterations**: Less back-and-forth fixing issues

**Real Implementation:**

````markdown
# File: .claude/commands/1_research_codebase.md

---

name: research_codebase
description: Research codebase with parallel agents

---

# Codebase Research Command

## Step 1: Launch Parallel Research Agents

Use the Task tool to spawn these subagents IN PARALLEL:

1. **Codebase Locator** (type: general-purpose)
   - Find relevant files for: {TOPIC}
   - Focus: File structure, naming conventions
2. **Codebase Analyzer** (type: general-purpose)

   - Understand how {TOPIC} currently works
   - Focus: Implementation details, dependencies

3. **Pattern Finder** (type: Explore, very thorough)
   - Discover patterns related to {TOPIC}
   - Focus: Conventions, best practices

## Step 2: Create Research Document

After all agents complete, synthesize findings into:
`thoughts/shared/research/{COUNTER}-{slug}.md`

Format:

```markdown
# Research: {Topic}

Date: {date}

## Current Implementation

[From Codebase Analyzer]

## File Locations

[From Codebase Locator]

## Patterns to Follow

[From Pattern Finder]

## Recommendations

[Your synthesis]
```
````

```

### Pattern 2: Test-Driven Development (TDD)

**Agent Structure:**
```

.claude/
├── agents/
│ └── test-writer.md # Specialized test generation
└── commands/
└── tdd.md # TDD workflow command

````

**Workflow:**
```bash
/tdd > Add password reset functionality

# Claude:
# 1. Writes comprehensive tests (using test-writer agent)
# 2. Runs tests (confirms they fail)
# 3. Implements feature
# 4. Runs tests (confirms they pass)
# 5. Refactors
# 6. Commits with clear message
````

**Test-Writer Agent:**

````markdown
---
name: test-writer
description: Write comprehensive test suites. Use for TDD or test coverage.
tools: Read, Write, Bash
model: sonnet
---

# Test Writer Agent

## Test Generation Process

### 1. Understand Requirements

Read relevant code and understand:

- Expected inputs
- Expected outputs
- Edge cases
- Error conditions

### 2. Write Tests First

Create test file with:

- Happy path tests
- Edge case tests
- Error handling tests
- Integration tests (if applicable)

### 3. Follow Project Patterns

Analyze existing tests:

```bash
find tests/ -name "*.test.*" | head -5 | xargs cat
```
````

Match naming, structure, and assertions.

### 4. Verify Tests Fail

Run tests and confirm failure:

```bash
npm test -- {test-file}
```

Expected: All tests should fail (feature doesn't exist yet)

## Test Structure Template

```javascript
describe("{Feature}", () => {
  beforeEach(() => {
    // Setup
  });

  describe("happy path", () => {
    it("should {expected behavior}", async () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe("edge cases", () => {
    it("should handle {edge case}", async () => {
      // Test
    });
  });

  describe("error handling", () => {
    it("should throw when {error condition}", async () => {
      // Test
    });
  });
});
```

```

### Pattern 3: Parallel Processing

**For independent tasks that can run simultaneously.**

**Agent Structure:**
```

.claude/
└── agents/
├── quality-analyzer.md # Code quality check
├── security-scanner.md # Security audit
├── performance-tester.md # Performance analysis
└── doc-checker.md # Documentation coverage

```

**Usage:**
```

User: "Audit the entire codebase"

Main Agent spawns 4 agents IN PARALLEL:
├─ quality-analyzer → Returns: Quality report
├─ security-scanner → Returns: Security issues
├─ performance-tester → Returns: Bottlenecks
└─ doc-checker → Returns: Missing docs

Wait for ALL (takes ~5 minutes, not 20 minutes sequential)

Main Agent synthesizes:

- Combined audit report
- Prioritized action items
- Estimated effort for fixes

```

**Implementation:**
```

Prompt to Claude:

"Use the Task tool to spawn these agents IN PARALLEL:

1. quality-analyzer: Analyze code quality
2. security-scanner: Find security vulnerabilities
3. performance-tester: Identify performance issues
4. doc-checker: Check documentation coverage

Wait for ALL agents to complete, then compile a comprehensive audit report with prioritized action items."

```

### Pattern 4: Validation Pipeline

**Multi-stage validation with specialized agents.**

**Agent Structure:**
```

.claude/
└── agents/
├── syntax-validator.md # Stage 1: Syntax
├── security-validator.md # Stage 2: Security
├── performance-validator.md # Stage 3: Performance
└── integration-validator.md # Stage 4: Integration

```

**Pipeline Flow:**
```

Code Changes
↓
[Stage 1: Syntax Validation]
├─ Linters pass
├─ Type checking
└─ Compilation
↓ (if pass)
[Stage 2: Security Validation]
├─ No secrets
├─ Input validation
└─ SQL injection check
↓ (if pass)
[Stage 3: Performance Validation]
├─ No O(n²) algorithms
├─ Efficient queries
└─ Resource cleanup
↓ (if pass)
[Stage 4: Integration Tests]
├─ API endpoints work
├─ Database operations
└─ External services
↓
✅ Ready for deployment

```

### Pattern 5: Context Handoff

**For long-running tasks across sessions.**

**Agent Structure:**
```

.claude/
├── agents/
│ ├── session-summarizer.md # Creates handoff docs
│ └── context-loader.md # Loads context
└── commands/
├── save_progress.md # Save current state
└── resume_work.md # Resume from handoff

````

**Workflow:**
```bash
# End of session
/save_progress

# Creates: thoughts/shared/sessions/2025-01-11-oauth-impl.md
# Contains:
# - What was accomplished
# - Current state
# - Next steps
# - Important decisions

# New session (later)
/resume_work thoughts/shared/sessions/2025-01-11-oauth-impl.md

# Claude reads handoff doc
# Continues work with full context
````

**Session Summarizer Agent:**

````markdown
---
name: session-summarizer
description: Create comprehensive session handoff documents. Use before ending work sessions.
tools: Read, Write
model: sonnet
---

# Session Summarizer Agent

Create detailed handoff document at:
`thoughts/shared/sessions/{date}-{task-slug}.md`

## Document Structure

### Header

```markdown
# Session: {Task Name}

Date: {date}
Duration: {time spent}
Status: In Progress | Blocked | Complete
```
````

### Accomplished

List completed tasks:

- ✓ Task 1
- ✓ Task 2
- ✓ Task 3

### Current State

Document exactly where things stand:

- Files modified: [list]
- Tests status: X/Y passing
- Blockers: [if any]
- Pending decisions: [if any]

### Next Steps

Clear actions for next session:

1. First thing to do
2. Second thing to do
3. Third thing to do

### Important Decisions

Document key choices made:

- Why we chose X over Y
- Patterns we're following
- Constraints we discovered

### Code Context

Include relevant snippets or file locations for quick reference.

## Validation

- [ ] All completed work documented
- [ ] Next steps are actionable
- [ ] Important decisions captured
- [ ] File paths are accurate

```

---

##
```
