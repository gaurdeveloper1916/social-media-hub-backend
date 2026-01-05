// routes/messageRoute.js
const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-south-1", 
});

const sqs = new AWS.SQS();
const QUEUE_URL = process.env.AWS_SQS_NAME; 

router.post("/send", async (req, res) => {
  try {
    const { numbers, message, templateName, templateParams, language, mediaType, mediaLink } = req.body;

    if (!numbers) {
      return res.status(400).json({ success: false, error: "Recipient number(s) required." });
    }

    const payload = {
      numbers,
      message,
      templateName,
      templateParams,
      language,
      mediaType,
      mediaLink,
    };

    const params = {
      MessageBody: JSON.stringify(payload),
      QueueUrl: QUEUE_URL,
    };

    await sqs.sendMessage(params).promise();

    res.json({ success: true, message: "Message added to queue for processing." });
  } catch (err) {
    console.error("Error sending to SQS:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
