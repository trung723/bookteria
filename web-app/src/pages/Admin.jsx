import { useEffect, useState } from "react";
import { getMyIdentity } from "../services/userService";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Avatar, Chip, IconButton, TextField,
  InputAdornment, CircularProgress, Alert, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, Menu, MenuItem, Divider, Badge, LinearProgress,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import MessageIcon from "@mui/icons-material/Message";
import FlagIcon from "@mui/icons-material/Flag";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { getMyInfo } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import httpClient from "../configurations/httpClient";
import { getToken } from "../services/localStorageService";

// ── colours ──────────────────────────────────────────────────
const SIDEBAR_BG   = "#1a1f2e";
const SIDEBAR_ITEM = "#252b3b";
const ACTIVE_BG    = "#2563eb";
const MAIN_BG      = "#f0f2f5";
const CARD_BG      = "#ffffff";
const BORDER       = "#e5e7eb";
const TEXT_MAIN    = "#111827";
const TEXT_SUB     = "#6b7280";

const authH = () => ({ Authorization: `Bearer ${getToken()}` });

// ── helpers ───────────────────────────────────────────────────
function StatCard({ label, value, sub, up, color }) {
  return (
    <Box sx={{
      background: CARD_BG, borderRadius: "12px", p: "20px 24px",
      flex: 1, border: `1px solid ${BORDER}`,
      borderTop: `3px solid ${color}`,
    }}>
      <Typography sx={{ fontSize: 12, color: TEXT_SUB, fontWeight: 600, textTransform: "uppercase", letterSpacing: .6, mb: .5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 800, color: TEXT_MAIN, lineHeight: 1.1 }}>{value}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: .5, mt: 1 }}>
        {up ? <TrendingUpIcon sx={{ fontSize: 14, color: "#16a34a" }} />
             : <TrendingDownIcon sx={{ fontSize: 14, color: "#dc2626" }} />}
        <Typography sx={{ fontSize: 11, color: up ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{sub}</Typography>
      </Box>
    </Box>
  );
}

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <Box onClick={onClick} sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      px: 2, py: 1.2, borderRadius: "8px", cursor: "pointer", mb: .5,
      background: active ? ACTIVE_BG : "transparent",
      "&:hover": { background: active ? ACTIVE_BG : SIDEBAR_ITEM },
      transition: "background .15s",
    }}>
      <Box sx={{ color: active ? "#fff" : "#9ca3af", display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? "#fff" : "#d1d5db", flex: 1 }}>
        {label}
      </Typography>
      {badge > 0 && (
        <Box sx={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "10px", px: 1, minWidth: 18, textAlign: "center" }}>
          {badge}
        </Box>
      )}
    </Box>
  );
}

const COLORS = ["#2563eb","#7c3aed","#db2777","#ea580c","#16a34a","#0891b2","#dc2626","#d97706"];

// ── Main component ─────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [page, setPage]       = useState("dashboard");
  const [users, setUsers]     = useState([]);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [snack, setSnack]     = useState({ open: false, msg: "", sev: "success" });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuUser, setMenuUser]     = useState(null);
  const [myInfo, setMyInfo]         = useState(null);

  // Auth check + load my info
  useEffect(() => {
  if (!isAuthenticated()) { navigate("/login"); return; }
  getMyIdentity().then(res => {
    const info = res.data.result;
    setMyInfo(info);
    const roles = info?.roles || [];
    if (!roles.some(r => r.name === "ADMIN")) navigate("/");
  }).catch(() => navigate("/login"));
}, [navigate]);

  // Load data when page changes
  useEffect(() => {
    if (page === "users") loadUsers();
    if (page === "posts") loadPosts();
  }, [page]);

  const loadUsers = () => {
    setLoading(true);
    httpClient.get("/identity/users", { headers: authH() })
      .then(r => setUsers(r.data.result || []))
      .catch(() => showSnack("Không tải được danh sách người dùng", "error"))
      .finally(() => setLoading(false));
  };

  const loadPosts = () => {
    setLoading(true);
    httpClient.get("/post/my-posts?page=1&size=50", { headers: authH() })
      .then(r => setPosts(r.data.result?.data || []))
      .catch(() => showSnack("Không tải được danh sách bài viết", "error"))
      .finally(() => setLoading(false));
  };

  const handleDeleteUser = (userId) => {
    setMenuAnchor(null);
    httpClient.delete(`/identity/users/${userId}`, { headers: authH() })
      .then(() => { setUsers(prev => prev.filter(u => u.id !== userId)); showSnack("Đã xóa người dùng"); })
      .catch(() => showSnack("Xóa thất bại", "error"));
  };

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── SIDEBAR ──────────────────────────────────────────────────
  const Sidebar = () => (
    <Box sx={{
      width: 220, minWidth: 220, background: SIDEBAR_BG,
      height: "100vh", position: "fixed", left: 0, top: 0,
      display: "flex", flexDirection: "column", p: 2, zIndex: 100,
    }}>
      {/* Logo */}
      <Box sx={{ mb: 3, px: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -.3 }}>
          📚 Bookteria
        </Typography>
        <Typography sx={{ fontSize: 10, color: "#6b7280", letterSpacing: 1.2, textTransform: "uppercase" }}>
          Administration Panel
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 10, color: "#4b5563", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", px: 1, mb: 1 }}>
        Menu
      </Typography>

      <NavItem icon={<DashboardIcon sx={{ fontSize: 18 }} />} label="Dashboard"  active={page === "dashboard"} onClick={() => setPage("dashboard")} />
      <NavItem icon={<BarChartIcon  sx={{ fontSize: 18 }} />} label="Analytics"  active={page === "analytics"} onClick={() => setPage("analytics")} />

      <Typography sx={{ fontSize: 10, color: "#4b5563", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", px: 1, mb: 1, mt: 2 }}>
        Quản lý
      </Typography>

      <NavItem icon={<PeopleIcon  sx={{ fontSize: 18 }} />} label="Users"    active={page === "users"}    onClick={() => setPage("users")} />
      <NavItem icon={<ArticleIcon sx={{ fontSize: 18 }} />} label="Posts"    active={page === "posts"}    onClick={() => setPage("posts")} />
      <NavItem icon={<MessageIcon sx={{ fontSize: 18 }} />} label="Messages" active={page === "messages"} onClick={() => setPage("messages")} />
      <NavItem icon={<FlagIcon    sx={{ fontSize: 18 }} />} label="Reports"  active={page === "reports"}  onClick={() => setPage("reports")} badge={3} />

      <Box sx={{ flex: 1 }} />

      <Divider sx={{ borderColor: "#252b3b", mb: 1.5 }} />
      <NavItem icon={<SettingsIcon sx={{ fontSize: 18 }} />} label="Settings" active={page === "settings"} onClick={() => setPage("settings")} />
      <Box onClick={() => { logOut(); navigate("/login"); }} sx={{
        display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.2,
        borderRadius: "8px", cursor: "pointer", "&:hover": { background: SIDEBAR_ITEM },
      }}>
        <LogoutIcon sx={{ fontSize: 18, color: "#ef4444" }} />
        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "#ef4444" }}>Đăng xuất</Typography>
      </Box>
    </Box>
  );

  // ── TOPBAR ────────────────────────────────────────────────────
  const Topbar = ({ title, sub }) => (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      mb: 3,
    }}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: TEXT_MAIN }}>{title}</Typography>
        {sub && <Typography sx={{ fontSize: 13, color: TEXT_SUB, mt: .3 }}>{sub}</Typography>}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton size="small" sx={{ border: `1px solid ${BORDER}`, background: CARD_BG }}>
          <Badge badgeContent={4} color="error">
            <NotificationsIcon sx={{ fontSize: 18 }} />
          </Badge>
        </IconButton>
        <Avatar sx={{ width: 34, height: 34, bgcolor: ACTIVE_BG, fontSize: 13, fontWeight: 700 }}>
          {myInfo?.username?.[0]?.toUpperCase() || "A"}
        </Avatar>
      </Box>
    </Box>
  );

  // ── DASHBOARD PAGE ─────────────────────────────────────────────
  const DashboardPage = () => (
    <>
      <Topbar title="Dashboard" sub="Tổng quan hệ thống Bookteria" />

      {/* Stat cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <StatCard label="Total Users"      value={users.length || "—"} sub="+12% tuần trước" up color="#2563eb" />
        <StatCard label="Active Users"     value={users.filter(u => u.emailVerified).length || "—"} sub="+8% tuần trước" up color="#7c3aed" />
        <StatCard label="Total Posts"      value={posts.length || "—"} sub="+23% tuần trước" up color="#16a34a" />
        <StatCard label="Reported Content" value="3" sub="-5% tuần trước" up={false} color="#ef4444" />
      </Box>

      {/* Two panels */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
        {/* Recent users */}
        <Box sx={{ background: CARD_BG, borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT_MAIN }}>Người dùng mới đăng ký</Typography>
            <Typography onClick={() => setPage("users")} sx={{ fontSize: 12, color: ACTIVE_BG, cursor: "pointer", fontWeight: 600 }}>Xem tất cả</Typography>
          </Box>
          {users.slice(0, 4).map((u, i) => (
            <Box key={u.id} sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.5, borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS[i % COLORS.length], fontSize: 12, fontWeight: 700 }}>
                {u.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT_MAIN }}>{u.username}</Typography>
                <Typography sx={{ fontSize: 11, color: TEXT_SUB }}>{u.email || "—"}</Typography>
              </Box>
              <Chip label={u.emailVerified ? "active" : "inactive"}
                size="small"
                sx={{ fontSize: 10, height: 20, fontWeight: 600,
                  background: u.emailVerified ? "#dcfce7" : "#fee2e2",
                  color: u.emailVerified ? "#16a34a" : "#dc2626" }} />
            </Box>
          ))}
          {users.length === 0 && (
            <Typography sx={{ p: 3, color: TEXT_SUB, fontSize: 13, textAlign: "center" }}>
              Nhấn vào Users để tải dữ liệu
            </Typography>
          )}
        </Box>

        {/* System timeline */}
        <Box sx={{ background: CARD_BG, borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}` }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT_MAIN }}>Timeline sự kiện hệ thống</Typography>
          </Box>
          {[
            { time: "Vừa xong", event: "Admin đăng nhập hệ thống", color: "#2563eb" },
            { time: "2 phút trước", event: "Người dùng mới đăng ký", color: "#16a34a" },
            { time: "15 phút trước", event: "Bài viết bị báo cáo", color: "#ef4444" },
            { time: "1 giờ trước", event: "Hệ thống backup tự động", color: "#7c3aed" },
          ].map((ev, i) => (
            <Box key={i} sx={{ px: 2.5, py: 1.5, display: "flex", gap: 1.5, alignItems: "flex-start", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ev.color, mt: .6, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: TEXT_MAIN }}>{ev.event}</Typography>
                <Typography sx={{ fontSize: 11, color: TEXT_SUB }}>{ev.time}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Recent posts panel */}
      <Box sx={{ background: CARD_BG, borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT_MAIN }}>Bài viết gần đây trong hệ thống</Typography>
          <Typography onClick={() => setPage("posts")} sx={{ fontSize: 12, color: ACTIVE_BG, cursor: "pointer", fontWeight: 600 }}>Xem tất cả</Typography>
        </Box>
        {posts.slice(0, 3).map((p, i) => (
          <Box key={p.id} sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.5, borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}>
            <ArticleIcon sx={{ fontSize: 18, color: TEXT_SUB }} />
            <Typography sx={{ fontSize: 13, flex: 1, color: TEXT_MAIN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.content}
            </Typography>
            <Typography sx={{ fontSize: 11, color: TEXT_SUB, flexShrink: 0 }}>{p.created}</Typography>
          </Box>
        ))}
        {posts.length === 0 && (
          <Typography sx={{ p: 3, color: TEXT_SUB, fontSize: 13, textAlign: "center" }}>
            Nhấn vào Posts để tải dữ liệu
          </Typography>
        )}
      </Box>
    </>
  );

  // ── USERS PAGE ─────────────────────────────────────────────────
  const UsersPage = () => (
    <>
      <Topbar title="User Management" sub="Quản lý tất cả người dùng trong hệ thống" />

      <Box sx={{ background: CARD_BG, borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {/* Table header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT_MAIN }}>
            Danh sách người dùng ({filteredUsers.length})
          </Typography>
          <TextField
            size="small" placeholder="Tìm kiếm người dùng..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: TEXT_SUB }} /></InputAdornment> }}
            sx={{ width: 240, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13 } }}
          />
        </Box>

        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}><CircularProgress size={28} /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f9fafb" }}>
                {["User", "Email", "City", "Role", "Status", "Joined", ""].map(h => (
                  <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: TEXT_SUB, textTransform: "uppercase", letterSpacing: .6, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u, i) => (
                <TableRow key={u.id} hover sx={{ "&:hover": { background: "#f9fafb" } }}>
                  <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS[i % COLORS.length], fontSize: 12, fontWeight: 700 }}>
                        {u.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT_MAIN }}>{u.username}</Typography>
                        <Typography sx={{ fontSize: 11, color: TEXT_SUB }}>{u.firstName} {u.lastName}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: TEXT_SUB, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>{u.email || "—"}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: TEXT_MAIN, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>{u.city || "—"}</TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    {u.roles?.some(r => r.name === "ADMIN")
                      ? <Chip label="admin" size="small" sx={{ fontSize: 10, height: 20, fontWeight: 700, background: TEXT_MAIN, color: "#fff" }} />
                      : <Typography sx={{ fontSize: 12, color: TEXT_SUB }}>user</Typography>
                    }
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    <Chip label={u.emailVerified ? "Active" : "Inactive"} size="small"
                      sx={{ fontSize: 11, height: 22, fontWeight: 600,
                        background: u.emailVerified ? "#dcfce7" : "#fee2e2",
                        color: u.emailVerified ? "#16a34a" : "#dc2626" }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: TEXT_SUB, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    <IconButton size="small" onClick={e => { setMenuAnchor(e.currentTarget); setMenuUser(u); }}>
                      <MoreHorizIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,.12)", minWidth: 160 } }}>
        <MenuItem sx={{ fontSize: 13 }} onClick={() => setMenuAnchor(null)}>Xem chi tiết</MenuItem>
        <MenuItem sx={{ fontSize: 13 }} onClick={() => setMenuAnchor(null)}>Chỉnh sửa</MenuItem>
        <Divider />
        <MenuItem sx={{ fontSize: 13, color: "#dc2626" }}
          onClick={() => menuUser && !menuUser.roles?.some(r => r.name === "ADMIN") && handleDeleteUser(menuUser.id)}>
          {menuUser?.roles?.some(r => r.name === "ADMIN") ? "Không thể xóa admin" : "Xóa người dùng"}
        </MenuItem>
      </Menu>
    </>
  );

  // ── POSTS PAGE ─────────────────────────────────────────────────
  const PostsPage = () => (
    <>
      <Topbar title="Post Management" sub="Kiểm duyệt nội dung bài viết" />
      <Box sx={{ background: CARD_BG, borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT_MAIN }}>
            Danh sách bài viết ({posts.length})
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}><CircularProgress size={28} /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f9fafb" }}>
                {["Nội dung", "Tác giả", "Lượt thích", "Bình luận", "Thời gian", ""].map(h => (
                  <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: TEXT_SUB, textTransform: "uppercase", letterSpacing: .6, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((p, i) => (
                <TableRow key={p.id} hover sx={{ "&:hover": { background: "#f9fafb" } }}>
                  <TableCell sx={{ py: 1.5, maxWidth: 320, borderBottom: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: 13, color: TEXT_MAIN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.content}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: TEXT_SUB, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>{p.username || p.userId}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: TEXT_MAIN, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>♥ {p.likeCount || 0}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: TEXT_MAIN, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>💬 {p.comments?.length || 0}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: TEXT_SUB, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>{p.created}</TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                    <IconButton size="small"><MoreHorizIcon sx={{ fontSize: 18 }} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </>
  );

  // ── PLACEHOLDER ────────────────────────────────────────────────
  const Placeholder = ({ title }) => (
    <>
      <Topbar title={title} />
      <Box sx={{ background: CARD_BG, borderRadius: "12px", border: `1px solid ${BORDER}`, p: 6, textAlign: "center" }}>
        <Typography sx={{ fontSize: 15, color: TEXT_SUB }}>Tính năng đang phát triển...</Typography>
      </Box>
    </>
  );

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: MAIN_BG }}>
      <Sidebar />

      {/* Main content */}
      <Box sx={{ flex: 1, ml: "220px", p: "28px 32px", maxWidth: "calc(100vw - 220px)", overflowX: "auto" }}>
        {page === "dashboard" && <DashboardPage />}
        {page === "users"     && <UsersPage />}
        {page === "posts"     && <PostsPage />}
        {page === "analytics" && <Placeholder title="Analytics" />}
        {page === "messages"  && <Placeholder title="Messages" />}
        {page === "reports"   && <Placeholder title="Reports" />}
        {page === "settings"  && <Placeholder title="Settings" />}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snack.sev} sx={{ borderRadius: "10px" }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}