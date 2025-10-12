// src/pages/admin/ReportsTab.jsx
import React, { useEffect, useState } from "react";
import SectionHeader from "../../components/admin/SectionHeader";
import ReportsTable from "../../components/admin/tables/ReportsTable";

const ReportsTab = ({ api }) => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.getReports();
      setRows(data?.data || data?.list || []);
    })();
  }, []);
  return (
    <section className="space-y-6">
      <SectionHeader
        title="Báo cáo vi phạm"
        desc="Tin tuyển dụng bị người dùng báo cáo vi phạm"
      />
      <ReportsTable rows={rows} />
    </section>
  );
};

export default ReportsTab;
