"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Modal } from "./ui/modal"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { client } from "@/lib/client"
import { ESCROW_VALIDATOR } from "@/lib/validators/escrow-validator"

type EscrowForm = z.infer<typeof ESCROW_VALIDATOR>

interface CreateEscrowModalProps extends PropsWithChildren {
  containerClassName?: string
}

export const CreateEscrowModal = ({
  children,
  containerClassName,
}: CreateEscrowModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: createEscrow, isPending } = useMutation({
    mutationFn: async (data: EscrowForm) => {
      return client.escrow.createEscrow.$post(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] })
      setIsOpen(false)
    },
    onError: (err: any) => {
      console.error("Create escrow failed:", err)
      alert(err?.message || "Failed to create escrow")
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EscrowForm>({
    resolver: zodResolver(ESCROW_VALIDATOR),
  })

  const onSubmit = (data: EscrowForm) => {
    createEscrow(data)
  }

  return (
    <>
      <div className={containerClassName} onClick={() => setIsOpen(true)}>
        {children}
      </div>

      <Modal
        className="max-w-xl p-8"
        showModal={isOpen}
        setShowModal={setIsOpen}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">New Escrow</h2>
            <p className="text-sm text-gray-600">
              Create an escrow transaction as a seller.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                {...register("productName")}
                placeholder="e.g. iPhone 15 Pro Max"
              />
              {errors.productName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.productName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Optional description..."
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                id="amount"
                {...register("amount")}
                placeholder="100"
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register("currency")}
                placeholder="USD"
              />
              {errors.currency && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.currency.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="receiverEmail">Receiver Email</Label>
              <Input
                id="receiverEmail"
                {...register("receiverEmail")}
                placeholder="buyer@example.com"
              />
              {errors.receiverEmail && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.receiverEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create Escrow"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}