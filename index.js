const path = require("path");

// BASIC EXPRESS REQUIREMENTS
const express = require("express");
const bodyParser = require("body-parser");
// FOR MONGOOSE
const mongoose = require("mongoose");

// FOR SECURITY AGAINST CSRF
const csrf = require("csurf");

const csrfProtect = csrf();

// FOR SESSION (Refer notes.js for understanding sessions and why we store it in database)
const session = require("express-session");

// This is exporting a function (constructor) to which we are sending session argument. Rest of the connections will be automatically take care.
const SessionStore = require("connect-mongodb-session")(session);

// This will help us pass error messages by storing its details in session. Error will be rendered only if it exists.
const flash = require('connect-flash');



const app = express();

// Since we are using this URI at different places storing it as a constant. GOOD PRACTICE
const MONGODB_URI =
  "<MONGODB-API-KEY>";

// We need to create an instance of the Store to use it.

const store = new SessionStore({
  uri: MONGODB_URI, // Giving a link to our database where we have to store the session info
  collection: "sessions", // Creating a unique collection for storing session value.
});

// USER DEFINED REQUIREMENTS

const User = require("./model/user");

// POINTS TO user.js IN IN ROUTES
const admin = require("./routes/admin");

// POINTS TO user.js IN IN ROUTES
const users = require("./routes/user");

// POINTS TO auth.js IN IN ROUTES FOR LOGIN
const auth = require("./routes/auth");

// POINTS TO THE 404.js IN CONTROLLER (C PART OF MVC)
const get404 = require("./controllers/404");

app.use(bodyParser.urlencoded({ extended: false }));

// CONFIGURING THE STRUCTURE OF SESSION SO THAT express-session CAN CREATE IT.

// This middleware will add "session" object to request which we use in authentication.
app.use(
  session({
    secret: "What is god", // Signing the Hash value which secretly stores our session id in cookie. It will be encoded in a hash value. Keep it long. More the security.

    resave: false, // Session will not be saved for every request. If this is set to false.But will save if there is change in session.
    saveUninitialized: false, // Basically won't allow session to be saved for every request.
    store: store, // Points to the store.
    cookie:{
      
    }
  })
);

// This will use the session so it must be initialized after the session structure is defined. This will assign a token to every form which makes a post request for restricting any changes being created.
app.use(csrfProtect);

// We are introducing this middleware before the other routes because we will be using it there. It will allow us to pass data temporarily to different web pages.
app.use(flash())
app.set("view engine", "ejs");

// DIRECTORY CONTAINING VIEWS PART OF MVC
app.set("views", "views");

// THIS POINTS TO DIRECTORY CONTAINING THE STATIC CSS/JS. SO THAT THE TEMPLATE JUST HAS TO CONSIDER THE DIRECTORY POINTED BY THIS AS ROOT DIRECTORY.
app.use(express.static(path.join(__dirname, "public")));

// When we try to get the data about the user from session the mongodb-store will not know about our models so it will just return the data. This results in failure of all the functions that have been used for mongoose since for mongoose to work we need the mongoose model which we have created.

// In order to solve this problem we can actually create a new middleware. This will get the user id from session and we are accessing the User collection and getting the mongoose object itself.
app.use((req, res, next) => {
  // console.log(req.session);
  if (req.session.user) {
    User.findById(req.session.user._id)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    next();
  }
});

// We are using express function which will pass certain elements in every render function.

app.use((req, res, next) => {
  // This will add the following data to all responses since it is common to a lot of pages. But it will be used by only specific pages.
  res.locals.logged = req.session.logged;
  res.locals.token = req.csrfToken();
  next();
});

// NO LOGIC IS PRESENT HERE ALL ARE EITHER IN CONTROLLERS OR ROUTES.
app.use(auth);
app.use(users.user);

// IMPLICITLY /admin is added for all admin related pages.
app.use("/admin", admin.admin);

app.use("/", get404.error);

// If we use mongoose we need not implement database connection manually. Mongoose will take care of it at the back we 8ijust need to pass the atlas url and start our server as soon as it responds.

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });

/**
 * Dummy data 1
Game of Thrones

https://m.media-amazon.com/images/I/51OMI4Jez3L._SX260_.jpg

She had been an angel for coming up on 10 years and in all that time nobody had told her this was possible. The fact that it could ever happen never even entered her mind. Yet there she stood, with the undeniable evidence sitting on the ground before her. Angels could lose their wings.
 
130.50

  * Dummy Data 2
Meluha

https://images-na.ssl-images-amazon.com/images/I/61fMgBkM3jS.jpg

She tried to explain that love wasn't like pie. There wasn't a set number of slices to be given out. There wasn't less to be given to one person if you wanted to give more to another. That after a set amount was given out it would all disappear. She tried to explain this, but it fell on deaf ears.

140.50

 *dummy data 3

The accidental prime minister

https://m.media-amazon.com/images/I/615Tm7J9bVL.jpg

It was a concerning development that he couldn't get out of his mind. He'd had many friends throughout his early years and had fond memories of playing with them, but he couldn't understand how it had all stopped. There was some point as he grew up that he played with each of his friends for the very last time, and he had no idea that it would be the last.

100.50
 * */
