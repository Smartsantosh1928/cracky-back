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
    //Other Details
    phoneNumber: String,
    gender: String,
    address: [{
        addressLine1: String,
        addressLine2: String,
        state: String,
        district: String,
        city: String,
        area: String,
        pinCode: String
    }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;