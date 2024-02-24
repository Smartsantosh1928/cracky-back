require('dotenv').config();
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null || token == undefined) return res.sendStatus(401);

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

const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9); // This generates a random alphanumeric string
};

module.exports = { verifyToken, generateUniqueId };