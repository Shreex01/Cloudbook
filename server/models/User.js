const mongoose = require("mongoose");

const ReadingProgressSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  page: { type: Number, default: 1 },          // current page (for PDF)
  scrollPercent: { type: Number, default: 0 },  // 0-100 scroll %
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
<<<<<<< HEAD
  bio: { type: String, default: '' },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  readingProgress: [ReadingProgressSchema]
=======
  subscriptionTier: { type: String, enum: ['free', 'premium'], default: 'free' },
  readingProgress: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    currentPage: { type: Number, default: 1 }
  }],
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }]
>>>>>>> 10de3830ac4cf0f54bc31d7e9f508b676f48697d
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);