-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN "refreshTokenVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "hashedRefreshToken" TEXT,
ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lockedUntil" TIMESTAMP(3),
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "lastLogin" TIMESTAMP(3);
