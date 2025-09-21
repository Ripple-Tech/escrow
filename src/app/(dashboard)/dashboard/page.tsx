import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { db } from "@/db"
import { redirect } from "next/navigation"
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
      

      <DashboardPage isDashboard={true}
       
        title="Dashboard"
      >
        <Transaction />
      </DashboardPage>
    </>
  )
}

export default Page
