const express = require("express");

const { default: axios } = require("axios");

const router = express.Router();

// const AWS = require("aws-sdk");
// AWS.config.update({
//   region: "ap-south-1", 
// });
// const sqs = new AWS.SQS();

const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const sqs = new SQSClient({ region: "ap-south-1" });

const QUEUE_URL = 'https://sqs.ap-south-1.amazonaws.com/779424485805/whatsapp-message-queue'; 

router.post("/sendMessage", async (req, res) => {
  const { number, message, templateName, templateParams } = req.body;

  if (!number || number.trim() === "") {
    return res.status(400).json({ success: false, error: "Recipient number is required." });
  }

  let payload;
  if (templateName) {

    payload = {
      messaging_product: "whatsapp",
      to: number,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
      },
    };

    if (templateParams && templateParams.length > 0) {
      payload.template.components = [
        {
          type: "body",
          parameters: templateParams.map((p) => ({ type: "text", text: p })),
        },
      ];
    }
  } else if (message && message.trim() !== "") {
    payload = {
      messaging_product: "whatsapp",
      to: number,
      text: { body: message },
    };
  } else {
    return res.status(400).json({
      success: false,
      error: "Either message or templateName must be provided.",
    });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    if (err.response) {
      console.error("WhatsApp API Error:", err.response.data);
      res.status(500).json({ success: false, error: err.response.data });
    } else {
      console.error("Error:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

router.post("/create-template", async (req, res) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_BUSINESS_ID}/message_templates`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

router.get("/list-templates", async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_BUSINESS_ID}/message_templates`,
      {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      }
    );
    res.json({ success: true, status: 200, data: response.data });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
});

router.post("/send-template", async (req, res) => {
  try {
    const { recipient, templateName, language, variables } = req.body;
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: language || "en_US" },
          components: variables?.length
            ? [
              {
                type: "body",
                parameters: variables.map((val) => ({
                  type: "text",
                  text: val,
                })),
              },
            ]
            : [],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
});

// router.post("/send", async (req, res) => {
//   try {
//     let { numbers, message, templateName, templateParams, language, mediaType, mediaLink } = req.body;

//     if (!numbers) {
//       return res.status(400).json({ success: false, error: "Recipient number(s) required." });
//     }
//     if (!Array.isArray(numbers)) numbers = [numbers];

//     if ((!message || message.trim() === "") && !templateName) {
//       return res.status(400).json({
//         success: false,
//         error: "Either message or templateName must be provided.",
//       });
//     }

//     const results = [];

//     for (const number of numbers) {
//       let payload;

//       if (templateName) {
//         // Template payload
//         payload = {
//           messaging_product: "whatsapp",
//           to: number,
//           type: "template",
//           template: {
//             name: templateName,
//             language: { code: language || "en" }
//           },
//         };
//         if (mediaType && mediaType === 'video') {
//           payload.template.components = [
//             {
//               type: "header",
//               parameters: [
//                 {
//                   type: "video",
//                   video: {
//                     link: mediaLink
//                   }
//                 }
//               ],
//             },
//           ];
//         }

//         if (templateParams && templateParams.length > 0) {
//           payload.template.components = [
//             {
//               type: "body",
//               parameters: templateParams.map((p) => ({ type: "text", text: p })),
//             },
//           ];
//         }
//       } else {
//         payload = {
//           messaging_product: "whatsapp",
//           to: number,
//           text: { body: message },
//         };
//       }

//       try {
//         const response = await axios.post(
//           `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`, payload,
//           {
//             headers: {
//               Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         results.push({ number, success: true, data: response.data });
//       } catch (err) {
//         results.push({
//           number,
//           success: false,
//           error: err.response?.data || err.message,
//         });
//       }
//     }

//     res.json({ success: true, results });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

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

    // await sqs.sendMessage(params).promise();
await sqs.send(new SendMessageCommand(params));

    res.json({ success: true, message: "Message added to queue for processing." });
  } catch (err) {
    console.error("Error sending to SQS:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
router.delete("/delete-template/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Template name is required",
      });
    }

    const WABA_ID = process.env.WHATSAPP_BUSINESS_ID;
    const TOKEN = process.env.WHATSAPP_TOKEN;

    const response = await axios.delete(
      `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates?name=${name}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: `Template '${name}' deleted successfully`,
      data: response.data,
    });
  } catch (error) {
    console.error("Delete Template Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

router.post("/send-video", async (req, res) => {
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;

  const { recipients, video_id, caption } = req.body;

  if (!recipients || !video_id || !caption) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: recipients, video_id, caption"
    });
  }

  const videoPayload = {
    type: "video",
    video: { id: video_id, caption }
  };

  const BATCH_SIZE = 50; // Adjust based on rate limits

  try {
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(to =>
          axios.post(
            `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to,
              ...videoPayload
            },
            {
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
              }
            }
          )
            .then(response => console.log(`Sent to ${to}`))
            .catch(err =>
              console.error(`Error sending to ${to}`, err.response?.data || err.message)
            )
        )
      );

      // Optional delay between batches to avoid hitting rate limits
      await new Promise(r => setTimeout(r, 1500));
    }

    res.json({ success: true, message: "All batches processed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = router;