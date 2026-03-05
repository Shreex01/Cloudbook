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
  bio: { type: String, default: '' },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  readingProgress: [ReadingProgressSchema]
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);