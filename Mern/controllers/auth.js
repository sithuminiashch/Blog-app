import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    // Log the incoming request body
    console.log("Received registration request with body:", req.body);

    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends = [], // Default to an empty array if friends is not provided
      location,
      occupation,
    } = req.body;

    console.log("Extracted user details:", {
      firstName,
      lastName,
      email,
      location,
      occupation,
    });

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log("Generated password hash:", passwordHash);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    // Log the new user object before saving
    console.log("New user object to save:", newUser);

    const savedUser = await newUser.save();
    
    // Log the saved user details
    console.log("Saved user:", savedUser);

    res.status(201).json(savedUser);
  } catch (err) {
    // Log the error message
    console.error("Error during user registration:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};