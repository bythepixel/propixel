-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProposalSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "contentBlockId" TEXT NOT NULL,
    "overrideBody" TEXT,
    "overrideFieldsJson" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "ProposalSection_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProposalSection_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProposalSection" ("contentBlockId", "id", "order", "overrideBody", "proposalId") SELECT "contentBlockId", "id", "order", "overrideBody", "proposalId" FROM "ProposalSection";
DROP TABLE "ProposalSection";
ALTER TABLE "new_ProposalSection" RENAME TO "ProposalSection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
