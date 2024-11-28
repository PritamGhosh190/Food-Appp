const cors = require("cors");
const exp = require("express");
const upload = require('express-fileupload')
const passport = require("passport");
const morgan = require("morgan");
const { connect } = require("mongoose");
const { success, error } = require("consola");
const path = require('path');
const axios = require('axios');
const multer = require('multer');

const apiUrl = 'http://web.sensegeofence.com:3006/api';
const { MONGO_HOST, MONGO_DB_NAME, REQUEST_TIMEOUT, NODE_PORT, MONGO_URL } = require("./config");
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
  }
};


startApp();




// axios.get(apiUrl)
//   .then(response => {
//     console.log('Response data:', response.data);  // Handle the response data
//   })
//   .catch(error => {
//     if (error.response) {
//       // If the request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       console.error('Response error:', error.response.status);
//       console.error('Response data:', error.response.data);
//     } else if (error.request) {
//       // If the request was made but no response was received
//       console.error('Request error:', error.request);
//     } else {
//       // Any other error
//       console.error('Error message:', error.message);
//     }
//   });