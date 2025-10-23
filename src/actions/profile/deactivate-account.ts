"use server"

import { db } from "@/db"
import { logout } from "@/actions/logout"
import { revalidatePath } from "next/cache"

export const deactivateAccount = async (userId: string) => {
  try {
    if (!userId) throw new Error("User ID is required.")

    // 1. Get user and their active data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        buyerLockedFunds: true,
        buyerEscrows: true,
        sellerEscrows: true,
      },
    })

    if (!user) throw new Error("User not found.")

    // 2. Check for locked funds or active escrows
    const hasLockedFunds = user.buyerLockedFunds.length > 0
    const hasActiveEscrow = [
      ...user.buyerEscrows,
      ...user.sellerEscrows,
    ].some((escrow) => escrow.status === "IN_PROGRESS")

    if (hasLockedFunds || hasActiveEscrow) {
      throw new Error(
        "You still have locked funds or active escrows. Please complete or release them before deactivating your account."
      )
    }

    // 3. Deactivate account
    await db.user.update({
      where: { id: userId },
      data: { status: "DEACTIVATED" },
    })

    // 4. Logout and refresh session
    await logout()
    revalidatePath("/dashboard/profile")

    return { success: true, message: "Your account has been deactivated successfully." }
  } catch (error: any) {
    console.error("Deactivate account error:", error)
    return { success: false, message: error.message || "Something went wrong." }
  }
}
