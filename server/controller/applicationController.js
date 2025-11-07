import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { sendApplicationStatusEmail } from "../config/emailConfig.js";
import { logActivity } from "../utils/activity.js";

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const companyId = req.company._id;

    // Validate status
    if (!["accepted", "rejected"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status. Must be 'accepted' or 'rejected'",
      });
    }

    // Find application and validate company
    const application = await JobApplication.findById(applicationId)
      .populate("companyId", "name")
      .populate("jobId", "title");

    if (!application) {
      return res.json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify that this company owns this application
    if (application.companyId._id.toString() !== companyId.toString()) {
      return res.json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    // Get user email
    const user = await User.findById(application.userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Update application status
    application.status = status;
    await application.save();

    // Send email notification
    const emailResult = await sendApplicationStatusEmail(
      user.email,
      application.companyId.name,
      status
    );

    // Log activity
    logActivity({
      action: `application.${status}`,
      message: `Application ${applicationId} ${status} by company ${application.companyId.name}`,
      actorType: "company",
      actorId: companyId.toString(),
      actorName: application.companyId.name,
      targetType: "application",
      targetId: applicationId,
      targetName: `Application for ${application.jobId.title}`,
      meta: {
        userId: application.userId,
        jobId: application.jobId._id.toString(),
        status,
      },
    });

    if (!emailResult.success) {
      return res.json({
        success: true,
        message: "Status updated but email notification failed",
        error: emailResult.error,
      });
    }

    res.json({
      success: true,
      message: `Application successfully ${status}`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
