const express = require("express");
const router = express.Router();
const { UserFile, UserChat } = require("../models");

// POST - insert into both tables
router.post("/combined", async (req, res) => {
  const { user_id, user_name, file_or_folder, permission, task, message, sender } = req.body;

  try {
    // Insert into user_files
    await UserFile.findOrCreate({
      where: { user_id, file_or_folder },
      defaults: { user_name, permission },
    });

    // Insert into user_chats
    await UserChat.create({ user_id, user_name, task, file_or_folder, message, sender });

    res.json({ message: "✅ Data inserted into both tables successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - fetch files and chats together
router.get("/combined/:user_id", async (req, res) => {
  try {
    const files = await UserFile.findAll({ where: { user_id: req.params.user_id } });
    const chats = await UserChat.findAll({
      where: { user_id: req.params.user_id },
      order: [["timestamp", "ASC"]],
    });

    res.json({ user_id: req.params.user_id, files, chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
