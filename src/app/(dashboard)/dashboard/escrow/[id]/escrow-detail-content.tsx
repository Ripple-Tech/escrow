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
import { getEscrowActivity } from "@/actions/escrow-activities"
import { FaNairaSign } from "react-icons/fa6";
/* icon imports */
import {
  BadgeCheck,
  UserCheck2,
  Mail,
  MailOpen,
  Link2,
  CalendarClock,
  User2,
} from "lucide-react"
import { RiUserStarFill } from "react-icons/ri"

interface EscrowDetailContentProps {
  escrow: Escrow
  isCreator: boolean
}

export const EscrowDetailContent = ({ escrow, isCreator }: EscrowDetailContentProps) => {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/escrow/${escrow.id}`
  const [copied, setCopied] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  
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
      return await res.json()
    },
    initialData: { escrow },
    refetchOnWindowFocus: false,
  })

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await client.escrow.acceptEscrow.$post({ escrowId: escrow.id })
      return await res.json()
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["escrow", escrow.id] })
    },
  })

  const declineMutation = useMutation({
    mutationFn: async () => {
      const res = await client.escrow.declineEscrow.$post({ escrowId: escrow.id })
      return await res.json()
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["escrow", escrow.id] })
      router.push("/dashboard/escrow")
    },
  })

  useEffect(() => {
    getEscrowActivity(escrow.id).then(setActivities).catch(console.error)
  }, [escrow.id])

  if (!data?.escrow) {
    return <p>Escrow not found.</p>
  }
  const e = data.escrow

  if (!activities.length) return <p className="text-muted-foreground">No activity yet.</p>

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
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shadow-primary-glow">
              <RiUserStarFill className="w-5 h-5" />
            </span>
            {e.productName}
          </h2>
          <p className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary shadow-primary-glow">
              <FaNairaSign className="w-4 h-4" />
            </span>
            <strong>Amount:</strong> {e.amount.toString()} {e.currency}
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="shadow-primary-glow"
            >
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
        </Card>
      </div>
    )
  }

  // Full view (creator or accepted)
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-2 w-full flex">
          {tabs.map(({ value, label, icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {icon} {label}
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
          <span className="text-base font-semibold text-foreground">{e.status}</span>
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

      {!isCreator && e.senderEmail && (
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
                {activities.map((act) => (
                  <TableRow key={act.id}>
                    <TableCell>{new Date(act.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{act.action}</TableCell>
                    <TableCell>{act.user?.email ?? act.userId}</TableCell>
                  </TableRow>
                ))}
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

      <div className="flex justify-end">
        <Button variant="destructive" onClick={() => router.push("/dashboard/escrow")}>
          Delete Escrow
        </Button>
      </div>
    </div>
  )
}