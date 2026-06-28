import {
    Box, Button, Card, CardContent,
    TextField, Typography, Snackbar, Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "", password: "", confirmPassword: "",
        firstName: "", lastName: "", email: "",
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setSnackbar({ open: true, message: "Passwords do not match!", severity: "error" });
            return;
        }

        try {
            await axios.post("http://localhost:8080/identity/users/registration", {
                username:  form.username,
                password:  form.password,
                firstName: form.firstName,
                lastName:  form.lastName,
                email:     form.email,
            });

            setSnackbar({ open: true, message: "Registration successful!", severity: "success" });
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed!";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    };

    return (
        <>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Box display="flex" alignItems="center" justifyContent="center"
                height="100vh" bgcolor="#f0f2f5">
                <Card sx={{ minWidth: 300, maxWidth: 420, boxShadow: 3, borderRadius: 3, padding: 4 }}>
                    <CardContent>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Create Bookteria Account
                        </Typography>

                        <Box component="form" display="flex" flexDirection="column" gap={2}
                            onSubmit={handleSubmit}>
                            <Box display="flex" gap={2}>
                                <TextField label="First Name" name="firstName" fullWidth
                                    value={form.firstName} onChange={handleChange} required/>
                                <TextField label="Last Name" name="lastName" fullWidth
                                    value={form.lastName} onChange={handleChange} required/>
                            </Box>
                            <TextField label="Email" name="email" type="email" fullWidth
                                    value={form.email} onChange={handleChange} required/>
                            <TextField label="Username" name="username" fullWidth
                                value={form.username} onChange={handleChange} required/>
                            <TextField label="Password" name="password" type="password" fullWidth
                                value={form.password} onChange={handleChange} required/>
                            <TextField label="Confirm Password" name="confirmPassword"
                                type="password" fullWidth
                                value={form.confirmPassword} onChange={handleChange} required/>

                            <Button type="submit" variant="contained" color="success"
                                size="large" fullWidth sx={{ mt: 1 }}>
                                Sign Up
                            </Button>
                            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
                                Already have an account? Log In
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}