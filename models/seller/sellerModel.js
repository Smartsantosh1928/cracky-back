const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
    name: String,
    shopName: String,
    sellerId: String,
    email: String,
    password: String,
    shopLogo: String,
    isVerified: Boolean,
    role: String,
    refreshToken: String,
    phoneNumber: String,
    gst: String,
    shopAddress: [{
        addressLine1: String,
        addressLine2: String,
        state: String,
        district: String,
        city: String,
        area: String,
        pincode: Number,
    }]
});

const SellerModel = mongoose.model('Seller', sellerSchema);

module.exports = SellerModel;