import { forwardRef, useState } from "react";
import {
  Box, Typography, Avatar, IconButton, TextField, Button,
  Collapse, Divider, Menu, MenuItem, Popover, List, ListItem,
  ListItemIcon, ListItemText, Snackbar, Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { likePost, addComment, deleteComment, deletePost } from "../services/postService";

const Post = forwardRef(({ post: initialPost, onDeleted }, ref) => {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleLike = async () => {
    try {
      const res = await likePost(post.id);
      setPost(res.data.result);
    } catch (e) { console.error(e); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await addComment(post.id, commentText);
      setPost(res.data.result);
      setCommentText("");
    } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(post.id, commentId);
      setPost(p => ({ ...p, comments: p.comments.filter(c => c.id !== commentId) }));
    } catch (e) { console.error(e); }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      onDeleted && onDeleted(post.id);
    } catch (e) {
      console.error(e);
    }
    setAnchorEl(null);
  };

  const postUrl = `${window.location.origin}/post/${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setSnackbar({ open: true, message: "Đã sao chép liên kết!" });
    });
    setShareAnchorEl(null);
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      "_blank",
      "width=600,height=400"
    );
    setShareAnchorEl(null);
  };

  const handleShareTwitter = () => {
    const text = post.content?.slice(0, 100) || "";
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "width=600,height=400"
    );
    setShareAnchorEl(null);
  };

  return (
    <Box ref={ref} sx={{ width: "100%", mb: 1 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Avatar src={post.userAvatar} sx={{ width: 36, height: 36 }} />
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={600} fontSize={14}>{post.username || post.userId}</Typography>
          <Typography fontSize={11} color="text.secondary">{post.created}</Typography>
        </Box>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleDeletePost} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa bài viết
          </MenuItem>
        </Menu>
      </Box>

      {/* Content */}
      <Typography fontSize={14} sx={{ mb: 1, whiteSpace: "pre-wrap" }}>{post.content}</Typography>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Like */}
        <IconButton size="small" onClick={handleLike} color={post.likedByMe ? "error" : "default"}>
          {post.likedByMe ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
        <Typography fontSize={13} color="text.secondary">{post.likeCount || 0}</Typography>

        {/* Comment */}
        <IconButton size="small" onClick={() => setShowComments(v => !v)}>
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
        <Typography fontSize={13} color="text.secondary">{post.comments?.length || 0}</Typography>

        {/* Share */}
        <IconButton size="small" onClick={(e) => setShareAnchorEl(e.currentTarget)}>
          <ShareIcon fontSize="small" />
        </IconButton>
        <Typography fontSize={13} color="text.secondary">Share</Typography>

        <Popover
          open={Boolean(shareAnchorEl)}
          anchorEl={shareAnchorEl}
          onClose={() => setShareAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{ sx: { borderRadius: 2, boxShadow: 3, minWidth: 200 } }}
        >
          <List dense disablePadding>
            <ListItem
              button
              onClick={handleCopyLink}
              sx={{ px: 2, py: 1, "&:hover": { bgcolor: "grey.100" }, cursor: "pointer" }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LinkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sao chép liên kết" primaryTypographyProps={{ fontSize: 14 }} />
            </ListItem>
            <Divider />
            <ListItem
              button
              onClick={handleShareFacebook}
              sx={{ px: 2, py: 1, "&:hover": { bgcolor: "grey.100" }, cursor: "pointer" }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FacebookIcon fontSize="small" sx={{ color: "#1877F2" }} />
              </ListItemIcon>
              <ListItemText primary="Chia sẻ lên Facebook" primaryTypographyProps={{ fontSize: 14 }} />
            </ListItem>
            <Divider />
            <ListItem
              button
              onClick={handleShareTwitter}
              sx={{ px: 2, py: 1, "&:hover": { bgcolor: "grey.100" }, cursor: "pointer" }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <TwitterIcon fontSize="small" sx={{ color: "#1DA1F2" }} />
              </ListItemIcon>
              <ListItemText primary="Chia sẻ lên Twitter" primaryTypographyProps={{ fontSize: 14 }} />
            </ListItem>
          </List>
        </Popover>
      </Box>

      {/* Comments */}
      <Collapse in={showComments}>
        <Divider sx={{ my: 1 }} />
        {post.comments?.map(c => (
          <Box key={c.id} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 26, height: 26, fontSize: 12 }}>{c.username?.[0]?.toUpperCase()}</Avatar>
            <Box sx={{ flex: 1, bgcolor: "grey.100", borderRadius: 2, px: 1.5, py: 0.5 }}>
              <Typography fontSize={12} fontWeight={600}>{c.username}</Typography>
              <Typography fontSize={13}>{c.content}</Typography>
            </Box>
            <IconButton size="small" onClick={() => handleDeleteComment(c.id)}>
              <DeleteIcon fontSize="small" sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ))}
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <TextField
            size="small" fullWidth placeholder="Viết bình luận..."
            value={commentText} onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleComment()}
          />
          <Button size="small" variant="contained" onClick={handleComment} disabled={!commentText.trim()}>
            Gửi
          </Button>
        </Box>
      </Collapse>

      {/* Snackbar copy link */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ fontSize: 13 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

Post.displayName = "Post";
export default Post;