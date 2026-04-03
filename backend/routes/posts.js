const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Post = require("../models/Post");
const { protect } = require("../middleware/auth");

// ── Multer setup (local disk storage) ────────────────────────────────────────
// For production, swap this for Cloudinary storage
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ── GET /api/posts — Get all posts (paginated) ────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Post.countDocuments(),
    ]);

    // Attach a flag showing whether the current user has liked each post
    const postsWithLiked = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some(
        (id) => id.toString() === req.user._id.toString()
      ),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
    }));

    res.json({
      posts: postsWithLiked,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Failed to fetch posts." });
  }
});

// ── POST /api/posts — Create a new post ──────────────────────────────────────
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { text } = req.body;
    const imageUrl = req.file
      ? `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${req.file.filename}`
      : "";

    // Must have at least text or image
    if (!text?.trim() && !imageUrl) {
      return res
        .status(400)
        .json({ message: "Please add some text or an image to your post." });
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      text: text?.trim() || "",
      imageUrl,
    });

    res.status(201).json({
      message: "Post created!",
      post: {
        ...post.toObject(),
        isLiked: false,
        likesCount: 0,
        commentsCount: 0,
      },
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Failed to create post." });
  }
});

// ── PUT /api/posts/:id/like — Toggle like on a post ──────────────────────────
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      isLiked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ message: "Failed to update like." });
  }
});

// ── POST /api/posts/:id/comment — Add a comment ───────────────────────────────
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const newComment = {
      userId: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    // Return only the newly added comment
    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      comment: addedComment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ message: "Failed to add comment." });
  }
});

// ── GET /api/posts/:id/comments — Get all comments for a post ─────────────────
router.get("/:id/comments", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select("comments").lean();
    if (!post) return res.status(404).json({ message: "Post not found." });

    // Return comments newest first
    const comments = [...post.comments].reverse();
    res.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments." });
  }
});

// ── DELETE /api/posts/:id — Delete own post ───────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // Only the post owner can delete it
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post." });
    }

    // Clean up local image file if it exists
    if (post.imageUrl && post.imageUrl.includes("/uploads/")) {
      const filename = post.imageUrl.split("/uploads/")[1];
      const filepath = path.join(uploadsDir, filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Failed to delete post." });
  }
});

module.exports = router;
