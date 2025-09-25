import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { db } from "@/db"
import { notFound, redirect } from "next/navigation"
import { EscrowDetailContent } from "./escrow-detail-content"
import getCurrentUser from "@/actions/getCurrentUser"

interface PageProps {
  params: {
    id: string | string[] | undefined
  }
}

// Create a proper type that includes the conversation
type EscrowWithConversation = Awaited<ReturnType<typeof db.escrow.findUnique>> & {
  conversation?: {
    id: string
    createdAt: Date
    lastMessageAt: Date
    messages: any[]
  } | null
}

const Page = async ({ params }: PageProps) => {
  if (typeof params.id !== "string") return notFound()

  const auth = await getCurrentUser()
  if (!auth) {
    redirect("/auth/login")
  }

  const user = await db.user.findUnique({
    where: { id: auth.id },
  })

  if (!user) {
    return redirect("/auth/login")
  }

  const escrow = await db.escrow.findUnique({
    where: { id: params.id },
    include: {
      sender: true,
      receiver: true,
      conversation: { 
        include: { 
          messages: true 
        } 
      } 
    },
  }) as EscrowWithConversation

  if (!escrow) return notFound()

  // If escrow has been accepted (receiverId is set)
  if (escrow.receiverId) {
    if (escrow.senderId !== user.id && escrow.receiverId !== user.id) {
      return notFound()
    }
  }

  // Compute creator on the server using your app's internal IDs
  const isCreator = escrow.senderId === user.id

  // Who is the buyer and seller?
  let buyerId: string | null = null
  let sellerId: string | null = null

  if (escrow.role === "BUYER") {
    buyerId = escrow.creatorId
    sellerId = escrow.receiverId ?? null
  } else if (escrow.role === "SELLER") {
    sellerId = escrow.creatorId
    buyerId = escrow.receiverId ?? null
  }

  const isBuyer = user.id === buyerId
  const isSeller = user.id === sellerId

  return (
    <DashboardPage backHref="/dashboard/escrow" title={`Escrow: ${escrow.productName}`}>
      <EscrowDetailContent 
        escrow={escrow} 
        isCreator={isCreator} 
        isBuyer={isBuyer} 
        isSeller={isSeller} 
        
      />
    </DashboardPage>
  )
}

export default Page