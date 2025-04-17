const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

const isAuthenticated = catchAsync(async (req, res, next) => {
  // Bypass authentication completely
  req.user = {
    _id: "fake-user-id", // Mock user ID
    name: "Bypassed User", // Mock user data
    email: "bypass@example.com",
    role: "user", // Add any default role if needed
  };
  return next(); // Skip all checks and proceed

  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to access.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new AppError("Invalid token. Please log in again.", 401));
  }

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does not exist.", 401)
    );
  }

  req.user = currentUser;
  next();
});
