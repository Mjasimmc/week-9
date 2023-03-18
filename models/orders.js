const mongoose = require('mongoose');
const order = mongoose.Schema({
    user: {
        type: String,
        ref: 'user'
    },
    products: [{
        product: {
            type: String,
            ref: 'product'
        },
        quantity: {
            type: Number
        }
    }],
    orderdate: {
        type: Date
    },
    payement: {
        type: String
    },
    orderstatus: [
        String
    ],  
    orderaddress: {
        name: { type: String },
        mobile: { type: Number },
        house: { type: String },
        post: { type: Number },
        city: { type: String },
        state: { type: String },
        district: { type: String }
    },
    totalprice: {
        type: Number
    },
    paymentstatus:{
        type:String,
        default:"pending"
    }
})
module.exports = mongoose.model('order', order)