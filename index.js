const cors = require("cors");
const exp = require("express");
const upload = require('express-fileupload')
const passport = require("passport");
const morgan = require("morgan");
const { connect } = require("mongoose");
const { success, error } = require("consola");
const path = require('path');
// const axios = require('axios');
const multer = require('multer');
const superagent = require('superagent');
require('dotenv').config();

// const apiUrl = 'https://api.opencagedata.com/geocode/v1/json?q=Kolkata&key=66f574589d3940dc8b1fd4184a05918f';
const { MONGO_HOST, MONGO_DB_NAME, REQUEST_TIMEOUT, NODE_PORT, MONGO_URL } = require("./config");
const { log } = require("console");
const PORT = NODE_PORT || 5000;

const app = exp();
app.use(morgan("dev"));

app.use(cors());
app.use(exp.json());
app.use(
  exp.urlencoded({
    extended: true,
  })
);
// app.use(upload()); //file upload
app.use('/Upload', exp.static(path.join(__dirname, 'Upload')));

// app.use(passport.initialize());
// require("./middlewares/passport")(passport);

app.get("/", (req, res) => {
  res.send("Server running");
});
// User Router Middleware
app.use("/api", require("./routes"));

const startApp = async () => {
  try {
    // Connection With DB
    // await connect(MONGO_URL, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   serverSelectionTimeoutMS: REQUEST_TIMEOUT,
    //   autoIndex: true,
    //   dbName: MONGO_DB_NAME,
    //   user: process.env.MONGO_USER,
    //   pass: process.env.MONGO_PASSWORD,
    //   autoCreate: true,
    // })

    await connect("mongodb+srv://JoydeepShaw:2106%40Joy@app-backend.wwzbjkg.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: REQUEST_TIMEOUT,
      autoIndex: true,
      autoCreate: true,
      dbName: MONGO_DB_NAME,
    })

    success({
      message: `Successfully connected with the Database \n${MONGO_DB_NAME}`,
      badge: true,
    });

    // Start Listening for the server on PORT
    app.listen(PORT, () =>
      success({ message: `Server started on PORT ${PORT}`, badge: true })
    );
  } catch (err) {
    console.log("error",err);
    error({
      message: `Unable to connect with Database \n${err}`,
      badge: true,
    });
    startApp();
  }};

  

startApp();





