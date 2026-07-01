# Aurora X – Entity Relationship Diagram

## ERD (Mermaid)

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String displayName
        String avatar
        DateTime createdAt
        DateTime updatedAt
    }

    Memory {
        String id PK
        String ownerId FK
        String title
        String description
        DateTime eventDate
        String location
        Visibility visibility
        Json metadata
        DateTime createdAt
        DateTime updatedAt
    }

    Tag {
        String id PK
        String name UK
    }

    MemoryTag {
        String memoryId FK
        String tagId FK
    }

    Photo {
        String id PK
        String ownerId FK
        Int width
        Int height
        String mimeType
        Int fileSize
        String storageKey
        String memoryId FK
        DateTime uploadedAt
    }

    Story {
        String id PK
        String ownerId FK
        String sourceMemoryId FK
        String generatedContent
        String generationModel
        String promptVersion
        DateTime createdAt
    }

    Embedding {
        String id PK
        Float[] vector
        String embeddingModel
        String sourceType
        String sourceId
        DateTime createdAt
    }

    Conversation {
        String id PK
        String participantId FK
        DateTime createdAt
    }

    ChatMessage {
        String id PK
        String conversationId FK
        ConversationRole role
        String content
        Int tokenUsage
        String model
        DateTime createdAt
    }

    Recommendation {
        String id PK
        String userId FK
        RecommendationType type
        String explanation
        Float confidenceScore
        DateTime generatedAt
    }

    FeatureFlag {
        String id PK
        String key UK
        Boolean enabled
        String description
        DateTime createdAt
    }

    AuditLog {
        String id PK
        String actorId FK
        AuditAction action
        String entity
        String entityId
        Json payload
        DateTime createdAt
    }

    Event {
        String id PK
        String aggregate
        String aggregateId
        String eventType
        Json payload
        Boolean processed
        DateTime createdAt
        DateTime processedAt
    }

    User ||--o{ Memory : "owns"
    User ||--o{ Photo : "owns"
    User ||--o{ Story : "owns"
    User ||--o{ Conversation : "participates"
    User ||--o{ Recommendation : "receives"
    User ||--o{ AuditLog : "actor"

    Memory ||--o{ MemoryTag : "has"
    Tag ||--o{ MemoryTag : "tagged"
    Memory ||--o{ Photo : "contains"
    Memory ||--o{ Story : "source"
    Memory ||--o{ Conversation : "context"

    Conversation ||--o{ ChatMessage : "messages"
```

---

## Notes
- `Embedding` references its source via `sourceType` + `sourceId` (polymorphic, no FK constraint).
- `Event` follows the **transactional outbox pattern** — events written in same DB transaction, consumed asynchronously.
- `FeatureFlag` has no FK to `User` — it is a global configuration table.
