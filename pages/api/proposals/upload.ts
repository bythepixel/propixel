import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { prisma } from "../../../lib/prisma";
import { storageService } from "../../../lib/services/storage";
import { ingestionService } from "../../../lib/services/ingestion";
import { authMiddleware } from "../../../lib/middleware/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);
    console.log("Upload Fields:", fields);
    console.log("Upload Files:", Object.keys(files));

    const companyIdStr = Array.isArray(fields.companyId) ? fields.companyId[0] : fields.companyId;
    const companyId = companyIdStr ? parseInt(companyIdStr) : null;

    const proposalIdStr = Array.isArray(fields.proposalId) ? fields.proposalId[0] : fields.proposalId;
    const proposalId = proposalIdStr ? parseInt(proposalIdStr) : null;

    if (!companyId) {
      console.warn("Upload failed: companyId is missing");
      return res.status(400).json({ message: "companyId is required" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      console.warn("Upload failed: No file found in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Upload to storage (S3 + fallback)
    const fileUrl = await storageService.uploadFile(
      file.filepath,
      file.originalFilename || "rfp-document",
      file.mimetype || "application/pdf"
    );

    // 2. Process/Analyze file
    const analysis = await ingestionService.processFile(file.filepath);

    // 3. Fetch detailed block info for suggested blocks
    const suggestedBlockIds = Array.isArray(analysis.suggestedBlockIds) ? analysis.suggestedBlockIds : [];
    const detailedBlocks = await prisma.modularBlock.findMany({
      where: {
        id: { in: suggestedBlockIds }
      },
      select: {
        id: true,
        title: true,
        content: true,
      }
    });

    // Maintain the order suggested by the AI
    const orderedBlocks = suggestedBlockIds
      .map((id: number) => detailedBlocks.find(b => b.id === id))
      .filter(Boolean);

    // 4. Create RFP record
    const rfp = await (prisma as any).rFP.create({
      data: {
        companyId,
        originalFileUrl: fileUrl,
        aiSummary: analysis.summary,
        strategicAnalysis: analysis.strategicAnalysis,
        complexityScore: analysis.complexityScore,
        rules: analysis.rules,
        criteria: analysis.criteria,
        industry: analysis.industry,
        goals: analysis.goals,
        recommendedValue: analysis.recommendedValue,
        recommendedCost: analysis.recommendedCost,
        pricingExplanation: analysis.pricingExplanation,
        suggestedBlocks: orderedBlocks,
        missingContent: analysis.missingContent,
        internalReasoning: analysis.internalReasoning,
      },
    });

    // 4. Link RFP to Proposal if proposalId is provided
    if (proposalId) {
      console.log(`Linking RFP ${rfp.id} to Proposal ${proposalId}`);
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { rfpId: rfp.id },
      });
    }

    return res.status(201).json(rfp);
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export default authMiddleware(handler);
