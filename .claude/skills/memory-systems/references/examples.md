# Memory Systems - Complete Implementation Examples

## Example 1: File System Memory for Agent Prototyping

Complete implementation using JSON files for entity and relationship tracking.

```python
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class FileSystemMemory:
    """
    Memory system using file system as storage layer.
    Perfect for prototyping and small-scale agent systems.
    """

    def __init__(self, base_dir: str = "agent_memory"):
        self.base_dir = Path(base_dir)
        self.entities_dir = self.base_dir / "entities"
        self.relationships_dir = self.base_dir / "relationships"
        self.temporal_dir = self.base_dir / "temporal"

        # Create directories
        for dir_path in [self.entities_dir, self.relationships_dir, self.temporal_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

    def store_entity(self, entity: Dict) -> bool:
        """Store an entity in the memory system."""
        entity_id = entity.get("id")
        if not entity_id:
            raise ValueError("Entity must have an 'id' field")

        path = self.entities_dir / f"{entity_id}.json"

        # Add timestamp
        entity["last_updated"] = datetime.now().isoformat()

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(entity, f, indent=2)

        return True

    def get_entity(self, entity_id: str) -> Optional[Dict]:
        """Retrieve an entity by ID."""
        path = self.entities_dir / f"{entity_id}.json"
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    def store_relationship(self, from_id: str, relationship_type: str, to_id: str,
                          properties: Optional[Dict] = None) -> bool:
        """Store a relationship between two entities."""
        # Create unique key for relationship
        key = f"{from_id}_{relationship_type}_{to_id}"
        path = self.relationships_dir / f"{key}.json"

        relationship = {
            "from_id": from_id,
            "type": relationship_type,
            "to_id": to_id,
            "properties": properties or {},
            "created_at": datetime.now().isoformat()
        }

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(relationship, f, indent=2)

        return True

    def get_relationships(self, from_id: Optional[str] = None,
                         relationship_type: Optional[str] = None,
                         to_id: Optional[str] = None) -> List[Dict]:
        """Get relationships matching criteria."""
        relationships = []

        for rel_file in self.relationships_dir.glob("*.json"):
            with open(rel_file, 'r', encoding='utf-8') as f:
                rel = json.load(f)

            matches = True
            if from_id and rel['from_id'] != from_id:
                matches = False
            if relationship_type and rel['type'] != relationship_type:
                matches = False
            if to_id and rel['to_id'] != to_id:
                matches = False

            if matches:
                relationships.append(rel)

        return relationships

    def store_temporal_fact(self, entity_id: str, property_name: str, value,
                           valid_from: str, valid_until: Optional[str] = None) -> bool:
        """Store a fact with temporal validity."""
        path = self.temporal_dir / f"{entity_id}_{property_name}.json"

        # Load existing facts or create new list
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                facts = json.load(f)
        else:
            facts = []

        # Add new fact
        fact = {
            "property": property_name,
            "value": value,
            "valid_from": valid_from,
            "valid_until": valid_until,
            "stored_at": datetime.now().isoformat()
        }

        facts.append(fact)

        # Sort by valid_from (oldest first)
        facts.sort(key=lambda x: x['valid_from'])

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(facts, f, indent=2)

        return True

    def get_temporal_fact(self, entity_id: str, property_name: str, at_time: str) -> Optional:
        """Get a fact valid at a specific time."""
        path = self.temporal_dir / f"{entity_id}_{property_name}.json"
        if not path.exists():
            return None

        with open(path, 'r', encoding='utf-8') as f:
            facts = json.load(f)

        # Find fact valid at the given time
        for fact in reversed(facts):  # Newest first
            if fact['valid_from'] <= at_time:
                if fact['valid_until'] is None or fact['valid_until'] > at_time:
                    return fact['value']

        return None

    def search_entities(self, entity_type: Optional[str] = None,
                      property_filter: Optional[Dict] = None) -> List[Dict]:
        """Search entities by type and properties."""
        entities = []

        for entity_file in self.entities_dir.glob("*.json"):
            with open(entity_file, 'r', encoding='utf-8') as f:
                entity = json.load(f)

            matches = True
            if entity_type and entity.get('type') != entity_type:
                matches = False
            if property_filter:
                for prop_key, prop_value in property_filter.items():
                    if entity.get('properties', {}).get(prop_key) != prop_value:
                        matches = False
                        break

            if matches:
                entities.append(entity)

        return entities

# Example usage
def example_file_system_memory():
    """Demonstrate file system memory usage."""
    memory = FileSystemMemory()

    # Store entities
    user_entity = {
        "id": "user_123",
        "type": "customer",
        "properties": {
            "name": "John Doe",
            "email": "john@example.com",
            "joined_date": "2024-01-15"
        }
    }
    memory.store_entity(user_entity)

    product_entity = {
        "id": "product_456",
        "type": "product",
        "properties": {
            "name": "Laptop Pro",
            "category": "electronics",
            "price": 1299.99
        }
    }
    memory.store_entity(product_entity)

    # Store relationship
    memory.store_relationship(
        from_id="user_123",
        relationship_type="PURCHASED",
        to_id="product_456",
        properties={"date": "2024-01-20", "quantity": 1}
    )

    # Store temporal fact
    memory.store_temporal_fact(
        entity_id="user_123",
        property_name="address",
        value="123 Main St",
        valid_from="2024-01-01",
        valid_until="2024-06-30"
    )

    memory.store_temporal_fact(
        entity_id="user_123",
        property_name="address",
        value="456 Oak Ave",
        valid_from="2024-07-01"
    )

    # Retrieve data
    print("User:", memory.get_entity("user_123"))
    print("Relationships:", memory.get_relationships(from_id="user_123"))
    print("Address on 2024-03-15:", memory.get_temporal_fact("user_123", "address", "2024-03-15"))
    print("Address on 2024-08-15:", memory.get_temporal_fact("user_123", "address", "2024-08-15"))

if __name__ == "__main__":
    example_file_system_memory()
```

## Example 2: Knowledge Graph with Relationship Queries

Complete implementation using in-memory graph structure for relationship-based queries.

```python
from collections import defaultdict
from typing import Dict, List, Set, Optional, Any
import json

class KnowledgeGraphMemory:
    """
    Memory system using in-memory graph structure for relationship queries.
    Perfect for systems that need to answer "what else?" questions.
    """

    def __init__(self):
        # Nodes: entity_id -> entity data
        self.nodes: Dict[str, Dict[str, Any]] = {}

        # Edges: from_id -> relationship_type -> to_ids
        self.edges: Dict[str, Dict[str, Set[str]]] = defaultdict(lambda: defaultdict(set))

        # Reverse edges: to_id -> relationship_type -> from_ids
        self.reverse_edges: Dict[str, Dict[str, Set[str]]] = defaultdict(lambda: defaultdict(set))

        # Indexes for fast queries
        self.type_index: Dict[str, Set[str]] = defaultdict(set)
        self.property_index: Dict[str, Dict[Any, Set[str]]] = defaultdict(lambda: defaultdict(set))

    def add_node(self, node_id: str, node_type: str, properties: Optional[Dict] = None) -> bool:
        """Add a node to the graph."""
        properties = properties or {}

        self.nodes[node_id] = {
            "id": node_id,
            "type": node_type,
            "properties": properties,
            "created_at": self._now_iso()
        }

        # Update indexes
        self.type_index[node_type].add(node_id)

        for prop_key, prop_value in properties.items():
            self.property_index[prop_key][prop_value].add(node_id)

        return True

    def add_edge(self, from_id: str, relationship_type: str, to_id: str,
                 properties: Optional[Dict] = None) -> bool:
        """Add a directed edge between nodes."""
        if from_id not in self.nodes or to_id not in self.nodes:
            raise ValueError("Both nodes must exist before creating edge")

        properties = properties or {}

        # Add forward edge
        self.edges[from_id][relationship_type].add(to_id)

        # Add reverse edge for backward traversal
        self.reverse_edges[to_id][relationship_type].add(from_id)

        return True

    def get_node(self, node_id: str) -> Optional[Dict]:
        """Get node by ID."""
        return self.nodes.get(node_id)

    def get_neighbors(self, node_id: str, relationship_type: Optional[str] = None,
                     direction: str = "outgoing") -> List[Dict]:
        """Get neighbors of a node."""
        if direction == "outgoing":
            edges = self.edges[node_id]
        else:
            edges = self.reverse_edges[node_id]

        neighbor_ids = set()
        if relationship_type:
            neighbor_ids = edges.get(relationship_type, set())
        else:
            for rel_type, ids in edges.items():
                neighbor_ids.update(ids)

        return [self.nodes[nid] for nid in neighbor_ids if nid in self.nodes]

    def find_by_type(self, node_type: str) -> List[Dict]:
        """Find all nodes of a specific type."""
        node_ids = self.type_index.get(node_type, set())
        return [self.nodes[nid] for nid in node_ids if nid in self.nodes]

    def find_by_property(self, property_name: str, property_value: Any) -> List[Dict]:
        """Find all nodes with specific property value."""
        node_ids = self.property_index[property_name].get(property_value, set())
        return [self.nodes[nid] for nid in node_ids if nid in self.nodes]

    def query_path(self, start_id: str, end_id: str, max_depth: int = 3) -> List[List[str]]:
        """Find paths between two nodes up to max_depth."""
        if start_id == end_id:
            return [[start_id]]

        # BFS to find all paths
        queue = [(start_id, [start_id])]
        all_paths = []

        while queue:
            current_id, path = queue.pop(0)

            if len(path) > max_depth:
                continue

            if current_id == end_id:
                all_paths.append(path)
                continue

            # Get all neighbors
            neighbors = set()
            for rel_type, ids in self.edges[current_id].items():
                neighbors.update(ids)

            for neighbor_id in neighbors:
                if neighbor_id not in path:  # Avoid cycles
                    new_path = path + [neighbor_id]
                    queue.append((neighbor_id, new_path))

        return all_paths

    def recommend_similar_entities(self, entity_id: str, max_results: int = 5) -> List[Dict]:
        """Recommend entities similar to the given entity."""
        if entity_id not in self.nodes:
            return []

        entity = self.nodes[entity_id]
        entity_type = entity['type']

        # Get all other entities of the same type
        others = [n for n in self.find_by_type(entity_type) if n['id'] != entity_id]

        # Score based on shared relationships
        scores = {}
        for other in others:
            score = 0
            # Check for similar relationships
            for rel_type, ids in self.edges[entity_id].items():
                other_ids = self.edges[other['id']].get(rel_type, set())
                intersection = ids.intersection(other_ids)
                score += len(intersection) * 2  # Weight direct relationships heavily

            # Check for shared properties
            for prop_key, prop_value in entity['properties'].items():
                if other['properties'].get(prop_key) == prop_value:
                    score += 1

            scores[other['id']] = score

        # Sort by score and return top results
        sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:max_results]
        return [self.nodes[score[0]] for score in sorted_results]

    def _now_iso(self) -> str:
        """Get current time in ISO format."""
        from datetime import datetime
        return datetime.now().isoformat()

# Example usage
def example_knowledge_graph_memory():
    """Demonstrate knowledge graph memory usage."""
    graph = KnowledgeGraphMemory()

    # Add users
    graph.add_node("user_123", "user", {
        "name": "Alice",
        "age": 30,
        "city": "New York"
    })

    graph.add_node("user_456", "user", {
        "name": "Bob",
        "age": 35,
        "city": "Boston"
    })

    graph.add_node("user_789", "user", {
        "name": "Charlie",
        "age": 28,
        "city": "New York"
    })

    # Add products
    graph.add_node("prod_abc", "product", {
        "name": "Laptop",
        "category": "electronics",
        "price": 1299.99
    })

    graph.add_node("prod_def", "product", {
        "name": "Book",
        "category": "education",
        "price": 29.99
    })

    # Add relationships
    graph.add_edge("user_123", "PURCHASED", "prod_abc")
    graph.add_edge("user_123", "FRIEND_OF", "user_456")
    graph.add_edge("user_456", "PURCHASED", "prod_abc")
    graph.add_edge("user_456", "PURCHASED", "prod_def")
    graph.add_edge("user_789", "PURCHASED", "prod_def")

    # Query: Find what Alice purchased
    alice_purchases = graph.get_neighbors("user_123", "PURCHASED")
    print("Alice purchases:", [p['properties']['name'] for p in alice_purchases])

    # Query: Find friends of Alice
    alice_friends = graph.get_neighbors("user_123", "FRIEND_OF")
    print("Alice friends:", [f['properties']['name'] for f in alice_friends])

    # Query: Find people in New York
    ny_users = graph.find_by_property("city", "New York")
    print("NY users:", [u['properties']['name'] for u in ny_users])

    # Query: Recommend similar users to Alice
    recommendations = graph.recommend_similar_entities("user_123", 2)
    print("Similar to Alice:", [r['properties']['name'] for r in recommendations])

    # Query: Find paths between Alice and Book
    paths = graph.query_path("user_123", "prod_def", max_depth=3)
    print("Paths from Alice to Book:", paths)

if __name__ == "__main__":
    example_knowledge_graph_memory()
```

## Example 3: Temporal Knowledge Graph for Audit Systems

Complete implementation with temporal fact tracking for compliance and audit scenarios.

```python
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict
import bisect

class TemporalKnowledgeGraph:
    """
    Memory system with temporal validity tracking.
    Perfect for compliance, audit trails, and time-aware reasoning.
    """

    def __init__(self):
        # Entity facts with temporal validity
        self.entity_facts: Dict[str, Dict[str, List[Tuple[str, str, Any]]]] = defaultdict(
            lambda: defaultdict(list)
        )

        # Relationship facts with temporal validity
        self.relationship_facts: Dict[str, List[Tuple[str, str, str, Dict[str, Any]]]] = defaultdict(list)

        # Temporal indexes for efficient queries
        self.temporal_index: Dict[str, List[Tuple[str, str, str, Any]]] = defaultdict(list)

    def store_entity_fact(self, entity_id: str, property_name: str, value: Any,
                         valid_from: str, valid_until: Optional[str] = None) -> bool:
        """Store a fact about an entity with temporal validity."""

        # Store in entity facts
        facts_list = self.entity_facts[entity_id][property_name]
        fact_tuple = (valid_from, valid_until or "", value)

        # Insert in chronological order
        pos = bisect.bisect_left(facts_list, fact_tuple)
        facts_list.insert(pos, fact_tuple)

        # Store in temporal index
        self.temporal_index[entity_id].append((valid_from, valid_until or "", property_name, value))
        self.temporal_index[entity_id].sort()

        return True

    def store_relationship_fact(self, from_id: str, relationship_type: str, to_id: str,
                              properties: Optional[Dict] = None,
                              valid_from: str, valid_until: Optional[str] = None) -> bool:
        """Store a relationship fact with temporal validity."""

        fact_tuple = (valid_from, valid_until or "", relationship_type, {
            "from_id": from_id,
            "to_id": to_id,
            "properties": properties or {}
        })

        self.relationship_facts[f"{from_id}_{relationship_type}_{to_id}"].append(fact_tuple)

        return True

    def get_entity_fact_at_time(self, entity_id: str, property_name: str, at_time: str) -> Optional[Any]:
        """Get the value of an entity property at a specific time."""

        facts_list = self.entity_facts[entity_id][property_name]
        if not facts_list:
            return None

        # Find the fact valid at the given time
        for valid_from, valid_until, value in reversed(facts_list):
            if valid_from <= at_time:
                if not valid_until or valid_until > at_time:
                    return value

        return None

    def get_entity_history(self, entity_id: str, property_name: str) -> List[Dict[str, Any]]:
        """Get the history of changes to an entity property."""

        facts_list = self.entity_facts[entity_id][property_name]
        history = []

        for valid_from, valid_until, value in facts_list:
            history.append({
                "value": value,
                "valid_from": valid_from,
                "valid_until": valid_until or None
            })

        return history

    def query_temporal_range(self, entity_id: str, property_name: str,
                           start_time: str, end_time: str) -> List[Dict[str, Any]]:
        """Get all fact changes for an entity property in a time range."""

        facts_list = self.entity_facts[entity_id][property_name]
        results = []

        for valid_from, valid_until, value in facts_list:
            # Check if this fact overlaps with the query range
            if (valid_from <= end_time and
                (not valid_until or valid_until >= start_time)):

                results.append({
                    "value": value,
                    "valid_from": valid_from,
                    "valid_until": valid_until or None
                })

        return results

    def find_entities_with_change_during(self, property_name: str,
                                       start_time: str, end_time: str) -> List[str]:
        """Find all entities that had a property change during the time period."""

        entities = set()

        for entity_id, properties in self.entity_facts.items():
            if property_name in properties:
                for valid_from, valid_until, value in properties[property_name]:
                    if (valid_from <= end_time and
                        (not valid_until or valid_until >= start_time)):
                        entities.add(entity_id)
                        break

        return list(entities)

    def get_active_relationships_at_time(self, entity_id: str,
                                       relationship_type: Optional[str] = None,
                                       at_time: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get active relationships for an entity at a specific time."""

        current_time = at_time or datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        relationships = []

        for rel_key, facts_list in self.relationship_facts.items():
            for valid_from, valid_until, rel_type, details in facts_list:
                # Check if this relationship is active at the given time
                if valid_from <= current_time and (not valid_until or valid_until > current_time):
                    # Check if this relationship involves our entity
                    if (details['from_id'] == entity_id or details['to_id'] == entity_id) and \
                       (not relationship_type or rel_type == relationship_type):
                        relationships.append({
                            "from_id": details['from_id'],
                            "to_id": details['to_id'],
                            "type": rel_type,
                            "properties": details['properties'],
                            "valid_from": valid_from,
                            "valid_until": valid_until or None
                        })

        return relationships

    def compare_entities_at_different_times(self, entity_id: str, property_name: str,
                                          time1: str, time2: str) -> Dict[str, Any]:
        """Compare the same entity property at two different times."""

        value1 = self.get_entity_fact_at_time(entity_id, property_name, time1)
        value2 = self.get_entity_fact_at_time(entity_id, property_name, time2)

        return {
            "property": property_name,
            "entity_id": entity_id,
            f"value_at_{time1}": value1,
            f"value_at_{time2}": value2,
            "changed": value1 != value2
        }

    def get_audit_log(self, entity_id: str, start_time: str, end_time: str) -> List[Dict[str, Any]]:
        """Get all changes to an entity during a time period."""

        audit_log = []

        for property_name, facts_list in self.entity_facts[entity_id].items():
            for valid_from, valid_until, value in facts_list:
                # Check if this fact falls in the audit period
                if valid_from <= end_time and (not valid_until or valid_until >= start_time):
                    audit_log.append({
                        "entity_id": entity_id,
                        "property": property_name,
                        "operation": "UPDATE" if valid_from >= start_time and \
                                    (not valid_until or valid_until <= end_time) else "EXISTING",
                        "value": value,
                        "timestamp": valid_from
                    })

        # Sort by timestamp
        audit_log.sort(key=lambda x: x['timestamp'])

        return audit_log

# Example usage
def example_temporal_knowledge_graph():
    """Demonstrate temporal knowledge graph usage."""
    temporal_graph = TemporalKnowledgeGraph()

    # Track user address changes over time
    temporal_graph.store_entity_fact(
        entity_id="user_123",
        property_name="address",
        value="123 Main St",
        valid_from="2024-01-01T00:00:00",
        valid_until="2024-06-30T23:59:59"
    )

    temporal_graph.store_entity_fact(
        entity_id="user_123",
        property_name="address",
        value="456 Oak Ave",
        valid_from="2024-07-01T00:00:00"
    )

    # Track employment status
    temporal_graph.store_entity_fact(
        entity_id="user_123",
        property_name="employment_status",
        value="employed",
        valid_from="2024-01-01T00:00:00",
        valid_until="2024-12-31T23:59:59"
    )

    temporal_graph.store_entity_fact(
        entity_id="user_123",
        property_name="employment_status",
        value="contractor",
        valid_from="2025-01-01T00:00:00"
    )

    # Track permissions
    temporal_graph.store_entity_fact(
        entity_id="user_123",
        property_name="permissions",
        value=["read", "write"],
        valid_from="2024-01-01T00:00:00",
        valid_until="2024-03-31T23:59:59"
    )

    temporal_graph.store_entity_fact(
        entity_id="user_123",
        property_name="permissions",
        value=["read", "write", "admin"],
        valid_from="2024-04-01T00:00:00"
    )

    # Query address at different times
    addr_jan = temporal_graph.get_entity_fact_at_time("user_123", "address", "2024-02-15T12:00:00")
    addr_aug = temporal_graph.get_entity_fact_at_time("user_123", "address", "2024-08-15T12:00:00")

    print(f"Address in January: {addr_jan}")
    print(f"Address in August: {addr_aug}")

    # Get history
    addr_history = temporal_graph.get_entity_history("user_123", "address")
    print("Address history:", addr_history)

    # Audit log for January 2024
    jan_audit = temporal_graph.get_audit_log("user_123", "2024-01-01T00:00:00", "2024-01-31T23:59:59")
    print("January 2024 audit:", jan_audit)

    # Compare at two different times
    comparison = temporal_graph.compare_entities_at_different_times(
        "user_123", "permissions",
        "2024-02-01T00:00:00",
        "2024-06-01T00:00:00"
    )
    print("Permissions change:", comparison)

if __name__ == "__main__":
    example_temporal_knowledge_graph()
```

## Example 4: Vector Memory with Semantic Search

Complete implementation using vector embeddings for semantic memory retrieval.

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional, Tuple
import json
from datetime import datetime

class VectorMemory:
    """
    Memory system using vector embeddings for semantic search.
    Perfect for document retrieval and semantic similarity.
    """

    def __init__(self):
        # Memory entries with embeddings and metadata
        self.entries: List[Dict] = []
        self.embeddings: np.ndarray = np.array([]).reshape(0, 1536)  # Assuming 1536-dim embeddings

    def _embed_text(self, text: str) -> np.ndarray:
        """Create embedding for text. In practice, use OpenAI or local model."""
        # Placeholder embedding function
        # In real implementation: return client.embeddings.create(input=text).data[0].embedding
        import hashlib
        # Deterministic but fake embedding for demo
        hash_val = int(hashlib.sha256(text.encode()).hexdigest()[:16], 16)
        embedding = np.random.RandomState(seed=hash_val).rand(1536).astype(np.float32)
        return embedding

    def store(self, text: str, metadata: Optional[Dict] = None, entry_id: Optional[str] = None) -> str:
        """Store text with metadata and return ID."""

        entry_id = entry_id or f"entry_{len(self.entries)}"

        embedding = self._embed_text(text)

        entry = {
            "id": entry_id,
            "text": text,
            "metadata": metadata or {},
            "embedding": embedding,
            "timestamp": datetime.now().isoformat()
        }

        self.entries.append(entry)

        # Add to embeddings matrix
        if self.embeddings.size == 0:
            self.embeddings = embedding.reshape(1, -1)
        else:
            self.embeddings = np.vstack([self.embeddings, embedding])

        return entry_id

    def search(self, query: str, top_k: int = 5, filters: Optional[Dict] = None) -> List[Dict]:
        """Search for entries similar to query."""

        query_embedding = self._embed_text(query)

        # Calculate similarities
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]

        # Get top-k indices
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        results = []
        for idx in top_indices:
            similarity = similarities[idx]
            entry = self.entries[idx]

            # Apply filters
            if filters:
                matches = True
                for key, value in filters.items():
                    if entry['metadata'].get(key) != value:
                        matches = False
                        break

                if not matches:
                    continue

            results.append({
                "id": entry['id'],
                "text": entry['text'],
                "metadata": entry['metadata'],
                "similarity": float(similarity),
                "timestamp": entry['timestamp']
            })

        return results

    def update_entry(self, entry_id: str, new_text: Optional[str] = None,
                    new_metadata: Optional[Dict] = None) -> bool:
        """Update an existing entry."""

        for i, entry in enumerate(self.entries):
            if entry['id'] == entry_id:
                if new_text:
                    entry['text'] = new_text
                    # Update embedding
                    new_embedding = self._embed_text(new_text)
                    self.embeddings[i] = new_embedding
                if new_metadata:
                    entry['metadata'].update(new_metadata)

                entry['timestamp'] = datetime.now().isoformat()
                return True

        return False

    def delete_entry(self, entry_id: str) -> bool:
        """Delete an entry from memory."""

        for i, entry in enumerate(self.entries):
            if entry['id'] == entry_id:
                # Remove from entries
                self.entries.pop(i)

                # Remove from embeddings
                self.embeddings = np.delete(self.embeddings, i, axis=0)

                return True

        return False

    def get_stats(self) -> Dict[str, int]:
        """Get statistics about memory."""

        return {
            "total_entries": len(self.entries),
            "embedding_dimension": self.embeddings.shape[1] if self.embeddings.size > 0 else 0,
            "last_updated": max((e['timestamp'] for e in self.entries), default=None)
        }

    def search_with_filters(self, query: str, top_k: int = 5,
                          entity_filter: Optional[str] = None,
                          type_filter: Optional[str] = None) -> List[Dict]:
        """Search with specific filters for entity-based memory."""

        filters = {}
        if entity_filter:
            filters['entity_id'] = entity_filter
        if type_filter:
            filters['type'] = type_filter

        return self.search(query, top_k, filters)

# Example usage
def example_vector_memory():
    """Demonstrate vector memory usage."""
    memory = VectorMemory()

    # Store some customer service conversations
    memory.store(
        text="Customer John Smith ordered laptop, tracking number 12345",
        metadata={
            "entity_id": "customer_123",
            "type": "order",
            "priority": "high"
        }
    )

    memory.store(
        text="Customer Jane Doe returned defective headphones, refund issued",
        metadata={
            "entity_id": "customer_456",
            "type": "return",
            "priority": "medium"
        }
    )

    memory.store(
        text="Customer John Smith requested status on order 12345, provided shipping update",
        metadata={
            "entity_id": "customer_123",
            "type": "followup",
            "priority": "low"
        }
    )

    memory.store(
        text="Customer Bob Johnson placed order for monitor, payment confirmed",
        metadata={
            "entity_id": "customer_789",
            "type": "order",
            "priority": "high"
        }
    )

    # Semantic search
    results = memory.search("What did John order?", top_k=2)
    print("Results for 'What did John order?':")
    for result in results:
        print(f"  {result['similarity']:.3f}: {result['text']}")

    # Search with filters
    john_results = memory.search_with_filters(
        query="What happened with customer's order?",
        entity_filter="customer_123",
        top_k=3
    )
    print("\nJohn's interactions:")
    for result in john_results:
        print(f"  {result['metadata']['type']}: {result['text']}")

    # Stats
    stats = memory.get_stats()
    print(f"\nMemory stats: {stats}")

if __name__ == "__main__":
    example_vector_memory()
```

## Example 5: Memory-Enabled Agent Integration

Complete example showing how to integrate memory with an agent system.

```python
from typing import Dict, List, Any
import json
from datetime import datetime

class MemoryEnrichedAgent:
    """
    Example agent that integrates with memory systems.
    """

    def __init__(self, memory_system):
        self.memory = memory_system
        self.conversation_history = []

    def process_query(self, user_query: str, user_id: str) -> str:
        """Process user query with memory integration."""

        # 1. Enrich query with relevant memories
        enriched_context = self._enrich_with_memory(user_query, user_id)

        # 2. Generate response (simplified - in practice, call LLM)
        response = self._generate_response(user_query, enriched_context)

        # 3. Learn from interaction
        self._learn_from_interaction(user_query, response, user_id)

        # 4. Update conversation history
        self.conversation_history.append({
            "user_query": user_query,
            "response": response,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        })

        return response

    def _enrich_with_memory(self, query: str, user_id: str) -> str:
        """Enrich query with relevant memories."""

        context_parts = []

        # Get user's recent interactions
        if hasattr(self.memory, 'search_with_filters'):
            # For vector memory
            user_interactions = self.memory.search_with_filters(
                query=f"interactions by {user_id}",
                entity_filter=user_id,
                top_k=5
            )
            if user_interactions:
                recent_info = "Recent interactions: " + "; ".join([
                    f"{item['text']}" for item in user_interactions
                ])
                context_parts.append(recent_info)

        elif hasattr(self.memory, 'get_entity'):
            # For file system or graph memory
            user_entity = self.memory.get_entity(user_id)
            if user_entity:
                context_parts.append(f"User profile: {json.dumps(user_entity.get('properties', {}))}")

            # Get recent relationships
            recent_rels = self.memory.get_relationships(from_id=user_id, relationship_type="INTERACTED")
            if recent_rels:
                rel_info = f"Recent activities: {[r['properties'] for r in recent_rels[:3]]}"
                context_parts.append(rel_info)

        return "\n".join(context_parts) if context_parts else "No prior context available."

    def _generate_response(self, query: str, context: str) -> str:
        """Generate response using query and context (placeholder)."""
        # In practice, call LLM with context + query
        return f"Based on your query '{query}' and context '{context[:100]}...', I can help with that!"

    def _learn_from_interaction(self, query: str, response: str, user_id: str):
        """Learn from the interaction and update memory."""

        # Store the interaction in memory
        interaction_data = {
            "query": query,
            "response": response,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }

        if hasattr(self.memory, 'store'):  # Vector memory
            self.memory.store(
                text=f"Interaction: {query} -> {response}",
                metadata={
                    "user_id": user_id,
                    "type": "conversation",
                    "query": query,
                    "timestamp": datetime.now().isoformat()
                }
            )
        elif hasattr(self.memory, 'store_entity'):  # File system memory
            self.memory.store_entity({
                "id": f"interaction_{datetime.now().timestamp()}",
                "type": "conversation",
                "properties": interaction_data
            })

# Example usage
def example_agent_integration():
    """Demonstrate memory-integrated agent."""

    # Use file system memory for this example
    from pathlib import Path
    import shutil

    # Clean up any existing memory
    memory_dir = Path("test_agent_memory")
    if memory_dir.exists():
        shutil.rmtree(memory_dir)

    memory = FileSystemMemory("test_agent_memory")

    # Add some initial user data
    memory.store_entity({
        "id": "user_123",
        "type": "customer",
        "properties": {
            "name": "John Doe",
            "preferred_contact": "email",
            "last_purchase_date": "2024-01-15"
        }
    })

    # Create agent with memory
    agent = MemoryEnrichedAgent(memory)

    # Process some queries
    response1 = agent.process_query("What's my preferred contact method?", "user_123")
    print("Response 1:", response1)

    response2 = agent.process_query("I want to change my email", "user_123")
    print("Response 2:", response2)

    response3 = agent.process_query("When did I last purchase?", "user_123")
    print("Response 3:", response3)

if __name__ == "__main__":
    example_agent_integration()
```

## Example 6: Memory Consolidation System

Complete implementation of memory consolidation for maintaining healthy memory systems.

```python
from datetime import datetime, timedelta
from typing import Dict, List, Set
import json

class MemoryConsolidator:
    """
    System for consolidating and maintaining memory systems.
    """

    def __init__(self, memory_system):
        self.memory = memory_system
        self.consolidation_rules = []

    def register_consolidation_rule(self, rule_name: str, condition_func, action_func):
        """Register a consolidation rule."""
        self.consolidation_rules.append({
            "name": rule_name,
            "condition": condition_func,
            "action": action_func
        })

    def run_consolidation(self) -> Dict[str, Any]:
        """Run all consolidation rules."""

        results = {
            "rules_run": 0,
            "changes_made": 0,
            "summary": [],
            "timestamp": datetime.now().isoformat()
        }

        for rule in self.consolidation_rules:
            try:
                if rule['condition'](self.memory):
                    changes = rule['action'](self.memory)
                    results['rules_run'] += 1
                    results['changes_made'] += changes if isinstance(changes, int) else 0
                    results['summary'].append({
                        "rule": rule['name'],
                        "changes": changes,
                        "applied": True
                    })
                else:
                    results['rules_run'] += 1
                    results['summary'].append({
                        "rule": rule['name'],
                        "applied": False
                    })
            except Exception as e:
                results['summary'].append({
                    "rule": rule['name'],
                    "error": str(e),
                    "applied": False
                })

        return results

    def setup_default_rules(self):
        """Set up default consolidation rules."""

        # Rule 1: Archive outdated temporal facts
        def is_outdated_threshold_exceeded(mem):
            # Check if more than 30% of facts are outdated
            if hasattr(mem, 'entity_facts'):
                outdated_count = 0
                total_count = 0
                for entity_id, properties in mem.entity_facts.items():
                    for prop_name, facts in properties.items():
                        for valid_from, valid_until, value in facts:
                            if valid_until and valid_until < datetime.now().strftime("%Y-%m-%dT%H:%M:%S"):
                                outdated_count += 1
                            total_count += 1
                return (outdated_count / total_count if total_count > 0 else 0) > 0.3
            return False

        def archive_outdated_facts(mem):
            if not hasattr(mem, 'entity_facts'):
                return 0

            current_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            archived_count = 0

            for entity_id, properties in mem.entity_facts.items():
                for prop_name, facts in properties.items():
                    new_facts = []
                    for valid_from, valid_until, value in facts:
                        if valid_until and valid_until < current_time:
                            # Archive this fact
                            self._archive_fact(entity_id, prop_name, value, valid_from, valid_until)
                            archived_count += 1
                        else:
                            new_facts.append((valid_from, valid_until, value))
                    mem.entity_facts[entity_id][prop_name] = new_facts

            return archived_count

        self.register_consolidation_rule(
            "archive_outdated_facts",
            is_outdated_threshold_exceeded,
            archive_outdated_facts
        )

        # Rule 2: Remove duplicate entities (based on similarity)
        def has_duplicate_entities(mem):
            if hasattr(mem, 'nodes'):
                # For graph memory
                user_nodes = [n for n in mem.nodes.values() if n['type'] == 'user']
                return len(user_nodes) > 1
            elif hasattr(mem, 'get_entity'):
                # For file system memory
                # This is a simplified check
                return False
            return False

        def deduplicate_entities(mem):
            # Simplified de-duplication logic
            if hasattr(mem, 'nodes'):
                # Remove nodes with same email (example)
                emails_used = set()
                to_remove = []

                for node_id, node in list(mem.nodes.items()):
                    if node['type'] == 'user':
                        email = node['properties'].get('email')
                        if email and email in emails_used:
                            to_remove.append(node_id)
                        else:
                            emails_used.add(email)

                for node_id in to_remove:
                    del mem.nodes[node_id]

                return len(to_remove)
            return 0

        self.register_consolidation_rule(
            "deduplicate_entities",
            has_duplicate_entities,
            deduplicate_entities
        )

        # Rule 3: Compact temporal facts
        def has_multiple_temporal_values(mem):
            if hasattr(mem, 'entity_facts'):
                for entity_id, properties in mem.entity_facts.items():
                    for prop_name, facts in properties.items():
                        if len(facts) > 10:  # Too many changes for one property
                            return True
            return False

        def compact_temporal_values(mem):
            if not hasattr(mem, 'entity_facts'):
                return 0

            compacted_count = 0
            for entity_id, properties in mem.entity_facts.items():
                for prop_name, facts in properties.items():
                    if len(facts) > 10:  # Compact if too many
                        # Keep most recent 5 facts
                        mem.entity_facts[entity_id][prop_name] = facts[-5:]
                        compacted_count += len(facts) - 5

            return compacted_count

        self.register_consolidation_rule(
            "compact_temporal_values",
            has_multiple_temporal_values,
            compact_temporal_values
        )

    def _archive_fact(self, entity_id: str, property_name: str, value, valid_from: str, valid_until: str):
        """Archive a fact (in practice, move to long-term storage)."""
        # In practice, save to archive storage
        print(f"Archiving fact: {entity_id}.{property_name} = {value} ({valid_from} to {valid_until})")

# Example usage
def example_memory_consolidation():
    """Demonstrate memory consolidation."""

    # Create temporal memory with some outdated facts
    temporal_mem = TemporalKnowledgeGraph()

    # Add some current facts
    temporal_mem.store_entity_fact(
        entity_id="user_123",
        property_name="address",
        value="123 Current St",
        valid_from=datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    )

    # Add some outdated facts
    past_date = (datetime.now() - timedelta(days=100)).strftime("%Y-%m-%dT%H:%M:%S")
    temporal_mem.store_entity_fact(
        entity_id="user_123",
        property_name="address",
        value="456 Old St",
        valid_from="2023-01-01T00:00:00",
        valid_until=past_date
    )

    temporal_mem.store_entity_fact(
        entity_id="user_123",
        property_name="phone",
        value="555-1234",
        valid_from="2023-01-01T00:00:00",
        valid_until=past_date
    )

    print("Before consolidation:")
    addr_history = temporal_mem.get_entity_history("user_123", "address")
    print(f"Address history length: {len(addr_history)}")

    # Run consolidation
    consolidator = MemoryConsolidator(temporal_mem)
    consolidator.setup_default_rules()
    results = consolidator.run_consolidation()

    print("\nConsolidation results:", json.dumps(results, indent=2))

    print("\nAfter consolidation:")
    addr_history = temporal_mem.get_entity_history("user_123", "address")
    print(f"Address history length: {len(addr_history)}")

if __name__ == "__main__":
    example_memory_consolidation()
```

## Quick Start: Minimal Working Implementation

Here's a minimal but complete implementation you can start with:

```python
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class SimpleAgentMemory:
    """
    Simple but complete memory system for getting started quickly.
    """

    def __init__(self, base_dir: str = "simple_memory"):
        self.base_dir = Path(base_dir)
        self.entities_dir = self.base_dir / "entities"
        self.entities_dir.mkdir(parents=True, exist_ok=True)

    def remember(self, entity_id: str, **kwargs) -> bool:
        """Remember information about an entity."""
        # Load existing entity or create new one
        path = self.entities_dir / f"{entity_id}.json"
        if path.exists():
            with open(path, 'r') as f:
                entity = json.load(f)
        else:
            entity = {"id": entity_id, "facts": {}}

        # Update with new information
        entity["facts"].update(kwargs)
        entity["last_updated"] = datetime.now().isoformat()

        # Save back
        with open(path, 'w') as f:
            json.dump(entity, f, indent=2)

        return True

    def recall(self, entity_id: str) -> Optional[Dict]:
        """Recall information about an entity."""
        path = self.entities_dir / f"{entity_id}.json"
        if path.exists():
            with open(path, 'r') as f:
                return json.load(f)
        return None

    def forget(self, entity_id: str) -> bool:
        """Forget everything about an entity."""
        path = self.entities_dir / f"{entity_id}.json"
        if path.exists():
            path.unlink()
            return True
        return False

# Quick start usage
if __name__ == "__main__":
    memory = SimpleAgentMemory()

    # Remember information
    memory.remember("user_alice",
                   name="Alice",
                   favorite_color="blue",
                   last_seen="today")

    # Recall information
    alice_info = memory.recall("user_alice")
    print("Alice's info:", alice_info)

    # Update information
    memory.remember("user_alice", last_seen="just now", age=30)
    updated_info = memory.recall("user_alice")
    print("Updated info:", updated_info)
```

This gives you a working memory system in under 50 lines that you can expand upon based on your needs.
