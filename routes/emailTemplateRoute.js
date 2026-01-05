const express = require("express");
const router = express.Router();

const {
  SESv2Client,
  CreateEmailTemplateCommand,
  UpdateEmailTemplateCommand,
  DeleteEmailTemplateCommand,
  ListEmailTemplatesCommand,
  GetEmailTemplateCommand,
  SendEmailCommand,
} = require("@aws-sdk/client-sesv2");

const REGION = process.env.AWS_REGION || "ap-south-1";

const ses = new SESv2Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


// ===============================================
// 1️⃣ CREATE TEMPLATE
// ===============================================
router.post("/createTemplate", async (req, res) => {
  const { templateName, subject, htmlBody, textBody } = req.body;

  if (!templateName || !subject || !htmlBody) {
    return res.status(400).json({
      success: false,
      error: "templateName, subject, and htmlBody are required.",
    });
  }

  try {
    const params = {
      TemplateName: templateName,
      TemplateContent: {
        Subject: subject,
        Html: htmlBody,
        Text: textBody || "",
      },
    };

    const command = new CreateEmailTemplateCommand(params);
    const result = await ses.send(command);

    res.json({
      success: true,
      message: "Template created successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ===============================================
// 2️⃣ UPDATE TEMPLATE
// ===============================================
router.put("/updateTemplate", async (req, res) => {
  const { templateName, subject, htmlBody, textBody } = req.body;

  if (!templateName) {
    return res.status(400).json({
      success: false,
      error: "templateName is required.",
    });
  }

  try {
    const params = {
      TemplateName: templateName,
      TemplateContent: {
        Subject: subject,
        Html: htmlBody,
        Text: textBody || "",
      },
    };

    const command = new UpdateEmailTemplateCommand(params);
    const result = await ses.send(command);

    res.json({
      success: true,
      message: "Template updated successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ===============================================
// 3️⃣ DELETE TEMPLATE
// ===============================================
router.delete("/deleteTemplate/:templateName", async (req, res) => {
  const { templateName } = req.params;

  try {
    const command = new DeleteEmailTemplateCommand({
      TemplateName: templateName,
    });

    const result = await ses.send(command);

    res.json({
      success: true,
      message: "Template deleted successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ===============================================
// 4️⃣ LIST ALL TEMPLATES
// ===============================================
router.get("/listTemplates", async (req, res) => {
  try {
    const command = new ListEmailTemplatesCommand({ PageSize: 20 });
    const result = await ses.send(command);

    res.json({
      success: true,
      templates: result.TemplatesMetadata || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ===============================================
// 5️⃣ GET TEMPLATE BY NAME
// ===============================================
router.get("/getTemplate/:templateName", async (req, res) => {
  try {
    const command = new GetEmailTemplateCommand({
      TemplateName: req.params.templateName,
    });

    const result = await ses.send(command);

    res.json({
      success: true,
      template: result.TemplateContent,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ===============================================
// 6️⃣ SEND EMAIL USING TEMPLATE
// ===============================================
router.post("/sendTemplateEmail", async (req, res) => {
  const { to, templateName, templateData } = req.body;

  if (!to || !templateName) {
    return res.status(400).json({
      success: false,
      error: "to and templateName are required.",
    });
  }

  try {
    const params = {
      FromEmailAddress: process.env.AWS_SENDER_EMAIL,
      Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
      Content: {
        Template: {
          TemplateName: templateName,
          TemplateData: JSON.stringify(templateData || {}),
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await ses.send(command);

    res.json({
      success: true,
      message: "Email sent using template",
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
