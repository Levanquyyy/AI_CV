import React from "react";
import { Activity, CheckCircle, XCircle } from "lucide-react";

const LogsList = ({ rows }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
    {rows.map((log) => (
      <div key={log._id} className="p-6 hover:bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-lg ${
                log.type === "login"
                  ? "bg-blue-100"
                  : log.type === "approval"
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              {log.type === "login" && (
                <Activity className="w-5 h-5 text-blue-600" />
              )}
              {log.type === "approval" && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {log.type === "rejection" && (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{log.action}</p>
              <p className="text-sm text-gray-600 mt-1">
                Người thực hiện: {log.user}
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-500">{log.time}</span>
        </div>
      </div>
    ))}
  </div>
);

export default LogsList;
