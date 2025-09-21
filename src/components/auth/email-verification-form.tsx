"use client"

import { CardWrapper } from "@/components/auth/card-wrapper"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { newVerification } from "@/actions/new-Verification"
import { FormError } from "@/components/forms/form-error"
import { FormSuccess } from "@/components/forms/form-success"
import { LoadingSpinner } from "@/components/loading-spinner" 

export const EmailVerificationForm = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const onSubmit = useCallback(() => {
    if (success || error) return
    if (!token) {
      setError("Missing Token")
      return
    }
    newVerification(token)
      .then((data: any) => {
        setSuccess(data.success)
        setError(data.error)
      })
      .catch(() => {
        setError("Something went wrong")
      })
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <div>
      <CardWrapper
        headerLabel="Confirming your email"
        backButtonLabel="Back to login"
        backButtonHref="/auth/login"
      >
        <div className="flex items-center w-full justify-center">
          {/* ✅ Show escrow loading spinner */}
          {!success && !error && <LoadingSpinner size="md" />}
          <FormSuccess message={success} />
          {!success && <FormError message={error} />}
        </div>
      </CardWrapper>
    </div>
  )
}
