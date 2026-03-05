const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  subscriptionTier: { type: String, enum: ['free', 'premium', 'team'], default: 'free' },
  readingProgress: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    currentPage: { type: Number, default: 1 }
  }],
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }]
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);