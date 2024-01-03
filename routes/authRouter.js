require('dotenv').config();
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const sendMail = require('../config/mailer');

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    console.log(email, password);

    const existingUser = await User.findOne({ email: email })
    console.log(existingUser);
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt();    
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        email,
        password: hashedPassword,
    });
    newUser.save().then((user) => {
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
        user.refreshToken = refreshToken;
        user.save().then(async () => {
            await sendMail(email, 'Verify your email', 'verifyEmail', { url: `${process.env.DOMAIN_URL}/auth/verify/${accessToken}`, cracky_url: process.env.WEBSITE_URL, unsubscribe_url: `${process.env.DOMAIN_URL}/auth/unsubscribe/${accessToken}` })
            res.status(201).json({ success: true, message: "Account created successfully", accessToken, refreshToken });
        })
    }).catch((err) => {
        res.status(400).json({ success: false, message: "Something went wrong", error: err.message });
    })
})

router.post('/getAccessToken',(req,res) => {
    const { refreshToken } = req.body;
    if(refreshToken == null) return res.sendStatus(401).json({ success: false, message: "No refresh token" });
    User.findOne({ refreshToken }).then(user => {
        if(!user) return res.sendStatus(403).json({ success: false, message: "Refresh token not found" });
        else{
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.json({ success: true, accessToken });
        }
    })
})

router.get('/verify/:token', (req, res) => {
    const { token } = req.params;
    if(token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        User.findByIdAndUpdate(user.id, { isVerified: true }).then(user => {
            res.redirect(process.env.WEBSITE_URL);
        })
    })
})

router.get('/unsubscribe/:token', (req, res) => {
    const { token } = req.params;
    if(token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        User.findByIdAndUpdate(user.id, { emailOffers: false }).then(user => {
            res.redirect(process.env.WEBSITE_URL);
        })
    })
})

module.exports = router