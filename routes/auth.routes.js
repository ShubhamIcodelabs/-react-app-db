import express from "express";
import authController from "../controller/auth.controller.js";
const router = express();

router.post('/signup', authController.authSignup);
router.post('/login', authController.authLogin);

export default router;