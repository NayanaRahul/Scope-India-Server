const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./vars/.env" });

const verifyuser = (req, res, next) => {
  let token = req.body.token;
  if (!token) {
    return res.status(403).send({ auth: false, message: "No token required" });
  } else {
    try {
      let decodedtoken = jwt.verify(token, process.env.JWT_KEY);
      req.user = decodedtoken;
      next();
    } catch (error) {
      res.status(403).json({
        auth: false,
        message: "Some error",
        error: error,
      });
    }
  }
};

module.exports = verifyuser;
