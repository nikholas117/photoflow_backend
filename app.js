const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const globalErrorHandler = require("./controllers/errorController");
const path = require("path");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");

const app = express();

// Serve static files (like uploaded images)
app.use("/", express.static("uploads"));

// Parse cookies
app.use(cookieParser());

// Set security headers
app.use(helmet());

// ✅ CORS config with correct origins (no trailing slashes)
const allowedOrigins = [
  "http://localhost:3000",
  "https://photoflow-frontend-v6lp.vercel.app",
  "https://photoflow-frontend-117.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Serve static assets (optional)
app.use(express.static(path.join(__dirname, "public")));

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parse JSON requests
app.use(express.json({ limit: "10kb" }));

// Sanitize data
app.use(mongoSanitize());

// User routes
app.use("/api/v1/users", userRouter);

// Post routes
app.use("/api/v1/posts", postRouter);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
