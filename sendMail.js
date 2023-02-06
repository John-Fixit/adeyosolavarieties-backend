const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "smtp@gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
})
export const sendMailFunc = async({mailMessage})=>{
    let res = await transporter.sendMail(mailMessage)
    let data = await res
    return data
}