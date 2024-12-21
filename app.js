const express = require("express");
const { sequelize } = require("./models");
const router = require("./router/index");
const cors = require("cors");
const logger = require('morgan');


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(logger('dev'));



app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/api/", router);

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));


app.use((error, _req, res, _next) => {
  const statusCode = error.status || 500;
  const message = error.message || 'Something went wrong';

  console.error(error);  // Log the error details for debugging

  // Send the error response
  res.status(statusCode).json({
    message: message,
  });
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
