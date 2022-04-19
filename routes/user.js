const express = require("express");
const middleware = require('../middleware/isAuth');

// ALL THE LOGIC TO BE EXECUTED WHEN ANY ADMIN PAGES ARE LOADED IS PRESENT IN THE CONTROLLERS/products.js.
const productController = require("../controllers/products");

const router = express.Router();

// HAS ACCESS TO HOME PAGE (index page) AND getIndex() IN CONTROLLERS
router.get("/shop", productController.getIndex);

// HAS ACCESS TO CART PAGE AND getCart() IN CONTROLLERS
router.post("/cart", productController.postCart);
router.get("/cart",middleware.isAuth , productController.getCart);

router.post("/delete-cart-item",middleware.isAuth,productController.deleteCartItem);

// // // HAS ACCESS TO PRODUCTS PAGE (USER SIDE) (product-list page)
router.get("/products", productController.getProductUser);

router.get("/products/:id", productController.getProductDetails);

// // HAS ACCESS TO CHECKOUT PAGE AND getCheckout() IN CONTROLLERS
// // router.get("/checkout", productController.getCheckout);

// // HAS ACCESS TO Orders PAGE AND getOrders() IN CONTROLLERS

router.get("/orders",middleware.isAuth, productController.getOrder);

router.post("/create-order",middleware.isAuth,productController.postOrders);

// // HAS ACCESS TO HOME PAGE AND getIndex() IN CONTROLLERS (REQUEST FOR ANY OF THE ABOVE PAGE HOME PAGE IS LOADED)
router.get("/", productController.getIndex);

exports.user = router;
