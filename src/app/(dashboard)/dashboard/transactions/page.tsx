import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { db } from "@/db"
import { redirect } from "next/navigation"
import getCurrentUser from "@/actions/getCurrentUser"
import { TransactionContent } from "./transaction-content"

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const Page = async ({ searchParams }: PageProps) => {
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

  return (
    <DashboardPage
      title="Transactions"
      // No CTA needed here, but you can add one if you support manual creation
      // cta={<Button>New</Button>}
    >
      <TransactionContent />
    </DashboardPage>
  )
}

export default Page