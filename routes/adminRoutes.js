import adminControllers from "../controllers/adminControllers.js"; 
import wardenControllers from "../controllers/wardenControllers.js";

import { Router } from "express";
const router = Router();

router.get("/dashboard", wardenControllers.getDashboard);
router.get("/pending-leave-forms", wardenControllers.getPendingLeaveForms);
router.get("/approved-leave-forms", wardenControllers.getApprovedLeaveForms);
router.get("/declined-leave-forms", wardenControllers.getDeclinedLeaveForms);
router.get("/all-leave-forms", wardenControllers.getAllLeaveForms);
router.get("/refund-management", wardenControllers.getRefundManagement);
router.post("/refund-management", wardenControllers.postRefundManagement);
router.get("/refund-list", wardenControllers.getRefundList);
router.get("/profile", wardenControllers.getProfile);
router.post("/profile", wardenControllers.postProfile);
router.get("/refund-list/download-refund-excel", wardenControllers.getDownloadRefundExcel);
router.get("/manage-roles", adminControllers.getManageRoles);
router.post("/manage-roles", adminControllers.postManageRoles);
router.get("/delete-passout", adminControllers.getDeletePassout);
router.post("/delete-passout", adminControllers.postDeletePassout);

export default router;