import { Router } from "express";
const router = Router();
import wardenControllers from "../controllers/wardenControllers.js";

router.get("/dashboard", wardenControllers.getDashboard);
router.get("/pending-leave-forms", wardenControllers.getPendingLeaveForms);
router.post("/pending-leave-forms/:id/:status", wardenControllers.postPendingLeaveForms);
router.get("/approved-leave-forms", wardenControllers.getApprovedLeaveForms);
router.get("/declined-leave-forms", wardenControllers.getDeclinedLeaveForms);
router.get("/all-leave-forms", wardenControllers.getAllLeaveForms);
router.get("/refund-management", wardenControllers.getRefundManagement);
router.post("/refund-management", wardenControllers.postRefundManagement);
router.get("/refund-list", wardenControllers.getRefundList);
router.get("/refund-list/download-refund-excel", wardenControllers.getDownloadRefundExcel);
router.get("/profile", wardenControllers.getProfile);
router.post("/profile", wardenControllers.postProfile);
  

export default router;