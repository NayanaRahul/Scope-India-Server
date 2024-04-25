const router = require("express").Router();
const Usermodel = require("../model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyuser = require("../middlewares/UserToken");
require("dotenv").config();
const upload = require("../middlewares/UserUpload");
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

/* FORGOT PASSWORD */
router.post("/forgotpassword", (req, res) => {
  if (req.body.email_address) {
    console.log("update password");
    Usermodel.findOne({ email_address: req.body.email_address })
      .then((result) => {
        if (result) {
          /* if user found set the user to new user , send temp password via email */
          var tempPassword = createTempPassword(result.firstname);
          Usermodel.findByIdAndUpdate(result._id, {
            $set: {
              password: tempPassword,
              isNewStudent: true,
              isTempPasswordSet: true,
            },
          }).then((result) => {
            /* send email with the temp password */
            var mailOptions = {
              from: process.env.EMAIL_ID,
              to: result.email_address,
              subject: "Temporary password",
              html: `Your temporary password : ${tempPassword}`,
            };
            transporter.sendMail(mailOptions, (err, data) => {
              if (err) throw err;
              res.status(200).json({
                message:
                  "Please check your mail for a temporary password to login",
              });
            });
            res.status(200).json({
              message:
                "Please check your mail for a temporary password to login",
            });
          });
        } else {
          console.log("User not found");
          res.status(201).json({
            message: "Email not registered",
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: "Something went wrong",
          error: err,
        });
      });
  }
});

/* UPDATE PASSWORD */
router.post("/updatepassword", async (req, res) => {
  console.log("Update password");

  if (req.body.password) {
    console.log(req.body.user_id);
    let newpassword = await bcrypt.hash(req.body.password, 10);
    Usermodel.findByIdAndUpdate(req.body.user_id, {
      $set: { password: newpassword, isNewStudent: false },
    })
      .then((result) => {
        console.log(result);
        if (result) {
          res.status(200).json({
            message:
              "Password changed successfully, Please login again with your new password.",
          });
        } else {
          res.status(201).json({
            message: "Something went wrong!",
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: "Something went wrong",
          error: err,
        });
      });
  }
});

/* CHECK PASSOWRD MATCH */
router.post("/login", (req, res) => {
  let userPassword = "";
  console.log("check password");
  if (req.body.password) {
    Usermodel.findOne({ email_address: req.body.email_address })
      .then(async (result) => {
        /* user found */
        if (result) {
          if (result.isNewStudent)
            userPassword = req.body.password == result.password ? true : false;
          else
            userPassword = await bcrypt.compare(
              req.body.password,
              result.password
            );
          console.log("Password match : " + userPassword);
          if (userPassword) {
            if (result.isNewStudent) {
              console.log(result._id);
              res.status(200).json({
                message: "Password match",
                user_id: result._id,
              });
            } else {
              /* create token if temp password is changed */
              let token = "";
              token = jwt.sign(
                { _id: result._id, email_address: result.email_address },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
              );
              res.status(200).json({
                message: "Password match",
                token: token,
              });
            }
          } else {
            console.log("Passwords do not match");
            res.status(201).json({
              message: "Incorrect Password !",
            });
          }
        } else {
          console.log("User not found");
          res.status(201).json({
            message: "Email not registered",
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: "Something went wrong",
          error: err,
        });
      });
  }
});

/* CHECK IF NEW USER */
router.post("/checkmail", (req, res) => {
  console.log("checkmail");
  if (req.body.email_address) {
    Usermodel.findOne({ email_address: req.body.email_address }).then(
      (result) => {
        if (result) {
          /* if logging in for the first time */
          if (result.isNewStudent && !result.isTempPasswordSet) {
            /* create temp password */
            var tempPassword = createTempPassword(
              result.firstname,
              result.phone_number
            );
          } else {
            res.status(200).json({
              message: "",
              isNewStudent: result.isNewStudent,
            });
          }
          /* insert temp password to DB */
          if (tempPassword && !result.isTempPasswordSet) {
            Usermodel.findByIdAndUpdate(result._id, {
              $set: { password: tempPassword },
            })
              .then((result) => {
                /* send email with the temp password */
                var mailOptions = {
                  from: process.env.EMAIL_ID,
                  to: result.email_address,
                  subject: "Temporary password",
                  html: `Your temporary password : ${tempPassword}`,
                };
                transporter.sendMail(mailOptions, (err, data) => {
                  if (err) throw err;
                  res.status(200).json({
                    message:
                      "Please check your mail for a temporary password to login",
                    isNewStudent: result.isNewStudent,
                  });
                });
              })
              .catch((err) => {
                res.status(500).json({
                  message: "Something went wrong",
                  error: err,
                });
              });
          }
        } else {
          console.log("Email not registered");
          res.status(201).json({
            message: "Email not registered",
          });
        }
      }
    );
  }
});
/* STUDENT REGISTRATION */
router.post("/register", upload.single("user_profile_picture"), (req, res) => {
  console.log("/register");
  let studentDetails = {};
  if (req.file) {
    studentDetails.useravatar = req.file.path;
  }
  if (req.body.email_address) {
    studentDetails.email_address = req.body.email_address;
  }
  if (req.body.firstname) {
    studentDetails.firstname = req.body.firstname;
  }
  if (req.body.lastname) {
    studentDetails.lastname = req.body.lastname;
  }
  if (req.body.gender) {
    studentDetails.gender = req.body.gender;
  }
  if (req.body.phone_number) {
    studentDetails.phone_number = req.body.phone_number;
  }
  if (req.body.country) {
    studentDetails.country = req.body.country;
  }
  if (req.body.state) {
    studentDetails.state = req.body.state;
  }
  if (req.body.city) {
    studentDetails.city = req.body.city;
  }
  if (req.body.hobbies) {
    studentDetails.hobbies = req.body.hobbies;
  }
  studentDetails.isNewStudent = true;
  if (Object.keys(studentDetails).length > 0) {
    Usermodel.findOne({ email_address: studentDetails.email_address }).then(
      (result) => {
        if (result) {
          res.status(201).json({
            message: "User already exists, Please enter a different email id.",
          });
        } else {
          console.log(studentDetails);
          Usermodel.create(studentDetails)
            .then((result) => {
              var mailOptions = {
                from: process.env.EMAIL_ID,
                to: result.email_address,
                subject: "Welcome " + result.firstname + " " + result.lastname,
                html: `<h1>Hello ${result.firstname},</h1><br/>
                <h3>Welcome to Scope India!</h3><br/><br/>
                <h3>Thank you for registering with us.</h3>`,
              };
              transporter.sendMail(mailOptions, (err, data) => {
                if (err) throw err;
                res.status(200).json({ message: "Mail sent successfully" });
              });
              res.status(200).json({
                message: "Registration successful !",
              });
            })
            .catch((err) => {
              res
                .status(500)
                .json({ messsage: "Something went wrong", error: err });
            });
        }
      }
    );
  }
});

function createTempPassword(firstname, ph_number = "") {
  /* return firstname + ph_number.slice(-4); */
  return firstname + Math.round(Math.random() * 10000);
}
module.exports = router;
