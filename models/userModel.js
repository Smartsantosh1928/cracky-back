const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    profilePictureUrl: String,
    isVerified: Boolean,
    emailOffers: Boolean,
    role: String,
    refreshToken: String,
    providers: Array,
});

const User = mongoose.model('User', userSchema);

module.exports = User;