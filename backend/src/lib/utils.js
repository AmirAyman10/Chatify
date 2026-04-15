import jwt from "jsonwebtoken";   // verify authentication tokens

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // prevent XSS attacks 
        sameSite: "strict", // prevent CSRF attacks
        secure: process.env.Node_ENV === "development" ? false : true,
        // in development it gonna be false as it's http://localhost
        // in production it gonna be true as it's https://domain.com
    });
    return token;
}

