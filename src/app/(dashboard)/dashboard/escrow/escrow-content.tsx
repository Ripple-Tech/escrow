"use client"

import { LoadingSpinner } from "@/components/loading-spinner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { client } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { ArrowRight, Clock, DollarSign, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
export const EscrowContent = () => {
  const [deletingEscrow, setDeletingEscrow] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: escrows, isPending: isEscrowsLoading } = useQuery({
    queryKey: ["user-escrows"],
    queryFn: async () => {
      const res = await client.escrow.getEscrows.$get()
      const { escrows } = await res.json()
      return escrows
    },
  })

  const { mutate: deleteEscrow, isPending: isDeletingEscrow } = useMutation({
    mutationFn: async (id: string) => {
      // you’ll need to add a deleteEscrow endpoint in escrowRouter
      await client.escrow.deleteEscrow.$post({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-escrows"] })
      setDeletingEscrow(null)
    },
  })

  if (isEscrowsLoading) {
    return (
      <div className="flex items-center justify-center flex-1 h-full w-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (!escrows || escrows.length === 0) {
    return <div>No escrows found </div>
   // return <DashboardEmptyState />
  }

  return (
    <>
      <ul className="grid max-w-6xl grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {escrows.map((escrow: any) => (
          <li
            key={escrow.id}
            className="relative group z-10 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="absolute z-0 inset-px rounded-lg bg-white" />

            <div className="pointer-events-none z-0 absolute inset-px rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md ring-1 ring-black/5" />

            <div className="relative p-6 z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg/7 font-medium tracking-tight text-gray-950">
                    {escrow.productName}
                  </h3>
                  <p className="text-sm/6 text-gray-600">
                    {format(escrow.createdAt, "MMM d, yyyy")}
                  </p>
                </div>

                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <DollarSign className="size-4 mr-1 text-brand-500" />
                  {escrow.amount} {escrow.currency}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm/5 text-gray-600">
                  <Clock className="size-4 mr-2 text-brand-500" />
                  <span className="font-medium">Status:</span>
                  <span className="ml-1">{escrow.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link
                  href={`/dashboard/escrow/${escrow.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "flex items-center gap-2 text-sm",
                  })}
                >
                  View <ArrowRight className="size-4" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  aria-label={`Delete escrow ${escrow.productName}`}
                  onClick={() => setDeletingEscrow(escrow.id)}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        showModal={!!deletingEscrow}
        setShowModal={() => setDeletingEscrow(null)}
        className="max-w-md p-8"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
              Delete Escrow
            </h2>
            <p className="text-sm/6 text-gray-600">
              Are you sure you want to delete this escrow? This action cannot be
              undone.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setDeletingEscrow(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingEscrow && deleteEscrow(deletingEscrow)}
              disabled={isDeletingEscrow}
            >
              {isDeletingEscrow ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
