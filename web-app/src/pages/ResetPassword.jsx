import {
    Box, Button, Card, CardContent,
    TextField, Typography, Snackbar, Alert, InputAdornment, IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setSnackbar({ open: true, message: "Passwords do not match.", severity: "error" });
            return;
        }
        if (newPassword.length < 8) {
            setSnackbar({ open: true, message: "Password must be at least 8 characters.", severity: "error" });
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:8080/identity/users/reset-password", {
                token,
                newPassword,
            });
            setSnackbar({ open: true, message: "Password reset successfully!", severity: "success" });
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Invalid or expired token.",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Token không tồn tại trong URL
    if (!token) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
                <Typography color="error">Invalid reset link. Please request a new one.</Typography>
            </Box>
        );
    }

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
                            Reset Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Enter your new password below.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}
                            display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(s => !s)}>
                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                label="Confirm New Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Button type="submit" variant="contained" size="large"
                                fullWidth disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
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