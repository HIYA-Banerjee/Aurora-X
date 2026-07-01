# ADR-003 – Use pgvector for Vector Similarity Search

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Aurora X Engineering

---

## Context

Aurora X needs semantic search and AI-powered recommendation capabilities. This requires storing and querying high-dimensional vector embeddings (e.g., from OpenAI `text-embedding-ada-002`, 1536 dimensions) efficiently.

We needed to choose between:
1. A dedicated vector database (Pinecone, Weaviate, Qdrant)
2. A PostgreSQL extension (`pgvector`)
3. An in-memory / application-layer approach

---

## Decision

We adopt **pgvector** as a PostgreSQL extension, integrated via Prisma's `previewFeatures = ["pgvector"]`.

Embeddings are stored in the `Embedding` model with:
- `vector Float[] @db.Vector(1536)` — native pgvector type
- `sourceType String` + `sourceId String` — polymorphic reference to source entity
- Indexes on `sourceType, sourceId` for efficient lookup

---

## Rationale

### Why pgvector over a dedicated vector DB?

| Concern | pgvector | Dedicated Vector DB |
|---------|----------|---------------------|
| Operational complexity | Low (same DB) | High (separate service) |
| Transactional consistency | Native ACID | Eventual / external |
| Infrastructure cost | None (reuses Neon) | Additional service fee |
| Query flexibility | Full SQL joins | Limited |
| Scale ceiling | ~10M vectors (sufficient for MVP–Series A) | Billions |

### Why Prisma preview feature?

Prisma 5.x supports pgvector as a preview feature. This keeps our ORM layer consistent and avoids raw SQL for schema management.

---

## Consequences

### Positive
- Single database, single connection pool, zero extra infra cost.
- Vectors can be JOINed with relational data in one query.
- Neon (our PostgreSQL provider) natively supports pgvector.

### Negative
- Prisma's pgvector support is still in preview — breaking changes possible.
- Approximate Nearest Neighbour (ANN) indexing (`ivfflat`, `hnsw`) requires manual migration steps not yet automated via Prisma.
- If vector volume exceeds ~50M rows, migration to a dedicated vector store will be required.

---

## Migration Path

If scale demands a dedicated vector store in future:
1. Keep `Embedding` table as source-of-truth.
2. Sync to Pinecone/Qdrant via an async worker reading from the `Event` outbox.
3. Switch query path to the dedicated store without breaking the relational layer.

---

## References
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Prisma pgvector docs](https://www.prisma.io/docs/orm/prisma-client/queries/vector-search)
- [Neon pgvector guide](https://neon.tech/docs/extensions/pgvector)
