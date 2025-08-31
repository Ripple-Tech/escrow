"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { CheckIcon } from "lucide-react"

export const PaymentSuccessModal = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    router.push("/dashboard")
  }

  return (
    <Modal
      showModal={isOpen}
      setShowModal={setIsOpen}
      onClose={handleClose}
      className="px-6 pt-6"
    >
      <div className="flex flex-col items-center">
        <div className="relative aspect-video border border-gray-200 w-full overflow-hidden rounded-lg bg-gray-50">
          <img
            src="/brand-asset-heart.png"
            className="h-full w-full object-cover"
            alt="Payment success"
          />
        </div>

        <div className="mt-6 flex flex-col items-center gap-1 text-center">
          <p className="text-lg/7 tracking-tight font-medium text-pretty">
            Upgrade successful! 🎉
          </p>
          <p className="text-gray-600 text-sm/6 text-pretty">
            Thank you for upgrading to Pro and supporting Escrow. 
            Your account has been upgraded.
          </p>
        </div>

        <div className="mt-8 w-full">
          <Button onClick={handleClose} className="h-12 w-full">
            <CheckIcon className="mr-2 size-5" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  )
}
