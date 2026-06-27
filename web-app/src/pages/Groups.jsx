import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, CardMedia, Typography, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab,
  Chip, Avatar, IconButton, Menu, MenuItem, Snackbar, Alert, Divider,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Scene from "./Scene";
import { isAuthenticated } from "../services/authenticationService";

// ── localStorage helpers ──────────────────────────────────
const STORAGE_KEY = "bookteria_groups";

const loadGroups = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getDefaultGroups(); }
  catch { return getDefaultGroups(); }
};

const saveGroups = (groups) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));

const getDefaultGroups = () => {
  const defaults = [
    {
      id: "g1", name: "Developers Vietnam", description: "Cộng đồng lập trình viên Việt Nam",
      coverColor: "#1565C0", avatar: "D", memberCount: 4, joined: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "g2", name: "Book Club Saigon", description: "Câu lạc bộ yêu sách Sài Gòn",
      coverColor: "#2E7D32", avatar: "B", memberCount: 3, joined: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "g3", name: "UI/UX Design Vietnam", description: "Chia sẻ kinh nghiệm thiết kế giao diện",
      coverColor: "#6A1B9A", avatar: "U", memberCount: 12, joined: false,
      createdAt: new Date().toISOString(),
    },
  ];
  saveGroups(defaults);
  return defaults;
};

// ── GroupCard component ───────────────────────────────────
function GroupCard({ group, onJoin, onLeave, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2, overflow: "hidden", height: "100%" }}>
      {/* Cover */}
      <Box sx={{ height: 80, bgcolor: group.coverColor || "#1976D2", position: "relative" }}>
        <Avatar sx={{
          width: 52, height: 52, bgcolor: "white", color: group.coverColor || "#1976D2",
          fontWeight: 700, fontSize: 22, border: "3px solid white",
          position: "absolute", bottom: -20, left: 16,
        }}>
          {group.avatar || group.name[0]}
        </Avatar>
        <IconButton size="small" sx={{ position: "absolute", top: 6, right: 6, color: "white" }}
          onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {group.joined
            ? <MenuItem onClick={() => { onLeave(group.id); setAnchorEl(null); }} sx={{ color: "error.main" }}>
                <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} /> Rời nhóm
              </MenuItem>
            : <MenuItem onClick={() => { onJoin(group.id); setAnchorEl(null); }}>
                <PersonAddIcon fontSize="small" sx={{ mr: 1 }} /> Tham gia
              </MenuItem>
          }
          <MenuItem onClick={() => { onDelete(group.id); setAnchorEl(null); }} sx={{ color: "error.main" }}>
            Xóa nhóm
          </MenuItem>
        </Menu>
      </Box>

      <CardContent sx={{ pt: 3.5 }}>
        <Typography fontWeight={700} fontSize={15} noWrap>{group.name}</Typography>
        <Typography fontSize={12} color="text.secondary" sx={{
          mt: 0.5, mb: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36,
        }}>
          {group.description}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
          <GroupsIcon fontSize="small" color="action" />
          <Typography fontSize={12} color="text.secondary">{group.memberCount} thành viên</Typography>
        </Box>
        <Button fullWidth size="small"
          variant={group.joined ? "outlined" : "contained"}
          color={group.joined ? "error" : "primary"}
          startIcon={group.joined ? <ExitToAppIcon /> : <PersonAddIcon />}
          onClick={() => group.joined ? onLeave(group.id) : onJoin(group.id)}>
          {group.joined ? "Rời nhóm" : "Tham gia"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main Groups page ──────────────────────────────────────
export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [form, setForm] = useState({ name: "", description: "", coverColor: "#1976D2" });

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    setGroups(loadGroups());
  }, [navigate]);

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const handleJoin = (id) => {
    const updated = groups.map(g => g.id === id
      ? { ...g, joined: true, memberCount: g.memberCount + 1 } : g);
    setGroups(updated); saveGroups(updated);
    showSnack(`Đã tham gia nhóm!`);
  };

  const handleLeave = (id) => {
    const updated = groups.map(g => g.id === id
      ? { ...g, joined: false, memberCount: Math.max(0, g.memberCount - 1) } : g);
    setGroups(updated); saveGroups(updated);
    showSnack("Đã rời nhóm.", "info");
  };

  const handleDelete = (id) => {
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated); saveGroups(updated);
    showSnack("Đã xóa nhóm.", "warning");
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const newGroup = {
      id: `g${Date.now()}`, name: form.name.trim(),
      description: form.description.trim() || "Không có mô tả",
      coverColor: form.coverColor, avatar: form.name[0].toUpperCase(),
      memberCount: 1, joined: true, createdAt: new Date().toISOString(),
    };
    const updated = [newGroup, ...groups];
    setGroups(updated); saveGroups(updated);
    setDialogOpen(false);
    setForm({ name: "", description: "", coverColor: "#1976D2" });
    showSnack(`Đã tạo nhóm "${newGroup.name}"!`);
  };

  const myGroups = groups.filter(g => g.joined &&
    g.name.toLowerCase().includes(search.toLowerCase()));
  const discoverGroups = groups.filter(g => !g.joined &&
    g.name.toLowerCase().includes(search.toLowerCase()));

  const COLORS = ["#1565C0","#2E7D32","#6A1B9A","#C62828","#E65100","#00695C","#4527A0"];

  return (
    <Scene>
      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ mt: "64px" }}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>

      <Box sx={{ width: "100%", maxWidth: 860, mt: "20px", px: 1 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Nhóm</Typography>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}>
            Tạo nhóm mới
          </Button>
        </Box>

        {/* Search */}
        <TextField fullWidth size="small" placeholder="Tìm kiếm nhóm..."
          value={search} onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tab label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Nhóm của tôi
              <Chip label={myGroups.length} size="small" />
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Khám phá
              <Chip label={discoverGroups.length} size="small" />
            </Box>
          } />
        </Tabs>

        {/* Grid */}
        {tab === 0 && (
          myGroups.length === 0
            ? <Typography color="text.secondary" textAlign="center" py={6}>
                Bạn chưa tham gia nhóm nào. Khám phá và tham gia ngay!
              </Typography>
            : <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
                {myGroups.map(g => (
                  <GroupCard key={g.id} group={g}
                    onJoin={handleJoin} onLeave={handleLeave} onDelete={handleDelete} />
                ))}
              </Box>
        )}

        {tab === 1 && (
          discoverGroups.length === 0
            ? <Typography color="text.secondary" textAlign="center" py={6}>
                {search ? "Không tìm thấy nhóm nào." : "Không có nhóm mới để khám phá."}
              </Typography>
            : <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
                {discoverGroups.map(g => (
                  <GroupCard key={g.id} group={g}
                    onJoin={handleJoin} onLeave={handleLeave} onDelete={handleDelete} />
                ))}
              </Box>
        )}
      </Box>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Tạo nhóm mới</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField label="Tên nhóm *" fullWidth value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            inputProps={{ maxLength: 60 }} />
          <TextField label="Mô tả nhóm" fullWidth multiline rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Nhóm này về chủ đề gì?" />
          <Box>
            <Typography fontSize={13} color="text.secondary" mb={1}>Màu bìa</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <Box key={c} onClick={() => setForm(f => ({ ...f, coverColor: c }))}
                  sx={{
                    width: 32, height: 32, borderRadius: "50%", bgcolor: c,
                    cursor: "pointer", border: form.coverColor === c ? "3px solid #000" : "3px solid transparent",
                    transition: "border 0.15s",
                  }} />
              ))}
            </Box>
          </Box>
          {/* Preview */}
          <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ height: 60, bgcolor: form.coverColor, position: "relative" }}>
              <Avatar sx={{
                width: 44, height: 44, bgcolor: "white", color: form.coverColor,
                fontWeight: 700, fontSize: 18, border: "3px solid white",
                position: "absolute", bottom: -16, left: 12,
              }}>
                {form.name[0]?.toUpperCase() || "?"}
              </Avatar>
            </Box>
            <Box sx={{ pt: 3, px: 2, pb: 1.5 }}>
              <Typography fontWeight={700} fontSize={14}>{form.name || "Tên nhóm"}</Typography>
              <Typography fontSize={12} color="text.secondary">{form.description || "Mô tả nhóm"}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.name.trim()}>
            Tạo nhóm
          </Button>
        </DialogActions>
      </Dialog>
    </Scene>
  );
}