const express = require("express");
const bodyParser = require("body-parser");
const middleware = require('../middleware/isAuth');
const router = express.Router();

// ALL THE LOGIC TO BE EXECUTED WHEN ANY ADMIN PAGES ARE LOADED IS PRESENT IN THE CONTROLLERS/admin.js.
const adminControl = require("../controllers/admin");

router.use(bodyParser.urlencoded({ extended: false }));

// We have split our code to controllers so that we can keep the routes from becoming too difficult to trace. And also this will help us implement MVC.

// The 2nd parameter is a callback function which will fetch the data and provide it to the views we can confidently say that it comes under controller.

// THIS CONTAINS THE ADMIN FORM CONTROL url. THE LOGIC TO BE EXECUTED IS ENCAPSULATED WITHIN CONTROLLERS. /ADMIN IS ADDED IMPLICITLY AT THE index.js TO ALL ADMIN PAGES
router.get("/add-product",middleware.isAuth, adminControl.getProduct);
router.post("/add-product", adminControl.postProduct);

// // THIS CONTAINS url TO THE ADMIN PRODUCT PAGE
router.get("/products",middleware.isAuth, adminControl.getProductList);

router.post('/delete-product',adminControl.deleteProduct)

router.get('/edit-product/:id',middleware.isAuth,adminControl.getEditProduct)
router.post('/edit-product',adminControl.postEditProduct);
exports.admin = router;
