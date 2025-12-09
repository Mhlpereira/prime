-- CreateEnum
CREATE TYPE "ClassVisibility" AS ENUM ('GYM', 'TEAM', 'PRIVATE');

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "maxStudents" INTEGER,
ADD COLUMN     "visibility" "ClassVisibility" NOT NULL DEFAULT 'TEAM';

-- CreateIndex
CREATE INDEX "Class_visibility_idx" ON "Class"("visibility");
