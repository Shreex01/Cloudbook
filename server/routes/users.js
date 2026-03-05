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

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadProfilePic = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "cloudbook/profiles",
      allowedFormats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 500, height: 500, crop: "fill" }],
    },
  }),
});

// UPDATE user profile (username, email, bio, password, profilePicture)
router.put("/:id", uploadProfilePic.single('profilePicture'), async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.file) updates.profilePicture = req.file.path;

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

// SAVE reading progress for a book (supports both page/scrollPercent and currentPage)
router.put("/:userId/progress/:bookId", async (req, res) => {
  try {
    const { currentPage, page } = req.body;
    const pageToSave = currentPage || page || 1;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingIdx = user.readingProgress.findIndex(
      p => p.bookId.toString() === req.params.bookId
    );

    if (existingIdx >= 0) {
      user.readingProgress[existingIdx].currentPage = pageToSave;
    } else {
      user.readingProgress.push({ bookId: req.params.bookId, currentPage: pageToSave });
    }

    await user.save();
    res.status(200).json({ message: "Progress saved", currentPage: pageToSave });
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
    res.status(200).json(progress ? progress.currentPage : 1);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADD book to purchased library
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