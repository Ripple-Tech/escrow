"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { formatDistanceToNow } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Repeat, Upload, Download } from "lucide-react";
import { cn } from "@/utils";
import { FaNairaSign } from "react-icons/fa6";

type Tx = {
  id: string;
  type: "DEPOSIT" | "FEE" | "WITHDRAW" | "TRANSFER";
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  currency: "NGN" | "USD" | "GHS";
  direction: "DEBIT" | "CREDIT";
  reference: string;
  createdAt: Date;
};

type TransactionPreviewProps = {
  initialTransactions?: Tx[];
};

const typeMeta: Record<
  Tx["type"],
  { label: string; Icon: any; color: string }
> = {
  DEPOSIT: { label: "Deposit", Icon: Download, color: "text-emerald-600" },
  WITHDRAW: { label: "Withdraw", Icon: Upload, color: "text-red-600" },
  TRANSFER: { label: "Transfer", Icon: Repeat, color: "text-indigo-600" },
  FEE: { label: "Fee", Icon: Repeat, color: "text-amber-600" },
};

export const TransactionPreview = ({ initialTransactions = [] }: TransactionPreviewProps) => {
  const { data: transactions = initialTransactions, refetch } = useQuery({
    queryKey: ["transaction-preview"],
    queryFn: async (): Promise<Tx[]> => {
      const res = await client.transaction.listTransactions.$get();
      const data = await res.json();

      if (!data?.transactions || !Array.isArray(data.transactions)) {
        return [];
      }

      return (
        data.transactions
          .map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          }))
          // sort newest first
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 3) // limit to latest 3
      );
    },
    initialData: initialTransactions,
    refetchInterval: 15000, // automatically update every 15s
    refetchOnWindowFocus: true,
  });

  if (!transactions || transactions.length === 0) {
    return (
      <section className="mx-auto mt-3 md:mt-4 max-w-md md:max-w-2xl">
        <div className="rounded-xl border border-amber-500/20 bg-background/60 dark:bg-brand.glassmorphism backdrop-blur-xl p-4 text-sm text-muted-foreground text-center">
          No transactions found
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-3 md:mt-4 max-w-md md:max-w-2xl">
      <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-background/60 dark:bg-brand.glassmorphism backdrop-blur-xl">
        <ul className="divide-y divide-amber-500/10">
          {transactions.map((tx) => {
            const isCredit = tx.direction === "CREDIT";
            const { Icon, color, label } = typeMeta[tx.type] || {};
            const DirectionIcon = isCredit ? ArrowDownRight : ArrowUpRight;

            return (
              <li
                key={tx.id}
                className="flex items-center justify-between px-4 py-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-400/20",
                      color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(tx.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm font-semibold">
                  <FaNairaSign
                    className={cn(
                      "size-3 mr-1",
                      isCredit ? "text-emerald-600" : "text-red-500"
                    )}
                  />
                  <span
                    className={isCredit ? "text-emerald-700" : "text-gray-700"}
                  >
                    {isCredit ? "+" : "-"}
                    {tx.amount}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};