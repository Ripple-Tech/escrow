"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Modal } from "./ui/modal"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { client } from "@/lib/client"
import { ESCROW_VALIDATOR } from "@/lib/validators/escrow-validator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { cn } from "@/utils"

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<EscrowForm>({
    resolver: zodResolver(ESCROW_VALIDATOR),
    defaultValues: {
      role: "SELLER",
      status: "PENDING",
      logistics: "NO",
      currency: "NGN",
    } as Partial<EscrowForm>,
  })

  const selectedColor = watch("color")
  const role = watch("role")
  const invitedRole = useMemo(() => (role === "SELLER" ? "BUYER" : "SELLER"), [role])

  const onSubmit = (data: EscrowForm) => {
    createEscrow(data)
  }

  // small input style
  const inputClass =
    "h-9 px-2 text-sm rounded-md border border-input bg-background focus:ring-1 focus:ring-blue-500 focus:outline-none"

  return (
    <>
      <div className={containerClassName} onClick={() => setIsOpen(true)}>
        {children}
      </div>

      <Modal className="max-w-2xl p-6" showModal={isOpen} setShowModal={setIsOpen}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Header */}
          <div className="pb-2 border-b">
            <h2 className="text-base font-semibold">Create Escrow</h2>
            <p className="text-xs text-muted-foreground">
              Provide transaction details below.
            </p>
          </div>

          {/* Grid form always 2 cols */}
          <div className="grid grid-cols-2 gap-2">
            {/* Product Name */}
            <div className="space-y-0.5">
              <Label htmlFor="productName" className="text-xs">Product</Label>
              <Input id="productName" {...register("productName")} placeholder="e.g. iPhone" className={inputClass} />
              {errors.productName && <p className="text-xs text-red-500">{errors.productName.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-0.5">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Input id="description" {...register("description")} placeholder="Product description" className={inputClass} />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-0.5">
              <Label htmlFor="amount" className="text-xs">Amount</Label>
              <Input type="number" step="0.01" id="amount" {...register("amount")} placeholder="100" className={inputClass} />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            {/* Quantity */}
            <div className="space-y-0.5">
              <Label htmlFor="quantity" className="text-xs">Quantity</Label>
              <Input type="number" id="quantity" {...register("quantity")} placeholder="1" className={inputClass} />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-0.5">
              <Label htmlFor="role" className="text-xs">Role</Label>
              <Select
                defaultValue="SELLER"
                onValueChange={(v) => setValue("role", v as EscrowForm["role"], { shouldValidate: true })}
              >
                <SelectTrigger id="role" className="h-9 text-sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELLER">Seller</SelectItem>
                  <SelectItem value="BUYER">Buyer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                You are the {role?.toLowerCase()}, invitee is the {invitedRole.toLowerCase()}.
              </p>
            </div>

            {/* Logistics */}
            <div className="space-y-0.5">
              <Label htmlFor="logistics" className="text-xs">Logistics</Label>
              <Select
                defaultValue="NO"
                onValueChange={(v) => setValue("logistics", v as EscrowForm["logistics"], { shouldValidate: true })}
              >
                <SelectTrigger id="logistics" className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO">No logistics</SelectItem>
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-0.5">
              <Label htmlFor="currency" className="text-xs">Currency</Label>
              <Select
                defaultValue="NGN"
                onValueChange={(v) => setValue("currency", v as EscrowForm["currency"], { shouldValidate: true })}
              >
                <SelectTrigger id="currency" className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GHS">GHS</SelectItem>
                </SelectContent>
              </Select>
            </div>

          {/* Category */}
<div className="space-y-0.5">
  <Label htmlFor="category" className="text-xs">Category</Label>
  <Select
    defaultValue="others"
    onValueChange={(v) =>
      setValue("category", v as EscrowForm["category"], { shouldValidate: true })
    }
  >
    <SelectTrigger id="category" className="h-9 text-sm">
      <SelectValue placeholder="Select Category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="electronics">Electronics</SelectItem>
      <SelectItem value="fashion">Fashion</SelectItem>
      <SelectItem value="services">Services</SelectItem>
      <SelectItem value="automobile">Automobile</SelectItem>
      <SelectItem value="others">Others</SelectItem>
    </SelectContent>
  </Select>
  {errors.category && (
    <p className="text-xs text-red-500">{errors.category.message}</p>
  )}
</div>

            {/* Photo URL */}
            <div className="space-y-0.5">
              <Label htmlFor="photoUrl" className="text-xs">Photo URL</Label>
              <Input id="photoUrl" {...register("photoUrl")} placeholder="https://..." className={inputClass} />
              {errors.photoUrl && <p className="text-xs text-red-500">{errors.photoUrl.message}</p>}
            </div>
          </div>

          {/* Compact Color (full row) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5 col-span-2">
              <Label htmlFor="color" className="text-xs">Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="color"
                  className="h-9 w-12 border rounded-md cursor-pointer"
                  value={selectedColor || "#000000"}
                  onChange={(e) => setValue("color", e.target.value, { shouldValidate: true })}
                />
                <Input
                  className={cn(inputClass, "w-28")}
                  placeholder="#000000"
                  value={selectedColor ?? ""}
                  onChange={(e) => setValue("color", e.target.value, { shouldValidate: true })}
                />
              </div>
              {errors.color && <p className="text-xs text-red-500">{errors.color.message}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" className="h-8 text-sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit" className="h-8 text-sm">
              {isPending ? "Creating..." : "Create Escrow"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}