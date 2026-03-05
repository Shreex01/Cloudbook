const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('purchasedBooks', 'title coverUrl');
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE user profile (username, email, bio, password)
router.put("/:id", async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    const { password, ...info } = updated._doc;
    res.status(200).json(info);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// SAVE reading progress for a book
router.put("/:userId/progress/:bookId", async (req, res) => {
  try {
    const { page, scrollPercent } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingIdx = user.readingProgress.findIndex(
      p => p.bookId.toString() === req.params.bookId
    );

    if (existingIdx >= 0) {
      user.readingProgress[existingIdx].page = page || user.readingProgress[existingIdx].page;
      user.readingProgress[existingIdx].scrollPercent = scrollPercent ?? user.readingProgress[existingIdx].scrollPercent;
      user.readingProgress[existingIdx].updatedAt = new Date();
    } else {
      user.readingProgress.push({
        bookId: req.params.bookId,
        page: page || 1,
        scrollPercent: scrollPercent || 0
      });
    }

    await user.save();
    res.status(200).json({ message: "Progress saved" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET reading progress for a specific book
router.get("/:userId/progress/:bookId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const progress = user.readingProgress.find(
      p => p.bookId.toString() === req.params.bookId
    );
    res.status(200).json(progress || { page: 1, scrollPercent: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADD book to purchased library (also used by stripe webhook)
router.put("/:userId/buy/:bookId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.purchasedBooks.includes(req.params.bookId)) {
      return res.status(400).json({ message: "Already owned" });
    }
    await user.updateOne({ $push: { purchasedBooks: req.params.bookId } });
    res.status(200).json({ message: "Success" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;