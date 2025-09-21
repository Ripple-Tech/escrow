"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Heading } from "@/components/heading"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import {CreateEscrowModal} from "@/components/create-escrow"
import { PlusIcon } from "lucide-react"

interface DashboardPageProps {
  title: string
  children?: ReactNode
  backHref?: string
  cta?: ReactNode
  isDashboard?: boolean
}

export const DashboardPage = ({ title, children, cta, backHref, isDashboard = false, }: DashboardPageProps) => {
  const router = useRouter()
  const user = useCurrentUser();
  const shouldShowBackButton = backHref !== undefined && backHref !== null
 
  return (
    <section className="flex-1 h-full w-full flex flex-col">
      <div className="w-full p-6 sm:p-8 flex justify-between border-b border-gray-200">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-8">
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
            <div className="mb-2">
              <h1 className="text-3xl font-heading font-semibold tracking-tight text-gray-900 mb-2">
                Welcome{" "}
                <span className="text-primary">{user?.name ?? "..."}</span>
              </h1>
              <p className="text-2xl font-heading font-semibold tracking-tight text-gray-700">
                Account balance:{" "}
                <span className="text-golden-dark">
                  { user?.balance / 100}
                </span>
              </p>
            </div>
          )}

          </div>

          {cta ? <div className="w-full">
            <CreateEscrowModal>
                      <Button className="hidden md:flex w-full sm:w-fit">
                        <PlusIcon className="size-4 mr-2" />
                        Create Escrow
                      </Button>
                    </CreateEscrowModal></div> : null}
           
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-3 flex flex-col overflow-y-auto">
        {children}
      </div>
    </section>
  )
}
