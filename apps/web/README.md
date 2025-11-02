# PEPETOR-MINER Frontend

Modern React web application built with Vite for PEPETOR-MINER.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your backend API URL

## Development

```bash
# Start development server with hot reload
npm run dev
```

The app will open on `http://localhost:3000` by default.

## Build

```bash
# Build for production
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── main.jsx              # React entry point
├── App.jsx              # Main App component
├── App.css              # App styling
├── components/          # Reusable components
├── pages/              # Page components
│   └── HomePage.jsx
├── services/           # API service
│   └── api.js
├── hooks/              # Custom React hooks
│   └── useFetch.js
├── styles/             # Global styles
│   └── index.css
├── utils/              # Utility functions
└── assets/             # Images, fonts, etc.
```

## API Integration

The app uses Axios for API calls. Configure the backend URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues

## Environment Variables

See `.env.example` for all available configuration options.

## Features

- ⚛️ Modern React 18 with Hooks
- 🚀 Fast development with Vite
- 🎨 Responsive CSS styling
- 🔗 API integration with Axios
- 📱 Mobile-friendly design
- 🌍 React Router for navigation

## Production Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. Upload the `dist/` folder to your hosting service:
   - AWS S3 + CloudFront
   - Vercel
   - Netlify
   - Any static hosting

3. Configure environment variables for production API

## Contributing

1. Create a new branch for features
2. Follow existing code patterns
3. Test your changes
4. Submit a pull request

## License

ISC
