"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem,SelectValue, } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";

import { toast } from "sonner";

// Import your form components
import { FormError } from "@/components/forms/form-error";
import { FormSuccess } from "@/components/forms/form-success";

// Server actions
import {
  upsertUserBvn,
  listBanks,
  verifyAndCreatePaymentMethod,
  getUserPaymentMethods,
} from "@/actions/user.actions";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { useParams } from "next/navigation";

type Props = {
  userHasBvn: boolean;
};

const bvnSchema = z.object({
  bvn: z
    .string()
    .min(11, "BVN must be exactly 11 characters")
    .max(11, "BVN must be exactly 11 characters")
    .regex(/^\d{11}$/, "BVN must contain only numbers"),
});

const bankSchema = z.object({
  bankCode: z.string().min(1, "Select bank"),
  bankName: z.string().min(1, "Select bank"),
  accountNumber: z
    .string()
    .min(10, "Account number must be 10 digits")
    .max(10, "Account number must be 10 digits")
    .regex(/^\d{10}$/, "Account number must be 10 digits"),
  setDefault: z.boolean().optional(),
  bvn: z.string().min(11, "BVN must be 11 digits").max(11, "BVN must be 11 digits").optional(),
});

type BankItem = { name: string; code: string; id: string; slug?: string };
type PaymentMethod = {
  id: string;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  isDefault: boolean;
  status: string;
  verifiedAt: Date | null;
  currency: string;
};

export default function PaymentClientPage({ userHasBvn: initialHasBvn }: Props) {
  const [userHasBvn, setUserHasBvn] = useState<boolean>(initialHasBvn);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);
  const [autoVerifying, setAutoVerifying] = useState<boolean>(false);
  const [createdOnce, setCreatedOnce] = useState<boolean>(false);
  const [needsBvnForVerification, setNeedsBvnForVerification] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState<boolean>(true);
  
  // State for form messages
  const [bvnFormMessage, setBvnFormMessage] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [bankFormMessage, setBankFormMessage] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Prevent rapid duplicate submissions while user types
  const inFlightRef = useRef<boolean>(false);

  // Forms
  const bvnForm = useForm<z.infer<typeof bvnSchema>>({
    resolver: zodResolver(bvnSchema),
    defaultValues: { bvn: "" },
    mode: "onSubmit",
  });

  const bankForm = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankCode: "",
      bankName: "",
      accountNumber: "",
      setDefault: false,
      bvn: "",
    },
    mode: "onChange",
  });

  // Load payment methods on component mount
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!userHasBvn) return;
      
      setLoadingPaymentMethods(true);
      try {
        const methods = await getUserPaymentMethods();
        setPaymentMethods(methods);
      } catch (error) {
        console.error("Failed to load payment methods:", error);
        toast.error("Failed to load payment methods");
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    loadPaymentMethods();
  }, [userHasBvn, createdOnce]);

  // Clear messages when form values change
  useEffect(() => {
    const subscription = bankForm.watch(() => {
      setBankFormMessage(null);
    });
    return () => subscription.unsubscribe();
  }, [bankForm]);

  // Load banks when user has BVN
  useEffect(() => {
    const run = async () => {
      if (!userHasBvn) return;
      setLoadingBanks(true);
      try {
        const list = await listBanks();
        setBanks(list);
        toast.success("Banks loaded successfully");
      } catch {
        setBankFormMessage({ type: 'error', message: "Failed to load banks" });
        toast.error("Failed to load banks");
      } finally {
        setLoadingBanks(false);
      }
    };
    run();
  }, [userHasBvn]);

  // Keep bankName synchronized with bankCode
  useEffect(() => {
    const sub = bankForm.watch((v) => {
      const chosen = banks.find((b) => b.code === v.bankCode);
      if (chosen && chosen.name !== v.bankName) {
        bankForm.setValue("bankName", chosen.name, { shouldDirty: true });
      }
      if (!chosen && v.bankName) {
        bankForm.setValue("bankName", "", { shouldDirty: true });
      }
    });
    return () => sub.unsubscribe();
  }, [banks, bankForm]);

  // Derived condition: ready to auto-verify and create
  const readyToAutoVerify = useMemo(() => {
    const v = bankForm.getValues();
    const hasBank = !!v.bankCode;
    const hasAccount = v.accountNumber?.length === 10;
    const hasBvnIfNeeded = !needsBvnForVerification || (needsBvnForVerification && v.bvn?.length === 11);
    
    return hasBank && hasAccount && hasBvnIfNeeded;
  }, [bankForm, needsBvnForVerification]);

  // Auto-verify and create when account number hits 10 digits (and bank is chosen)
  useEffect(() => {
    const sub = bankForm.watch(async (v, { name }) => {
      if (!userHasBvn || !showAddForm) return;
      
      // Trigger only when relevant fields change and meet conditions
      if (
        (name === "accountNumber" || name === "bankCode" || name === "setDefault" || name === "bvn") &&
        v.bankCode &&
        v.accountNumber?.length === 10 &&
        (!needsBvnForVerification || (needsBvnForVerification && v.bvn?.length === 11)) &&
        !inFlightRef.current
      ) {
        inFlightRef.current = true;
        setAutoVerifying(true);
        setBankFormMessage(null); // Clear previous messages
        
        try {
          const created = await verifyAndCreatePaymentMethod({
            bankCode: v.bankCode,
            bankName: v.bankName || (banks.find((b) => b.code === v.bankCode)?.name ?? ""),
            accountNumber: v.accountNumber,
            setDefault: v.setDefault,
            bvn: v.bvn, // Pass BVN when needed
          });

          const successMessage = `Payment method verified and added: ${created.accountName || "Account"}`;
          setBankFormMessage({ 
            type: 'success', 
            message: successMessage
          });
          toast.success(successMessage);
          setCreatedOnce(true);
          setNeedsBvnForVerification(false);
          setShowAddForm(false);

          // Reset the form so we don't immediately re-trigger
          bankForm.reset({
            bankCode: "",
            bankName: "",
            accountNumber: "",
            setDefault: false,
            bvn: "",
          });
        } catch (e: any) {
          const msg = e?.message || "Failed to create payment method";
          
          if (/BVN required/i.test(msg)) {
            const errorMsg = "BVN is required for account verification.";
            setBankFormMessage({ type: 'error', message: errorMsg });
            toast.error(errorMsg);
            setNeedsBvnForVerification(true);
          } else if (/BVN mismatch/i.test(msg)) {
            const errorMsg = "BVN mismatch. Please confirm your BVN.";
            setBankFormMessage({ type: 'error', message: errorMsg });
            toast.error(errorMsg);
            setNeedsBvnForVerification(true);
          } else if (/Account name verification failed/i.test(msg)) {
            setBankFormMessage({ type: 'error', message: msg });
            toast.error(msg);
          } else if (/unique|already exists|duplicate/i.test(msg)) {
            const errorMsg = "This bank account already exists on your profile.";
            setBankFormMessage({ type: 'error', message: errorMsg });
            toast.error(errorMsg);
          } else {
            setBankFormMessage({ type: 'error', message: `Verification failed: ${msg}` });
            toast.error(`Verification failed: ${msg}`);
          }
        } finally {
          setAutoVerifying(false);
          inFlightRef.current = false;
        }
      }
    });

    return () => sub.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasBvn, banks, needsBvnForVerification, showAddForm]);

  const onSaveBvn = async (values: z.infer<typeof bvnSchema>) => {
    setBvnFormMessage(null); // Clear previous messages
    try {
      await upsertUserBvn(values.bvn);
      setUserHasBvn(true);
      const successMsg = "Your BVN has been securely saved.";
      setBvnFormMessage({ type: 'success', message: successMsg });
      toast.success(successMsg);
    } catch {
      const errorMsg = "Failed to save BVN";
      setBvnFormMessage({ type: 'error', message: errorMsg });
      toast.error(errorMsg);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowAddForm(true);
    setBankFormMessage(null);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setBankFormMessage(null);
    bankForm.reset();
  };

  const { id } = useParams<{ id: string }>();

  // Render payment method cards
  const renderPaymentMethods = () => {
    if (loadingPaymentMethods) {
      return (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading payment methods...</p>
        </div>
      );
    }

    if (paymentMethods.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No payment methods added yet.</p>
          <Button onClick={handleAddPaymentMethod}>
            Add Payment Method
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Payment Methods</h3>
         
        </div>
        
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.isDefault ? "border-primary border-2" : ""}>
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
        <div className="flex justify-end">
         <Button onClick={handleAddPaymentMethod} variant="outline">
            Add Another
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DashboardPage title="Payment Methods" backHref={`/dashboard/profile/${id}`}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!userHasBvn ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please provide your BVN to continue. We store a secure hash,
                  not the raw BVN.
                </p>
                
                {/* BVN Form Messages */}
                <FormError message={bvnFormMessage?.type === 'error' ? bvnFormMessage.message : undefined} />
                <FormSuccess message={bvnFormMessage?.type === 'success' ? bvnFormMessage.message : undefined} />
                
                <Form {...bvnForm}>
                  <form className="space-y-4" onSubmit={bvnForm.handleSubmit(onSaveBvn)} >
                    <FormField
                      control={bvnForm.control}
                      name="bvn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BVN</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your 11-digit BVN"
                              maxLength={11}
                              {...field}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                                field.onChange(v);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={bvnForm.formState.isSubmitting} >
                      {bvnForm.formState.isSubmitting ? "Saving..." : "Save BVN"}
                    </Button>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Show payment methods or add button */}
                {!showAddForm && renderPaymentMethods()}

                {/* Show add form when requested */}
                {showAddForm && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-base">Add Bank Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Select your bank and enter your 10-digit account number. We'll
                        verify it and add the payment method automatically.
                      </p>
                    </div>

                    {/* Bank Form Messages */}
                    <FormError message={bankFormMessage?.type === 'error' ? bankFormMessage.message : undefined} />
                    <FormSuccess message={bankFormMessage?.type === 'success' ? bankFormMessage.message : undefined} />

                    <Form {...bankForm}>
                      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={bankForm.control}
                            name="bankCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank</FormLabel>
                                <Select
                                  onValueChange={(val) => field.onChange(val)}
                                  value={field.value}
                                  disabled={loadingBanks || autoVerifying}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          loadingBanks ? "Loading banks..." : "Select bank"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-72">
                                    {banks.map((b) => (
                                      <SelectItem key={b.code} value={b.code}>
                                        {b.name} ({b.code})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Hidden bankName form field, auto-populated */}
                          <FormField
                            control={bankForm.control}
                            name="bankName"
                            render={({ field }) => <input type="hidden" {...field} />}
                          />

                          <FormField
                            control={bankForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input
                                    inputMode="numeric"
                                    placeholder="0123456789"
                                    maxLength={10}
                                    disabled={autoVerifying}
                                    {...field}
                                    onChange={(e) => {
                                      const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                                      field.onChange(v);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {needsBvnForVerification && (
                            <FormField
                              control={bankForm.control}
                              name="bvn"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>BVN Verification</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Enter your BVN to verify this account"
                                      maxLength={11}
                                      disabled={autoVerifying}
                                      {...field}
                                      onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                                        field.onChange(v);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm">Set as default</Label>
                            <p className="text-xs text-muted-foreground">
                              Use this account for payouts by default.
                            </p>
                          </div>
                          <FormField
                            control={bankForm.control}
                            name="setDefault"
                            render={({ field }) => (
                              <Switch
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                                disabled={autoVerifying}
                              />
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="text-sm">
                          {autoVerifying
                            ? "Verifying and creating payment method with Paystack..."
                            : readyToAutoVerify
                            ? "Ready to verify: we will automatically verify once all required fields are filled."
                            : needsBvnForVerification
                            ? "Please enter your BVN to verify this account."
                            : "Select bank and enter 10-digit account number to verify automatically."}
                        </div>

                        <div className="flex items-center gap-3">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleCancelAdd}
                            disabled={autoVerifying}
                          >
                            Cancel
                          </Button>
                          <Button type="button" disabled>
                            Add payment method
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Creation is automatic once inputs are valid.
                          </span>
                        </div>
                      </form>
                    </Form>
                  </>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end"></CardFooter>
        </Card>
      </div>
    </DashboardPage>
  );
}