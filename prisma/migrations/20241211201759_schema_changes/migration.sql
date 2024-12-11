/*
  Warnings:

  - Added the required column `name` to the `game_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_templates" ADD COLUMN     "name" TEXT NOT NULL;
