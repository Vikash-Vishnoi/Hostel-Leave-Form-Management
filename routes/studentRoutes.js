import express from "express";
const router = express.Router();

import studentControllers from "../controllers/studentControllers.js";

router.get("/dashboard", studentControllers.getDashboard);

router.get("/profile", studentControllers.getProfile);
router.post("/profile/update", studentControllers.postProfileUpdate);

router.get("/leave-form", studentControllers.getLeaveForm);
router.post("/leave-form", studentControllers.postLeaveForm);

router.get("/leave-form-status", studentControllers.getLeaveFormStatus);
router.get("/leave-form-history", studentControllers.getLeaveFormHistory);
 
router.get("/edit-leave-form/:id", studentControllers.getEditLeaveForm);
router.post("/edit-leave-form/:id", studentControllers.postEditLeaveForm);

router.get("/refund-amount", studentControllers.getRefundAmount);

export default router;