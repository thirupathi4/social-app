import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Collapse,
  TextField,
  Button,
  Divider,
  Skeleton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  Send,
  DeleteOutline,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "../utils/timeUtils";

const PostCard = ({ post, onLikeUpdate, onCommentUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const isOwnPost = user?._id === post.userId?.toString();

  // ── Toggle like ─────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const { data } = await axios.put(`/posts/${post._id}/like`);
      onLikeUpdate(post._id, data.isLiked, data.likesCount);
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Toggle comments section (load on first open) ────────────────────────────
  const handleToggleComments = async () => {
    const newState = !showComments;
    setShowComments(newState);

    // Load full comments from API on first open
    if (newState && !commentsLoaded) {
      try {
        const { data } = await axios.get(`/posts/${post._id}/comments`);
        setLocalComments(data.comments);
        setCommentsLoaded(true);
      } catch (err) {
        console.error("Load comments error:", err);
      }
    }
  };

  // ── Submit comment ──────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      const { data } = await axios.post(`/posts/${post._id}/comment`, {
        text: commentText.trim(),
      });
      setLocalComments((prev) => [data.comment, ...prev]);
      onCommentUpdate(post._id, data.commentsCount);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 3,
        overflow: "hidden",
        transition: "border-color 0.2s ease",
        "&:hover": { borderColor: "rgba(108,99,255,0.2)" },
      }}
    >
      {/* ── Post header ────────────────────────────────────────────────────── */}
      <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: post.imageUrl ? 1.5 : 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Avatar
            src={post.avatar}
            alt={post.username}
            sx={{
              width: 40,
              height: 40,
              border: "2px solid rgba(108,99,255,0.2)",
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.9rem",
                }}
              >
                @{post.username}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
                >
                  {formatDistanceToNow(post.createdAt)}
                </Typography>
                {isOwnPost && (
                  <Tooltip title="Delete post">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(post._id)}
                      sx={{
                        color: "rgba(255,255,255,0.2)",
                        p: 0.5,
                        "&:hover": { color: "#ff6584", background: "rgba(255,101,132,0.1)" },
                      }}
                    >
                      <DeleteOutline sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {/* Post text */}
            {post.text && (
              <Typography
                sx={{
                  mt: 0.5,
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.92rem",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {post.text}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Post image ─────────────────────────────────────────────────────── */}
      {post.imageUrl && (
        <Box sx={{ px: { xs: 0, sm: 0 }, mt: post.text ? 1.5 : 0 }}>
          <img
            src={post.imageUrl}
            alt="Post"
            style={{
              width: "100%",
              maxHeight: 450,
              objectFit: "cover",
              display: "block",
            }}
            loading="lazy"
          />
        </Box>
      )}

      {/* ── Actions bar ────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Like button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={handleLike}
              disabled={likeLoading}
              size="small"
              sx={{
                color: post.isLiked ? "#ff6584" : "rgba(255,255,255,0.35)",
                p: 0.5,
                transition: "all 0.2s",
                transform: likeLoading ? "scale(0.9)" : "scale(1)",
                "&:hover": {
                  color: "#ff6584",
                  background: "rgba(255,101,132,0.1)",
                  transform: "scale(1.15)",
                },
              }}
            >
              {post.isLiked ? (
                <Favorite sx={{ fontSize: 20 }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            <Typography
              variant="caption"
              sx={{
                color: post.isLiked ? "#ff6584" : "rgba(255,255,255,0.4)",
                fontWeight: 500,
                minWidth: 16,
              }}
            >
              {post.likesCount || 0}
            </Typography>
          </Box>

          {/* Comment button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={handleToggleComments}
              size="small"
              sx={{
                color: showComments ? "#6c63ff" : "rgba(255,255,255,0.35)",
                p: 0.5,
                "&:hover": {
                  color: "#6c63ff",
                  background: "rgba(108,99,255,0.1)",
                },
              }}
            >
              <ChatBubbleOutline sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography
              variant="caption"
              sx={{
                color: showComments ? "#6c63ff" : "rgba(255,255,255,0.4)",
                fontWeight: 500,
                minWidth: 16,
              }}
            >
              {post.commentsCount || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Comments section ───────────────────────────────────────────────── */}
      <Collapse in={showComments}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
          {/* Add comment input */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}>
            <Avatar
              src={user?.avatar}
              alt={user?.username}
              sx={{ width: 30, height: 30, flexShrink: 0 }}
            />
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleComment}
                    disabled={!commentText.trim() || commentLoading}
                    size="small"
                    sx={{
                      color: commentText.trim() ? "#6c63ff" : "rgba(255,255,255,0.2)",
                      "&:hover": { color: "#7c73ff" },
                    }}
                  >
                    {commentLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <Send sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
                },
                "& .MuiInputBase-input": {
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  py: 1,
                  "&::placeholder": { color: "rgba(255,255,255,0.22)" },
                },
              }}
            />
          </Box>

          {/* Comment list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 300, overflowY: "auto" }}>
            {localComments.length === 0 && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.25)", textAlign: "center", py: 1 }}
              >
                No comments yet. Be the first!
              </Typography>
            )}
            {localComments.map((c, idx) => (
              <Box key={c._id || idx} sx={{ display: "flex", gap: 1.2 }}>
                <Avatar
                  src={c.avatar}
                  alt={c.username}
                  sx={{ width: 28, height: 28, flexShrink: 0 }}
                />
                <Box
                  sx={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "4px 12px 12px 12px",
                    px: 1.5,
                    py: 0.8,
                    flex: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      @{c.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)" }}>
                      {formatDistanceToNow(c.createdAt)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                      mt: 0.3,
                    }}
                  >
                    {c.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default PostCard;
