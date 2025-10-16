-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('user', 'globalAdmin');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'user';
