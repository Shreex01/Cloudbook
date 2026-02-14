const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const authRoute = require('./routes/auth');
const bookRoute = require('./routes/books');
const userRoute = require('./routes/users');
const stripeRoute = require('./routes/stripe');

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/auth', authRoute);
app.use('/api/books', bookRoute);
app.use('/api/users', userRoute);
app.use('/api/payment', stripeRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});