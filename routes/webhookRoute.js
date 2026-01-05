const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();

// ✅ VERIFY TOKEN (Meta verification step)
router.get("/", (req, res) => {
  const VERIFY_TOKEN = "kartik_token";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(mode)
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified ✅");
    res.status(200).send(challenge);
  } else {
    console.log("Webhook verification failed ❌");
    res.sendStatus(403);
  }
});

router.post("/", async (req, res) => {
  const body = req.body;

  console.log("📩 Incoming Webhook Body:", JSON.stringify(body, null, 2));

  if (body.object) {
    try {
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) {
        console.log("⚠️ No message found in webhook payload");
        return res.sendStatus(200);
      }

      const from = message.from; // Sender WhatsApp number
      const text = message.text?.body?.trim()?.toLowerCase(); // Message text

      console.log(`📩 Message from ${from}: ${text}`);

      // ✅ If user replies "yes"
      if (text === "yes") {
        console.log("✅ User replied YES — sending video...");

        const payload = {
          recipients: [`+${from}`],
          video_id: "1871238570476914",
          caption:
            "Is this the secret life everyone in Delhi-NCR is talking about? 🤫\n\nWe always knew The Palatial Farms was special — but when our residents started sharing their stories, even we were left speechless.\n\nMeet Mrs. Japleen Kaur, who left her Gurugram apartment for something extraordinary.\n\n\"We didn't just buy a farmhouse, we bought a new way of living for our family.\"\n\nHear her unbelievable story and see the life they're about to experience — you truly won't believe your eyes.\n\nThis isn't just a property. It's a revolution in living. 🌿\n\nWarm regards,\nTeam The Palatial Farms\nthepalatialfarms.com\nCall us to know more\nNaugaon, Alwar, Rajasthan — Where Heritage Meets Modernity",
        };

        // ✅ Call your send-video API
        const response = await axios.post(
          "https://9g1a9b0ite.execute-api.ap-south-1.amazonaws.com/api/user/send-video",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("🎥 Video sent successfully:", response.data);
      }
    } catch (error) {
      console.error("❌ Error processing webhook:", error.message);
    }

    // Always respond 200 to Meta
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;