import {
  getTotalPipelines,
  getTotalRuns,
  getRunsByStatus,
  getAverageProcessingTime,
  getDeliveryStats,
  getRunsPerPipeline,
} from "../db/queries/metrics";

export async function getMetrics() {
  const [
    totalPipelines,
    totalRuns,
    runsByStatus,
    avgProcessingTime,
    deliveryStats,
    runsPerPipeline,
  ] = await Promise.all([
    getTotalPipelines(),
    getTotalRuns(),
    getRunsByStatus(),
    getAverageProcessingTime(),
    getDeliveryStats(),
    getRunsPerPipeline(),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of runsByStatus) {
    statusMap[row.status] = Number(row.count);
  }

  const doneRuns = statusMap["done"] || 0;
  const failedRuns = statusMap["failed"] || 0;
  const pendingRuns = statusMap["pending"] || 0;
  const processingRuns = statusMap["processing"] || 0;

  const successRate =
    totalRuns > 0 ? ((doneRuns / totalRuns) * 100).toFixed(1) + "%" : "0%";

  const deliveryMap: Record<string, number> = {};
  for (const row of deliveryStats) {
    deliveryMap[row.status] = Number(row.count);
  }

  const totalDeliveries = Object.values(deliveryMap).reduce((a, b) => a + b, 0);
  const successDeliveries = deliveryMap["success"] || 0;
  const failedDeliveries = deliveryMap["failed"] || 0;

  const deliverySuccessRate =
    totalDeliveries > 0
      ? ((successDeliveries / totalDeliveries) * 100).toFixed(1) + "%"
      : "0%";

  return {
    pipelines: {
      total: totalPipelines,
    },
    runs: {
      total: totalRuns,
      pending: pendingRuns,
      processing: processingRuns,
      done: doneRuns,
      failed: failedRuns,
      successRate,
      averageProcessingTimeSeconds: avgProcessingTime,
    },
    delivery: {
      total: totalDeliveries,
      successful: successDeliveries,
      failed: failedDeliveries,
      successRate: deliverySuccessRate,
    },
    runsPerPipeline,
  };
}
