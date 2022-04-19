// When we didn't use mongoose we were not much bothered about the structure of orders due to this we could integrate our logic within the user class. 

// With mongoose we will need a new template for orders collection. So that we use properties that mongoose gives us.
const mongoose = require('mongoose');
// Each order will have data of user who made it and contents of his cart at that time.
const orderTemplate = new mongoose.Schema({
    // Contents of the cart
    items: [{
        product: {
            type: Object,
            required: true,
        },
        quantity: {
            type: String,
            required: true,
        }
    }],
    // User data
    user:{
        id: {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User',
        },
        name:{
            type:String,
            required:true,
        }
    }
})

module.exports = mongoose.model('Orders',orderTemplate);