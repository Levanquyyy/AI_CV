// src/components/admin/tables/ReportsTable.jsx
import React from "react";
import { Eye, XCircle } from "lucide-react";

const ReportsTable = ({ rows }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {[
            "Tiêu đề",
            "Công ty",
            "Lý do",
            "Số báo cáo",
            "Ngày báo cáo",
            "Hành động",
          ].map((h) => (
            <th
              key={h}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((r) => (
          <tr key={r._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {r.title}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{r.company}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{r.reason}</td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {r.reports} báo cáo
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}
            </td>
            <td className="px-6 py-4 text-sm">
              <div className="flex gap-2">
                <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Eye className="w-4 h-4 mr-1" /> Xem chi tiết
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <XCircle className="w-4 h-4 mr-1" /> Gỡ bỏ
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ReportsTable;
