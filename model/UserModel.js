const mongoose = require("mongoose");
//const HobbySchema = new mongoose.Schema({ hobby: String });
let UserSchema = mongoose.Schema({
  isNewStudent: { type: Boolean, required: true },
  isTempPasswordSet: { type: Boolean, required: true },
  email_address: { type: String, required: true },
  password: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  gender: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  phone_number: { type: String },
  hobbies: [{ type: String }],
  useravatar: { type: String },
  otp: { type: String },
  date_created: {
    type: Date,
    default: Date.now(),
  },
});
module.exports = mongoose.model("tbl_students", UserSchema);
