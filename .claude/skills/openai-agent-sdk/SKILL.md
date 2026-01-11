---
name: openai-agent-sdk
description: Scaffold OpenAI Agent SDK Python applications with MCP tools, custom models (Gemini, Claude, etc.), handoffs, guardrails, sessions, and tool approvals. Use for building Python agents, configuring MCP servers, implementing multi-agent workflows, integrating external LLM providers.
version: 1.0.0
allowed-tools: Bash, Read, Write, Edit, WebFetch, mcp__context7__query-docs, mcp__context7__resolve-library-id
author: Claude Code
tags: [openai, agents, mcp, python, llm, gemini, claude]
---

# OpenAI Agent SDK (Python)

## Overview

The OpenAI Agents SDK (Python) enables building agentic AI applications with lightweight primitives: Agents, Handoffs, Guardrails, Sessions, and Tracing. Supports MCP (Model Context Protocol) integration for external tools and custom model providers for Gemini, Claude, Anthropic, and other LLMs.

**See:** `references/official-docs/` for complete API documentation

## When to Use

**Activate when:**
- "create OpenAI agent", "scaffold agent SDK", "build Python AI agent"
- "MCP tool configuration", "MCP server setup"
- "agent with tools", "multi-agent workflow"
- "tool approval", "human-in-the-loop agents"
- "agent sessions", "handoffs", "guardrails"
- "custom model provider", "Gemini integration", "Claude integration"

## Prerequisites

**Required:**
- Python 3.8+
- `openai-agents` package

**Optional:**
- OpenAI API key (for OpenAI models)
- MCP servers for external tools
- Docker (for MCP stdio servers)
- External LLM SDKs (google-generativeai, anthropic, etc.)

## Instructions

### Phase 1: Setup & Installation

```bash
pip install openai-agents
# or with uv
uv pip install openai-agents
```

**Validation:**
```bash
python -c "from agents import Agent; print('OK')"
```

**See:** `references/examples.md#setup-complete`

### Phase 2: Create Basic Agent

```python
from agents import Agent, Runner

agent = Agent(name="Assistant", instructions="You are helpful.")
result = await Runner.run(agent, "Hello!")
print(result.final_output)
```

**See:** `references/examples.md#basic-agent-complete`

### Phase 3: Configure MCP Tools

**Hosted MCP Tool:**
```python
from agents import HostedMCPTool

agent = Agent(
  name="Assistant",
  tools=[
    HostedMCPTool(
      tool_config={
        "type": "mcp",
        "server_label": "gitmcp",
        "server_url": "https://gitmcp.io/openai/codex",
        "require_approval": "never",
      }
    )
  ],
)
```

**Local MCP Server (stdio):**
```python
from agents import MCPServerStdio

mcp_server = MCPServerStdio(
  command="python",
  args=["-m", "my_mcp_server"],
)

await mcp_server.connect()
agent = Agent(name="Assistant", mcp_servers=[mcp_server])
# Use agent
await mcp_server.cleanup()  # Always cleanup
```

**See:** `references/examples.md#mcp-tools-complete`

### Phase 4: Custom Tool with Approval

```python
from agents import Agent, Tool, Runner

async def my_tool(x: str) -> str:
  return f"Processed: {x}"

agent = Agent(
  name="Assistant",
  tools=[
    Tool(
      name="my_tool",
      description="Process",
      params_json_schema={
        "type": "object",
        "properties": {"x": {"type": "string"}},
        "required": ["x"]
      },
      fn=my_tool,
      needs_approval=True,
    )
  ],
)

result = await Runner.run(agent, "Use my_tool")
# Handle approvals via result.interruptions
```

**See:** `references/examples.md#approval-tools-complete`

### Phase 5: Multi-Agent with Handoffs

```python
from agents import Agent, Handoff

agent1 = Agent(name="Agent1", instructions="You are agent 1")
agent2 = Agent(name="Agent2", instructions="You are agent 2")

agent1.handoffs = [Handoff(agent=agent2)]
```

**See:** `references/examples.md#handoffs-complete`

### Phase 6: Guardrails

```python
from agents import InputGuardrail, OutputGuardrail

input_guardrail = InputGuardrail(
  name="check_input",
  instructions="Reject harmful content",
)

output_guardrail = OutputGuardrail(
  name="check_output",
  instructions="Ensure polite response",
)

agent = Agent(
  name="Assistant",
  input_guardrails=[input_guardrail],
  output_guardrails=[output_guardrail],
)
```

**See:** `references/examples.md#guardrails-complete`

### Phase 7: Sessions & State

```python
from agents import Agent, Runner, RunContext

context = RunContext(
  context_value={"user_id": "123"},
  session=...,  # from previous run
)

result = await Runner.run(agent, input, context=context)
```

**See:** `references/examples.md#sessions-complete`

### Phase 8: Custom Model Providers

#### Method 1: OpenAI-Compatible APIs (Using AsyncOpenAI Client)

**Global Default Client (Recommended for OpenAI-compatible APIs):**
```python
from openai import AsyncOpenAI
from agents import set_default_openai_client, Agent, Runner

# Configure custom client for any OpenAI-compatible API
custom_client = AsyncOpenAI(
    base_url="https://custom.endpoint/v1",
    api_key="your-api-key",
    timeout=60.0,
    max_retries=3,
)

# Set as default globally
set_default_openai_client(custom_client, use_for_tracing=True)

# Now all agents use this client by default
agent = Agent(name="Assistant", instructions="You are helpful.")
result = await Runner.run(agent, input, model="custom-model-name")
```

**Per-Agent Custom Client:**
```python
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel

# Create custom client for specific API
client = AsyncOpenAI(
    base_url="https://api.anthropic.com/v1",
    api_key="your-key",
)

# Use with specific model class
agent = Agent(
    name="Assistant",
    instructions="You are helpful.",
    model=OpenAIChatCompletionsModel(
        model="claude-3-5-sonnet-20241022",
        openai_client=client,
    ),
)

result = await Runner.run(agent, input)
```

**Mixed Provider Setup (Different clients per agent):**
```python
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel

# Agent 1: Using OpenAI
openai_client = AsyncOpenAI(api_key="sk-openai-key")
agent1 = Agent(
    name="OpenAI Agent",
    model=OpenAIChatCompletionsModel(
        model="gpt-4o",
        openai_client=openai_client,
    ),
)

# Agent 2: Using Ollama (local)
ollama_client = AsyncOpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)
agent2 = Agent(
    name="Ollama Agent",
    model=OpenAIChatCompletionsModel(
        model="llama3.2",
        openai_client=ollama_client,
    ),
)

# Agent 3: Using vLLM or other compatible API
vllm_client = AsyncOpenAI(
    base_url="https://your-vllm-instance.com/v1",
    api_key="your-key",
)
agent3 = Agent(
    name="vLLM Agent",
    model=OpenAIChatCompletionsModel(
        model="custom-model",
        openai_client=vllm_client,
    ),
)
```

#### Method 2: Custom ModelProvider Class

**Gemini Integration:**
```python
from agents import ModelProvider, Model, RunConfig
import google.generativeai as genai

class GeminiModel(Model):
  def __init__(self, name: str, api_key: str):
    self.name = name
    genai.configure(api_key=api_key)
    self.model = genai.GenerativeModel(name)

  async def generate(self, messages: list, **kwargs) -> str:
    prompt = self._convert_messages(messages)
    response = self.model.generate_content(prompt)
    return response.text

  def _convert_messages(self, messages: list) -> str:
    # Convert agent messages to Gemini format
    return "\n".join([m.content for m in messages])

class GeminiProvider(ModelProvider):
  def __init__(self, api_key: str):
    self.api_key = api_key

  def get_model(self, name: str) -> Model:
    return GeminiModel(name, self.api_key)

# Use Gemini model
config = RunConfig(
  model_provider=GeminiProvider(api_key="your-gemini-key"),
  model="gemini-1.5-pro",
)
result = await Runner.run(agent, input, config=config)
```

**Claude/Anthropic Integration:**
```python
from agents import ModelProvider, Model
import anthropic

class ClaudeModel(Model):
  def __init__(self, name: str, api_key: str):
    self.name = name
    self.client = anthropic.Anthropic(api_key=api_key)

  async def generate(self, messages: list, **kwargs) -> str:
    response = self.client.messages.create(
      model=self.name,
      messages=self._convert_messages(messages),
      **kwargs
    )
    return response.content[0].text

  def _convert_messages(self, messages: list) -> list:
    # Convert agent messages to Claude format
    return [{"role": m.role, "content": m.content} for m in messages]

class ClaudeProvider(ModelProvider):
  def __init__(self, api_key: str):
    self.api_key = api_key

  def get_model(self, name: str) -> Model:
    return ClaudeModel(name, self.api_key)

# Use Claude model
config = RunConfig(
  model_provider=ClaudeProvider(api_key="your-claude-key"),
  model="claude-3-5-sonnet-20241022",
)
```

**Generic HTTP Provider (Any OpenAI-compatible API):**
```python
import httpx
from agents import ModelProvider, Model

class OpenAICompatibleModel(Model):
  def __init__(self, name: str, base_url: str, api_key: str):
    self.name = name
    self.base_url = base_url
    self.api_key = api_key

  async def generate(self, messages: list, **kwargs) -> str:
    async with httpx.AsyncClient() as client:
      response = await client.post(
        f"{self.base_url}/chat/completions",
        headers={
          "Authorization": f"Bearer {self.api_key}",
          "Content-Type": "application/json",
        },
        json={
          "model": self.name,
          "messages": [{"role": m.role, "content": m.content} for m in messages],
          **kwargs
        }
      )
      return response.json()["choices"][0]["message"]["content"]

class GenericProvider(ModelProvider):
  def __init__(self, base_url: str, api_key: str):
    self.base_url = base_url
    self.api_key = api_key

  def get_model(self, name: str) -> Model:
    return OpenAICompatibleModel(name, self.base_url, self.api_key)

# Use with any compatible API (Ollama, vLLM, etc.)
config = RunConfig(
  model_provider=GenericProvider(
    base_url="http://localhost:11434/v1",  # Ollama
    api_key="dummy"
  ),
  model="llama3.2",
)
```

**See:** `references/examples.md#custom-model-provider`

## Common Patterns

### Pattern 1: Tool Approval Flow
```python
while result.interruptions:
  for item in result.interruptions:
    if should_approve(item):
      result.state.approve(item)
    else:
      result.state.reject(item)
  result = await Runner.run(agent, result.state)
```

**See:** `references/examples.md#approval-flow-complete`

### Pattern 2: Multi-Provider Setup
```python
from agents import MultiProvider

# Use OpenAI for default, Gemini for specific models
provider = MultiProvider(
  providers={
    "gpt-*": OpenAIProvider(api_key="openai-key"),
    "gemini-*": GeminiProvider(api_key="gemini-key"),
    "claude-*": ClaudeProvider(api_key="claude-key"),
  }
)

config = RunConfig(model_provider=provider, model="gpt-4o")
```

**See:** `references/quick-reference.md#custom-provider`

### Pattern 3: Tracing & Debugging
```python
config = RunConfig(
  tracing_disabled=False,
  trace_include_sensitive_data=True,
  workflow_name="My Workflow",
  trace_id="custom-id",
  group_id="session-123",
)

result = await Runner.run(agent, input, config=config)
```

**See:** `references/quick-reference.md#tracing`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Package not installed | Run `pip install openai-agents` |
| `API key missing` | `OPENAI_API_KEY` not set | Set environment variable |
| `Tool not found` | MCP server disconnected | Check `server.connect()` and lifecycle |
| `Approval required` | Tool needs approval | Handle `result.interruptions` |
| `Handoff failed` | Target agent not found | Verify agent name/handoff config |
| `Model not found` | Invalid model name | Check provider supports the model |
| `Provider error` | External API failed | Check API key and connectivity |

**See:** `references/troubleshooting.md` for detailed solutions

## RunConfig Options

```python
from agents import RunConfig

config = RunConfig(
  model="gpt-4o",
  model_provider=MultiProvider(),
  model_settings=ModelSettings(...),
  tracing_disabled=False,
  input_guardrails=[...],
  output_guardrails=[...],
)
```

**Key parameters:**
- `model`: Override agent model (gpt-4o, gemini-1.5-pro, claude-3-5-sonnet, etc.)
- `model_provider`: Custom model provider (OpenAI default, or custom)
- `tracing_disabled`: Disable trace generation
- `input_guardrails`/`output_guardrails`: Global guardrails

**See:** `references/quick-reference.md#runconfig`

## Common External Model Names

**OpenAI:** `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

**Gemini:** `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-1.0-pro`

**Anthropic/Claude:** `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`

**Ollama (local):** `llama3.2`, `mistral`, `codellama`

**vLLM/OpenAI-compatible:** Any model name supported by server

## References

**Local Documentation:**
- Complete examples: `references/examples.md`
- Code snippets: `references/quick-reference.md`
- Troubleshooting: `references/troubleshooting.md`
- Official docs: `references/official-docs/`

**External:**
- OpenAI Agents Python: https://openai.github.io/openai-agents-python
- MCP Guide: https://openai.github.io/openai-agents-python/mcp
- Gemini API: https://ai.google.dev
- Anthropic API: https://docs.anthropic.com
- Ollama: https://ollama.com

**Use Context7 MCP:** `/fetching-library-docs` for latest docs
