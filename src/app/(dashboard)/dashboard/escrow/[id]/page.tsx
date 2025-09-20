import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { db } from "@/db"
import { notFound, redirect } from "next/navigation"
import { EscrowDetailContent } from "./escrow-detail-content"

interface PageProps {
  params: {
    id: string | string[] | undefined
  }
}

const Page = async ({ params }: PageProps) => {
  if (typeof params.id !== "string") return notFound()

  const { currentUser } = await import("@clerk/nextjs/server")
  const auth = await currentUser()

  if (!auth) {
    redirect("/sign-in")
  }

  const user = await db.user.findUnique({
    where: { externalId: auth.id },
  })

  if (!user) redirect("/sign-in")

  const escrow = await db.escrow.findUnique({
    where: { id: params.id },
    include: {
      sender: true,
      receiver: true,
    },
  })

  if (!escrow) return notFound()

 // If escrow has been accepted (receiverId is set)
if (escrow.receiverId) {
  if (escrow.senderId !== user.id && escrow.receiverId !== user.id) {
    return notFound()
  }
}

  return (
    <DashboardPage  backHref="/dashboard/escrow" title={`Escrow: ${escrow.productName}`}
    >
      <EscrowDetailContent escrow={escrow} />
    </DashboardPage>
  )
}

export default Page
