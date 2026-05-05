-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlockVisualTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "js" TEXT NOT NULL,
    "bodyFieldCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BlockVisualTemplate" ("createdAt", "css", "html", "id", "js", "name", "updatedAt") SELECT "createdAt", "css", "html", "id", "js", "name", "updatedAt" FROM "BlockVisualTemplate";
DROP TABLE "BlockVisualTemplate";
ALTER TABLE "new_BlockVisualTemplate" RENAME TO "BlockVisualTemplate";
CREATE UNIQUE INDEX "BlockVisualTemplate_name_key" ON "BlockVisualTemplate"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
