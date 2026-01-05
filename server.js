// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const userRoutes = require("./routes/userRoutes");
// const uploadRoutes = require("./routes/uploadRoutes");
// const contactRoute = require("./routes/contactRoutes");
// const webhookRoute = require("./routes/webhookRoute")
// const emailRoutes = require("./routes/emailRoutes");
// const emailTemplateRoutes = require("./routes/emailTemplateRoute");
// const cloudinaryRoutes = require("./routes/cloudDataRoutes")
// const campaignRoutes = require("./routes/campaign.routes")
// const webhookRoutes = require("./routes/webhook.routes");
// const connectDB = require("./config/db");
// // const connectDB = require("./config/db");

// dotenv.config();
// require("./config/db");

// const app = express();

// connectDB();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use("/api/user", userRoutes);
// app.use("/api/media", uploadRoutes);
// app.use("/api/contact", contactRoute);
// app.use('/webhook',webhookRoute)
// app.use('/api/email',emailRoutes)
// app.use('/api/email/template',emailTemplateRoutes)
// app.use('/api/upload/cloudinary',cloudinaryRoutes)

// app.use("api/campaign", campaignRoutes);
// app.use("api/webhook", webhookRoutes);
// app.use("/health",((res,req)=>{
//     req.send({status:"healthy"})
// }))


// module.exports = app;
require("dotenv").config(); // 👈 FIRST LINE
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Routes
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");
// const webhookRoute = require("./routes/webhookRoute");
const emailRoutes = require("./routes/emailRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoute");
const cloudinaryRoutes = require("./routes/cloudDataRoutes");
const campaignRoutes = require("./routes/campaign.routes");
const webhookRoutes = require("./routes/webhook.routes");
require("dotenv").config();
// DB
const connectDB = require("./config/db");

dotenv.config();



const app = express();

/* -------------------- DB -------------------- */
connectDB();

/* -------------------- Middlewares -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------- Routes -------------------- */
app.use("/api/user", userRoutes);
app.use("/api/media", uploadRoutes);
app.use("/api/contact", contactRoutes);

app.use("/webhook", webhookRoutes); // Exotel / status callbacks

// app.use("/webhook", webhookRoute);      // voice webhook (XML response)

app.use("/api/email", emailRoutes);
app.use("/api/email/template", emailTemplateRoutes);
app.use("/api/upload/cloudinary", cloudinaryRoutes);
app.use("/api/campaign", campaignRoutes);

/* -------------------- Health Check -------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.listen(3000, function(err){
    if (err) console.log(err)
    console.log("Server listening on Port", 3000);
})
module.exports = app;
