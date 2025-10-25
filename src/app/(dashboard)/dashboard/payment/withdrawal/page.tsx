import { DashboardPage } from "@/components/dashboard/dashboard-page"
import WithdrawalPage from "./WithdrawClient";

const page = () => {
  return (
    <DashboardPage title="Withdrawal" backHref="/dashboard">
    <WithdrawalPage />
    </DashboardPage> 
  )
}

export default page
