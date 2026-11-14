const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });

connectDB();

const auth = require("./routes/auth");
const campgrounds = require("./routes/campgrounds");
const bookings = require("./routes/bookings");

const app = express();

app.set("query parser", "extended");

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", auth);
app.use("/api/v1/campgrounds", campgrounds);
app.use("/api/v1/bookings", bookings);

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log("Server running in ", process.env.NODE_ENV, "mode on port", PORT);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});