import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, IconButton,
  InputAdornment, TextField, Menu, MenuItem, CircularProgress, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getAllUsers, updateUserStatus } from "../../services/adminService";

function StatusChip({ status }) {
  const active = status === "ACTIVE" || status === "active";
  return (
    <Chip label={active ? "Active" : "Inactive"} size="small"
      sx={{ bgcolor: active ? "#e8f5e9" : "#fff8e1", color: active ? "#2e7d32" : "#f57f17", fontWeight: 600, fontSize: 11, height: 22 }} />
  );
}

function RoleChip({ role }) {
  const isAdmin = role === "ADMIN" || role === "admin";
  return (
    <Chip label={isAdmin ? "admin" : "user"} size="small"
      sx={{ bgcolor: isAdmin ? "#1a1a2e" : "#f1f3f5", color: isAdmin ? "#fff" : "#495057", fontWeight: 600, fontSize: 11, height: 22 }} />
  );
}

function UserRow({ user, onAction }) {
  const [anchor, setAnchor] = useState(null);
  const initials = [user.firstName, user.lastName].filter(Boolean).map(s => s[0]).join("").toUpperCase()
    || user.username?.[0]?.toUpperCase() || "?";
  const isActive = user.status === "ACTIVE" || user.status === "active";

  return (
    <TableRow hover sx={{ "& td": { py: 1.2, borderColor: "#f1f3f5" } }}>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={user.avatar} sx={{ width: 34, height: 34, fontSize: 12 }}>{initials}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500} fontSize={13}>{user.username}</Typography>
            <Typography variant="caption" color="text.secondary">{user.firstName} {user.lastName}</Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell><Typography variant="body2" color="text.secondary" fontSize={13}>{user.email || "—"}</Typography></TableCell>
      <TableCell><Typography variant="body2" color="text.secondary" fontSize={13}>{user.city || "—"}</Typography></TableCell>
      <TableCell><RoleChip role={user.roles?.[0] || user.role} /></TableCell>
      <TableCell><StatusChip status={user.status} /></TableCell>
      <TableCell><Typography variant="caption" color="text.secondary">{user.createdDate ? new Date(user.createdDate).toISOString().slice(0, 10) : "—"}</Typography></TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem sx={{ fontSize: 13 }} onClick={() => { onAction(isActive ? "INACTIVE" : "ACTIVE", user); setAnchor(null); }}>
            {isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      const data = res.data?.result || [];
      setUsers(data); setFiltered(data);
    } catch { setError("Không thể tải danh sách người dùng."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const q = keyword.toLowerCase();
    setFiltered(users.filter(u =>
      u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q)
    ));
  }, [keyword, users]);

  const handleAction = async (newStatus, user) => {
    try { await updateUserStatus(user.userId || user.id, newStatus); await fetchUsers(); }
    catch { setError("Thao tác thất bại."); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>User Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Quản lý tất cả người dùng trong hệ thống</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">Danh sách người dùng ({filtered.length})</Typography>
        <TextField size="small" placeholder="Tìm kiếm người dùng..."
          value={keyword} onChange={e => setKeyword(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 240, bgcolor: "#fff", borderRadius: 1 }} />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                {["User", "Email", "City", "Role", "Status", "Joined", ""].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", borderColor: "#f1f3f5" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">Không tìm thấy người dùng nào.</Typography>
                </TableCell></TableRow>
              ) : filtered.map(user => (
                <UserRow key={user.userId || user.id} user={user} onAction={handleAction} />
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
}
