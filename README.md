# ImageSearch

A desktop application for searching similar images using vector embeddings and neural networks.

## Project Overview

This application allows users to:
- Index large image collections
- Search for similar images using a reference image
- View and explore search results
- Open images in the system file explorer

The application leverages PyWebView to create a desktop window containing a React-based UI, with Python handling the backend image processing and search functionality.

## Architecture

The project is organized into two main components:

1. **Python Backend** (`src-py/`):
   - Handles image processing and similarity search
   - Manages the image database using ChromaDB
   - Creates the desktop window with PyWebView
   - Exposes an API for the frontend to use

2. **React Frontend** (`src-react/`):
   - Provides the user interface
   - Handles image upload and display
   - Communicates with the Python backend via PyWebView API
   - Built with React, TypeScript, and Vite

## Getting Started

### Prerequisites

- Python 3.11+
- uv for python package-management
- Node.js 18+
- npm or yarn

### Setup

1. Set up the React frontend:
   ```bash
   cd src-react
   npm install
   npm run build
   ```

2. Set up the Python backend:
   ```bash
   cd src-py
   uv sync
   ```

### Running the Application

Start the UI desktop window:
```bash
cd src-py
uv run main.py # first run it will download a model
```

This will launch a desktop window containing the application UI.

## Development

For development, you can run both components separately:

1. Start the React development server:
   ```bash
   cd src-react
   npm run dev
   ```

2. Configure the Python backend to connect to the dev server:
   - Edit `src-py/main.py` and update the URL in `webview.create_window()` to point to `http://localhost:5173/`
   - Run `python main.py` in the `src-py` directory

## License

[MIT License](LICENSE)

## Known Issues
- Stop indexing button does not work
- No way to delete index from within UI


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 