-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PREMIUM';
ALTER TYPE "Role" ADD VALUE 'SYSTEM';

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Embedding" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "FeatureFlag" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Memory" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Recommendation" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Story" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
