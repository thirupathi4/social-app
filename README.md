# 3W Social — Mini Social Post App

> Full-stack social feed application built for the **3W Full Stack Internship Assignment**.  
> Users can sign up, create posts (text + image), like, comment, and browse a public feed.

---

## 📸 Features

| Feature | Details |
|---|---|
| **Auth** | Signup & Login with email/password. JWT-based sessions (7-day expiry). |
| **Create Post** | Post text, image (up to 5MB), or both. Live character counter. Image preview before upload. |
| **Feed** | Public feed of all posts, newest first. Infinite scroll pagination (10 posts/page). |
| **Like** | Toggle like on any post. Instant UI update. Persists per user. |
| **Comment** | Add comments to any post. Comments load on demand. Keyboard shortcut (Enter to submit). |
| **Delete** | Post owners can delete their own posts. |
| **Responsive** | Mobile-first layout. Works on all screen sizes. |

---

## 🗂 Project Structure

```
social-app/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── User.js           # User schema (MongoDB)
│   │   └── Post.js           # Post schema with likes & comments
│   ├── routes/
│   │   ├── auth.js           # POST /signup, /login, GET /me
│   │   └── posts.js          # CRUD, like, comment endpoints
│   ├── middleware/
│   │   └── auth.js           # JWT protect middleware
│   ├── uploads/              # Local image storage (dev only)
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
│
├── frontend/                 # React.js app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state + axios config
│   │   ├── components/
│   │   │   ├── Navbar.js       # Top nav with user menu
│   │   │   ├── CreatePost.js   # Post composer with image upload
│   │   │   └── PostCard.js     # Single post with like/comment
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   └── Feed.js         # Main feed with pagination
│   │   ├── utils/
│   │   │   └── timeUtils.js    # Relative time formatter
│   │   ├── App.js              # Router + theme + protected routes
│   │   └── index.js
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
│
├── render.yaml               # Render.com deployment config
├── .gitignore
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router 6, MUI v5 |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Image Upload | Multer (local dev) / Cloudinary (production) |
| Hosting | Vercel (frontend) · Render (backend) · MongoDB Atlas (DB) |

> **Styling:** Material UI (MUI) — no TailwindCSS as per assignment requirements.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/social-app.git
cd social-app
```

### 2. Setup the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/socialapp
JWT_SECRET=pick_a_long_random_string_here
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

Start the backend:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

No `.env` needed for local dev — the `"proxy": "http://localhost:5000"` in `package.json` handles API routing automatically.

Start the frontend:
```bash
npm start
```
App runs at `http://localhost:3000`

---

## 🗄 MongoDB Collections

Only **two collections** are used as per assignment requirements:

### `users`
```js
{
  _id, username, email, password (hashed), avatar, bio, createdAt, updatedAt
}
```

### `posts`
```js
{
  _id, userId, username, avatar,
  text, imageUrl,
  likes: [userId, ...],          // array of user IDs who liked
  comments: [
    { userId, username, avatar, text, createdAt }
  ],
  createdAt, updatedAt
}
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Posts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/posts?page=1&limit=10` | ✅ | Get paginated feed |
| POST | `/api/posts` | ✅ | Create post (multipart/form-data) |
| PUT | `/api/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/posts/:id/comment` | ✅ | Add comment |
| GET | `/api/posts/:id/comments` | ✅ | Get all comments |
| DELETE | `/api/posts/:id` | ✅ | Delete own post |

---

## ☁️ Deployment

### Step 1 — MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free M0 cluster
2. Create a database user with a strong password
3. Whitelist `0.0.0.0/0` (allow all IPs) under Network Access
4. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/socialapp`

### Step 2 — Backend on Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Build command: `npm install` | Start command: `npm start`
5. Add environment variables:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — your Vercel frontend URL (set after Step 3)
   - `SERVER_URL` — your Render backend URL
6. Deploy → copy the backend URL (e.g. `https://social-app-api.onrender.com`)

### Step 3 — Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

### Step 4 — Update CORS
Go back to Render and update `CLIENT_URL` to your Vercel URL.

---

## 🏆 Bonus Features Implemented

- ✅ **Clean dark-mode UI** with gradient accents and glassmorphism
- ✅ **Fully responsive** — mobile-first layout
- ✅ **Pagination** — infinite scroll with IntersectionObserver
- ✅ **Skeleton loaders** while posts are loading
- ✅ **Auto-generated avatars** via DiceBear API (no manual upload needed)
- ✅ **Code comments** throughout all files
- ✅ **Reusable components** (PostCard, CreatePost, Navbar)
- ✅ **Error handling** — user-friendly messages on all failures

---

## 📧 Questions?

Assignment by **3W Solutions** — hr@triplewsols.com
