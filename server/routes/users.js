const router = require("express").Router();
const User = require("../models/User");
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) { res.status(500).json(err); }
});

router.put("/:userId/buy/:bookId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user.purchasedBooks.includes(req.params.bookId)) {
      return res.status(400).json("Already owned");
    }
    await user.updateOne({ $push: { purchasedBooks: req.params.bookId } });
    res.status(200).json("Success");
  } catch (err) { res.status(500).json(err); }
});

// Update Reading Progress
router.put('/:id/progress/:bookId', async (req, res) => {
  try {
    const { currentPage } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");

    const existingProgressIndex = user.readingProgress.findIndex(
      p => p.bookId.toString() === req.params.bookId
    );

    if (existingProgressIndex >= 0) {
      user.readingProgress[existingProgressIndex].currentPage = currentPage;
    } else {
      user.readingProgress.push({ bookId: req.params.bookId, currentPage });
    }

    await user.save();
    res.status(200).json(user.readingProgress);
  } catch (err) { res.status(500).json(err); }
});

// Get Reading Progress for a specific book
router.get('/:id/progress/:bookId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");

    const progress = user.readingProgress.find(
      p => p.bookId.toString() === req.params.bookId
    );

    res.status(200).json(progress ? progress.currentPage : 1);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;