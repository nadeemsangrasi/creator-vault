# CreatorVault Constitution

<!--
SYNC IMPACT REPORT
==================
Version Change: 1.1.0 → 1.2.0
Modified Principles:
  - Enhanced Principle V: Phase-Based Evolution (updated to reflect Phase 3 as current phase)
  - Enhanced Principle VII: Phase 2 Quality Gates → Phase 3 Quality Gates (updated for AI Chatbot delivery)
Added Sections:
  - Phase 3 Technical Standards (detailed AI Chatbot implementation requirements)
  - Phase 3 Quality Gates (AI Chatbot delivery criteria)
Removed Sections:
  - set_reminder tool from MCP Tools Specification (to be added in future phase)
Templates Status:
  ✅ plan-template.md - Phase 3 NFRs validated
  ✅ spec-template.md - Phase 3 scope alignment validated
  ✅ tasks-template.md - Phase 3 task categories validated
Follow-up TODOs: None
-->

## Core Principles

### I. Spec-Driven Development (SDD)
Every feature implementation MUST follow a spec-first approach. Requirements, architecture, and tasks must be documented in Markdown files under `specs/` and approved by the user before code is written. This ensures traceability, reduces rework, and maintains alignment with product goals.

### II. Privacy-First Creator Ecosystem
The platform is built for creators with privacy as a foundational requirement. All idea captures, drafts, and creative content MUST be encrypted and protected behind robust authentication layers. No user content is ever exposed without explicit authorization. Data sovereignty and creator control are non-negotiable.

### III. AI-Assisted, Human-Centric
Artificial Intelligence (via Claude Code skills and Context7 MCP) is used to accelerate development and creative brainstorming, but the human creator maintains absolute control over the final content and architectural decisions. AI suggests, humans decide. All AI-generated artifacts require explicit human approval before merging to main. In Phase 3, AI agents will assist with content ideation and management through natural language interactions.

### IV. Smallest Viable Diff & Clean Code
Implementation MUST prioritize the smallest possible diff that achieves the success criteria. Unused code is deleted immediately. Code should be self-documenting with clear naming conventions. Comments are reserved only for non-obvious logic, complex algorithms, or architectural rationale. Premature abstraction is forbidden.

### V. Phase-Based Evolution
The project follows a strict 5-phase evolution. Each phase builds incrementally on the previous:

1. **Phase 1: Console App (Python)** - COMPLETED
2. **Phase 2: Full-Stack Web App (Next.js/FastAPI)** - COMPLETED
3. **Phase 3: AI-Powered Chatbot** - IN PROGRESS ⬅ CURRENT PHASE
4. **Phase 4: Local Kubernetes (Minikube)** - PLANNED
5. **Phase 5: Cloud Deployment (DOKS/Kafka/Dapr)** - PLANNED

Each phase MUST be validated with working demos, tests, and PHRs before advancing to the next.

### VI. Observability & Debuggability
All operations MUST be traceable. System state and creative workflows should be observable via structured logs, OpenTelemetry traces, and Prompt History Records (PHRs) to ensure rapid diagnosis of issues. Every API call, database operation, and authentication flow must be instrumented. In Phase 3, AI agent interactions and MCP tool invocations must also be logged for debugging.

### VII. Phase 3 Quality Gates (AI Chatbot Delivery)
For Phase 3 to be considered complete, the following MUST be delivered:
1. Working OpenAI ChatKit UI with conversational interface
2. OpenAI Agents SDK integration for natural language processing
3. MCP server with tools for idea management operations
4. Stateless chat endpoint with database-persisted conversation history
5. AI-powered brainstorming capabilities (idea expansion, angle suggestions)
6. Natural language commands working (add, list, update, delete, expand ideas)
7. Complete PHR trail documenting AI integration and architectural decisions

## Technical Constraints & Standards

### Phase 2 Technology Stack (Foundation)

#### Backend Requirements
- **Language:** Python 3.13+ (managed by `uv`)
- **Framework:** FastAPI with async/await patterns
- **ORM:** SQLModel with Alembic migrations
- **Validation:** Pydantic v2 models with strict type checking
- **API Docs:** Auto-generated OpenAPI 3.1 with examples
- **Testing:** pytest with pytest-asyncio for async tests

#### Frontend Requirements
- **Framework:** Next.js 16 with App Router (no Pages Router)
- **Language:** TypeScript with strict mode enabled
- **Styling:** Tailwind CSS 4.x with shadcn/ui components
- **State Management:** React Context + Server Actions (no Redux unless justified)
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion for micro-interactions and page transitions
- **Testing:** Vitest + React Testing Library

#### Database & Storage
- **Primary Database:** Neon Serverless PostgreSQL
- **Connection Pooling:** PgBouncer via Neon
- **Migrations:** Alembic with SQLModel integration
- **Secrets Management:** Environment variables via `.env` (never committed)

#### Authentication & Security
- **Auth Framework:** Better Auth (next-generation auth library)
- **Token Strategy:** JWT with RSA-256 signing
- **Session Management:** Database-backed sessions with Redis fallback
- **Cross-Service Auth:** JWT verification between Next.js and FastAPI
- **Password Hashing:** bcrypt with cost factor 12

#### Infrastructure & DevOps (Phase 2 Foundation)
- **Containerization:** Docker with multi-stage builds
- **Orchestration:** docker-compose for local development
- **Package Management:** `uv` (Python), `npm` (Node.js)
- **CI/CD:** GitHub Actions (lint, test, build validation)
- **Logging:** Structured JSON logs with correlation IDs

### Phase 3 Technology Stack (MANDATORY)

#### AI & Chat Interface Requirements
- **Frontend Chat UI:** OpenAI ChatKit for conversational interface
- **AI Framework:** OpenAI Agents SDK for natural language processing
- **MCP Server:** Official MCP SDK for exposing tools to AI agents
- **State Management:** Conversation state persisted in Neon DB
- **AI Capabilities:** Natural language processing, brainstorming, idea expansion

#### MCP Tools Specification
- **Tool: add_idea** - Create new ideas with title, notes, tags, priority
- **Tool: list_ideas** - Retrieve ideas with filtering by stage, tags, priority
- **Tool: expand_idea** - AI-powered idea expansion with angles/suggestions
- **Tool: update_idea** - Modify idea details, stage, tags
- **Tool: delete_idea** - Remove ideas from database

#### AI Agent Behavior
- **Natural Language Commands:** Support for conversational interaction
- **Context Awareness:** Maintain conversation context across exchanges
- **Error Handling:** Graceful handling of invalid commands or missing data
- **Confirmation Responses:** Friendly confirmation of all actions taken

#### API Extensions for AI
- **Chat Endpoint:** POST `/api/{user_id}/chat` for natural language interaction
- **Conversation Management:** Stateless design with database-persisted history
- **Response Streaming:** Server-Sent Events (SSE) for real-time responses
- **Tool Integration:** MCP tools invoked based on AI agent decisions

## Governance & Quality Gates

### Mandatory PHR (Prompt History Record)
A PHR must be created after every user request to maintain a persistent log of the development journey. These records are stored under `history/prompts/`.

### Intelligent ADR (Architectural Decision Record)
Significant architectural decisions must be proposed as ADRs via the `/sp.adr` command. ADRs are stored under `history/adr/` and require explicit user consent.

---

**Version:** 1.2.0 | **Ratified:** 2026-01-04 | **Last Amended:** 2026-01-12

**Version Bump Rationale:** MINOR version increment (1.1.0 → 1.2.0) due to addition of new Phase 3-specific technical standards and quality gates, and updates to existing principles to reflect AI Chatbot implementation requirements. No backward-incompatible changes to governance or existing principles.
