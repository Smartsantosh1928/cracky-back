require('dotenv').config();
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            console.log(err);
            return res.status(403).json({ success: false, message: "Invalid token" });
        }
        console.log(user);
        req.user = user;
        next();
    })
}

module.exports = { verifyToken };