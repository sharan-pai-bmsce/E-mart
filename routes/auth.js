const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login',authController.getLogin);
router.post('/login',authController.postLogin);

router.post('/logout',authController.postLogout);

router.get('/sign-up',authController.getSignUp);
router.post('/sign-up',authController.postSignUp);

// This is to get the reset-password email page. In order to get the email id.
router.get('/reset-password',authController.getReset);

// Once the email id has been sent it will be caught here.
router.post('/reset-password',authController.postReset);

// After the email. A confidential link with a token will be sent to the email. That will direct to this page.
router.get('/reset-password/:token',authController.getResetId);
// Once he enters the new password it must be handled here.
router.post('/new-password',authController.postNewPassword);
module.exports = router;