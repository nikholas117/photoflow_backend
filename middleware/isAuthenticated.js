const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

// Modified to bypass authentication
const isAuthenticated = catchAsync(async (req, res, next) => {
  // Bypass all checks and attach a mock user
  req.user = {
    _id: "fake-user-id", // Mock user ID
    name: "Bypassed User", // Mock data
    email: "bypass@example.com",
    role: "user", // Default role
  };

  return next(); // Proceed without token validation
});

// Export as a direct function (not an object)
module.exports = isAuthenticated;
