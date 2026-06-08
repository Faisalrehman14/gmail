export async function register() {
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
