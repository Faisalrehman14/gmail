export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { prisma } = await import("./lib/prisma");
      const { syncEnvSmtpProvider } = await import("./lib/env-smtp");

      // Always sync real SMTP from env vars (Railway)
      await syncEnvSmtpProvider();

      const userCount = await prisma.user.count();
      if (userCount === 0) {
        const { runSeed } = await import("./lib/seed-database");
        await runSeed();
        console.log("Database auto-seeded on startup");
      }
    } catch (error) {
      console.error("Startup init failed:", error);
    }
  }

  const workerEnabled =
    process.env.ENABLE_INLINE_WORKER === "true" ||
    process.env.RAILWAY_ENVIRONMENT !== undefined;

  if (process.env.NEXT_RUNTIME === "nodejs" && workerEnabled) {
    const { processEmailQueue } = await import("./lib/campaign-service");
    const interval = parseInt(process.env.WORKER_INTERVAL_MS || "10000", 10);

    const runWorker = () => processEmailQueue().catch(console.error);
    runWorker();
    setInterval(runWorker, interval);
    console.log(`Inline email worker enabled (${interval}ms)`);
  }
}
