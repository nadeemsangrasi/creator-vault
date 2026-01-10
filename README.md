# CreatorVault: Content Idea & Draft Manager

> **A privacy-first platform for content creators to capture ideas, organize drafts, and leverage AI for brainstorming.**

![Project Status](https://img.shields.io/badge/Status-Phase_2:_Full_Stack-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_|_FastAPI_|_Neon-purple)

## 📖 Overview

CreatorVault is designed to manage the creative workflow from initial spark to published content. Unlike generic task managers, it focuses specifically on content creation needs—supporting idea stages (Idea → Outline → Draft → Published), rich text notes, and future AI integration for content expansion.

This project is part of the **"Evolution of CreatorVault"** Hackathon, demonstrating a strict **Spec-Driven Development (SDD)** approach where every feature is specified in Markdown before implementation.

---

## 🚀 Key Features

- **Privacy-First Architecture**: Your ideas remain yours.
- **Content Lifecycle Management**: Track ideas from spark to publication.
- **Modern Web Interface**: Responsive 2026-style UI with kinetic typography and anticipatory UX.
- **Robust Backend**: Type-safe FastAPI backend with SQLModel and PostgreSQL.
- **Secure Authentication**: Better Auth integration with JWT verification.
- **Spec-Driven**: Built entirely from spec-first principles.

---

## 🛠 Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **Auth**: Better Auth (Client)

### Backend (`/backend`)
- **Framework**: FastAPI (Python 3.13+)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel (Pydantic v2 + SQLAlchemy)
- **Migrations**: Alembic
- **Auth**: Better Auth (JWT Verification)

### Infrastructure & Tools
- **Containerization**: Docker & Docker Compose
- **Development**: Claude Code + Spec-Kit Plus
- **Documentation**: OpenAPI (Swagger) & ReDoc

---

## 📂 Project Structure

```bash
creatorvault/
├── frontend/             # Next.js Web Application
│   ├── app/              # App Router Pages
│   ├── components/       # shadcn/ui Components
│   └── lib/              # Utilities & API Clients
├── backend/              # FastAPI REST API
│   ├── routes/           # API Endpoints
│   ├── services/         # Business Logic
│   └── models/           # SQLModel Entities
├── specs/                # Feature Specifications (Source of Truth)
├── history/              # Prompt History Records (PHR) & ADRs
├── templates/            # Spec-Kit Plus Templates
└── .specify/             # Logic & Configuration for SDD
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- Python 3.13+ (`uv` package manager recommended)
- Docker Desktop
- PostgreSQL Database (Neon or Local)

### 1. Backend Setup
```bash
cd backend
# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uv run uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Start development server
npm run dev
```
Visit **http://localhost:3000** to see the app.
Visit **http://localhost:8000/docs** for API documentation.

---

## 🗺 Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **I** | **In-Memory Console App** (Python CLI) | ✅ Completed |
| **II** | **Full-Stack Web App** (Next.js/FastAPI) | 🔄 In Progress |
| **III** | **AI-Powered Chatbot** (Agents & MCP) | 📅 Planned |
| **IV** | **Local Kubernetes** (Minikube + Helm) | 📅 Planned |
| **V** | **Cloud Deployment** (DOKS + Kafka/Dapr) | 📅 Planned |

---

## 🧠 Development Philosophy

**"Spec First, Code Follows"**

Every line of code in this repository originates from a Markdown specification in the `specs/` folder. We use AI agents (Claude Code) to implement features strictly according to these specs.

1. **Define**: Write a spec in `specs/features/`.
2. **Implement**: Use AI agents to build the feature.
3. **Verify**: Test against acceptance criteria.
4. **Document**: Record the process in `history/prompts/`.

---

## 📄 License

This project is licensed under the MIT License.

---

*Generated for the "Evolution of CreatorVault" Hackathon - Dec 2025/Jan 2026*
