const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/userModel');

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    res.send("hello")
})

module.exports = router