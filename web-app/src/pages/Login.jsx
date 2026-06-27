import {
  Box, Button, Card, CardContent, Checkbox, Divider,
  FormControlLabel, TextField, Typography, Snackbar, Alert,
  InputAdornment, IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logIn, isAuthenticated } from "../services/authenticationService";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated()) navigate("/");
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await logIn(username, password);
      console.log("Response body:", response.data);
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
      }
      navigate("/");
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackBarMessage(errorResponse?.message || "Login failed. Please try again.");
      setSnackBarOpen(true);
    }
  };

  return (
    <>
      <Snackbar open={snackBarOpen} onClose={handleCloseSnackBar}
        autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackBar} severity="error" variant="filled" sx={{ width: "100%" }}>
          {snackBarMessage}
        </Alert>
      </Snackbar>

      <Box display="flex" flexDirection="column" alignItems="center"
        justifyContent="center" height="100vh" bgcolor="#f0f2f5">
        <Card sx={{ minWidth: 300, maxWidth: 400, boxShadow: 3, borderRadius: 3, padding: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              Welcome to Bookteria
            </Typography>

            <Box component="form" display="flex" flexDirection="column"
              alignItems="center" width="100%" onSubmit={handleSubmit}>
              <TextField
                label="Username" variant="outlined" fullWidth margin="normal"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Password" variant="outlined" fullWidth margin="normal"
                type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box display="flex" justifyContent="space-between"
                alignItems="center" width="100%" mt={1}>
                <FormControlLabel
                  control={
                    <Checkbox checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary" size="small" />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Typography variant="body2" color="primary"
                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  onClick={() => navigate("/forgot-password")}>
                  Forgot password?
                </Typography>
              </Box>

              <Button type="submit" variant="contained" color="primary"
                size="large" fullWidth sx={{ mt: "15px", mb: "25px" }}>
                Login
              </Button>

              <Divider flexItem />
            </Box>

            <Box display="flex" flexDirection="column" width="100%" gap="25px" mt={2}>
              <Button type="button" variant="contained" color="success"
                size="large" fullWidth onClick={() => navigate("/register")}>
                Create an account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}