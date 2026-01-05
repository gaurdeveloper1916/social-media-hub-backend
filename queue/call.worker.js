require("dotenv").config(); // MUST be first

const { makeOutboundCall } = require("../services/call.service.js");
const { callQueue } = require("./call.queue.js");
console.log("🚀 Call Worker started...");

callQueue.process(10, async (job) => {
  console.log("📥 Job received:", job.data);

  const { phone, callerId, leadId } = job.data;
  console.log( phone, callerId, leadId)

  await makeOutboundCall({
    to: phone,
    callerId,
    leadId,
  });
  console.log("📞 Call triggered for:", phone);

});
