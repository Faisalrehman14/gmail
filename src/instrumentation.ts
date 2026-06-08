export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { prisma } = await import("./lib/prisma");
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        const { runSeed } = await import("./lib/seed-database");
        await runSeed();
        console.log("Database auto-seeded on startup");
      }
    } catch (error) {
      console.error("Auto-seed check failed:", error);
    }
  }

  const workerEnabled =
    process.env.ENABLE_INLINE_WORKER === "true" ||
    process.env.RAILWAY_ENVIRONMENT !== undefined;

  if (process.env.NEXT_RUNTIME === "nodejs" && workerEnabled) {
    const { processEmailQueue } = await import("./lib/campaign-service");
    const interval = parseInt(process.env.WORKER_INTERVAL_MS || "10000", 10);
    setInterval(() => {
      processEmailQueue().catch(console.error);
    }, interval);
    console.log(`Inline email worker enabled (${interval}ms)`);
  }
}
