import jwt from "jsonwebtoken";
import User  from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    //extract token from http-only cookie
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1]; //get token from cookie

    if (!token) {
      console.log("Socket connection rejected: No token provided ");
      return next(new Error("Authentication error: No token provided"));
      }
    //verify token
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      if (!decoded) {
        console.log("Socket connection rejected: Invalid token");
        return next(new Error("Authentication error: Invalid token"));
      }
      //find user by id from token from db
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        console.log("Socket connection rejected: User not found");
        return next(new Error("Authentication error: User not found"));
      }
      //attach user info to socket object to be used in socket event handlers
      socket.user = user;
      socket.userId = user._id.toString(); 

      console.log(`Socket connection authenticated for user: ${user.fullName} (${user._id})`);

      next();
  } catch (error) {
      console.log("Socket authentication error: ", error.message);
      next(new Error("Atuhentication failed: "));
  }
};
