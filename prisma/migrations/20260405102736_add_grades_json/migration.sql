/*
  Warnings:

  - You are about to drop the column `grade` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "grade",
ADD COLUMN     "grades" JSONB;
