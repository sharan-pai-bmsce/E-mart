const mongoose = require('mongoose');

// I know mongoDb doesnt have a proper schema (structure) but normally when we play across with database we have some general structure of attributes. 

//Now, for mongoose to be used at its full potential, it must know how your collections look like (or atleast the structure). Thats the reason mongoose tells us to define a schema.

const productTemplate = new mongoose.Schema({
  // _id will be added automatically.
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageurl: {
    type: String,
    required: true,
  },
  // This can be used to create a relation with a user. Since every product will be related to a user. (New feature we are adding to our app)
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

// This will give a name to the collection and export the model.
module.exports = mongoose.model('Products',productTemplate);

