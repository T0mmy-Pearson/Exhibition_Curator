# Exhibition Curator

A full-stack application for curating and managing virtual art exhibitions using museum APIs.

## 🎨 Overview

Exhibition Curator allows users to discover, collect, and organize artworks from world-renowned museums into personalized virtual exhibitions. The application integrates with multiple museum APIs to provide access to vast collections of art and cultural artifacts.

## 🏗️ Project Structure

```
Exhibition_Curator/
├── BE/                 # Backend API (Node.js + TypeScript + Express)
│   ├── src/           # Source code
│   ├── db/            # Database setup and migrations
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
└── README.md          # This file
```

## 🚀 Features

### Current Features
- **Met Museum API Integration**: Full integration with Metropolitan Museum of Art API
- **Artwork Search**: Search across museum collections with filters
- **Random Discovery**: Discover random artworks from museum highlights
- **User Authentication**: JWT-based user authentication system
- **Favorites System**: Save and organize favorite artworks
- **Exhibition Creation**: Create and manage virtual exhibitions
- **Rich Metadata**: Access to detailed artwork information, images, and museum data

### Planned Features
- **Multiple Museum APIs**: Rijksmuseum, Tate, and other major museums
- **Advanced Search**: Faceted search, autocomplete, similarity matching
- **Social Features**: Share exhibitions, follow other curators
- **Mobile App**: React Native mobile application
- **Recommendation Engine**: AI-powered artwork recommendations

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **External APIs**: Metropolitan Museum of Art API
- **Testing**: Jest (planned)

### Planned Frontend
- **Web**: React with TypeScript
- **Mobile**: React Native
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Exhibition_Curator.git
   cd Exhibition_Curator
   ```

2. **Backend Setup**
   ```bash
   cd BE
   npm install
   npm run dev
   ```

3. **Visit the API documentation**
   - Check `BE/API_ROUTES.md` for available endpoints
   - View `BE/MET_MUSEUM_ANALYSIS.md` for museum API details

## 📖 Documentation

- **[Backend README](BE/README.md)** - Backend setup and API documentation
- **[API Routes](BE/API_ROUTES.md)** - Complete API endpoint documentation
- **[Met Museum Analysis](BE/MET_MUSEUM_ANALYSIS.md)** - Museum API integration details
- **[Routes Status](BE/ROUTES_STATUS.md)** - Implementation status of all routes

## 🎯 Museum API Integration

### Metropolitan Museum of Art
- ✅ **Fully Integrated** - Search, artwork details, departments
- **Data Quality**: High-resolution images, rich metadata
- **Coverage**: 400,000+ artworks
- **Performance**: Fast response times, no API key required

### Planned Integrations
- **Rijksmuseum**: Dutch art and culture
- **Tate**: British and international modern art
- **Getty**: Art history and cultural artifacts

## 🧪 Testing

The project includes comprehensive API testing:

```bash
cd BE
node test-met-api.js        # Test Met Museum API integration
node test-artwork-api.js    # Test internal artwork endpoints
```

## 📝 API Examples

### Search Artworks
```typescript
// Search for Van Gogh paintings
GET /api/artworks/search?q=van%20gogh&hasImages=true

// Get random highlighted artworks
GET /api/artworks/random?count=10

// Get artwork details
GET /api/artworks/met:436535
```

### Museum Integration
```typescript
// Search Met Museum directly
GET /api/artworks/met/search?q=monet&departmentId=11

// Get museum departments
GET /api/artworks/departments
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Metropolitan Museum of Art** for providing an excellent public API
- **Museum APIs** for making cultural heritage accessible to developers
- **Open Source Community** for the amazing tools and libraries

## 📧 Contact

Project Link: [https://github.com/yourusername/Exhibition_Curator](https://github.com/yourusername/Exhibition_Curator)

---

**Start curating your virtual exhibitions today!** 🎨✨