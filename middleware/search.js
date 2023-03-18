const productView = require('../models/product')

const search_result = async (req,res,next)=>{
    try {
        const products = await productView.find({delete:0})
        req.session.products = products ;
        next();
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const productLook = async (req,res,next)=>{
    try {
        const prid = req.params.id
        if(req.session.login){
            next()
        }else{
            res.redirect(`/product/${prid}`)
        }
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const productGet  =async (req,res,next)=>{
    try {
        const prid = req.params.id
        if(req.session.login){
            res.redirect(`/product-home/${prid}`)
        }else{
            next()
        }
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
module.exports = {
    productLook,
    search_result,
    productGet
}