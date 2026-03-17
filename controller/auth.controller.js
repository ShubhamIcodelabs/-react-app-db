import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Use environment variables or fallback to defaults (should be in .env file)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "mysecretkey";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refreshtokenkey";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // shorter expiry for security
  );
};

// Generate Refresh Token (long life)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    REFRESH_TOKEN_SECRET,
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

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
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
        
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
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

        
        // Check if password matches using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }
        
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

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

// Refresh Token endpoint
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }
        
        // Find user with this refresh token
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Invalid refresh token"
            });
        }
        
        // Verify refresh token
        try {
            jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        } catch (error) {
            // Remove invalid refresh token from database
            user.refreshToken = null;
            await user.save();
            
            return res.status(403).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }
        
        // Generate new access token
        const newAccessToken = generateAccessToken(user);
        
        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: newAccessToken
        });
        
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Logout endpoint
const authLogout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }
        
        // Find user and remove refresh token
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
        
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Change Password endpoint
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From auth middleware
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }
        
        // Validate new password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }
        
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password and invalidate refresh token for security
        user.password = hashedNewPassword;
        user.refreshToken = null; // Force re-login
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please login again."
        });
        
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export {authSignup, authLogin, refreshToken, authLogout, changePassword};