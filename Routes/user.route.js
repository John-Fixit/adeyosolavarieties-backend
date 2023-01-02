const express = require('express');
const userRouter = express.Router();
const userController = require('../Controller/user.controller')
userRouter.get('/', userController.getLandingPage)
userRouter.get('/products', userController.product)
userRouter.post('/contact', userController.contactMessage)
module.exports = userRouter