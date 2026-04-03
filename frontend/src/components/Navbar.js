import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Logout, AccountCircle } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(15, 15, 25, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Toolbar sx={{ maxWidth: 680, mx: "auto", width: "100%", px: { xs: 2, sm: 3 } }}>
        {/* Logo */}
        <Box
          onClick={() => navigate("/feed")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
              color: "#fff",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            3W
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Social
          </Typography>
        </Box>

        {/* User avatar + menu */}
        {user && (
          <>
            <IconButton onClick={handleAvatarClick} sx={{ p: 0.5 }}>
              <Avatar
                src={user.avatar}
                alt={user.username}
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid rgba(108, 99, 255, 0.5)",
                }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  minWidth: 180,
                  mt: 1,
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  @{user.username}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                  {user.email}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "#ff6584",
                  gap: 1,
                  "&:hover": { background: "rgba(255,101,132,0.08)" },
                }}
              >
                <ListItemIcon sx={{ color: "#ff6584", minWidth: 32 }}>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
