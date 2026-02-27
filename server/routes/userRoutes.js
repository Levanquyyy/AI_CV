import express from "express";
import multer from "multer";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  updateUserResume,
} from "../controller/userController.js";
import { uploadResume } from "../config/multer.js";
import {
  getAIScreeningResult,
  screenApplication,
  updateAIScreeningReview,
} from "../controller/aiScreeningController.js";
import { logActivity } from "../utils/activity.js";
import User from "../models/User.js";

const router = express.Router();

// Client gọi ngay sau khi login để ghi log
router.post("/after-login", async (req, res) => {
  try {
    const { userId } = req.auth();
    const name = req.body?.name || "";
    const email = req.body?.email || "";
    const image = req.body?.image || "";

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId" });
    }

    // Self-heal user mapping after Clerk login:
    // - update by Clerk id if exists
    // - else fallback by unique email
    // - else create new
    let userDoc = await User.findById(userId);
    if (userDoc) {
      userDoc.name = name || userDoc.name;
      userDoc.email = email || userDoc.email;
      userDoc.image = image || userDoc.image;
      await userDoc.save();
    } else if (email) {
      userDoc = await User.findOne({ email });
      if (userDoc) {
        userDoc.name = name || userDoc.name;
        userDoc.image = image || userDoc.image;
        await userDoc.save();
      } else {
        userDoc = await User.create({
          _id: userId,
          name,
          email,
          image: image || "",
          resume: "",
        });
      }
    }

    logActivity({
      action: "user.login",
      message: `User login ${name || userId}`,
      actorType: "user",
      actorId: userId,
      actorName: name,
      targetType: "user",
      targetId: userId,
      targetName: name,
      req,
      meta: {
        email,
      },
    });

    res.json({ success: true, user: userDoc || null });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});
// Get User Data

router.get("/user", getUserData);

// Apply for a Job

router.post("/apply", applyForJob);

// Get applied jobs data
router.get("/applications", getUserJobApplications);

// Update the resume
router.post(
  "/update-resume",
  uploadResume.single("resume"),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
        });
      }
    } else if (err) {
      return res.json({ success: false, message: err.message });
    }
    next();
  },
  updateUserResume
);

// AI Screening routes
router.post("/applications/screen", screenApplication);
router.get("/applications/:applicationId/ai-result", getAIScreeningResult);
router.patch("/applications/:applicationId/ai-review", updateAIScreeningReview);

export default router;
