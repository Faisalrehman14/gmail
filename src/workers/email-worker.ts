import { processEmailQueue } from "../lib/campaign-service";

const INTERVAL = parseInt(process.env.WORKER_INTERVAL_MS || "5000", 10);

console.log(`MailFlow email worker started (interval: ${INTERVAL}ms)`);

async function run() {
  try {
    await processEmailQueue();
  } catch (error) {
    console.error("Worker error:", error);
  }
}

run();
setInterval(run, INTERVAL);
