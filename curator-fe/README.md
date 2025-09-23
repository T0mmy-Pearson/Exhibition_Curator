# Frontend Artwork Gallery

This frontend application displays artworks from external museum APIs in a responsive card-based gallery layout.

## Features

### 🎨 **Artwork Display**
- **Responsive Grid Layout**: Displays artworks in a responsive grid that adapts to different screen sizes
- **Artwork Cards**: Each artwork is displayed in a card showing:
  - High-quality images from museum collections
  - Artwork title and artist name
  - Creation date and medium information
  - Museum collection badge (Met Museum, Fitzwilliam, etc.)
  - Highlight indicators for featured pieces
  - Department/category information

### 🔍 **Search & Filtering**
- **Search Functionality**: Search for artworks by keywords (e.g., "painting", "sculpture", "portrait")
- **Museum Filtering**: Filter results by specific museums:
  - All Museums (combined results)
  - Metropolitan Museum of Art
  - Fitzwilliam Museum
  - Rijksmuseum (future)
- **Quick Search Tags**: Pre-defined search terms for common artwork types

### 🚀 **User Experience**
- **Loading States**: Smooth loading animations while fetching data
- **Error Handling**: Graceful error display with retry functionality
- **Status Indicator**: Real-time API connection status
- **Dark Mode Support**: Full dark/light theme compatibility
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Technical Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Images**: Next.js Image component with optimized external image loading
- **TypeScript**: Full type safety for better developer experience

## Components Structure

```
app/components/
├── ArtworksPage.tsx      # Main page component
├── ArtworkList.tsx       # Gallery grid container
├── ArtworkCard.tsx       # Individual artwork display
├── ArtworkSearch.tsx     # Search and filter controls
├── LoadingSpinner.tsx    # Loading state component
├── ErrorDisplay.tsx      # Error state component
└── StatusIndicator.tsx   # API connection status
```

## API Integration

The frontend connects to the backend API at `http://localhost:9090/api/artworks/search` with the following parameters:

- `q`: Search query string
- `source`: Museum source ('all', 'met', 'fitzwilliam', 'rijks')
- `limit`: Number of results to fetch
- `hasImages`: Filter for artworks with images only

## Image Optimization

Configured Next.js Image component to load images from:
- `images.metmuseum.org` - Metropolitan Museum of Art
- `api.fitz.ms` - Fitzwilliam Museum
- `www.fitzmuseum.cam.ac.uk` - Fitzwilliam Museum
- `media.rijksmuseum.nl` - Rijksmuseum

## Getting Started

1. Ensure the backend API is running on port 9090
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3001 in your browser

## Future Enhancements

- Click-through to detailed artwork views
- Favorite/bookmark functionality
- Exhibition creation from selected artworks
- Advanced filtering options (date range, medium, etc.)
- Infinite scroll or pagination for large result sets
- Artwork comparison features
