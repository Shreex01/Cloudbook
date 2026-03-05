const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' }, // e.g. Science, Programming, etc.
  tags: [{ type: String }],                         // free-form tags for search
  fileUrl: { type: String, required: true },
  coverUrl: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // TRUE = Marketplace (Public), FALSE = My Library (Private)
  isMarketplace: { type: Boolean, default: false },
}, { timestamps: true });

// Full-text index for search
BookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model("Book", BookSchema);