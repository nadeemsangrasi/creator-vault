# OpenAI Agent SDK - Troubleshooting

Common errors, their causes, and solutions.

---

## Installation Issues

### Error: `Module not found: No module named 'agents'`

**Cause:** Package not installed or Python environment mismatch.

**Solutions:**

1. Install the package:
```bash
pip install openai-agents
# or
uv pip install openai-agents
```

2. Check Python environment:
```bash
python --version
which python
```

3. Verify installation:
```bash
python -c "from agents import Agent; print('OK')"
```

**See:** `references/examples.md#setup-complete`

---

### Error: `Cannot find module '@openai/agents'`

**Cause:** TypeScript/JavaScript package not installed.

**Solutions:**

1. Install dependencies:
```bash
npm install @openai/agents
```

2. Check `package.json`:
```json
{
  "dependencies": {
    "@openai/agents": "^0.2.0"
  }
}
```

3. Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Authentication Issues

### Error: `401 Unauthorized` or `OPENAI_API_KEY not found`

**Cause:** Missing or invalid API key.

**Solutions:**

1. Set environment variable:
```bash
export OPENAI_API_KEY=sk-your-key-here

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-key-here"

# Windows CMD
set OPENAI_API_KEY=sk-your-key-here
```

2. Use `.env` file:
```bash
# .env
OPENAI_API_KEY=sk-your-key-here
```

3. Load in Python:
```python
from dotenv import load_dotenv
load_dotenv()
```

4. Load in TypeScript:
```typescript
import dotenv from 'dotenv';
dotenv.config();
```

---

### Error: `Insufficient quota` or `429 Too Many Requests`

**Cause:** API rate limit or no credits.

**Solutions:**

1. Check OpenAI billing: https://platform.openai.com/settings/billing

2. Implement rate limiting:
```python
import asyncio
from agents import Runner, RunConfig

# Set lower request rate
config = RunConfig(
    model_settings=ModelSettings(
        max_tokens=500,  # Reduce token usage
    )
)
```

3. Use cheaper model:
```python
config = RunConfig(model="gpt-4o-mini")
```

---

## MCP Tool Issues

### Error: `MCP server disconnected` or `Connection refused`

**Cause:** MCP server not running or connection failed.

**Solutions:**

1. For hosted MCP servers, verify URL:
```python
HostedMCPTool(
    tool_config={
        "server_url": "https://valid-url.com/mcp",  # Must be accessible
    }
)
```

2. For local stdio servers, check command:
```python
mcp_server = MCPServerStdio(
    command="python",  # Must be valid command
    args=["-m", "my_mcp_server"],  # Module must exist
)
```

3. Add lifecycle management:
```python
try:
    await mcp_server.connect()
    # Use server
    result = await Runner.run(agent, input)
finally:
    await mcp_server.cleanup()
```

4. Debug stdio servers:
```python
mcp_server = MCPServerStdio(
    command="python",
    args=["-m", "my_mcp_server"],
    env={"DEBUG": "1"},  # Add debug env var
)
```

**See:** `references/examples.md#mcp-tools-complete`

---

### Error: `Tool not found: <tool_name>`

**Cause:** Tool not properly registered or MCP server not connected.

**Solutions:**

1. Verify tool registration:
```python
agent = Agent(
    name="Assistant",
    tools=[my_tool],  # Must include tool here
)
```

2. For MCP tools, ensure server is connected:
```python
await mcp_server.connect()
# Now tools are available
```

3. Check tool name spelling matches exactly.

---

## Tool Approval Issues

### Error: `Approval required but not handled`

**Cause:** Tool with `needs_approval=True` triggered, but no approval handler.

**Solutions:**

1. Handle approvals in Python:
```python
while result.interruptions:
    for item in result.interruptions:
        result.state.approve(item)  # or result.state.reject(item)
    result = await Runner.run(agent, result.state)
```

2. Handle approvals in TypeScript:
```typescript
while (result.interruptions?.length) {
  for (const item of result.interruptions) {
    result.state.approve(item);  // or .reject()
  }
  result = await run(agent, result.state);
}
```

3. Disable approval for non-sensitive tools:
```python
Tool(..., needs_approval=False)
```

**See:** `references/examples.md#approval-flow-complete`

---

## Handoff Issues

### Error: `Handoff target not found` or `Unknown agent: <name>`

**Cause:** Referencing an agent that doesn't exist or isn't in scope.

**Solutions:**

1. Create target agent first:
```python
target_agent = Agent(name="Target", instructions="...")

source_agent = Agent(
    name="Source",
    handoffs=[Handoff(agent=target_agent)],
)
```

2. Use proper agent references:
```python
# Correct - pass actual agent object
handoffs=[Handoff(agent=other_agent)]

# Incorrect - string name only works in some contexts
handoffs=[Handoff(agent="other_agent")]  # May fail
```

3. Debug handoff flow:
```python
# Add logging
agent = Agent(
    name="Debug Agent",
    instructions=f"Your handoffs: {[h.description for h in handoffs]}",
    handoffs=handoffs,
)
```

**See:** `references/examples.md#handoffs-complete`

---

## Guardrail Issues

### Error: `Guardrail rejected input/output`

**Cause:** Input or output failed guardrail validation.

**Solutions:**

1. Check guardrail instructions:
```python
guardrail = InputGuardrail(
    name="filter",
    instructions="""
    Return input as-is if safe.
    Return "REJECTED: reason" if not safe.
    """,
)
```

2. Debug guardrail behavior:
```python
# Test guardrail separately
test_result = await guardrail.run("test input")
print(f"Guardrail result: {test_result}")
```

3. Add context to guardrail:
```python
guardrail = InputGuardrail(
    name="context_aware_filter",
    instructions="""
    User context: {user_context}
    Filter based on this context.
    """
)
```

**See:** `references/examples.md#guardrails-complete`

---

## Session Issues

### Error: `Session expired` or `Invalid session state`

**Cause:** Session state corrupted or lost.

**Solutions:**

1. Always use `to_input()` to get session:
```python
session = result.to_input()  # Correct

# Don't try to create session manually
session = result.raw_responses  # Wrong
```

2. Persist sessions properly:
```python
import json

# Save
session_data = result.to_input()
with open("session.json", "w") as f:
    json.dump(session_data, f)

# Load
with open("session.json", "r") as f:
    session_data = json.load(f)

context = RunContext(session=session_data)
```

3. Handle missing sessions:
```python
try:
    context = RunContext(session=loaded_session)
except Exception:
    context = RunContext()  # New session
```

---

## Model Issues

### Error: `Model not found: <model_name>`

**Cause:** Invalid model name or not accessible.

**Solutions:**

1. Use correct model names:
```
gpt-4o           # Recommended
gpt-4o-mini      # Faster/cheaper
gpt-4-turbo      # Legacy
```

2. Check available models:
```python
# Via OpenAI API
import openai
client = openai.OpenAI()
models = client.models.list()
print([m.id for m in models.data])
```

3. Verify model access:
```python
from agents import RunConfig

config = RunConfig(
    model="gpt-4o",  # Must be accessible
)
```

---

### Error: `Invalid model settings`

**Cause:** Invalid `ModelSettings` configuration.

**Solutions:**

1. Use correct types and ranges:
```python
from agents import ModelSettings

settings = ModelSettings(
    temperature=0.7,      # 0.0 to 2.0
    max_tokens=1000,      # Positive integer
    top_p=0.9,           # 0.0 to 1.0
    frequency_penalty=0.0,  # -2.0 to 2.0
    presence_penalty=0.0,   # -2.0 to 2.0
)
```

2. Validate settings:
```python
# Add validation
if not 0.0 <= settings.temperature <= 2.0:
    raise ValueError("temperature must be 0.0-2.0")
```

---

## Type Errors

### Error: `Expected type <X>, got <Y>` (TypeScript)

**Cause:** Type mismatch in TypeScript.

**Solutions:**

1. Use Zod for parameters:
```typescript
import { z } from 'zod';

const tool = tool({
  name: 'my_tool',
  parameters: z.object({
    text: z.string(),  // Correct typing
    count: z.number(),
  }),
});
```

2. Use type annotations:
```typescript
async function myTool({ text, count }: { text: string; count: number }) {
  return `Result: ${text} (${count})`;
}
```

3. Check generated types:
```bash
npx tsc --noEmit  # Type check without building
```

---

## Performance Issues

### Symptom: Slow responses

**Causes:** Large prompts, too many tools, slow MCP servers.

**Solutions:**

1. Reduce prompt size:
```python
agent = Agent(
    instructions="Brief instructions.",  # Keep concise
)
```

2. Limit tools:
```python
agent = Agent(
    tools=[only_essential_tools],  # Don't load all tools
)
```

3. Use faster model:
```python
config = RunConfig(model="gpt-4o-mini")
```

4. Cache MCP tool results:
```python
from functools import lru_cache

@lru_cache(maxsize=100)
async def cached_tool_call(param: str):
    return await original_tool(param)
```

---

## Debugging

### Enable Debug Logging

**Python:**
```python
import logging

logging.basicConfig(level=logging.DEBUG)
```

**TypeScript:**
```typescript
// Set NODE_ENV
process.env.DEBUG = 'openai:*';
```

### Enable Tracing

```python
from agents import RunConfig

config = RunConfig(
    tracing_disabled=False,
    trace_include_sensitive_data=True,
    workflow_name="Debug Session",
)
```

### Print Intermediate Results

```python
# Python
result = await Runner.run(agent, input)
print(f"Raw responses: {len(result.raw_responses)}")
print(f"Interruptions: {result.interruptions}")
```

```typescript
// TypeScript
const result = await run(agent, input);
console.log(`Raw responses: ${result.rawResponses.length}`);
console.log(`Interruptions: ${result.interruptions}`);
```

---

## Common Gotchas

1. **Forgot `await` on async functions**
```python
# Wrong
result = Runner.run(agent, input)

# Correct
result = await Runner.run(agent, input)
```

2. **Didn't close MCP server**
```python
# Wrong
mcp_server = MCPServerStdio(...)
# Never cleaned up

# Correct
try:
    await mcp_server.connect()
    ...
finally:
    await mcp_server.cleanup()
```

3. **Used wrong method for tools**
```python
# Wrong
agent.tools.append(my_tool)

# Correct
agent = Agent(tools=[my_tool])  # Set at creation
```

4. **Didn't handle approval loop**
```python
# Wrong
result = await Runner.run(agent, input)
# Ignored result.interruptions

# Correct
while result.interruptions:
    # Handle approvals
    result = await Runner.run(agent, result.state)
```

---

## Getting Help

1. **Check official docs:**
   - Python: https://openai.github.io/openai-agents-python
   - TypeScript: https://openai.github.io/openai-agents-js

2. **Search for similar issues:**
   - GitHub issues for the SDK

3. **Use Context7 MCP:**
```
/fetching-library-docs openai-agents-python
```

4. **Verify installation:**
```bash
python -c "import agents; print(agents.__version__)"
npm list @openai/agents
```

---

## See Also

- Complete examples: `references/examples.md`
- Quick reference: `references/quick-reference.md`
- Official docs: `references/official-docs/`
