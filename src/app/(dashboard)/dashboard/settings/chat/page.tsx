import { fetchUser } from "@/actions/user.actions";
import ToggleCard from "@/components/card/ToggleCard";
import  currentUser  from "@/actions/getCurrentUser";

const ChatSettingsPage = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Chat Settings</h1>
      </div>
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
    </div>
  );
};

export default ChatSettingsPage;