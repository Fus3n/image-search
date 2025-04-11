# ImageSearch - React Frontend

This is the frontend component of the Img2Img API project, built with React, TypeScript, and Vite.

## Overview

The frontend provides:
- User interface for image similarity search
- Image upload and display functionality
- Search results visualization
- Interaction with the Python backend via PyWebView API

## Requirements

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
   ```bash
   cd src-react
   npm install
   ```
   or with yarn:
   ```bash
   cd src-react
   yarn
   ```

2. Development Setup

   For standalone development (without Python backend):
   ```bash
   npm run dev
   ```
   This starts a development server at `http://localhost:5173/`

## Building for Production

Build the frontend for production:
```bash
npm run build
```

This creates optimized files in the `dist` directory that will be served by the Python backend.

## Project Structure

- `src/`: Source code
  - `components/`: React components
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions
  - `App.tsx`: Main application component
  - `main.tsx`: Application entry point

## Features

- Drag-and-drop image uploads
- Similar image search using vector embeddings
- Responsive design with Tailwind CSS
- Image preview and detail views
- File explorer integration

## Development Notes

- The app is configured to use the Python API through pywebview
- In development mode, you may need to mock API calls
- The production build is designed to be served from the Python backend with pywebview 
