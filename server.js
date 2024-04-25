const express = require("express");
const mongoose = require("mongoose");
const mongoDBUrl =
  "mongodb+srv://admin:admin@cluster0.lejizsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();

const StudentRouter = require("./routes/StudentRoutes");

var cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ROUTES */
app.use("/student", StudentRouter);
app.use("/uploads", express.static(__dirname + "/uploads"));
mongoose
  .connect(mongoDBUrl, {
    dbName: "scopeindia",
  })
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is runnning on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
