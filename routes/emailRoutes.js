const express = require("express");
const router = express.Router();

const {
  SESv2Client,
  SendBulkEmailCommand,
} = require("@aws-sdk/client-sesv2");

// const ses = new SESv2Client({ region: "ap-south-1" });
const REGION = process.env.AWS_REGION ||"ap-south-1";
const ses = new SESv2Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

router.post("/sendBulkEmail", async (req, res) => {
  const { emails, subject, htmlBody, sendRate = 20 } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Email list is required.",
    });
  }

  if (!subject || !htmlBody) {
    return res.status(400).json({
      success: false,
      error: "Subject and htmlBody are required.",
    });
  }

  try {
    // SES allows max 50 emails per bulk call
    const batchSize = Math.min(50, sendRate);
    const delay = Math.ceil((batchSize / sendRate) * 1000);

    const emailBatches = chunkArray(emails, batchSize);
    const results = [];
    let totalSent = 0;

    for (let i = 0; i < emailBatches.length; i++) {
      const batch = emailBatches[i];

      const params = {
        FromEmailAddress: process.env.AWS_SENDER_EMAIL, // Example: Enquiry@thepalatialfarms.com
        DefaultContent: {
          Simple: {
            Subject: { Data: subject },
            Body: {
              Html: { Data: htmlBody },
            },
          },
        },
        BulkEmailEntries: batch.map((email) => ({
          Destination: { ToAddresses: [email] },
        })),
      };

      const command = new SendBulkEmailCommand(params);
      const response = await ses.send(command);

      results.push({
        batchIndex: i,
        emails: batch,
        response,
      });

      totalSent += batch.length;

      if (i < emailBatches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    res.json({
      success: true,
      message: "Bulk emails sent successfully",
      totalRequested: emails.length,
      totalSent,
      batches: results.length,
      details: results,
    });

  } catch (err) {
    console.error("SES Email Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
});

module.exports = router;
