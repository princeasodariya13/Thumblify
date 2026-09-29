# Thumblify - AI Thumbnail Generator

Thumblify is a full-stack AI-powered thumbnail generator application built with React, Vite, Node.js, Express, TypeScript, MongoDB, and Cloudinary.

## Features
- **AI Thumbnail Generation:** Generate high-quality thumbnails using AI prompts and customizable styles, aspect ratios, and color palettes.
- **YouTube Feed Preview:** Preview how your generated thumbnails look in a realistic YouTube feed mockup.
- **Community Showcase:** Public gallery displaying community-created thumbnails.
- **User Dashboard & Management:** Save, manage, download, and track your thumbnail generations.
- **Authentication & Security:** User registration, login session persistence, and OTP password reset.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lenis Smooth Scroll
- **Backend:** Node.js, Express 5, TypeScript (`tsx`), MongoDB (Mongoose), `express-session`
- **Integrations:** Hugging Face AI, Cloudinary, Nodemailer

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Cloudinary account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/princeasodariya13/Thumblify.git
   cd Thumblify
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   npm run server
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---
Developed with ❤️ by Prince Asodariya.
