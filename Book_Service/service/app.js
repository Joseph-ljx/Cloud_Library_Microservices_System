/** Express configuration */
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const createError = require("http-errors");
const cors = require("cors");

// Main express router
const app = express();

// Import relevant routers
const bookRouter = require("./routes/BookAPI");

// Apply routers
app.use("/books", bookRouter);

// Health check
app.use("/status", require("./routes/healthChecker"));

// Engine setup for exhibition - Optional
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

// Default setting of express
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
