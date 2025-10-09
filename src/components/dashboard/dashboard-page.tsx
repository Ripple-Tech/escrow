"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { Heading } from "@/components/heading"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { CreateEscrowModal } from "@/components/create-escrow"

interface DashboardPageProps {
  title: string
  children?: ReactNode
  backHref?: string
  showCreate?: boolean
  cta?: ReactNode
  isDashboard?: boolean
}

export const DashboardPage = ({
  title,
  children,
  cta,
  backHref,
  showCreate = false,
  isDashboard = false,
}: DashboardPageProps) => {
  const router = useRouter()
  const user = useCurrentUser()
  const shouldShowBackButton = !!backHref

  return (
    <section className="flex-1 h-full w-full flex flex-col mb-20">
      <div className="w-full p-6 sm:p-8 flex justify-between border-b border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            {shouldShowBackButton ? (
              <Button
                onClick={() => router.push(backHref!)}
                className="w-fit bg-background text-foreground hover:bg-muted/60 ring-1 ring-border shadow-none"
                variant="outline"
              >
                <ArrowLeft className="size-4" />
              </Button>
            ) : null}

            {!isDashboard && (
              <Heading className="text-foreground">
                {title}
              </Heading>
            )}

            {/* {isDashboard && (
              <div>
                <h1 className="text-3xl font-heading font-semibold tracking-tight text-foreground mb-2">
                  Welcome{" "}
                  <span className="text-primary shadow-primary-glow inline-block">
                    {user?.name ?? "..."}
                  </span>
                </h1>
                <p className="text-2xl font-heading font-semibold tracking-tight text-muted-foreground">
                  Account balance:{" "}
                  <span className="text-golden-dark">{(user?.balance ?? 0) / 100}</span>
                </p>
              </div>
            )} */}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* preserve any custom CTA passed in (it may already be a CreateEscrowModal wrapper) */}
          {cta}

          {showCreate && (
            <>
              {/* Desktop button wrapped so CreateEscrowModal manages opening */}
              <CreateEscrowModal>
                <Button
                  size="sm"
                  className="hidden md:block bg-primary text-primary-foreground hover:bg-amber-600/90 shadow-primary-glow"
                >
                  + Create Escrow
                </Button>
              </CreateEscrowModal>

              {/* Mobile floating button wrapped too (position unchanged) */}
              
             
              
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-3 flex flex-col overflow-y-auto">
        {children}
      </div>
    </section>
  )
}