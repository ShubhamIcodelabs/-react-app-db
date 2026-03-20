import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "mysecretkey";

export const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Access token is required" 
            })
        }
        
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded.id).select("-password")
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User not found" 
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log("JWT verification error:", error.message)
        
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Access token has expired",
                error: "TOKEN_EXPIRED"
            })
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid access token",
                error: "INVALID_TOKEN"
            })
        }
        
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}