import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Tooltip, Chip, AvatarGroup
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import {
  getAllConversations, deleteConversationAdmin
} from "../../services/adminService";

export default function MessageManagement() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllConversations();
      setConversations(res.data?.result ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load conversations. Please verify ADMIN permissions or check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleOpenDelete = (convo) => {
    setSelectedConversation(convo);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConversation) return;
    try {
      await deleteConversationAdmin(selectedConversation.id);
      setDeleteOpen(false);
      fetchConversations();
    } catch (err) {
      console.error(err);
      setError("Failed to delete this conversation.");
      setDeleteOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Conversations Management</Typography>
          <Typography variant="body2" color="text.secondary">Monitor and manage active conversations and chat rooms in the system</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* Table List */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                {["Conversation", "Type", "Participants", "Created Date", "Modified Date", "Actions"].map(h => (
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
              {conversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      No conversations found in the system.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                conversations.map(convo => {
                  const initials = convo.conversationName?.[0]?.toUpperCase() || "?";
                  const isGroup = convo.type === "GROUP";
                  return (
                    <TableRow key={convo.id} hover sx={{ "& td": { py: 1.5, borderColor: "#f1f3f5" } }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={convo.conversationAvatar}
                            sx={{ width: 34, height: 34, fontSize: 13, bgcolor: isGroup ? "#7048e8" : "#3b5bdb" }}
                          >
                            {isGroup ? <GroupIcon fontSize="small" /> : initials}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} fontSize={13}>
                              {convo.conversationName || "Anonymous chat"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {convo.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isGroup ? "Group" : "Direct"}
                          size="small"
                          icon={isGroup ? <GroupIcon sx={{ fontSize: 13 }} /> : <PersonIcon sx={{ fontSize: 13 }} />}
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            bgcolor: isGroup ? "#f3e5f5" : "#e3f2fd",
                            color: isGroup ? "#7b1fa2" : "#1565c0",
                            border: "none",
                            height: 22
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <AvatarGroup max={4} sx={{ justifyContent: "flex-end", "& .MuiAvatar-root": { width: 24, height: 24, fontSize: 10 } }}>
                          {(convo.participants || []).map(p => (
                            <Tooltip key={p.userId} title={p.username || p.userId}>
                              <Avatar src={p.avatar} alt={p.username}>
                                {p.username?.[0]?.toUpperCase() || "?"}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize={12} color="text.secondary">
                          {convo.createdDate ? String(convo.createdDate).slice(0, 10) : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize={12} color="text.secondary">
                          {convo.modifiedDate ? String(convo.modifiedDate).slice(0, 10) : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete conversation">
                          <IconButton size="small" color="error" onClick={() => handleOpenDelete(convo)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Confirm Delete Conversation</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete the conversation for <b>{selectedConversation?.conversationName}</b>? This action will permanently delete all related messages and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" size="small">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
