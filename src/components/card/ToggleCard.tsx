"use client";

import { Switch } from "@/components/ui/switch";
import { updateChatSettings } from "@/actions/profile/chatsetting";
import { useState } from "react";
import {Skeleton} from "@/components/ui/skeleton";
type FieldTypes = "isChatEnabled" | "isChatDelayed" | "isChatFollowersOnly";

interface ToggleCardProps {
  label: string;
  value: boolean;
  field: FieldTypes;
}

const ToggleCard = ({ label, value, field }: ToggleCardProps) => {
  const [isChecked, setIsChecked] = useState(value);

  const handleChange = async (checked: boolean) => {
    setIsChecked(checked);
    const update = await updateChatSettings({ [field]: checked });
    if (update.error) {
      console.error(update.error);
    }
  };

  return (
    <div className="rounded-xl bg-muted p-6">
      <div className="flex items-center justify-between">
        <p className="font-semibold shrink-0">{label}</p>
        <div className="space-y-2">
          <Switch checked={isChecked} onCheckedChange={handleChange}>
            {isChecked ? "On" : "Off"}
          </Switch>
        </div>
      </div>
    </div>
  );
};
export default ToggleCard;

export const ToggleCardSkeleton = () => {
 return (
  <Skeleton className="rounded-xl p-10 w-full"/>
 );
};