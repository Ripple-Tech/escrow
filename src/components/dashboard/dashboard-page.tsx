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
    <section className="flex-1 h-full w-full flex flex-col">
      <div className="w-full p-6 sm:p-8 flex justify-between border-b border-gray-200">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            {shouldShowBackButton ? (
              <Button
                onClick={() => router.push(backHref!)}
                className="w-fit bg-white"
                variant="outline"
              >
                <ArrowLeft className="size-4" />
              </Button>
            ) : null}

            {!isDashboard && <Heading>{title}</Heading>}

            {isDashboard && (
              <div>
                <h1 className="text-3xl font-heading font-semibold tracking-tight text-gray-900 mb-2">
                  Welcome <span className="text-primary">{user?.name ?? "..."}</span>
                </h1>
                <p className="text-2xl font-heading font-semibold tracking-tight text-gray-700">
                  Account balance: <span className="text-golden-dark">{user?.balance / 100}</span>
                </p>
              </div>
            )}
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
                <Button size="sm" className="hidden md:block bg-primary text-white hover:bg-amber-800">
                  + Create Escrow
                </Button>
              </CreateEscrowModal>

              {/* Mobile floating button wrapped too */}
              <CreateEscrowModal>
                <button
                  className="flex md:hidden fixed bottom-20 right-8 z-20 items-center justify-center h-16 w-16 rounded-full bg-primary text-white shadow-lg hover:bg-amber-700 transition-colors duration-200"
                >
                  <Plus className="h-12 w-12" />
                </button>
              </CreateEscrowModal>
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
