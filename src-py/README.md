# ImageSearch - Python Backend

This is the backend component of the ImageSearch project, built with Python and PyWebView.

## Overview

The backend provides:
- Image similarity search using ChromaDB
- Image indexing capabilities
- API endpoints for the React frontend
- Desktop window creation via PyWebView

## Requirements

- Python 3.11+
- Dependencies listed in `pyproject.toml`

## Setup

1. Setup a virtual environment:
   ```bash
   cd src-py
   uv sync # installs dependencies and creates venv if doesn't exists
   ```

3. Install dependencies:
   ```bash
   pip install -e .
   ```

4. Configure environment variables (optional):
   - Create/edit `.env` file to customize settings
   - Available settings:
     - `DB_PATH`: Path to store image database (default: "./image_db")
     - `COLLECTION_NAME`: Name for ChromaDB collection (default: "images")

## Running the Application

Start the backend server:
```bash
uv run main.py # first run it will download a model
```

This will launch a window containing the frontend application.

## API Endpoints

The backend exposes the following JavaScript API endpoints through PyWebView:

- `search_similar_img(img_b64, n_results)`: Search for similar images by base64 image
- `get_image_by_id(image_id)`: Retrieve image by ID
- `index_images(image_folder)`: Index all images in a folder
- `get_count()`: Get the total number of indexed images
- `delete_all()`: Delete all indexed images
- `get_folder_path()`: Open folder selection dialog
- `open_file_in_explorer(file_path)`: Open file in system explorer

## Directory Structure

- `main.py`: Entry point and API implementation
- `image_search/`: Contains image search and indexing functionality
- `image_db/`: Default location for the ChromaDB database
