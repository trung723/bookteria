import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, IconButton,
  InputAdornment, TextField, Menu, MenuItem, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import SearchIcon   from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getAllUsers, getAllProfiles, deleteUser } from "../../services/adminService";

// UserResponse (identity): { id, username, email, emailVerified, roles:[{name}] }
// UserProfileResponse (profile): { id, userId, username, avatar, firstName, lastName, dob, city, followerCount, followingCount }

function RoleChip({ roles = [] }) {
  const isAdmin = roles.some(r => r.name === "ADMIN");
  return (
    <Chip
      label={isAdmin ? "admin" : "user"}
      size="small"
      sx={{ bgcolor: isAdmin ? "#1a1a2e" : "#f1f3f5", color: isAdmin ? "#fff" : "#495057", fontWeight: 600, fontSize: 11, height: 22 }}
    />
  );
}

function VerifiedChip({ verified }) {
  return (
    <Chip
      label={verified ? "Verified" : "Unverified"}
      size="small"
      sx={{
        bgcolor: verified ? "#e8f5e9" : "#fff8e1",
        color:   verified ? "#2e7d32" : "#f57f17",
        fontWeight: 600, fontSize: 11, height: 22,
      }}
    />
  );
}

function UserRow({ user, onDelete }) {
  const [anchor, setAnchor]       = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const initials = [user.firstName, user.lastName].filter(Boolean).map(s => s[0]).join("").toUpperCase()
    || user.username?.[0]?.toUpperCase() || "?";

  return (
    <>
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
        <TableCell>
          <Typography variant="body2" color="text.secondary" fontSize={13}>{user.email || "—"}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary" fontSize={13}>{user.city || "—"}</Typography>
        </TableCell>
        <TableCell>
          <RoleChip roles={user.roles} />
        </TableCell>
        <TableCell>
          <VerifiedChip verified={user.emailVerified} />
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {user.followerCount ?? "—"} followers
          </Typography>
        </TableCell>
        <TableCell align="right">
          <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem
              sx={{ fontSize: 13, color: "#e03131" }}
              onClick={() => { setConfirmOpen(true); setAnchor(null); }}
            >
              Xóa người dùng
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Bạn có chắc muốn xóa tài khoản <b>{user.username}</b>? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} size="small">Hủy</Button>
          <Button
            onClick={() => { onDelete(user.id); setConfirmOpen(false); }}
            color="error" variant="contained" size="small"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function UserManagement() {
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [keyword,  setKeyword]  = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi song song identity users + profile để merge dữ liệu đầy đủ
      const [usersRes, profilesRes] = await Promise.allSettled([
        getAllUsers(),
        getAllProfiles(),
      ]);

      const identityUsers = usersRes.status    === "fulfilled" ? (usersRes.value.data?.result    ?? []) : [];
      const profiles      = profilesRes.status === "fulfilled" ? (profilesRes.value.data?.result ?? []) : [];

      // Merge: identity user + profile bằng userId
      const merged = identityUsers.map(u => {
        const profile = profiles.find(p => p.userId === u.id) ?? {};
        return { ...u, ...profile, id: u.id }; // giữ id từ identity
      });

      setUsers(merged);
      setFiltered(merged);
    } catch {
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const q = keyword.toLowerCase();
    setFiltered(
      users.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)    ||
        u.firstName?.toLowerCase().includes(q)||
        u.lastName?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
      )
    );
  }, [keyword, users]);

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      const updated = users.filter(u => u.id !== userId);
      setUsers(updated);
    } catch {
      setError("Không thể xóa người dùng. Có thể cần quyền ADMIN.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>User Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Quản lý tất cả người dùng trong hệ thống
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Danh sách người dùng ({filtered.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Tìm theo username, email, tên, thành phố..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
          }}
          sx={{ width: 300, bgcolor: "#fff", borderRadius: 1 }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                {["User", "Email", "City", "Role", "Email Status", "Followers", ""].map(h => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", borderColor: "#f1f3f5" }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      Không tìm thấy người dùng nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(user => (
                  <UserRow key={user.id} user={user} onDelete={handleDelete} />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
}