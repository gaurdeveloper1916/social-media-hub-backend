const Queue = require("bull");
const redisConfig = require("../config/redis.js");

const callQueue = new Queue("call-queue", redisConfig);

async function addCallJob(data) {
  await callQueue.add(data, {
    attempts: 1,
    backoff: 5000,
  });
}
callQueue.on("ready", () => {
  console.log("✅ Redis connected. Call Queue is ready");
});

callQueue.on("error", (err) => {
  console.error("❌ Redis connection failed:", err);
});

module.exports = {
  callQueue,
  addCallJob,
};
