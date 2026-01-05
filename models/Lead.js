const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true
    },

    intent: {
      type: String,
      enum: ["interested", "not_interested", "callback"],
      default: "callback"
    },

    transcript: {
      type: String,
      default: ""
    },

    duration: {
      type: Number, // seconds
      default: 0
    },

    recordingUrl: {
      type: String,
      default: ""
    },

    callStatus: {
      type: String,
      enum: ["pending", "queued", "completed", "failed"],
      default: "pending"
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("Lead", leadSchema);
