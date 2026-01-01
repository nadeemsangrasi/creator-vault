# Claude Code Skills: Complete Guide

## Table of Contents

1. [Introduction to Claude Code Skills](#introduction)
2. [Core Concepts](#core-concepts)
3. [Skill Structure & Schema](#skill-structure)
4. [Best Practices](#best-practices)
5. [Creating Your First Skill](#creating-skills)
6. [Advanced Patterns](#advanced-patterns)
7. [Testing & Iteration](#testing)
8. [Distribution & Sharing](#distribution)
9. [Security Considerations](#security)
10. [Common Patterns & Examples](#examples)

---

## Introduction to Claude Code Skills {#introduction}

### What Are Skills?

Claude Code Skills are **specialized instruction packages** that teach Claude how to perform specific tasks in a repeatable, standardized manner. Think of them as onboarding guides for AI agents.

**Key Characteristics:**

- Self-contained folders with instructions, scripts, and resources
- Loaded dynamically only when relevant (no context penalty)
- Work across Claude.ai, Claude Code, and Claude API
- Enable progressive disclosure of information

### Why Use Skills?

**Benefits:**

- **Reusability**: Write once, use everywhere
- **Consistency**: Standardized outputs across sessions
- **Scalability**: No context window penalty for unused skills
- **Composability**: Multiple skills can work together
- **Efficiency**: Better than repeating long prompts

**Use Cases:**

- Code review workflows following team standards
- Document generation with brand guidelines
- Data analysis with organization-specific methods
- API testing and validation
- Database queries with company schemas
- Debugging procedures
- Security auditing

---

## Core Concepts {#core-concepts}

### Progressive Disclosure

The fundamental design principle of Skills. Information loads in three stages:

1. **Metadata Level** (100 tokens)

   - Name and description loaded at startup
   - Claude knows skill exists and when to use it
   - Zero context penalty

2. **Instructions Level** (<5k tokens)

   - Full SKILL.md content loaded when activated
   - Step-by-step guidance for Claude
   - Moderate context usage

3. **Resources Level** (as needed)
   - Supporting files loaded only when referenced
   - Scripts, templates, documentation
   - Minimal token consumption

### How Skills Work

```
┌─────────────────────────────────────────┐
│ 1. Startup: Metadata Pre-loaded        │
│    All skill names + descriptions       │
│    in system prompt (~100 tokens each)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. User Request Triggers Skill          │
│    Claude matches request to skill      │
│    description using LLM routing        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. Skill Activation                     │
│    Read SKILL.md into context via       │
│    Bash tool (~5k tokens)               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 4. Resource Loading (Optional)          │
│    Claude reads additional files        │
│    as needed for the task               │
└─────────────────────────────────────────┘
```

### Skills vs Other Features

| Feature         | Purpose               | When to Use                             |
| --------------- | --------------------- | --------------------------------------- |
| **Skills**      | Repeatable workflows  | Task done 5+ times with same pattern    |
| **Projects**    | Cumulative context    | Ongoing work with related conversations |
| **MCP Servers** | External integrations | Connect to APIs, databases, services    |
| **Subagents**   | Parallel processing   | Complex tasks needing isolation         |
| **Prompts**     | One-off requests      | Unique, non-repeating tasks             |

---

## Skill Structure & Schema {#skill-structure}

### Minimum Required Structure

```
my-skill/
└── SKILL.md          # Required: Core instructions
```

### Complete Structure

```
my-skill/
├── SKILL.md              # Required: Instructions + metadata
├── scripts/              # Optional: Executable code
│   ├── process.py
│   ├── validate.sh
│   └── utils.js
├── references/           # Optional: Documentation
│   ├── api-docs.md
│   ├── examples.md
│   └── schema.json
├── assets/               # Optional: Templates/binaries
│   ├── template.html
│   ├── style.css
│   └── logo.png
└── LICENSE.txt          # Optional: License info
```

### SKILL.md Schema

```markdown
---
name: skill-name-here
description: Brief description of what this skill does and when to use it
version: 1.0.0
allowed-tools: Bash, Read, Write
---

# Skill Title

## Overview

Brief explanation of what this skill accomplishes.

## When to Use This Skill

- Specific trigger condition 1
- Specific trigger condition 2
- Specific trigger condition 3

## Prerequisites

- Required files or setup
- Dependencies needed
- Permissions required

## Instructions

### Step 1: [Action Name]

Detailed instructions for Claude to follow.

### Step 2: [Action Name]

More detailed guidance.

### Step 3: [Validation]

How to verify success.

## Examples

### Example 1: [Use Case]

**Input:**
```

Sample input

```

**Output:**
```

Expected output

```

### Example 2: [Use Case]
Another concrete example.

## Error Handling
- Common error 1 and solution
- Common error 2 and solution

## Limitations
- What this skill cannot do
- Edge cases to be aware of

## References
- Link to additional documentation: `references/api-docs.md`
- Related resources: `assets/template.html`
```

### YAML Frontmatter Fields

#### Required Fields

| Field         | Type   | Max Length | Description                                |
| ------------- | ------ | ---------- | ------------------------------------------ |
| `name`        | string | 64 chars   | Skill identifier (lowercase, hyphens only) |
| `description` | string | 1024 chars | What skill does and when to use it         |

#### Optional Fields

| Field           | Type   | Description                             |
| --------------- | ------ | --------------------------------------- |
| `version`       | string | Skill version for tracking changes      |
| `allowed-tools` | string | Comma-separated list of permitted tools |
| `author`        | string | Skill creator information               |
| `tags`          | array  | Categories for organization             |

#### Validation Rules

**name field:**

- Maximum 64 characters
- Lowercase letters, numbers, hyphens only
- No spaces, XML tags, or reserved words
- Examples: `pdf-processing`, `commit-messages`, `brand-guidelines`

**description field:**

- Maximum 1024 characters
- Must be non-empty
- No XML tags
- Should include specific trigger keywords
- Action-oriented language

**Example:**

```yaml
---
name: systematic-debugging
description: Methodically debug code issues by identifying root causes, forming hypotheses, applying fixes, and documenting results. Use when encountering bugs, test failures, or unexpected behavior before proposing fixes.
version: 2.1.0
allowed-tools: Bash, Read, Write, Grep
---
```

---

## Best Practices {#best-practices}

### 1. Writing Effective Descriptions

The description is **critical** for skill discovery. Claude uses it to determine when to invoke your skill.

**Bad Description:**

```yaml
description: Helps with PDFs
```

**Good Description:**

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Best Practices:**

- Use specific action verbs (extract, create, analyze, validate)
- Include trigger keywords users would say
- Mention specific use cases
- State what it does AND when to use it
- Keep under 200 characters if possible

### 2. Instruction Writing

**Clarity Principles:**

- Use imperative mood ("Read the file" not "You should read")
- Number steps for sequential workflows
- Use bullet points for options or lists
- Include code blocks for examples
- Bold important terms

**Structure Template:**

```markdown
## Instructions

### Phase 1: Preparation

1. **Action**: What to do
2. **Verification**: How to confirm it worked

### Phase 2: Execution

1. **Action**: Next step
2. **Handling**: What if this fails

### Phase 3: Completion

1. **Finalize**: Complete the task
2. **Document**: Record the results
```

### 3. Progressive Disclosure

Keep SKILL.md focused, delegate details to other files.

**SKILL.md** (< 500 lines):

```markdown
## Database Query Process

1. Read the schema from `references/database-schema.md`
2. Validate query syntax using `scripts/validate-sql.py`
3. Execute query following safety guidelines
4. Format results according to `references/output-format.md`
```

**references/database-schema.md** (can be large):

```markdown
# Database Schema

## Users Table

- id: INTEGER PRIMARY KEY
- email: VARCHAR(255) UNIQUE
- created_at: TIMESTAMP
  ...
```

### 4. Using Scripts Effectively

**When to Use Scripts:**

- Data processing more reliable as tested code
- Operations requiring consistency
- Complex calculations
- API interactions
- File transformations

**How to Reference Scripts:**

````markdown
## Validation Step

Run the validation script to check form completeness:

```bash
python3 scripts/validate_form.py --input "$form_path" --strict
```
````

The script will output:

- ✓ All required fields present
- ✗ Missing fields with details

````

**Script Best Practices:**
- Include error handling
- Provide clear output messages
- Accept command-line arguments
- Return meaningful exit codes
- Keep scripts focused on one task

### 5. Tool Restrictions

Use `allowed-tools` to limit Claude's capabilities during skill execution:

```yaml
---
name: read-only-analyzer
description: Analyze codebases without making any modifications
allowed-tools: Read, Grep, Glob
---
````

**Common Tool Combinations:**

- **Read-only**: `Read, Grep, Glob`
- **Safe editing**: `Read, Write, Bash`
- **Full access**: `Bash, Read, Write, Grep, Glob, Replace`

### 6. Context Window Management

**Keep SKILL.md Concise:**

- Target: < 500 lines
- Maximum: 5,000 words
- Split longer content into reference files

**Efficient File Organization:**

```
skill-name/
├── SKILL.md                    # Core workflow (400 lines)
├── references/
│   ├── detailed-guide.md      # In-depth documentation
│   ├── api-reference.md       # Complete API docs
│   └── examples.md            # Extended examples
└── scripts/
    └── processor.py           # Heavy processing code
```

### 7. Testing Across Models

Skills behave differently on various Claude models:

| Model             | Characteristics    | Skill Adjustments                           |
| ----------------- | ------------------ | ------------------------------------------- |
| **Claude Haiku**  | Fast, economical   | Needs more explicit guidance                |
| **Claude Sonnet** | Balanced           | Works with standard instructions            |
| **Claude Opus**   | Powerful reasoning | May need less detail, avoid over-explaining |

**Testing Strategy:**

1. Start with Sonnet (balanced baseline)
2. Test with Haiku (add clarity if needed)
3. Test with Opus (remove redundancy if needed)

### 8. Validation Loop Pattern

For quality assurance, implement iterative validation:

```markdown
## Quality Process

1. **Generate**: Create initial output
2. **Validate**: Check against checklist:
   - [ ] All required sections present
   - [ ] Format matches template
   - [ ] Examples are concrete
3. **Fix**: If validation fails:
   - Note specific issues
   - Revise content
   - Re-validate
4. **Finalize**: Only proceed when all checks pass
```

### 9. Error Handling

Always include error scenarios:

```markdown
## Error Handling

### File Not Found

If the input file doesn't exist:

1. Check the file path for typos
2. List directory contents with `ls`
3. Ask user to confirm file location

### Permission Denied

If script execution fails:

1. Check file permissions with `ls -la`
2. Make executable: `chmod +x script.py`
3. Retry execution

### Invalid Format

If data format is incorrect:

1. Show format error details
2. Provide example of correct format
3. Ask user to correct and retry
```

### 10. Documentation Standards

**Include These Sections:**

- **Overview**: What the skill does
- **When to Use**: Trigger conditions
- **Prerequisites**: Required setup
- **Instructions**: Step-by-step process
- **Examples**: Real-world use cases
- **Error Handling**: Common issues
- **Limitations**: What it can't do

---

## Creating Your First Skill {#creating-skills}

### Quick Start: Minimal Skill

**Step 1: Create Directory**

```bash
mkdir -p ~/.claude/skills/commit-messages
cd ~/.claude/skills/commit-messages
```

**Step 2: Create SKILL.md**

```markdown
---
name: commit-messages
description: Generate clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---

# Commit Message Generator

## Instructions

1. Run `git diff --staged` to see changes
2. Analyze the changes:
   - What functionality changed?
   - Why was it changed?
   - What components are affected?
3. Generate commit message with:
   - Summary: < 50 characters, present tense
   - Body: Detailed explanation of what and why
   - Footer: Reference related issues

## Format
```

feat: Add user authentication system

Implement JWT-based authentication with:

- Login/logout endpoints
- Token refresh mechanism
- Password hashing with bcrypt

Closes #123

```

## Best Practices
- Use present tense ("Add feature" not "Added feature")
- Explain what and why, not how
- Use conventional commits format
```

**Step 3: Test the Skill**

```bash
# Restart Claude Code to load skill
claude

# Test it
# User: "Help me write a commit message for my staged changes"
```

### Complete Example: Brand Guidelines Skill

````markdown
---
name: brand-guidelines
description: Apply company brand guidelines to all documents and presentations, including official colors, fonts, and logo usage. Use when creating external-facing materials.
version: 1.0.0
---

# Brand Guidelines

## Overview

This skill ensures all created documents match our company's visual identity and brand standards.

## When to Use

- Creating presentations
- Designing documents
- Building marketing materials
- Developing web content
- Any external-facing materials

## Brand Colors

### Primary Palette

- **Brand Blue**: `#0052CC`
- **Deep Navy**: `#172B4D`
- **Light Blue**: `#4C9AFF`

### Secondary Palette

- **Success Green**: `#00875A`
- **Warning Yellow**: `#FFC400`
- **Error Red**: `#DE350B`

### Neutral Palette

- **Dark Gray**: `#42526E`
- **Medium Gray**: `#7A869A`
- **Light Gray**: `#DFE1E6`

## Typography

### Headings

- **Font**: Inter Bold
- **H1**: 32pt
- **H2**: 24pt
- **H3**: 18pt

### Body Text

- **Font**: Inter Regular
- **Size**: 14pt
- **Line Height**: 1.5

### Code

- **Font**: JetBrains Mono
- **Size**: 13pt

## Logo Usage

### Placement

- Top-left on documents
- Centered on title slides
- Footer on all pages

### Clear Space

- Minimum 20px padding on all sides
- Never resize below 40px height

### Approved Formats

- PNG (transparent background): `assets/logo.png`
- SVG (scalable): `assets/logo.svg`

## Document Templates

### Presentations

```markdown
Structure:

1. Title Slide: Logo centered, title in Brand Blue
2. Agenda: Bullet points in Deep Navy
3. Content Slides: Headers in Brand Blue, body in Dark Gray
4. Closing: Thank you slide with contact info
```
````

### Reports

```markdown
Structure:

1. Cover Page: Logo top-left, title centered
2. Executive Summary: 1 page maximum
3. Main Content: Clear headers, consistent spacing
4. Appendix: Supporting data and references
```

## Instructions

### Creating a Presentation

1. Start with title slide using brand colors
2. Apply Inter Bold for all headers
3. Use Brand Blue (#0052CC) for primary text
4. Include logo in top-left of content slides
5. Maintain 20px clear space around logo
6. Use Light Gray backgrounds for code blocks
7. End with branded closing slide

### Creating a Document

1. Apply logo to header
2. Use Inter Regular for body text (14pt)
3. Format headers with Brand Blue
4. Use Secondary Palette for callouts:
   - Success Green for tips
   - Warning Yellow for cautions
   - Error Red for critical notes
5. Maintain consistent spacing (1.5 line height)

## Validation Checklist

Before finalizing any material, verify:

- [ ] Brand colors used correctly
- [ ] Logo present and properly sized
- [ ] Fonts match typography guidelines
- [ ] Clear space maintained around logo
- [ ] Consistent formatting throughout
- [ ] Professional appearance

## Examples

### Example 1: Product Launch Deck

**Request**: "Create a 5-slide deck for our new product launch"

**Output**:

- Slide 1: Title "Introducing ProductX" in Brand Blue (#0052CC)
- Slide 2: Features list with Deep Navy text
- Slide 3: Benefits chart with branded colors
- Slide 4: Customer testimonials with Light Blue accents
- Slide 5: Call to action with Success Green button

### Example 2: Quarterly Report

**Request**: "Generate Q3 financial report"

**Output**:

- Cover with logo and quarter in Brand Blue
- Executive summary with key metrics highlighted
- Financial tables with branded color scheme
- Charts using Primary and Secondary palettes
- Appendix with detailed breakdowns

## Common Issues

### Colors Don't Match

- Verify hex codes exactly as specified
- Check color profiles (RGB vs CMYK)
- Test on multiple displays

### Logo Appears Distorted

- Use provided SVG for scaling
- Maintain aspect ratio
- Check minimum size requirements

## References

- Full brand book: `references/brand-book.pdf`
- Logo files: `assets/logo.png`, `assets/logo.svg`
- Template files: `assets/presentation-template.pptx`

```

---

## Advanced Patterns {#advanced-patterns}

### 1. Multi-File Skills with Scripts

**Skill: API Testing Framework**

**Directory Structure:**
```

api-tester/
├── SKILL.md
├── scripts/
│ ├── test-endpoint.py
│ ├── validate-response.py
│ └── generate-report.sh
├── references/
│ ├── api-spec.yaml
│ └── test-cases.md
└── assets/
└── report-template.html

````

**SKILL.md:**
```markdown
---
name: api-tester
description: Test REST APIs with automated validation of status codes, response structure, and data types. Use for API testing, integration verification, or debugging endpoints.
allowed-tools: Bash, Read, Write
---

# API Testing Framework

## Testing Workflow

### 1. Setup
Read API specification from `references/api-spec.yaml`

### 2. Execute Test
```bash
python3 scripts/test-endpoint.py \
  --url "$ENDPOINT_URL" \
  --method "$HTTP_METHOD" \
  --expected-status 200
````

### 3. Validate Response

```bash
python3 scripts/validate-response.py \
  --response response.json \
  --schema references/api-spec.yaml
```

### 4. Generate Report

```bash
bash scripts/generate-report.sh \
  --input results.json \
  --template assets/report-template.html \
  --output test-report.html
```

## Script Details

### test-endpoint.py

Tests HTTP endpoints and captures responses.

**Arguments:**

- `--url`: API endpoint URL
- `--method`: HTTP method (GET/POST/PUT/DELETE)
- `--headers`: JSON string of headers
- `--body`: Request body (for POST/PUT)
- `--expected-status`: Expected HTTP status code

**Output:** Saves response to `response.json`

### validate-response.py

Validates response structure against OpenAPI schema.

**Arguments:**

- `--response`: Path to response JSON file
- `--schema`: Path to OpenAPI spec file

**Output:**

- Exit 0: Validation passed
- Exit 1: Validation failed with details

## Examples

### Test User Login Endpoint

```bash
# Test successful login
python3 scripts/test-endpoint.py \
  --url "https://api.example.com/auth/login" \
  --method POST \
  --body '{"email": "user@example.com", "password": "test123"}' \
  --expected-status 200

# Validate response structure
python3 scripts/validate-response.py \
  --response response.json \
  --schema references/api-spec.yaml
```

Expected response structure:

```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 123,
    "email": "user@example.com"
  }
}
```

````

### 2. Skill with External Dependencies

**Skill: Data Visualization**

```markdown
---
name: data-visualizer
description: Create interactive charts and graphs from CSV data using Python libraries. Use when analyzing datasets or creating visual reports.
---

# Data Visualization Skill

## Prerequisites

### Required Packages
```bash
pip install pandas matplotlib seaborn plotly
````

### Dependencies

- Python 3.8+
- pandas 1.3+
- matplotlib 3.4+
- seaborn 0.11+
- plotly 5.0+

## Instructions

### 1. Load Data

```python
import pandas as pd
df = pd.read_csv('data.csv')
```

### 2. Analyze

```python
# Basic statistics
print(df.describe())

# Data types
print(df.dtypes)
```

### 3. Visualize

Choose appropriate chart type:

- **Line Chart**: Time series data
- **Bar Chart**: Categorical comparisons
- **Scatter Plot**: Correlations
- **Heatmap**: Matrix data

### 4. Generate

Run visualization script:

```bash
python3 scripts/create-chart.py \
  --input data.csv \
  --type line \
  --output chart.html
```

## Error Handling

### Missing Package

```bash
Error: No module named 'pandas'

Solution:
pip install -r requirements.txt
```

### Invalid Data Format

```bash
Error: CSV parsing failed

Solution:
- Check CSV delimiter (comma vs semicolon)
- Verify file encoding (UTF-8)
- Validate header row exists
```

````

### 3. Conditional Workflow Pattern

**Skill: Code Review**

```markdown
---
name: code-reviewer
description: Review code changes following team standards for style, security, performance, and testing. Use when reviewing pull requests or code commits.
---

# Code Review Skill

## Review Process

### Step 1: Determine Language
```bash
# Detect primary language
file_ext=$(find . -name "*.py" -o -name "*.js" -o -name "*.java" | head -1 | sed 's/.*\.//')

case $file_ext in
  py)
    echo "Python detected - using Python guidelines"
    GUIDELINES="references/python-style.md"
    ;;
  js)
    echo "JavaScript detected - using JS guidelines"
    GUIDELINES="references/javascript-style.md"
    ;;
  java)
    echo "Java detected - using Java guidelines"
    GUIDELINES="references/java-style.md"
    ;;
esac
````

### Step 2: Run Linters

**Python:**

```bash
pylint --rcfile=.pylintrc **/*.py
black --check .
mypy .
```

**JavaScript:**

```bash
eslint --ext .js,.jsx .
prettier --check "**/*.js"
```

### Step 3: Security Check

```bash
python3 scripts/security-scan.py --path .
```

### Step 4: Review Checklist

#### Code Quality

- [ ] Functions are < 50 lines
- [ ] Variables have descriptive names
- [ ] No commented-out code
- [ ] No magic numbers

#### Security

- [ ] No hardcoded credentials
- [ ] Input validation present
- [ ] SQL injection prevented
- [ ] XSS vulnerabilities addressed

#### Testing

- [ ] Unit tests included
- [ ] Test coverage > 80%
- [ ] Edge cases covered
- [ ] Mock external dependencies

#### Performance

- [ ] No obvious bottlenecks
- [ ] Database queries optimized
- [ ] Caching implemented where needed
- [ ] Resource cleanup handled

### Step 5: Generate Report

```markdown
## Code Review Summary

**Files Changed:** X files
**Lines Added:** +XXX
**Lines Removed:** -XXX

### ✅ Strengths

- List positive aspects

### ⚠️ Issues Found

- List concerns with severity

### 💡 Suggestions

- Improvement recommendations

### 🔒 Security Notes

- Any security concerns
```

````

### 4. Database Query Skill

```markdown
---
name: safe-sql-queries
description: Execute read-only SQL queries against PostgreSQL databases with validation and safety checks. Use when analyzing database data or generating reports.
allowed-tools: Bash, Read
---

# Safe SQL Query Skill

## Safety Rules

### ALLOWED Operations
- SELECT statements only
- Read-only transactions
- Query timeout: 30 seconds
- Row limit: 10,000 rows

### PROHIBITED Operations
- INSERT, UPDATE, DELETE
- DROP, TRUNCATE, ALTER
- CREATE, GRANT, REVOKE
- Any DDL operations

## Query Process

### 1. Load Schema
Read database structure from `references/schema.md`

### 2. Validate Query
```bash
python3 scripts/validate-sql.py --query "$SQL_QUERY"
````

Validation checks:

- Only SELECT statements
- No dangerous keywords
- Proper syntax
- Table exists in schema

### 3. Execute Query

```bash
psql -h localhost -U readonly_user -d production \
  -c "$SQL_QUERY" \
  --csv > results.csv
```

### 4. Format Results

```python
import pandas as pd

df = pd.read_csv('results.csv')
print(df.to_markdown(index=False))
```

## Examples

### Example 1: User Statistics

```sql
SELECT
  DATE(created_at) as signup_date,
  COUNT(*) as new_users
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY signup_date;
```

### Example 2: Revenue Report

```sql
SELECT
  products.name,
  SUM(order_items.quantity) as units_sold,
  SUM(order_items.price * order_items.quantity) as revenue
FROM order_items
JOIN products ON products.id = order_items.product_id
WHERE order_items.created_at >= '2024-01-01'
GROUP BY products.name
ORDER BY revenue DESC
LIMIT 10;
```

## Error Handling

### Connection Failed

```
Error: could not connect to server

Solution:
1. Check VPN connection
2. Verify database credentials
3. Confirm database is running
```

### Query Timeout

```
Error: canceling statement due to statement timeout

Solution:
1. Add WHERE clause to limit rows
2. Add indexes to filtered columns
3. Break into smaller queries
```

### Invalid SQL

```
Error: syntax error at or near "FORM"

Solution:
1. Check SQL syntax
2. Verify table names in schema
3. Use correct PostgreSQL dialect
```

````

---

## Testing & Iteration {#testing}

### Testing Strategy

#### 1. Unit Testing (Individual Skill)

**Test Cases:**
- Skill loads without errors
- Description triggers appropriately
- Instructions are clear and executable
- Scripts run successfully
- Validation works as expected

**Method:**
```bash
# Start fresh Claude instance
claude --debug

# Test skill activation
# User: "I need to [trigger phrase from description]"

# Verify:
# - Skill loads in chain of thought
# - Correct files are read
# - Scripts execute properly
# - Output matches expectations
````

#### 2. Integration Testing (Multiple Skills)

Test how skills work together:

```
Test Scenario: Code Review + Git Commit
1. Review code changes (code-review skill)
2. Generate commit message (commit-messages skill)
3. Create PR description (pr-templates skill)

Expected: All three skills activate and compose smoothly
```

#### 3. Model Testing

Test across Claude versions:

| Test                 | Haiku                   | Sonnet | Opus               |
| -------------------- | ----------------------- | ------ | ------------------ |
| Skill activates      | ✓                       | ✓      | ✓                  |
| Follows instructions | Needs more detail       | ✓      | May over-interpret |
| Script execution     | ✓                       | ✓      | ✓                  |
| Error handling       | Requires explicit steps | ✓      | Handles gracefully |

### Debugging Skills

#### Enable Debug Mode

```bash
claude --debug
```

Output shows:

- Skills loaded at startup
- Which skill activates
- File reads
- Script executions
- Errors

#### Common Issues

**Issue: Skill Not Loading**

```
Symptoms: Skill doesn't appear in loaded skills list

Fixes:
1. Check file path: must be .claude/skills/[name]/SKILL.md
2. Verify YAML frontmatter syntax
3. Ensure --- markers are present
4. Check file permissions (readable)
5. Restart Claude Code
```

**Issue: Skill Not Activating**

```
Symptoms: Skill loaded but Claude doesn't use it

Fixes:
1. Improve description with trigger keywords
2. Make description more specific
3. Test with explicit mention: "Use the X skill to..."
4. Check if description is too broad/narrow
```

**Issue: Script Execution Fails**

```
Symptoms: Scripts produce errors

Fixes:
1. Make script executable: chmod +x script.py
2. Check shebang line: #!/usr/bin/env python3
3. Verify dependencies installed
4. Check file paths are relative to skill directory
5. Add error handling to script
```

### Iteration Process

**Two-Agent Pattern:**

Use two Claude instances for skill development:

**Claude A (Skill Developer):**

```
Role: Create and refine the skill
Task: "Help me build a skill for automated testing"
Output: Draft SKILL.md and scripts
```

**Claude B (Skill Tester):**

```
Role: Use the skill in practice
Task: Load the skill and attempt real work
Observation: Does it work? What's confusing?
```

**Feedback Loop:**

1. Claude A creates initial skill
2. Claude B tests it on real tasks
3. Observe Claude B's behavior
4. Return to Claude A with observations
5. Claude A refines the skill
6. Repeat until smooth

**Example Feedback:**

```
Observation: "Claude B read the database schema file 3 times
during one query - inefficient"

Refinement: "Add schema summary to SKILL.md header,
reference full schema only for complex queries"
```

---

## Distribution & Sharing {#distribution}

### Distribution Methods

#### 1. Project Skills (Team)

**Location:** `.claude/skills/` in project root

**Setup:**

```bash
# In project directory
mkdir -p .claude/skills/project-specific-skill
cd .claude/skills/project-specific-skill
# Create SKILL.md

# Commit to version control
git add .claude/skills
git commit -m "Add project skills"
git push
```

**Benefits:**

- Everyone on team gets skills when they clone
- Version controlled with codebase
- Project-specific workflows
- Consistent team standards

#### 2. Personal Skills (Individual)

**Location:** `~/.claude/skills/`

**Setup:**

```bash
# In home directory
mkdir -p ~/.claude/skills/personal-skill
cd ~/.claude/skills/personal-skill
# Create SKILL.md
```

**Benefits:**

- Available across all projects
- Personal preferences and workflows
- Portable between machines

#### 3. Organization Skills (Company-Wide)

**Method 1: Shared Repository**

```bash
# Create shared skills repo
git clone git@company.com:claude-skills.git ~/.claude/skills/company

# Symlink to personal skills
ln -s ~/.claude/skills/company/* ~/.claude/skills/

# Update regularly
cd ~/.claude/skills/company && git pull
```

**Method 2: Installation Script**

```bash
#!/bin/bash
# install-company-skills.sh

SKILLS_DIR="$HOME/.claude/skills"
COMPANY_SKILLS=(
  "code-review"
  "brand-guidelines"
  "api-testing"
)

for skill in "${COMPANY_SKILLS[@]}"; do
  curl -L "https://skills.company.com/$skill.tar.gz" | \
    tar xz -C "$SKILLS_DIR"
done

echo "Company skills installed!"
```

#### 4. Public Skills (Open Source)

**GitHub Repository Structure:**

```
claude-skills-collection/
├── README.md
├── LICENSE
├── skills/
│   ├── commit-messages/
│   │   └── SKILL.md
│   ├── code-review/
│   │   ├── SKILL.md
│   │   └── scripts/
│   └── documentation/
│       ├── SKILL.md
│       └── references/
└── install.sh
```

**Installation Command:**

```bash
# Clone and install
git clone https://github.com/user/claude-skills-collection.git
cd claude-skills-collection
./install.sh
```

### Versioning Skills

**Semantic Versioning:**

```yaml
---
name: my-skill
description: Description here
version: 2.1.0 # MAJOR.MINOR.PATCH
---
```

**Version Changelog:**

```markdown
# Changelog

## [2.1.0] - 2025-01-15

### Added

- New validation step for edge cases
- Support for JSON output format

### Changed

- Improved error messages
- Updated examples

### Fixed

- Script execution on Windows
- Path handling for nested directories

## [2.0.0] - 2024-12-01

### Breaking Changes

- Renamed frontmatter field from `tools` to `allowed-tools`
- Changed script interface

### Added

- Multi-language support
```

### Licensing

**MIT License (Permissive):**

```
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this skill and associated files...
```

**Apache 2.0 (Patent Protection):**

```
Licensed under the Apache License, Version 2.0...
```

**Proprietary (Company Internal):**

```
Copyright (c) 2025 Company Name
All Rights Reserved

This skill is proprietary and confidential.
Unauthorized copying or distribution is prohibited.
```

### Documentation for Distribution

**README.md Template:**

````markdown
# Skill Name

Brief description of what this skill does.

## Installation

```bash
# Copy to skills directory
cp -r skill-name ~/.claude/skills/
```
````

## Prerequisites

- Python 3.8+
- Required packages: `pip install -r requirements.txt`

## Usage

Activate by saying: "Use [skill name] to [task description]"

Example: "Use the code reviewer skill to review my Python changes"

## Configuration

Edit `config.yaml` to customize:

```yaml
strictness: high
language: python
```

## Examples

### Example 1: Basic Usage

[Show concrete example]

### Example 2: Advanced Usage

[Show advanced scenario]

## Troubleshooting

**Problem**: Skill not loading
**Solution**: Check file permissions and restart Claude

## Contributing

Pull requests welcome! See CONTRIBUTING.md

## License

MIT License - see LICENSE file

````

---

## Security Considerations {#security}

### Sensitive Data

**Do NOT Include in Skills:**
- API keys or secrets
- Passwords or tokens
- Private database credentials
- Personal information
- Proprietary algorithms
- Customer data

**Safe Approaches:**

**1. Environment Variables**
```markdown
## Configuration

Set required environment variables:
```bash
export API_KEY="your-key-here"
export DB_PASSWORD="your-password"
````

In skill:

```python
import os
api_key = os.environ.get('API_KEY')
```

**2. Configuration Files (Gitignored)**

```markdown
## Setup

Create `.env` file (not committed to git):
```

API_KEY=your-key-here
DB_HOST=localhost

```

Add to `.gitignore`:
```

.env
config.local.yaml
secrets.json

````

**3. Credential Managers**
```bash
# Use system keychain
security find-generic-password -s "claude-skill-api-key" -w
````

### Script Safety

**Dangerous Patterns to Avoid:**

```python
# ❌ DANGEROUS: Direct user input in shell
user_input = input("Enter filename: ")
os.system(f"rm {user_input}")  # Can delete anything!

# ✅ SAFE: Validate and sanitize
import re
user_input = input("Enter filename: ")
if re.match(r'^[a-zA-Z0-9_-]+\.txt, user_input):
    os.remove(user_input)
else:
    print("Invalid filename")
```

**Safe Practices:**

1. **Validate inputs** - Check type, format, range
2. **Sanitize paths** - Prevent directory traversal
3. **Use allowlists** - Not denylists
4. **Limit permissions** - Run with minimal privileges
5. **Handle errors** - Don't expose system details

### Tool Restrictions

Limit Claude's capabilities during skill execution:

```yaml
---
name: read-only-analyzer
allowed-tools: Read, Grep # No Write or Bash
---
```

**Security Levels:**

| Level                | Tools                    | Use Case                 |
| -------------------- | ------------------------ | ------------------------ |
| **Maximum Security** | `Read` only              | Analyzing sensitive code |
| **Read-Only**        | `Read, Grep, Glob`       | Research and analysis    |
| **Safe Operations**  | `Read, Write`            | Document generation      |
| **Full Access**      | `Bash, Read, Write, ...` | Development workflows    |

### Audit Logging

For sensitive operations, add logging:

```python
import logging
from datetime import datetime

logging.basicConfig(
    filename='skill-audit.log',
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)

def execute_query(query):
    logging.info(f"Query executed: {query[:100]}...")
    # Execute query
    logging.info("Query completed successfully")
```

### Access Control

For team/organization skills:

```yaml
---
name: production-deployer
description: Deploy to production servers (requires admin role)
allowed-users: admin-group
---

# Production Deployment

## Prerequisites

**Required Permissions:**
- Admin role in organization
- Production access credentials
- Two-factor authentication enabled

## Verification

Before deployment, verify:
1. User is in admin group
2. 2FA is authenticated
3. Deployment approval exists
```

---

## Common Patterns & Examples {#examples}

### Example 1: Git Commit Messages

**Skill File: `~/.claude/skills/commit-messages/SKILL.md`**

```markdown
---
name: commit-messages
description: Generate semantic commit messages from git diffs following Conventional Commits. Use when writing commit messages or staging changes.
version: 1.0.0
---

# Semantic Commit Messages

## Commit Format
```

<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

## Process

### 1. Review Changes

```bash
git diff --staged
```

### 2. Analyze Impact

- What changed functionally?
- Why was it changed?
- What components affected?

### 3. Generate Message

**Subject Line:**

- Present tense: "Add" not "Added"
- Lowercase except proper nouns
- No period at end
- Max 50 characters

**Body:**

- Explain WHAT and WHY
- Not HOW (visible in diff)
- Wrap at 72 characters

**Footer:**

- Breaking changes: `BREAKING CHANGE: description`
- Issues: `Closes #123`

## Examples

### Feature Addition

```
feat(auth): add password reset functionality

Implement password reset flow with email verification:
- Add reset token generation and validation
- Create email templates for reset links
- Add rate limiting to prevent abuse

Closes #456
```

### Bug Fix

```
fix(api): prevent null pointer in user lookup

Add null check before accessing user.email property
to handle cases where user object might be undefined.

Fixes #789
```

### Breaking Change

```
refactor(api)!: change authentication endpoint structure

Restructure /auth endpoints for consistency:
- Rename /auth/login to /auth/signin
- Move /auth/refresh to /auth/token/refresh

BREAKING CHANGE: Client applications must update
authentication endpoint URLs.
```

## Validation

Before committing:

- [ ] Type is valid (feat, fix, docs, etc)
- [ ] Subject is clear and concise
- [ ] Body explains what and why
- [ ] Footer includes issue references
- [ ] No spelling errors

````

### Example 2: Documentation Generation

**Skill File: `~/.claude/skills/api-docs/SKILL.md`**

```markdown
---
name: api-docs
description: Generate comprehensive API documentation from code with examples, types, and error codes. Use when documenting APIs, endpoints, or public interfaces.
version: 2.0.0
---

# API Documentation Generator

## Documentation Structure

```markdown
# API Documentation

## Overview
Brief description of the API

## Authentication
How to authenticate requests

## Endpoints

### GET /resource
Description of endpoint

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|

**Response:**
```json
{
  "example": "response"
}
````

**Error Codes:**

- 400: Bad Request
- 401: Unauthorized

````

## Process

### 1. Analyze Code
Read the API code to understand:
- Available endpoints
- Request/response formats
- Authentication requirements
- Error handling

### 2. Extract Information

**From Comments:**
```python
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    Retrieve user by ID

    Args:
        user_id: Integer user identifier

    Returns:
        User object with email, name, created_at

    Raises:
        404: User not found
        401: Unauthorized
    """
````

**From Type Hints:**

```python
def create_user(
    email: str,
    name: str,
    age: Optional[int] = None
) -> User:
```

### 3. Generate Examples

For each endpoint, create:

- Request example (curl, Python, JavaScript)
- Response example (JSON)
- Error examples

### 4. Document Error Codes

Common patterns:

- 200: Success
- 201: Created
- 400: Bad Request (validation failed)
- 401: Unauthorized (missing/invalid auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limited)
- 500: Internal Server Error

## Template

````markdown
## {HTTP_METHOD} {ENDPOINT_PATH}

{Brief description}

### Request

**Authentication:** {Required | Optional | None}

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: application/json
```
````

**Parameters:**

{If URL parameters exist:}
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | integer | Yes | Resource identifier |

{If query parameters exist:}
**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Results per page |

{If request body exists:}
**Body:**

```json
{
  "field": "value"
}
```

### Response

**Success (200 OK):**

```json
{
  "data": {},
  "meta": {}
}
```

**Error Responses:**

**400 Bad Request:**

```json
{
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format"
  }
}
```

**404 Not Found:**

```json
{
  "error": "Resource not found"
}
```

### Examples

**cURL:**

```bash
curl -X GET "https://api.example.com/resource" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Python:**

```python
import requests

response = requests.get(
    "https://api.example.com/resource",
    headers={"Authorization": f"Bearer {token}"}
)
data = response.json()
```

**JavaScript:**

```javascript
const response = await fetch("https://api.example.com/resource", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await response.json();
```

````

## Example: Users API

### GET /users/:id

Retrieve a user by their unique identifier.

### Request

**Authentication:** Required

**Headers:**
```http
Authorization: Bearer <access_token>
````

**URL Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | integer | Yes | User ID |

### Response

**Success (200 OK):**

```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "role": "user"
}
```

**Error Responses:**

**401 Unauthorized:**

```json
{
  "error": "Invalid or expired token"
}
```

**404 Not Found:**

```json
{
  "error": "User not found",
  "user_id": 123
}
```

### Examples

**cURL:**

```bash
curl -X GET "https://api.example.com/users/123" \
  -H "Authorization: Bearer eyJhbGciOiJIUz..."
```

**Python:**

```python
import requests

token = "eyJhbGciOiJIUz..."
user_id = 123

response = requests.get(
    f"https://api.example.com/users/{user_id}",
    headers={"Authorization": f"Bearer {token}"}
)

if response.status_code == 200:
    user = response.json()
    print(f"User: {user['name']}")
else:
    print(f"Error: {response.json()['error']}")
```

**JavaScript:**

```javascript
const token = "eyJhbGciOiJIUz...";
const userId = 123;

try {
  const response = await fetch(`https://api.example.com/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const user = await response.json();
    console.log(`User: ${user.name}`);
  } else {
    const error = await response.json();
    console.error(`Error: ${error.error}`);
  }
} catch (err) {
  console.error("Request failed:", err);
}
```

```

---

## Additional Resources

### Official Documentation
- Claude Code Documentation: https://docs.claude.com
- Skills Guide: https://docs.claude.com/skills
- Best Practices: https://docs.claude.com/best-practices

### Community Resources
- Example Skills Repository: https://github.com/anthropics/claude-skills
- Community Forum: https://community.anthropic.com
- Discord Community: https://discord.gg/claude

### Related Features
- **Projects**: Cumulative context for ongoing work
- **MCP Servers**: External tool integrations
- **Subagents**: Parallel task processing
- **Deep Research**: Complex research workflows

---

## Conclusion

Claude Code Skills transform AI interactions from one-off conversations into reusable, scalable workflows. By packaging instructions, scripts, and resources into skills, you create:

- **Consistency**: Same high-quality output every time
- **Efficiency**: No repeated explanations needed
- **Scalability**: Share across teams without context limits
- **Maintainability**: Update once, applies everywhere

**Start Simple:**
1. Identify a repeated task
2. Create basic SKILL.md with clear instructions
3. Test and iterate
4. Add scripts and references as needed
5. Share with your team

**Remember:**
- Description determines when skill activates
- Progressive disclosure keeps context efficient
- Scripts provide reliability for complex operations
- Validation ensures quality output
- Documentation helps others use your skills

**Questions or Feedback:**
- GitHub Issues: https://github.com/anthropics/claude-code
- Email: support@anthropic.com
- Community Forum: https://community.anthropic.com

---

*Last Updated: January 2026*
*Version: 1.0.0*
```
