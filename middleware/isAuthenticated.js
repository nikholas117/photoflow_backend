const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

const isAuthenticated = catchAsync(async (req, res, next) => {
  // Get token from cookies or headers
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to access.", 401)
    );
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new AppError("Invalid token. Please log in again.", 401));
  }

  // Find user by decoded id from token
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does not exist.", 401)
    );
  }

  req.user = currentUser; // Attach the user to the request object

  next();
});

module.exports = isAuthenticated;
