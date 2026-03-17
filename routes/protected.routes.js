import express from "express";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

// Example protected route
router.get('/profile', verifyToken, (req, res) => {
    // req.user is available here thanks to the middleware
    res.json({
        success: true,
        message: "Protected route accessed successfully",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});

export default router;