"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const FormSchema = z.object({
  role: z.enum(["buyer", "seller"], { message: "Select a role" }),
  amount: z
    .string()
    .min(1, "Enter amount")
    .refine(
      (v) =>
        !Number.isNaN(Number(v.replaceAll(",", ""))) &&
        Number(v.replaceAll(",", "")) > 0,
      {
        message: "Enter a valid amount",
      }
    ),
});

type FormValues = z.infer<typeof FormSchema>;

export default function EscrowCalculator() {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      role: "buyer",
      amount: "",
    },
    mode: "onChange",
  });

  const [fee, setFee] = useState<number | null>(null);
  const [sellerReceives, setSellerReceives] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const calculateFee = (amount: number) => {
    const feePercentage = 0.03; // 3%
    const minFee = 500; // Minimum fee
    const maxFee = 5000; // Maximum fee
    const calculatedFee = amount * feePercentage;

    return Math.min(Math.max(calculatedFee, minFee), maxFee);
  };

  const onSubmit = (values: FormValues) => {
    const amount = Number(values.amount.replace(/,/g, ""));
    const calculatedFee = calculateFee(amount);
    const sellerAmount = amount - calculatedFee;

    setFee(calculatedFee);
    setSellerReceives(sellerAmount);
  };

  return (
    <Card className="mx-auto w-full max-w-xl rounded-2xl border border-primary/30 bg-primary-glass shadow-primary-glow">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl md:text-4xl font-extrabold text-amber-600">
          Escrow Calculator
        </CardTitle>

        <Separator className="mx-auto w-24 h-[2px] divider-primary rounded-full" />

        <CardDescription className="text-balance px-4 text-sm text-foreground/80">
        <span className="font-bold text-base text-golden-dark">
            Estimate Your Fees Before You Trade
          </span><br/>
          <span className="font-bold text-lg text-amber-600">
            Kyve got your back!
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="sr-only">Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="card-control">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border border-primary/30 shadow-primary-glow text-foreground">
                      <SelectGroup>
                        <SelectLabel className="text-primary font-semibold">Role</SelectLabel>
                        <SelectItem
                          value="buyer"
                          className="cursor-pointer hover:bg-primary/10 focus:bg-primary/20 focus:text-primary"
                        >
                          Buyer
                        </SelectItem>
                        <SelectItem
                          value="seller"
                          className="cursor-pointer hover:bg-primary/10 focus:bg-primary/20 focus:text-primary"
                        >
                          Seller
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Amount Input */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="sr-only">Amount</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      placeholder="Enter Amount"
                      className="card-control text-foreground placeholder:text-primary/60" 
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Results Display */}
            {fee !== null && sellerReceives !== null && (
              <div className="mt-4 text-center space-y-1">
                <p className="text-lg font-semibold text-primary">
                  Fee: ₦{fee.toLocaleString()}
                </p>
                <p className="text-lg font-semibold text-primary">
                  Seller Receives: ₦{sellerReceives.toLocaleString()}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-md bg-primary text-primary-foreground font-semibold shadow-primary-glow ring-1 ring-primary/40 hover:bg-primary/90 transition-all duration-200"
            >
              {isPending ? "Calculating..." : "Calculate Fee"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}