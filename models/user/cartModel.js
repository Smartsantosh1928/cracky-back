const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    name: String
});

const CartModel = mongoose.model('Cart', cartSchema);

module.exports = CartModel