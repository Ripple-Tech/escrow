"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Heading } from "@/components/heading"
import { useRouter } from "next/navigation"

interface DashboardPageProps {
  title: string
  children?: ReactNode
  hideBackButton?: boolean
  cta?: ReactNode
  onBackButtonClick?: () => void // New optional prop for custom back button behavior
}

export const DashboardPage = ({
  title,
  children,
  cta,
  hideBackButton,
  onBackButtonClick,
}: DashboardPageProps) => {
  const router = useRouter()

  const handleBackClick = () => {
    // If a custom function is provided, use it.
    // Otherwise, fall back to the default navigation.
    if (onBackButtonClick) {
      onBackButtonClick()
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <section className="flex-1 h-full w-full flex flex-col">
      <div className="w-full p-6 sm:p-8 flex justify-between border-b border-gray-200">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-8">
            {hideBackButton ? null : (
              <Button
                onClick={handleBackClick} // Use the new handler
                className="w-fit bg-white"
                variant="outline"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}

            <Heading>{title}</Heading>
          </div>

          {cta ? <div className="w-full">{cta}</div> : null}
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-3 flex flex-col overflow-y-auto">
        {children}
      </div>
    </section>
  )
}
