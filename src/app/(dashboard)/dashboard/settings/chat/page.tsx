import { fetchUser } from "@/actions/user.actions";
import ToggleCard from "@/components/card/ToggleCard";
import  currentUser  from "@/actions/getCurrentUser";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

const ChatSettingsPage = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);
   const back =  `/dashboard/profile/${user.id}`;

  return (
   <DashboardPage title="Chat Settings" backHref={back}>
      <div className="space-y-4">
        <ToggleCard
          field="isChatEnabled"
          label="Enable Chat"
          value={userInfo.isChatEnabled}
        />
        <ToggleCard
          field="isChatDelayed"
          label="Delay Chat Messages"
          value={userInfo.isChatDelayed}
        />
        <ToggleCard
          field="isChatFollowersOnly"
          label="Chat with Followers Only"
          value={userInfo.isChatFollowersOnly}
        />
      </div>
    </DashboardPage>
  );
};

export default ChatSettingsPage;