const router = require('express').Router();
const Book = require('../models/bookmodel');
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

// 1. UPLOAD (Handles both Private and Marketplace)
router.post('/upload', upload.single('bookFile'), async (req, res) => {
    try {
        const isMarketplace = req.body.isMarketplace === 'true'; // Convert string to boolean
        
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'cloudbook_library', resource_type: 'auto', format: 'pdf' },
            async (error, result) => {
                if (error) return res.status(500).json(error);
                
                const newBook = new Book({
                    title: req.body.title,
                    author: req.body.author,
                    description: req.body.description,
                    genre: req.body.genre,
                    price: req.body.price,
                    owner: req.body.ownerId, 
                    fileUrl: result.secure_url,
                    isMarketplace: isMarketplace 
                });

                const savedBook = await newBook.save();
                res.status(200).json(savedBook);
            }
        );
        uploadStream.end(req.file.buffer);
    } catch (err) { res.status(500).json(err); }
});

// 2. GET PRIVATE LIBRARY (My Uploads + My Purchases)
router.get('/my-library/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Books I uploaded privately
        const myPrivateUploads = await Book.find({ owner: userId, isMarketplace: false });
        // Books I bought
        const user = await User.findById(userId).populate('purchasedBooks');
        const myPurchases = user ? user.purchasedBooks : [];

        res.status(200).json([...myPrivateUploads, ...myPurchases]);
    } catch (err) { res.status(500).json(err); }
});

// 3. GET MARKETPLACE (All Public Books)
router.get('/marketplace', async (req, res) => {
    try {
        const books = await Book.find({ isMarketplace: true }).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (err) { res.status(500).json(err); }
});

// 4. DELETE BOOK
router.delete('/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json("Deleted");
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;