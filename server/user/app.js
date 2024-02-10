require("dotenv").config();

const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const router = require("./routes");
const { run } = require("./config/mongo.js");


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.use(errorHandler);

// run().then(() => {
//   app.listen(port, () => {
//     console.log(
//       `SeekerDB app listening on port ${port} -- ${new Date().toLocaleDateString()}`
//     );
//   });
// });

module.exports = app