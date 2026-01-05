const express = require("express");
const Lead = require("../models/Lead");
const { addCallJob } = require("../queue/call.queue");

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const leads = await Lead.find({ status: "pending" });

    for (const lead of leads) {
      await addCallJob({
        phone: lead.phone,
        leadId: lead._id,
        callerId: process.env.EXOTEL_CALLER_ID,
      });
    }

    res.json({
      success: true,
      queued: leads.length,
    });
  } catch (error) {
    console.error("❌ Campaign start error:", error);
    res.status(500).json({ success: false, message: "Failed to start campaign" });
  }
});

module.exports = router;
