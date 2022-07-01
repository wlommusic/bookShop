const express = require('express');

const { getLogin, getSignup, postLogin, postSignup, postLogout, getReset, postReset, getNewPassword, postNewPassword } = require('../controllers/auth');


const router = express.Router();

router.get('/login', getLogin);

router.get('/signup', getSignup);

router.post('/login', postLogin);

router.post('/signup', postSignup);

router.post('/logout', postLogout);

router.get('/reset', getReset);

router.post('/reset', postReset);

router.get('/reset/:token', getNewPassword);

router.post('/new-password',postNewPassword)

module.exports = router;