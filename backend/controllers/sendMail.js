"use strict";
const usersModel = require("../models").users;
var request = require('request');
const nodemailer = require("nodemailer");

module.exports = {
  sendOtp(req, res) {

  const email = req.body.requestObject.email;
  const otp = req.body.requestObject.otp;
  
  console.log("+++++++++++++++++++++++++++++++++",email);
  const transporter = nodemailer.createTransport({
    // lakhimi
    // host: "vps.adrp.in",
    // port: 587,
    // secure: false,
    // auth: {
    // user: 'support@eoffice.lakhimisr.in',
    // pass: '&x*YS7HFY

    //test
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
    user: 'arnabjyoti.skaplink@gmail.com',
    pass: 'puxcdoabsfhnmnno'
  }
});



var mailOptions = {
  from: '"OTP Verification"', // sender address
    to: email, // list of receivers
    subject: "One Time Password Verification", // Subject line
    text: "OTP Verification", // plain text body
    html: 'Your One Time Password Verification Code is: <b>'+otp+'</b>', // html body
}

transporter.sendMail(mailOptions, function(err, info) {
  if (err) {
      console.log('Mail not sent')
      return res.status(200).send({ message: "fail" });
  } else {
      console.log('Mail sent')
      return res.status(200).send({ message : "success" });
  }
});

}
}