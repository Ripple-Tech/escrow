"use client"

import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { client } from "@/lib/client"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/heading"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, BarChart } from "lucide-react"
import { Escrow } from "@prisma/client"

interface EscrowDetailContentProps {
  escrow: Escrow
}

export const EscrowDetailContent = ({ escrow }: EscrowDetailContentProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview")

  // fetch escrow details (polling)
  const { data, isFetching } = useQuery({
    queryKey: ["escrow", escrow.id],
    queryFn: async () => {
      const res = await client.escrow.getEscrowById.$get({ id: escrow.id })
      return await res.json()
    },
    initialData: { escrow },
    refetchOnWindowFocus: false,
  })

  if (!data?.escrow) {
    return <p>Escrow not found.</p>
  }

  const e = data.escrow

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">{e.productName}</h2>
            <p className="text-muted-foreground mb-2">{e.description}</p>

            <div className="space-y-2">
              <p><strong>Amount:</strong> {e.amount.toString()} {e.currency}</p>
              <p><strong>Status:</strong> {e.status}</p>
              <p><strong>Role:</strong> {e.role}</p>
              {e.receiverEmail && <p><strong>Receiver Email:</strong> {e.receiverEmail}</p>}
            </div>
          </Card>
        </TabsContent>

        {/* Activity Tab (placeholder for now) */}
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
                <TableRow>
                  <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>{e.senderId}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
