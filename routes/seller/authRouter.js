require('dotenv').config();
const express = require("express");
const router = express.Router();
const Seller = require('../../models/seller/sellerModel')
const User = require('../../models/user/userModel')
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const { generateUniqueId } = require('../../utils/utilFuns');

router.get('/', (req, res) => {
    res.send("Seller Auth Router");
})

router.post('/register', async (req, res) => {
    const { email, password, name, shopName, phoneNumber, shopLogo, gst, shopAddress } = req.body;
    const existingSeller = await Seller.findOne({ email: email })

    if (existingSeller) {
        return res.status(400).json({ success: false, message: "Seller already exists with this email" });
    }

    const existingUser = await User.findOne({ email: email })

    if (existingUser) {
        return res.status(400).json({ success: false, message: "User can't become a seller. If you want to become a seller please use Another email" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const sellerId = generateUniqueId();

    const newSeller = new Seller({
        name,
        shopName,
        sellerId,
        email,
        password: hashedPassword,
        shopLogo,
        isVerified: false,
        role: 'seller',
        refreshToken: "",
        phoneNumber,
        gst,
        shopAddress
    });

    newSeller.save().then((seller) => {
        const accessToken = jwt.sign({ id: seller.sellerId }, process.env.SELLER_JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ id: seller.sellerId }, process.env.SELLER_JWT_REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
        seller.refreshToken = refreshToken;
        seller.save().then(() => {
            res.status(201).json({ success: true, message: "Seller Account created successfully", accessToken, refreshToken });
        }).catch((err) => {
            res.status(400).json({ success: false, message: "Something went wrong", error: err.message });
        })
    }).catch((err) => {
        res.status(400).json({ success: false, message: "Something went wrong", error: err.message });
    })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email: email });

    if (!seller) {
        return res.status(400).json({ success: false, message: `Seller account not found for this ${email}` });
    }

    if (!await bcrypt.compare(password, seller.password)) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({ success: true, message: "Seller logged in successfully" });
})


module.exports = router