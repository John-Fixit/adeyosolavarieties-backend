const cloudinary = require("cloudinary");
require("dotenv").config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });
module.exports.products = (req, res)=>{
    const {title, rating, price} = req.body
    const productImage = req.body.convertedFile;
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
}