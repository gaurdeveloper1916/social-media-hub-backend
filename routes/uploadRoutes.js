const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");
const db = require("../config/firebase"); // Firestore config file
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // Lambda allows only /tmp write access
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});


const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype || "video/mp4",
    });
    form.append("type", req.file.mimetype || "video/mp4");
    form.append("messaging_product", "whatsapp");

    // Upload to Meta Cloud API
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/media`,
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    fs.unlinkSync(req.file.path);

    // Save to Firebase
    const mediaData = {
      media_id: response.data.id,
      filename: req.file.originalname,
      mime_type: req.file.mimetype,
      createdAt: new Date(),
    };
    await db.collection("whatsapp_media").doc(response.data.id).set(mediaData);

    res.json({
      success: true,
      message: "Media uploaded successfully to WhatsApp Cloud API.",
      data: mediaData,
    });
  } catch (error) {
    console.error("Upload Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const metadata = await axios.get(`https://graph.facebook.com/v21.0/${id}`, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    });

    const { url, mime_type, file_size } = metadata.data;
    res.json({
      success: true,
      data: { media_id: id, mime_type, file_size, url },
    });
  } catch (error) {
    console.error("Get Media Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("whatsapp_media").orderBy("createdAt", "desc").get();
    const mediaList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, count: mediaList.length, data: mediaList });
  } catch (error) {
    console.error("Get All Media Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch media list.",
    });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Delete from Meta
    await axios.delete(`https://graph.facebook.com/v21.0/${id}`, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    });

    // Delete from Firebase
    await db.collection("whatsapp_media").doc(id).delete();

    res.json({
      success: true,
      message: `Media ${id} deleted successfully from WhatsApp Cloud API & Firebase.`,
    });
  } catch (error) {
    console.error("Delete Media Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
