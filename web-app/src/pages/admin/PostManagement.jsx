import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, IconButton,
  InputAdornment, TextField, Menu, MenuItem, CircularProgress,
  Alert, Pagination, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button,
} from "@mui/material";
import SearchIcon          from "@mui/icons-material/Search";
import FavoriteIcon        from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreVertIcon        from "@mui/icons-material/MoreVert";
import OpenInNewIcon       from "@mui/icons-material/OpenInNew";
import { getAllPosts, deletePostAdmin } from "../../services/adminService";

// PostResponse: { id, content, userId, username, userAvatar, created,
//                 createdDate, modifiedDate, likeCount, likedByMe, comments }

function PostRow({ post, onDelete }) {
  const [anchor,      setAnchor]      = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(null);
  const [detailOpen,  setDetailOpen]  = useState(false);

  const initials  = post.username?.[0]?.toUpperCase() || "?";
  const dateStr   = post.createdDate
    ? new Date(post.createdDate).toISOString().slice(0, 10)
    : post.created || "—";

  return (
    <>
      <TableRow hover sx={{ "& td": { py: 1.2, borderColor: "#f1f3f5" } }}>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar src={post.userAvatar} sx={{ width: 30, height: 30, fontSize: 12 }}>{initials}</Avatar>
            <Typography variant="body2" fontWeight={500} fontSize={13}>{post.username}</Typography>
          </Box>
        </TableCell>

        <TableCell sx={{ maxWidth: 320 }}>
          <Tooltip title={post.content} placement="top-start" arrow>
            <Typography
              variant="body2"
              fontSize={13}
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
              onClick={() => setDetailOpen(true)}
            >
              {post.content}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FavoriteIcon sx={{ fontSize: 13, color: "#e03131" }} />
              <Typography variant="caption" fontWeight={500}>{post.likeCount ?? 0}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 13, color: "#868e96" }} />
              <Typography variant="caption" fontWeight={500}>{post.comments?.length ?? 0}</Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Typography variant="caption" color="text.secondary">{dateStr}</Typography>
        </TableCell>

        <TableCell align="right">
          <IconButton size="small" onClick={() => setDetailOpen(true)} title="View details">
            <OpenInNewIcon fontSize="small" sx={{ color: "#868e96" }} />
          </IconButton>
          <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem
              sx={{ fontSize: 13, color: "#e03131" }}
              onClick={() => { setConfirmOpen(true); setAnchor(null); }}
            >
              Delete Post
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      {/* Confirm delete */}
      <Dialog open={Boolean(confirmOpen)} onClose={() => setConfirmOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this post by <b>{post.username}</b>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} size="small">Cancel</Button>
          <Button onClick={() => { onDelete(post.id); setConfirmOpen(false); }} color="error" variant="contained" size="small">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 600 }}>Post Details</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar src={post.userAvatar} sx={{ width: 36, height: 36 }}>{initials}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>{post.username}</Typography>
              <Typography variant="caption" color="text.secondary">{dateStr}</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>{post.content}</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FavoriteIcon sx={{ fontSize: 15, color: "#e03131" }} />
              <Typography variant="caption">{post.likeCount ?? 0} likes</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 15, color: "#868e96" }} />
              <Typography variant="caption">{post.comments?.length ?? 0} comments</Typography>
            </Box>
          </Box>
          {post.comments?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
                COMMENTS
              </Typography>
              {post.comments.map((c, i) => (
                <Box key={i} sx={{ mb: 1, pl: 1, borderLeft: "2px solid #f1f3f5" }}>
                  <Typography variant="caption" fontWeight={600}>{c.username || c.userId}: </Typography>
                  <Typography variant="caption" color="text.secondary">{c.content}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} size="small">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const PAGE_SIZE = 10;

export default function PostManagement() {
  const [posts,    setPosts]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [keyword,  setKeyword]  = useState("");
  const [page,     setPage]     = useState(1);
  const [apiPage,  setApiPage]  = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchPosts = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      // Backend uses /post/feed (there is no /post/admin/posts)
      const res  = await getAllPosts(p, 20);
      const data = res.data?.result?.data ?? res.data?.result ?? [];
      setPosts(prev => p === 1 ? data : [...prev, ...data]);
    } catch {
      setError("Failed to load posts list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  useEffect(() => {
    const q = keyword.toLowerCase();
    const result = posts.filter(p =>
      p.username?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q)
    );
    setFiltered(result);
    setPage(1);
  }, [keyword, posts]);

  const handleDelete = async (postId) => {
    try {
      await deletePostAdmin(postId);
      const updated = posts.filter(p => p.id !== postId);
      setPosts(updated);
    } catch {
      setError("Failed to delete post. Check permissions or try again.");
    }
  };

  // Pagination of the filtered list
  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedPosts   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Post Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage all posts in the system
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Post list ({filtered.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Search by author or content..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
          sx={{ width: 280, bgcolor: "#fff", borderRadius: 1 }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2 }}>
        {loading && posts.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                {["Author", "Content", "Engagement", "Date", ""].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", borderColor: "#f1f3f5" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">No posts found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedPosts.map(post => (
                  <PostRow key={post.id} post={post} onDelete={handleDelete} />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}