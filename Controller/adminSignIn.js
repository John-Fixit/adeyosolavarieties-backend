const { adminModel } = require("../Model/admin.model");

module.exports.signin=(req, res)=>{
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
}