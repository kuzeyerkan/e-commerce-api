require("dotenv").config();
require("express-async-errors"); // instead of add TRY-CATCH block using this. it can handle automaticly
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");

//express
const express = require("express");
const app = express();

// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

//database
const connectDB = require("./db/connect");
//middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//bodyparser-butun routelarda json datayi okumak icin
app.use(morgan("tiny")); //requestin nereden geldigini basarili olup olmadigini, ne kadar surede finalize edildigini belirtiyor
app.use(express.json());
app.use(cookieParser("jwtSecret"));
app.use(express.static("./public"));
app.use(fileUpload());

app.get("/", (req, res) => {
  console.log(req.cookies);
  res.send("E-commerce api");
});
app.get("/api/v1", (req, res) => {
  console.log(req.cookies);
  res.send("E-commerce api");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);
//butun routelarda errorhandler yapmak icin
app.use(notFoundMiddleware); // butun routelarida otomatik handle ediyor
app.use(errorHandlerMiddleware); // butun routelarida otomatik handle ediyor

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
