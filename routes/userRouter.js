const express = require("express");
const router = express.Router();
const User = require('../models/userModel');
const { verifyToken } = require('../utils/utilFuns');

router.get('/', verifyToken ,async (req, res) => {
    const { user } = req;
    const id = user.id;
    User.findById(id).then((user) => {
        res.status(200).json({ success: true, user });
    }).catch((err) => {
        res.status(400).json({ success: false, message: "Something went wrong", error: err.message });
    })
})

module.exports = router;