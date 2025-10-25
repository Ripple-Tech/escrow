"use client"

import { WithdrawalForm } from "@/components/forms/withdrawal-form"
import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function WithdrawalPage() {
  const [success, setSuccess] = useState(false)

  const handleSuccess = () => {
    setSuccess(true)
    toast.success("Withdrawal initiated successfully!")
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Withdrawal Successful!</h2>
              <p className="text-muted-foreground mb-4">
                Your withdrawal has been initiated and is being processed. 
                Funds will be transferred to your bank account within 24 hours.
              </p>
              <Button onClick={() => setSuccess(false)}>
                Make Another Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <WithdrawalForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}