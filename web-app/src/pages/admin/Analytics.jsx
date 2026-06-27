import { useState } from "react";
import {
  Box, Typography, Paper, Grid, Button, ButtonGroup, Tab, Tabs,
} from "@mui/material";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const GROWTH_DATA = {
  "7":  [
    { label: "T2", total: 280, new: 18 }, { label: "T3", total: 295, new: 22 },
    { label: "T4", total: 310, new: 15 }, { label: "T5", total: 330, new: 28 },
    { label: "T6", total: 358, new: 35 }, { label: "T7", total: 400, new: 42 },
    { label: "CN", total: 450, new: 50 },
  ],
  "30": [
    { label: "T1", total: 40, new: 12 },  { label: "T2", total: 80, new: 25 },
    { label: "T3", total: 150, new: 40 }, { label: "T4", total: 240, new: 55 },
    { label: "T5", total: 380, new: 72 }, { label: "T6", total: 600, new: 95 },
  ],
  "90": [
    { label: "T1", total: 40, new: 12 },  { label: "T2", total: 120, new: 45 },
    { label: "T3", total: 250, new: 80 }, { label: "T4", total: 420, new: 110 },
    { label: "T5", total: 640, new: 145 },{ label: "T6", total: 900, new: 185 },
  ],
};

const TRAFFIC_DATA = [
  { time: "00:00", visits: 120 }, { time: "04:00", visits: 80 },
  { time: "08:00", visits: 380 }, { time: "12:00", visits: 520 },
  { time: "14:00", visits: 480 }, { time: "16:00", visits: 420 },
  { time: "18:00", visits: 540 }, { time: "20:00", visits: 680 },
  { time: "23:59", visits: 310 },
];

const WEEKLY = [
  { day: "T2", views: 1200, users: 340, posts: 45 },
  { day: "T3", views: 1800, users: 420, posts: 62 },
  { day: "T4", views: 1500, users: 380, posts: 55 },
  { day: "T5", views: 2200, users: 510, posts: 78 },
  { day: "T6", views: 2800, users: 620, posts: 94 },
  { day: "T7", views: 3200, users: 720, posts: 112 },
  { day: "CN", views: 2100, users: 490, posts: 68 },
];

function StatCard({ label, value, icon, trend, iconBg, iconColor }) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
        <Typography variant="h4" fontWeight={700} mt={0.5} mb={0.5}>{value}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: 14, color: "#2e7d32" }} />
          <Typography variant="caption" sx={{ color: "#2e7d32", fontWeight: 500 }}>{trend}</Typography>
          <Typography variant="caption" color="text.secondary">so với kỳ trước</Typography>
        </Box>
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
    </Paper>
  );
}

export default function Analytics() {
  const [range, setRange] = useState("7");
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Analytics & Reports</Typography>
          <Typography variant="body2" color="text.secondary">Theo dõi và phân tích hoạt động của hệ thống</Typography>
        </Box>
        <ButtonGroup size="small" variant="outlined">
          {["7", "30", "90"].map(r => (
            <Button key={r} onClick={() => setRange(r)}
              variant={range === r ? "contained" : "outlined"}
              sx={{ fontSize: 12, px: 2, ...(range === r ? { bgcolor: "#1a1a2e", borderColor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d4e" } } : {}) }}>
              {r} ngày
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Tổng lượt truy cập" value="45,230" trend="+23%" iconBg="#e3f2fd"
            icon={<RemoveRedEyeIcon sx={{ color: "#1565c0", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Người dùng hoạt động" value="1,256" trend="+18%" iconBg="#e8f5e9"
            icon={<PeopleIcon sx={{ color: "#2e7d32", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Bài viết mới" value="892" trend="+31%" iconBg="#fce4ec"
            icon={<ArticleIcon sx={{ color: "#c2185b", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Thời gian trung bình" value="8m 32s" trend="+12%" iconBg="#fff3e0"
            icon={<AccessTimeIcon sx={{ color: "#e65100", fontSize: 22 }} />} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, "& .MuiTab-root": { fontSize: 13, textTransform: "none", minWidth: 80 } }}>
        <Tab label="Tổng quan" />
        <Tab label="Người dùng" />
        <Tab label="Nội dung" />
        <Tab label="Tương tác" />
      </Tabs>

      {/* Charts */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Tăng trưởng người dùng</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Số lượng người dùng theo tháng</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={GROWTH_DATA[range]}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b5bdb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ca678" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ca678" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={v => v === "total" ? "Tổng người dùng" : "Người dùng mới"} />
                <Area type="monotone" dataKey="total" stroke="#3b5bdb" fill="url(#totalGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="new"   stroke="#0ca678" fill="url(#newGrad)"   strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Lưu lượng truy cập</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Số lượng truy cập theo giờ trong ngày</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={TRAFFIC_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="visits" stroke="#7048e8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Weekly stats */}
      <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Thống kê hàng tuần</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={WEEKLY}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b5bdb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={v => ({ views: "Lượt xem", users: "Người dùng", posts: "Bài viết" })[v] || v} />
            <Area type="monotone" dataKey="views" stroke="#3b5bdb" fill="url(#viewsGrad)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="users" stroke="#0ca678" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="posts" stroke="#e64980" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
