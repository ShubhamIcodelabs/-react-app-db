import express from "express";
import {authLogin, authSignup} from "../controller/auth.controller.js";
const router = express();

router.post('/signup', authSignup);
router.post('/login', authLogin);

export default router;