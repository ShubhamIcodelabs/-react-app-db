import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "mysecretkey";

// Middleware to verify access token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required"
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token - user not found"
            });
        }
        
        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Access token expired"
            });
        }
        
        return res.status(401).json({
            success: false,
            message: "Invalid access token"
        });
    }
};

export default verifyToken;