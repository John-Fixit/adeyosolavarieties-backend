const { adminModel, productModel } = require("../Model/admin.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
require("dotenv").config();
const nodemailer = require("nodemailer");
const _ = require("lodash")
const HttpStatusCode = require("http-status-codes")
const SECRET = process.env.JWT_SECRET;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

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
const signup = (req, res) => {
  const {email, password} = req.body
  adminModel.findOne({ email: email }, (err, foundUser) => {
    if (err) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({ message: `Internal server error`, status: false });
    } else {
      if (foundUser) {
        res.status(HttpStatusCode.OK).send({ message: `This user already exist`, status: false });
      } else {
        
        const form = new adminModel(req.body);
        form.save((err, data) => {
          if (err) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
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
                res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                  message: "Unexpected error! please check your connection",
                  status: false,
                });
              } else {
                res.status(HttpStatusCode.OK).send({
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
};
const staffSignup = (req, res) => {
  const {email} = req.body
  adminModel.findOne({ email: email }, (err, foundUser) => {
    if (err) {
      res.status(500).send({ message: `Internal server error`, status: false });
    } else {
      if (foundUser) {
        res.send({ message: `The email is already used!`, status: false });
      } else {
        const form = new adminModel(req.body);
        form.save((err, data) => {
          if (err) {
            res.send({
              message: `Network error user not yet registered`,
              status: false,
            });
          } else {
            const {firstname, lastname, email, privateKey} = data
            var mailMessage = {
              from: EMAIL,
              to: email,
              subject: "Registration successfull!",
              html: `<b class='card-title'>Dear ${firstname + " " + lastname},</b>
                  <p >Welcome to Adeyosola varieties admin account!</p>
                  <p >Congratulations! Your account has been successfully created by the Admin</p>
                                   
                                    <b>This is the private key for your account: ${privateKey} <i style="color: red;">DO NOT SHARE YOUR PRIVATE KEY WITH ANYONE</i> Has it will be required to login next time</b>
                                    <p>Sign in through <a href='${process.env.CLIENT_URL}/staff_login' style='text-decoration: none; color: #FF5722;'>LINK</a> to access your account dashboard
                                    Thank you!`,
            };
            transporter.sendMail(mailMessage, (err, result) => {
              if (err) {
                res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                  message: `Connection error, please check you connection`,
                  status: false,
                });
              } else {
                res.status(HttpStatusCode.OK).send({
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
};
const signin = (req, res) => {
  const {password, email, privateKey} = req.body
  adminModel.findOne({ email }, (err, thisUser) => {
    if (err) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        messsage: `Network error! please check your connection`,
        status: false,
      });
    } else {
      if (!thisUser) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: `No account of this details with me !!!`,
          status: false,
        });
      } else {
        thisUser.validatePassword(password, (err, result) => {
          if (err) {
            res.status(500).send({
              message: `Internal server error, please check your connection`,
              status: false,
            });
          } else {
            if (result) {
              if (thisUser.privateKey == privateKey) {
                const admintoken = jwt.sign({ email }, SECRET, {
                  expiresIn: "2h",
                });
                res.send({
                  message: `user authenticated`,
                  status: true,
                  admintoken,
                });
              }
              if (thisUser.privateKey != privateKey) {
                res.send({
                  message: `Your private key entered is not correct!!!`,
                  status: false,
                });
              }
            } else {
              res.send({
                message: `The password entered is incorrect !!!`,
                status: false,
              });
            }
          }
        });
      }
    }
  });
};
const staffSignin = (req, res) => {

  const {privateKey, email} = req.body
  adminModel.findOne({ email: email }, (err, thisUser) => {
    if (err) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        messsage: `Network error! please check your connection`,
        status: false,
      });
    } else {
      if (!thisUser) {
        res.status(HttpStatusCode.OK).send({
          message: `No account of this details with us !!!`,
          status: false,
        });
      } else {
        if (thisUser.privateKey == privateKey) {
          const admintoken = jwt.sign({ email }, SECRET, {
            expiresIn: "2h",
          });
          res.status(HttpStatusCode.OK).send({
            message: `user authenticated`,
            status: true,
            admintoken,
          });
        } else {
          res.status(HttpStatusCode.OK).send({
            message: `The private key entered is incorrect !!!`,
            status: false,
          });
        }
      }
    }
  });
};
const authorizeUser = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, SECRET, (err, result) => {
    if (err) {
      res.send({ message: `user unathorized`, status: false });
    } else {
      adminModel.findOne({ email: result.email }, (err, thisadmin) => {
        if (err) {
          res.send({
            message: `Internal server error, please try again`,
            status: false,
          });
        } else {
          res.send({ message: `user authorized`, status: true, thisadmin });
        }
      });
    }
  });
};
const customer = (req, res) => {
  adminModel.find((err, admins) => {
    if (err) {
      res.send({ message: `Internal server error`, status: false });
    } else {
      productModel.find((err, products) => {
        if (err) {
          res.send({ message: `Internal server error`, status: false });
        } else {
          res.send({ admins, products, status: true });
        }
      });
    }
  });
};

const deleteStaff = (req, res) => {
  const staffId = req.body.staffId;
  adminModel.findOneAndDelete({ _id: staffId }, (err, otherStaff) => {
    if (err) {
      res.send({
        message: `Internal server error, customer could'nt deleted`,
        status: false,
      });
    } else {
      res.send({ message: `User has been deleted successfully`, status: true });
    }
  });
};

const products = (req, res) => {
  const {title, rating, price, convertedFile} = req.body
  cloudinary.v2.uploader.upload(convertedFile, (err, result) => {
    if (err) {
      res.send({ message: `Network problem, unable to upload` });
    } else {
      const image = result.secure_url;
      const productDetail = { image, title, rating, price };
      const form = new productModel(productDetail);
      form.save((err) => {
         err?
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({ message: `Internal server error`, status: false }):
          res.status(HttpStatusCode.OK).send({
            productDetail,
            message: `Product uploaded successfully`,
            status: true,
          });
      });
    }
  });
};
const saveProfile = (req, res) => {
  const {firstname, lastname, email, username, adminId, contact, gender} = req.body
  adminModel.findOneAndUpdate(
    { _id: adminId },
    {
      $set: {
        firstname,
        lastname,
        email,
        username,
        contact,
        gender,
      },
    },
    (err, result) => {
      if (err) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({ message: `Internal server error`, status: false });
      } else {
        res.status(HttpStatusCode.OK).send({ message: `Profile Edited successfully`, status: true });
      }
    }
  );
};
const profilePhoto = (req, res) => {
  const {convertedFile, adminId} = req.body
  cloudinary.v2.uploader.upload(convertedFile, (err, uploadedFile) => {
    if (err) {
      res.send({
        message: `Internal server error, image could'nt uploaded!`,
        status: false,
      });
    } else {
      const profilePhoto = uploadedFile.secure_url;
      adminModel.findOneAndUpdate(
        { _id: adminId },
        { profilePhoto: profilePhoto },
        (err, result) => {
          if (err) {
            res.send({ message: `Internal server error`, status: false });
          } else {
            res.send({
              message: `Profile photo uploaded successfully`,
              status: true,
            });
          }
        }
      );
    }
  });
};
const deleteProduct = (req, res) => {
  const productId = req.body.productId;
  productModel.findOneAndDelete({ _id: productId }, (err, result) => {
    if (err) {
      res.send({
        message: `Network error! unable to delete Product`,
        status: false,
      });
    } else {
      res.send({ message: `Product deleted successfully`, status: true });
    }
  });
};
const editProduct = (req, res) => {
  const Id = req.body.editId;
  productModel.findOneAndUpdate(
    { _id: Id },
    {
      $set: {
        title: req.body.editTitle,
        price: req.body.editPrice,
        rating: req.body.editRate,
      },
    },
    (err, result) => {
      err?
        res.send({
          message: `Error occurred, please check your connection!`,
          status: false,
        }):
        res.send({ message: `Product Edited successfully`, status: true });
    }
  );
};
const deleteAccount = (req, res) => {
  const adminId = req.body.adminId;
  adminModel.deleteOne({ _id: adminId }, (err, result) => {
    if (err) {
      res.send({ message: `Network error, user not deleted`, status: false });
    } else {
      res.send({ message: `Account deleted successfully`, status: true });
    }
  });
};

const adminProfile = (req, res) => {
  const id = req.query.qry;
  adminModel.findOne({ _id: id }, function (err, result) {
    if (err) {
      res.status(500).send({ message: "Internal Server Error", status: false });
    } else {
      res.status(200).send({ result, status: true });
    }
  });
};

const forgotPsw = (req, res) => {
  const { email } = req.body;
  adminModel.findOne({ email }, (err, data) => {
    if (err) {
      res.status(500).send({ message: "Internal server error", status: false });
    } else {
      if (data) {
        let resetLinkToken = jwt.sign(
          { _id: data._id },
          process.env.RESET_CODE_KEY,
          { expiresIn: "20m" }
        );
        let mailMessage = {
          from: EMAIL,
          to: email,
          subject: "Account Password Reset Link",
          html: `<h2>Please click on the given link to reset your password</h2>
          <p>${process.env.CLIENT_URL}/reset_password/${resetLinkToken}</p>
          `,
        };

        data.updateOne({ resetPswLink: resetLinkToken }, (err, updatedData) => {
          if (err) {
            res
              .status(500)
              .send({ message: "Reset password link error", status: false });
          } else {
            transporter.sendMail(mailMessage, (err, msgRes) => {
              if (err) {
                res
                  .status(500)
                  .send({
                    message:
                      "Unexpected error! please check your connection and try again",
                    status: false,
                  });
              } else {
                res
                  .status(200)
                  .send({
                    message:
                      "Verification link to reset your password has been sent to the email entered, Kindly follow the instructions, the link will expire in the next 20 minutes",
                    status: true,
                  });
              }
            });
          }
        });
      } else {
        res
          .status(200)
          .send({
            message: "The email entered is not found or not correct",
            status: false,
          });
      }
    }
  });
};

const resetPsw =(req, res)=>{
  const {resetLink, password} = req.query
  if(resetLink){
    jwt.verify(resetLink, process.env.RESET_CODE_KEY, (err, decodedResult)=>{
        if(err){
          res.status(200).send({message: "Incorrect or expired verification link", status: false})
        }
        else{
          adminModel.findOne({resetLink}, (err, data)=>{
              if(err) res.status(500).send({message: "Unexpected error!m please check your connection", status: false})
              else{
                  const crdObj = {password: password, resetPswLink: ""}
                  const user = _.extend(data,  crdObj)
                  user.save((err)=>{
                      if(err)res.status(400).json({message: `Internal server error, please check your connection`, status: false})
                      else res.status(200).json({message: `Your password has been updated successfully, proceed to login with your new password ${process.env.CLIENT_URL}/admin_login`, status: true})
                  })
              }
          })

        }
    })
  }
  else{
    res.status(200).json({message: "No reset link not found! Please click on the link sent to your email", status: false})
  }
}

const forgotPryKey=(req, res)=>{
    const {email} = req.query
    adminModel.findOne({email}, (err, data)=>{
        if(err){
          res.status(500).json({message: "Internal server error, please try again", status: false})
        }
        else{
          let mailMessage = {
            from : "Adeyosola",
            to: email,
            subject: "Private Key Recovery",
            html: ` <b>This is your private key for your account: ${data.privateKey} <i style="color: red;">DO NOT SHARE YOUR PRIVATE KEY WITH ANYONE!!!</i></b>`
          }
          data?
            transporter.sendMail(mailMessage, (err, msgRes)=>{
                if(err){
                    res.status(500).json({message: "Unexpected error, please check your connection and try again", status: false})
                }
                else{
                  res.status(200).json({message: "Your private key had been sent to yoru email! check it and sign-in!", status: true})
                }
            })
          :
            res.status(200).json({message: "The email address provided does not exist on our list", status: false})
        }
    })
}
module.exports = {
  signup,
  signin,
  authorizeUser,
  customer,
  products,
  deleteStaff,
  saveProfile,
  profilePhoto,
  deleteProduct,
  deleteAccount,
  staffSignin,
  staffSignup,
  editProduct,
  adminProfile,
  forgotPsw,
  resetPsw,
  forgotPryKey
};
