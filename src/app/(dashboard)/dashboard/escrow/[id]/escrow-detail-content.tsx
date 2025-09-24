"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { client } from "@/lib/client"
import { Card } from "@/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/heading"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Escrow } from "@prisma/client"
import { IoCopyOutline } from "react-icons/io5"
import { FaInfoCircle } from "react-icons/fa"
import { MdHistory, MdChat } from "react-icons/md"
import { parseISO } from "date-fns"
import { format } from "date-fns"
import { FaNairaSign } from "react-icons/fa6";
/* icon imports */
import { BadgeCheck, UserCheck2, Mail, MailOpen, Link2, CalendarClock, User2, } from "lucide-react"
import { RiUserStarFill } from "react-icons/ri"
import { FormError } from "@/components/forms/form-error"
import { FormSuccess } from "@/components/forms/form-success"
import { throwIfNotOk } from "@/lib/pass-error-helper"
import { Modal } from "@/components/ui/modal"

interface EscrowDetailContentProps {
  escrow: Escrow
  isCreator: boolean
  isBuyer: boolean
  isSeller: boolean
}

export const EscrowDetailContent = ({ escrow, isCreator, isBuyer, isSeller }: EscrowDetailContentProps) => {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/escrow/${escrow.id}`
  const [copied, setCopied] = useState(false)
  const [releasingEscrow, setReleasingEscrow] = useState<string | null>(null)
  const router = useRouter()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "chat">("overview")
  

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed", err)
      alert("Failed to copy link.")
    }
  }

  // fetch escrow details (no polling/window focus; keeps your current behavior)
  const { data } = useQuery({
    queryKey: ["escrow", escrow.id],
    queryFn: async () => {
      const res = await client.escrow.getEscrowById.$get({ id: escrow.id })
      await throwIfNotOk(res);
      return await res.json()
    },
    initialData: { escrow },
    refetchOnWindowFocus: false,
  })

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await client.escrow.acceptEscrow.$post({ escrowId: escrow.id })
     await throwIfNotOk(res);
      return await res.json()
    },
    onError: (error) => {
    console.error("Error accepting escrow:", error);
    // Additional error handling if necessary
  },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["escrow", escrow.id] })
    },
  })


  const declineMutation = useMutation({
    mutationFn: async () => {
      const res = await client.escrow.declineEscrow.$post({ escrowId: escrow.id })
      await throwIfNotOk(res);
      return await res.json()
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["escrow", escrow.id] })
      router.push("/dashboard/escrow")
    },
  })

const releaseMutation = useMutation({
  mutationFn: async () => {
    const res = await client.escrow.releaseEscrow.$post({ escrowId: escrow.id })
   await throwIfNotOk(res);
   return await res.json()
  },
  onSuccess: async () => {
    await qc.invalidateQueries({ queryKey: ["escrow", escrow.id] })
  },
})


  if (!data?.escrow) {
    return <p>Escrow not found.</p>
  }
  const e = data.escrow as Escrow & {
  activities?: {
    id: string
    action: string
    userId: string
    createdAt: Date
    user: { id: string; email: string; name: string | null }
  }[]
  lockedfund?: {
    id: string
    amount: number
    released: boolean
    buyerId: string
    buyer: { id: string; email: string }
  } | null
}

  const activities = e.activities || []
 
  const created =
    typeof e.createdAt === "string" ? parseISO(e.createdAt) : new Date(e.createdAt)
  const createdStr = format(created, "yyyy-MM-dd HH:mm:ss")

  const tabs = [
    { value: "overview", label: "Overview", icon: <FaInfoCircle size={16} /> },
    { value: "activity", label: "Activity", icon: <MdHistory size={16} /> },
    { value: "chat", label: "Chat", icon: <MdChat size={16} /> },
  ]

 // Compact preview for invitee before acceptance:
const isInviteePreview = !isCreator && !e.receiverId

if (isInviteePreview) {
  const inviteeRole = e.role === "SELLER" ? "BUYER" : "SELLER"

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <RiUserStarFill className="w-5 h-5" />
          {e.productName}
        </h2>

        <p className="mb-4 flex items-center gap-2">
          <FaNairaSign className="w-4 h-4" />
          <strong>Amount:</strong> {e.amount.toString()} {e.currency}
        </p>

        {/* 👇 Dynamic lock message */}
        {inviteeRole === "BUYER" ? (
          <p className="text-sm text-muted-foreground mb-4">
            You as the <strong>buyer</strong> of this product agree to lock{" "}
            <strong>{e.amount.toString()} {e.currency}</strong> from your account balance. 
            When you receive <strong>{e.productName}</strong> in good condition, you can 
            release the funds to the seller.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            The buyer agrees to lock <strong>{e.amount.toString()} {e.currency}</strong> 
            for the purchase of <strong>{e.productName}</strong>. Once the buyer confirms 
            good condition, funds will be released to your account.
          </p>
        )}

        <div className="flex gap-3 mb-3">
          <Button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}>
            {acceptMutation.isPending ? "Accepting…" : "Accept"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => declineMutation.mutate()}
            disabled={declineMutation.isPending}
          >
            {declineMutation.isPending ? "Declining…" : "Decline"}
          </Button>
        </div>
          {/* Error & success messages */}
 {/* Error & success messages */}
<FormError message={(acceptMutation.error as any)?.message} />

{(acceptMutation.error as any)?.code === "INSUFFICIENT_FUNDS" && (
  <div className="mt-2">
    <Button variant="secondary" onClick={() => router.push("/dashboard")}>
      Top up balance
    </Button>
  </div>
)}

<FormSuccess message={acceptMutation.data?.success ? "Escrow accepted successfully." : undefined} />
      </Card>
    </div>
  )
}




  // Full view (creator or accepted)
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4 w-full flex gap-2 rounded-full bg-muted/40 p-1 border border-border/60">
  {tabs.map(({ value, label, icon }) => (
    <TabsTrigger
      key={value}
      value={value}
      className={[
        "group relative flex-1",
        "flex items-center justify-center gap-2",
        "rounded-full px-3 py-2",
        "text-xs uppercase tracking-wide",
        "text-muted-foreground/80",
        "transition-all duration-200",
        "hover:text-foreground hover:bg-background/60",
        "data-[state=active]:text-foreground",
        "data-[state=active]:bg-background",
        "data-[state=active]:shadow-primary-glow",
        "focus-visible:outline-none focus-visible:ring-0",
      ].join(" ")}
    >
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary shadow-primary-glow">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </TabsTrigger>
  ))}
</TabsList>

        <TabsContent value="overview">
  <Card className="p-6">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shadow-primary-glow">
        <FaInfoCircle className="w-5 h-5" />
      </span>
      {e.productName}
    </h2>

    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
      {e.description}
    </p>

    <div className="space-y-3">
      <p className="flex items-start gap-3">
        <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
          <FaNairaSign className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Amount</span>
          <span className="text-base font-semibold text-foreground">{e.amount.toString()} {e.currency}</span>
        </span>
      </p>

      <p className="flex items-start gap-3">
        <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
          <BadgeCheck className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Status</span>
          <span className="text-base font-semibold text-foreground">{e.status.replaceAll("_", " ")}</span>
        </span>
      </p>

      <p className="flex items-start gap-3">
        <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
          <User2 className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Role</span>
          <span className="text-base font-semibold text-foreground">
            {isCreator
              ? e.role
              : e.invitedRole ?? (e.role === "SELLER" ? "BUYER" : "SELLER")}
          </span>
        </span>
      </p>

      {isCreator && e.receiverEmail && (
        <p className="flex items-start gap-3">
          <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
            <MailOpen className="w-4 h-4" />
          </span>
          <span className="flex-1">
            <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Receiver Email</span>
            <span className="text-base font-semibold text-foreground">{e.receiverEmail}</span>
          </span>
        </p>
      )}

      {!isCreator && e.senderEmail  && (
        <p className="flex items-start gap-3">
          <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
            <Mail className="w-4 h-4" />
          </span>
          <span className="flex-1">
            <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Sender Email</span>
            <span className="text-base font-semibold text-foreground">{e.senderEmail}</span>
          </span>
        </p>
      )}

      <p className="flex items-start gap-3">
        <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
          <UserCheck2 className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Invitation Status</span>
          <span className="text-base font-semibold text-foreground">{e.invitationStatus}</span>
        </span>
      </p>

      <p className="flex items-start gap-3">
        <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
          <CalendarClock className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Created At</span>
          <span className="text-base font-semibold text-foreground">{createdStr}</span>
        </span>
      </p>

      {isCreator && e.invitationStatus === "PENDING" && (
        <div className="flex items-start gap-3 flex-wrap">
          <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-primary-glow">
            <Link2 className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <span className="block text-xs uppercase tracking-wide text-muted-foreground/80">Sharable Link</span>
            <div className="flex items-center gap-2 min-w-0">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm truncate max-w-[60%]"
              >
                {shareUrl}
              </a>
              <button
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-primary-glow"
                onClick={() => handleCopy(shareUrl)}
              >
                <IoCopyOutline size={16} />
                {copied ? <span className="text-green-600">Copied!</span> : <span>Copy</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render locked fund block somewhere in the Overview (e.g., after Invitation Status) */}
 {e.lockedfund && (
  <div className="mt-10 p-4 border rounded">
    <div className="flex flex-1 flex-col w-full items-start justify-between gap-4 sm:flex-row">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground/80">
          Locked Funds
        </div>
        <div className="text-base font-semibold">
          {(e.lockedfund.amount / 100).toString()} {e.currency} —{" "}
          {e.lockedfund.released ? "Released" : "Locked"}
        </div>
        <div className="text-sm text-muted-foreground">
          Locked by: {e.lockedfund.buyer?.email ?? e.lockedfund.buyerId}
        </div>
      </div>

      {/* Buyer can release when not released */}
      {isBuyer && !e.lockedfund.released && (
        <div>
          <Button
            onClick={() => setReleasingEscrow(e.id)}
            disabled={releaseMutation.isPending}
          >
            Release funds
          </Button>
        </div>
      )}
    </div>
  </div>
)}

{/* Release Funds Modal */}
<Modal
  showModal={!!releasingEscrow}
  setShowModal={() => setReleasingEscrow(null)}
  className="max-w-md p-8"
>
  <div className="space-y-6">
    <div>
      <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
        Release Funds
      </h2>
      <p className="text-sm/6 text-gray-600">
        Are you sure you want to release these funds?{" "}
        <strong>This action cannot be undone.</strong>
      </p>
    </div>

    <div className="flex justify-end space-x-3 pt-4 border-t">
      <Button variant="outline" onClick={() => setReleasingEscrow(null)}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          releaseMutation.mutate();
          setReleasingEscrow(null);
        }}
        disabled={releaseMutation.isPending}
      >
        {releaseMutation.isPending ? "Releasing…" : "Release"}
      </Button>
    </div>
  </div>
</Modal>


    </div>
  </Card>
</TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            <Heading className="text-xl mb-4">Escrow Activity</Heading>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
             <TableBody>
{activities.length === 0 ? (
<TableRow>
<TableCell colSpan={3} className="text-center text-muted-foreground">
No activity yet.
</TableCell>
</TableRow>
) : (
activities.map((act) => (
<TableRow key={act.id}>
<TableCell>{new Date(act.createdAt).toLocaleString()}</TableCell>
<TableCell>{act.action}</TableCell>
<TableCell>{act.user?.email ?? act.userId}</TableCell>
</TableRow>
))
)}
</TableBody>

            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="p-6">
            <p>Chat coming soon.</p>
          </Card>
        </TabsContent>
      </Tabs>
  {/* 
     <div className="flex justify-end">
        <Button variant="destructive" onClick={() => router.push("/dashboard/escrow")}>
          Delete Escrow
        </Button>
      </div>
       */}
    </div>
  )
}