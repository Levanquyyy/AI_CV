// server/controller/reportController.js
import Report from "../models/Report.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

/**
 * POST /api/reports
 * Gửi báo cáo vi phạm một tin tuyển dụng
 */
export const submitReport = async (req, res) => {
  try {
    const { jobId, reason, description } = req.body;
    const userId = req.auth?.userId || req.body.userId || "anonymous";

    // Kiểm tra user đăng nhập (nếu hệ thống yêu cầu)
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để gửi báo cáo.",
      });
    }

    // Validate jobId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res
        .status(400)
        .json({ success: false, message: "Job ID không hợp lệ." });
    }

    // Kiểm tra job có tồn tại
    const job = await Job.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tin tuyển dụng." });
    }

    // Lấy companyId từ job
    const companyId = job.companyId;

    // Tạo hoặc bỏ qua nếu đã báo cáo (theo unique index)
    const newReport = new Report({
      jobId,
      companyId,
      userId,
      reason: reason.trim(),
      description: description?.trim() || "",
    });

    await newReport.save();

    return res.json({
      success: true,
      message: "✅ Báo cáo vi phạm đã được gửi thành công.",
      report: newReport,
    });
  } catch (err) {
    console.error("Submit report error:", err);

    // Xử lý lỗi trùng lặp (do unique index jobId + userId)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Bạn đã gửi báo cáo cho bài viết này rồi.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message,
    });
  }
};

// 👀 Admin xem danh sách báo cáo
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate({ path: "jobId", select: "title companyId" })
      .populate({ path: "companyId", select: "name" })
      .sort({ createdAt: -1 });

    const data = reports.map((r) => ({
      _id: r._id,
      jobId: r.jobId,
      company: r.companyId?.name || "",
      reason: r.reason,
      description: r.description || "",
      status: r.status,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Admin đánh dấu đã xử lý
export const markReportReviewed = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndUpdate(
      id,
      { status: "reviewed" },
      { new: true }
    );

    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy báo cáo" });

    res.json({ success: true, message: "Đã đánh dấu đã xử lý", report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
