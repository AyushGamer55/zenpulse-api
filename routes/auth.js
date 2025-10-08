// routes/auth.js
import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getMe);

export default router;
