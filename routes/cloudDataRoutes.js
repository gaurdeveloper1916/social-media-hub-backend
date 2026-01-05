const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const router = express.Router();

// Lambda-safe temp storage
const upload = multer({ dest: "/tmp" });

/**
 * Upload file
 */
router.post("/", upload.single("file"), async (req, res) => {
  let filePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    filePath = req.file.path;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "my_uploads",
    });

    return res.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      type: uploadResult.resource_type,
      format: uploadResult.format,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    // Cleanup temp file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

/**
 * List uploads
 */
router.get("/", async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression("folder:my_uploads")
      .sort_by("created_at", "desc")
      .max_results(200)
      .execute();

    return res.json({
      success: true,
      assets: result.resources,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * Delete upload
 */
router.delete("/", async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: "public_id required",
      });
    }

    const typesToTry = ["video", "image", "raw"];
    let details = null;

    for (const type of typesToTry) {
      try {
        details = await cloudinary.api.resource(public_id, {
          resource_type: type,
        });
        if (details) break;
      } catch (_) {}
    }

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Asset not found in Cloudinary",
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: details.resource_type,
      type: "upload",
    });

    return res.json({
      success: true,
      deleted: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
