import { DashboardPage } from "@/components/dashboard-page"
import { db } from "@/db"
import { redirect } from "next/navigation"
import { EscrowContent } from "./escrow-content"
import { CreateEscrowModal } from "@/components/create-escrow"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const Page = async ({ searchParams }: PageProps) => {
  const { currentUser } = await import("@clerk/nextjs/server")
  const auth = await currentUser()

  if (!auth) {
    redirect("/sign-in")
  }

  const user = await db.user.findUnique({
    where: { externalId: auth.id },
  })

  if (!user) {
    return redirect("/welcome")
  }

  return (
    <DashboardPage
      cta={
        <CreateEscrowModal>
          <Button className="w-full sm:w-fit">
            <PlusIcon className="size-4 mr-2" />
            Create Escrow
          </Button>
        </CreateEscrowModal>
      }
      title="Escrows"
    >
      <EscrowContent />
    </DashboardPage>
  )
}

export default Page
