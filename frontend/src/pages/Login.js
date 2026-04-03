import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    background: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
  },
  "& .MuiInputBase-input": {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "'DM Sans', sans-serif",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.35)",
    fontFamily: "'DM Sans', sans-serif",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6c63ff" },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "rgba(255,255,255,0.3)" },
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0a0a14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
          top: -200,
          left: -100,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,101,132,0.08) 0%, transparent 70%)",
          bottom: -100,
          right: -50,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          position: "relative",
          zIndex: 1,
          animation: "fadeSlideIn 0.4s ease",
          "@keyframes fadeSlideIn": {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              color: "#fff",
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: "0 8px 24px rgba(108,99,255,0.35)",
            }}
          >
            3W
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              Welcome back
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
              Sign in to 3W Social
            </Typography>
          </Box>
        </Box>

        {/* Error message */}
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: "rgba(255,101,132,0.1)",
              border: "1px solid rgba(255,101,132,0.2)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#ff6584", fontFamily: "'DM Sans', sans-serif" }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Fields */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            size="small"
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={inputSx}
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            fullWidth
            size="small"
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                    size="small"
                    sx={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={inputSx}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.3,
              borderRadius: 2,
              background: "linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)",
              color: "#fff",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: "0.95rem",
              textTransform: "none",
              letterSpacing: "0.01em",
              boxShadow: "0 4px 20px rgba(108,99,255,0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #7c73ff 0%, #ff7594 100%)",
                boxShadow: "0 4px 28px rgba(108,99,255,0.5)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.2)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "rgba(255,255,255,0.5)" }} />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 3,
            textAlign: "center",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/signup"
            sx={{
              color: "#6c63ff",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "#8880ff" },
            }}
          >
            Create one
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
