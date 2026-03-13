import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { ingestionService } from "../../../../lib/services/ingestion";
import { authMiddleware } from "../../../../lib/middleware/auth";
import path from "path";
import fs from "fs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const proposalId = parseInt(id as string);

  if (isNaN(proposalId)) {
    return res.status(400).json({ message: "Invalid proposalId" });
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { rfp: true }
    });

    if (!proposal || !proposal.rfp) {
      return res.status(404).json({ message: "Proposal or linked RFP not found" });
    }

    const rfp = proposal.rfp;
    let filePath = "";

    if (rfp.originalFileUrl?.startsWith("/")) {
      // Local fallback
      filePath = path.join(process.cwd(), "public", rfp.originalFileUrl);
    } else {
      // S3 - in a real scenario we'd download it. 
      // For this implementation, we'll try to find it locally first if possible or return error.
      // Assuming for now most files are local in this dev env.
      return res.status(400).json({ message: "Re-analysis of S3 hosted files is not yet implemented. Only local uploads supported for now." });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: `Source file not found at ${filePath}` });
    }

    // 1. Re-process the file
    const analysis = await ingestionService.processFile(filePath);

    // 2. Fetch detailed block info for new recommendations
    const suggestedBlockIds = Array.isArray(analysis.suggestedBlockIds) ? analysis.suggestedBlockIds : [];
    const detailedBlocks = await (prisma as any).modularBlock.findMany({
      where: {
        id: { in: suggestedBlockIds }
      },
      select: {
        id: true,
        title: true,
        content: true,
      }
    });

    const orderedBlocks = suggestedBlockIds
      .map((id: number) => detailedBlocks.find((b: any) => b.id === id))
      .filter(Boolean);

    // 3. Update RFP record
    const updatedRfp = await (prisma as any).rFP.update({
      where: { id: rfp.id },
      data: {
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

    return res.status(200).json(updatedRfp);
  } catch (error: any) {
    console.error("Re-analysis error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export default authMiddleware(handler);
