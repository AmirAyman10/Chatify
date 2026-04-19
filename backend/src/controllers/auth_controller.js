import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { ENV } from "../lib/env.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters " });
    }
    //check email validation (regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    //12345678 => fsa$sflgsgh=fafb?fa#
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generateToken(newUser._id, res);
      // await newUser.save();

      // this way will presist user first then issue auth cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        // 201 => Something created Successfully and sendinf it back to client
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      //send welcome email
      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          ENV.CLIENT_URL,
        );
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log("error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const login =  async (req,res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  try {
    const user =  await User.findOne({email})
    if (!user) return res.status(400).json({message:"Invalid Credentials"})

    const isPasswordCorrect  =  await bcrypt.compare(password,user.password)
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid Credentials" })
    generateToken(user._id, res)
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    }) 
  } catch (error) {
    console.log("error in login controller", error);
    res.status(500).json({ message: "Internal Server Error" });
    
  }

} 


export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 })
  res.status(200).json({ message: "Logged out successfully" })
} 