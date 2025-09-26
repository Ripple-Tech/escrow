"use client"

import { LoadingSpinner } from "@/components/loading-spinner"
import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Upload,
  Repeat,
} from "lucide-react"
import { FaNairaSign } from "react-icons/fa6"
import { cn } from "@/utils"

type Tx = {
  id: string
  userId: string
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER"
  status: "PENDING" | "SUCCESS" | "FAILED"
  reference: string
  amount: number
  currency: "NGN" | "USD" | "GHS"
  direction: "DEBIT" | "CREDIT"
  createdAt: Date
  updatedAt: Date
}

const typeMeta: Record<
  Tx["type"],
  { label: string; Icon: any; color: string; dot: string }
> = {
  DEPOSIT: {
    label: "Deposit",
    Icon: Download, // downward arrow into tray
    color: "text-emerald-600",
    dot: "bg-emerald-100",
  },
  WITHDRAW: {
    label: "Withdraw",
    Icon: Upload, // upward arrow out of tray
    color: "text-red-600",
    dot: "bg-red-100",
  },
  TRANSFER: {
    label: "Transfer",
    Icon: Repeat, // swap arrows
    color: "text-indigo-600",
    dot: "bg-indigo-100",
  },
}

export const TransactionContent = () => {
  const { data: transactions, isPending } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: async (): Promise<Tx[]> => {
      const res = await client.transaction.listTransactions.$get()
      const { transactions } = await res.json()
      // If your superjson returns strings, you can cast Dates:
      return transactions.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }))
    },
  })

  if (isPending) {
    return (
      <div className="flex items-center justify-center flex-1 h-full w-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return <div>No transactions found</div>
  }

  return (
    <ul className="grid max-w-6xl grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {transactions.map((tx) => {
        const isCredit = tx.direction === "CREDIT"
        const statusIcon =
          tx.status === "SUCCESS" ? (
            <CheckCircle className="size-4 text-emerald-600" />
          ) : tx.status === "PENDING" ? (
            <Clock className="size-4 text-amber-600" />
          ) : (
            <XCircle className="size-4 text-red-600" />
          )

        const DirectionIcon = isCredit ? ArrowDownRight : ArrowUpRight
        const amountPrefix = isCredit ? "+" : "-"

        const meta = typeMeta[tx.type]

        return (
          <li
            key={tx.id}
            className="relative group z-10 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="absolute z-0 inset-px rounded-lg bg-white" />
            <div className="pointer-events-none z-0 absolute inset-px rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md ring-1 ring-black/5" />

            <div className="relative p-6 z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg/7 font-medium tracking-tight text-gray-950">
                    {meta.label} {tx.direction}
                  </h3>
                  <p className="text-sm/6 text-gray-600">
                    {format(tx.createdAt, "MMM d, yyyy")}
                  </p>
                </div>

                <span
                  className={cn(
                    "text-sm font-semibold flex items-center",
                    isCredit ? "text-emerald-700" : "text-gray-700"
                  )}
                >
                  <FaNairaSign
                    className={cn(
                      "size-4 mr-1",
                      isCredit ? "text-emerald-600" : "text-brand-500"
                    )}
                  />
                  {amountPrefix}
                  {tx.amount} {tx.currency}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm/5 text-gray-600">
                  <DirectionIcon
                    className={cn(
                      "size-4 mr-2",
                      isCredit ? "text-emerald-600" : "text-brand-500"
                    )}
                  />
                  <span className="font-medium">Transaction:</span>
                  <span className="ml-1">{tx.direction}</span>
                </div>

                <div className="flex items-center text-sm/5 text-gray-600">
                  {statusIcon}
                  <span className="font-medium ml-2">Status:</span>
                  <span className="ml-1">{tx.status}</span>
                </div>

                <div className="flex items-center text-sm/5 text-gray-600">
                  <meta.Icon className={cn("size-4 mr-2", meta.color)} />
                  <span className="font-medium">Type:</span>
                  <span className={cn("ml-1", meta.color)}>{meta.label}</span>
                </div>

                <div className="flex items-center text-sm/5 text-gray-600">
                  <span className="font-medium">Reference:</span>
                  <span className="ml-1 break-all">{tx.reference}</span>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}