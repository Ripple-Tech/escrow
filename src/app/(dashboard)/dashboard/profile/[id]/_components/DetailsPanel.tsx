"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

type Details = {
  name?: string | null;
  email?: string | null;
  phonenumber?: string | null;
  role?: string | null;
  isTwoFactorEnabled?: boolean | null;
  createdAt?: Date | string | null;
  verifiedUser?: Date | string | null;
};

export function DetailsPanel({ data }: { data: Details }) {
  const form = useForm({ defaultValues: data || {} });

  const labelCls = "text-xs uppercase tracking-wide text-muted-foreground/80";
  const inputCls = "h-9 px-2 text-sm rounded-md border border-input bg-background";

  return (
    <Card className="rounded-2xl border border-border/60 bg-muted/40 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="pb-3 mb-4 border-b">
          <h2 className="text-base font-semibold">Details</h2>
          <p className="text-sm text-muted-foreground">
            Read-only user information.
          </p>
        </div>

        <Form {...form}>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className={inputCls}
                      disabled
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className={inputCls}
                      disabled
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Role</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className={inputCls}
                      disabled
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTwoFactorEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Two Factor</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ? "Enabled" : "Disabled"}
                      className={inputCls}
                      disabled
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Created</FormLabel>
                  <FormControl>
                    <Input
                      value={
                        field.value
                          ? new Date(field.value as any).toLocaleString()
                          : ""
                      }
                      className={inputCls}
                      disabled
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verifiedUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Verified On</FormLabel>
                  <FormControl>
                    <Input
                      value={
                        field.value
                          ? new Date(field.value as any).toLocaleString()
                          : "—"
                      }
                      className={inputCls}
                      disabled
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}