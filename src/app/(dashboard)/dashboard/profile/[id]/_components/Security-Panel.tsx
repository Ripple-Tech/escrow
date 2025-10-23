"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Shield, KeyRound, Lock, ChevronRight, HelpCircle, Headphones,  Info, BookOpen, FileText, ShieldCheck, UserCheck2, LucidePanelLeftClose, Trash2, UserCog, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/utils";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { startTransition, useState } from "react";
import { deactivateAccount } from "@/actions/profile/deactivate-account";
import { toast } from "sonner";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const { id } = useParams<{ id: string }>();
  const userId = id;
 const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
   await signOut({ callbackUrl: "/" });
    setShowLogoutModal(false);
  };

  const handleDeactivateAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const res = await deactivateAccount(userId)

      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success("Account deactivated successfully ✅")
      }
    })
    setShowDeleteModal(false);
  };

  return (
    <section className="space-y-6">
      <Card className="rounded-2xl border border-border/60 bg-white">
      <CardContent className="p-6">
        <div className="pb-3 mb-4 border-b border-border/60 flex items-center gap-2 text-amber-700">
          <UserCog className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Account Settings</h2>
        </div>

        <div className="space-y-3">
          {/* Account payment */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Payment Method</h3>
                    <p className={labelMuted}>Account payment method</p>
                  </div>
                  <ActionButton onClick={() => router.push(`/dashboard/profile/${id}/payment-method`)}>Configure</ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* Verification and limit */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Verifications</h3>
                    <p className={labelMuted}>Account verification status</p>
                  </div>
                  {/* Navigate to edit tab too, or change to a modal/setup route if you prefer */}
                  <ActionButton onClick={() => router.push(`/dashboard/profile/${id}/verification`)}>Verify</ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

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


   <Card className="rounded-2xl border border-border/60 bg-white">
      <CardContent className="p-6">
        <div className="pb-3 mb-4 border-b border-border/60 flex items-center gap-2 text-amber-700">
          <HelpCircle className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Help and Support</h2>
        </div>
        <div className="space-y-3">
            {/* Contact us */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Headphones className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Contact Us</h3>
                    <p className={labelMuted}>Get in touch with our support team</p>
                  </div>
                  <ActionButton onClick={() => router.push("/contact-us")}>Contact</ActionButton>
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>

 <Card className="rounded-2xl border border-border/60 bg-white">
      <CardContent className="p-6">
        <div className="pb-3 mb-4 border-b border-border/60 flex items-center gap-2 text-amber-700">
          <Info className="h-6 w-6" />
          <h2 className="text-xl font-semibold">About</h2>
        </div>

        <div className="space-y-3">
          {/* Terms and condition */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <UserCheck2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>About Us</h3>
                    <p className={labelMuted}>Learn more about kyve</p>
                  </div>
                  <ActionButton onClick={() => router.push("/about-us")}>About</ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Terms and Conditions</h3>
                    <p className={labelMuted}>Read our terms and conditions</p>
                  </div>
                  {/* Navigate to edit tab too, or change to a modal/setup route if you prefer */}
                  <ActionButton onClick={() => router.push("/terms-and-conditions")}>Terms</ActionButton>
                </div>
              </div>
            </div>
          </div>

           {/* Privacy Policy */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Privacy Policy</h3>
                    <p className={labelMuted}>Read our privacy policy</p>
                  </div>
                  {/* Navigate to edit tab too, or change to a modal/setup route if you prefer */}
                  <ActionButton onClick={() => router.push("/privacy-policy")}>Policy</ActionButton>
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>

     <Card className="rounded-2xl border border-border/60 bg-white">
      <CardContent className="p-6">
      
        <div className="space-y-3">
            {/* logout */}
          <div className={cn(itemBase, "p-4")}>
            <div className="flex items-start gap-3"> 
             
             <div className={iconWrap}>
                <LucidePanelLeftClose className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={titleClass}>Logout</h3>
                    <p className={labelMuted}>Sign out of your account</p>
                  </div>
                  <ActionButton className="bg-red-600 hover:bg-red-700" onClick={handleLogout}>Logout</ActionButton>
                </div>
            </div>
          </div>

        </div>
        </div>

      </CardContent>
    </Card>

 {/* Delete Account Card */}
<Card className="rounded-2xl border border-border/60 bg-white">
  <CardContent className="p-6">
    <div className="space-y-3">
      <div className={cn(itemBase, "p-4")}>
        <div className="flex items-start gap-3">
          <div className={iconWrap}>
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className={titleClass}>Deactivate Account</h3>
                <p className={labelMuted}>
                  Temporarily disable your account and data
                </p>
              </div>

              <ActionButton
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeactivateAccount}
              >
                Deactivate 
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>


 {/* Logout Modal */}
      <Modal
        showModal={showLogoutModal}
        setShowModal={() => setShowLogoutModal(false)}
        className="max-w-md p-8"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Confirm Logout</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to sign out? You’ll need to log in again to
              access your account.
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
<Modal
  showModal={showDeleteModal}
  setShowModal={() => setShowDeleteModal(false)}
  className="max-w-md p-8"
>
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-medium text-gray-900">Deactivate Account</h2>
      <p className="text-sm text-gray-600">
        This will temporarily disable your account and all associated data.
      </p>

      <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
        <p className="text-sm text-yellow-700">
          ⚠️ Before proceeding, make sure you have no <strong>locked funds</strong> or
          active escrow transactions. Deactivating your account will 
          prevent you from accessing these funds or completing any ongoing
          transactions.
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="deleteConfirm"
          className="block text-sm text-gray-700 mb-2"
        >
          Type <span className="font-bold">deactivate my account</span> to confirm:
        </label>
        <input
          id="deleteConfirm"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="deactivate my account"
        />
      </div>
    </div>

    <div className="flex justify-end space-x-3 pt-4 border-t">
      <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={confirmDelete}
        disabled={confirmText.trim().toLowerCase() !== "deactivate my account"}
      >
        Deactivate Account
      </Button>
    </div>
  </div>
</Modal>
  

    </section>
  );
};

export default SecurityPanel;