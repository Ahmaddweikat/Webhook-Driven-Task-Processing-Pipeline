import { processNextJobs } from "./job-processor";

const POLL_INTERVAL_MS = 5000;

async function start() {
  console.log("Worker started — polling every 5 seconds");

  while (true) {
    try {
      await processNextJobs();
    } catch (error: any) {
      console.error("Worker error:", error.message);
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

start();
