"use client"
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useParams, useRouter } from "next/navigation";

export default function PaymentClientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const user = useCurrentUser();
  return (
   <DashboardPage title="Payment Method" backHref={`/dashboard/profile/${id}`}>
     <section>
       <h2>Payment Method</h2>
       <p>Manage your payment methods here.</p>
     </section>
   </DashboardPage>
  )
}


