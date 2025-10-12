import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import mongoose from "mongoose";
const router = express.Router();

/* ---------------------------------------------
   1️⃣  Khởi tạo tài khoản admin (chạy 1 lần)
--------------------------------------------- */
router.post("/setup", async (req, res) => {
  try {
    const existing = await Admin.findOne({ username: "admin" });
    if (existing) return res.json({ message: "⚠️ Admin already exists" });

    const admin = new Admin({ username: "admin", password: "12341234" });
    await admin.save();
    res.json({ success: true, message: "✅ Admin account created!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------
   2️⃣  Đăng nhập admin
--------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res.json({ success: false, message: "Missing credentials" });
    }

    username = String(username).toLowerCase().trim();

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------
   3️⃣  Lấy danh sách HR chờ duyệt
--------------------------------------------- */
router.get("/hr/pending", protectAdmin, async (req, res) => {
  try {
    const pendingCompanies = await Company.find({ status: "pending" }).select(
      "_id name email image status createdAt"
    );

    return res.json({
      success: true,
      data: pendingCompanies,
      count: pendingCompanies.length,
    });
  } catch (err) {
    console.error("Error fetching pending companies:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

/* ---------------------------------------------
   Duyệt HR
--------------------------------------------- */
router.post("/hr/:id/approve", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid company ID" });
    }

    const company = await Company.findById(id);
    if (!company) return res.json({ success: false, message: "HR not found" });

    company.status = "approved";
    await company.save();

    return res.json({
      success: true,
      message: "✅ HR approved successfully",
      data: { _id: company._id, status: company.status },
    });
  } catch (err) {
    console.error("Error approving HR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------
   Từ chối HR
--------------------------------------------- */
router.post("/hr/:id/reject", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid company ID" });
    }

    const company = await Company.findById(id);
    if (!company) return res.json({ success: false, message: "HR not found" });

    company.status = "rejected";
    await company.save();

    return res.json({
      success: true,
      message: "❌ HR rejected successfully",
      data: { _id: company._id, status: company.status },
    });
  } catch (err) {
    console.error("Error rejecting HR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
/* ---------------------------------------------
   5️⃣  Thống kê hệ thống
--------------------------------------------- */
router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalApplications = await JobApplication.countDocuments();
    const pendingHR = await Company.countDocuments({ isApproved: false });
    const approvedHR = await Company.countDocuments({ isApproved: true });

    res.json({
      success: true,
      data: {
        totalJobs,
        totalUsers,
        totalApplications,
        approvedHR,
        pendingHR,
      },
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------
   6️⃣  Log hệ thống (mock)
--------------------------------------------- */
router.get("/logs", protectAdmin, async (req, res) => {
  // sau này bạn có thể dùng Winston hoặc Mongo logs
  res.json({
    success: true,
    logs: [
      { time: new Date(), action: "Admin logged in" },
      { time: new Date(), action: "Viewed HR pending list" },
    ],
  });
});

export default router;
