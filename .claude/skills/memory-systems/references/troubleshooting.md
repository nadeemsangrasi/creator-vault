# Memory Systems - Troubleshooting Guide

## Issue 1: Memory Query Performance Degradation

**Symptoms:**
- Queries taking longer than 1 second
- Memory usage growing over time
- Agent response times increasing

**Root Causes:**
- Too many facts stored without consolidation
- Missing indexes on frequently queried fields
- Inefficient query patterns
- Memory not being cleared properly

**Solutions:**

### Immediate Fix: Query Optimization
```python
# Bad: Retrieve all facts then filter
all_facts = memory.get_all_facts()
filtered = [f for f in all_facts if f['entity_id'] == 'user_123']

# Good: Filter at query time
facts = memory.get_facts_by_entity('user_123')

# Better: Use indexed lookup
facts = memory.indexed_get('entity_id', 'user_123')
```

### Medium-term: Add Indexes
```python
# Add indexes for frequently queried fields
memory.create_index('entity_id')
memory.create_index('type')
memory.create_index('timestamp')

# For graph databases
memory.create_index('relationship_type')
memory.create_index('property_name')
```

### Long-term: Implement Consolidation
```python
def run_memory_consolidation(memory):
    """Run consolidation to reduce memory size"""

    # Archive old facts
    archived = archive_old_facts(memory, days_old=30)
    print(f"Archived {archived} old facts")

    # Remove duplicates
    deduplicated = deduplicate_entities(memory)
    print(f"Removed {deduplicated} duplicate entities")

    # Compact facts
    compacted = compact_facts(memory)
    print(f"Compacted {compacted} facts")

    return {"archived": archived, "deduplicated": deduplicated, "compacted": compacted}
```

## Issue 2: Entity Duplication

**Symptoms:**
- Same user/person referenced multiple times with different IDs
- Conflicting information about the same entity
- Inconsistent recommendations

**Root Causes:**
- Poor entity extraction from text
- No deduplication logic
- Multiple data sources creating separate entities
- Case sensitivity in names/emails

**Solutions:**

### Immediate Fix: Entity Resolution
```python
def resolve_duplicate_entities(memory):
    """Find and merge duplicate entities"""

    # Group entities by similarity
    entity_groups = group_similar_entities(memory.get_all_entities())

    for group in entity_groups:
        if len(group) > 1:
            # Keep the most complete entity
            primary = get_most_complete_entity(group)

            # Merge properties from others
            for duplicate in group:
                if duplicate['id'] != primary['id']:
                    primary['properties'].update(duplicate['properties'])
                    # Update relationships
                    update_relationships(memory, duplicate['id'], primary['id'])
                    # Remove duplicate
                    memory.delete_entity(duplicate['id'])
```

### Prevention: Entity Normalization
```python
def normalize_entity_name(name):
    """Normalize entity names for consistency"""
    import re

    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name.strip())

    # Convert to consistent case (except for proper nouns)
    name = name.title()

    # Handle common abbreviations
    abbreviations = {
        'Inc': 'Inc.',
        'Ltd': 'Ltd.',
        'Corp': 'Corp.',
        'Co': 'Co.'
    }

    for abbrev, full in abbreviations.items():
        name = name.replace(abbrev, full)

    return name

def extract_and_normalize_entity(text):
    """Extract and normalize entity from text"""
    entity = extract_entity(text)
    entity['name'] = normalize_entity_name(entity['name'])
    return entity
```

## Issue 3: Temporal Fact Conflicts

**Symptoms:**
- Contradictory information returned for same entity
- Outdated information being used
- Inconsistent historical queries

**Root Causes:**
- No temporal validity tracking
- Facts stored without time context
- No temporal querying logic
- Overlapping validity periods

**Solutions:**

### Immediate Fix: Temporal Query Validation
```python
def validate_temporal_facts(memory):
    """Check for temporal fact conflicts"""

    conflicts = []

    for entity_id, properties in memory.get_all_temporal_facts().items():
        for prop_name, facts in properties.items():
            # Sort by validity period
            facts.sort(key=lambda x: x['valid_from'])

            # Check for overlaps
            for i in range(len(facts) - 1):
                current = facts[i]
                next_fact = facts[i + 1]

                if current['valid_until'] and current['valid_until'] > next_fact['valid_from']:
                    conflicts.append({
                        'entity_id': entity_id,
                        'property': prop_name,
                        'conflict': f"Overlap: {current['valid_from']}-{current['valid_until']} and {next_fact['valid_from']}-{next_fact['valid_until']}"
                    })

    return conflicts
```

### Fix: Proper Temporal Storage
```python
def store_temporal_fact_safe(memory, entity_id, property_name, value, valid_from, valid_until=None):
    """Store temporal fact with overlap prevention"""

    # Get existing facts for this property
    existing_facts = memory.get_temporal_facts(entity_id, property_name)

    # Check for overlaps and adjust if needed
    for fact in existing_facts:
        if overlaps(fact, valid_from, valid_until):
            # Adjust the previous fact's end time
            fact['valid_until'] = valid_from

    # Store new fact
    memory.store_temporal_fact(entity_id, property_name, value, valid_from, valid_until)

def overlaps(fact, new_from, new_until):
    """Check if new period overlaps with existing fact"""
    existing_from = fact['valid_from']
    existing_until = fact['valid_until'] or '9999-12-31'

    return (new_from < existing_until and new_until > existing_from)
```

## Issue 4: Memory Leaks

**Symptoms:**
- Memory usage continuously growing
- System running out of memory
- Process killed by OOM killer

**Root Causes:**
- No memory cleanup/consolidation
- Caching without size limits
- Circular references
- Not closing file handles

**Solutions:**

### Immediate Fix: Memory Cleanup
```python
import gc

def cleanup_memory(memory):
    """Force memory cleanup"""

    # Clear caches
    if hasattr(memory, 'clear_cache'):
        memory.clear_cache()

    # Run garbage collection
    gc.collect()

    # Close any open file handles
    if hasattr(memory, 'close'):
        memory.close()

    # Reset any internal buffers
    if hasattr(memory, 'reset_buffers'):
        memory.reset_buffers()
```

### Prevention: Memory Limits
```python
class MemoryWithLimits:
    def __init__(self, max_entities=10000, max_facts=100000):
        self.max_entities = max_entities
        self.max_facts = max_facts
        self.entities = {}
        self.facts = []

    def store_entity(self, entity):
        if len(self.entities) >= self.max_entities:
            self._enforce_limits()

        self.entities[entity['id']] = entity

    def _enforce_limits(self):
        """Remove oldest entities to stay within limits"""
        # Sort by last accessed time
        entities_by_age = sorted(
            self.entities.items(),
            key=lambda x: x[1].get('last_accessed', '1970-01-01')
        )

        # Remove oldest 10%
        to_remove = len(entities_by_age) // 10
        for i in range(to_remove):
            del self.entities[entities_by_age[i][0]]
```

## Issue 5: Semantic Search Poor Results

**Symptoms:**
- Irrelevant memories returned
- Semantic queries returning no results
- Poor recall on similar concepts

**Root Causes:**
- Poor embedding quality
- Inadequate text preprocessing
- Wrong similarity threshold
- Insufficient training data

**Solutions:**

### Immediate Fix: Query Refinement
```python
def refine_search_query(query, memory):
    """Refine search query for better results"""

    # Expand query with synonyms
    expanded_query = expand_with_synonyms(query)

    # Boost important terms
    boosted_query = boost_important_terms(expanded_query)

    # Search with multiple strategies
    results = []

    # Exact match first
    exact_results = memory.search_exact(query)
    results.extend(exact_results)

    # Semantic search
    semantic_results = memory.search_semantic(boosted_query)
    results.extend(semantic_results)

    # Fuzzy search
    fuzzy_results = memory.search_fuzzy(query)
    results.extend(fuzzy_results)

    # Remove duplicates and rank
    unique_results = remove_duplicates(results)
    ranked_results = rank_by_relevance(unique_results, query)

    return ranked_results
```

### Improvement: Better Embeddings
```python
def create_better_embedding(text, metadata=None):
    """Create more context-aware embeddings"""

    # Include metadata in text for richer context
    enhanced_text = text
    if metadata:
        meta_str = " ".join([f"{k}:{v}" for k, v in metadata.items()])
        enhanced_text = f"{text} [META: {meta_str}]"

    # Use a more sophisticated embedding model
    # In practice: use OpenAI, Cohere, or local model
    embedding = get_embedding(enhanced_text)

    return embedding
```

## Issue 6: Relationship Query Failures

**Symptoms:**
- Relationship queries returning empty results
- Inability to traverse relationships
- Performance issues with complex queries

**Root Causes:**
- Missing relationship indexes
- Inefficient query patterns
- Graph not properly connected
- Wrong relationship types

**Solutions:**

### Immediate Fix: Query Optimization
```python
def optimize_relationship_query(graph, start_entity, relationship_types, max_depth=3):
    """Optimize relationship traversal"""

    # Use indexes if available
    if hasattr(graph, 'get_neighbors_indexed'):
        return graph.get_neighbors_indexed(start_entity, relationship_types)

    # Limit traversal depth
    queue = [(start_entity, 0, [start_entity])]
    visited = {start_entity}
    results = []

    while queue:
        current, depth, path = queue.pop(0)

        if depth >= max_depth:
            continue

        # Get neighbors efficiently
        neighbors = graph.get_neighbors(current, relationship_types)

        for neighbor in neighbors:
            if neighbor not in visited:
                visited.add(neighbor)
                new_path = path + [neighbor]
                results.append({
                    'path': new_path,
                    'entity': neighbor,
                    'depth': depth + 1
                })

                if depth + 1 < max_depth:
                    queue.append((neighbor, depth + 1, new_path))

    return results
```

### Prevention: Relationship Validation
```python
def validate_relationships(memory):
    """Validate that relationships are properly formed"""

    issues = []

    for rel in memory.get_all_relationships():
        # Check that both entities exist
        if not memory.get_entity(rel['from_id']):
            issues.append(f"Relationship {rel['id']} has invalid from_id: {rel['from_id']}")

        if not memory.get_entity(rel['to_id']):
            issues.append(f"Relationship {rel['id']} has invalid to_id: {rel['to_id']}")

        # Check relationship type
        if not rel.get('type'):
            issues.append(f"Relationship {rel['id']} has no type")

    return issues
```

## Issue 7: Memory Persistence Failures

**Symptoms:**
- Memory not persisting between sessions
- Data corruption in stored files
- Backup/restore failures

**Root Causes:**
- File permission issues
- Disk space limitations
- Concurrent access conflicts
- Serialization errors

**Solutions:**

### Immediate Fix: File System Check
```python
import os
import shutil
from pathlib import Path

def check_memory_persistence(memory_dir):
    """Check if memory persistence is working"""

    memory_path = Path(memory_dir)

    # Check directory exists and is writable
    if not memory_path.exists():
        memory_path.mkdir(parents=True, exist_ok=True)

    if not os.access(memory_path, os.W_OK):
        raise PermissionError(f"Cannot write to memory directory: {memory_path}")

    # Check available disk space
    stat = shutil.disk_usage(memory_path)
    free_gb = stat.free / (1024**3)
    if free_gb < 1:  # Less than 1GB free
        raise OSError(f"Insufficient disk space: {free_gb:.2f}GB free")

    # Test write/read
    test_file = memory_path / "test_write.json"
    test_data = {"test": "data", "timestamp": "2024-01-01T00:00:00"}

    try:
        with open(test_file, 'w') as f:
            import json
            json.dump(test_data, f)

        with open(test_file) as f:
            read_data = json.load(f)

        if read_data != test_data:
            raise ValueError("Write/read test failed")

        test_file.unlink()  # Clean up
        return True

    except Exception as e:
        raise RuntimeError(f"Memory persistence test failed: {e}")
```

### Prevention: Safe Persistence
```python
import tempfile
import os
import json

def safe_write_memory(data, file_path):
    """Safely write memory data with atomic operation"""

    file_path = Path(file_path)

    # Write to temporary file first
    with tempfile.NamedTemporaryFile(mode='w', delete=False,
                                   dir=file_path.parent,
                                   suffix=file_path.suffix) as tmp_file:
        tmp_path = Path(tmp_file.name)

        try:
            json.dump(data, tmp_file, indent=2)
            tmp_file.flush()
            os.fsync(tmp_file.fileno())  # Ensure data is written to disk

            # Atomically replace the original file
            tmp_path.replace(file_path)

        except Exception:
            # Clean up temp file if something went wrong
            tmp_path.unlink(missing_ok=True)
            raise
```

## Issue 8: Integration Failures with Agent

**Symptoms:**
- Agent not using memory
- Memory not updated after agent interactions
- Context not enriched with memory
- Performance issues during integration

**Root Causes:**
- Wrong integration timing
- Memory not properly initialized
- Context injection issues
- Blocking memory operations

**Solutions:**

### Immediate Fix: Async Integration
```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def integrate_memory_with_agent(query, agent, memory):
    """Integrate memory with agent asynchronously"""

    # Fetch memory in parallel
    memory_task = asyncio.create_task(
        enrich_context_with_memory(query, memory)
    )

    # Prepare agent response
    agent_task = asyncio.create_task(
        agent.process(query)
    )

    # Wait for both
    enriched_context = await memory_task
    agent_response = await agent_task

    # Update memory after response
    update_memory_task = asyncio.create_task(
        update_memory_from_interaction(agent_response, memory, query)
    )

    await update_memory_task
    return agent_response
```

### Prevention: Proper Integration Pattern
```python
class MemoryAgentIntegrator:
    def __init__(self, agent, memory, max_context_tokens=2000):
        self.agent = agent
        self.memory = memory
        self.max_context_tokens = max_context_tokens

    def process_with_memory(self, query, user_id):
        # 1. Pre-query: Enrich context with memory
        enriched_context = self._enrich_context(query, user_id)

        # 2. Process with agent
        response = self.agent.process(enriched_context)

        # 3. Post-process: Update memory
        self._update_memory(query, response, user_id)

        return response

    def _enrich_context(self, query, user_id):
        """Enrich query with relevant memories"""
        # Get user-specific memories
        user_memories = self.memory.search(
            query=f"information about user {user_id}",
            filters={"entity_id": user_id},
            top_k=5
        )

        # Format memories for context
        memory_context = self._format_memories(user_memories)

        # Limit context size
        memory_context = self._limit_context_size(memory_context)

        return f"{memory_context}\n\nQuery: {query}"

    def _update_memory(self, query, response, user_id):
        """Update memory based on interaction"""
        # Extract new information
        new_facts = extract_facts_from_interaction(query, response)

        # Store in memory
        for fact in new_facts:
            self.memory.store(fact['text'], {
                **fact['metadata'],
                'user_id': user_id,
                'timestamp': get_current_time()
            })
```

## Issue 9: Security and Privacy Violations

**Symptoms:**
- Sensitive data being stored/retrieved
- Privacy policy violations
- Unauthorized access to memory
- Data retention policy violations

**Root Causes:**
- No data classification
- Inadequate access controls
- No retention policies
- Sensitive data not filtered

**Solutions:**

### Immediate Fix: Data Filtering
```python
import re

def filter_sensitive_data(text):
    """Filter sensitive information from text"""

    # Email patterns
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    text = re.sub(email_pattern, '[EMAIL_REDACTED]', text)

    # Phone numbers
    phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    text = re.sub(phone_pattern, '[PHONE_REDACTED]', text)

    # Credit cards (simplified)
    cc_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
    text = re.sub(cc_pattern, '[CC_REDACTED]', text)

    # SSN pattern
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
    text = re.sub(ssn_pattern, '[SSN_REDACTED]', text)

    return text

def store_safe(memory, text, metadata=None):
    """Store text with sensitive data filtered"""
    safe_text = filter_sensitive_data(text)
    return memory.store(safe_text, metadata)
```

### Prevention: Access Controls
```python
class SecureMemory:
    def __init__(self, base_memory, user_permissions):
        self.base = base_memory
        self.permissions = user_permissions

    def get_entity(self, entity_id, user_id):
        """Get entity with access control"""
        # Check if user can access this entity
        if not self._can_access_entity(entity_id, user_id):
            raise PermissionError(f"User {user_id} cannot access entity {entity_id}")

        return self.base.get_entity(entity_id)

    def _can_access_entity(self, entity_id, user_id):
        """Check if user can access entity"""
        user_perms = self.permissions.get(user_id, [])
        entity_owner = self.base.get_entity_owner(entity_id)

        # Users can access their own data
        if entity_owner == user_id:
            return True

        # Check role-based permissions
        if 'admin' in user_perms:
            return True

        # Check specific entity permissions
        return self.permissions.entity_allowed(user_id, entity_id)
```

## Issue 10: Backup and Recovery Failures

**Symptoms:**
- Backup taking too long
- Recovery failing
- Corrupted backup files
- Data loss during recovery

**Root Causes:**
- No backup strategy
- Large memory size
- Concurrency issues during backup
- Incomplete recovery process

**Solutions:**

### Immediate Fix: Incremental Backup
```python
def incremental_backup(memory, backup_dir, last_backup_time=None):
    """Create incremental backup of changes since last backup"""

    backup_dir = Path(backup_dir)
    backup_dir.mkdir(exist_ok=True)

    # Get changes since last backup
    if last_backup_time:
        changes = memory.get_changes_since(last_backup_time)
    else:
        changes = memory.get_all_data()

    # Create timestamped backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"memory_backup_{timestamp}.json"

    with open(backup_file, 'w') as f:
        json.dump(changes, f, indent=2)

    return backup_file

def restore_from_backup(memory, backup_file):
    """Restore memory from backup file"""

    with open(backup_file) as f:
        backup_data = json.load(f)

    # Clear current memory
    memory.clear_all()

    # Restore data
    for entity_id, entity in backup_data.get('entities', {}).items():
        memory.store_entity(entity)

    for rel in backup_data.get('relationships', []):
        memory.store_relationship(**rel)

    for fact in backup_data.get('facts', []):
        memory.store_fact(**fact)

    return len(backup_data.get('entities', {}))
```

### Prevention: Backup Strategy
```python
class BackupManager:
    def __init__(self, memory, backup_dir, retention_days=30):
        self.memory = memory
        self.backup_dir = Path(backup_dir)
        self.retention_days = retention_days
        self.backup_dir.mkdir(exist_ok=True)

    def schedule_backups(self):
        """Schedule regular backups"""
        import schedule
        import time

        # Daily backup at 2 AM
        schedule.every().day.at("02:00").do(self.create_backup)

        # Weekly full backup on Sundays
        schedule.every().sunday.at("01:00").do(self.create_full_backup)

        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def create_backup(self):
        """Create a backup"""
        try:
            backup_file = incremental_backup(self.memory, self.backup_dir)
            print(f"Backup created: {backup_file}")

            # Clean up old backups
            self.cleanup_old_backups()

        except Exception as e:
            print(f"Backup failed: {e}")

    def cleanup_old_backups(self):
        """Remove backups older than retention period"""
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)

        for backup_file in self.backup_dir.glob("memory_backup_*.json"):
            if datetime.fromtimestamp(backup_file.stat().st_mtime) < cutoff_date:
                backup_file.unlink()
```

## Quick Debug Checklist

When facing memory issues, check in this order:

1. **Performance**: Is query time > 1s? → Add indexes, run consolidation
2. **Duplicates**: Same entity multiple times? → Run deduplication
3. **Temporal**: Contradictory facts? → Check temporal validity
4. **Leaks**: Memory growing? → Check for proper cleanup
5. **Search**: Poor semantic results? → Improve embeddings/preprocessing
6. **Relationships**: Traversal failing? → Validate graph structure
7. **Persistence**: Data not saved? → Check file permissions/disk space
8. **Integration**: Agent not using memory? → Check async patterns
9. **Security**: Sensitive data exposed? → Add filtering/access controls
10. **Backup**: Recovery failing? → Test backup/restore process

## Monitoring Commands

```bash
# Check memory size
du -sh /path/to/memory/directory

# Monitor memory usage
watch -n 1 'ps aux | grep your_memory_process'

# Check for duplicate entities
python -c "from memory_check import check_duplicates; check_duplicates()"

# Validate temporal consistency
python -c "from memory_check import validate_temporal; validate_temporal()"

# Run performance tests
python -c "from memory_check import performance_test; performance_test()"
```
