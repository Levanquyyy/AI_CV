import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

export const getMostAppliedJobs = async (req, res) => {
  try {
    // Lấy query params để phân trang và filter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const timeFrame = req.query.timeFrame || "all"; // all, week, month, year

    // Tính skip để phân trang
    const skip = (page - 1) * limit;

    // Tạo điều kiện filter theo thời gian nếu có
    let dateFilter = {};
    const now = new Date();

    switch (timeFrame) {
      case "week":
        dateFilter = {
          date: {
            $gte: now.getTime() - 7 * 24 * 60 * 60 * 1000,
          },
        };
        break;
      case "month":
        dateFilter = {
          date: {
            $gte: now.getTime() - 30 * 24 * 60 * 60 * 1000,
          },
        };
        break;
      case "year":
        dateFilter = {
          date: {
            $gte: now.getTime() - 365 * 24 * 60 * 60 * 1000,
          },
        };
        break;
    }

    // Aggregate để đếm số lượng applications cho mỗi job
    const mostAppliedJobs = await JobApplication.aggregate([
      // Match theo điều kiện thời gian nếu có
      ...(Object.keys(dateFilter).length ? [{ $match: dateFilter }] : []),

      // Group theo jobId và đếm số lượng applications
      {
        $group: {
          _id: "$jobId",
          applicationCount: { $sum: 1 },
          // Lấy ngày apply gần nhất
          lastApplied: { $max: "$date" },
        },
      },

      // Sort theo số lượng applications giảm dần
      { $sort: { applicationCount: -1 } },

      // Skip và limit cho phân trang
      { $skip: skip },
      { $limit: limit },

      // Lookup để lấy thông tin chi tiết của job
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "_id",
          as: "jobDetails",
        },
      },

      // Lookup để lấy thông tin company
      {
        $lookup: {
          from: "companies",
          localField: "jobDetails.companyId",
          foreignField: "_id",
          as: "companyDetails",
        },
      },

      // Reshape data để return
      {
        $project: {
          _id: 1,
          applicationCount: 1,
          lastApplied: 1,
          job: { $arrayElemAt: ["$jobDetails", 0] },
          company: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$companyDetails",
                  as: "company",
                  in: {
                    _id: "$$company._id",
                    name: "$$company.name",
                    image: "$$company.image",
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ]);

    // Lấy tổng số jobs để tính total pages
    const totalJobs = await JobApplication.aggregate([
      ...(Object.keys(dateFilter).length ? [{ $match: dateFilter }] : []),
      {
        $group: {
          _id: "$jobId",
        },
      },
      {
        $count: "total",
      },
    ]);

    const total = totalJobs.length > 0 ? totalJobs[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        jobs: mostAppliedJobs,
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs: total,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error getting most applied jobs:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
