const router = require('express').Router();
const Book = require('../models/BookModel');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

// Helper to upload a buffer stream to Cloudinary
const uploadToCloudinary = (buffer, folder, format) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto', format },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

// 1. UPLOAD (Handles both Private and Marketplace)
router.post('/upload', upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const isMarketplace = req.body.isMarketplace === 'true';
        const ownerId = req.body.ownerId;

        // Check Upload Limits for Free Users (Private library only)
        if (!isMarketplace && ownerId) {
            const user = await User.findById(ownerId);
            if (user && user.subscriptionTier === 'free') {
                const privateBookCount = await Book.countDocuments({ owner: ownerId, isMarketplace: false });
                if (privateBookCount >= 5) {
                    return res.status(403).json({ message: "Upload limit reached. Upgrade to Premium to upload more books." });
                }
            }
        }

        let fileUrl = '';
        let coverUrl = '';

        if (req.files['bookFile']) {
            const result = await uploadToCloudinary(req.files['bookFile'][0].buffer, 'cloudbook_library', 'pdf');
            fileUrl = result.secure_url;
        }

        if (req.files['coverFile']) {
            const result = await uploadToCloudinary(req.files['coverFile'][0].buffer, 'cloudbook_covers', '');
            coverUrl = result.secure_url;
        }

        // Parse tags from comma-separated string
        const tags = req.body.tags
            ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
            : [];

        const newBook = new Book({
            title: req.body.title,
            author: req.body.author,
            description: req.body.description || '',
            category: req.body.category || 'General',
            tags,
            price: req.body.price || 0,
            owner: req.body.ownerId,
            fileUrl,
            coverUrl,
            isMarketplace
        });

        const savedBook = await newBook.save();
        res.status(200).json({ book: savedBook });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// 2. GET PRIVATE LIBRARY (My Uploads + My Purchases) with optional search & category
router.get('/my-library/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { search, category } = req.query;

        // Build filter for private uploads
        let filter = { owner: userId, isMarketplace: false };
        if (category && category !== 'All') filter.category = category;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const myPrivateUploads = await Book.find(filter);

        // Books I bought (populate full doc)
        const user = await User.findById(userId).populate('purchasedBooks');
        let myPurchases = user ? user.purchasedBooks : [];

        // Apply search/category filter to purchases too
        if (search || (category && category !== 'All')) {
            myPurchases = myPurchases.filter(b => {
                const matchSearch = !search ||
                    b.title?.toLowerCase().includes(search.toLowerCase()) ||
                    b.author?.toLowerCase().includes(search.toLowerCase());
                const matchCat = !category || category === 'All' || b.category === category;
                return matchSearch && matchCat;
            });
        }

        res.status(200).json([...myPrivateUploads, ...myPurchases]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. GET MARKETPLACE (All Public Books) with optional search & category
router.get('/marketplace', async (req, res) => {
    try {
        const { search, category } = req.query;
        let filter = { isMarketplace: true };

        if (category && category !== 'All') filter.category = category;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const books = await Book.find(filter).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. DELETE BOOK
router.delete('/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;