import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { updateHubspotDeal } from "../../../../lib/services/hubspot";
import { authMiddleware } from "../../../../lib/middleware/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { totalValue, totalCost } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Proposal ID is required" });
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // 1. Update local database
    const updatedProposal = await prisma.proposal.update({
      where: { id: parseInt(id as string) },
      data: {
        totalValue: parseFloat(totalValue),
        totalCost: parseFloat(totalCost),
      },
    });

    // 2. Sync to HubSpot if deal exists
    if (proposal.hubspotDealId) {
      await updateHubspotDeal(proposal.hubspotDealId, {
        amount: totalValue.toString(),
        // You could also sync cost to a custom property if configured
      });
    }

    return res.status(200).json(updatedProposal);
  } catch (error: any) {
    console.error("Sync error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export default authMiddleware(handler);
