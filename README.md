
# Exhibition Curator

A modern web application for curating and exploring art exhibitions from world-renowned museums. Create personalized collections, discover artworks from the Metropolitan Museum, V&A Museum, and more.

🌐 **Live Demo:** [https://exhibition-curator-ruddy.vercel.app/](https://exhibition-curator-ruddy.vercel.app/)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - Either [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud) or local installation
- **Git** - [Download here](https://git-scm.com/)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/T0mmy-Pearson/Exhibition_Curator.git
cd Exhibition_Curator
```

### 2. Backend Setup (Express + MongoDB)

The backend is located in the root directory.

```bash
# Install backend dependencies
npm install
```

#### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database - You MUST set up your own MongoDB database
MONGODB_URI=your_mongodb_connection_string_here
NODE_ENV=development

# JWT Secret - Generate a secure random string (at least 32 characters)
JWT_SECRET=your_secure_jwt_secret_here_make_it_long_and_random

# Server Port
PORT=9090

# CORS Settings
FRONTEND_URL=http://localhost:3000

# Museum API Keys (optional - some features work without them)
MET_API_BASE_URL=https://collectionapi.metmuseum.org/public/collection/v1
VA_API_BASE_URL=https://api.vam.ac.uk/v2
RIJKS_API_KEY=your_rijksmuseum_api_key_if_you_have_one
```

**⚠️ Important:** You need to generate these yourself:
- **JWT_SECRET**: Use a password generator or run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` in your terminal
- **MONGODB_URI**: Set up your own MongoDB database (see options below)

#### Database Setup Options

You **must** set up your own MongoDB database. Choose one of these options:

**Option A: MongoDB Atlas (Recommended - Free Tier Available)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new project and cluster (choose the free M0 cluster)
3. Create a database user with read/write permissions
4. Add your IP address to the IP Access List (or use 0.0.0.0/0 for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace `<password>` in the connection string with your database user password
7. Add the full connection string to `.env` as `MONGODB_URI`

Example: `MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/exhibition_curator?retryWrites=true&w=majority`

**Option B: Local MongoDB (Advanced Users)**
1. Install MongoDB Community Server locally
2. Start the MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017/exhibition_curator`

#### Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The backend will be available at `http://localhost:9090`

### 3. Frontend Setup (Next.js + React)

Navigate to the frontend directory:

```bash
cd curator-fe
npm install
```

#### Frontend Environment Variables

Create a `.env.local` file in the `curator-fe` directory:

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:9090/api
NEXT_PUBLIC_API_URL=http://localhost:9090

# App Settings
NEXT_PUBLIC_APP_NAME=Exhibition Curator
```

#### Start the Frontend Server

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm start
```

The frontend will be available at `http://localhost:3000`

---

## 🔧 Development Workflow

### Running Both Servers

For the best development experience, run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
# In the root directory
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd curator-fe
npm run dev
```

### Testing the Application

1. Open `http://localhost:3000` in your browser
2. You should see the Exhibition Curator homepage
3. Try searching for artworks or browsing exhibitions
4. Create an account or use the demo credentials below

---

## 👤 Demo Credentials

For testing purposes, you can create a new account or use these demo credentials:

**Email:** `demo@example.com`  
**Password:** `demo123`

*Note: Demo credentials may not always be available - creating a new account is recommended.*

---

## 📁 Project Structure

```
Exhibition_Curator/
├── src/                    # Backend source code
│   ├── controllers/        # Route handlers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation middleware
│   ├── services/          # External API services
│   └── types/             # TypeScript type definitions
├── curator-fe/            # Frontend Next.js application
│   ├── app/               # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── types/         # Frontend type definitions
│   └── public/            # Static assets
├── package.json           # Backend dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

---

## 🛠️ Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with auto-reload
npm start            # Start production server
npm run build        # Build TypeScript to JavaScript
npm run lint         # Run ESLint
npm test             # Run tests
```

### Frontend Scripts
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check that MongoDB is running and accessible
- Verify your `.env` file has the correct `MONGODB_URI`
- Ensure port 9090 isn't already in use

**Frontend won't connect to backend:**
- Verify the backend is running on port 9090
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Look for CORS errors in browser console

**Database connection errors:**
- For MongoDB Atlas: Check your IP whitelist settings
- For local MongoDB: Ensure the MongoDB service is running
- Verify your connection string format

**Artwork images not loading:**
- Some museum APIs have rate limits
- Try refreshing the page or searching for different artworks
- Check browser console for API errors

THANK YOU!


