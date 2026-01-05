require("dotenv").config();
const { addCallJob } = require("./queue/call.queue");

(async () => {
  await addCallJob({
    phone: "+918130222583",      // real test number
    callerId: process.env.TWILIO_FROM,
    leadId: "lead_test_001",
  });
  process.exit(0);
})();

