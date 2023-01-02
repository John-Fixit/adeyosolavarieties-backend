require('dotenv').config()
const nodemailer = require('nodemailer')
const cloudinary = require('cloudinary')
const { productModel } = require("../Model/admin.model")
const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD
const CLOUD_NAME = process.env.CLOUD_NAME
const API_KEY = process.env.API_KEY
const API_SECRET = process.env.API_SECRET
const getLandingPage = (req, res) => {
    res.send(`Welcome to e-commerce site`)
}
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});
var transporter = nodemailer.createTransport({
    service: 'smtp@gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: EMAIL,
        pass: PASSWORD
    }
});

const product = (req, res) => {
    productModel.find((err, result) => {
        if (err) {
            res.send({ message: `Internal server error`, status: false })
        } else {
            res.send({ result, status: true })
        }
    })
}

const contactMessage = (req, res) => {
    console.log(req.body);
    const mailToSend = {
        from: req.body.senderEmail,
        to: EMAIL,
        subject: `${req.body.senderName} : ${req.body.senderTitle}`,
        text: `${req.body.senderMessage}`
    }
    transporter.sendMail(mailToSend, (err, info) => {
        if (err) {
            console.log(err);
            res.send({ message: `Network error please check your connection, your message will be send automatically`, status: false })
        } else {
            res.send({ message: `Message sent successfully`, status: true })
        }
    })
}
module.exports = { getLandingPage, product, contactMessage }