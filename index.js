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

  const startApp1 = async () => {
    const address = "kolkata"; // Example address
    const arrayOfObjects = [
      { id: 2, name: "Jane", age: 25 },
      { id: 3, name: "Sam", age: 35 },
      { id: 4, name: "Anna", age: 28 }
    ];
    const rest=arrayOfObjects.map((e)=>{
      return e.age*3
    })
    console.log("bghfcgfcfgcdg",rest);
    
    // try {
    //     // Construct the URL for geolocation API
    //     const url = `${process.env.GEOLOCATIONURL}${address}${process.env.APIKEY}`;
    //     console.log("Constructed URL:", url);
        
    //     // Send the GET request using superagent
    //     const response = await superagent.get(url);

    //     // Check if the response is successful (status code 200)
    //     if (response.status !== 200) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //     }

    //     // Assuming the API response is in JSON format
    //     const resp = response.body; // superagent automatically parses the JSON response

    //     // Log some part of the response for debugging
    //     console.log("Response data:", resp);

    //     // Check if there are results in the response
    //     if (resp.results && resp.results.length >= 1) {
    //         const lat = resp.results[resp.results.length - 1].geometry.lat;
    //         const lng = resp.results[resp.results.length - 1].geometry.lng;
    //         console.log("Latitude:", lat, "Longitude:", lng);
    //     } else {
    //         console.log("No results found.");
    //     }
    // } catch (err) {
    //     // Handle errors (network issues, invalid response, etc.)
    //     console.error("Error occurred:", err);
    // }
};

startApp();

// startApp1();




