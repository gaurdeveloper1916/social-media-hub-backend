const mongoose = require("mongoose");

const callLogs = new mongoose.Schema({
    phone: { type: String },
    status: "pending | calling | completed",
    createdAt: { type: Date }
})

module.exports = mongoose.model("CallLogs", callLogs)