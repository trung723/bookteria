import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, IconButton, Button,
  InputAdornment, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Rating, Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BookIcon from "@mui/icons-material/Book";
import {
  getAllBooks, deleteBookAdmin, createBookAdmin, updateBookAdmin
} from "../../services/adminService";

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    coverImage: ""
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllBooks(keyword, page, 10);
      const pageResult = res.data?.result;
      if (pageResult) {
        setBooks(pageResult.data ?? []);
        setTotalPages(pageResult.totalPages ?? 1);
        setTotalElements(pageResult.totalElements ?? 0);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load books. Please verify ADMIN permissions or check your network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleOpenCreate = () => {
    setSelectedBook(null);
    setFormData({
      title: "",
      author: "",
      description: "",
      coverImage: ""
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleOpenEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      coverImage: book.coverImage || ""
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleOpenDelete = (book) => {
    setSelectedBook(book);
    setDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Book title cannot be empty";
    if (!formData.author.trim()) errors.author = "Author cannot be empty";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (selectedBook) {
        // Edit mode
        await updateBookAdmin(selectedBook.id, formData);
      } else {
        // Create mode
        await createBookAdmin(formData);
      }
      setFormOpen(false);
      fetchBooks();
    } catch (err) {
      console.error(err);
      setError("Failed to save book. Please verify input data.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;
    try {
      await deleteBookAdmin(selectedBook.id);
      setDeleteOpen(false);
      fetchBooks();
    } catch (err) {
      console.error(err);
      setError("Failed to delete book. It might be due to data dependencies or permissions.");
      setDeleteOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Books Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage books inventory and tagging system</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ bgcolor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d4e" }, textTransform: "none", fontSize: 13 }}
        >
          Add New Book
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* Filter and Search */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search books by title or author..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
          }}
          sx={{ width: 320, bgcolor: "#fff", borderRadius: 1 }}
        />
        <Button type="submit" variant="outlined" size="small" sx={{ textTransform: "none", fontSize: 13 }}>
          Search
        </Button>
      </Box>

      {/* Table List */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                {["Cover", "Book Title / Author", "Slug", "Description", "Rating", "Tagged Posts", "Actions"].map(h => (
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
              {books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      No books found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                books.map(book => (
                  <TableRow key={book.id} hover sx={{ "& td": { py: 1.2, borderColor: "#f1f3f5" } }}>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={book.coverImage}
                        sx={{ width: 38, height: 50, border: "1px solid #e9ecef" }}
                      >
                        <BookIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} fontSize={13}>{book.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{book.author}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ bgcolor: "#f1f3f5", px: 0.8, py: 0.3, borderRadius: 1, fontFamily: "monospace" }}>
                        #{book.slug}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" fontSize={12} color="text.secondary" noWrap>
                        {book.description || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Rating value={book.averageRating || 0} precision={0.1} readOnly size="small" />
                        <Typography variant="caption" fontWeight={600}>
                          {book.averageRating ? book.averageRating.toFixed(1) : "0.0"} ({book.reviewCount ?? 0})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize={13} color="primary" fontWeight={600}>
                        {book.postCount ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(book)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleOpenDelete(book)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Simple Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total: {totalElements} books
          </Typography>
          <Button
            size="small"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            sx={{ textTransform: "none" }}
          >
            Prev
          </Button>
          <Typography variant="body2" fontSize={13}>Page {page} of {totalPages}</Typography>
          <Button
            size="small"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            sx={{ textTransform: "none" }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>
          {selectedBook ? "Update Book Info" : "Add New Book"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              label="Book Title"
              size="small"
              fullWidth
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              error={Boolean(formErrors.title)}
              helperText={formErrors.title}
            />
            <TextField
              label="Author"
              size="small"
              fullWidth
              required
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              error={Boolean(formErrors.author)}
              helperText={formErrors.author}
            />
            <TextField
              label="Cover Image URL"
              size="small"
              fullWidth
              value={formData.coverImage}
              onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://example.com/cover.jpg"
            />
            <TextField
              label="Short Description"
              size="small"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} size="small" sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" size="small" sx={{ textTransform: "none", bgcolor: "#1a1a2e" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Confirm Delete Book</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <b>{selectedBook?.title}</b>? This action will untag the book from all related posts.
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
