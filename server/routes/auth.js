const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) { res.status(500).json(err); }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("User not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, user });
  } catch (err) { res.status(500).json(err); }
});

// GOOGLE SIGN-IN via credential (ID token — One Tap flow)
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = await bcrypt.hash(googleId + process.env.JWT_SECRET, 10);
      user = new User({
        username: name.replace(/\s+/g, '_').toLowerCase() + '_' + Math.floor(Math.random() * 1000),
        email,
        password: randomPassword,
        bio: '',
      });
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, user });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// GOOGLE SIGN-IN via access token (implicit flow — frontend sends verified userinfo)
router.post('/google-token', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email || !googleId) return res.status(400).json({ message: 'Missing Google user info' });

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = await bcrypt.hash(googleId + process.env.JWT_SECRET, 10);
      const baseUsername = name
        ? name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20)
        : email.split('@')[0];
      user = new User({
        username: baseUsername + '_' + Math.floor(Math.random() * 9000 + 1000),
        email,
        password: randomPassword,
        bio: '',
      });
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, user });
  } catch (err) {
    console.error('Google token auth error:', err);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;