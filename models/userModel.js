const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    isVerified: Boolean,
    role: String,
    refreshToken: String,
    createdAt: Date,
    updatedAt: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = User;