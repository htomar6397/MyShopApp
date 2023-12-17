import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "./../models/userModel.js";
import { isValidObjectId } from "mongoose";

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const JWT_SECRET = 'JWT_SECRET';

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};
function checkObjectId(req, res, next) {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error(`Invalid ObjectId of:  ${req.params.id}`);
  }
  next();
}
export { protect, admin ,checkObjectId };
