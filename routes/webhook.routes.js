const express = require("express");
const router = express.Router();


router.all("/voice", (req, res) => {
  console.log("📞 Voice webhook hit");

  res.set("Content-Type", "text/xml");
  res.status(200).send(`
    <Response>
      <Say voice="female">
hello akshara akshara akshara akshara akshara akshara akshara aksharahow you doing you just scrool to our merchandise if you wanna shop for it press 5
      </Say>
    </Response>
  `);
});
router.all("/status", (req, res) => {

  console.log("📊 CALL STATUS:", req.body);
  res.sendStatus(200);
});

module.exports = router;
