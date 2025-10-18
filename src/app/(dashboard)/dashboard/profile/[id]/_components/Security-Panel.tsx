"ude client"
import { Card, CardContent } from "@/components/ui/card";
import { Shield, KeyRound, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/utils";
import { useParams, useRouter } from "next/navigation";

type SecurityPanelProps = {
  onNavigate?: (value: "security" | "details" | "edit") => void;
};

const itemBase =
  "rounded-2xl border border-amber-600/20 bg-white hover:bg-amber-50 transition-colors";
const iconWrap =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/10 text-amber-700";
const labelMuted = "text-[12px] text-muted-foreground";
const titleClass = "text-[15px] font-semibold text-foreground";

const ActionButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button
    type="button"
    className={cn(
      "inline-flex items-center gap-2 rounded-xl bg-amber-600 text-white px-3 py-1.5 text-[12px]",
      "hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/30",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="h-4 w-4 opacity-90" />
  </button>
);

const SecurityPanel = ({ onNavigate }: SecurityPanelProps) => {
  const router = useRouter();
   const { id } = useParams<{ id: string }>();
  return (
    <Card className="rounded-2xl border border-border/60 bg-white">
      <CardContent className="p-6">
        <div className="pb-3 mb-4 border-b border-border/60 flex items-center gap-2 text-amber-700">
          <Shield className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Security Settings</h2>
        </div>

        <div className="space-y-3">
          {/* Password */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Password</h3>
                    <p className={labelMuted}>Change your account password</p>
                  </div>
                  <ActionButton onClick={() => onNavigate?.("edit")}>Change</ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Two-Factor Authentication</h3>
                    <p className={labelMuted}>Add an extra layer of security with 2FA</p>
                  </div>
                  {/* Navigate to edit tab too, or change to a modal/setup route if you prefer */}
                  <ActionButton onClick={() => router.push(`/dashboard/profile/${id}/two-factor-authentication`)}>Configure</ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityPanel;