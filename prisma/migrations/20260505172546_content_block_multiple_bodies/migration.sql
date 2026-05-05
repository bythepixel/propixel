-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContentBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyFieldsJson" TEXT NOT NULL DEFAULT '[]',
    "usageGuidance" TEXT,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "visualTemplateId" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentBlock_visualTemplateId_fkey" FOREIGN KEY ("visualTemplateId") REFERENCES "BlockVisualTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentBlock_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ContentBlock" ("body", "categoryId", "createdAt", "id", "sensitive", "title", "updatedAt", "usageGuidance", "visualTemplateId") SELECT "body", "categoryId", "createdAt", "id", "sensitive", "title", "updatedAt", "usageGuidance", "visualTemplateId" FROM "ContentBlock";
DROP TABLE "ContentBlock";
ALTER TABLE "new_ContentBlock" RENAME TO "ContentBlock";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
