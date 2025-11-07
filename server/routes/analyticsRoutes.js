import express from "express";
import { getMostAppliedJobs } from "../controller/analyticsController.js";
import { protectCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get most applied jobs
router.get("/most-applied-jobs", getMostAppliedJobs);

export default router;
