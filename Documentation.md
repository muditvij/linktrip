# Linktrip - Project Documentation

Welcome to the Linktrip documentation. Linktrip is a traveler-centric social media application built using the MERN stack (MongoDB, Express, React, Node.js). This document explains the architecture, file structure, and feature workings of the project.

## 🚀 Features

*   **User Accounts:** Registration, Login, and JWT Authentication.
*   **Traveler Profiles:** Users can have profile pictures, bios, locations, and view their posts.
*   **Home Feed:** View posts from all explorers globally.
*   **Media Uploads:** Directly upload local images using `multer` to attach to posts.
*   **Gamification:** Earn points by posting (+10) and getting likes (+2). Earn level badges (Novice Explorer, Traveler, Globetrotter, World Nomad).
*   **Interactions:** Like and comment on other travelers' posts.
*   **Auto Location:** Click "Auto Detect" to fetch coordinates and reverse geocode them into a city/country.

## 📁 Project Structure

The project is split into two main directories: `backend/` and `frontend/`.

### Backend: Node.js & Express

```text
backend/
├── server.js            # Entry point. Connects to MongoDB, configures static serving (/uploads), and setups routes.
├── middleware/
│   └── auth.js          # JWT middleware to protect routes. Extracts user ID from token header.
├── models/
│   ├── User.js          # Mongoose schema for travelers. Includes gamification fields (points, badges).
│   └── Post.js          # Mongoose schema for journeys. Stores caption, location, image path, likes array, comments array.
├── routes/
│   ├── auth.js          # Handles /register, /login, and /me endpoints.
│   ├── posts.js         # Handles CRUD for posts. Includes Multer config for file uploads & Gamification Badge logic.
│   └── users.js         # Handles user profiles, fetching user data, and editing profile details.
```

### Frontend: React & Vite (Tailwind CSS)

```text
frontend/
├── src/
│   ├── App.jsx              # Main routing component. Wraps the app in AuthProvider context.
│   ├── index.css            # Global CSS, overrides tailwind brand colors with an electric cyan neon theme.
│   ├── components/
│   │   ├── Navbar.jsx       # Global navigation. Displays user info + points conditionally.
│   │   └── PrivateRoute.jsx # Route guard. Redirects unauthenticated users to /login.
│   ├── context/
│   │   └── AuthContext.jsx  # Global state for managing the JWT token and logged-in user details.
│   └── pages/
│       ├── Home.jsx         # The main feed. Fetches all posts, handles Liking and Commenting UI logic.
│       ├── CreatePost.jsx   # Form with `FormData` submission, File input preview, and Geolocation auto-detect.
│       ├── Profile.jsx      # Dashboard for a specific user. Displays Badges, Points, Posts, and an Edit Profile modal.
│       ├── Login.jsx        # Login page.
│       └── Register.jsx     # Registration page.
```

## ⚙️ How Things Work

1.  **Image Uploads:** When you create a post, `CreatePost.jsx` packages the image file in `FormData`. The backend route `POST /api/posts` intercepts this using `multer`, saves the file locally in the `backend/uploads` folder, and stores the path (e.g., `/uploads/1234.jpg`) in MongoDB. The Node server uses `express.static` to serve these files to the frontend.
2.  **Gamification:**
    *   Whenever a post is created, the user gains 10 points. 
    *   Whenever a post is liked by someone else, the author gets 2 points.
    *   A helper function `checkAndAwardBadges()` runs in the backend after point increments to automatically unlock array strings (e.g., "Novice Explorer") into the User document.
3.  **Auto Location Detection:** The frontend invokes `navigator.geolocation.getCurrentPosition()`. Once coordinates are confirmed, it calls the `nominatim.openstreetmap.org` API to magically turn those coordinates into a readable City/Country format.
4.  **Styling:** The frontend uses TailwindCSS v4 with arbitrary values and custom `@theme` brand colors defined in `index.css` to create a vibrant, dark-mode, glassmorphic "punchy" interface.

## 🛠️ Running Locally

1.  Start Backend: `cd backend && npm run dev`
2.  Start Frontend: `cd frontend && npm run dev`
3.  Ensure MongoDB is running or the fallback memory-server handles connections automatically.
