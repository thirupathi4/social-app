import React, { useState, useRef } from "react";
import {
  Box,
  Avatar,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Collapse,
} from "@mui/material";
import { Image as ImageIcon, Close, Send } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null); // File object
  const [preview, setPreview] = useState(""); // Data URL for preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // ── Handle image file selection ─────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit post ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!text.trim() && !image) {
      setError("Add some text or an image before posting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (image) formData.append("image", image);

      const { data } = await axios.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Reset form
      setText("");
      setImage(null);
      setPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Notify parent to prepend the new post
      onPostCreated(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  const charLimit = 1000;
  const remaining = charLimit - text.length;

  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* User avatar */}
        <Avatar
          src={user?.avatar}
          alt={user?.username}
          sx={{
            width: 42,
            height: 42,
            border: "2px solid rgba(108,99,255,0.3)",
            flexShrink: 0,
          }}
        />

        {/* Input area */}
        <Box sx={{ flex: 1 }}>
          <TextField
            multiline
            fullWidth
            minRows={2}
            maxRows={6}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) setText(e.target.value);
            }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                "&::placeholder": { color: "rgba(255,255,255,0.25)" },
              },
            }}
          />

          {/* Image preview */}
          <Collapse in={Boolean(preview)}>
            <Box
              sx={{
                mt: 2,
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                maxHeight: 300,
                display: "flex",
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <IconButton
                onClick={removeImage}
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  "&:hover": { background: "rgba(0,0,0,0.8)" },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Collapse>

          {/* Error */}
          {error && (
            <Typography
              variant="caption"
              sx={{ color: "#ff6584", display: "block", mt: 1 }}
            >
              {error}
            </Typography>
          )}

          {/* Actions row */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Image upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.4)",
                  "&:hover": { color: "#6c63ff", background: "rgba(108,99,255,0.1)" },
                }}
              >
                <ImageIcon fontSize="small" />
              </IconButton>

              {/* Character counter */}
              {text.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: remaining < 50 ? "#ff6584" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {remaining}
                </Typography>
              )}
            </Box>

            {/* Post button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || (!text.trim() && !image)}
              variant="contained"
              endIcon={
                loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Send sx={{ fontSize: "14px !important" }} />
                )
              }
              sx={{
                background: "linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)",
                borderRadius: 20,
                px: 3,
                py: 0.8,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: "0.82rem",
                letterSpacing: "0.02em",
                textTransform: "none",
                boxShadow: "0 4px 15px rgba(108,99,255,0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #7c73ff 0%, #ff7594 100%)",
                  boxShadow: "0 4px 20px rgba(108,99,255,0.5)",
                },
                "&:disabled": {
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.2)",
                  boxShadow: "none",
                },
              }}
            >
              Post
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CreatePost;
