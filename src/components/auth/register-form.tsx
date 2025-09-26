'use client';

import { CardWrapper } from "@/components/auth/card-wrapper";
import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormSuccess } from "@/components/forms/form-success";
import { Register } from "@/actions/register";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react"; 

export const RegisterForm = () => {
const [error, setError] = useState<string | undefined>("");
const [success, setSuccess] = useState<string | undefined>("");
const [isPending, startTransition] = useTransition();
const [showPassword, setShowPassword] = useState(false);

const form = useForm<z.infer<typeof RegisterSchema>>({
resolver: zodResolver(RegisterSchema),
defaultValues: {
name: "",
surname: "",
username: "",
email: "",
password: "",
},
});

const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
setError("");
setSuccess("");
// normalize username client-side too (optional)
const payload = {
...values,
username: values.username?.trim().toLowerCase(),
};


startTransition(() => {
  Register(payload).then((data) => {
    setError(data.error);
    setSuccess(data.success);
  });
});
};

return (
<CardWrapper headerLabel="Create an account" backButtonLabel="Already have an account?" backButtonHref="/auth/login" showSocial >
<Form {...form}>
<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
<div className="space-y-4">
<FormField
control={form.control}
name="name"
render={({ field }) => (
<FormItem>
<FormLabel>Name</FormLabel>
<FormControl>
<Input
{...field}
disabled={isPending}
placeholder="John"
/>
</FormControl>
<FormMessage />
</FormItem>
)}
/>

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Doe"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="john.doe"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                3–20 chars; letters, numbers, dot, underscore
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="johndoe@example.com"
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                  <div className="relative">
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="******"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                />
                <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={0}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      <Button type="submit" disabled={isPending} className="w-full">
        Create an account
      </Button>
    </form>
  </Form>
</CardWrapper>
);
};