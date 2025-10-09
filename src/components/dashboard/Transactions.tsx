"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/utils";
import { Modal } from "@/components/ui/modal";
import { DepositForm } from "@/components/forms/deposit-form";
import { CreateEscrowModal } from "../create-escrow";
import {
  Plus, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Users,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

function useWallet() {
  return { balance: 152340.55, currency: "NGN" };
}

function formatMoney(amount: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

type CoreAction = {
  key: "deposit" | "withdraw" | "transfer";
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
};

export default function Transaction() {
  const user = useCurrentUser();
  const { balance, currency } = useWallet();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const coreActions: CoreAction[] = useMemo(
    () => [
      { key: "deposit", label: "Deposit", icon: ArrowDownToLine, onClick: () => setShowDepositModal(true) },
      { key: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
      { key: "transfer", label: "Transfer", icon: ArrowLeftRight },
    ],
    []
  );

  const invited = useMemo(
    () => [
      { id: "1", name: "Ayo", image: user?.image || undefined },
      { id: "2", name: "Zara", image: undefined },
      { id: "3", name: "Ken", image: undefined },
      { id: "4", name: "Mina", image: undefined },
      { id: "5", name: "Dee", image: undefined },
    ],
    [user]
  );

  const topInvited = invited.slice(0, 4);

  return (
    <div className="mx-auto w-full px-3 py-3 sm:px-4 md:px-6 md:py-5">
      {/* Balance Card */}
      <section className="mx-auto max-w-md md:max-w-2xl">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-primary-glass dark:bg-brand.glassmorphism",
            "backdrop-blur-xl border border-amber-500/20 "
          )}
        >
          
          <div className="relative flex flex-col items-center text-center px-4 py-4 md:px-6 md:py-6">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.16em] text-muted-foreground/80">
              Current Balance
            </span>
            <div className="mt-1.5 md:mt-2 flex items-baseline gap-1.5 md:gap-2">
              <h2 className="text-[22px] md:text-3xl font-extrabold text-golden-dark">
                {formatMoney(balance, currency)}
              </h2>
            </div>
            <div className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-muted-foreground">
              Available • Escrow-ready
            </div>
          </div>
        </div>
      </section>

      {/* Actions Row (Deposit / Withdraw / Transfer) */}
      <section className="mx-auto mt-3 md:mt-4 max-w-md md:max-w-2xl">
        <div
          className={cn(
            "relative rounded-xl border border-amber-500/20 ",
            "bg-background/60 dark:bg-brand.glassmorphism backdrop-blur-xl"
          )}
        >
          <div className="relative grid grid-cols-3 divide-x divide-amber-500/15">
            {coreActions.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={a.onClick}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1.5",
                  "px-3 py-3 md:px-4 md:py-4 transition-colors",
                  "hover:bg-amber-500/5 active:scale-[0.995]"
                )}
                aria-label={a.label}
              >
                <span className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-400/20 group-hover:ring-amber-400/30 transition">
                  <a.icon className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                </span>
                <span className="text-[12px] md:text-sm font-semibold text-foreground">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Invite Friends */}
      <section className="mx-auto mt-3 md:mt-4 max-w-md md:max-w-2xl">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-amber-500/20 ",
            "bg-primary-glass dark:bg-brand.glassmorphismlight backdrop-blur-xl"
          )}
        >
          
          <div className="relative flex flex-col gap-3 md:gap-4 px-4 py-4 md:px-6 md:py-5">
            <div className="flex items-center gap-2.5 md:gap-3">
              <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-400/20 text-amber-600">
                <Users className="h-4 w-4 md:h-5 md:w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-foreground">
                  Invite friends
                </h3>
                <p className="text-[11px] md:text-xs text-muted-foreground">
                  Earn ₦500 for each friend you invite.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Avatars */}
              <div className="flex -space-x-2.5 md:-space-x-3">
                {topInvited.map((f) => (
                  <div
                    key={f.id}
                    className="relative h-8 w-8 md:h-9 md:w-9 rounded-full border border-border/70 bg-muted/40 shadow-primary-glow overflow-hidden"
                    title={f.name ?? "Invited friend"}
                  >
                    {f.image ? (
                      <Image
                        src={f.image}
                        alt={f.name ?? "Invited friend"}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-background">
                        <span className="text-[10px] md:text-xs font-medium text-muted-foreground">
                          {f.name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {invited.length > 4 ? (
                  <div className="relative h-8 w-8 md:h-9 md:w-9 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-700 flex items-center justify-center text-[10px] md:text-xs font-semibold">
                    +{invited.length - 4}
                  </div>
                ) : null}
              </div>

              {/* See all */}
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
                  "border border-amber-500/30 bg-background/60 hover:bg-amber-500/10",
                  "text-[11px] md:text-xs font-semibold text-foreground shadow-primary-glow transition"
                )}
                onClick={() => {
                  // Implement your modal or route push to full friends list
                }}
              >
                See all
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Keep a little breathing room for history preview */}
      <div className="h-3 md:h-4" />

      {/* Mobile Create Escrow FAB (smaller) */}
      <CreateEscrowModal>
        <button
          className="flex md:hidden fixed bottom-20 right-4 z-20 items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-primary-glow hover:bg-amber-600/90 transition-colors duration-200"
          aria-label="Create Escrow"
        >
          <Plus className="h-7 w-7 drop-shadow-sm" />
        </button>
      </CreateEscrowModal>

      {/* Deposit modal */}
      <Modal showModal={showDepositModal} setShowModal={setShowDepositModal} className="max-w-sm p-0">
        <div className="rounded-xl overflow-hidden bg-background">
          <div className="px-4 py-3 md:px-5 md:py-4 border-b border-amber-500/20">
            <h4 className="text-base md:text-lg font-semibold">Deposit funds</h4>
            <p className="text-[11px] md:text-xs text-muted-foreground">Securely top up your wallet</p>
          </div>
          <div className="p-4 md:p-5">
            <DepositForm onSuccess={() => setShowDepositModal(false)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}