"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils";
import { ShieldCheck, Info, Lock, CheckCircle2, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function TwoFactorAuthenticationPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const user = useCurrentUser();

  // derive from current user
  const [enabled, setEnabled] = useState<boolean>(!!user?.isTwoFactorEnabled);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  // handle switch toggle
  const handleToggle = (checked: boolean) => {
    setError(null);
    setSaving(true);

    const prev = enabled;
    setEnabled(checked);

    startTransition(async () => {
      try {
        // Call your real API to persist change
        // e.g. await updateUserSettings({ isTwoFactorEnabled: checked })
        await new Promise((r) => setTimeout(r, 600)); // simulate delay
        setEnabled(checked);
      } catch (e: any) {
        setEnabled(prev);
        setError(e?.message ?? "Unable to update 2FA");
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <DashboardPage
      title="Two-Factor Authentication"
      backHref={`/dashboard/profile/${id}`}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header card */}
        <Card className="rounded-2xl border border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/10 text-amber-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground">
                  Two-Factor Authentication
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enhance your account security with an additional layer of
                  protection. Two-factor authentication helps prevent
                  unauthorized access even if your password is compromised.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why enable 2FA */}
        <Card className="rounded-2xl border border-amber-600/20 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-amber-700 mb-3">
              <Info className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                Why Enable Two-Factor Authentication?
              </h2>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: "Enhanced Security",
                  desc: "Protects your account even if your password is stolen or compromised.",
                },
                {
                  title: "Industry Standard",
                  desc: "Recommended by security experts and required by many organizations.",
                },
                {
                  title: "Easy to Use",
                  desc: "Works with popular authenticator apps like Google Authenticator or Authy.",
                },
                {
                  title: "Peace of Mind",
                  desc: "Know that your sensitive data and personal information are better protected.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-amber-600/20 bg-white p-4"
                >
                  <h3 className="text-[15px] font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current status and control */}
        <Card className="rounded-2xl border border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/10 text-amber-700">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Current Status
                  </h2>
                  <p className="text-[12px] text-muted-foreground mt-1 max-w-prose">
                    Two-factor authentication is currently{" "}
                    {enabled ? "enabled" : "disabled"}.{" "}
                    {enabled
                      ? "Disable it if you no longer wish to use an authenticator app."
                      : "Enable it to secure your account."}
                  </p>

                  {error && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] text-red-700">
                      <XCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium",
                    enabled
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  )}
                >
                  {enabled ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Disabled
                    </>
                  )}
                </span>

                <Switch
                  className="bg-gray-500 border border-emerald-300"
                  disabled={isPending || saving}
                  checked={enabled}
                  onCheckedChange={handleToggle}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="default"
                className="bg-amber-600 hover:bg-amber-600 text-white"
                onClick={() => router.push(`/dashboard/profile/${id}`)}
              >
                Back to Profile
              </Button>
              
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
