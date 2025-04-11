import numpy as np
from PIL import Image, UnidentifiedImageError 
import io 
from sentence_transformers import SentenceTransformer
import os

try:
    model_name = os.environ.get("MODEL_NAME", "clip-ViT-B-32")
    model = SentenceTransformer(model_name)
except Exception as e:
    raise Exception(f"Could not load SentenceTransformer model: {e}")

def extract_features(file_bytes: bytes):
    """Extracts features from image bytes using a pre-trained SentenceTransformer model"""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        embedding = model.encode(img, convert_to_numpy=True)

        if embedding is None:
             raise Exception("Model returned None for the image.")

        return embedding.astype(np.float32)

    except UnidentifiedImageError:
        raise Exception("Could not identify image format from bytes.")
    except Exception as e:
        raise Exception(f"Error processing image with SentenceTransformer model: {e}")


