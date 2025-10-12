// src/components/admin/tables/PendingHRTable.jsx
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const PendingHRTable = ({ rows, onApprove, onReject }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {["Tên", "Email", "Ngày đăng ký", "Trạng thái", "Hành động"].map(
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
        {rows.map((hr) => (
          <tr key={hr._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {hr.name}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{hr.email}</td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {hr.createdAt ? new Date(hr.createdAt).toLocaleDateString() : "-"}
            </td>
            <td className="px-6 py-4">
              {hr.status === "pending" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Chờ duyệt
                </span>
              )}
            </td>
            <td className="px-6 py-4 text-sm">
              {hr.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(hr._id)}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                  </button>
                  <button
                    onClick={() => onReject(hr._id)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Từ chối
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

export default PendingHRTable;
