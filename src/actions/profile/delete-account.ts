"use server"

import { db } from "@/db"
import { logout } from "@/actions/logout"
import { revalidatePath } from "next/cache"

export const deleteAccount = async (userId: string) => {
  try {
    if (!userId) throw new Error("User ID missing")

    // 1. Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        buyerEscrows: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } } },
        sellerEscrows: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } } },
        buyerLockedFunds: true,
      },
    })

    if (!user) throw new Error("User not found")

    // 2. Prevent deletion if user has locked funds or active escrows
    const hasLockedFunds = user.buyerLockedFunds.length > 0
    const hasActiveEscrow =
      user.buyerEscrows.length > 0 || user.sellerEscrows.length > 0

    if (hasLockedFunds || hasActiveEscrow) {
      throw new Error(
        "You still have locked funds or active escrows. Please complete or release them before deleting your account."
      )
    }

    // 3. Delete user-related data
    await db.user.delete({
      where: { id: userId },
    })

    // 4. Log the user out
    await logout()

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Delete account error:", error)
    return { success: false, message: error.message || "Something went wrong" }
  }
}
