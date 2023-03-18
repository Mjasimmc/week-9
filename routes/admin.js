
const express = require('express')
const router = express();
const multer = require('multer');
const imagestore = require('../middleware/storage')

const path = require('path')

const storage = imagestore
const upload = multer({storage:storage})

router.set('views', './views/admin')
const adminController = require('../controllers/admin')
const sessionCheck = require('../middleware/adminSession')

// admin login
router.get('/',sessionCheck.notLogged,adminController.loadSignIn)
router.post('/login',sessionCheck.notLogged,adminController.postlogin)

// logout
router.get('/logout',adminController.logout)

// admin home
router.get('/home',sessionCheck.logged,adminController.loadHome)

// profile
router.get('/profile',sessionCheck.logged,adminController.loadprofile)


// viewing and user controlling
router.get('/userlist',sessionCheck.logged,adminController.userlist)    
router.get('/block/:id',sessionCheck.logged,adminController.block)
router.get('/unblock/:id',sessionCheck.logged,adminController.unblock)


// products adding
router.get('/addproduct',sessionCheck.logged,adminController.loadinsertproduct)
router.post('/addproduct',sessionCheck.logged,upload.array('image',10),adminController.insertProduct)

// viewing and soft deleting
router.get('/productlist',sessionCheck.logged,adminController.productlist)
router.get('/edit-product/:id',sessionCheck.logged,adminController.loadEditProduct)
router.post('/update-product',sessionCheck.logged,adminController.updateProduct)
router.get('/deleteproduct/:id',sessionCheck.logged,adminController.deleteproduct)

// category
router.get('/categorylist',sessionCheck.logged,adminController.categorylist)
router.get('/category',sessionCheck.logged,adminController.loadcategory)
router.post('/addcategory',sessionCheck.logged,adminController.insertCategory)

router.get('/orderList',sessionCheck.logged,adminController.loadOrderList)
router.get('/order/:id',adminController.viewOrder)


module.exports = router;