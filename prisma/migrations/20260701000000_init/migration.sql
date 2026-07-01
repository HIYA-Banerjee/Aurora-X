-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'SHARED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('MemoryRecommendation', 'StoryRecommendation', 'PhotoRecommendation');

-- CreateEnum
CREATE TYPE "FeatureFlagType" AS ENUM ('GENERIC');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'READ');

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "User" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email"       TEXT NOT NULL,
    "displayName" TEXT,
    "avatar"      TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "ownerId"     TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "eventDate"   TIMESTAMP(3),
    "location"    TEXT,
    "visibility"  "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "metadata"    JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id"   TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryTag" (
    "memoryId" TEXT NOT NULL,
    "tagId"    TEXT NOT NULL,

    CONSTRAINT "MemoryTag_pkey" PRIMARY KEY ("memoryId","tagId")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "ownerId"    TEXT NOT NULL,
    "width"      INTEGER,
    "height"     INTEGER,
    "mimeType"   TEXT,
    "fileSize"   INTEGER,
    "storageKey" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memoryId"   TEXT,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id"               TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "ownerId"          TEXT NOT NULL,
    "sourceMemoryId"   TEXT,
    "generatedContent" TEXT NOT NULL,
    "generationModel"  TEXT NOT NULL,
    "promptVersion"    TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embedding" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "vector"         vector(1536) NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "sourceType"     TEXT NOT NULL,
    "sourceId"       TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "participantId" TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "conversationId" TEXT NOT NULL,
    "role"           "ConversationRole" NOT NULL,
    "content"        TEXT NOT NULL,
    "tokenUsage"     INTEGER,
    "model"          TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"          TEXT NOT NULL,
    "type"            "RecommendationType" NOT NULL,
    "explanation"     TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "generatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "key"         TEXT NOT NULL,
    "enabled"     BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "type"        "FeatureFlagType" NOT NULL DEFAULT 'GENERIC',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "actorId"   TEXT,
    "action"    "AuditAction" NOT NULL,
    "entity"    TEXT NOT NULL,
    "entityId"  TEXT,
    "payload"   JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "aggregate"   TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType"   TEXT NOT NULL,
    "payload"     JSONB,
    "processed"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateUnique
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "Memory_ownerId_idx" ON "Memory"("ownerId");
CREATE INDEX "MemoryTag_tagId_idx" ON "MemoryTag"("tagId");
CREATE INDEX "Photo_ownerId_idx" ON "Photo"("ownerId");
CREATE INDEX "Photo_memoryId_idx" ON "Photo"("memoryId");
CREATE INDEX "Story_ownerId_idx" ON "Story"("ownerId");
CREATE INDEX "Embedding_sourceType_sourceId_idx" ON "Embedding"("sourceType", "sourceId");
CREATE INDEX "Conversation_participantId_idx" ON "Conversation"("participantId");
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");
CREATE INDEX "Recommendation_userId_idx" ON "Recommendation"("userId");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "Event_aggregate_aggregateId_idx" ON "Event"("aggregate", "aggregateId");
CREATE INDEX "Event_processed_idx" ON "Event"("processed");

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MemoryTag" ADD CONSTRAINT "MemoryTag_memoryId_fkey"
    FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MemoryTag" ADD CONSTRAINT "MemoryTag_tagId_fkey"
    FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Photo" ADD CONSTRAINT "Photo_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Photo" ADD CONSTRAINT "Photo_memoryId_fkey"
    FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Story" ADD CONSTRAINT "Story_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Story" ADD CONSTRAINT "Story_sourceMemoryId_fkey"
    FOREIGN KEY ("sourceMemoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participantId_fkey"
    FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
