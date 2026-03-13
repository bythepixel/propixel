import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { aiService } from "../../../lib/services/ai";
import { authMiddleware } from "../../../lib/middleware/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { rfpId } = req.query;

  if (!rfpId) {
    return res.status(400).json({ message: "rfpId is required" });
  }

  try {
    const rfp = await prisma.rFP.findUnique({
      where: { id: parseInt(rfpId as string) },
    });

    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    const blocks = await prisma.modularBlock.findMany();
    
    // Format blocks for AI
    const availableBlocks = blocks.map(b => ({
      id: b.id,
      title: b.title,
      contentPreview: b.content.substring(0, 200),
      tags: [...(b.industryTags || []), ...(b.skillTags || [])]
    }));

    const recommendations = await aiService.suggestBlocks(rfp.aiSummary || "", availableBlocks);

    return res.status(200).json(recommendations);
  } catch (error: any) {
    console.error("Recommendation error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export default authMiddleware(handler);
