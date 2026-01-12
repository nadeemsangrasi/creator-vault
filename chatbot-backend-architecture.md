# CreatorVault Phase 3: Chatbot Backend Architecture

**Status:** Phase 3 - AI-Powered Chatbot (In Planning)
**Last Updated:** 2026-01-11
**Document Type:** Architecture Design Document (ADD)

---

## 1. Executive Summary

Phase 3 introduces an **AI-powered chatbot** to CreatorVault with the following characteristics:

- **Frontend:** Adapted OpenAI ChatKit UI configured to work with custom backend
- **Backend:** FastAPI streaming chatbot with persistent chat history storage
- **Integration:** MCP (Model Context Protocol) servers mounted as `/api/v1/mcp` endpoints
- **Communication:** Server-Sent Events (SSE) for streaming responses
- **Storage:** PostgreSQL with SQLModel for chat history, sessions, and metadata
- **Authentication:** JWT-based using existing Better Auth system

### Key Goals
✅ Enable intelligent, context-aware conversations
✅ Persist chat history per user with full search/filtering
✅ Stream responses for responsive UX
✅ Integrate MCP tools as external knowledge sources
✅ Maintain privacy-first architecture with encrypted storage
✅ Scale to Kubernetes deployment (Phase 4)

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Adapted ChatKit UI Components                       │   │
│  │   - Chat Interface                                    │   │
│  │   - Message History Panel                            │   │
│  │   - Streaming Message Display                        │   │
│  │   - Session/Thread Management                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  API Client (with JWT Bearer token)                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                    REST/SSE
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   FastAPI Backend (Python)                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Authentication & Authorization              │   │
│  │          (JWT verification via Better Auth)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ▲                                    │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │                 API Endpoints v1                     │   │
│  │                                                       │   │
│  │  POST   /api/v1/chat/sessions      Create session   │   │
│  │  GET    /api/v1/chat/sessions      List sessions    │   │
│  │  GET    /api/v1/chat/sessions/{id} Get session      │   │
│  │  DELETE /api/v1/chat/sessions/{id} Delete session   │   │
│  │                                                       │   │
│  │  POST   /api/v1/chat/messages      Stream message   │   │
│  │  GET    /api/v1/chat/messages      List messages    │   │
│  │  DELETE /api/v1/chat/messages/{id} Delete message   │   │
│  │                                                       │   │
│  │  POST   /api/v1/mcp/tools          List MCP tools   │   │
│  │  POST   /api/v1/mcp/invoke         Invoke MCP tool  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ▲                                    │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │         Chatbot Service Layer                        │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │ Chat Manager                               │    │   │
│  │  │ - Session lifecycle management             │    │   │
│  │  │ - Message streaming orchestration          │    │   │
│  │  │ - User context management                  │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │ LLM Integration Layer                      │    │   │
│  │  │ - Prompt construction                      │    │   │
│  │  │ - Model selection (Claude/GPT/Gemini)     │    │   │
│  │  │ - Streaming response handling              │    │   │
│  │  │ - Token counting & rate limiting           │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │ MCP Tool Executor                          │    │   │
│  │  │ - Tool discovery                           │    │   │
│  │  │ - Tool invocation                          │    │   │
│  │  │ - Result formatting & caching              │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ▲                                    │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │      Repository Layer (Data Access)                 │   │
│  │                                                       │   │
│  │  - ChatSessionRepository                            │   │
│  │  - ChatMessageRepository                            │   │
│  │  - MCPToolRepository                                │   │
│  │  - ChatMetadataRepository                           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   PostgreSQL        MCP Server     LLM Provider
  (Neon, PgBouncer)   Process    (Claude/OpenAI)
   Chat Data
   Storage
```

---

## 3. Scope and Dependencies

### In Scope

**Phase 3 Deliverables:**
- [ ] Chat session management (create, retrieve, list, delete)
- [ ] Streaming message endpoint with SSE support
- [ ] Chat history persistence and retrieval
- [ ] MCP tool integration layer
- [ ] Message encryption at rest (optional: Phase 3.5)
- [ ] Rate limiting and token budgeting
- [ ] OpenAPI documentation for all endpoints

**Frontend Integration:**
- [ ] Adapted ChatKit UI components for custom backend
- [ ] Session/thread management UI
- [ ] Message streaming display
- [ ] Chat history sidebar with search/filtering
- [ ] MCP tool selection UI

### Out of Scope (Phase 4+)

- Multi-user collaborative chat
- Voice/audio message support
- Image attachment handling
- Fine-tuned model training
- Chat analytics/insights

### External Dependencies

| Dependency | Purpose | Ownership |
|-----------|---------|-----------|
| **Better Auth (Existing)** | JWT token validation, user context | CreatorVault Frontend |
| **PostgreSQL (Neon)** | Chat history and session storage | Neon (managed) |
| **LLM Provider API** | Claude/GPT/Gemini for completions | OpenAI/Anthropic/Google |
| **MCP Servers** | External tools/knowledge sources | Community/Custom |
| **FastAPI + SQLModel** | Framework and ORM | Python ecosystem |

---

## 4. Key Architectural Decisions & Rationale

### 4.1 Streaming Strategy: Server-Sent Events (SSE)

**Decision:** Implement **Server-Sent Events (SSE)** for message streaming

| Aspect | SSE |
|--------|-----|
| **Use Case** | One-way streaming (responses) |
| **HTTP Compatibility** | ✅ Pure HTTP/1.1 |
| **Complexity** | Simple async generator |
| **Latency** | Acceptable (~100ms overhead) |

**Rationale:**
- SSE is simpler to implement and deploy (works through proxies/load balancers)
- No complex real-time requirements for chatbot functionality
- Sufficient for token-by-token response streaming
- Works well with existing REST API patterns

**Acceptance Criteria:**
```
[ ] POST /api/v1/chat/messages streams with Content-Type: text/event-stream
[ ] Messages arrive within 200ms of generation
[ ] Connection cleanly closes on completion
[ ] Errors returned as SSE events with error:type field
[ ] Frontend can display token-by-token streaming
```

---

### 4.2 Chat History Storage Architecture

**Decision:** User-scoped, immutable message log with versioning

**Schema Design:**
```python
class ChatSession(SQLModel, table=True):
    """Represents a conversation thread/session"""
    id: str = Field(primary_key=True)  # UUID
    user_id: str  # From JWT sub claim
    title: str  # Auto-generated or user-provided
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    archived_at: Optional[datetime] = None
    metadata: dict = Field(default_factory=dict)  # JSON: model_config, etc.
    __table_args__ = (
        Index("idx_user_created", "user_id", "created_at"),
    )

class ChatMessage(SQLModel, table=True):
    """Represents a single message in a session"""
    id: str = Field(primary_key=True)  # UUID
    session_id: str = Field(foreign_key="chatsession.id")
    user_id: str  # Denormalized for authorization
    role: Literal["user", "assistant", "system"]
    content: str  # Plain text or JSON for structured content
    content_hash: str = Field(index=True)  # For dedup
    status: Literal["pending", "sent", "delivered", "failed"] = "sent"
    token_count: int = 0
    model: str  # Model used for assistant response
    created_at: datetime = Field(default_factory=datetime.utcnow)
    encrypted: bool = False
    metadata: dict = Field(default_factory=dict)  # JSON: tools_used, etc.
    __table_args__ = (
        Index("idx_session_created", "session_id", "created_at"),
    )

class MCPToolInvocation(SQLModel, table=True):
    """Track MCP tool calls within conversations"""
    id: str = Field(primary_key=True)
    message_id: str = Field(foreign_key="chatmessage.id")
    tool_name: str
    input_params: dict
    output_result: dict
    execution_time_ms: float
    status: Literal["pending", "success", "error"]
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Rationale:**
- **Immutable log:** Messages are never deleted (soft-delete via archive), enabling audit trail
- **User-scoped:** Foreign key on `user_id` prevents cross-user data leakage
- **Token tracking:** Essential for billing and rate limiting
- **MCP tracking:** Understand which tools contribute to responses

**Acceptance Criteria:**
```
[ ] Chat messages are indexed by session_id and created_at
[ ] User can only access their own chat sessions/messages
[ ] Messages include role, content, model, and timestamp
[ ] MCP tool invocations are logged with results
[ ] Queries for chat history return <100ms for typical session
```

---

### 4.3 MCP Integration Strategy

**Decision:** Mount MCP servers as FastAPI sub-applications under `/api/v1/mcp` with focus on CreatorVault's existing ideas functionality

**Architecture:**
```python
# backend/src/services/mcp_service.py
from mcp import Server, Tool
from typing import AsyncIterator
from src.api.v1.endpoints.ideas import router as ideas_router
from src.repositories.idea_repository import IdeaRepository

class MCPIntegrationService:
    def __init__(self, config: MCPConfig):
        self.config = config
        self.idea_repo = IdeaRepository()  # Use existing repository pattern
        # MCP tools that wrap existing CreatorVault functionality
        self.tools = {
            "get_user_ideas": self._get_user_ideas_tool,
            "create_new_idea": self._create_idea_tool,
            "update_existing_idea": self._update_idea_tool,
            "search_ideas_by_tag": self._search_ideas_tool,
        }

    async def _get_user_ideas_tool(self, params: dict) -> dict:
        """MCP wrapper for getting user's existing ideas"""
        # Call existing ideas API endpoint logic
        user_id = params.get("user_id")
        limit = params.get("limit", 10)
        offset = params.get("offset", 0)
        # Use existing repository pattern from ideas module
        ideas = await self.idea_repo.get_user_ideas(user_id, limit=limit, offset=offset)
        return {"ideas": ideas}

    async def _create_idea_tool(self, params: dict) -> dict:
        """MCP wrapper for creating new ideas"""
        user_id = params.get("user_id")
        idea_data = params.get("idea_data")
        # Use existing idea creation logic
        new_idea = await self.idea_repo.create_idea(user_id, idea_data)
        return {"idea": new_idea}

    async def _update_idea_tool(self, params: dict) -> dict:
        """MCP wrapper for updating existing ideas"""
        idea_id = params.get("idea_id")
        user_id = params.get("user_id")
        update_data = params.get("update_data")
        # Validate user owns the idea first
        existing_idea = await self.idea_repo.get_idea_by_id(idea_id)
        if existing_idea.user_id != user_id:
            raise PermissionError("User does not own this idea")
        # Use existing idea update logic
        updated_idea = await self.idea_repo.update_idea(idea_id, update_data)
        return {"idea": updated_idea}

    async def _search_ideas_tool(self, params: dict) -> dict:
        """MCP wrapper for searching ideas with all available filters"""
        user_id = params.get("user_id")
        search_query = params.get("q", "")  # Using 'q' as parameter name
        tags = params.get("tags", [])
        priority = params.get("priority")
        stage = params.get("stage")
        limit = params.get("limit", 10)
        offset = params.get("offset", 0)
        # Use existing search functionality with the 4 filters
        ideas = await self.idea_repo.search_ideas(
            user_id=user_id,
            search_query=search_query,
            tags=tags,
            priority=priority,
            stage=stage,
            limit=limit,
            offset=offset
        )
        return {"ideas": ideas}

# backend/main.py
from fastapi import FastAPI, HTTPException
from src.services.mcp_service import MCPIntegrationService

app = FastAPI()
mcp_service = MCPIntegrationService(config)

@app.post("/api/v1/mcp/tools")
async def list_mcp_tools():
    """List all available MCP tools for CreatorVault functionality"""
    available_tools = []
    for tool_name in mcp_service.tools.keys():
        available_tools.append({
            "name": tool_name,
            "description": f"MCP wrapper for {tool_name.replace('_', ' ')} functionality",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID for authentication"},
                    "params": {"type": "object", "description": "Tool-specific parameters"}
                },
                "required": ["user_id"]
            }
        })
    return {"tools": available_tools}

@app.post("/api/v1/mcp/invoke")
async def invoke_mcp_tool(request: dict):
    """Invoke a specific MCP tool for CreatorVault functionality"""
    tool_name = request.get("tool_name")
    user_id = request.get("user_id")
    input_params = request.get("input", {})

    if tool_name not in mcp_service.tools:
        raise HTTPException(status_code=400, detail=f"Tool {tool_name} not available")

    try:
        # Add user_id to params for authentication validation
        full_params = {"user_id": user_id, **input_params}
        result = await mcp_service.tools[tool_name](full_params)
        return {"result": result, "tool_name": tool_name}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")
```

**MCP Integration with Existing Ideas:**
1. **Leverage Existing API:** MCP tools wrap existing ideas CRUD operations
2. **Authentication Consistency:** Use same JWT validation as ideas API
3. **Data Isolation:** Ensure user can only access their own ideas via MCP
4. **Error Handling:** Reuse existing error patterns from ideas module

**MCP Tools for CreatorVault (Phase 3.1):**
- `get_user_ideas`: Retrieve user's existing ideas
- `create_new_idea`: Create new content ideas via chat
- `update_existing_idea`: Modify existing ideas based on chat suggestions
- `search_ideas`: Search ideas with 4 filters (q, tags, priority, stage)

**Rationale:**
- Leverage existing ideas functionality rather than building new tools
- MCP provides standardized interface for LLM tool calling
- Maintains consistency with existing authentication and data access patterns
- Enables AI to interact with user's content ideas programmatically

**Acceptance Criteria:**
```
[ ] GET /api/v1/mcp/tools returns list of CreatorVault-specific tools
[ ] POST /api/v1/mcp/invoke executes ideas-related tools and returns result <5s
[ ] Tool invocation respects user data isolation (can't access other users' ideas)
[ ] MCP tool calls are logged and associated with chat messages
[ ] Error handling follows existing ideas API patterns
[ ] Search tool accepts all filtering parameters (tags, priority, status, etc.)
```

---

### 4.4 LLM Integration & Model Flexibility

**Decision:** Abstract LLM provider behind service interface, support multiple models

```python
# backend/src/services/llm_service.py
from enum import Enum
from abc import ABC, abstractmethod

class LLMProvider(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    GOOGLE = "google"

class LLMService(ABC):
    @abstractmethod
    async def stream_message(
        self,
        messages: list[dict],
        system: str,
        tools: list[dict],
        **kwargs
    ) -> AsyncIterator[str]:
        """Stream message tokens one at a time"""
        pass

class AnthropicLLMService(LLMService):
    def __init__(self, api_key: str, model: str = "claude-opus-4-1"):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.model = model

    async def stream_message(self, messages, system, tools, **kwargs):
        with self.client.messages.stream(
            model=self.model,
            max_tokens=kwargs.get("max_tokens", 2048),
            system=system,
            tools=tools,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text

class OpenAILLMService(LLMService):
    # Similar implementation for OpenAI API
    pass

# Factory pattern for runtime selection
def get_llm_service(provider: LLMProvider) -> LLMService:
    if provider == LLMProvider.ANTHROPIC:
        return AnthropicLLMService(api_key=settings.ANTHROPIC_API_KEY)
    elif provider == LLMProvider.OPENAI:
        return OpenAILLMService(api_key=settings.OPENAI_API_KEY)
    # ... etc
```

**Rationale:**
- **Flexibility:** Swap providers without code changes
- **Cost Optimization:** Compare pricing, latency per request
- **Resilience:** Fallback provider if primary is down
- **Future-proof:** Easy to add new models (Phase 4)

**Acceptance Criteria:**
```
[ ] LLMService interface supports streaming responses
[ ] Messages streamed with <200ms latency between tokens
[ ] Tool calls recognized and parsed correctly
[ ] Model switching via configuration, no code changes
[ ] Errors from provider (rate limit, 500) handled gracefully
```

---

## 5. API Contracts

### 5.1 Chat Sessions API

#### POST `/api/v1/chat/sessions` - Create Session

```http
POST /api/v1/chat/sessions HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Ideas Brainstorm",
  "description": "Brainstorming content ideas for Q1 2026",
  "metadata": {
    "category": "content_planning"
  }
}
```

**Response (201):**
```json
{
  "id": "sess_abc123",
  "user_id": "user_xyz",
  "title": "Ideas Brainstorm",
  "created_at": "2026-01-11T15:30:00Z",
  "updated_at": "2026-01-11T15:30:00Z",
  "message_count": 0,
  "metadata": {}
}
```

---

#### GET `/api/v1/chat/sessions` - List Sessions

```http
GET /api/v1/chat/sessions?limit=20&offset=0&archived=false HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "sess_abc123",
      "title": "Ideas Brainstorm",
      "message_count": 12,
      "updated_at": "2026-01-11T15:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

#### GET `/api/v1/chat/sessions/{session_id}` - Get Session

```http
GET /api/v1/chat/sessions/sess_abc123 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "id": "sess_abc123",
  "title": "Ideas Brainstorm",
  "created_at": "2026-01-11T15:30:00Z",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Help me brainstorm Q1 content",
      "created_at": "2026-01-11T15:31:00Z"
    }
  ]
}
```

---

#### DELETE `/api/v1/chat/sessions/{session_id}` - Delete Session

```http
DELETE /api/v1/chat/sessions/sess_abc123 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (204):** No content

---

### 5.2 Chat Messages Streaming API

#### POST `/api/v1/chat/messages` - Stream Message (Primary Endpoint)

```http
POST /api/v1/chat/messages HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "session_id": "sess_abc123",
  "messages": [
    {
      "role": "user",
      "content": "Generate 5 creative video ideas for my audience"
    }
  ],
  "system": "You are a creative content strategist helping creators develop engaging ideas.",
  "model": "claude-opus-4-1",
  "max_tokens": 2048,
  "use_mcp_tools": true
}
```

**Response (200) - Server-Sent Events Stream:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type":"message.start","id":"msg_abc123"}

data: {"type":"content.delta","delta":{"text":"Here are 5 creative"}}

data: {"type":"content.delta","delta":{"text":" video ideas"}}

data: {"type":"tool_use.start","id":"tool_001","name":"web_search"}

data: {"type":"tool_use.result","id":"tool_001","result":"..."}

data: {"type":"content.delta","delta":{"text":" based on trending topics"}}

data: {"type":"message.finish","finish_reason":"end_turn","usage":{"input_tokens":150,"output_tokens":342}}

data: [DONE]
```

**Error Response (400):**
```json
{
  "error": {
    "type": "invalid_request",
    "message": "Model claude-opus-4-1 not available",
    "details": {}
  }
}
```

**Error Response (429):**
```
HTTP/1.1 429 Too Many Requests

data: {"type":"error","error":{"type":"rate_limit","message":"Rate limit exceeded: 10 requests/minute"}}
```

---

#### GET `/api/v1/chat/messages` - List Messages

```http
GET /api/v1/chat/messages?session_id=sess_abc123&limit=50 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "msg_001",
      "session_id": "sess_abc123",
      "role": "user",
      "content": "Generate ideas",
      "created_at": "2026-01-11T15:31:00Z",
      "model": null
    },
    {
      "id": "msg_002",
      "session_id": "sess_abc123",
      "role": "assistant",
      "content": "Here are ideas...",
      "created_at": "2026-01-11T15:32:00Z",
      "model": "claude-opus-4-1",
      "token_count": 342
    }
  ],
  "total": 2
}
```

---

### 5.3 MCP Tools API

#### GET `/api/v1/mcp/tools` - List Available Tools

```http
GET /api/v1/mcp/tools HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "tools": [
    {
      "name": "get_user_ideas",
      "description": "Retrieve user's existing content ideas",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "User ID for authentication"
          },
          "limit": {
            "type": "integer",
            "description": "Maximum number of ideas to return",
            "default": 10
          },
          "offset": {
            "type": "integer",
            "description": "Offset for pagination",
            "default": 0
          }
        },
        "required": ["user_id"]
      }
    },
    {
      "name": "create_new_idea",
      "description": "Create a new content idea",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "idea_data": {
            "type": "object",
            "properties": {
              "title": {"type": "string"},
              "description": {"type": "string"},
              "tags": {"type": "array", "items": {"type": "string"}},
              "priority": {"type": "string", "enum": ["low", "medium", "high"]}
            },
            "required": ["title", "description"]
          }
        },
        "required": ["user_id", "idea_data"]
      }
    },
    {
      "name": "search_ideas",
      "description": "Search user's ideas with all available filters",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "q": {"type": "string", "description": "Text search query"},
          "tags": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Filter by tags"
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "description": "Filter by priority"
          },
          "stage": {
            "type": "string",
            "description": "Filter by stage"
          },
          "limit": {"type": "integer", "default": 10, "description": "Max results"},
          "offset": {"type": "integer", "default": 0, "description": "Pagination offset"}
        },
        "required": ["user_id"]
      }
    }
  ]
}
```

---

#### POST `/api/v1/mcp/invoke` - Invoke Tool

```http
POST /api/v1/mcp/invoke HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tool_name": "search_ideas",
  "user_id": "user_xyz",
  "input": {
    "q": "AI content",
    "tags": ["AI", "content"],
    "priority": "high",
    "stage": "planning",
    "limit": 5
  }
}
```

**Response (200):**
```json
{
  "tool_name": "search_ideas",
  "result": {
    "ideas": [
      {
        "id": "idea_001",
        "title": "AI Content Creation Trends",
        "description": "Exploring AI tools for content creation",
        "tags": ["AI", "content", "trends"],
        "priority": "high",
        "stage": "active",
        "created_at": "2026-01-10T10:00:00Z"
      }
    ]
  },
  "execution_time_ms": 156
}
```

---

### 5.4 Error Handling

**Standard Error Response (4xx/5xx):**
```json
{
  "error": {
    "type": "string",
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {}
  },
  "request_id": "req_abc123"
}
```

**Error Types:**
| Type | HTTP | Meaning |
|------|------|---------|
| `unauthorized` | 401 | Missing or invalid JWT token |
| `forbidden` | 403 | Accessing another user's data |
| `not_found` | 404 | Session or message doesn't exist |
| `invalid_request` | 400 | Malformed request body |
| `model_unavailable` | 400 | Selected model not available |
| `rate_limit` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

---

## 6. Non-Functional Requirements (NFRs)

### 6.1 Performance

| Metric | Target | Rationale |
|--------|--------|-----------|
| **First Token Latency** | <2s | Users perceive responsiveness |
| **Token Streaming Rate** | <200ms/token | Smooth display, no jank |
| **Chat History Query** | <100ms | Typical session ±50 messages |
| **MCP Tool Invocation** | <5s p95 | Most tools should be fast |
| **Concurrent Users** | 100/instance | Phase 3 scale |
| **Memory per Session** | <50MB | 1000 concurrent = 50GB ceiling |

**Benchmarking Strategy:**
```yaml
# tests/load_tests/chat_benchmarks.py
- Test: Stream 2048 tokens, measure time/token
- Test: List 50 sessions with 100 messages each
- Test: Invoke get_user_ideas MCP tool 100x concurrently
```

---

### 6.2 Reliability & Availability

| Aspect | Target | Implementation |
|--------|--------|-----------------|
| **Uptime SLO** | 99.5% (Phase 3) | Health checks, auto-recovery |
| **Message Persistence** | 100% | Transactional writes before streaming |
| **Chat History Durability** | RTO=1h, RPO=15min | Daily backups, read replicas |
| **LLM Provider Failover** | 5s switch | Circuit breaker, fallback model |
| **Graceful Degradation** | Partial SSE fail | Client retry with exponential backoff |

---

### 6.3 Security

| Requirement | Implementation |
|-------------|-----------------|
| **Authentication** | JWT from Better Auth, HS256, 24h TTL |
| **Authorization** | User ID from JWT, filter all queries by `user_id` |
| **Data Encryption** | TLS 1.3 in transit; optional AES-256 at rest (Phase 3.5) |
| **Input Validation** | Pydantic schemas, max 32KB message content |
| **Rate Limiting** | 10 requests/minute per user for chat endpoint |
| **PII Handling** | No automatic logging of chat content; user consent required |
| **Secret Management** | `.env` files, no hardcoded keys; Phase 4 → HashiCorp Vault |

---

### 6.4 Cost Optimization

| Layer | Strategy |
|-------|----------|
| **LLM API Calls** | Prompt caching (Anthropic), token-level billing |
| **Database** | Connection pooling (PgBouncer 20/10), read replicas for analytics |
| **Storage** | Archive old messages after 90 days (optional Phase 3.5) |
| **Bandwidth** | Gzip SSE responses (~30% reduction) |

---

## 7. Data Management & Migration

### 7.1 Schema Creation (Alembic Migration)

```python
# backend/alembic/versions/003_add_chat_tables.py
"""Add chat session and message tables"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'chatsession',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('archived_at', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(), default={}),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('idx_user_created', 'user_id', 'created_at'),
    )

    op.create_table(
        'chatmessage',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('session_id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('content_hash', sa.String(64), nullable=True),
        sa.Column('status', sa.String(20), default='sent'),
        sa.Column('token_count', sa.Integer(), default=0),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('encrypted', sa.Boolean(), default=False),
        sa.Column('metadata', postgresql.JSON(), default={}),
        sa.ForeignKeyConstraint(['session_id'], ['chatsession.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('idx_session_created', 'session_id', 'created_at'),
    )

def downgrade():
    op.drop_table('chatmessage')
    op.drop_table('chatsession')
```

---

### 7.2 Data Retention Policy

```python
# Retention: Archive messages older than 90 days, hard-delete after 1 year
class ChatMessageRetentionPolicy:
    ACTIVE_RETENTION_DAYS = 90
    ARCHIVE_RETENTION_DAYS = 365

    @staticmethod
    async def archive_old_messages():
        """Move messages older than 90 days to archive table"""
        cutoff = datetime.utcnow() - timedelta(days=90)
        await session.execute(
            update(ChatMessage)
            .where(ChatMessage.created_at < cutoff)
            .values(archived_at=datetime.utcnow())
        )

    @staticmethod
    async def purge_archived_messages():
        """Hard delete messages older than 1 year"""
        cutoff = datetime.utcnow() - timedelta(days=365)
        await session.execute(
            delete(ChatMessage)
            .where(ChatMessage.archived_at < cutoff)
        )
```

---

## 8. Operational Readiness

### 8.1 Observability

**Logging Strategy:**
```python
# backend/src/core/logging.py
import structlog

logger = structlog.get_logger()

# Log all chat events
logger.info(
    "chat.message.created",
    session_id="sess_abc123",
    message_id="msg_001",
    role="user",
    content_length=150,
    token_count=25,
)

logger.info(
    "chat.streaming.started",
    session_id="sess_abc123",
    model="claude-opus-4-1",
    max_tokens=2048,
)

logger.warning(
    "mcp.tool.timeout",
    tool_name="web_search",
    execution_time_ms=5200,
    timeout_ms=5000,
)
```

**Metrics:**
- `chat.sessions.created` - Counter
- `chat.messages.streamed` - Counter
- `chat.streaming.latency_ms` - Histogram (p50, p95, p99)
- `llm.tokens.input` - Counter
- `llm.tokens.output` - Counter
- `mcp.tool.invocations` - Counter per tool
- `mcp.tool.latency_ms` - Histogram per tool

**Tracing:**
- Correlation ID attached to all logs/traces
- OpenTelemetry instrumentation (Phase 4)

---

### 8.2 Alerting

| Alert | Threshold | Action |
|-------|-----------|--------|
| LLM API down | 5 consecutive failures | Page on-call, fallback model |
| Database connection pool exhausted | >90% utilized | Scale pool, investigate leaks |
| Message streaming latency p95 | >5s | Investigate LLM provider, MCP tools |
| MCP tool timeout rate | >10% | Disable tool, investigate |
| Rate limit overages | >50 in 1h | Notify user, suggest caching |

---

### 8.3 Deployment Strategy

**Phase 3 Deployment:**
1. **Environment:** Docker container on Heroku/Render (development)
2. **Database:** Neon PostgreSQL with PgBouncer
3. **CI/CD:** GitHub Actions → build → test → deploy
4. **Rollback:** Keep previous release for quick rollback

**Phase 4 Preparation:**
- Helm charts for Kubernetes (minikube locally)
- ConfigMaps for environment variables
- StatefulSets for persistent data (PostgreSQL)
- HPA (Horizontal Pod Autoscaler) for auto-scaling

---

## 9. Risk Analysis & Mitigation

| Risk | Blast Radius | Likelihood | Mitigation |
|------|--------------|-----------|-----------|
| **LLM API provider outage** | Chatbot unavailable, users can still browse ideas | Medium | Implement fallback provider (budget permitting) |
| **Database connection pool exhaustion** | Chat endpoint returns 500, cascades if retries are aggressive | Low | Connection pooling, max_overflow limit, monitoring |
| **Malicious prompt injection via MCP tools** | Attacker injects SQL/commands via tool results | Low | Sanitize tool outputs, use parameterized queries, least-privilege |
| **Uncontrolled token usage** | High LLM bills, rate limit triggers | Medium | Token budgets per user/session, rate limiting, cost dashboard |
| **Message streaming timeout** | User sees "Connection lost", incomplete response | Medium | Client-side retry, write-through to DB before streaming |
| **MCP tool dependency fails** | Chat becomes unavailable | Low | Graceful degradation: chat works without tools |

**Kill Switches:**
- Disable MCP tool invocations via environment flag
- Fallback to simple completion (no tools) if MCP unavailable
- Pause new chat sessions if database is under extreme load

---

## 10. Acceptance Criteria & Testing

### 10.1 Unit Tests

```python
# tests/unit/test_chat_service.py
@pytest.mark.asyncio
async def test_create_chat_session():
    """User can create a new chat session"""
    service = ChatService(db_session)
    session = await service.create_session(
        user_id="user_xyz",
        title="Test Session"
    )
    assert session.id is not None
    assert session.user_id == "user_xyz"

@pytest.mark.asyncio
async def test_stream_message_with_mcp_tools():
    """Streaming endpoint invokes MCP tools and includes results"""
    service = ChatService(db_session, mcp_service)
    events = []
    async for event in service.stream_message(
        session_id="sess_abc",
        messages=[{"role": "user", "content": "Search for AI news"}],
        use_mcp_tools=True
    ):
        events.append(event)

    # Verify tool_use events are included
    tool_events = [e for e in events if e["type"] == "tool_use.start"]
    assert len(tool_events) > 0
```

### 10.2 Integration Tests

```python
# tests/integration/test_chat_api.py
@pytest.mark.asyncio
async def test_post_messages_streaming_sse(client, auth_headers):
    """POST /api/v1/chat/messages returns SSE stream"""
    response = await client.post(
        "/api/v1/chat/messages",
        json={"session_id": "sess_abc", "messages": [...]},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "text/event-stream"

    # Parse SSE events
    events = [json.loads(line[5:]) for line in response.text.split("\n") if line.startswith("data:")]
    assert any(e["type"] == "message.finish" for e in events)
```

### 10.3 Load Testing

```bash
# tests/load_tests/k6_chat.js - Run with: k6 run k6_chat.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '1m', target: 20 },   // Hold
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

export default function () {
  let res = http.post(
    'http://localhost:8000/api/v1/chat/messages',
    {
      session_id: 'sess_test',
      messages: [{ role: 'user', content: 'test' }],
    },
    { headers: { Authorization: 'Bearer <token>' } }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'streaming starts quickly': (r) => r.timings.firstByte < 2000,
  });

  sleep(2);
}
```

---

## 11. Implementation Roadmap

### Phase 3.0 - MVP (Week 1-2)
- [ ] Database schema (ChatSession, ChatMessage)
- [ ] REST CRUD endpoints for sessions/messages
- [ ] SSE streaming endpoint for messages
- [ ] JWT authentication/authorization
- [ ] Basic LLM integration (Claude API)
- [ ] Unit and integration tests

### Phase 3.1 - MCP Integration (Week 3)
- [ ] MCP service abstraction layer
- [ ] Tool discovery and invocation endpoints
- [ ] MCP tool logging and association
- [ ] CreatorVault ideas integration (get/create/update/search)

### Phase 3.2 - Frontend Integration (Week 4)
- [ ] Adapt ChatKit UI for custom backend
- [ ] Session management UI
- [ ] Streaming display and error handling
- [ ] Chat history sidebar

### Phase 3.3 - Polish (Week 5+)
- [ ] Rate limiting and cost tracking
- [ ] Message encryption at rest (optional)
- [ ] Performance tuning and load testing
- [ ] Documentation and runbooks

---

## 12. Frontend Adaptation: ChatKit UI Configuration

### 12.1 ChatKit → Custom Backend Mapping

**Current ChatKit (OpenAI):**
```javascript
// Uses OpenAI ChatKit server
const chatkit = new ChatKit({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  model: 'gpt-4',
});
```

**Adapted for CreatorVault:**
```javascript
// backend/src/schemas/chatkit_adapter.py
class ChatKitAdapterSchema(BaseModel):
    """Maps custom backend messages to ChatKit protocol"""
    thread_id: str  # → session_id
    message_id: str
    role: Literal["user", "assistant"]
    content: str
    tools: list[dict] = []  # MCP tools rendered as ChatKit tools

    def to_chatkit_format(self) -> dict:
        """Convert to ChatKit protocol"""
        return {
            "event": "thread.message.item.created",
            "data": {
                "id": self.message_id,
                "role": self.role,
                "content": self.content,
                "content_type": "output_text",
            }
        }
```

### 12.2 Frontend Configuration

```typescript
// frontend/src/config/chatbot.ts
export const chatbotConfig = {
  apiBase: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  endpoints: {
    sessions: '/api/v1/chat/sessions',
    messages: '/api/v1/chat/messages',  // SSE streaming
    mcp_tools: '/api/v1/mcp/tools',
  },
  streaming: {
    type: 'sse',
    timeout: 30000,
  },
  auth: {
    // Uses existing Better Auth tokens
    tokenHeader: 'Authorization',
    tokenPrefix: 'Bearer',
  },
};
```

---

## 13. Success Metrics (Phase 3 Completion)

- [ ] All acceptance criteria passing
- [ ] Unit test coverage >80%
- [ ] SSE streaming latency <200ms/token
- [ ] Chat history queries <100ms
- [ ] MCP tool invocations complete <5s
- [ ] No data loss across 100 chat sessions
- [ ] Error handling covers all edge cases
- [ ] OpenAPI docs auto-generated and accurate
- [ ] Kubernetes-ready (docker-compose, helm charts Phase 3.5)

---

## 14. References & Documentation

### API Documentation
- **OpenAPI Schema:** Auto-generated at `/api/v1/docs` (Swagger UI)
- **Postman Collection:** `docs/postman/CreatorVault-Phase3-Chatbot.json`

### External Resources
- [ChatKit Advanced Samples (OpenAI)](https://github.com/openai/openai-chatkit-advanced-samples)
- [FastAPI Streaming Responses](https://fastapi.tiangolo.com/advanced/custom-response/#using-streamingresponse)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [MCP Specification](https://modelcontextprotocol.io/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Better Auth JWT Guide](https://better-auth.com/docs/auth)

### Related ADRs
- *[To be created after approval of this architecture]*
  - ADR-003: Why SSE for streaming in Phase 3
  - ADR-004: Why MCP for CreatorVault ideas integration
  - ADR-005: LLM provider abstraction pattern

---

## Appendix A: Entity-Relationship Diagram

```
┌─────────────────────┐
│   ChatSession       │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ title               │
│ description         │
│ created_at          │
│ updated_at          │
│ archived_at         │
│ metadata (JSON)     │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌──────────────────────────┐
│    ChatMessage           │
├──────────────────────────┤
│ id (PK)                  │
│ session_id (FK)          │
│ user_id (FK)             │
│ role (user/assistant)    │
│ content                  │
│ token_count              │
│ model                    │
│ created_at               │
│ metadata (JSON)          │
└──────────┬───────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────────┐
│   MCPToolInvocation         │
├─────────────────────────────┤
│ id (PK)                     │
│ message_id (FK)             │
│ tool_name                   │
│ input_params (JSON)         │
│ output_result (JSON)        │
│ execution_time_ms           │
│ status (pending/success)    │
└─────────────────────────────┘
```

---

**Document Status:** Draft (Awaiting ADR Creation & Team Approval)
**Last Reviewed:** 2026-01-11
**Next Review:** After Phase 3.0 completion
