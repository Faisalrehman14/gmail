import { destroySession, getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  const session = await getSession();
  if (session) {
    await logActivity({
      userId: session.id,
      action: "LOGOUT",
      entityType: "user",
      entityId: session.id,
    });
  }
  await destroySession();
  return apiSuccess({ loggedOut: true });
}
