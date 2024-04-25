const multer = require("multer");

let userupload = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/users"); //path to which the image should be saved
  },
  filename: (req, file, cb) => {
    let ext = file.mimetype.split("/")[1]; //getting extension from mime type
    cb(null, `user_${Date.now()}.${ext}`); //filename for the image to be saved.
  },
});

var upload = multer({ storage: userupload });

module.exports = upload;
