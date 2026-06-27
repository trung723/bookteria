import { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Avatar, Chip, IconButton, CircularProgress,
  Alert, Divider, Grid,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getAllReports, updateReportStatus } from "../../services/adminService";

const MOCK_REPORTS = [
  { id: "1", reporterUsername: "sarah",   targetType: "Post",    reason: "Spam",                   description: "Bài viết quảng cáo không phù hợp", createdDate: "2025-06-20", status: "PENDING" },
  { id: "2", reporterUsername: "michael", targetType: "User",    reason: "Harassment",             description: "Người dùng có hành vi quấy rối trong tin nhắn", createdDate: "2025-06-19", status: "PENDING" },
  { id: "3", reporterUsername: "john",    targetType: "Post",    reason: "Inappropriate Content",  description: "Nội dung không phù hợp với cộng đồng", createdDate: "2025-06-18", status: "RESOLVED" },
  { id: "4", reporterUsername: "james",   targetType: "Message", reason: "Spam",                   description: "Tin nhắn spam liên tục", createdDate: "2025-06-17", status: "REJECTED" },
  { id: "5", reporterUsername: "sarah",   targetType: "User",    reason: "Fake Account",           description: "Tài khoản giả mạo người khác", createdDate: "2025-06-16", status: "PENDING" },
];

const STATUS_META = {
  PENDING:  { label: "Pending",  color: "#fff8e1", textColor: "#f57f17" },
  RESOLVED: { label: "Resolved", color: "#e8f5e9", textColor: "#2e7d32" },
  REJECTED: { label: "Rejected", color: "#fce4ec", textColor: "#c62828" },
};

const TARGET_META = {
  Post:    { color: "#e3f2fd", textColor: "#1565c0" },
  User:    { color: "#f3e5f5", textColor: "#7b1fa2" },
  Message: { color: "#fff3e0", textColor: "#e65100" },
};

function ReportRow({ report, onAction }) {
  const status = STATUS_META[report.status] || STATUS_META.PENDING;
  const target = TARGET_META[report.targetType] || { color: "#f1f3f5", textColor: "#495057" };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 2 }}>
        <Avatar sx={{ width: 36, height: 36, fontSize: 13 }}>{report.reporterUsername?.[0]?.toUpperCase()}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600} fontSize={13}>{report.reporterUsername}</Typography>
            <Typography variant="caption" color="text.secondary">reported</Typography>
            <Chip label={report.targetType} size="small"
              sx={{ bgcolor: target.color, color: target.textColor, fontSize: 11, height: 18, fontWeight: 600 }} />
          </Box>
          <Typography variant="body2" fontWeight={500} mb={0.3}>{report.reason}: {report.description}</Typography>
          <Typography variant="caption" color="text.secondary">{String(report.createdDate).slice(0, 10)}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label={status.label} size="small"
            sx={{ bgcolor: status.color, color: status.textColor, fontWeight: 600, fontSize: 11, height: 22 }} />
          <IconButton size="small" title="Xem chi tiết"><VisibilityIcon fontSize="small" sx={{ color: "#868e96" }} /></IconButton>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "#f1f3f5" }} />
    </Box>
  );
}

export default function ReportsManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllReports();
      const data = res.data?.result || [];
      setReports(data.length > 0 ? data : MOCK_REPORTS);
    } catch {
      setReports(MOCK_REPORTS);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const pending  = reports.filter(r => r.status === "PENDING").length;
  const resolved = reports.filter(r => r.status === "RESOLVED").length;
  const rejected = reports.filter(r => r.status === "REJECTED").length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Reports Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Quản lý các báo cáo từ người dùng</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Summary cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Pending",  count: pending,  icon: <FlagIcon sx={{ color: "#f57f17", fontSize: 22 }} />,             bg: "#fff8e1" },
          { label: "Resolved", count: resolved, icon: <CheckCircleOutlineIcon sx={{ color: "#2e7d32", fontSize: 22 }} />, bg: "#e8f5e9" },
          { label: "Rejected", count: rejected, icon: <CloseIcon sx={{ color: "#c62828", fontSize: 22 }} />,             bg: "#fce4ec" },
        ].map(c => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

      {/* Reports list */}
      <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>Tất cả báo cáo ({reports.length})</Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>
        ) : reports.map(r => (
          <ReportRow key={r.id} report={r} onAction={() => {}} />
        ))}
      </Paper>
    </Box>
  );
}
