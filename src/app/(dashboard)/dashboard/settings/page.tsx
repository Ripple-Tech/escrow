import SettingsPage from './settingClient'
import  currentUser  from "@/actions/getCurrentUser";

import { fetchUser } from "@/actions/user.actions";
import { DashboardPage } from '@/components/dashboard/dashboard-page';
const page = async () => {
  const user = await currentUser();
  if (!user) return null; 
  const userId = user.id
  if (!userId) {
    console.error("User ID is undefined");
    return;
  }
  const userInfo = await fetchUser(userId);
 //if (!userInfo?.onboarded) redirect("/auth/onboarding");
 const back =  `/dashboard/profile/${userId}`;
  return (
   <DashboardPage title="Settings" backHref={back}>
        <SettingsPage/>
     </DashboardPage>
  )
}

export default page