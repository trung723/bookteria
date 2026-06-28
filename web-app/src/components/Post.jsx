import { forwardRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Avatar, IconButton, TextField, Button,
  Collapse, Divider, Menu, MenuItem, Popover, List, ListItem,
  ListItemIcon, ListItemText, Snackbar, Alert, Chip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { likePost, addComment, deleteComment, deletePost, updatePost, updateComment } from "../services/postService";
import { getBooksInPost } from "../services/bookService";
import { getToken } from "../services/localStorageService";

const Post = forwardRef(({ post: initialPost, onDeleted }, ref) => {
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [taggedBooks, setTaggedBooks] = useState([]);

  // User ownership & admin status
  const token = getToken();
  let currentUserId = "";
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.sub;
      const scopes = payload.scope ? payload.scope.split(" ") : [];
      isAdmin = scopes.includes("ROLE_ADMIN");
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }
  const isOwner = post.userId === currentUserId;
  const canDelete = isOwner || isAdmin;

  // Edit Post states
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostContent, setEditedPostContent] = useState(post.content || "");

  // Edit Comment states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const handleEditPostSubmit = async () => {
    if (!editedPostContent.trim()) return;
    try {
      const res = await updatePost(post.id, editedPostContent);
      setPost(res.data.result);
      setIsEditingPost(false);
    } catch (e) {
      console.error("Failed to edit post:", e);
    }
  };

  const handleEditCommentSubmit = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      const res = await updateComment(post.id, commentId, editingCommentText);
      setPost(res.data.result);
      setEditingCommentId(null);
    } catch (e) {
      console.error("Failed to edit comment:", e);
    }
  };

  useEffect(() => {
    let active = true;
    getBooksInPost(post.id)
      .then(res => {
        if (active) setTaggedBooks(res.result || []);
      })
      .catch(err => console.error("Error loading books in post:", err));
    return () => { active = false; };
  }, [post.id]);

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
      setShowComments(true);
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
      setSnackbar({ open: true, message: "Link copied!" });
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
        {canDelete && (
          <>
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {isOwner && (
                <MenuItem onClick={() => { setIsEditingPost(true); setAnchorEl(null); }}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Post
                </MenuItem>
              )}
              <MenuItem onClick={handleDeletePost} sx={{ color: "error.main" }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Post
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Content */}
      {isEditingPost ? (
        <Box sx={{ mt: 1, mb: 1.5 }}>
          <TextField
            fullWidth
            multiline
            size="small"
            value={editedPostContent}
            onChange={e => setEditedPostContent(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button size="small" variant="outlined" onClick={() => setIsEditingPost(false)}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleEditPostSubmit} disabled={!editedPostContent.trim()}>
              Save
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography fontSize={14} sx={{ mb: 1, whiteSpace: "pre-wrap" }}>{post.content}</Typography>
      )}

      {/* Book Hashtags */}
      {taggedBooks.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1.5 }}>
          {taggedBooks.map(book => (
            <Chip
              key={book.id}
              label={`#${book.title.replace(/\s+/g, "")}`}
              size="small"
              onClick={() => navigate(`/books/${book.slug}`)}
              sx={{
                cursor: "pointer",
                bgcolor: "#e8f0fe",
                color: "#1a73e8",
                fontSize: 11,
                fontWeight: 600,
                "&:hover": { bgcolor: "#d2e3fc" }
              }}
            />
          ))}
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        {/* Like */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }} onClick={handleLike}>
          <IconButton size="small" color={post.likedByMe ? "error" : "default"} sx={{ p: 0.5 }}>
            {post.likedByMe ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
          <Typography fontSize={13} color="text.secondary" sx={{ userSelect: "none" }}>{post.likeCount || 0}</Typography>
        </Box>

        {/* Comment */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }} onClick={() => setShowComments(v => !v)}>
          <IconButton size="small" sx={{ p: 0.5 }}>
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography fontSize={13} color="text.secondary" sx={{ userSelect: "none" }}>{post.comments?.length || 0}</Typography>
        </Box>

        {/* Share */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }} onClick={(e) => setShareAnchorEl(e.currentTarget)}>
          <IconButton size="small" sx={{ p: 0.5 }}>
            <ShareIcon fontSize="small" />
          </IconButton>
          <Typography fontSize={13} color="text.secondary" sx={{ userSelect: "none" }}>Share</Typography>
        </Box>

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
              <ListItemText primary="Copy link" primaryTypographyProps={{ fontSize: 14 }} />
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
              <ListItemText primary="Share on Facebook" primaryTypographyProps={{ fontSize: 14 }} />
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
              <ListItemText primary="Share on Twitter" primaryTypographyProps={{ fontSize: 14 }} />
            </ListItem>
          </List>
        </Popover>
      </Box>

      {/* Comments */}
      <Collapse in={showComments}>
        <Divider sx={{ my: 1 }} />
        {post.comments?.map((c, idx) => {
          const isCommentOwner = c.userId === currentUserId;
          const canDeleteComment = isCommentOwner || isAdmin;
          return (
            <Box key={c.id || idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
              <Avatar sx={{ width: 26, height: 26, fontSize: 12 }}>{c.username?.[0]?.toUpperCase()}</Avatar>
              <Box sx={{ flex: 1, bgcolor: "grey.100", borderRadius: 2, px: 1.5, py: 0.5 }}>
                <Typography fontSize={12} fontWeight={600}>{c.username}</Typography>
                {editingCommentId && editingCommentId === c.id ? (
                  <Box sx={{ mt: 0.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={editingCommentText}
                      onChange={e => setEditingCommentText(e.target.value)}
                      sx={{ mb: 0.5, bgcolor: "#fff", borderRadius: 1 }}
                    />
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      <Button size="small" sx={{ fontSize: 10, minWidth: 40, px: 1, py: 0.2, textTransform: "none" }} onClick={() => setEditingCommentId(null)}>
                        Cancel
                      </Button>
                      <Button size="small" variant="contained" sx={{ fontSize: 10, minWidth: 40, px: 1, py: 0.2, textTransform: "none" }} onClick={() => handleEditCommentSubmit(c.id)} disabled={!editingCommentText.trim()}>
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography fontSize={13}>{c.content}</Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", alignSelf: "center", ml: 0.5 }}>
                {isCommentOwner && editingCommentId !== c.id && (
                  <IconButton size="small" onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content); }}>
                    <EditIcon fontSize="small" sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
                {canDeleteComment && (
                  <IconButton size="small" onClick={() => handleDeleteComment(c.id)}>
                    <DeleteIcon fontSize="small" sx={{ fontSize: 14, color: "#e03131" }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        })}
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <TextField
            size="small" fullWidth placeholder="Write a comment..."
            value={commentText} onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleComment();
              }
            }}
          />
          <Button size="small" variant="contained" onClick={handleComment} disabled={!commentText.trim()}>
            Send
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