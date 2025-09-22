import { db } from "@/db"

export const getLockedFunds = async () => {             
const lockedFunds = await db.lockedfund.findMany({
  include: {
    buyer: { select: { email: true } },
    escrow: { select: { id: true, productName: true } },
  },
})
return lockedFunds
}