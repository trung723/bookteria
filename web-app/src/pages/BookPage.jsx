import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Avatar, Rating, Divider,
  CircularProgress, Alert, Paper, Grid, Button
} from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Scene from "./Scene";
import Post from "../components/Post";
import { getBookBySlug, getPostsByBook } from "../services/bookService";
import { getPostById } from "../services/postService";
import { isAuthenticated } from "../services/authenticationService";

export default function BookPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingBook, setLoadingBook] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const loadBookData = async () => {
      try {
        setLoadingBook(true);
        setError(null);
        
        // 1. Get book details by slug
        const bookRes = await getBookBySlug(slug);
        const bookData = bookRes.result;
        setBook(bookData);
        setLoadingBook(false);

        if (bookData) {
          // 2. Get tagged post IDs
          setLoadingPosts(true);
          const postsRes = await getPostsByBook(bookData.id, 1, 20);
          const summaries = postsRes.result?.data || [];

          // 3. Fetch full content for each tagged post
          const postPromises = summaries.map(s => 
            getPostById(s.postId)
              .then(res => res.data.result)
              .catch(err => {
                console.warn(`Failed to fetch post details for ${s.postId}`, err);
                return null;
              })
          );
          
          const fullPosts = await Promise.all(postPromises);
          // Filter out failed posts (nulls)
          setPosts(fullPosts.filter(p => p !== null));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load book information or related feed.");
      } finally {
        setLoadingBook(false);
        setLoadingPosts(false);
      }
    };

    loadBookData();
  }, [slug, navigate]);

  if (loadingBook) {
    return (
      <Scene>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Scene>
    );
  }

  if (error || !book) {
    return (
      <Scene>
        <Box sx={{ width: "100%", maxWidth: 600, mt: 3, px: 2 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
              Back Home
            </Button>
          }>
            {error || "Book not found."}
          </Alert>
        </Box>
      </Scene>
    );
  }

  return (
    <Scene>
      <Box sx={{ width: "100%", maxWidth: 600, mt: "20px", px: 1 }}>
        
        {/* Back Button */}
        <Box 
          onClick={() => navigate(-1)} 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1, 
            mb: 2, 
            cursor: "pointer", 
            color: "text.secondary",
            "&:hover": { color: "primary.main" } 
          }}
        >
          <ArrowBackIcon fontSize="small" />
          <Typography variant="body2" fontWeight={500}>Back</Typography>
        </Box>

        {/* Book Details Card */}
        <Card sx={{ borderRadius: 3, boxShadow: 2, overflow: "hidden", mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar
                  variant="rounded"
                  src={book.coverImage}
                  sx={{ 
                    width: 130, 
                    height: 180, 
                    boxShadow: 2,
                    border: "1px solid #e9ecef" 
                  }}
                >
                  <BookIcon sx={{ fontSize: 60 }} />
                </Avatar>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.3} mb={0.5}>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    by <b>{book.author}</b>
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Rating value={book.averageRating || 0} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" fontWeight={600}>
                      {book.averageRating ? book.averageRating.toFixed(1) : "0.0"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({book.reviewCount || 0} reviews)
                    </Typography>
                  </Box>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      whiteSpace: "pre-wrap", 
                      fontSize: 13.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {book.description || "No description available for this book."}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tagged Posts Feed */}
        <Typography variant="subtitle1" fontWeight={700} mb={1.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          Posts Tagged with #{book.title.replace(/\s+/g, "")}
        </Typography>

        {loadingPosts ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : posts.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              border: "1px dashed #dee2e6", 
              borderRadius: 3, 
              textAlign: "center",
              bgcolor: "transparent"
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No posts have tagged this book yet. Be the first to tag it in a post!
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {posts.map(post => (
              <Post 
                key={post.id} 
                post={post} 
                onDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              />
            ))}
          </Box>
        )}

      </Box>
    </Scene>
  );
}
