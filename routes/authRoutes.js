import express, { Router } from "express";
import authController from "../controllers/authControllers.js";



const router = express.Router();

router.get("/", authController.getHome);
router.get("/login", authController.getLogin);
router.get("/auth/google", authController.googleAuth);
router.get("/auth/google/callback", authController.googleAuthCallback);
router.get("/logout", authController.getLogout);
 
export default router;