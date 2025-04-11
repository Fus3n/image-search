import os
from typing import List, Dict, Any
import uuid 
import base64
import io
from pathlib import Path
from PIL import Image

from .feature_extractor import extract_features

def get_base64_image(image_path: str) -> str:
    image = Image.open(image_path)  
    buffered = io.BytesIO()
    image.save(buffered, format=image.format)

    image_bytes = buffered.getvalue()
    base64_string = base64.b64encode(image_bytes).decode('utf-8')
    mime_type = f"image/{image.format.lower()}"  
    data_url = f"data:{mime_type};base64,{base64_string}"

    return data_url


def search_similar_images(collection, b64_img: str, n_results: int) -> List[Dict[str, Any]]:
    """
    Accepts an image upload, extracts features, queries ChromaDB,
    and returns similar images with URLs pointing to the /image/{id} endpoint.
    """
    if not collection:
         raise Exception("Database not available.")

    try:
        # Conver b64_img to bytes
        try:
            image_data = base64.b64decode(b64_img)
            image_stream = io.BytesIO(image_data)
        except Exception as e:
            raise ValueError("Invalid base64 image data") from e

        image_bytes = image_stream.read()
        query_vector = extract_features(image_bytes)

        if query_vector is None:
            raise Exception("Could not process image. Feature extraction failed.")

        results = collection.query(
            query_embeddings=[query_vector.tolist()],
            n_results=n_results,
            include=['metadatas', 'distances']
        )

        output = []
        ids = results.get('ids', [[]])[0]
        distances = results.get('distances', [[]])[0]
        metadatas = results.get('metadatas', [[]])[0]

        for img_id, dist, meta in zip(ids, distances, metadatas):
             data_url = get_base64_image(meta.get('original_path'))

             output.append({
                 "id": img_id,
                 "distance": round(dist, 4),
                 "metadata": meta, 
                 "image_url": data_url 
             })

        return output
    except Exception as e:
        print(f"Error during search: {e}")

def get_image_by_id(collection, image_id: str):
    """
    Retrieves an image file directly from its original path based on its ID.
    Looks up the ID in ChromaDB to find the file path stored in metadata.
    """
    if not collection:
        raise Exception("Database not available.")

    try:
        # Query ChromaDB for the specific ID, requesting metadata
        results = collection.get(ids=[image_id], include=['metadatas'])

        if not results or not results.get('ids') or not results['ids']:
            raise Exception(f"Image ID '{image_id}' not found.")

        metadata = results['metadatas'][0] if results.get('metadatas') else None
        # Use 'original_path' which we store during indexing
        original_path = metadata.get('original_path') if metadata else None

        if not original_path:
            raise Exception(f"Path metadata missing for image ID '{image_id}'.")

        if not os.path.exists(original_path):
            print(f"Error: File not found at path stored for ID {image_id}: {original_path}")
            raise Exception(f"Image file not found on server for ID '{image_id}'. Was it moved or deleted?")

        data_url = get_base64_image(original_path)

        return {
            "original_path": original_path,
            "data_url": data_url,
            "filename": os.path.basename(original_path)
        }
    except Exception as e:
        print(f"Error retrieving image {image_id}: {e}")
        raise Exception(f"Error retrieving image {image_id}")
        

def index_images_route(collection, image_folder: str, callback_logmsg):
    """
    Indexes images from a specified folder:
    1. Extracts features.
    2. Stores features and metadata (including ORIGINAL path) in ChromaDB.
    DOES NOT copy images.
    """
    if not collection:
        raise Exception("Database not available.")
    if not os.path.isdir(image_folder):
        raise Exception(f"Invalid folder path: {image_folder}")

    added_count = 0
    skipped_count = 0
    error_count = 0
    duplicate_count = 0
    processed_files = 0

    # get all existing image paths from collection to check for duplicates
    try:
        all_items = collection.get(include=["metadatas"])
        existing_paths = set()
        if all_items and "metadatas" in all_items and all_items["metadatas"]:
            for metadata in all_items["metadatas"]:
                if metadata and "original_path" in metadata:
                    existing_paths.add(Path(metadata["original_path"]).resolve())
        callback_logmsg(f"Found {len(existing_paths)} existing images in database")
    except Exception as e:
        callback_logmsg(f"Error retrieving existing images: {e}")
        existing_paths = set()

    # print(existing_paths)
    try:
        with os.scandir(image_folder) as it:
            for entry in it:
                if entry.is_file() and entry.name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp')):
                    processed_files += 1
                    file_path = entry.path # full path
                    filename = entry.name

                    if Path(file_path).resolve() in existing_paths:
                        callback_logmsg(f"Skipping duplicate [{processed_files}]: {filename}")
                        duplicate_count += 1
                        skipped_count += 1
                        continue

                    try:
                        with open(file_path, "rb") as f:
                            image_bytes = f.read()

                        features = extract_features(image_bytes)
                        if features is None:
                            callback_logmsg(f"Warning: Could not extract features for {filename}. Skipping.")
                            skipped_count += 1
                            continue

                        image_id = f"img_{uuid.uuid4().hex}"

                        collection.add(
                            ids=[image_id],
                            embeddings=[features.tolist()],
                            metadatas=[{
                                "original_path": file_path,
                                "original_filename": filename
                            }]
                        )
                        added_count += 1
                        existing_paths.add(file_path)  # Add to our tracking set
                        callback_logmsg(f"Indexed [{processed_files}]: {filename} (ID: {image_id})")

                    except Exception as e:
                        callback_logmsg(f"Error processing file {filename}: {e}")
                        error_count += 1

        if processed_files == 0:
             return {"message": "No processable image files found in the specified folder.", "added": 0, "skipped": 0, "errors": 0, "duplicates": 0}


        return {
            "message": f"Indexing complete for folder: {image_folder}",
            "processed_files": processed_files,
            "added": added_count,
            "skipped": skipped_count,
            "errors": error_count,
            "duplicates": duplicate_count
        }

    except FileNotFoundError:
         raise Exception(status_code=404, detail=f"Source folder not found: {image_folder}")
    except Exception as e:
        callback_logmsg(f"Error during indexing process: {e}")
        raise Exception(f"An error occurred during indexing: {e}")

