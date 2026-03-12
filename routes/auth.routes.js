import express from "express";
import authSignup from "../controller/auth.controller.js";
const router = express();

router.post('/signup', authSignup);

export default router