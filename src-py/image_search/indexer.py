import chromadb
import os
import argparse
import sys
from .feature_extractor import extract_features

def index_images(collection, image_folder):
    """Indexes all images found in the specified folder into a ChromaDB collection."""
    if not os.path.isdir(image_folder):
        print(f"Error: Image folder not found: {image_folder}", file=sys.stderr)
        sys.exit(1)

    print(f"Scanning image folder: {image_folder}")
    image_paths = []
    for f in os.listdir(image_folder):
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.webp')):
            image_paths.append(os.path.join(image_folder, f))

    if not image_paths:
        print("No images found in the specified folder.")
        return

    print(f"Found {len(image_paths)} images. Starting indexing...")
    indexed_count = 0
    skipped_count = 0
    error_count = 0

    # Get existing IDs to avoid duplicates if re-running
    existing_ids = set(collection.get()['ids'])
    print(f"Found {len(existing_ids)} existing items in the collection.")

    for i, path in enumerate(image_paths):
        relative_path = os.path.relpath(path, image_folder)
        img_id = f"img_{relative_path.replace(os.sep, '_').replace(' ', '_')}"

        if img_id in existing_ids:
            print(f"Skipping already indexed: {path} (ID: {img_id})")
            skipped_count += 1
            continue

        try:
            vector = extract_features(path)
            if vector is not None:
                collection.add(
                    embeddings=[vector.tolist()], 
                    metadatas=[{"original_path": path, "original_filename": os.path.basename(path)}],
                    ids=[img_id]
                )
                print(f"Indexed [{i+1}/{len(image_paths)}]: {os.path.basename(path)}")
                indexed_count += 1
            else:
               
                error_count += 1


        except Exception as e:
            print(f"Error indexing {path} (ID: {img_id}): {e}", file=sys.stderr)
            error_count += 1

    print("\n--- Indexing Summary ---")
    print(f"Successfully indexed: {indexed_count}")
    print(f"Skipped (already indexed): {skipped_count}")
    print(f"Errors (feature extraction or DB add): {error_count}")
    print(f"Total processed: {indexed_count + skipped_count + error_count}")


def main():
    parser = argparse.ArgumentParser(description="Index images from a folder into ChromaDB.")
    parser.add_argument("image_folder", help="Path to the folder containing images to index.")
    parser.add_argument("-db", "--db-path", default="./image_db", help="Path to the ChromaDB persistent storage directory (default: ./image_db).")
    parser.add_argument("-c", "--collection", default="images", help="Name of the ChromaDB collection to use (default: images).")

    args = parser.parse_args()

    db_path = args.db_path
    collection_name = args.collection
    
    try:
        client = chromadb.PersistentClient(path=db_path)
        collection = client.get_or_create_collection(name=collection_name)
    except Exception as e:
        print(f"Error initializing ChromaDB client at {db_path}: {e}", file=sys.stderr)
        sys.exit(1)
    
    index_images(collection,args.image_folder)

if __name__ == "__main__":
    main()
