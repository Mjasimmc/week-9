const userModify = require('../models/user')
const productView = require('../models/product')
const orderPlace = require('../models/orders')
const categorySearch = require('../models/catogory')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config({ path: __dirname + '../config/.env' })

const Razorpay = require('razorpay');
const { order } = require('paypal-rest-sdk');
const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});


const accountSid = process.env.accountSid;
const authToken = process.env.authToken;


const client = require('twilio')(accountSid, authToken);

const sendOTP = async (toNumber, otp) => {
    await client.messages
        .create({
            body: `Your Otp is ${otp}`,
            from: '+15674092922',
            to: toNumber
        })
        .then(message => console.log(message.sid))
        .catch(error => console.error(error));
}
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (err) {
        console.log(err.message)
        res.redirect('/')
    }
}
const load_landing = async (req, res, next) => {
    try {
        const category = await categorySearch.find({});
        const products = await productView.find({ delete: 0 })
        console.log(products)
        res.render('landing', { products, category })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const loadPhoneNumber = async (req, res, next) => {
    try {
        alertMessage = req.session.loginmessage
        req.session.loginmessage = ""
        res.render('phoneNumber', { alertMessage })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const postNumber = async (req, res, next) => {
    try {
        const sendMobile = "+91" + req.body.mobile
        console.log(sendMobile)
        req.session.mobile = sendMobile
        const otpSend = Math.floor((Math.random() * 1000000) + 1)
        console.log(otpSend)
        req.session.sendOtp = otpSend
        sendOTP(sendMobile, otpSend)
        res.render('otpChecking')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const verifyOtp = async (req, res, next) => {
    try {
        const otp = req.session.sendOtp
        const userOtp = req.body.post
        if (otp == userOtp) {
            res.redirect('/signUp')
        } else {
            res.render('otpChecking')
        }
    } catch (error) {
        console.log(error.message)
        next(error)

    }
}
const load_SignUp = async (req, res, next) => {
    try {
        mobile = req.session.mobile
        let alertMessage = req.session.signupmessage
        req.session.signupmessage = ""
        res.render('signup', { alertMessage, mobile })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_SignIn = async (req, res, next) => {
    try {

        let alertMessage = req.session.loginmessage
        req.session.loginmessage = ""
        res.render('signin', { alertMessage })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const post_SignIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let userdata = await userModify.findOne({ email: email });
        if (userdata) {
            const pass = await bcrypt.compare(password, userdata.password)
            if (pass) {
                req.session.login = userdata
                res.redirect('/home');
            } else {
                req.session.loginmessage = "incorrect password"
                res.redirect('/login')
            }
        } else {
            req.session.loginmessage = "user not found"
            res.redirect('/login')

        };
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const loadForgotPassword = async (req, res, next) => {
    try {
        res.render('phoneNumberForget')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const postNumberForgetPass = async (req, res, next) => {
    try {
        const sendMobile = "91" + req.body.mobile
        req.session.mobile = sendMobile
        const email = req.body.email

        req.session.user = await userModify.findOne({ email: email })
        const otpSend = Math.floor((Math.random() * 1000000) + 1)
        req.session.sendOtp = otpSend
        console.log(otpSend)
        sendOTP(sendMobile, otpSend)
        res.render('forgetOtp')
    } catch (error) {
        console.log(error.message)
        next(error)

    }
}
const postOtpPass = async (req, res, next) => {
    try {
        const otp = req.session.sendOtp
        const userOtp = req.body.post
        console.log(otp, userOtp)
        if (otp == userOtp) {
            res.render('passChange')
        } else {
            const otpSend = Math.floor((Math.random() * 1000000) + 1)
            console.log(otpSend)
            req.session.sendOtp = otpSend
            // sendOTP(sendMobile, otpSend)
            res.render('forgetOtp')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const changePass = async (req, res, next) => {
    try {
        const pass = await securePassword(req.body.password)
        const userid = req.session.user._id
        console.log(userid)
        const result = await userModify.findOneAndUpdate({ _id: userid }, {
            $set: {
                password: pass
            }
        })
        console.log(result)
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const post_SignUp = async (req, res, next) => {
    try {
        const { mobile, name, email } = req.body
        console.log(mobile, name, email)
        let password = await securePassword(req.body.password)
        const userdata = await userModify.findOne({ email: email })
        console.log(userdata)
        const userinsert = new userModify({
            name: name,
            email: email,
            mobile: mobile,
            password: password
        })
        if (userdata != null) {
            req.session.signupmessage = "you already have an account"
            res.redirect('/register')
        } else {
            const result = await userinsert.save()
            if (result) {

                req.session.login = result
                res.redirect('/home')
            } else {
                req.session.signupmessage = "err occured on saving"
                res.redirect('/register')
            }
        }
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const load_Home = async (req, res, next) => {
    try {
        const user = req.session.login
        const category = await categorySearch.find({});
        var products = await productView.find({ delete: 0 })
        res.render('home', { products, user, category })

    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const logout = async (req, res, next) => {
    try {

        req.session.login = false;
        res.redirect('/')
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const l_browse_Product = async (req, res, next) => {
    try {

        const prid = req.params.id
        const prdetails = await productView.findOne({ _id: prid });
        const category = prdetails.category
        const products = await productView.find({ delete: 0, category: category })
        res.render('before-pdt-view', { prdetails, products })

    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const h_browse_product = async (req, res, next) => {
    try {
        const prid = req.params.id
        const user = req.session.login
        const prdetails = await productView.findOne({ _id: prid })
        const category = prdetails.category
        const products = await productView.find({ delete: 0, category: category }).limit(4)
        res.render('after-pdt-views', { prdetails, user, products })

    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const load_profile = async (req, res, next) => {
    try {
        const user = req.session.login
        const userdata = req.session.login
        res.render('profile', { userdata, user })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const add_address = async (req, res, next) => {
    try {
        let alertMessage = req.session.addmessage
        req.session.addmessage = ""
        const user = req.session.login
        res.render('add-address', { user, alertMessage })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const edit_user = async (req, res, next) => {
    try {
        req.session.cart = false
        const userdata = req.session.login
        const user = req.session.login
        res.render('edit-profile', { user, userdata })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const insert_address = async (req, res, next) => {
    try {
        const id = req.session.login
        const { house, city, district, state, post } = req.body
        const userdata = req.session.login
        if (userdata.address != [] || userdata.address != null) {
            const datatoinsert = {
                house: house,
                post: post,
                city: city,
                state: state,
                district: district
            }
            await userModify.findOneAndUpdate({ _id: id }, {
                $push: {
                    address: [datatoinsert]
                }
            }, { new: true }).then(() => req.session.addmessage = 'address added succfuly');
        } else {
            const datatoinsert = {
                house,
                post,
                city,
                state,
                district
            }
            const address = userModify.findOneAndUpdate({ _id: id }, {
                $push: {
                    address: [datatoinsert]
                }
            }, { new: true }).then(() => req.session.addmessage = 'address added succfuly');
        }


        res.redirect('/address-list')
    } catch (err) {
        console.log(err.message);
        next(err)
    }
}
const load_address = async (req, res, next) => {
    try {
        alertMessage = req.session.addmessage
        req.session.addmessage = ""
        const user = req.session.login
        const userdata = await userModify.findOne({ _id: user })
        res.render('list-address', { userdata, user, alertMessage })
    } catch (err) {
        console.log(err.message)
        next(err)
    }
}
const delete_address = async (req, res, next) => {
    try {
        const addr_id = req.params.id
        id = req.session.login._id
        const result = await userModify.findByIdAndUpdate({ _id: id }, {
            $pull: {
                address: { _id: addr_id }
            }
        }).then(() => req.session.addmessage = 'address removed')
        res.redirect('/address-list')

    } catch (err) {
        console.log(err.message)
        next(err)
    }
}
const update_profile = async (req, res, next) => {
    try {
        const userid = req.session.login._id
        const { name, email, mobile } = req.body
        await userModify.findOneAndUpdate({ _id: userid }, {
            $set: {
                name: name,
                email: email,
                mobile: mobile
            }
        })
        res.redirect(`/profile/${userid}`)
    } catch (err) {
        console.log(err.message)
        next(err)
    }
}
const view_cart = async (req, res, next) => {
    try {
        req.session.cart = true
        const user = req.session.login
        const cartdata = await userModify.findOne({ _id: user }).populate("cart.product")
        res.render('cart', { user, cartdata })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const add_to_cart = async (req, res, next) => {
    try {
        const { pdt_id } = req.body

        const id = req.session.login._id
        const productDetails = await productView.findOne({ _id: pdt_id })
        const check = await userModify.findOne({ cart:{product: pdt_id} })
        console.log(productDetails)
        if (check == [] || check == null || check == 'undefined') {
            const quantity = 1
            await userModify.findOneAndUpdate({ _id: id }, {
                $push: {
                    cart: {
                        product: pdt_id,
                        quantity: quantity,
                    }
                }
            }, { upsert: true })
                .then(() => res.json(
                    {
                        status: true,
                        increment: true
                    }))
                .catch(() => console.log('not inserted'))
        } else {
            const num = parseInt(req.body.num)
            console.log(check.cart[num])
            if (check.cart[num].quantity + 1 <= productDetails.stock) {
                await userModify.findOneAndUpdate(
                    { _id: id, "cart.product": pdt_id },
                    { $inc: { "cart.$.quantity": 1 } }
                ).then(() => {
                    res.json(
                        {
                            status: true,
                            increment: false,
                            productIncrement: true,
                        })
                })
            } else {
                res.json(
                    {
                        status: false,
                        increment: false,
                    })
            }
        }
    } catch (err) {
        console.log(err.message);
        next(err)
    }
}
const deleteProductCart = async (req, res, next) => {
    try {

        const { pdt_id } = req.body
        const id = req.session.login._id
        await userModify.findOneAndUpdate({ _id: id }, {
            $pull: {
                cart: { product: pdt_id }
            }
        }).then(() => {
            res.json(
                {
                    status: true,
                })
        }).catch((error) => {
            console.log(error)
        })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const remove_cart = async (req, res, next) => {
    try {
        const { pdt_id } = req.body
        const id = req.session.login._id
        await userModify.findOneAndUpdate(
            { _id: id, "cart.product": pdt_id },
            { $inc: { "cart.$.quantity": -1 } }
        ).catch((err) => console.log(err))
        await userModify.findOneAndUpdate(
            { _id: id, "cart.product": pdt_id },
            { $pull: { cart: { product: pdt_id, quantity: 0 } } }
        )
            .catch((err) => console.log(err))
        res.json({ status: true })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const view_shop_after = async (req, res, next) => {
    try {
        const category = await categorySearch.find({});
        const user = req.session.login
        const { products } = req.session
        res.render('shop-after', { products, user, category })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const view_shop_before = async (req, res, next) => {
    try {
        const category = await categorySearch.find({});
        const { products } = req.session
        res.render('shop-before', { products, category })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_checkout = async (req, res, next) => {
    try {
        const user = req.session.login
        const users = await userModify.findOne({ _id: user }).populate("cart.product")
        res.render('after-checkout', { user, users })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const post_order = async (req, res, next) => {
    try {
        console.log
        let { name, house, post, city, state, district, totalprice, mobile, payment } = req.body
        const user = req.session.login
        // const amount = parseInt(totalprice*100)
        const productsIn = await productView.find({})
        // const payement = req.body.payement
        const userdata = await userModify.findOne({ _id: user._id })
        let products = userdata.cart
        const currentDate = new Date();
        console.log(name, house, post, city, district, state)

        for (let i = 0; i < user.cart.length; i++) {
            for (let j = 0; j < productsIn.length; j++) {
                if (user.cart[i].product == productsIn[j]._id) {
                    const pdtq = productsIn[j].stock - user.cart[i].quantity
                    await productView.findOneAndUpdate({ _id: productsIn[j]._id }, { $set: { stock: pdtq } })
                }
            }
        }


        const currentDateAndTime = currentDate;
        const newOrder = new orderPlace({
            user: user._id,
            products: products,
            orderdate: currentDateAndTime,
            payement: payment,
            orderstatus: "order initialized",
            orderaddress: {
                name: name,
                mobile: mobile,
                house: house,
                post: post,
                city: city,
                state: state,
                district: district
            },
            totalprice: totalprice / 100
        })
        const result = await newOrder.save()
        console.log(result)
        req.session.orderplaced = result
        if(result){
            await userModify.findOneAndUpdate({_id:user._id},{
                $push:{
                    orders:{
                        order:result._id
                    }
                }
            })
            if (payment == "COD") {
                res.json({ payment: payment, orderid: result._id })
            } else {
    
                // console.log(amount)
                const options = {
                    amount: totalprice, // amount in paise
                    currency: "INR",
                    receipt: "order_rcptiifd_11",
                    payment_capture: 1,
                };
    
                razorpay.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(order)
                    } else {
                        req.session.orderid = order.id
                        console.log(order);
                        res.json(order)
                    }
                });
    
            }
    
        }else{
            res.json({status:false})
        }
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const conformation = async (req, res, next) => {
    try {
        // paymentstatus
        const user = req.session.login
        const orderid = req.session.orderplaced._id
        await orderPlace.findOneAndUpdate({ _id: orderid }, {
            $push: {
                orderstatus: "order recieved"
            }
        })
        const orderDetails = await orderPlace.findOne({ _id: orderid }).populate("products.product")
        console.log(orderDetails)
        res.render("order-placed", { orderDetails, user })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const verifyPayment = async (req, res, next) => {
    try {
        
        const { razorpay_payment_id, razorpay_signature } = req.body
        const order_id = req.session.orderid
        const secret = process.env.key_secret


        // Construct the message to be signed
        const message = order_id + '|' + razorpay_payment_id;

        // Generate the HMAC hex digest using SHA256 algorithm
        const generated_signature = crypto.createHmac('sha256', secret)
            .update(message)
            .digest('hex');

        // Verify the generated signature against the received signature
        if (generated_signature === razorpay_signature) {
            console.log('Payment is successful');
            const orderid = req.session.orderplaced._id
            await orderPlace.findOneAndUpdate({ _id: orderid }, {
                $set:{
                    paymentstatus:"Completed"
                }
            })
            res.json({
                payment: true,
                orderid: req.session.orderid
            })
        } else {
            console.log('Payment verification failed');
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const listOrders = async(req,res,next)=>{
    try {
        const user = req.session.login
        const  userOrders = await orderPlace.find({user:user._id})
        console.log(userOrders)
        res.render('order-list',{user,userOrders})
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
module.exports = {
    listOrders,

    conformation,
    verifyPayment,


    changePass,
    postOtpPass,
    postNumberForgetPass,
    loadForgotPassword,
    load_SignUp,
    loadPhoneNumber,
    postNumber,
    verifyOtp,
    post_order,
    load_checkout,
    view_shop_after,
    view_shop_before,
    view_cart,
    add_to_cart,
    remove_cart,
    deleteProductCart,
    load_landing,
    load_SignIn,
    load_profile,
    load_Home,
    edit_user,
    update_profile,
    insert_address,
    delete_address,
    add_address,
    load_address,
    logout,
    post_SignIn,
    post_SignUp,
    l_browse_Product,
    h_browse_product
}