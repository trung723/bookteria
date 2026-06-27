import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, IconButton,
  InputAdornment, TextField, Menu, MenuItem, CircularProgress, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getAllPosts, deletePostAdmin } from "../../services/adminService";

// Fallback mock data khi API chưa sẵn sàng
const MOCK_POSTS = [
  { id: "1", authorUsername: "john", authorAvatar: null, content: "📚 Tiếng gọi của hoang dã – Hành trình thức tỉnh bản năng hoang dã trong một chú chó giữa tuyết trắng Yukon. Tự do luôn có tiếng gọi.", hashtags: ["#CallOfTheWild", "#London"], likeCount: 24, commentCount: 5, createdDate: "2025-06-15" },
  { id: "2", authorUsername: "john", authorAvatar: null, content: "📖 Lược sử loài người – Một hành trình có đồng, sâu sắc qua hàng ngàn năm lịch sử nhân loại.", hashtags: ["#Sapiens", "#YuvalNoahHarari"], likeCount: 45, commentCount: 12, createdDate: "2025-06-15" },
  { id: "3", authorUsername: "james", authorAvatar: null, content: "☕ Sáng nay đi cafe view sông Hồng, không khí trong lành quá! Ai ở Hà Nội mà chưa thử thì phải đến ngay.", hashtags: ["#HaNoi", "#CafeView"], likeCount: 67, commentCount: 23, createdDate: "2025-06-14" },
  { id: "4", authorUsername: "sarah", authorAvatar: null, content: "🎨 Vừa hoàn thành bức tranh mới! Cảm hứng từ biển Mỹ Khê. Ai muốn xem ảnh thật thì inbox nhé.", hashtags: ["#Art", "#DaNang"], likeCount: 89, commentCount: 34, createdDate: "2025-06-13" },
  { id: "5", authorUsername: "michael", authorAvatar: null, content: "🍜 Review quán phở ngon nhất Cần Thơ mình từng ăn! Nước dùng đậm đà, thịt mềm, giá hợp lý.", hashtags: ["#Pho", "#CanTho"], likeCount: 156, commentCount: 45, createdDate: "2025-06-12" },
  { id: "6", authorUsername: "emily", authorAvatar: null, content: "🌊 Nha Trang đẹp quá trời! Biển xanh, cát trắng, nắng vàng. Perfect vacation!", hashtags: ["#NhaTrang", "#Beach"], likeCount: 234, commentCount: 67, createdDate: "2025-06-11" },
  { id: "7", authorUsername: "minhanh", authorAvatar: null, content: "🎓 Vừa tốt nghiệp Đại học Bách Khoa Hà Nội! Cảm ơn gia đình và bạn bè đã luôn đồng hành.", hashtags: ["#TotNghiep", "#HUST"], likeCount: 345, commentCount: 89, createdDate: "2025-06-10" },
  { id: "8", authorUsername: "hoanglong", authorAvatar: null, content: "💻 Chia sẻ kinh nghiệm phỏng vấn Software Engineer tại các công ty tech lớn ở Việt Nam.", hashtags: ["#PhongVan", "#Developer"], likeCount: 567, commentCount: 123, createdDate: "2025-06-09" },
];

function PostRow({ post, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  const initials = post.authorUsername?.[0]?.toUpperCase() || "?";
  const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
  const visibleTags = hashtags.slice(0, 2);
  const extraTags = hashtags.length - 2;

  return (
    <TableRow hover sx={{ "& td": { py: 1.2, borderColor: "#f1f3f5" } }}>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={post.authorAvatar} sx={{ width: 30, height: 30, fontSize: 12 }}>{initials}</Avatar>
          <Typography variant="body2" fontWeight={500} fontSize={13}>{post.authorUsername}</Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ maxWidth: 320 }}>
        <Typography variant="body2" fontSize={13} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {post.content}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap" }}>
          {visibleTags.map(tag => (
            <Chip key={tag} label={tag} size="small" sx={{ fontSize: 11, height: 20, bgcolor: "#e8f4fd", color: "#1565c0" }} />
          ))}
          {extraTags > 0 && <Chip label={`+${extraTags}`} size="small" sx={{ fontSize: 11, height: 20, bgcolor: "#f1f3f5", color: "#868e96" }} />}
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <FavoriteIcon sx={{ fontSize: 13, color: "#e03131" }} />
            <Typography variant="caption" fontWeight={500}>{post.likeCount || 0}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 13, color: "#868e96" }} />
            <Typography variant="caption" fontWeight={500}>{post.commentCount || 0}</Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {post.createdDate ? String(post.createdDate).slice(0, 10) : "—"}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem sx={{ fontSize: 13, color: "#e03131" }} onClick={() => { onDelete(post.id); setAnchor(null); }}>
            Xóa bài viết
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getAllPosts();
      const data = res.data?.result?.data || res.data?.result || [];
      const list = data.length > 0 ? data : MOCK_POSTS;
      setPosts(list); setFiltered(list);
    } catch {
      setPosts(MOCK_POSTS); setFiltered(MOCK_POSTS);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const q = keyword.toLowerCase();
    setFiltered(posts.filter(p =>
      p.authorUsername?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q)
    ));
  }, [keyword, posts]);

  const handleDelete = async (postId) => {
    try {
      await deletePostAdmin(postId);
      const updated = posts.filter(p => p.id !== postId);
      setPosts(updated); setFiltered(updated.filter(p =>
        p.authorUsername?.toLowerCase().includes(keyword.toLowerCase()) ||
        p.content?.toLowerCase().includes(keyword.toLowerCase())
      ));
    } catch { setError("Không thể xóa bài viết."); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Post Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Quản lý tất cả bài viết trong hệ thống</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">Danh sách bài viết ({filtered.length})</Typography>
        <TextField size="small" placeholder="Tìm kiếm bài viết..."
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
                {["Author", "Content", "Hashtags", "Engagement", "Date", ""].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", borderColor: "#f1f3f5" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">Không tìm thấy bài viết nào.</Typography>
                </TableCell></TableRow>
              ) : filtered.map(post => (
                <PostRow key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
}
