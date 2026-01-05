const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

 async function makeOutboundCall({ to }) {
  console.log(process.env.TWILIO_FROM,process.env.BASE_URL,"env")
  try {
    const call = await client.calls.create({
      to,
      from: process.env.TWILIO_FROM,
      url: `${process.env.BASE_URL}/webhook/voice`,
      statusCallback: `${process.env.BASE_URL}/webhook/status`,
      statusCallbackEvent: ["initiated", "answered", "completed"],
      method: "GET"
    });

    console.log("✅ Twilio response:", {
      sid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from
    });
  } catch (err) {
    console.error("❌ Twilio Error:", err.message, err.code);
  }
}

module.exports ={makeOutboundCall}
