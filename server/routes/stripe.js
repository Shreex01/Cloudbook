const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Book = require('../models/bookmodel');

// 1. CREATE CHECKOUT SESSION
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { bookId, userId } = req.body;
    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json("Book not found");

    // Create the session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: book.title,
              description: `Author: ${book.author}`,
            },
            unit_amount: book.price * 100, // Stripe expects cents (e.g., $50 = 5000)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // We pass the bookId and userId to the success URL so we can process it later
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&bookId=${bookId}&userId=${userId}`,
      cancel_url: `${process.env.CLIENT_URL}/marketplace`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 2. VERIFY PAYMENT & UNLOCK BOOK
router.post('/verify-payment', async (req, res) => {
  try {
    const { sessionId, bookId, userId } = req.body;

    // 1. Verify with Stripe that the payment is actually "paid"
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
        const user = await User.findById(userId);
        
        // 2. Add book to library (if not already there)
        if (!user.purchasedBooks.includes(bookId)) {
            await user.updateOne({ $push: { purchasedBooks: bookId } });
        }
        
        return res.status(200).json({ message: "Payment Verified & Book Added!" });
    } else {
        return res.status(400).json({ message: "Payment Failed" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;