// src/pages/admin/LogsTab.jsx
import React, { useEffect, useState } from "react";
import SectionHeader from "../../components/admin/SectionHeader";
import LogsList from "../../components/admin/tables/LogsList";

const LogsTab = ({ api }) => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.getLogs();
      setRows(data?.data || data?.list || []);
    })();
  }, []);
  return (
    <section className="space-y-6">
      <SectionHeader
        title="Nhật ký hoạt động"
        desc="Theo dõi tất cả hoạt động trên hệ thống"
      />
      <LogsList rows={rows} />
    </section>
  );
};

export default LogsTab;
