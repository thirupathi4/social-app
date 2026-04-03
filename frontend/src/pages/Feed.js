import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Skeleton,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import axios from "axios";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

// ── Skeleton loader for post cards ─────────────────────────────────────────────
const PostSkeleton = () => (
  <Box
    sx={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 3,
      p: { xs: 2, sm: 2.5 },
    }}
  >
    <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="30%" sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
        <Skeleton variant="text" width="80%" sx={{ bgcolor: "rgba(255,255,255,0.04)" }} />
        <Skeleton variant="text" width="60%" sx={{ bgcolor: "rgba(255,255,255,0.04)" }} />
      </Box>
    </Box>
    <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.04)" }} />
  </Box>
);

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const loaderRef = useRef(null);

  // ── Fetch posts with pagination ─────────────────────────────────────────────
  const fetchPosts = useCallback(async (pageNum) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`/posts?page=${pageNum}&limit=10`);
      setPosts((prev) =>
        pageNum === 1 ? data.posts : [...prev, ...data.posts]
      );
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load posts. Please refresh.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading]);

  // Initial load
  useEffect(() => {
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Infinite scroll using IntersectionObserver ─────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loading, page, fetchPosts]);

  // ── Handle new post created ─────────────────────────────────────────────────
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // ── Handle like update ──────────────────────────────────────────────────────
  const handleLikeUpdate = (postId, isLiked, likesCount) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, isLiked, likesCount } : p))
    );
  };

  // ── Handle comment count update ─────────────────────────────────────────────
  const handleCommentUpdate = (postId, commentsCount) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, commentsCount } : p))
    );
  };

  // ── Handle delete ───────────────────────────────────────────────────────────
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#0a0a14" }}>
      <Navbar />

      <Box
        sx={{
          maxWidth: 680,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 },
        }}
      >
        {/* Page header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <AutoAwesome sx={{ color: "#6c63ff", fontSize: 18 }} />
          <Typography
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "-0.01em",
            }}
          >
            Your Feed
          </Typography>
        </Box>

        {/* Create post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Post list */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Initial skeleton loaders */}
          {initialLoading &&
            [1, 2, 3].map((i) => <PostSkeleton key={i} />)}

          {/* Actual posts */}
          {!initialLoading &&
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLikeUpdate={handleLikeUpdate}
                onCommentUpdate={handleCommentUpdate}
                onDelete={handleDelete}
              />
            ))}

          {/* Empty state */}
          {!initialLoading && posts.length === 0 && !error && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              <Typography
                sx={{ fontSize: "3rem", mb: 1 }}
              >
                ✨
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                No posts yet
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.2)" }}
              >
                Be the first to share something!
              </Typography>
            </Box>
          )}

          {/* Error state */}
          {error && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography
                variant="body2"
                sx={{ color: "#ff6584", mb: 2, fontFamily: "'DM Sans', sans-serif" }}
              >
                {error}
              </Typography>
              <Button
                onClick={() => fetchPosts(1)}
                sx={{
                  color: "#6c63ff",
                  borderColor: "rgba(108,99,255,0.3)",
                  "&:hover": { borderColor: "#6c63ff" },
                }}
                variant="outlined"
                size="small"
              >
                Retry
              </Button>
            </Box>
          )}

          {/* Infinite scroll loader */}
          <Box ref={loaderRef} sx={{ py: 2, display: "flex", justifyContent: "center" }}>
            {loading && !initialLoading && (
              <CircularProgress size={24} sx={{ color: "rgba(108,99,255,0.5)" }} />
            )}
            {!hasMore && posts.length > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
              >
                You're all caught up ✓
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Feed;
