"use strict";

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout)
//router.post('/checkToken', AuthController.checkToken)


module.exports = router;

