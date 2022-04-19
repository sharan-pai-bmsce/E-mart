// Where ever i have commented out the code it means that i had used mongodb without mongoose but not i have implented mongoose (the feeling of using mongoose is heavenly)

const Product = require("../model/product");
const User = require("../model/user");

exports.postProduct = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const imageurl = req.body.imageurl;
  const price = req.body.price;
  const userId = req.session.user;

  const product = new Product({
    title: title,
    description: description,
    imageurl: imageurl,
    price: price,
    userId: userId,
  });

  product
    // This save() is an inbuilt function in mongoose.
    .save()
    .then((result) => {
      // console.log();
      res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getProduct = (req, res, next) => {
    res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
    });

};

// This will get the editting page with all fields filled

exports.getEditProduct = (req, res, next) => {

  let editMode = false;
  if (req.query.edit != null) editMode = JSON.parse(req.query.edit);

  // If we are accessing page by messing with url, edit mode will be set to false hence we someone is trying to access this page without a product hence we are stopping him

  if (!editMode) {
    return res.redirect("/products");
  }

  const id = req.params.id;
  Product.findById(id)
    // Product.fetchById(id)
    .then((product) => {

      // If we do not find any product by that id that means its not there so we have to redirect him back.

      if (!product) {
        return res.redirect("/products");
      }
      res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          editing: editMode,
          prod: product,
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Upon submitting the product what has to be done.

exports.postEditProduct = (req, res, next) => {
  // Basically I am creating a new product
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const imageurl = req.body.imageurl;
  const price = req.body.price;
  // const userId = req.user._id;

  // This will show you the power of mongoose

  Product.findById(id)
    .then((product) => {
      // console.log(product.userId+" "+req.user._id);
      // The product which we get here is not JS object but a Mongoose object so it has in built features like save() which will update the product in case it already exists in the collections
      
      // Only the user who added this product has the rights to delete products else I am redirecting them to  product page.
      if(product.userId.toString()!==req.user._id.toString()){
        return res.redirect('/products');
      }
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageurl = imageurl;
      return product
      .save()
      .then((result) => {
        console.log("updated product");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// This is to delete a product from the store.
exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;

  // This is inbuilt mongodb function which will search the product using its id (converted to object by mongoose) and delete it from the collection.

  Product.findOneAndDelete({
    _id:id,
    userId:req.user._id,// Only the user who created the product must have the rights to delete it. We have implemented that here.
  })
    .then((product) => {
      if(!product){
        return res.redirect("/products");
      }
      console.log("deleted Successfully");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductList = (req, res, next) => {
  Product

    // This is an inbuilt function of mongodb which will return the array / pagination directly depending on the data size.
  
    .find({
      userId:req.user._id
    })
    .then((products) => {
      // console.log(req.user._id);
      // console.log(products[1].userId);
      res.render("admin/products", {
          prod: products,
          pageTitle: "Admin Product List",
          path: "/admin/products",
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
