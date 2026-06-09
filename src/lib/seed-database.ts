import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function runSeed() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mailflow.com" },
    update: {},
    create: {
      email: "admin@mailflow.com",
      passwordHash,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@mailflow.com" },
    update: {},
    create: {
      email: "manager@mailflow.com",
      passwordHash: await bcrypt.hash("manager123", 12),
      name: "Campaign Manager",
      role: "MANAGER",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@mailflow.com" },
    update: {},
    create: {
      email: "viewer@mailflow.com",
      passwordHash: await bcrypt.hash("viewer123", 12),
      name: "Viewer User",
      role: "VIEWER",
    },
  });

  const tags = await Promise.all(
    ["VIP", "Newsletter", "Lead", "Customer"].map((name, i) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: {
          name,
          color: ["#6366f1", "#8b5cf6", "#ec4899", "#10b981"][i],
        },
      })
    )
  );

  const contacts = await Promise.all(
    [
      { email: "john.doe@example.com", firstName: "John", lastName: "Doe", company: "Acme Corp" },
      { email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith", company: "TechStart" },
      { email: "bob.wilson@example.com", firstName: "Bob", lastName: "Wilson", company: "Global Inc" },
      { email: "alice.brown@example.com", firstName: "Alice", lastName: "Brown", company: "Design Co" },
      { email: "charlie.davis@example.com", firstName: "Charlie", lastName: "Davis", company: "Media Hub" },
      { email: "diana.miller@example.com", firstName: "Diana", lastName: "Miller", company: "Finance Pro" },
      { email: "edward.garcia@example.com", firstName: "Edward", lastName: "Garcia", company: "Health Plus" },
      { email: "fiona.lee@example.com", firstName: "Fiona", lastName: "Lee", company: "EduTech" },
    ].map((c) =>
      prisma.contact.upsert({
        where: { email: c.email },
        update: {},
        create: { ...c, isValid: true, status: "ACTIVE" },
      })
    )
  );

  for (let i = 0; i < contacts.length; i++) {
    await prisma.contactTag.upsert({
      where: {
        contactId_tagId: { contactId: contacts[i].id, tagId: tags[i % tags.length].id },
      },
      create: { contactId: contacts[i].id, tagId: tags[i % tags.length].id },
      update: {},
    });
  }

  const mainList = await prisma.contactList.upsert({
    where: { id: "seed-main-list" },
    update: {},
    create: {
      id: "seed-main-list",
      name: "Main Subscribers",
      description: "Primary mailing list",
    },
  });

  for (const contact of contacts) {
    await prisma.listMember.upsert({
      where: { listId_contactId: { listId: mainList.id, contactId: contact.id } },
      create: { listId: mainList.id, contactId: contact.id },
      update: {},
    });
  }

  await prisma.segment.upsert({
    where: { id: "seed-vip-segment" },
    update: {},
    create: {
      id: "seed-vip-segment",
      name: "VIP Customers",
      description: "High-value contacts",
      filters: JSON.stringify({ tag: "VIP" }),
    },
  });

  await prisma.emailTemplate.upsert({
    where: { id: "seed-welcome-template" },
    update: {},
    create: {
      id: "seed-welcome-template",
      name: "Welcome Email",
      subject: "Welcome to our community, {{first_name}}!",
      htmlContent: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px">
        <h1 style="color:#6366f1">Welcome, {{first_name}}!</h1>
        <p>We're thrilled to have you join us at {{company}}.</p>
        <p>Here's what you can expect from us:</p>
        <ul><li>Weekly newsletters</li><li>Exclusive offers</li><li>Product updates</li></ul>
        <p>Best regards,<br>The Team</p>
      </div>`,
      createdById: admin.id,
    },
  });

  // Only add demo SMTP if no real SMTP env vars are configured
  const hasRealSmtp =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasRealSmtp) {
    const { syncEnvSmtpProvider } = await import("./env-smtp");
    await syncEnvSmtpProvider();
  } else {
    const existing = await prisma.smtpProvider.count({ where: { isActive: true } });
    if (existing === 0) {
      console.log("No SMTP configured — add real SMTP in Settings or Railway env vars");
    }
  }

  console.log("Seed completed:");
  console.log("  Admin: admin@mailflow.com / admin123");
  console.log("  Manager: manager@mailflow.com / manager123");
  console.log("  Viewer: viewer@mailflow.com / viewer123");
}
