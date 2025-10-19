
# Exhibition Curator - Setup Guide

Welcome to the Exhibition Curator project! This guide will help you set up the project on your computer for local development and testing.

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)
- **MongoDB** (Atlas or local, see backend setup)

---

## 1. Clone the Repository

```
git clone https://github.com/T0mmy-Pearson/Exhibition_Curator.git
cd Exhibition_Curator
```

---

## 2. Backend Setup 

```
backend in root directory 
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your MongoDB connection string and any other required variables.

### Database Setup

Run the setup script to initialize the database:

```
npm run setup
```

---

## 3. Frontend Setup (`curator-fe/`)

```
cd ../curator-fe
npm install
```

### Running the Frontend

Start the development server:

```
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 4. Logging In (Demo Credentials)

You can log in with the following test account:

**Email:** t.pearson0209@gmail.com  
**Password:** testtest123

---

## 5. Useful Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

---

## 6. Troubleshooting

- Ensure both backend and frontend are running for full functionality
- If you change environment variables, restart the servers
- For deployment, set the frontend root to `curator-fe` in your deployment platform

---

## 7. Project Structure

```
Exhibition_Curator/
├──            # Backend (Express, MongoDB)
├── curator-fe/   # Frontend (Next.js, React, Tailwind)
└── README.md     # This file
```

---

