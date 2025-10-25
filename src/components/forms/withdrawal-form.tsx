"use client"

import { useTransition, useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getUserPaymentMethods } from "@/actions/user.actions"
import { toast } from "sonner"

const schema = z.object({
  amount: z
    .number({ invalid_type_error: "Enter a valid number" })
    .min(100, "Minimum withdrawal is ₦100")
    .max(1_000_000, "Maximum withdrawal is ₦1,000,000"),
  paymentMethodId: z.string().min(1, "Please select a bank account"),
})

type Values = z.infer<typeof schema>

type PaymentMethod = {
  id: string;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  isDefault: boolean;
  status: string;
  verifiedAt: Date | null;
  currency: string;
}

export function WithdrawalForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loadingMethods, setLoadingMethods] = useState(true)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { 
      amount: 0,
      paymentMethodId: ""
    },
  })

  // Load payment methods using your existing function
  useEffect(() => {
    const loadPaymentMethods = async () => {
      setLoadingMethods(true);
      try {
        const methods = await getUserPaymentMethods();
        setPaymentMethods(methods);
      } catch (error) {
        console.error("Failed to load payment methods:", error);
        toast.error("Failed to load payment methods");
      } finally {
        setLoadingMethods(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const onSubmit = (values: Values) => {
    setError(null)
    startTransition(async () => {
      try {
        const endpoint = "/api/paystack/withdraw"
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? data.message ?? "Withdrawal failed")
          return
        }
        onSuccess()
      } catch {
        setError("Unexpected error, please try again")
      }
    })
  }

  const selectedPaymentMethod = paymentMethods.find(
    method => method.id === form.watch("paymentMethodId")
  )

  if (loadingMethods) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading payment methods...</p>
        </div>
      </div>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No payment methods added yet.</p>
          <p className="text-sm text-muted-foreground">
            Please add a bank account to make withdrawals.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods Display as Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Select Bank Account</h3>
        </div>
        
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card 
              key={method.id} 
              className={`
                cursor-pointer transition-all duration-200
                ${form.watch("paymentMethodId") === method.id 
                  ? "border-primary border-2 bg-primary/5" 
                  : method.isDefault 
                    ? "border-primary border-2" 
                    : "border-border"
                }
                hover:border-primary/50
              `}
              onClick={() => form.setValue("paymentMethodId", method.id)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{method.bankName}</h4>
                      {method.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                      {form.watch("paymentMethodId") === method.id && (
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Account: {method.accountNumber} • {method.accountName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Currency: {method.currency}
                      {method.verifiedAt && ` • Verified: ${new Date(method.verifiedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Withdrawal Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Withdrawal Amount (₦)</FormLabel>
                <Input
                  type="number"
                  placeholder="1000"
                  min="100"
                  step="1"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]*$/.test(value)) {
                      field.onChange(value ? Number(value) : 0);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hidden payment method field - selection is done via card clicks */}
          <FormField
            control={form.control}
            name="paymentMethodId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedPaymentMethod && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-2">Selected Bank Account</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Bank:</span>
                  <p className="font-medium">{selectedPaymentMethod.bankName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Number:</span>
                  <p className="font-medium">{selectedPaymentMethod.accountNumber}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Account Name:</span>
                  <p className="font-medium">{selectedPaymentMethod.accountName}</p>
                </div>
              </div>
            </div>
          )}

          {!form.watch("paymentMethodId") && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                Please select a bank account from the list above to continue.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isPending || !form.watch("paymentMethodId")}
            className="w-full"
          >
            {isPending ? "Processing Withdrawal…" : "Withdraw Funds"}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            <p>Withdrawals are processed within 24 hours</p>
            <p>Minimum withdrawal: ₦100 • Maximum withdrawal: ₦1,000,000</p>
          </div>
        </form>
      </Form>
    </div>
  )
}