const express = require("express");
const router = express.Router();
const User = require('../../models/user/userModel');
const { verifyToken } = require('../../utils/utilFuns');

router.get('/', verifyToken ,async (req, res) => {
    const { user } = req;
    const id = user.id;
    User.findById(id).select('-password -refreshToken').then((user) => {
        res.status(200).json({ success: true, user });
    }).catch((err) => {
        res.status(400).json({ success: false, message: "Something went wrong", error: err.message });
    })
})

router.put("/update" , verifyToken, async (req, res) => {
    const { user } = req;
    const id = user.id;
    const { name, phoneNumber, gender, emailOffers, address, profilePictureUrl } = req.body;
    console.log(req.body);
    //find by id and update
    User.findById(id).then((user) => {
        user.name = name;
        user.phoneNumber = phoneNumber;
        user.gender = gender;
        user.emailOffers = emailOffers;
        user.address = address;
        user.save().then((user) => {
            res.status(200).json({ success: true, message: "User updated successfully" });
        }).catch((err) => {
            res.status(400).json({ success: false, message: "Something went wrong", error: err.message });
        })
    }).catch((err) => {
        res.status(400).json({ success: false, message: "Something went wrong", error: err.message });
    })
})

module.exports = router;