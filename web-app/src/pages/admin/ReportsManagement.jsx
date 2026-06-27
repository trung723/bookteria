/**
 * ReportsManagement.jsx
 *
 * ⚠️  BE CHƯA CÓ ENDPOINT REPORTS
 * BE hiện tại (post-service) không có /post/admin/reports hay bất kỳ report API nào.
 * File này dùng mock data để demo UI.
 *
 * Để kết nối thực:
 *  1. Thêm entity Report vào post-service (hoặc tạo report-service riêng)
 *  2. Tạo các endpoint:
 *       POST   /post/reports          — user báo cáo
 *       GET    /post/admin/reports    — admin xem tất cả
 *       PUT    /post/admin/reports/:id/status  — cập nhật trạng thái
 *  3. Uncomment và dùng lại hàm trong adminService.js:
 *       getAllReports()
 *       updateReportStatus(id, status)
 */

import { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Avatar, Chip, IconButton, CircularProgress,
  Alert, Divider, Grid, Menu, MenuItem, Select, FormControl,
} from "@mui/material";
import FlagIcon                from "@mui/icons-material/Flag";
import CheckCircleOutlineIcon  from "@mui/icons-material/CheckCircleOutline";
import CloseIcon               from "@mui/icons-material/Close";
import MoreVertIcon            from "@mui/icons-material/MoreVert";
import InfoOutlinedIcon        from "@mui/icons-material/InfoOutlined";

const MOCK_REPORTS = [
  { id: "1", reporterUsername: "sarah",   targetType: "Post",    reason: "Spam",                  description: "Bài viết quảng cáo không phù hợp",              createdDate: "2025-06-20", status: "PENDING" },
  { id: "2", reporterUsername: "michael", targetType: "User",    reason: "Harassment",             description: "Người dùng có hành vi quấy rối trong tin nhắn", createdDate: "2025-06-19", status: "PENDING" },
  { id: "3", reporterUsername: "john",    targetType: "Post",    reason: "Inappropriate Content",  description: "Nội dung không phù hợp với cộng đồng",           createdDate: "2025-06-18", status: "RESOLVED" },
  { id: "4", reporterUsername: "james",   targetType: "Message", reason: "Spam",                   description: "Tin nhắn spam liên tục",                         createdDate: "2025-06-17", status: "REJECTED" },
  { id: "5", reporterUsername: "sarah",   targetType: "User",    reason: "Fake Account",           description: "Tài khoản giả mạo người khác",                  createdDate: "2025-06-16", status: "PENDING" },
];

const STATUS_META = {
  PENDING:  { label: "Pending",  bg: "#fff8e1", color: "#f57f17" },
  RESOLVED: { label: "Resolved", bg: "#e8f5e9", color: "#2e7d32" },
  REJECTED: { label: "Rejected", bg: "#fce4ec", color: "#c62828" },
};

const TARGET_META = {
  Post:    { bg: "#e3f2fd", color: "#1565c0" },
  User:    { bg: "#f3e5f5", color: "#7b1fa2" },
  Message: { bg: "#fff3e0", color: "#e65100" },
};

function ReportRow({ report, onStatusChange }) {
  const [anchor, setAnchor] = useState(null);
  const status = STATUS_META[report.status] || STATUS_META.PENDING;
  const target = TARGET_META[report.targetType] || { bg: "#f1f3f5", color: "#495057" };

  const nextStatuses = Object.keys(STATUS_META).filter(s => s !== report.status);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 2 }}>
        <Avatar sx={{ width: 36, height: 36, fontSize: 13 }}>
          {report.reporterUsername?.[0]?.toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600} fontSize={13}>{report.reporterUsername}</Typography>
            <Typography variant="caption" color="text.secondary">reported</Typography>
            <Chip label={report.targetType} size="small"
              sx={{ bgcolor: target.bg, color: target.color, fontSize: 11, height: 18, fontWeight: 600 }} />
          </Box>
          <Typography variant="body2" fontWeight={500} mb={0.3}>
            {report.reason}: {report.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {String(report.createdDate).slice(0, 10)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={status.label}
            size="small"
            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600, fontSize: 11, height: 22 }}
          />
          <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            {nextStatuses.map(s => (
              <MenuItem
                key={s}
                sx={{ fontSize: 13 }}
                onClick={() => { onStatusChange(report.id, s); setAnchor(null); }}
              >
                Chuyển thành {STATUS_META[s].label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "#f1f3f5" }} />
    </Box>
  );
}

export default function ReportsManagement() {
  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterStatus, setFilter]   = useState("ALL");

  useEffect(() => {
    // Simulate API delay; replace with: getAllReports().then(res => setReports(res.data?.result ?? []))
    setTimeout(() => {
      setReports(MOCK_REPORTS);
      setLoading(false);
    }, 600);
  }, []);

  // Local status update (thay bằng API khi BE sẵn sàng)
  const handleStatusChange = (id, newStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    // TODO: await updateReportStatus(id, newStatus);
  };

  const pending  = reports.filter(r => r.status === "PENDING").length;
  const resolved = reports.filter(r => r.status === "RESOLVED").length;
  const rejected = reports.filter(r => r.status === "REJECTED").length;

  const displayed = filterStatus === "ALL"
    ? reports
    : reports.filter(r => r.status === filterStatus);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Reports Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Quản lý các báo cáo từ người dùng</Typography>

      {/* Notice: mock data */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="small" />}
        sx={{ mb: 3, fontSize: 13 }}
      >
        BE chưa có report API. Dữ liệu bên dưới là mock. Xem comment trong file để biết cách tích hợp.
      </Alert>

      {/* Summary */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Pending",  count: pending,  icon: <FlagIcon sx={{ color: "#f57f17", fontSize: 22 }} />,             bg: "#fff8e1" },
          { label: "Resolved", count: resolved, icon: <CheckCircleOutlineIcon sx={{ color: "#2e7d32", fontSize: 22 }} />, bg: "#e8f5e9" },
          { label: "Rejected", count: rejected, icon: <CloseIcon sx={{ color: "#c62828", fontSize: 22 }} />,             bg: "#fce4ec" },
        ].map(c => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Paper
              elevation={0}
              onClick={() => setFilter(prev => prev === c.label.toUpperCase() ? "ALL" : c.label.toUpperCase())}
              sx={{
                border: `1px solid ${filterStatus === c.label.toUpperCase() ? "#3b5bdb" : "#f1f3f5"}`,
                borderRadius: 2, p: 2.5,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer",
                bgcolor: filterStatus === c.label.toUpperCase() ? "#f0f3ff" : "#fff",
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>{c.label}</Typography>
                <Typography variant="h4" fontWeight={700}>{c.count}</Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {c.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* List */}
      <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {filterStatus === "ALL" ? "Tất cả báo cáo" : STATUS_META[filterStatus]?.label} ({displayed.length})
          </Typography>
          {filterStatus !== "ALL" && (
            <Typography
              variant="caption"
              sx={{ color: "#3b5bdb", cursor: "pointer" }}
              onClick={() => setFilter("ALL")}
            >
              Xem tất cả
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>
        ) : displayed.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Không có báo cáo nào.</Typography>
        ) : (
          displayed.map(r => (
            <ReportRow key={r.id} report={r} onStatusChange={handleStatusChange} />
          ))
        )}
      </Paper>
    </Box>
  );
}