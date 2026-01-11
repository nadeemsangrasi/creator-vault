# Memory Systems - Implementation Guide

## Architecture Selection Matrix

Choose the right memory architecture for your use case.

### Comparison Table

| Criterion | Vector RAG | Knowledge Graph | Temporal KG |
|-----------|-----------|-----------------|------------|
| **Best for** | Semantic search | Relationships | Time-aware queries |
| **Accuracy** | 60-70% | 75-85% | 94.8% |
| **Query latency** | Fast (ms) | Medium (100ms) | Medium (2-3s) |
| **Setup complexity** | Low | Medium | High |
| **Storage needs** | Embeddings + text | Nodes + edges | Nodes + edges + time |
| **Relationship support** | No | Yes | Yes |
| **Temporal queries** | No | No | Yes |
| **Example queries** | "Find similar docs" | "Who knows whom?" | "What was true on date X?" |
| **Scaling cost** | Linear in docs | Linear in nodes | Linear in facts × time |

### Architecture Selection by Use Case

**Customer Support System**
- Entity types: Customer, Product, Issue
- Main queries: "Find similar issues", "What issues has this customer had?"
- Recommended: Vector RAG + metadata
- Reason: Semantic search sufficient, relationships secondary

**CRM System**
- Entity types: Company, Contact, Deal, Interaction
- Main queries: "Who knows whom?", "What deals are at risk?", "Contact history?"
- Recommended: Knowledge Graph
- Reason: Relationships critical for recommendations

**Compliance & Audit System**
- Entity types: User, Permission, Resource, Action
- Main queries: "Who had access on date X?", "When did permissions change?"
- Recommended: Temporal Knowledge Graph
- Reason: Time-aware queries essential for audit trail

**Recommendation Engine**
- Entity types: User, Product, Category
- Main queries: "What did similar users buy?", "What trends for this category?"
- Recommended: Knowledge Graph with Vector RAG
- Reason: Both relationships and semantic similarity needed

## Storage Layer Options

### Option 1: File System (JSON)

**Pros:**
- Zero dependencies
- Fully version-controllable
- Transparent (human-readable)
- Perfect for prototyping

**Cons:**
- No semantic search
- No relationship indexes
- Manual query logic
- Not suitable for > 100K facts

**Implementation:**

```python
# File structure
memory/
  entities/
    user_123.json
    product_456.json
  relationships/
    user_123-PURCHASED-product_456.json
  temporal/
    user_123-address-2024.json

# Code
import json
import os
from pathlib import Path

class FileSystemMemory:
    def __init__(self, base_dir="memory"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)

    def store_entity(self, entity):
        path = self.base_dir / "entities" / f"{entity['id']}.json"
        path.parent.mkdir(exist_ok=True)
        with open(path, 'w') as f:
            json.dump(entity, f)

    def get_entity(self, entity_id):
        path = self.base_dir / "entities" / f"{entity_id}.json"
        if path.exists():
            with open(path) as f:
                return json.load(f)
        return None

    def store_relationship(self, rel):
        key = f"{rel['from']}-{rel['type']}-{rel['to']}"
        path = self.base_dir / "relationships" / f"{key}.json"
        path.parent.mkdir(exist_ok=True)
        with open(path, 'w') as f:
            json.dump(rel, f)

    def get_relationships(self, from_entity=None, rel_type=None):
        rel_dir = self.base_dir / "relationships"
        if not rel_dir.exists():
            return []

        results = []
        for rel_file in rel_dir.glob("*.json"):
            with open(rel_file) as f:
                rel = json.load(f)
            if (from_entity is None or rel['from'] == from_entity) and \
               (rel_type is None or rel['type'] == rel_type):
                results.append(rel)
        return results
```

**When to use:** Prototyping, small projects (< 10K facts), debugging

### Option 2: Vector Database (Pinecone, Weaviate)

**Pros:**
- Semantic search built-in
- Metadata filtering
- Scales to millions
- Low query latency

**Cons:**
- Requires API keys / deployment
- Embedding costs
- Not great for pure relationship queries
- No temporal support (without extensions)

**Implementation:**

```python
import pinecone
from openai import OpenAI

client = OpenAI()

class VectorMemory:
    def __init__(self, index_name="agent-memory"):
        pinecone.init(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = pinecone.Index(index_name)
        self.dim = 1536  # OpenAI embedding dimension

    def store_fact(self, fact_id, text, metadata):
        # Embed the text
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        vector = response.data[0].embedding

        # Store with metadata
        self.index.upsert([(
            fact_id,
            vector,
            metadata
        )])

    def search(self, query_text, filters=None, top_k=10):
        # Embed query
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=query_text
        )
        query_vector = response.data[0].embedding

        # Search
        results = self.index.query(
            query_vector,
            top_k=top_k,
            filter=filters,
            include_metadata=True
        )
        return results['matches']

# Usage
memory = VectorMemory()

# Store fact
memory.store_fact(
    "fact_1",
    "John purchased a laptop for $999",
    {
        "entity_id": "user_123",
        "entity_type": "user",
        "fact_type": "purchase",
        "timestamp": "2024-01-15"
    }
)

# Search
results = memory.search(
    "What did John buy?",
    filters={"entity_id": "user_123"},
    top_k=5
)
```

**When to use:** Production systems with semantic search needs, < 10M facts

### Option 3: Graph Database (Neo4j)

**Pros:**
- Explicit relationship storage and querying
- Cypher query language (powerful)
- Scales to billions of relationships
- Built-in traversal algorithms

**Cons:**
- More infrastructure
- Steeper learning curve
- Overkill for simple facts
- No temporal support (without extensions)

**Implementation:**

```python
from neo4j import GraphDatabase

class GraphMemory:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def store_entity(self, entity):
        query = """
        MERGE (e:Entity {id: $id})
        SET e += $props
        """
        with self.driver.session() as session:
            session.run(query, id=entity['id'], props=entity['properties'])

    def create_relationship(self, from_id, rel_type, to_id, props=None):
        query = f"""
        MATCH (a {{id: $from_id}}), (b {{id: $to_id}})
        CREATE (a)-[:{rel_type}]->(b)
        """
        if props:
            query += " SET r += $props"

        with self.driver.session() as session:
            session.run(query, from_id=from_id, to_id=to_id, props=props or {})

    def query(self, cypher_query, params=None):
        with self.driver.session() as session:
            result = session.run(cypher_query, params or {})
            return [record.data() for record in result]

# Usage
graph = GraphMemory("bolt://localhost:7687", "neo4j", "password")

# Create entities
graph.store_entity({"id": "user_123", "properties": {"name": "John"}})
graph.store_entity({"id": "product_456", "properties": {"name": "Laptop"}})

# Create relationship
graph.create_relationship("user_123", "PURCHASED", "product_456", {"date": "2024-01-15"})

# Query
results = graph.query("""
    MATCH (u:Entity)-[:PURCHASED]->(p:Entity)
    WHERE u.id = $user_id
    RETURN p.name, p.id
""", {"user_id": "user_123"})
```

**When to use:** Complex relationship queries, billions of facts, production systems

### Option 4: Temporal Knowledge Graph (Zep, Custom)

**Pros:**
- Temporal queries ("what was true on date X?")
- Prevents information conflicts
- Best accuracy (94.8%)
- Full audit trail

**Cons:**
- Most complex to implement
- Highest infrastructure needs
- Storage grows with time dimension
- Query complexity increases

**Implementation Pattern:**

```python
class TemporalKGraph:
    def __init__(self, graph_db, vector_db=None):
        self.graph = graph_db  # Neo4j or similar
        self.vector = vector_db  # Optional: for semantic search

    def store_temporal_fact(self, entity_id, property_name, value, valid_from, valid_until=None):
        """Store a fact with validity period"""
        query = """
        MATCH (e:Entity {id: $entity_id})
        CREATE (e)-[:HAS_PROPERTY {
            property: $property,
            value: $value,
            valid_from: $valid_from,
            valid_until: $valid_until,
            created_at: timestamp()
        }]->(v:Value {value: $value})
        """
        self.graph.query(query, {
            "entity_id": entity_id,
            "property": property_name,
            "value": value,
            "valid_from": valid_from,
            "valid_until": valid_until
        })

    def query_at_time(self, entity_id, property_name, at_time):
        """Query fact valid at specific time"""
        query = """
        MATCH (e:Entity {id: $entity_id})-[rel:HAS_PROPERTY {property: $property}]->(v)
        WHERE rel.valid_from <= $at_time
        AND (rel.valid_until IS NULL OR rel.valid_until > $at_time)
        RETURN rel.value as value, rel.valid_from, rel.valid_until
        ORDER BY rel.valid_from DESC
        LIMIT 1
        """
        results = self.graph.query(query, {
            "entity_id": entity_id,
            "property": property_name,
            "at_time": at_time
        })
        return results[0] if results else None

# Usage
temporal_graph = TemporalKGraph(graph_db)

# Store address change
temporal_graph.store_temporal_fact(
    entity_id="user_123",
    property_name="address",
    value="123 Main St",
    valid_from="2024-01-15",
    valid_until="2024-06-30"
)

temporal_graph.store_temporal_fact(
    entity_id="user_123",
    property_name="address",
    value="456 Oak Ave",
    valid_from="2024-07-01",
    valid_until=None
)

# Query
address_on_feb = temporal_graph.query_at_time("user_123", "address", "2024-02-15")
# Returns: "123 Main St"

address_on_aug = temporal_graph.query_at_time("user_123", "address", "2024-08-15")
# Returns: "456 Oak Ave"
```

**When to use:** Compliance, audit systems, time-aware reasoning

## Integration with Agent Context

### Just-in-Time Loading Pattern

```python
def enrich_context_with_memory(query, agent_memory):
    """Load only relevant memories for this query"""

    # 1. Extract entities from query
    entities = extract_entities(query)
    # → ["user_123", "product_456"]

    # 2. Load relevant facts
    facts = []
    for entity in entities:
        entity_data = agent_memory.get_entity(entity)
        if entity_data:
            facts.append(entity_data)

        # Get relationships
        rels = agent_memory.get_relationships(from_entity=entity)
        facts.extend(rels)

    # 3. Format for agent context
    context_text = format_facts_for_context(facts)

    # 4. Inject into agent prompt
    enriched_prompt = f"""
    Context from memory:
    {context_text}

    User query: {query}
    """

    return enriched_prompt

def format_facts_for_context(facts):
    """Format facts for agent readability"""
    lines = []
    for fact in facts:
        if fact.get('type') == 'entity':
            lines.append(f"Entity: {fact['id']} ({fact['type_name']})")
            for k, v in fact['properties'].items():
                lines.append(f"  - {k}: {v}")
        elif fact.get('type') == 'relationship':
            lines.append(f"Relationship: {fact['from']} -{fact['type']}-> {fact['to']}")
    return "\n".join(lines)
```

### Semantic Retrieval Pattern

```python
def enrich_context_semantic(query, vector_memory):
    """Use semantic search to find relevant memories"""

    # 1. Search for relevant memories
    results = vector_memory.search(
        query=query,
        top_k=5
    )

    # 2. Format results
    relevant_facts = [r['metadata'] for r in results]

    # 3. Inject into context
    context_text = "\n".join([
        f"Memory: {fact['text']}"
        for fact in relevant_facts
    ])

    enriched_prompt = f"""
    Relevant information from memory:
    {context_text}

    User query: {query}
    """

    return enriched_prompt
```

## Memory Update Workflow

After agent processes query and makes decisions:

```python
def update_memory_from_agent_interaction(agent_output, agent_memory, original_query):
    """Learn from agent interaction"""

    # 1. Extract new entities discovered
    new_entities = extract_entities(agent_output)
    for entity_id in new_entities:
        if not agent_memory.get_entity(entity_id):
            agent_memory.store_entity({
                "id": entity_id,
                "type": categorize_entity(entity_id),
                "discovered": now(),
                "source": original_query
            })

    # 2. Extract relationships
    relationships = extract_relationships(agent_output)
    for rel in relationships:
        agent_memory.store_relationship(rel)

    # 3. Update existing entities
    updated_facts = extract_fact_updates(agent_output)
    for fact in updated_facts:
        entity = agent_memory.get_entity(fact['entity_id'])
        if entity:
            entity['properties'].update(fact['updates'])
            entity['last_updated'] = now()
            agent_memory.update_entity(entity)

# Usage in agent loop
response = agent.process(query)
update_memory_from_agent_interaction(response, memory, query)
```

## Memory Consolidation Strategy

```python
def consolidate_memory(agent_memory, threshold_facts=10000):
    """Periodic memory consolidation"""

    # 1. Identify candidates for consolidation
    all_facts = agent_memory.get_all_facts()

    if len(all_facts) < threshold_facts:
        return  # Not needed yet

    # 2. Group facts by entity
    facts_by_entity = group_by_entity(all_facts)

    # 3. Consolidate facts about each entity
    for entity_id, facts in facts_by_entity.items():
        # Remove duplicates
        unique = deduplicate(facts)

        # Remove outdated
        current = [f for f in unique if not is_outdated(f)]

        # Summarize if too many
        if len(current) > 50:
            summary = summarize_facts(current)
            # Replace with summary
            agent_memory.replace_facts(entity_id, summary)

    # 4. Rebuild indexes
    agent_memory.rebuild_indexes()

    return {
        "facts_before": len(all_facts),
        "facts_after": len(agent_memory.get_all_facts()),
        "consolidation_percentage": (1 - len(agent_memory.get_all_facts()) / len(all_facts)) * 100
    }
```

## Performance Optimization

### Indexing Strategy

```python
# Index by entity_id for fast entity lookup
memory.create_index("entity_id", field="entity_id")

# Index by relationship type for traversal
memory.create_index("relationship_type", field="type")

# Index by timestamp for temporal queries
memory.create_index("timestamp", field="timestamp")

# Composite index for common queries
memory.create_composite_index(
    "user_purchases",
    fields=["entity_id", "type", "timestamp"]
)
```

### Caching Pattern

```python
from functools import lru_cache
import time

class CachedMemory:
    def __init__(self, base_memory, ttl_seconds=300):
        self.base = base_memory
        self.ttl = ttl_seconds
        self.cache = {}

    @lru_cache(maxsize=1000)
    def get_entity(self, entity_id):
        cached = self.cache.get(entity_id)
        if cached and time.time() - cached['time'] < self.ttl:
            return cached['data']

        # Cache miss, fetch from base
        data = self.base.get_entity(entity_id)
        if data:
            self.cache[entity_id] = {
                'data': data,
                'time': time.time()
            }
        return data
```

### Query Optimization

```python
# Bad: Retrieves all then filters
all_users = graph.query("MATCH (u:User) RETURN u")
filtered = [u for u in all_users if u.created > date]

# Good: Filter in query
filtered = graph.query("""
    MATCH (u:User)
    WHERE u.created > $date
    RETURN u
""", {"date": date})
```

## Monitoring and Maintenance

```python
def memory_health_report(agent_memory):
    """Generate memory health report"""

    start = time.time()

    all_facts = agent_memory.get_all_facts()
    entities = agent_memory.get_all_entities()
    relationships = agent_memory.get_all_relationships()

    outdated = [f for f in all_facts if is_outdated(f)]

    avg_query_time = measure_query_latency(agent_memory, samples=100)

    return {
        "total_facts": len(all_facts),
        "total_entities": len(entities),
        "total_relationships": len(relationships),
        "outdated_facts": len(outdated),
        "outdated_percentage": len(outdated) / len(all_facts) * 100,
        "avg_query_latency_ms": avg_query_time,
        "consolidation_needed": len(outdated) / len(all_facts) > 0.3,
        "generated_at": now()
    }

# Run daily
report = memory_health_report(memory)
if report['avg_query_latency_ms'] > 1000:
    print("WARNING: Query latency high, consolidate memory")
```

