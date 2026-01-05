const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// ✅ POST: Add new contact
router.post("/", async (req, res) => {
  const { name, email, number, state, message } = req.body;

  if (!number) {
    return res.status(400).json({ message: "Mobile number is required." });
  }

  try {
    const contactRef = db.collection("contacts").doc();
    const contactData = {
      name,
      email,
      number,
      state,
      message,
      createdAt: new Date(),
    };

    await contactRef.set(contactData);
    res.status(201).json({ id: contactRef.id, ...contactData });
  } catch (error) {
    console.error("Firebase error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/bulk", async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: "Users array is required and cannot be empty." });
  }

  try {
    const batch = db.batch();

    users.forEach((user) => {
      const { name, email, number, state, message } = user;
      if (!number) return; // skip invalid entries

      const contactRef = db.collection("contacts").doc();
      batch.set(contactRef, {
        name,
        email,
        number,
        state,
        message,
        createdAt: new Date(),
        isBulk: true, // to identify later
      });
    });

    await batch.commit();
    res.status(201).json({ message: "Bulk contacts added successfully.", count: users.length });
  } catch (error) {
    console.error("Bulk insert error:", error);
    res.status(500).json({ message: "Server error while saving bulk data." });
  }
});


router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("contacts").orderBy("createdAt", "desc").get();
    const contacts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// ✅ GET (by ID): Fetch a single contact
router.get("/:id", async (req, res) => {
  try {
    const contactRef = db.collection("contacts").doc(req.params.id);
    const doc = await contactRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// ✅ PUT: Update contact by ID
router.put("/:id", async (req, res) => {
  const { name, email, number, state, message } = req.body;

  try {
    const contactRef = db.collection("contacts").doc(req.params.id);
    const doc = await contactRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const updatedData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(number && { number }),
      ...(state && { state }),
      ...(message && { message }),
      updatedAt: new Date(),
    };

    await contactRef.update(updatedData);
    res.status(200).json({ id: contactRef.id, ...updatedData });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// ✅ DELETE: Remove contact by ID
router.delete("/:id", async (req, res) => {
  try {
    const contactRef = db.collection("contacts").doc(req.params.id);
    const doc = await contactRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await contactRef.delete();
    res.status(200).json({ message: "Contact deleted successfully." });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
