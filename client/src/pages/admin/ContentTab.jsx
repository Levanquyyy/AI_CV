// src/pages/admin/ContentTab.jsx
import React, { useEffect, useState } from "react";
import SectionHeader from "../../components/admin/SectionHeader";
import PendingJobsTable from "../../components/admin/tables/PendingJobsTable";

const ContentTab = ({ api }) => {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.getJobsPending();
    setRows(data?.data || data?.list || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Tin tuyển dụng chờ duyệt"
        desc="Duyệt hoặc từ chối tin tuyển dụng do HR gửi lên"
      />
      <PendingJobsTable
        rows={rows}
        onApprove={async (id) => {
          await api.approveJob(id);
          await load();
        }}
        onReject={async (id) => {
          await api.rejectJob(id);
          await load();
        }}
      />
    </section>
  );
};

export default ContentTab;
