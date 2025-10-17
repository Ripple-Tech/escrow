"use client";

import { settings } from "@/actions/profile/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/forms/form-error";
import { FormSuccess } from "@/components/forms/form-success";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserRole } from "@prisma/client";

const SettingsSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(2).max(100).optional(),
  password: z.string().optional(),
  newPassword: z.string().optional(),
  role: z.nativeEnum(UserRole),
  isTwoFactorEnabled: z.boolean().optional(),

  phonenumber: z.string().optional(),
  gender: z.string().optional(),
  howdidyouhearus: z.string().optional(),
  areaofinterest: z.string().optional(),
  participationstyle: z.string().optional(),
});

const inputClass =
  "h-9 px-2 text-sm rounded-md border border-input bg-background focus:ring-1 focus:ring-emerald-500 focus:outline-none";

export function EditPanel() {
  const user = useCurrentUser();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      username: user?.username || undefined,
      email: user?.email || undefined,
      role: user?.role,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,

      phonenumber: user?.phonenumber || undefined,
     
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) setError(data.error);
          if (data.success) {
            update();
            setSuccess(data.success);
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  };

  return (
    <Card className="rounded-2xl border border-border/60 bg-muted/40 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="pb-3 mb-4 border-b">
          <h2 className="text-base font-semibold">Edit Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your account details below.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" disabled={isPending} className={inputClass} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="JohnDoe" disabled={isPending} className={inputClass} />
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
                          <Input {...field} placeholder="john@alma.zin" type="email" disabled={isPending} className={inputClass} />
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
                          <Input {...field} placeholder="******" type="password" disabled={isPending} className={inputClass} />
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
                          <Input {...field} placeholder="******" type="password" disabled={isPending} className={inputClass} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="phonenumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+234..." disabled={isPending} className={inputClass} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            
            

              {/* <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Role
                    </FormLabel>
                    <Select onValueChange={field.onChange} disabled={isPending} defaultValue={field.value as any}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm rounded-md border border-input bg-background focus:ring-1 focus:ring-emerald-500 focus:outline-none">
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
              /> */}

              {user?.isOAuth === false && (
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 flex flex-row items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/40">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Two Factor Authentication
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Enable two factor Authentication for your account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch className="bg-gray-500 border border-emerald-300" disabled={isPending} checked={field.value} onCheckedChange={field.onChange} />
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
                className="h-9 text-sm px-4 rounded-full border border-border/60 bg-[--primary] hover:bg-[--primary]/90 text-foreground shadow-none"
                style={{ ["--primary" as any]: "#324F3B" }}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}