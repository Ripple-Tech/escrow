"use server"

import { db } from "@/db"

export async function getEscrowActivity(escrowId: string) {
  try {
    const activities = await db.escrowActivity.findMany({
      where: { escrowId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return activities
  } catch (err) {
    console.error("Error fetching escrow activity:", err)
    throw err
  }
}
