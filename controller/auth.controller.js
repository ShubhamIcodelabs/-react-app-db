import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    "mysecretkey",
    { expiresIn: "1h" } // short expiry
  );
};

// Generate Refresh Token (long life)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    "refreshtokenkey",
    { expiresIn: "7d" } // long expiry
  );
};


const authSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (name ==="" || email ==="" || password ==="") {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User already exists with this email" 
            });
        }
        
        // Create new user
        const newUser = new User({
            name,
            email,
            password
        });
        
        // Save to database
        const savedUser = await newUser.save();
        
        // Return success response (excluding password)
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
        });
        
    } catch (error) {
        console.error("Signup error:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const authLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email ==="" || password ==="") {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "User not found with this email" 
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // Check if password matches
        if (user.password !== password) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }
        
        // Return success response (excluding password)
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error("Login error:", error);
        
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export  {authSignup, authLogin};