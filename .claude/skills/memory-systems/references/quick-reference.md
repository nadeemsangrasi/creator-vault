# Memory Systems - Quick Reference

## Memory Architecture Patterns

### Pattern 1: Entity Storage
```python
# Store entity
entity = {
    "id": "user_123",
    "type": "customer",
    "properties": {
        "name": "John Doe",
        "email": "john@example.com"
    }
}
memory.store_entity(entity)

# Retrieve entity
entity = memory.get_entity("user_123")
```

### Pattern 2: Relationship Storage
```python
# Store relationship
memory.store_relationship(
    from_id="user_123",
    relationship_type="PURCHASED",
    to_id="product_456",
    properties={"date": "2024-01-15", "quantity": 1}
)

# Get relationships
rels = memory.get_relationships(from_id="user_123")
```

### Pattern 3: Temporal Fact Storage
```python
# Store fact with validity period
memory.store_temporal_fact(
    entity_id="user_123",
    property_name="address",
    value="123 Main St",
    valid_from="2024-01-01",
    valid_until="2024-06-30"
)

# Query at specific time
address = memory.get_temporal_fact("user_123", "address", "2024-03-15")
```

### Pattern 4: Semantic Search
```python
# Store with metadata
memory.store(
    text="Customer ordered laptop",
    metadata={
        "entity_id": "user_123",
        "type": "order"
    }
)

# Search semantically
results = memory.search("What did John order?", top_k=5)
```

## Storage Layer Implementations

### File System Storage
```python
import json
from pathlib import Path

class FileSystemMemory:
    def __init__(self, base_dir="memory"):
        self.base_dir = Path(base_dir)
        self.entities_dir = base_dir / "entities"
        self.entities_dir.mkdir(exist_ok=True)

    def store_entity(self, entity):
        path = self.entities_dir / f"{entity['id']}.json"
        with open(path, 'w') as f:
            json.dump(entity, f)

    def get_entity(self, entity_id):
        path = self.entities_dir / f"{entity_id}.json"
        if path.exists():
            with open(path) as f:
                return json.load(f)
        return None
```

### Vector Database Storage
```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class VectorMemory:
    def __init__(self):
        self.entries = []
        self.embeddings = np.array([]).reshape(0, 1536)

    def _embed_text(self, text):
        # In practice: use OpenAI or local embedding model
        return np.random.rand(1536)

    def store(self, text, metadata=None):
        embedding = self._embed_text(text)
        entry = {"text": text, "metadata": metadata, "embedding": embedding}
        self.entries.append(entry)
        self.embeddings = np.vstack([self.embeddings, embedding])

    def search(self, query, top_k=5):
        query_embedding = self._embed_text(query)
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [self.entries[i] for i in top_indices]
```

### Graph Database Storage
```python
from collections import defaultdict

class GraphMemory:
    def __init__(self):
        self.nodes = {}
        self.edges = defaultdict(lambda: defaultdict(set))

    def add_node(self, node_id, node_type, properties):
        self.nodes[node_id] = {
            "type": node_type,
            "properties": properties
        }

    def add_edge(self, from_id, rel_type, to_id):
        self.edges[from_id][rel_type].add(to_id)

    def get_neighbors(self, node_id, rel_type):
        return self.edges[node_id][rel_type]

    def query_path(self, start_id, end_id, max_depth=3):
        # BFS implementation for path finding
        queue = [(start_id, [start_id])]
        while queue:
            current_id, path = queue.pop(0)
            if len(path) > max_depth:
                continue
            if current_id == end_id:
                return path
            for rel_type, neighbors in self.edges[current_id].items():
                for neighbor in neighbors:
                    if neighbor not in path:
                        queue.append((neighbor, path + [neighbor]))
        return []
```

## Memory Integration Patterns

### Pattern 1: Just-in-Time Loading
```python
def enrich_context_with_memory(query, memory):
    # Extract entities from query
    entities = extract_entities(query)

    # Load relevant facts
    facts = []
    for entity in entities:
        entity_data = memory.get_entity(entity)
        if entity_data:
            facts.append(entity_data)

        # Get relationships
        rels = memory.get_relationships(from_entity=entity)
        facts.extend(rels)

    # Format for agent context
    context_text = format_facts_for_context(facts)
    return f"Context: {context_text}\nQuery: {query}"
```

### Pattern 2: Semantic Retrieval
```python
def retrieve_relevant_memory(query, vector_memory):
    # Search for relevant memories
    results = vector_memory.search(query, top_k=5)

    # Format results
    relevant_facts = [r['metadata'] for r in results]

    # Inject into context
    context_text = "\n".join([
        f"Memory: {fact['text']}"
        for fact in relevant_facts
    ])

    return f"Relevant info: {context_text}\nQuery: {query}"
```

### Pattern 3: Memory Update from Interaction
```python
def update_memory_from_interaction(agent_output, memory, original_query):
    # Extract new entities discovered
    new_entities = extract_entities(agent_output)
    for entity_id in new_entities:
        if not memory.get_entity(entity_id):
            memory.store_entity({
                "id": entity_id,
                "type": categorize_entity(entity_id),
                "properties": extract_properties(agent_output, entity_id)
            })

    # Extract relationships
    relationships = extract_relationships(agent_output)
    for rel in relationships:
        memory.store_relationship(**rel)

    # Update existing entities
    updated_facts = extract_fact_updates(agent_output)
    for fact in updated_facts:
        entity = memory.get_entity(fact['entity_id'])
        if entity:
            entity['properties'].update(fact['updates'])
            memory.update_entity(entity)
```

## Temporal Memory Patterns

### Pattern 1: Time-Aware Queries
```python
def query_at_time(entity_id, property_name, at_time, temporal_memory):
    """Query fact valid at specific time"""
    facts = temporal_memory.get_facts(entity_id, property_name)
    for fact in reversed(facts):  # Newest first
        if fact['valid_from'] <= at_time:
            if fact['valid_until'] is None or fact['valid_until'] > at_time:
                return fact['value']
    return None
```

### Pattern 2: Change Detection
```python
def detect_changes(entity_id, property_name, start_time, end_time, temporal_memory):
    """Detect changes to entity property in time range"""
    facts = temporal_memory.get_facts(entity_id, property_name)
    changes = []

    for fact in facts:
        if start_time <= fact['valid_from'] <= end_time:
            changes.append({
                "value": fact['value'],
                "valid_from": fact['valid_from'],
                "valid_until": fact['valid_until']
            })

    return changes
```

### Pattern 3: Historical Comparison
```python
def compare_at_times(entity_id, property_name, time1, time2, temporal_memory):
    """Compare same property at two different times"""
    value1 = temporal_memory.query_at_time(entity_id, property_name, time1)
    value2 = temporal_memory.query_at_time(entity_id, property_name, time2)

    return {
        "property": property_name,
        "entity_id": entity_id,
        f"value_at_{time1}": value1,
        f"value_at_{time2}": value2,
        "changed": value1 != value2
    }
```

## Performance Optimization

### Pattern 1: Caching
```python
from functools import lru_cache

class CachedMemory:
    def __init__(self, base_memory):
        self.base = base_memory

    @lru_cache(maxsize=1000)
    def get_entity(self, entity_id):
        return self.base.get_entity(entity_id)

    def clear_cache(self):
        self.get_entity.cache_clear()
```

### Pattern 2: Indexing
```python
class IndexedMemory:
    def __init__(self):
        self.entities = {}
        self.type_index = defaultdict(set)
        self.property_index = defaultdict(lambda: defaultdict(set))

    def store_entity(self, entity):
        entity_id = entity['id']
        self.entities[entity_id] = entity

        # Update indexes
        self.type_index[entity['type']].add(entity_id)

        for prop_key, prop_value in entity['properties'].items():
            self.property_index[prop_key][prop_value].add(entity_id)

    def find_by_type(self, entity_type):
        entity_ids = self.type_index[entity_type]
        return [self.entities[eid] for eid in entity_ids]

    def find_by_property(self, prop_key, prop_value):
        entity_ids = self.property_index[prop_key][prop_value]
        return [self.entities[eid] for eid in entity_ids]
```

### Pattern 3: Batch Operations
```python
def batch_store_entities(entities, memory):
    """Store multiple entities efficiently"""
    for entity in entities:
        memory.store_entity(entity)

def batch_query(entities, queries, memory):
    """Execute multiple queries efficiently"""
    results = {}
    for entity_id in entities:
        for query in queries:
            results[f"{entity_id}_{query}"] = memory.execute_query(entity_id, query)
    return results
```

## Memory Consolidation

### Pattern 1: Archiving Old Facts
```python
def archive_old_facts(memory, days_old=365):
    """Move facts older than N days to archive"""
    cutoff_date = datetime.now() - timedelta(days=days_old)

    old_facts = []
    for entity_id, facts in memory.get_all_facts().items():
        for fact in facts:
            if fact['created_at'] < cutoff_date.isoformat():
                old_facts.append((entity_id, fact))

    # Move to archive
    for entity_id, fact in old_facts:
        memory.archive_fact(entity_id, fact)
        memory.remove_fact(entity_id, fact)

    return len(old_facts)
```

### Pattern 2: Deduplication
```python
def deduplicate_entities(memory):
    """Remove duplicate entities"""
    entities = memory.get_all_entities()
    seen = {}
    to_remove = []

    for entity in entities:
        key = (entity['type'], tuple(sorted(entity['properties'].items())))
        if key in seen:
            to_remove.append(entity['id'])
        else:
            seen[key] = entity['id']

    for entity_id in to_remove:
        memory.delete_entity(entity_id)

    return len(to_remove)
```

### Pattern 3: Fact Compaction
```python
def compact_entity_facts(memory, entity_id, property_name, max_versions=10):
    """Keep only the most recent N versions of a fact"""
    facts = memory.get_facts(entity_id, property_name)
    if len(facts) > max_versions:
        # Keep most recent versions
        recent_facts = facts[-max_versions:]
        memory.replace_facts(entity_id, property_name, recent_facts)
        return len(facts) - len(recent_facts)
    return 0
```

## Monitoring and Health Checks

### Pattern 1: Memory Health Report
```python
def memory_health_report(memory):
    """Generate memory health report"""
    return {
        "total_entities": len(memory.get_all_entities()),
        "total_relationships": len(memory.get_all_relationships()),
        "total_facts": len(memory.get_all_facts()),
        "avg_query_time": measure_average_query_time(memory),
        "outdated_percentage": calculate_outdated_percentage(memory),
        "storage_size_mb": calculate_storage_size(memory),
        "last_updated": get_last_update_time(memory)
    }
```

### Pattern 2: Query Performance Measurement
```python
import time

def measure_query_performance(query_func, *args, iterations=100):
    """Measure query performance"""
    times = []
    for _ in range(iterations):
        start = time.time()
        result = query_func(*args)
        times.append((time.time() - start) * 1000)  # Convert to ms

    return {
        "avg_time_ms": sum(times) / len(times),
        "min_time_ms": min(times),
        "max_time_ms": max(times),
        "p95_time_ms": sorted(times)[int(0.95 * len(times))]
    }
```

### Pattern 3: Memory Growth Tracking
```python
def track_memory_growth(memory, baseline=None):
    """Track memory growth over time"""
    current_size = len(memory.get_all_facts())

    if baseline:
        growth = current_size - baseline
        growth_rate = growth / baseline if baseline > 0 else 0
        return {
            "current_size": current_size,
            "baseline_size": baseline,
            "growth": growth,
            "growth_rate": growth_rate
        }

    return {"current_size": current_size, "baseline": current_size}
```

## Error Handling

### Pattern 1: Graceful Degradation
```python
def memory_query_with_fallback(query, memory, fallback_memory=None):
    """Query primary memory, fall back to secondary if needed"""
    try:
        return memory.search(query)
    except Exception as e:
        if fallback_memory:
            print(f"Primary memory failed: {e}, using fallback")
            return fallback_memory.search(query)
        else:
            print(f"Memory query failed: {e}")
            return []
```

### Pattern 2: Memory Validation
```python
def validate_memory_integrity(memory):
    """Validate memory integrity"""
    issues = []

    # Check for orphaned relationships
    all_entities = set(memory.get_all_entities().keys())
    for rel in memory.get_all_relationships():
        if rel['from_id'] not in all_entities:
            issues.append(f"Orphaned relationship: {rel['from_id']} -> {rel['to_id']}")
        if rel['to_id'] not in all_entities:
            issues.append(f"Orphaned relationship: {rel['from_id']} -> {rel['to_id']}")

    # Check temporal consistency
    for entity_id, facts in memory.get_all_facts().items():
        for i in range(len(facts) - 1):
            if facts[i]['valid_until'] and facts[i]['valid_until'] > facts[i+1]['valid_from']:
                issues.append(f"Temporal overlap in {entity_id} facts")

    return issues
```

### Pattern 3: Backup and Recovery
```python
def backup_memory(memory, backup_path):
    """Create memory backup"""
    backup_data = {
        "entities": memory.get_all_entities(),
        "relationships": memory.get_all_relationships(),
        "facts": memory.get_all_facts(),
        "timestamp": datetime.now().isoformat()
    }

    with open(backup_path, 'w') as f:
        json.dump(backup_data, f, indent=2)

    return backup_path

def restore_memory(backup_path, memory):
    """Restore memory from backup"""
    with open(backup_path) as f:
        backup_data = json.load(f)

    memory.clear_all()

    for entity_id, entity in backup_data['entities'].items():
        memory.store_entity(entity)

    for rel in backup_data['relationships']:
        memory.store_relationship(**rel)

    for fact in backup_data['facts']:
        memory.store_fact(**fact)

    return len(backup_data['entities'])
```
