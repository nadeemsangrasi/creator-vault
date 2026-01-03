# CreatorVault Constitution

## Core Principles

### I. Spec-Driven Development (SDD)
Every feature implementation must follow a spec-first approach. Requirements, architecture, and tasks must be documented in Markdown files under `specs/` and approved by the user before code is written.

### II. Privacy-First Creator Ecosystem
The platform is built for creators with privacy as a foundational requirement. All idea captures, drafts, and creative content must be encrypted and protected behind robust authentication layers.

### III. AI-Assisted, Human-Centric
Artificial Intelligence (via Claude Code skills and OpenAI) is used to accelerate development and creative brainstorming, but the human creator maintains absolute control over the final content and architectural decisions.

### IV. Smallest Viable Diff & Clean Code
Implementation must prioritize the smallest possible diff that achieves the success criteria. Unused code is deleted immediately. Code should be self-documenting, and comments are reserved only for non-obvious logic.

### V. Phase-Based Evolution
The project follows a strict 5-phase evolution:
1. Console App (Python)
2. Full-Stack Web App (Next.js/FastAPI)
3. AI-Powered Chatbot
4. Local Kubernetes (Minikube)
5. Cloud Deployment (DOKS/Kafka/Dapr)

### VI. Observability & Debuggability
All operations must be traceable. System state and creative workflows should be observable via structured logs and Prompt History Records (PHRs) to ensure rapid diagnosis of issues.

## Technical Constraints & Standards

- **Backend:** Python 3.13+, FastAPI, SQLModel (SQLAlchemy).
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Database:** Neon Serverless PostgreSQL.
- **Auth:** Better Auth with JWT-based cross-service verification.
- **Micro-interactions:** Framer Motion for modern, weighted UI motion.
- **Package Management:** `uv` for Python, `npm` for Node.js.

## Governance & Quality Gates

### Mandatory PHR (Prompt History Record)
A PHR must be created after every user request to maintain a persistent log of the development journey. These records are stored under `history/prompts/`.

### Intelligent ADR (Architectural Decision Record)
Significant architectural decisions must be proposed as ADRs via the `/sp.adr` command. ADRs are stored under `history/adr/` and require explicit user consent.

**Version:** 1.0.0 | **Ratified:** 2026-01-04 | **Last Amended:** 2026-01-04
