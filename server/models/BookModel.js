const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  genre: { type: String },
  fileUrl: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // TRUE = Marketplace (Public), FALSE = My Library (Private)
  isMarketplace: { type: Boolean, default: false }, 
}, { timestamps: true });

module.exports = mongoose.model("Book", BookSchema);