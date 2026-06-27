import {
    Box, Button, Card, CardContent,
    TextField, Typography, Snackbar, Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://localhost:8888/api/v1/identity/users/forgot-password", { email });
            setSnackbar({
                open: true,
                message: "Reset link sent! Please check your email.",
                severity: "success"
            });
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Email not found.",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Snackbar open={snackbar.open} autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Box display="flex" alignItems="center" justifyContent="center"
                height="100vh" bgcolor="#f0f2f5">
                <Card sx={{ minWidth: 300, maxWidth: 400, boxShadow: 3, borderRadius: 3, padding: 4 }}>
                    <CardContent>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Forgot Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Enter your email address and we'll send you a link to reset your password.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}
                            display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Email address" type="email" fullWidth required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button type="submit" variant="contained" size="large"
                                fullWidth disabled={loading}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
                                Back to Login
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}