const { adminModel, productModel } = require("../Model/admin.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
require("dotenv").config();
const nodemailer = require("nodemailer");
const SECRET = process.env.JWT_SECRET;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
console.log(EMAIL)
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
  const adminDetail = req.body;
  const email = adminDetail.email;
  const password = adminDetail.password;
  const fullname = adminDetail.firstname + " " + adminDetail.lastname;
  adminModel.findOne({ email: email }, (err, foundUser) => {
    if (err) {
      res.status(500).send({ message: `Internal server error`, status: false });
    } else {
      if (foundUser) {
        res.send({ message: `This user already exist`, status: false });
      } else {
        const form = new adminModel(adminDetail);
        form.save((err, data) => {
          if (err) {
            res.status(500).send({
              message: `Network error! registeration not complete, please try again`,
              status: false,
            });
          } else {
                var mailMessage = {
                  from: EMAIL,
                  to: email,
                  subject: "Registration successfull!",
                  html: `<b class='card-title'>Dear ${fullname},</b>
                                    <p >Welcome to Adeyosola varieties admin account!</p>
                                    <p >Congratulations! Your account has been successfully created by the Admin</p>
                                    <b>This is the private key and password for your account respectively: ${data.privateKey}, ${password}, <i style="color: red;">DO NOT SHARE THIS WITH ANYONE</i> Has it will be required to login other time</b>
                                    <p>Sign in through <a href='https://ecomfix.netlify.app/admin_login' style='text-decoration: none; color: #FF5722;'>LINK</a> to access your account dashboard
                                    Thank you!`,
                };
                transporter.sendMail(mailMessage, (err, result) => {
                  if (err) {
                    console.log(`Connection error`);
                    res.status(500).send({
                      message: "Unexpected error! check your connection"
                    })
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
};
const staffSignup = (req, res) => {
  const adminDetail = req.body;
  const email = adminDetail.email;
  const password = adminDetail.password;
  const fullname = adminDetail.firstname + " " + adminDetail.lastname;
  adminModel.findOne({ email: email }, (err, foundUser) => {
    if (err) {
      res.status(500).send({ message: `Internal server error`, status: false });
      console.log(`error dey`);
    } else {
      if (foundUser) {
        res.send({ message: `The email is already used!`, status: false });
      } else {
        const form = new adminModel(adminDetail);
        form.save((err, data) => {
          if (err) {
            res.send({
              message: `Network error user not yet registered`,
              status: false,
            });
          } else {
                var mailMessage = {
                  from: EMAIL,
                  to: email,
                  subject: "Registration successfull!",
                  html: `<b class='card-title'>Dear ${fullname},</b>
                  <p >Welcome to Adeyosola varieties admin account!</p>
                  <p >Congratulations! Your account has been successfully created by the Admin</p>
                                   
                                    <b>This is the private key for your account: ${data.privateKey} <i style="color: red;">DO NOT SHARE YOUR PRIVATE KEY WITH ANYONE</i> Has it will be required to login next time</b>
                                    <p>Sign in through <a href='https://ecomfix.netlify.app/staff_login' style='text-decoration: none; color: #FF5722;'>LINK</a> to access your account dashboard
                                    Thank you!`,
                };
                transporter.sendMail(mailMessage, (err, result) => {
                  if (err) {
                    res.status(500).send({
                      message: `Connection error, please check you connection`,
                      status: false
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
};
const signin = (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const privateKey = req.body.privateKey;
  adminModel.findOne({ email: email }, (err, thisUser) => {
    if (err) {
      res.send({
        messsage: `Network error! please check your connection`,
        status: false,
      });
    } else {
      if (!thisUser) {
        res.send({
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
  const privateKey = req.body.password;
  const email = req.body.email;
  adminModel.findOne({ email: email }, (err, thisUser) => {
    if (err) {
      res.send({
        messsage: `Network error! please check your connection`,
        status: false,
      });
    } else {
      if (!thisUser) {
        res.send({
          message: `No account of this details with us !!!`,
          status: false,
        });
      } else {
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
          else{
            res.send({
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
  const title = req.body.title;
  const rating = req.body.rate;
  const price = req.body.price;
  const productImage = req.body.convertedFile;
  const fullname = req.body.fullname;
  const email = req.body.email;
  cloudinary.v2.uploader.upload(productImage, (err, result) => {
    if (err) {
      res.send({ message: `Network problem, unable to upload` });
    } else {
      const image = result.secure_url;
      const productDetail = { image, title, rating, price };
      const form = new productModel(productDetail);
      form.save((err) => {
        if (err) {
          res.send({ message: `Internal server error`, status: false });
        } else {
          res.send({
            productDetail,
            message: `Product uploaded successfully`,
            status: true,
          });
        }
      });
    }
  });
};
const saveProfile = (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const username = req.body.username;
  const adminId = req.body.adminId;
  const contact = req.body.contact;
  const gender = req.body.gender;
  adminModel.findOneAndUpdate(
    { _id: adminId },
    {
      $set: {
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: username,
        contact: contact,
        gender: gender,
      },
    },
    (err, result) => {
      if (err) {
        res.send({ message: `Internal server error`, status: false });
      } else {
        res.send({ message: `Profile Edited successfully`, status: true });
      }
    }
  );
};
const profilePhoto = (req, res) => {
  const myFile = req.body.convertedFile;
  const adminId = req.body.adminId;
  cloudinary.v2.uploader.upload(myFile, (err, uploadedFile) => {
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
      if (err) {
        console.log(err);
        res.send({
          message: `Error occurred, please check your connection!`,
          status: false,
        });
      } else {
        res.send({ message: `Product Edited successfully`, status: true });
      }
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
};
