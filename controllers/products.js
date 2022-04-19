// The commented code here is when i used mongodb without mongoose.

const Product = require("../model/product");
const Order = require("../model/order");
exports.getProductUser = (req, res, next) => {
  Product.find()
    .then((product) => {
      res.render("shop/product-list", {
        prod: product,
        pageTitle: "Product List",
        path: "user/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// THIS CONTAINS LOGIC TO BE IMPLEMENTED WHEN HOME PAGE IS LOADED.
exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prod: products,
        pageTitle: "Shop",
        path: "/index",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  // console.log(req.user);
  req.user
    // this is an in built function which can be called on a mongoose object which will fetch the data mentioned data from the relation mentioned in 1st argument.

    // Here it will fetch the title,price,imageurl from Products collection. cart.items.id is the foreign key using which data will be retrived
    .populate("cart.items.id", "title imageurl price")
    // .getCart()
    .then((user) => {
      let logged = null;
      if (req.get("Cookie")) {
        logged = req.session.logged;
      }
      // console.log(user.cart.items);
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "user/cart",
        cart: user.cart.items,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const id = req.body.id;
  Product.findById(id)
    .then((product) => {
      // this will manage the add to cart function the body of the function is same as it was before.
      return req.user.addToCart(product);
    })
    .then((result) => {
      // console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const id = req.body.id;
  req.user
    .deleteById(id)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

//THIS CONTAINS LOGIC TO BE IMPLEMENTED WHEN ORDERS PAGE  IS LOADED.
exports.getOrder = (req, res, next) => {
  // If you see the structure of Orders we have a user object that contains the foreign key to User collection by id.
  // NOTE: Remember that nesting of properties must be represented in form of strings
  Order.find({
    "user.id": req.user._id,
  })
    .then((orders) => {
      // console.log(orders);
      let logged = null;
      if (req.get("Cookie")) {
        logged = req.session.logged;
      }
      res.render("shop/orders", {
        pageTitle: "Orders",
        path: "user/orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrders = (req, res, next) => {
  req.user
    // This will populate the product information by using the id of the product in cart. Explained above
    .populate("cart.items.id")
    .then((user) => {
      // After populating we will be getting the user object with the data of products brought by populate(). Now we have to restructure the result of items what we have got so that it can match the structure we have given for Orders. This is being done by the map function below.

      const products = user.cart.items.map((i) => {
        // A minor tweek has to be introduced. You have to re-create the object. It would have been saved in _doc.
        return { quantity: i.quantity, product: { ...i.id._doc } };
      });
      console.log(products);
      const order = new Order({
        user: {
          name: req.user.name,
          id: req.user._id,
        },
        items: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    });
};

exports.getProductDetails = (req, res, next) => {
  const id = req.params.id;

  // This is an inbuilt function in mongoose which will automatically convert the string to object id behind the scenes and return the only object with this id back in object format.

  Product.findById(id)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: product.title,
        product: product,
        path: "user/products",
      });
    })
    .catch((err) => {
      console.log(err);
    })
};
