# Memory Systems for Agent Architectures

Build persistent memory systems that allow agents to maintain continuity across sessions and reason over accumulated knowledge.

## What is Memory for Agents?

Memory is what separates stateless systems from learning agents. Without memory, agents lose all context when sessions end. With proper memory architecture, agents build knowledge over time, maintain entity consistency across conversations, and reason over structured information.

**Without Memory:**
```
Session 1:
User: "My name is John"
Assistant: "Nice to meet you, John"
User: "What's my name?"
Assistant: "I don't know" ❌

Session 2:
User: "What's my name?"
Assistant: "I don't know" ❌
```

**With Memory:**
```
Session 1:
User: "My name is John"
Assistant: "Nice to meet you, John"
User: "What's my name?"
Assistant: "Your name is John" ✅

Session 2:
User: "What's my name?"
Assistant: "Your name is John" ✅
User: "I moved to New York"
Assistant: "Thanks for updating your location, John"
User: "Where did I live before?"
Assistant: "You lived in California before" ✅
```

## Quick Start

### 1. Install the Skill

This skill is automatically available in Claude Code when you need to work with memory systems.

### 2. Choose Your Memory Architecture

**For simple persistence:**
```python
from memory_systems import FileSystemMemory

# Simple JSON file-based memory
memory = FileSystemMemory(base_dir="agent_memory")

# Store information
memory.store_entity({
    "id": "user_123",
    "type": "customer",
    "properties": {"name": "John", "email": "john@example.com"}
})

# Retrieve information
user = memory.get_entity("user_123")
print(user["properties"]["name"])  # "John"
```

**For relationship queries:**
```python
from memory_systems import KnowledgeGraphMemory

# Graph-based memory for relationships
graph = KnowledgeGraphMemory()

# Add entities
graph.add_node("user_123", "user", {"name": "John"})
graph.add_node("prod_456", "product", {"name": "Laptop"})

# Add relationship
graph.add_edge("user_123", "PURCHASED", "prod_456")

# Query relationships
purchases = graph.get_neighbors("user_123", "PURCHASED")
print([p["properties"]["name"] for p in purchases])  # ["Laptop"]
```

**For temporal reasoning:**
```python
from memory_systems import TemporalKnowledgeGraph

# Time-aware memory
temporal_graph = TemporalKnowledgeGraph()

# Store address changes over time
temporal_graph.store_entity_fact(
    entity_id="user_123",
    property_name="address",
    value="123 Main St",
    valid_from="2024-01-01",
    valid_until="2024-06-30"
)

temporal_graph.store_entity_fact(
    entity_id="user_123",
    property_name="address",
    value="456 Oak Ave",
    valid_from="2024-07-01"
)

# Query at specific time
address_june = temporal_graph.get_entity_fact_at_time("user_123", "address", "2024-06-15")
print(address_june)  # "123 Main St"

address_august = temporal_graph.get_entity_fact_at_time("user_123", "address", "2024-08-15")
print(address_august)  # "456 Oak Ave"
```

## Core Concepts

### The Memory Spectrum
Memory exists on a spectrum from immediate context to permanent storage:

1. **Working Memory** - Context window (immediate, disappears at session end)
2. **Short-Term Memory** - Session-scoped (available this session, searchable)
3. **Long-Term Memory** - Cross-session (available always, structured)
4. **Entity Memory** - Tracks entities across conversations
5. **Temporal Memory** - Facts with validity periods

### Why This Matters
- **Vector stores** alone can't answer relationship questions ("What else did users who bought X also buy?")
- **Knowledge graphs** answer relationship questions
- **Temporal knowledge graphs** handle changing facts without conflicts

### Performance Reality
- Zep (temporal KG) achieves 94.8% accuracy with 2.58s retrieval (90% faster than full-context)
- GraphRAG gains 20-35% accuracy over baseline RAG through structured reasoning

## Architecture Types

### 1. Vector RAG (Simplest)
**Best for:** Semantic search, document retrieval
**Use when:** You need to find similar documents or facts
**Trade-offs:** No relationship queries, no temporal awareness

```python
# Example: Customer support bot
memory.store("Customer John ordered laptop", metadata={"user_id": "123", "type": "order"})
results = memory.search("What did John order?")  # Semantic search
```

### 2. Knowledge Graph (Relationships)
**Best for:** Relationship queries, recommendations
**Use when:** You need to answer "what else?" questions
**Trade-offs:** More complex, but enables relationship reasoning

```python
# Example: Recommendation engine
graph.add_edge("user_123", "PURCHASED", "laptop_456")
graph.add_edge("user_123", "VIEWED", "mouse_789")
# Query: "What did users who bought laptops also buy?"
```

### 3. Temporal Knowledge Graph (Time-Aware)
**Best for:** Audit trails, compliance, historical queries
**Use when:** Facts change over time and you need historical accuracy
**Trade-offs:** Most complex, but essential for temporal reasoning

```python
# Example: Compliance system
temporal_graph.store_entity_fact(
    entity_id="user_123",
    property_name="permission_level",
    value="admin",
    valid_from="2024-01-01",
    valid_until="2024-06-30"
)
# Query: "What permissions did user have on 2024-03-15?"
```

## Integration with Agents

### Pattern 1: Just-in-Time Loading
Load only relevant memories when needed:

```python
def process_query_with_memory(agent, query, user_id):
    # 1. Extract entities from query
    entities = extract_entities(query)  # ["user_123"]

    # 2. Load relevant memories
    context_parts = []
    for entity_id in entities:
        entity = memory.get_entity(entity_id)
        if entity:
            context_parts.append(format_entity_for_context(entity))

    # 3. Inject into agent prompt
    enriched_prompt = f"""
    Context: {" ".join(context_parts)}
    Query: {query}
    """

    # 4. Process with agent
    response = agent.generate(enriched_prompt)

    # 5. Learn from interaction
    update_memory_from_interaction(response, query, user_id)

    return response
```

### Pattern 2: Semantic Retrieval
Use embeddings to find relevant memories:

```python
def process_query_semantic(agent, query):
    # 1. Search for relevant memories
    relevant_facts = memory.search(query, top_k=5)

    # 2. Format for context
    context = format_facts_for_context(relevant_facts)

    # 3. Process with agent
    response = agent.generate(f"{context}\nQuery: {query}")

    return response
```

## Common Patterns

### Pattern 1: Entity Tracking
```python
def remember_user_info(user_id, **properties):
    # Store user properties
    entity = {
        "id": user_id,
        "type": "user",
        "properties": properties
    }
    memory.store_entity(entity)

def get_user_info(user_id):
    entity = memory.get_entity(user_id)
    return entity["properties"] if entity else {}
```

### Pattern 2: Relationship Tracking
```python
def track_purchase(user_id, product_id):
    memory.store_relationship(
        from_id=user_id,
        relationship_type="PURCHASED",
        to_id=product_id
    )

def get_user_purchases(user_id):
    relationships = memory.get_relationships(
        from_id=user_id,
        relationship_type="PURCHASED"
    )
    return [rel["to_id"] for rel in relationships]
```

### Pattern 3: Temporal Tracking
```python
def update_user_location(user_id, new_location):
    # Archive old location
    old_location = memory.get_entity_fact_at_time(
        user_id, "location", datetime.now().isoformat()
    )

    # Store new location with temporal validity
    memory.store_temporal_fact(
        entity_id=user_id,
        property_name="location",
        value=new_location,
        valid_from=datetime.now().isoformat()
    )
```

## Performance Optimization

### 1. Indexing Strategy
```python
# Index frequently queried fields
memory.create_index("entity_id")
memory.create_index("type")
memory.create_index("timestamp")
memory.create_composite_index("user_purchases", ["entity_id", "type"])
```

### 2. Caching Pattern
```python
from functools import lru_cache

class CachedMemory:
    def __init__(self, base_memory):
        self.base = base_memory

    @lru_cache(maxsize=1000)
    def get_entity(self, entity_id):
        return self.base.get_entity(entity_id)
```

### 3. Query Optimization
```python
# Good: Filter in query
results = memory.search_by_entity_type("user_123", "order")

# Bad: Retrieve all then filter
all_facts = memory.get_all_facts()
user_orders = [f for f in all_facts if f['entity_id'] == 'user_123' and f['type'] == 'order']
```

## Security Considerations

### 1. Data Classification
```python
def filter_sensitive_data(text):
    # Redact emails, phone numbers, etc.
    import re
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
    return text
```

### 2. Access Controls
```python
class SecureMemory:
    def __init__(self, base_memory, permissions):
        self.base = base_memory
        self.permissions = permissions

    def get_entity(self, entity_id, user_id):
        if not self.permissions.can_access(user_id, entity_id):
            raise PermissionError("Access denied")
        return self.base.get_entity(entity_id)
```

### 3. Retention Policies
```python
def enforce_retention_policies(memory, days_to_keep=365):
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    old_facts = memory.get_facts_older_than(cutoff_date)
    for fact in old_facts:
        memory.archive_fact(fact)
```

## Monitoring and Maintenance

### Memory Health Check
```python
def memory_health_report(memory):
    return {
        "total_entities": len(memory.get_all_entities()),
        "avg_query_time_ms": measure_average_query_time(memory),
        "outdated_percentage": calculate_outdated_facts_percentage(memory),
        "storage_size_mb": calculate_storage_size(memory)
    }
```

### Consolidation Schedule
```python
from apscheduler.schedulers.blocking import BlockingScheduler

def setup_memory_maintenance():
    scheduler = BlockingScheduler()

    # Daily consolidation
    scheduler.add_job(run_memory_consolidation, 'cron', hour=2)

    # Weekly health check
    scheduler.add_job(run_health_check, 'cron', day_of_week='sun', hour=1)

    scheduler.start()
```

## When to Use This Skill

**Use this skill when you need to:**
- ✅ Persist agent state across sessions without re-querying data
- ✅ Track entities across multiple conversations
- ✅ Build knowledge bases that grow over time
- ✅ Answer relationship questions ("what else did X buy?")
- ✅ Perform temporal reasoning ("what was true on date Y?")
- ✅ Prevent information conflicts when facts change
- ✅ Optimize retrieval efficiency over long histories

**Don't use when:**
- ❌ Simple one-shot queries (no persistence needed)
- ❌ Very small amounts of data (just store in context)
- ❌ Static data that never changes
- ❌ When privacy concerns outweigh benefits

## What You'll Build

By following this skill, you'll create:

1. **Memory System** - Choose and implement appropriate memory architecture
2. **Entity Tracking** - Store and retrieve information about entities
3. **Relationship Storage** - Track connections between entities
4. **Temporal Tracking** - Handle changing facts over time
5. **Agent Integration** - Connect memory with agent context
6. **Maintenance System** - Consolidation and cleanup routines
7. **Security Layer** - Privacy and access controls
8. **Monitoring** - Health checks and performance tracking

## Next Steps

1. Read `SKILL.md` for the complete 8-phase workflow
2. Follow the architecture selection guide in `references/implementation.md`
3. Use the code patterns in `references/quick-reference.md`
4. Check `references/troubleshooting.md` if issues arise
5. Review `references/official-docs.md` for deep technical details
6. Start with the minimal example in `references/examples.md`

## Skill Information

| Attribute | Value |
|-----------|-------|
| **Name** | memory-systems |
| **Category** | Agent Architecture |
| **Level** | Intermediate to Advanced |
| **Time to Learn** | 2-4 hours |
| **Complexity** | Medium to High |
| **Version** | 1.0.0 |
| **Last Updated** | 2026-01-11 |

## Related Skills

- **context-fundamentals** - Understanding context windows (prerequisite)
- **multi-agent-patterns** - Sharing memory across agents
- **evaluation-systems** - Measuring memory effectiveness
- **knowledge-graphs** - Deep dive into graph-based memory
- **vector-rag** - Semantic retrieval foundations

## Get Help

- **Architecture questions?** → `references/implementation.md`
- **Code examples?** → `references/examples.md`
- **Performance issues?** → `references/quick-reference.md`
- **Troubleshooting?** → `references/troubleshooting.md`
- **Research details?** → `references/official-docs.md`

---

*Part of the CreatorVault project - Privacy-first content idea manager with advanced AI capabilities.*
