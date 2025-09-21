import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { db } from "@/db"
import { redirect } from "next/navigation"
import {CreateEscrowModal} from "@/components/create-escrow"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { PaymentSuccessModal } from "@/components/payment-success-modal"
import Transaction from "@/components/dashboard/Transactions"
import getCurrentUser from "@/actions/getCurrentUser"

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
    <>
      

      <DashboardPage
        cta={
          <CreateEscrowModal>
            <Button className="w-full sm:w-fit">
              <PlusIcon className="size-4 mr-2" />
              Create Escrow
            </Button>
          </CreateEscrowModal>
        }
        title="Dashboard"
      >
        <Transaction />
      </DashboardPage>
    </>
  )
}

export default Page
