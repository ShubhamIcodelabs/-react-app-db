import express from "express";
import {authLogin, authSignup, refreshToken, authLogout, changePassword} from "../controller/auth.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express();

router.post('/signup', authSignup);
router.post('/login', authLogin);
router.post('/refresh-token', refreshToken);
router.post('/logout', authLogout);
router.post('/change-password', verifyToken, changePassword);

export default router;