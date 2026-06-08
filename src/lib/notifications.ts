import { prisma } from "./prisma";

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
    },
  });
}

export async function notifyAdmins(params: {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title: params.title,
      message: params.message,
      type: params.type || "info",
    })),
  });
}
