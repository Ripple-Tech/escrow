import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { db } from "@/db"
import { redirect } from "next/navigation"
import {CreateEscrowModal} from "@/components/create-escrow"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { PaymentSuccessModal } from "@/components/payment-success-modal"
import Transaction from "@/components/dashboard/Transactions"
import getCurrentUser from "@/actions/getCurrentUser"
import AccountHeader from "@/components/dashboard/Account-header"

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
      <AccountHeader/>
        <Transaction />
      
    </>
  )
}

export default Page
