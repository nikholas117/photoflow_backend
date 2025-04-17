const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

const isAuthenticated = catchAsync(async (req, res, next) => {
  console.log("\n--- AUTHENTICATION MIDDLEWARE TRIGGERED ---");
  console.log("Request URL:", req.originalUrl);
  console.log("Request method:", req.method);

  let token;

  // Check for token in cookies and headers
  console.log("\nChecking for token...");
  console.log("Cookies:", req.cookies);
  console.log("Authorization header:", req.headers.authorization);

  if (req.cookies.token) {
    token = req.cookies.token;
    console.log("Token found in cookies:", token.substring(0, 10) + "...");
  } else if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
    console.log(
      "Token found in authorization header:",
      token.substring(0, 10) + "..."
    );
  }

  if (!token) {
    console.log("❌ No token found in request");
    return next(
      new AppError("You are not logged in! Please log in to access.", 401)
    );
  }

  // Verify token
  console.log("\nVerifying token...");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token successfully decoded:", {
      id: decoded.id,
      iat: decoded.iat,
      exp: decoded.exp,
    });

    // Check if user exists
    console.log("\nLooking up user in database...");
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      console.log("❌ User not found in database for ID:", decoded.id);
      return next(
        new AppError("The user belonging to this token does not exist.", 401)
      );
    }

    console.log("✅ User found:", {
      id: currentUser._id,
      email: currentUser.email,
    });

    req.user = currentUser;
    next();
  } catch (err) {
    console.log("❌ Token verification failed:", err.message);
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError("Your token has expired! Please log in again.", 401)
      );
    }
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
});

module.exports = isAuthenticated;
