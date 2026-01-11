# OpenAI Agents Python - API Reference

Official API reference documentation fetched from OpenAI.

**Source:** https://openai.github.io/openai-agents-python

**Library ID:** /websites/openai_github_io_openai-agents-python

**Last Updated:** 2026-01-11

---

## Agent Configuration

### Agent Class

```python
from agents import Agent

agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    tools=[...],
    mcp_servers=[...],
    handoffs=[...],
    input_guardrails=[...],
    output_guardrails=[...],
    model="gpt-4o",
    model_settings=ModelSettings(...),
    output_type=None,
    reset_tool_choice=True,
    tool_use_behavior="auto",
)
```

### Agent Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `str` | Required. The agent's name. |
| `instructions` | `str` | System prompt instructions for the agent. |
| `tools` | `list[Tool]` | Tools the agent can use. |
| `mcp_servers` | `list[MCPServer]` | MCP servers providing tools. |
| `handoffs` | `list[Handoff]` | Sub-agents for delegation. |
| `input_guardrails` | `list[InputGuardrail]` | Filters applied before execution. |
| `output_guardrails` | `list[OutputGuardrail]` | Filters applied after execution. |
| `model` | `str` | Model name to use. |
| `model_settings` | `ModelSettings` | Model-specific settings. |
| `output_type` | `Type` | Expected output type. |
| `reset_tool_choice` | `bool` | Reset tool choice after use (default: True). |
| `tool_use_behavior` | `str | ToolUseBehavior` | How tools are used. |

---

## Tool Definitions

### Tool

```python
from agents import Tool

tool = Tool(
    name="my_tool",
    description="Tool description",
    params_json_schema={
        "type": "object",
        "properties": {
            "param": {"type": "string"}
        },
        "required": ["param"]
    },
    fn=my_function,
    needs_approval=False,
)
```

### HostedMCPTool

```python
from agents import HostedMCPTool

mcp_tool = HostedMCPTool(
    tool_config={
        "type": "mcp",
        "server_label": "label",
        "server_url": "https://example.com/mcp",
        "require_approval": "never" | "always" | {...},
    },
    on_approval_request=None,  # Optional callback
)
```

**Properties:**
- `tool_config`: MCP configuration with server URL and settings.
- `on_approval_request`: Optional callback function for approval handling.

---

## MCP Servers

### MCPServerStdio

```python
from agents import MCPServerStdio

mcp_server = MCPServerStdio(
    command="python",
    args=["-m", "my_mcp_server"],
    env={"MY_VAR": "value"},
)

# Lifecycle management
await mcp_server.connect()
# Use server
await mcp_server.cleanup()
```

**Important:** You must manage the lifecycle of MCP servers:
1. Call `connect()` before use
2. Call `cleanup()` when done

---

## RunConfig

```python
from agents import RunConfig

config = RunConfig(
    model="gpt-4o",
    model_provider=MultiProvider(),
    model_settings=ModelSettings(...),
    handoff_input_filter=None,
    nest_handoff_history=True,
    handoff_history_mapper=None,
    input_guardrails=[...],
    output_guardrails=[...],
    tracing_disabled=False,
    trace_include_sensitive_data=False,
    workflow_name="Agent workflow",
    trace_id=None,
    group_id=None,
    trace_metadata=None,
    session_input_callback=None,
    call_model_input_filter=None,
)
```

### RunConfig Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | `str \| Model \| None` | Model to use (overrides agent model). |
| `model_provider` | `ModelProvider` | Provider for resolving model names. |
| `model_settings` | `ModelSettings \| None` | Global model settings. |
| `handoff_input_filter` | `HandoffInputFilter \| None` | Filter for handoff inputs. |
| `nest_handoff_history` | `bool` | Wrap history before handoff (default: True). |
| `handoff_history_mapper` | `HandoffHistoryMapper \| None` | Map history for next agent. |
| `input_guardrails` | `list[InputGuardrail]` | Input guardrails. |
| `output_guardrails` | `list[OutputGuardrail]` | Output guardrails. |
| `tracing_disabled` | `bool` | Disable trace generation. |
| `trace_include_sensitive_data` | `bool` | Include sensitive data in traces. |
| `workflow_name` | `str` | Trace workflow name. |
| `trace_id` | `str \| None` | Custom trace ID. |
| `group_id` | `str \| None` | Group ID for related traces. |
| `trace_metadata` | `dict[str, Any]` | Additional trace metadata. |
| `session_input_callback` | `SessionInputCallback \| None` | Handle session history. |
| `call_model_input_filter` | `CallModelInputFilter \| None` | Edit model input before call. |

---

## Guardrails

### InputGuardrail

```python
from agents import InputGuardrail

input_guardrail = InputGuardrail(
    name="content_filter",
    instructions="Filter harmful content.",
)
```

### OutputGuardrail

```python
from agents import OutputGuardrail

output_guardrail = OutputGuardrail(
    name="politeness_check",
    instructions="Ensure polite response.",
)
```

---

## Handoffs

### Handoff

```python
from agents import Handoff

handoff = Handoff(
    agent=target_agent,
    description="Handoff for specific tasks.",
    input_filter=None,
)
```

### Handoff Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `agent` | `Agent` | Target agent. |
| `description` | `str` | When to use this handoff. |
| `input_filter` | `HandoffInputFilter \| None` | Filter for handoff input. |

---

## Runner

```python
from agents import Runner

# Basic run
result = await Runner.run(agent, "Hello!")

# With config
result = await Runner.run(agent, "Hello!", config=config)

# With context
context = RunContext(session=result.to_input())
result = await Runner.run(agent, "Follow up", context=context)
```

### RunResult Properties

| Property | Type | Description |
|----------|------|-------------|
| `final_output` | `str` | The final output text. |
| `raw_responses` | `list` | Raw LLM responses. |
| `interruptions` | `list \| None` | Tool approval interruptions. |
| `state` | `RunState` | Current run state (for approval loops). |
| `to_input()` | `method` | Convert to session input. |

---

## ModelSettings

```python
from agents import ModelSettings

settings = ModelSettings(
    temperature=0.7,
    max_tokens=1000,
    top_p=0.9,
    frequency_penalty=0.0,
    presence_penalty=0.0,
)
```

### ModelSettings Parameters

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `temperature` | `float` | 0.0 - 2.0 | Sampling randomness. |
| `max_tokens` | `int` | 1 - ∞ | Maximum response tokens. |
| `top_p` | `float` | 0.0 - 1.0 | Nucleus sampling. |
| `frequency_penalty` | `float` | -2.0 - 2.0 | Frequency penalty. |
| `presence_penalty` | `float` | -2.0 - 2.0 | Presence penalty. |

---

## Session Management

### RunContext

```python
from agents import RunContext

context = RunContext(
    context_value={"user_id": "123"},
    session=result.to_input(),
)
```

### Session Input Callback

```python
from agents import SessionInputCallback

def session_callback(history: list, new_input: str) -> list:
    # Custom session handling
    return history + [new_input]

config = RunConfig(
    session_input_callback=session_callback,
)
```

---

## Tracing

### Enable Tracing

```python
config = RunConfig(
    tracing_disabled=False,
    trace_include_sensitive_data=True,
    workflow_name="My Workflow",
    trace_id="custom-uuid",
    group_id="session-123",
    trace_metadata={"user_id": "user1"},
)
```

---

## Realtime Agent

### RealtimeRunConfig

```python
from agents.realtime import RealtimeRunConfig

config = RealtimeRunConfig(
    model_settings=RealtimeSessionModelSettings(...),
    output_guardrails=[...],
    guardrails_settings=RealtimeGuardrailsSettings(...),
    tracing_disabled=False,
    async_tool_calls=True,
)
```

---

## Installation

```bash
pip install openai-agents
# or with uv
uv pip install openai-agents
```

### Dependencies

- Python 3.8+
- OpenAI API key
- Optional: `python-dotenv` for environment variables

---

## External Links

- **Main Documentation:** https://openai.github.io/openai-agents-python
- **MCP Guide:** https://openai.github.io/openai-agents-python/mcp
- **API Reference:** https://openai.github.io/openai-agents-python/ref
- **GitHub Repository:** https://github.com/openai/openai-agents-python
