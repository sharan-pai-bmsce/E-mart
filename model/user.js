const mongoose = require("mongoose");
const { user } = require("../routes/user");

// This will create a mongoose schema for user. With the constraints defined in in them. Explanation of this has been given in Products model.

const userTemplate = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  token: String,
  expiry: Date,
  password:{
    type: String,
    required: true,
  },
  // This is an example of nesting of collections. A cart here will contain the product details that the user has added to cart.
  cart: {
    items: [
      {
        id: { 
          type: mongoose.Schema.Types.ObjectId, required: true,
          // This will refer to product model and all the referencing will be done by mongoose. We need not be bothered about it. See while displaying the cart we need details of the product and this will create that relation.
          ref:'Products'
        },
        quantity: { 
          type: Number, 
          required: true 
        },
      },
    ],
  },
});

// As we know => does not support "this" (refers to object it is added in i.e userTemplate) keyword so we have to write the function with "function" keyword. Remember we are adding this function to the userTemplate object, object & class doesn't support arrow functions.

userTemplate.methods.addToCart = function(product){

  const cartProdIndex = this.cart.items.findIndex((curr) => {
    // We are not sure which form both of them might be in so its better to convert it to string. Incase it doesn't find any product returns -1

    return curr.id.toString() === product._id.toString();
  });

  // Basically this will reinterpret (copy) all of items array.

  const updatedItems = [...this.cart.items];
  // Cart will have a total property which keeps the total value into account. Initally 0
  // Incase product is found we will be updating the quantity of the product.

  if (cartProdIndex >= 0) {
    // This will update the quantity in case the product is present in the items array
    updatedItems[cartProdIndex].quantity =
      updatedItems[cartProdIndex].quantity + 1;
    
      // Updating the product later when we add the product
  } else {
    // Incase we add new product the quantity is updated.
    
    updatedItems.push({
      id: product._id,
      quantity: 1,
    });
  }

  // This following code will add the cart object to a user. Items are updated.

  const updatedCart = { items: updatedItems };
  this.cart = updatedCart;
  return this.save();
}

userTemplate.methods.deleteById= function(id){
  const updatedCartItems = this.cart.items.filter((item)=>{
    // console.log(typeof item.id+" "+typeof id);
    return item.id.toString()!==id.toString();
  });
  // console.log(updatedCartItems);
  this.cart.items = updatedCartItems;
  return this.save();
}

userTemplate.methods.clearCart = function(){
  this.cart = {
    items:[]
  };
  return this.save();
}


module.exports = mongoose.model('User',userTemplate);


