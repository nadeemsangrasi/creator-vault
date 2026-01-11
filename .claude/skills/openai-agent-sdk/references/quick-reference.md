# OpenAI Agent SDK - Quick Reference

Code snippets for common patterns in OpenAI Agent SDK.

---

## Agent Creation

### Python
```python
from agents import Agent

agent = Agent(
    name="Assistant",
    instructions="You are helpful.",
    tools=[...],
    handoffs=[...],
    input_guardrails=[...],
    output_guardrails=[...],
)
```

### TypeScript
```typescript
import { Agent } from '@openai/agents';

const agent = new Agent({
  name: 'Assistant',
  instructions: 'You are helpful.',
  tools: [...],
  handoffs: [...],
  inputGuardrails: [...],
  outputGuardrails: [...],
});
```

---

## Running Agents

### Python
```python
from agents import Runner, RunConfig, RunContext

# Basic run
result = await Runner.run(agent, "Hello")
print(result.final_output)

# With config
config = RunConfig(model="gpt-4o")
result = await Runner.run(agent, "Hello", config=config)

# With session/context
context = RunContext(session=result.to_input())
result = await Runner.run(agent, "Follow up", context=context)
```

### TypeScript
```typescript
import { run, RunContext } from '@openai/agents';

// Basic run
const result = await run(agent, 'Hello');
console.log(result.finalOutput);

// With config
const config = { model: 'gpt-4o' };
const result = await run(agent, 'Hello', config);

// With session/context
const context = new RunContext({ session: result.toInput() });
const result = await run(agent, 'Follow up', context);
```

---

## Custom Tools

### Python
```python
from agents import Tool

def my_function(param: str) -> str:
    return f"Result: {param}"

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

### TypeScript
```typescript
import { tool } from '@openai/agents';
import { z } from 'zod';

const myTool = tool({
  name: 'my_tool',
  description: 'Tool description',
  parameters: z.object({
    param: z.string(),
  }),
  execute: async ({ param }) => `Result: ${param}`,
  needsApproval: false,
});
```

---

## MCP Tools

### Python: Hosted MCP
```python
from agents import HostedMCPTool

mcp_tool = HostedMCPTool(
    tool_config={
        "type": "mcp",
        "server_label": "label",
        "server_url": "https://example.com/mcp",
        "require_approval": "never",  # or "always"
    }
)
```

### Python: Local MCP (stdio)
```python
from agents import MCPServerStdio

mcp_server = MCPServerStdio(
    command="python",
    args=["-m", "my_mcp_server"],
)
await mcp_server.connect()

agent = Agent(
    name="Assistant",
    mcp_servers=[mcp_server],
)

# Cleanup when done
await mcp_server.cleanup()
```

### TypeScript: Hosted MCP
```typescript
import { hostedMcpTool } from '@openai/agents';

const mcpTool = hostedMcpTool({
  serverLabel: 'label',
  serverUrl: 'https://example.com/mcp',
  requireApproval: 'never', // or 'always'
});
```

---

## Handoffs

### Python
```python
from agents import Handoff

agent_a = Agent(name="A", instructions="...")
agent_b = Agent(name="B", instructions="...")

agent_a.handoffs = [
    Handoff(agent=agent_b, description="For B's tasks"),
]
```

### TypeScript
```typescript
const agentA = new Agent({
  name: 'A',
  instructions: '...',
  handoffs: [
    { agent: agentB, description: "For B's tasks" },
  ],
});
```

---

## Guardrails

### Python
```python
from agents import InputGuardrail, OutputGuardrail

input_guard = InputGuardrail(
    name="check_input",
    instructions="Filter harmful content.",
)

output_guard = OutputGuardrail(
    name="check_output",
    instructions="Ensure polite response.",
)

agent = Agent(
    name="Assistant",
    input_guardrails=[input_guard],
    output_guardrails=[output_guard],
)
```

### TypeScript
```typescript
import { inputGuardrail, outputGuardrail } from '@openai/agents';

const inputGuard = inputGuardrail({
  name: 'check_input',
  instructions: 'Filter harmful content.',
});

const outputGuard = outputGuardrail({
  name: 'check_output',
  instructions: 'Ensure polite response.',
});

const agent = new Agent({
  name: 'Assistant',
  inputGuardrails: [inputGuard],
  outputGuardrails: [outputGuard],
});
```

---

## RunConfig

### Python
```python
from agents import RunConfig, ModelSettings

config = RunConfig(
    model="gpt-4o",
    model_provider=CustomProvider(),  # optional
    model_settings=ModelSettings(
        temperature=0.7,
        max_tokens=1000,
    ),
    tracing_disabled=False,
    trace_include_sensitive_data=True,
    workflow_name="My Workflow",
    input_guardrails=[...],
    output_guardrails=[...],
)
```

### TypeScript
```typescript
const config = {
  model: 'gpt-4o',
  modelProvider: customProvider,
  tracingDisabled: false,
  traceIncludeSensitiveData: true,
  workflowName: 'My Workflow',
  inputGuardrails: [...],
  outputGuardrails: [...],
};
```

---

## Custom Provider

### Python
```python
from agents import ModelProvider, Model

class CustomProvider(ModelProvider):
    def get_model(self, name: str) -> Model:
        return CustomModel(name)

config = RunConfig(model_provider=CustomProvider())
```

### TypeScript
```typescript
class CustomProvider implements ModelProvider {
  getModel(name: string) {
    return new CustomModel(name);
  }
}

const config = { modelProvider: new CustomProvider() };
```

---

## Tracing

### Python
```python
config = RunConfig(
    tracing_disabled=False,
    trace_include_sensitive_data=True,
    workflow_name="Customer Support",
    trace_id="custom-uuid",
    group_id="session-123",
    trace_metadata={"user_id": "user1"},
)
```

### TypeScript
```typescript
const config = {
  tracingDisabled: false,
  traceIncludeSensitiveData: true,
  workflowName: 'Customer Support',
  traceId: 'custom-uuid',
  groupId: 'session-123',
  traceMetadata: { userId: 'user1' },
};
```

---

## Approval Handling

### Python
```python
while result.interruptions:
    for item in result.interruptions:
        if should_approve(item):
            result.state.approve(item)
        else:
            result.state.reject(item)
    result = await Runner.run(agent, result.state)
```

### TypeScript
```typescript
while (result.interruptions && result.interruptions.length) {
  for (const item of result.interruptions) {
    if (shouldApprove(item)) {
      result.state.approve(item);
    } else {
      result.state.reject(item);
    }
  }
  result = await run(agent, result.state);
}
```

---

## Sessions

### Python
```python
# Get session from result
session = result.to_input()

# Use in next run
context = RunContext(session=session)
result = await Runner.run(agent, "Follow up", context=context)
```

### TypeScript
```typescript
// Get session from result
const session = result.toInput();

// Use in next run
const context = new RunContext({ session });
const result = await run(agent, 'Follow up', context);
```

---

## Model Settings

### Python
```python
from agents import ModelSettings

settings = ModelSettings(
    temperature=0.7,
    max_tokens=1000,
    top_p=0.9,
    frequency_penalty=0.0,
    presence_penalty=0.0,
)

agent = Agent(
    name="Assistant",
    model_settings=settings,
)
```

### TypeScript
```typescript
const modelSettings = {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};

const agent = new Agent({
  name: 'Assistant',
  modelSettings,
});
```

---

## Common Model Names

```
gpt-4o           # GPT-4 Omni (recommended)
gpt-4o-mini      # Smaller, faster
gpt-4-turbo      # GPT-4 Turbo
gpt-4            # GPT-4
gpt-3.5-turbo    # GPT-3.5 Turbo
gpt-realtime     # Realtime API
```

---

## Environment Variables

```bash
# OpenAI API key
OPENAI_API_KEY=sk-...

# Optional: Custom base URL
OPENAI_BASE_URL=https://api.custom.com

# Optional: Project ID
OPENAI_PROJECT_ID=proj-...
```

---

## Import Summary

### Python
```python
from agents import (
    Agent,
    Runner,
    RunContext,
    RunConfig,
    ModelSettings,
    ModelProvider,
    Tool,
    Handoff,
    InputGuardrail,
    OutputGuardrail,
    HostedMCPTool,
    MCPServerStdio,
)
```

### TypeScript
```typescript
import {
  Agent,
  run,
  RunContext,
  RunConfig,
  ModelProvider,
  tool,
  inputGuardrail,
  outputGuardrail,
  hostedMcpTool,
  RunToolApprovalItem,
} from '@openai/agents';
import { z } from 'zod';
```

---

## See Also

- Complete examples: `references/examples.md`
- Troubleshooting: `references/troubleshooting.md`
- Official docs: `references/official-docs/`
