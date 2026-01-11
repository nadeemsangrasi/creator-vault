# OpenAI Agent SDK - Complete Examples

This file contains complete, runnable examples for OpenAI Agent SDK patterns.

## Table of Contents

- [Setup Complete](#setup-complete)
- [Basic Agent Complete](#basic-agent-complete)
- [MCP Tools Complete](#mcp-tools-complete)
- [Approval Tools Complete](#approval-tools-complete)
- [Handoffs Complete](#handoffs-complete)
- [Guardrails Complete](#guardrails-complete)
- [Sessions Complete](#sessions-complete)
- [Approval Flow Complete](#approval-flow-complete)
- [Multi-Agent Workflow](#multi-agent-workflow)
- [Realtime Agent](#realtime-agent)
- [Custom Model Provider](#custom-model-provider)

---

## Setup Complete

### Python Installation

```python
# pyproject.toml
[project]
name = "my-agent-app"
version = "0.1.0"
dependencies = [
    "openai-agents",
    "python-dotenv",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

```bash
# Install
pip install openai-agents python-dotenv

# Or with uv
uv pip install openai-agents python-dotenv
```

```python
# .env file
OPENAI_API_KEY=sk-your-api-key-here
```

### TypeScript Installation

```json
// package.json
{
  "name": "my-agent-app",
  "version": "0.1.0",
  "dependencies": {
    "@openai/agents": "^0.2.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

```bash
npm install
npx tsc --init
```

```bash
# .env file
OPENAI_API_KEY=sk-your-api-key-here
```

---

## Basic Agent Complete

### Python: Basic Agent with Environment

```python
import asyncio
import os
from dotenv import load_dotenv
from agents import Agent, Runner

# Load environment
load_dotenv()

async def main():
    # Create a simple agent
    agent = Agent(
        name="Assistant",
        instructions="You are a helpful assistant that answers concisely."
    )

    # Run the agent
    result = await Runner.run(agent, "What is Python?")
    print(f"Output: {result.final_output}")

    # Run with context
    result2 = await Runner.run(
        agent,
        "Explain your previous answer in one sentence."
    )
    print(f"Follow-up: {result2.final_output}")

if __name__ == "__main__":
    asyncio.run(main())
```

### TypeScript: Basic Agent with Environment

```typescript
import dotenv from 'dotenv';
import { Agent, run } from '@openai/agents';

dotenv.config();

async function main() {
  const agent = new Agent({
    name: 'Assistant',
    instructions: 'You are a helpful assistant that answers concisely.',
  });

  const result = await run(agent, 'What is TypeScript?');
  console.log(`Output: ${result.finalOutput}`);

  const result2 = await run(
    agent,
    'Explain your previous answer in one sentence.'
  );
  console.log(`Follow-up: ${result2.finalOutput}`);
}

main().catch(console.error);
```

---

## MCP Tools Complete

### Python: Hosted MCP Tool with GitMCP

```python
import asyncio
from agents import Agent, HostedMCPTool, Runner

async def main():
    agent = Agent(
        name="Code Assistant",
        instructions="You help with code repositories using available tools.",
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

    result = await Runner.run(
        agent,
        "What is this repository written in? What are the main files?"
    )
    print(result.final_output)

asyncio.run(main())
```

### TypeScript: Hosted MCP Tool with Multiple Servers

```typescript
import { Agent, run, hostedMcpTool } from '@openai/agents';

async function main() {
  const agent = new Agent({
    name: 'Research Assistant',
    instructions: 'Use the available MCP tools to search for information.',
    tools: [
      hostedMcpTool({
        serverLabel: 'gitmcp',
        serverUrl: 'https://gitmcp.io/openai/codex',
        requireApproval: 'never',
      }),
      hostedMcpTool({
        serverLabel: 'deepwiki',
        serverUrl: 'https://mcp.deepwiki.com/sse',
      }),
    ],
  });

  const result = await run(agent, 'Search for information about React hooks');
  console.log(result.finalOutput);
}

main().catch(console.error);
```

### Python: Local MCP Server (stdio)

```python
import asyncio
from agents import Agent, MCPServerStdio, Runner

async def main():
    # Configure local MCP server
    mcp_server = MCPServerStdio(
        command="python",
        args=["-m", "my_mcp_server"],
        env={"MY_VAR": "value"}
    )

    await mcp_server.connect()

    try:
        agent = Agent(
            name="Local Assistant",
            instructions="Use the local MCP server tools.",
            mcp_servers=[mcp_server],
        )

        result = await Runner.run(agent, "What tools are available?")
        print(result.final_output)
    finally:
        await mcp_server.cleanup()

asyncio.run(main())
```

---

## Approval Tools Complete

### Python: Custom Tool with Approval

```python
import asyncio
from agents import Agent, Tool, Runner

async def get_weather(location: str) -> str:
    """Simulated weather tool."""
    return f"The weather in {location} is sunny and 72°F."

async def sensitive_action(data: str) -> str:
    """Sensitive action requiring approval."""
    return f"Sensitive action performed on: {data}"

async def main():
    agent = Agent(
        name="Approvals Demo",
        instructions="You have access to tools. Some require approval.",
        tools=[
            Tool(
                name="get_weather",
                description="Get weather for a location",
                params_json_schema={
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    },
                    "required": ["location"]
                },
                fn=get_weather,
            ),
            Tool(
                name="sensitive_action",
                description="Perform sensitive action",
                params_json_schema={
                    "type": "object",
                    "properties": {
                        "data": {"type": "string"}
                    },
                    "required": ["data"]
                },
                fn=sensitive_action,
                needs_approval=True,
            ),
        ],
    )

    result = await Runner.run(agent, "What's the weather in Tokyo?")
    print(result.final_output)

    # This will trigger approval
    result = await Runner.run(agent, "Perform sensitive action on user data")
    print(f"Interruptions: {len(result.interruptions) if result.interruptions else 0}")

asyncio.run(main())
```

### TypeScript: Custom Tool with Approval

```typescript
import { Agent, run, tool, RunToolApprovalItem } from '@openai/agents';
import { z } from 'zod';
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

async function getWeather({ location }: { location: string }) {
  return `The weather in ${location} is sunny and 72°F.`;
}

async function sensitiveAction({ data }: { data: string }) {
  return `Sensitive action performed on: ${data}`;
}

async function confirm(item: RunToolApprovalItem): Promise<boolean> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(
    `Approve tool ${item.name} with params ${JSON.stringify(item.arguments)}? (y/n) `
  );
  rl.close();
  return answer.toLowerCase().trim() === 'y';
}

async function main() {
  const agent = new Agent({
    name: 'Approvals Demo',
    instructions: 'You have access to tools. Some require approval.',
    tools: [
      tool({
        name: 'get_weather',
        description: 'Get weather for a location',
        parameters: z.object({ location: z.string() }),
        execute: getWeather,
      }),
      tool({
        name: 'sensitive_action',
        description: 'Perform sensitive action',
        parameters: z.object({ data: z.string() }),
        execute: sensitiveAction,
        needsApproval: true,
      }),
    ],
  });

  let result = await run(agent, "What's the weather in Tokyo?");
  console.log(result.finalOutput);

  // This will trigger approval
  result = await run(agent, 'Perform sensitive action on user data');

  while (result.interruptions && result.interruptions.length) {
    for (const interruption of result.interruptions) {
      const approved = await confirm(interruption);
      if (approved) {
        result.state.approve(interruption);
      } else {
        result.state.reject(interruption);
      }
    }
    result = await run(agent, result.state);
  }

  console.log(result.finalOutput);
}

main().catch(console.error);
```

---

## Handoffs Complete

### Python: Multi-Agent with Handoffs

```python
import asyncio
from agents import Agent, Handoff, Runner

async def main():
    # Create specialized agents
    coder = Agent(
        name="Coder",
        instructions="You are a coding assistant. Write clean, well-documented code."
    )

    researcher = Agent(
        name="Researcher",
        instructions="You are a research assistant. Find and summarize information."
    )

    writer = Agent(
        name="Writer",
        instructions="You are a writer. Create engaging, clear content."
    )

    # Configure handoffs
    coder.handoffs = [
        Handoff(agent=researcher, description="For research tasks"),
        Handoff(agent=writer, description="For writing tasks"),
    ]

    researcher.handoffs = [
        Handoff(agent=coder, description="For coding tasks"),
        Handoff(agent=writer, description="For writing tasks"),
    ]

    writer.handoffs = [
        Handoff(agent=coder, description="For coding tasks"),
        Handoff(agent=researcher, description="For research tasks"),
    ]

    # Start with coder
    result = await Runner.run(
        coder,
        "I need to write a Python script that fetches weather data and generates a report."
    )
    print(result.final_output)

asyncio.run(main())
```

### TypeScript: Multi-Agent with Handoffs

```typescript
import { Agent, run } from '@openai/agents';

async function main() {
  const coder = new Agent({
    name: 'Coder',
    instructions: 'You are a coding assistant. Write clean code.',
    handoffs: [
      { agent: 'researcher', description: 'For research' },
      { agent: 'writer', description: 'For writing' },
    ],
  });

  const researcher = new Agent({
    name: 'Researcher',
    instructions: 'You are a research assistant.',
    handoffs: [
      { agent: 'coder', description: 'For coding' },
      { agent: 'writer', description: 'For writing' },
    ],
  });

  const writer = new Agent({
    name: 'Writer',
    instructions: 'You are a writer.',
    handoffs: [
      { agent: 'coder', description: 'For coding' },
      { agent: 'researcher', description: 'For research' },
    ],
  });

  const result = await run(
    coder,
    'Create a weather report with Python script.'
  );
  console.log(result.finalOutput);
}

main().catch(console.error);
```

---

## Guardrails Complete

### Python: Input and Output Guardrails

```python
import asyncio
from agents import Agent, InputGuardrail, OutputGuardrail, Runner

async def main():
    # Input guardrail - filters before agent runs
    input_guardrail = InputGuardrail(
        name="content_filter",
        instructions="""
        Reject any input that contains:
        - Hate speech
        - Violence
        - PII (personal information)
        Return the input as-is if safe, or "REJECTED: <reason>" if not.
        """
    )

    # Output guardrail - filters after agent responds
    output_guardrail = OutputGuardrail(
        name="politeness_check",
        instructions="""
        Ensure the output is:
        - Polite and respectful
        - Factually accurate
        - Not harmful
        Return the output as-is if acceptable, or rewrite it if needed.
        """
    )

    agent = Agent(
        name="Guarded Assistant",
        instructions="You are a helpful assistant.",
        input_guardrails=[input_guardrail],
        output_guardrails=[output_guardrail],
    )

    # This will be checked by input guardrail
    result = await Runner.run(agent, "What is 2 + 2?")
    print(result.final_output)

asyncio.run(main())
```

### TypeScript: Guardrails with Custom Behavior

```typescript
import { Agent, run, inputGuardrail, outputGuardrail } from '@openai/agents';

async function main() {
  const inputGuard = inputGuardrail({
    name: 'content_filter',
    instructions: `
    Reject input containing hate speech, violence, or PII.
    Return "REJECTED: <reason>" if unsafe, otherwise return as-is.
    `,
  });

  const outputGuard = outputGuardrail({
    name: 'politeness_check',
    instructions: `
    Ensure output is polite, respectful, and accurate.
    Rewrite if necessary, otherwise return as-is.
    `,
  });

  const agent = new Agent({
    name: 'Guarded Assistant',
    instructions: 'You are a helpful assistant.',
    inputGuardrails: [inputGuard],
    outputGuardrails: [outputGuard],
  });

  const result = await run(agent, 'What is the capital of France?');
  console.log(result.finalOutput);
}

main().catch(console.error);
```

---

## Sessions Complete

### Python: Persistent Sessions

```python
import asyncio
from agents import Agent, Runner, RunContext

async def main():
    agent = Agent(
        name="Session Demo",
        instructions="You remember our conversation."
    )

    # First turn - no session
    result1 = await Runner.run(agent, "My name is Alice.")
    print(result1.final_output)

    # Get the session from result
    session = result1.to_input()

    # Second turn - with session
    context = RunContext(context_value={}, session=session)
    result2 = await Runner.run(agent, "What's my name?", context=context)
    print(result2.final_output)

    # Continue conversation
    result3 = await Runner.run(agent, "And I live in Paris.", context=context)
    print(result3.final_output)

asyncio.run(main())
```

### TypeScript: Session Management

```typescript
import { Agent, run, RunContext } from '@openai/agents';

async function main() {
  const agent = new Agent({
    name: 'Session Demo',
    instructions: 'You remember our conversation.',
  });

  // First turn
  const result1 = await run(agent, "My name is Bob.");
  console.log(result1.finalOutput);

  // Create context with session
  const context = new RunContext({
    session: result1.toInput(),
  });

  // Second turn
  const result2 = await run(agent, "What's my name?", context);
  console.log(result2.finalOutput);
}

main().catch(console.error);
```

---

## Approval Flow Complete

### Python: Approval Loop with User Confirmation

```python
import asyncio
from agents import Agent, Tool, Runner, RunContext

async def dangerous_action(action: str) -> str:
    """Simulates a dangerous action requiring approval."""
    return f"Action '{action}' completed successfully."

async def main():
    agent = Agent(
        name="Dangerous Bot",
        instructions="You can perform dangerous actions.",
        tools=[
            Tool(
                name="dangerous_action",
                description="Perform a dangerous action",
                params_json_schema={
                    "type": "object",
                    "properties": {
                        "action": {"type": "string"}
                    },
                    "required": ["action"]
                },
                fn=dangerous_action,
                needs_approval=True,
            ),
        ],
    )

    # This will require approval
    result = await Runner.run(agent, "Execute dangerous_action on 'system reboot'")

    # Handle approval loop
    while result.interruptions and result.interruptions:
        for interruption in result.interruptions:
            print(f"\nApproval needed for: {interruption.name}")
            print(f"Arguments: {interruption.arguments}")

            # Get user input (in real app, use proper input)
            response = input("Approve? (y/n): ")

            if response.lower().strip() == 'y':
                print("Approved!")
                result.state.approve(interruption)
            else:
                print("Rejected!")
                result.state.reject(interruption)

        # Continue with updated state
        result = await Runner.run(agent, result.state)

    print(f"\nFinal output: {result.final_output}")

asyncio.run(main())
```

### TypeScript: Approval Flow with Human-in-the-Loop

```typescript
import { Agent, run, tool, RunToolApprovalItem } from '@openai/agents';
import { z } from 'zod';
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

async function dangerousAction({ action }: { action: string }) {
  return `Action '${action}' completed successfully.`;
}

async function confirmApproval(item: RunToolApprovalItem): Promise<boolean> {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log(`\nApproval needed for: ${item.name}`);
  console.log(`Arguments: ${JSON.stringify(item.arguments)}`);

  const answer = await rl.question('Approve? (y/n): ');
  rl.close();

  return answer.toLowerCase().trim() === 'y';
}

async function main() {
  const agent = new Agent({
    name: 'Dangerous Bot',
    instructions: 'You can perform dangerous actions.',
    tools: [
      tool({
        name: 'dangerous_action',
        description: 'Perform a dangerous action',
        parameters: z.object({ action: z.string() }),
        execute: dangerousAction,
        needsApproval: true,
      }),
    ],
  });

  let result = await run(agent, "Execute dangerous_action on 'system reboot'");

  // Handle approval loop
  while (result.interruptions && result.interruptions.length) {
    for (const interruption of result.interruptions) {
      const approved = await confirmApproval(interruption);

      if (approved) {
        console.log('Approved!');
        result.state.approve(interruption);
      } else {
        console.log('Rejected!');
        result.state.reject(interruption);
      }
    }

    result = await run(agent, result.state);
  }

  console.log(`\nFinal output: ${result.finalOutput}`);
}

main().catch(console.error);
```

---

## Multi-Agent Workflow

### Python: Complete Multi-Agent System

```python
import asyncio
from agents import Agent, Handoff, Runner, RunContext

async def main():
    # Define three specialized agents
    analyst = Agent(
        name="Analyst",
        instructions="""
        You are a data analyst. You:
        - Analyze information
        - Identify patterns
        - Provide insights
        Hand off to Developer for implementation.
        """
    )

    developer = Agent(
        name="Developer",
        instructions="""
        You are a developer. You:
        - Write code
        - Create solutions
        - Document implementations
        Hand off to Tester for validation.
        """
    )

    tester = Agent(
        name="Tester",
        instructions="""
        You are a QA tester. You:
        - Validate solutions
        - Check edge cases
        - Provide feedback
        Hand off to Analyst if issues found.
        """
    )

    # Configure handoffs
    analyst.handoffs = [Handoff(agent=developer)]
    developer.handoffs = [Handoff(agent=tester)]
    tester.handoffs = [Handoff(agent=analyst)]

    # Run workflow
    result = await Runner.run(
        analyst,
        """
        I need a Python function that calculates Fibonacci numbers efficiently.
        Analyze requirements, then implement, then test.
        """
    )

    print("=== Workflow Complete ===")
    print(result.final_output)
    print(f"\nTotal turns: {len(result.raw_responses)}")

asyncio.run(main())
```

### TypeScript: Multi-Agent with Shared Context

```typescript
import { Agent, run, RunContext } from '@openai/agents';

async function main() {
  const planner = new Agent({
    name: 'Planner',
    instructions: 'Break down tasks into steps.',
    handoffs: [{ agent: 'executor', description: 'For execution' }],
  });

  const executor = new Agent({
    name: 'Executor',
    instructions: 'Execute the planned steps.',
    handoffs: [{ agent: 'reviewer', description: 'For review' }],
  });

  const reviewer = new Agent({
    name: 'Reviewer',
    instructions: 'Review the execution.',
    handoffs: [{ agent: 'planner', description: 'For replanning' }],
  });

  const result = await run(
    planner,
    'Create a REST API for a todo app.'
  );

  console.log(result.finalOutput);
}

main().catch(console.error);
```

---

## Realtime Agent

### Python: Realtime Agent with Tools

```python
import asyncio
from agents import (
    RealtimeAgent,
    RealtimeSession,
    Agent,
    Tool,
    backgroundResult,
)

async def get_weather(location: str) -> str:
    return f"The weather in {location} is sunny and 72°F."

async def main():
    agent = Agent(
        name="Weather Assistant",
        instructions="You are a helpful weather assistant.",
        tools=[
            Tool(
                name="get_weather",
                description="Get weather for location",
                params_json_schema={
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    },
                    "required": ["location"]
                },
                fn=get_weather,
            ),
        ],
    )

    # Would require transport layer (WebSocket, etc.)
    # session = RealtimeSession(agent, ...)
    # await session.connect()

    print("Realtime agent configured (requires transport layer)")

asyncio.run(main())
```

### TypeScript: Realtime Agent with WebSocket

```typescript
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import { z } from 'zod';

async function getWeather({ location }: { location: string }) {
  return `The weather in ${location} is sunny and 72°F.`;
}

async function main() {
  const agent = new RealtimeAgent({
    name: 'Weather Assistant',
    instructions: 'You are a helpful weather assistant.',
    tools: [
      tool({
        name: 'get_weather',
        description: 'Get weather for location',
        parameters: z.object({ location: z.string() }),
        execute: async ({ location }) => {
          return `The weather in ${location} is sunny and 72°F.`;
        },
      }),
    ],
  });

  // Would require transport layer (WebSocket, Twilio, etc.)
  // const session = new RealtimeSession(agent, {
  //   transport: myTransport,
  //   model: 'gpt-realtime',
  // });

  console.log('Realtime agent configured (requires transport layer)');
}

main().catch(console.error);
```

---

## Custom Model Provider

### Python: Custom Model Provider

```python
import asyncio
from typing import Any, Optional
from agents import (
    Agent,
    Runner,
    ModelProvider,
    Model,
    ModelSettings,
    RunConfig,
)

class CustomModel(Model):
    def __init__(self, name: str, base_url: str):
        self.name = name
        self.base_url = base_url

    async def generate(self, messages: list, **kwargs) -> str:
        """Custom generation logic."""
        # Implement your custom API call here
        # This is a simplified example
        response = f"Custom model response to: {messages[-1]}"
        return response

class CustomProvider(ModelProvider):
    def __init__(self, base_url: str):
        self.base_url = base_url

    def get_model(self, name: str) -> Model:
        return CustomModel(name, self.base_url)

async def main():
    # Create custom provider
    custom_provider = CustomProvider(base_url="https://api.custom-model.com")

    # Create agent with custom model
    agent = Agent(
        name="Custom Assistant",
        instructions="You use a custom model.",
    )

    # Run with custom provider
    config = RunConfig(
        model_provider=custom_provider,
        model="custom-model",
    )

    result = await Runner.run(agent, "Hello!", config=config)
    print(result.final_output)

asyncio.run(main())
```

### TypeScript: Custom Model Provider

```typescript
import { Agent, run, ModelProvider, RunConfig } from '@openai/agents';

class CustomModelProvider implements ModelProvider {
  constructor(private baseUrl: string) {}

  getModel(name: string) {
    return {
      name,
      baseUrl: this.baseUrl,
      generate: async (messages: any[]) => {
        return `Custom model response to: ${messages[messages.length - 1]}`;
      },
    };
  }
}

async function main() {
  const customProvider = new CustomModelProvider('https://api.custom-model.com');

  const agent = new Agent({
    name: 'Custom Assistant',
    instructions: 'You use a custom model.',
  });

  const config: RunConfig = {
    modelProvider: customProvider,
    model: 'custom-model',
  };

  const result = await run(agent, 'Hello!', config);
  console.log(result.finalOutput);
}

main().catch(console.error);
```

---

## Additional Resources

For more examples and patterns, see:
- Quick reference: `references/quick-reference.md`
- Troubleshooting: `references/troubleshooting.md`
- Official docs: `references/official-docs/`
