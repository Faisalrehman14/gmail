import { prisma } from "./prisma";
import type { ActivityAction } from "@prisma/client";

export async function logActivity(params: {
  userId?: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) {
  await prisma.activityLog.create({ data: params });
}
