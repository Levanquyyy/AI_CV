// src/components/admin/tables/PendingJobsTable.jsx
import React from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import Badge from "../Badge";

const PendingJobsTable = ({ rows, onApprove, onReject }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {["Tiêu đề", "Công ty", "Ngày gửi", "Trạng thái", "Hành động"].map(
            (h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                {h}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((job) => (
          <tr key={job._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {job.title}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{job.company}</td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {job.createdAt
                ? new Date(job.createdAt).toLocaleDateString()
                : "-"}
            </td>
            <td className="px-6 py-4">
              {job.status === "pending" && (
                <Badge text="Chờ duyệt" color="yellow" />
              )}
              {job.status === "approved" && (
                <Badge text="Đã duyệt" color="green" />
              )}
              {job.status === "rejected" && (
                <Badge text="Từ chối" color="red" />
              )}
            </td>
            <td className="px-6 py-4 text-sm">
              {job.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(job._id)}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                  </button>
                  <button
                    onClick={() => onReject(job._id)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Từ chối
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Eye className="w-4 h-4 mr-1" /> Xem
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default PendingJobsTable;
