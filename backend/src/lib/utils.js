import jwt from "jsonwebtoken";   // verify authentication tokens
import { ENV } from "./env.js";
export const generateToken = (userId, res) => {
    
    const { JWT_SECRET } = ENV;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured ");

    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // prevent XSS attacks 
        sameSite: "strict", // prevent CSRF attacks
        secure: ENV.NODE_ENV === "development" ? false : true,
        // in development it gonna be false as it's http://localhost
        // in production it gonna be true as it's https://domain.com
    });
    return token;
}

