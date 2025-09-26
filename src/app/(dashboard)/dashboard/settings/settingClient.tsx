"use client";

import { settings } from "@/actions/profile/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsSchema } from "@/schemas";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/forms/form-error";
import { FormSuccess } from "@/components/forms/form-success";

// Optional: icon styling tokens used elsewhere in your app
const iconWrapperBase =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-primary-glow";
const iconWrapper6 = `${iconWrapperBase} w-6 h-6`;
const iconWrapper7 = `${iconWrapperBase} w-7 h-7`;

// Compact input style to match your Escrow form
const inputClass =
  "h-9 px-2 text-sm rounded-md border border-input bg-background focus:ring-1 focus:ring-blue-500 focus:outline-none";

const SettingsPage = () => {
  const user = useCurrentUser();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: undefined,
      newPassword: undefined,
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            update();
            setSuccess(data.success);
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  };

  return (
    <Card
      className={[
        "w-full",
        "sm:w-[450px] xs:w-[390px] md:w-[650px]",
        "rounded-2xl border border-border/60",
        "bg-muted/40 backdrop-blur-sm",
      ].join(" ")}
    >
      <CardContent className="p-6">
        {/* Header (matches your Escrow modal header style) */}
        <div className="pb-3 mb-4 border-b">
          <h2 className="text-base font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Update your account details below.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        disabled={isPending}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {user?.isOAuth === false && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="john.doe@example.com"
                            type="email"
                            disabled={isPending}
                            className={inputClass}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                            disabled={isPending}
                            className={inputClass}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                            disabled={isPending}
                            className={inputClass}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Role
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      disabled={isPending}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm rounded-md border border-input bg-background focus:ring-1 focus:ring-blue-500 focus:outline-none">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={UserRole.USER}>User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {user?.isOAuth === false && (
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
                  render={({ field }) => (
                    <FormItem
                      className={[
                        "flex flex-row items-center justify-between",
                        "rounded-lg border border-border/60 p-3",
                        "bg-muted/40",
                      ].join(" ")}
                    >
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Two Factor Authentication
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Enable two factor Authentication for your account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          className="border border-gray-500"
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className={[
                  "h-9 text-sm px-4",
                  "rounded-full border border-border/60",
                  "bg-primary hover:bg-primary/60",
                  "text-foreground",
                  "shadow-none hover:shadow-primary-glow",
                  "transition-all duration-200",
                ].join(" ")}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;