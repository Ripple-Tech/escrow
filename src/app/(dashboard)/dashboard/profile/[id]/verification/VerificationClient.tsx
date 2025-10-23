"use client"
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useParams, useRouter } from "next/navigation";

export default function VerificationPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const user = useCurrentUser();
  return (
    <DashboardPage title="Verification" backHref={`/dashboard/profile/${id}`}>
      <section>
        <h2>Verification</h2>
        <p>Manage your verification settings here.</p>
      </section>
    </DashboardPage>
  )
}
