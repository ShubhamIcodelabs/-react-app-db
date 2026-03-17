import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const decoded = jwt.verify(token, "mysecretkey")
        const user = await User.findById(decoded.id).select("-password")
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}