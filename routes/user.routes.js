import express from "express"
import { getAllUsers } from "../controller/user.controller.js"
import { verifyUser } from "../middleware/verifyUser.js"

const router = express.Router()

router.get("/",verifyUser, getAllUsers)

export default router