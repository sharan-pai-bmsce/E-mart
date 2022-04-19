const User = require("../model/user");
const bcrypt = require("bcryptjs");
// In built library in node js which will give us unique key values.
const crypto = require("crypto");
// Library that can be used to send mails and that enables our server to support mail server
const nodemailer = require("nodemailer");
const sendGrid = require("nodemailer-sendgrid-transport");

const FROM_EMAIL = "<FROM_EMAIL>";

// This is a setup made to tell the nodemailer how the mails will be delivered.
const transporter = nodemailer.createTransport(
  sendGrid({
    // This is a library that will connect us to a mail server on SendGrid.
    // Authorization
    auth: {
      api_name: "E-mart Project",
      // You can authorize using your user credentials or api key. Choice is yours.
      api_key:
        "<API-KEY>",
    },
  })
);

exports.getLogin = (req, res, next) => {
  // console.log(req.flash());
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Authentication",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.postLogin = (req, res, next) => {
  // HttpOnly will not allow front end users to manipulate cookies.

  // Max-Age will define the max age for it to survive (time is in sec). If not defined then it will exist till browser is open.

  // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; HttpOnly');

  // Remember that sessions is unique to every browser itself. Try logging in with chrome and open it up on microsoft edge you will see session is not saved in microsoft edge. Obviously since it does not have cookie belonging to chrome

  const email = req.body.email;
  const password = req.body.password;
  // While logging in we first need to check the email which is a unque parameter.
  User.findOne({
    email: email,
  })
    .then((user) => {
      // If user doesn't exist then we need to send an error message. And redirect to login.

      if (!user) {
        req.flash("error", "You have enterred the wrong email");
        console.log("Wrong email");
        return res.redirect("/login");
      }

      // In case we found a user then next step would be to compare passwords. Since we have encrypted the password (cannot decrypt it again), we need to you the bcrypt library function which will compare the hashed password and then return a true/false

      bcrypt.compare(password, user.password).then((result) => {
        // In case of false we the password is wrong so we are alerting them and redirecting it back to login.

        if (!result) {
          req.flash("error", "You have enterred the wrong Password");
          console.log("Wrong Password");
          return res.redirect("/login");
        }

        // In case password is correct then we have save value in session and carry out the successful login flow.

        req.session.logged = true;
        req.session.user = {
          _id: user._id,
          name: user.name,
          email: user.email,
        };
        // Since we are storing the data on a cloud mongodb server, saving the session may take some milliseconds. res.redirect() does not wait for this as we know javascript is asynchronous and does not wait. So in order to ensure that we redirect only when data is saved. We have a method in express-session called save(callback).
        // Precautionary step.
        req.session.save((err) => {
          // Now what happens is only after saving the session data redirect will be executed.
          console.log(err);
          res.redirect("/products");
        });
      });
    })
    .catch((err) => {
      console.log(err);
      next();
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

// We have created a sign up sequence for a user to register into our emart

// Gets the sign up page
exports.getSignUp = (req, res, next) => {
  res.render("auth/sign-up", {
    path: "/sign-up",
    pageTitle: "User Registration",
  });
};

// Once the sign up form is filled we need to validate it and also redirect them.
exports.postSignUp = (req, res, next) => {
  // Saving the form data.
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirm = req.body.confirmPassword;

  // We are checking if the user with this credentials already exists or not in our database if user exists then we have to alert them.

  User.findOne({ email: email }).then((userDoc) => {
    if (userDoc) {
      // The problem is if we return redirect here the nested thens will be executed and we will get an error so we will be chaining the next set of then blocks to the promise it is meant for.
      req.flash("error", "User already registered");
      return res.redirect("/login");
    }
    // else we need to create a user with the data we have got. You know how to check validation don't wait for him to do it. We must encrypt the password even inside the database. The following function will hash the password. The 2nd parameter will give us the amount of hashing needed. 10-14 is good range.
    return bcrypt
      .hash(password, 10)
      .then((result) => {
        const user = new User({
          name: name,
          email: email,
          password: result,
          cart: {
            items: [],
          },
        });
        // We are saving the user in the database
        return user.save();
        // Redirecting to login.
      })
      .then((result) => {
        req.flash("success", "User successfully registered");
        res.redirect("/login");
        // The following will invoke a library function which will communicate with the verified sender email id on the SendGrid server. Only the verified email must be used in from. Rest are self explanatory.

        // Though this returns a promise no function depends on this feature so we need not be bothered. Let this function take its own time.
        return transporter.sendMail({
          to: email,
          from: FROM_EMAIL,
          subject: "Sign up successfully",
          html:
            "<h1> You have been successfully registered in E-mart!! Thank you, " +
            name +
            " for signing up.</h1>",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// We want to implement a feature where the person will write the email id on our page and we will send email to him with a link to reset password page. We will be needing a token with expiry date so as to verify that the same user has reset password. We will be storing this token in database only till the expiry date.

exports.postReset = (req, res, next) => {
  // Node js has an in-built library called crypto which will allow us unique random values. This will create a string of length 32
  crypto.randomBytes(32, (err, buffer) => {
    // Cases of error
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    // crypto will create this string in hexadecimal we need to convert to string.
    const token = buffer.toString("hex");
    // We will be finding the account with the entered email id
    User.findOne({
      email: req.body.email,
    }).then((user) => {
      // If we dont find one then depict error message
      if (!user) {
        req.flash(
          "error",
          "No such user is registered. Kindly check the entered email id"
        );
        return res.redirect("/reset-password");
      }
      // else store the token in the database along with the expiry of token normally keep upto 10 min.
      user.token = token;
      user.expiry = Date.now() + 360000;
      // Save the changes created.
      return user.save().then((result) => {
        // After the changes are saved send an email to user. With the link to reset password and token for verification.
        req.flash(
          "success",
          "A mail has been sent with the link to reset password."
        );
        res.redirect("/login");
        return transporter.sendMail({
          to: user.email,
          from: FROM_EMAIL,
          subject: "Reset Password Token",
          html: `
            <h1> You requested for reset password </h1>
            <p>
            Your Token to reset password will last for 10 minutes.    <a href="http://localhost:3000/reset-password/${token}"> Click here </a> to set a new password.
            </p>
          `,
        });
      });
    });
  });
};

// CONTAINS LOGIC TO RENDER NEW PASSWORD PAGE.
exports.getResetId = (req, res, next) => {
  const token = req.params.token;
  // console.log(token);
  User.findOne({
    token: token, // We are verifying the token in database with token in url
    expiry: {
      $gt: Date.now(), // checking if it is expired or not.
    },
  }).then((user) => {
    if (!user) {
      req.flash("error", "Your token has expired. Please try again.");
      return res.redirect("/reset-password");
    }

    res.render("auth/password", {
      path: "/reset",
      pageTitle: "Reset Password",
      passwordToken: token,
      id: user._id.toString(),
      error: req.flash("error"),
      success: req.flash("success"),
    });
  });
};

exports.postNewPassword = (req, res, next) => {
  // We need the token and id for double verification of identity. In case someone accesses some random token by manually changing the url, he will be able to access and change password.
  const newPassword = req.body.newPassword;
  const userId = req.body.id;
  const passwordToken = req.body.token;

  User.findOne({
    _id: userId,
    token: passwordToken,
    expiry: { 
      $gt: Date.now() // This will see if expiry time is greater than current time. 
    },
  }).then(user => {
    return bcrypt
    // we need to hash the password for security reasons s explained in sign up section.
    .hash(newPassword, 10)
    .then((hashedPassword) => {
      // We will be setting the new password and token must be reset so that he doesn't use the same emails link twice.
      user.password = hashedPassword;
      user.token = null;
      user.expiry = undefined;
      return user.save();
    });
  }).then(result =>{
    req.flash('success','Password has been reset. Login with new password');
    res.redirect('/login');
  });
};
