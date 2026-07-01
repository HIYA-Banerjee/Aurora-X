// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Users ─────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      displayName: 'Alice',
      avatar: null,
    },
  });

  // ── Tags ──────────────────────────────────────────────
  const tag = await prisma.tag.upsert({
    where: { name: 'personal' },
    update: {},
    create: { name: 'personal' },
  });

  // ── Memory ────────────────────────────────────────────
  const memory = await prisma.memory.create({
    data: {
      ownerId: user.id,
      title: 'First Memory',
      description: 'A sample memory',
      visibility: 'PRIVATE',
      tags: { create: [{ tagId: tag.id }] },
    },
  });

  // ── Photo ─────────────────────────────────────────────
  await prisma.photo.create({
    data: {
      ownerId: user.id,
      width: 800,
      height: 600,
      mimeType: 'image/jpeg',
      storageKey: 'photos/first.jpg',
      memoryId: memory.id,
    },
  });

  // ── Story ─────────────────────────────────────────────
  await prisma.story.create({
    data: {
      ownerId: user.id,
      generatedContent: 'Once upon a time…',
      generationModel: 'gpt-4',
    },
  });

  // ── Embedding (pgvector – use $executeRaw) ────────────
  const vector = Array(1536).fill(0.01).join(',');
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Embedding" (id, vector, "embeddingModel", "sourceType", "sourceId", "createdAt")
     VALUES (gen_random_uuid(), '[${vector}]'::vector, 'openai-ada', 'Memory', $1, NOW())`,
    memory.id,
  );

  // ── Conversation & messages ───────────────────────────
  const conversation = await prisma.conversation.create({
    data: {
      participantId: user.id,
      messages: {
        create: [
          { role: 'USER', content: 'Hello' },
          { role: 'ASSISTANT', content: 'Hi there!' },
        ],
      },
    },
  });

  // ── Recommendation ────────────────────────────────────
  await prisma.recommendation.create({
    data: {
      type: 'MemoryRecommendation',
      explanation: 'You might like this memory',
      confidenceScore: 0.9,
      userId: user.id,
    },
  });

  // ── Feature Flag ──────────────────────────────────────
  await prisma.featureFlag.upsert({
    where: { key: 'new-ui' },
    update: {},
    create: {
      key: 'new-ui',
      enabled: false,
      description: 'New UI rollout flag',
    },
  });

  // ── Audit Log ─────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
    },
  });

  // ── Event (outbox) ────────────────────────────────────
  await prisma.event.create({
    data: {
      aggregate: 'User',
      aggregateId: user.id,
      eventType: 'UserCreated',
    },
  });

  console.log('✅  Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
