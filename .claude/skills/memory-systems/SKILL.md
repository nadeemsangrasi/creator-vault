---
name: memory-systems
description: Design and implement memory architectures for agent systems. Use when building agents that need to persist state across sessions, maintain entity consistency, or reason over structured knowledge.
version: 1.0.0
allowed-tools: Read, Write, Bash
author: CreatorVault Contributors
tags: [agents, memory, persistence, knowledge-graphs]
---

# Memory Systems for Agent Architectures

Memory is what separates stateless systems from learning agents. Without memory, agents lose all context when sessions end. With proper memory architecture, agents build knowledge over time, maintain entity consistency across conversations, and reason over structured information.

## When to Use This Skill

Activate this skill when you need to:

- **Persist agent state** across sessions without re-querying data
- **Track entities** (users, products, concepts) across multiple conversations
- **Build knowledge bases** that grow and improve over time
- **Reason over relationships** between entities using graph structures
- **Query temporal data** with validity periods ("What was true on Date X?")
- **Prevent information conflicts** when facts change over time
- **Optimize for retrieval** efficiency over long conversation histories

**Trigger keywords:** "agent memory", "persistent state", "entity tracking", "knowledge graph", "temporal reasoning"

## Prerequisites

**Required knowledge:**
- Agent architecture basics (what agents are, how they process)
- API patterns (REST, embeddings, graph queries)
- Data structures (lists, trees, graphs)

**Helpful but optional:**
- Vector databases (Pinecone, Weaviate)
- Graph databases (Neo4j, TigerGraph)
- Embedding models (OpenAI, local)

**No coding required to understand concepts**, but implementation examples use Python/TypeScript.

## Core Concepts (30 seconds)

**The Memory Spectrum:** Memory ranges from immediate (context window, fast, volatile) to permanent (storage, slow, persistent). Effective systems use layers:

1. **Working Memory** - Context window (immediate, disappears at session end)
2. **Short-Term Memory** - Session-scoped (available this session, searchable)
3. **Long-Term Memory** - Cross-session (available always, structured)
4. **Entity Memory** - Tracks entities across conversations
5. **Temporal Memory** - Facts with validity periods

**Why This Matters:** Vector stores alone can't answer relationship questions ("What else did users who bought X also buy?"). Knowledge graphs answer relationship questions. Temporal knowledge graphs handle changing facts without conflicts.

**Performance Reality:** Zep (temporal KG) achieves 94.8% accuracy with 2.58s retrieval (90% faster than full-context). GraphRAG gains 20-35% accuracy over baseline RAG through structured reasoning.

## Instructions

### Phase 1: Choose Your Memory Architecture

**Decision:** What type of queries must your agent answer?

```
Simple facts only?               → Vector RAG (patterns: Example 1)
├─ "What's in this document?"
├─ "Find similar cases"
└─ Works: Customer support, document search

Relationships important?          → Knowledge Graph (patterns: Example 2)
├─ "What products do X users prefer?"
├─ "Who knows whom in this network?"
└─ Works: CRM, recommendation systems

Time-aware reasoning?             → Temporal KG (patterns: Example 3)
├─ "What was the address on Jan 15?"
├─ "When did this relationship start?"
└─ Works: Event tracking, compliance, audit logs
```

**Quick validation:** Can you draw the relationships on a whiteboard? If yes, you need a knowledge graph. If facts have validity dates? You need temporal tracking.

**See:** `references/implementation.md#architecture-selection` for detailed decision matrix.

### Phase 2: Set Up Storage Layer

**Decide on storage backend:**

```python
# Pattern 1: File System (simplest, no dependencies)
memory_dir/
  entities/
    user_123.json
    product_456.json
  relationships/
    user_123_purchased_product_456.json
  temporal/
    address_changes_2024.json

# Pattern 2: Vector Database (semantic search + metadata)
pinecone.Index("agent-memory").upsert([
  ("fact_1", vector, {"entity": "user_123", "type": "preference"}),
  ("fact_2", vector, {"entity": "product_456", "type": "inventory"}),
])

# Pattern 3: Graph Database (relationship queries)
graph.create_node("User", id="user_123", name="John")
graph.create_relationship("user_123", "PURCHASED", "product_456")
```

**Recommendation for starting:**
- Prototype: File system (JSON files, git-trackable)
- Production simple: Vector DB + metadata filters
- Production complex: Graph database

**See:** `references/quick-reference.md#storage-setup` for code patterns.

### Phase 3: Implement Entity Memory

Entities are "things" your agent knows about: users, products, concepts, places.

**Core entity pattern:**

```python
# Entity definition (< 5 lines)
entity = {
    "id": "unique_identifier",
    "type": "user",  # or product, concept, etc.
    "properties": {"name": "John", "email": "john@..."},
    "discovered": "2024-01-15",
    "last_updated": "2024-01-20"
}

# Store entity
memory.store_entity(entity)

# Retrieve and update
entity = memory.get_entity("user_123")
entity["properties"]["address"] = "123 Main St"
memory.update_entity(entity)
```

**Decision:** What entities does your agent track? (Users? Products? Concepts? Companies?)

List entities → Define their properties → Implement storage

**See:** `references/examples.md#entity-memory` for complete implementation.

### Phase 4: Add Relationship Tracking

Relationships connect entities: User → PURCHASED → Product, User → KNOWS → User.

**Core relationship pattern:**

```python
# Relationship definition (< 5 lines)
relationship = {
    "from_entity": "user_123",
    "relationship_type": "PURCHASED",
    "to_entity": "product_456",
    "created": "2024-01-15",
    "properties": {"quantity": 2, "price": 99.99}
}

# Store relationship
memory.store_relationship(relationship)

# Query relationships
users_who_bought_X = memory.get_relationships(
    to_entity="product_456",
    relationship_type="PURCHASED"
)
```

**Decision:** What are the 3-5 main relationship types in your domain?

**Common relationships:**
- Commerce: PURCHASED, RETURNED, REVIEWED
- Social: KNOWS, FOLLOWS, COLLABORATED_WITH
- Organization: WORKS_AT, MANAGES, REPORTS_TO
- Knowledge: REFERENCES, CONTRADICTS, EXTENDS

**See:** `references/examples.md#relationship-tracking` for patterns.

### Phase 5: Implement Temporal Tracking

Time-awareness prevents conflicts: "What was fact X on date Y?"

**Core temporal pattern:**

```python
# Fact with validity period (< 8 lines)
temporal_fact = {
    "entity": "user_123",
    "property": "address",
    "value": "123 Main St",
    "valid_from": "2024-01-15",
    "valid_until": "2024-06-30",  # Optional: null means current
    "source": "user_update"
}

# Query at specific time
address = memory.query_temporal(
    entity="user_123",
    property="address",
    at_time="2024-02-01"  # Returns: "123 Main St"
)
```

**Why this matters:** Without temporal tracking, new address conflicts with old:
```
❌ Without temporal: address = "123 Main St" OR address = "456 Oak Ave"
✅ With temporal: address was "123 Main St" (Jan-Jun), now "456 Oak Ave" (Jul+)
```

**Triggers for temporal tracking:**
- User information changes
- Permissions revoke/grant
- Status transitions
- Price/inventory updates

**See:** `references/examples.md#temporal-queries` for implementation.

### Phase 6: Integrate Memory with Agent Context

Memory only helps if agents can access it. Two patterns:

**Pattern A: Just-in-Time Loading (Recommended)**
```python
# When agent processes query:
1. Extract relevant entities from query
2. Load only those entities + relationships
3. Inject into context
4. Agent processes with memory available
5. Store any new findings

# Result: Smaller context window, faster inference
```

**Pattern B: Semantic Retrieval**
```python
# When agent processes query:
1. Embed query
2. Find semantically similar memories
3. Inject top-K matches
4. Agent processes

# Result: Works without explicit entity detection
```

**Decision:** Can you extract entity names from queries?
- Yes → Use Pattern A (faster, more precise)
- No → Use Pattern B (more robust)

**See:** `references/examples.md#context-integration` for code.

### Phase 7: Handle Memory Consolidation

Memory grows over time and needs cleanup. Consolidation prevents unbounded growth.

**Consolidation triggers:**
```python
# After N facts accumulated
if len(memory) > 10000:
    consolidate_memory()

# After fact becomes outdated
if fact.valid_until < now():
    archive_or_delete_fact(fact)

# Periodic maintenance
schedule.every().day.at("02:00").do(consolidate_memory)
```

**Consolidation process:**
```python
# 1. Identify outdated facts
outdated = [f for f in memory if f.valid_until < now()]

# 2. Merge related facts
# e.g., multiple "address" updates → keep recent + timestamp
merged = merge_related_facts(outdated)

# 3. Archive old facts
archive_facts(merged)

# 4. Rebuild indexes
rebuild_indexes()
```

**Result:** Faster queries, lower storage, cleaner knowledge base.

**See:** `references/examples.md#consolidation` for patterns.

### Phase 8: Monitor and Maintain

Track memory health to catch issues early.

**Key metrics:**
```
- Total facts stored (prevent unbounded growth)
- Query latency (should stay <1s)
- Retrieval accuracy (facts actually useful?)
- Outdated fact percentage (track consolidation need)
- Entity coverage (are we tracking all needed entities?)
```

**Quick monitoring pattern:**
```python
def memory_health_check():
    return {
        "total_facts": len(memory),
        "avg_query_time": measure_latency(),
        "outdated_percentage": count_outdated() / len(memory),
        "entity_types": list_entity_types(),
    }

# Run monthly
report = memory_health_check()
print(f"Query time: {report['avg_query_time']}ms")
print(f"Outdated: {report['outdated_percentage']}%")
```

**Action thresholds:**
- Query time > 2s → Consolidate memory
- Outdated > 30% → Archive old facts
- Total facts > max capacity → Implement pruning

**See:** `references/quick-reference.md#monitoring` for patterns.

## Common Patterns

### Pattern 1: Vector RAG with Metadata Filtering
**Use when:** Simple semantic search with some filtering

```python
# Store: embeddings + metadata
chunks = split_into_chunks(documents)
for chunk in chunks:
    vector = embed(chunk.text)
    memory.store(vector, {
        "entity_id": extract_entity(chunk),
        "timestamp": chunk.date,
        "source": chunk.source
    })

# Query: embedding + filters
query_vector = embed(user_query)
results = memory.search(
    query_vector,
    filters={"entity_id": "user_123", "after": "2024-01-01"}
)
```

**When to use:** Customer support, document search, Q&A over documents

### Pattern 2: Knowledge Graph with Relationship Traversal
**Use when:** Need to answer relationship questions

```python
# Query: What products do users who bought X also buy?
users = graph.query("""
    MATCH (u:User)-[:PURCHASED]->(p1:Product)
    WHERE p1.id = 'product_123'
    WITH u
    MATCH (u)-[:PURCHASED]->(p2:Product)
    WHERE p2.id != 'product_123'
    RETURN p2, COUNT(*) as frequency
    ORDER BY frequency DESC
""")
```

**When to use:** Recommendations, relationship discovery, network analysis

### Pattern 3: Temporal Knowledge Graph
**Use when:** Facts change over time and you need historical queries

```python
# Store with validity periods
graph.create_fact({
    "entity": "user_123",
    "property": "status",
    "value": "premium",
    "valid_from": "2024-01-15",
    "valid_until": "2024-06-30"
})

# Query at specific time
status_on_date = graph.query_temporal(
    entity="user_123",
    property="status",
    at_time="2024-03-01"
)
```

**When to use:** Compliance, audit logs, event tracking, permission history

## Error Handling

| Problem | Cause | Solution |
|---------|-------|----------|
| Memory keeps growing | No consolidation | Implement periodic cleanup schedule |
| Queries too slow | Too many facts | Archive outdated facts, add indexes |
| Entity conflicts | Same entity stored twice | Add entity deduplication on store |
| Outdated info used | No temporal tracking | Add valid_from/until to all facts |
| Can't find memories | Poor retrieval strategy | Use semantic search or entity traversal |
| Storage cost high | All facts kept forever | Implement retention policies |

**See:** `references/troubleshooting.md` for detailed solutions.

## Decision Trees

### Memory Architecture Selection
```
Can you list the 3-5 main entity types?
├─ Yes → Go to "Relationship importance?"
└─ No → Use Vector RAG with metadata (Pattern 1)

Do you need relationship queries?
├─ Yes → Go to "Time-aware?"
└─ No → Use Vector RAG (Pattern 1)

Do facts have validity dates?
├─ Yes → Use Temporal KG (Pattern 3)
└─ No → Use Knowledge Graph (Pattern 2)
```

### Implementation Strategy Selection
```
Starting project?
├─ Yes → Use File System + JSON (simple, debuggable)
└─ No → Go to "Scale requirement?"

< 100K facts?
├─ Yes → Vector DB fine
└─ No → Use Graph DB for relationships
```

## Quick Start (5 Minutes)

1. **Pick architecture:** Simple facts → Vector RAG, Relationships → Graph
2. **Choose storage:** Start with JSON files, upgrade to DB later
3. **Define entities:** User? Product? What are the nouns in your domain?
4. **Add one relationship type:** PURCHASED, KNOWS, etc.
5. **Test:** Store 5 facts, retrieve them, verify correctness

**Result:** Working memory system, ready to expand.

**See:** `references/examples.md#quick-start` for complete working code.

## References

**Detailed Implementation:**
- Architecture selection matrix: `references/implementation.md`
- Code patterns and examples: `references/examples.md`
- Setup and configuration: `references/quick-reference.md`

**Problem Solving:**
- Troubleshooting guide: `references/troubleshooting.md`
- Common issues and solutions: `references/troubleshooting.md#common-issues`

**Deep Dives:**
- Research and benchmarks: `references/official-docs.md`
- Performance tuning: `references/official-docs.md#performance`
- Storage selection: `references/official-docs.md#storage-comparison`

## Related Skills

- **context-fundamentals** - How context works (prerequisite)
- **multi-agent-patterns** - Sharing memory across agents
- **evaluation-systems** - Evaluating memory quality

## Next Steps

1. Read `references/implementation.md` to understand your options
2. Pick a memory architecture (start simple)
3. Follow Example 1, 2, or 3 in `references/examples.md`
4. Test with small dataset
5. Monitor with patterns in `references/quick-reference.md#monitoring`

**Skill version:** 1.0.0 | **Last updated:** 2026-01-11
