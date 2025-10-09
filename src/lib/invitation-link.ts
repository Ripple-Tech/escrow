export function buildInviteLink(username?: string | null) {
  if (!username) return null;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-app.com";
  return `${base}/auth/register?ref=${encodeURIComponent(username)}`; 
}