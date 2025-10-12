// src/api/adminApi.js
import axios from "axios";

export const makeAdminApi = (backendUrl, adminToken) => {
  const http = axios.create({
    baseURL: `${backendUrl}/api/admin`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  return {
    // Tổng quan (nếu bạn đã có endpoint)
    getOverview: () => http.get("/overview"),

    // HR pending
    getHRPending: () => http.get("/hr"),
    approveHR: (id) => http.post(`/hr/${id}/approve`),
    rejectHR: (id) => http.post(`/hr/${id}/reject`),
    deleteHR: (id) => http.delete(`hr/${id}`),

    // Jobs pending
    getJobsPending: () => http.get("/jobs"),
    getJobDetail: (id) => http.get(`/jobs/${id}`),
    approveJob: (id) => http.post(`/jobs/${id}/approve`),
    rejectJob: (id) => http.post(`/jobs/${id}/reject`),

    // Reports & Logs (tùy server bạn có)
    getReports: () => http.get("/reports"),
    getLogs: () => http.get("/logs"),
  };
};
