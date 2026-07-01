# Aurora X – Database Architecture

## Overview
Aurora X uses **PostgreSQL** (Neon-compatible) as its primary relational database, managed via **Prisma ORM**. Vector similarity search is powered by the **pgvector** extension.

---

## Schema Summary

| Model | Purpose |
|-------|---------|
| `User` | Core identity, owns all content |
| `Memory` | A user's autobiographical memory item |
| `Tag` / `MemoryTag` | Taxonomy tagging for memories |
| `Photo` | Media assets attached to memories |
| `Story` | AI-generated narrative from memories |
| `Embedding` | 1536-dim float vectors for semantic search |
| `Conversation` | Chat session with an AI assistant |
| `ChatMessage` | Individual message within a conversation |
| `Recommendation` | AI-generated content recommendations |
| `FeatureFlag` | Runtime feature toggle |
| `AuditLog` | Immutable audit trail for all mutations |
| `Event` | Outbox pattern for async event processing |

---

## Design Decisions

### UUIDs
All primary keys are `uuid()` — globally unique, safe to expose in APIs, and conflict-free across distributed writes.

### UTC Timestamps
All `DateTime` fields use `@default(now())` and Prisma stores them as UTC.

### Soft Deletes
Sensitive entities (User, Memory) support `deleteAt` patterns via cascade rules rather than hard deletes where applicable.

### Indexes
- `MemoryTag.tagId` — fast tag-based memory lookup
- `Embedding.[sourceType, sourceId]` — efficient embedding retrieval by source
- `Event.[aggregate, aggregateId]` — fast event log queries

---

## Normalization
The schema follows **3NF** (Third Normal Form):
- Tags are extracted to a separate `Tag` table linked via `MemoryTag` join table.
- Chat messages are separated from conversations.
- Embeddings are decoupled from their source entities via `sourceType`/`sourceId`.

---

## Migration Workflow

```bash
# Generate Prisma client
pnpm prisma:generate

# Create and apply a migration
pnpm prisma:migrate

# Seed database with deterministic fake data
pnpm prisma:seed

# Reset database (dev only)
pnpm prisma:reset
```

---

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon or local) |

---

## Indexing Strategy
- Use composite indexes for multi-column queries (e.g., `sourceType + sourceId`).
- Use `@unique` for natural keys like `User.email` and `Tag.name`.
- Use `@index` on foreign keys used in WHERE clauses.
