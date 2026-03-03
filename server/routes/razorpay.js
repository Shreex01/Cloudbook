const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Book = require('../models/bookmodel');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. CREATE ORDER
router.post('/create-order', async (req, res) => {
    try {
        const { bookId, userId } = req.body;

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json("Book not found");

        // Razorpay amount is in currency subunits (paise for INR, cents for USD)
        // Here we will treat the book price as INR or USD subunits. Let's assume INR for Razorpay default
        const options = {
            amount: Math.round(book.price * 100), // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
            notes: {
                bookId: book._id.toString(),
                userId: userId
            }
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send("Some error occured");
        }

        res.json({ order, bookId, userId });
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// 2. VERIFY PAYMENT & UNLOCK BOOK
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookId,
            userId
        } = req.body;

        // Create Signature verification
        // From Razorpay Docs: signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret)
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is legit
            const user = await User.findById(userId);

            // Add book to library
            if (!user.purchasedBooks.includes(bookId)) {
                await user.updateOne({ $push: { purchasedBooks: bookId } });
            }

            return res.status(200).json({ message: "Payment Verified & Book Added successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// 3. WEBHOOK (Server-to-Server)
router.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];

        // Verify Webhook Signature using raw payload buffer string
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.rawBody || JSON.stringify(req.body)) // fallback for safety if rawBody missed somehow
            .digest('hex');

        if (signature === expectedSignature) {
            const event = req.body.event;

            // Handle successful payment authorization
            if (event === 'payment.captured' || event === 'order.paid') {
                const paymentEntity = req.body.payload.payment.entity;

                // Retrieve context data attached securely during step 1 order creation
                const bookId = paymentEntity.notes?.bookId;
                const userId = paymentEntity.notes?.userId;

                if (bookId && userId) {
                    const user = await User.findById(userId);
                    if (user && !user.purchasedBooks.includes(bookId)) {
                        await user.updateOne({ $push: { purchasedBooks: bookId } });
                        console.log(`Webhook triggered: Book ${bookId} securely added to User ${userId}`);
                    }
                }
            }

            // Acknowledge receipt of event
            return res.status(200).send("OK");
        } else {
            console.error("Invalid Webhook Signature!");
            return res.status(400).send("Invalid Signature");
        }
    } catch (err) {
        console.error("Webhook route error:", err);
        res.status(500).send("Webhook Error");
    }
});

module.exports = router;
