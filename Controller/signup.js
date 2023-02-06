const { adminModel} = require("../Model/admin.model");
require("dotenv").config();
const nodemailer = require("nodemailer");
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
var transporter = nodemailer.createTransport({
    service: "smtp@gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

module.exports.signup =(req, res)=> {
    const {email, password} = req.body
    adminModel.findOne({ email: email }, (err, foundUser) => {
      if (err) {
        res.status(500).send({ message: `Internal server error`, status: false });
      } else {
        if (foundUser) {
          res.send({ message: `This user already exist`, status: false });
        } else {
          
          const form = new adminModel(req.body);
          form.save((err, data) => {
            if (err) {
              res.status(500).send({
                message: `Network error! registeration not complete, please try again`,
                status: false,
              });
            } else {
              const {firstname, lastname, email, privateKey} = data
              var mailMessage = {
                from: "noreply",
                to: email,
                subject: "Registration successfull!",
                html: `<b class='card-title'>Dear ${firstname + " " + lastname},</b>
                                      <p >Welcome to Adeyosola varieties admin account!</p>
                                      <p >Congratulations! Your account has been successfully created by the Admin</p>
                                      <b>This is the private key and password for your account respectively: ${privateKey}, ${password}, <i style="color: red;">DO NOT SHARE THIS WITH ANYONE( You can change your password anytime!)</i> Has it will be required to login other time</b>
                                      <p>Sign in through <a href='${process.env.CLIENT_URL}/admin_login' style='text-decoration: none; color: #FF5722;'>LINK</a> to access your account dashboard
                                      Thank you!`,
              };
              transporter.sendMail(mailMessage, (err, result) => {
                if (err) {
                  res.status(500).send({
                    message: "Unexpected error! please check your connection",
                    status: false,
                  });
                } else {
                  res.status(200).send({
                    message: `Registration successfull, Please login to the Gmail account ${email} for your private admin key.`,
                    status: true,
                  });
                }
              });
            }
          });
        }
      }
    });
} 