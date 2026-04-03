const mongoose = require("mongoose");

// ── Comment sub-schema ────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    avatar: { type: String },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// ── Post schema ───────────────────────────────────────────────────────────────
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    avatar: { type: String },

    // Post content — at least one of text or imageUrl must be present
    text: {
      type: String,
      trim: true,
      maxlength: [1000, "Post text cannot exceed 1000 characters"],
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },

    // Likes — store array of userIds (unique per user)
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Comments embedded as subdocuments
    comments: [commentSchema],
  },
  { timestamps: true }
);

// ── Validate at least text or image is present ───────────────────────────────
postSchema.pre("save", function (next) {
  if (!this.text && !this.imageUrl) {
    return next(new Error("Post must have either text or an image"));
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
