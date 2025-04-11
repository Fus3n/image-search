import requests
import os
import re
import sys
import time
import argparse
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, unquote

# --- Configuration ---

# Pretend to be a browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"
}

# Where to save images
DEFAULT_SAVE_DIR = "google_images"

# --- Helper Functions ---

def fetch_image_urls(query: str, max_images: int, safe_search: bool = False):
    """
    Fetches a list of potential image URLs from Google Images search results.
    Returns a list of URLs.
    """
    safe_param = "&safe=active" if safe_search else "&safe=off"
    # Construct Google Images search URL
    # Using 'tbm=isch' for image search
    # Using 'q=' for the query
    # Adding 'hl=en' might help standardize results language/format
    search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en{safe_param}"

    print(f"Fetching search results page: {search_url}...")
    image_urls = set() # Use a set to avoid duplicates initially

    try:
        response = requests.get(search_url, headers=HEADERS, timeout=15)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        print("Parsing HTML content...")
        soup = BeautifulSoup(response.text, 'html.parser')

        # --- Google Image Scraping Magic ---
        # This is the most fragile part. Google embeds image data in script tags.
        # We need to find the right script tag and parse the data.
        # This pattern searches for script tags containing image data structures.
        # WARNING: This pattern is based on observed structure and WILL BREAK if Google changes it.
        
        # Common pattern: find script tags, look for data arrays/objects inside
        # Regex to find potential image URLs within script tags or img tags src/data-src
        # This regex tries to capture URLs ending with common image extensions.
        
        # Try finding URLs directly within the HTML text, often inside script tags as strings
        # This regex is quite broad but often effective for finding embedded URLs
        html_content = response.text
        # Improved regex to find likely image URLs (http/https, common extensions)
        # It tries to find URLs within quotes or specific structures.
        potential_urls = re.findall(r'"(https?://[^"]+?\.(?:png|jpg|jpeg|gif|bmp|webp))"', html_content)
        
        print(f"Found {len(potential_urls)} potential image URLs in the page source.")

        for url in potential_urls:
            # Basic filtering: Avoid obvious base64 data URIs and very short URLs
            if not url.startswith("data:image") and len(url) > 30:
                 # Sometimes URLs are escaped, try unquoting
                try:
                    decoded_url = bytes(url, 'utf-8').decode('unicode_escape') # Handle \u sequences
                    decoded_url = unquote(decoded_url) # Handle % sequences
                except Exception:
                    decoded_url = url # Fallback if decoding fails

                # Further filter common non-image domains or patterns if needed
                if "google.com" in decoded_url or "gstatic.com" in decoded_url:
                     # Often these are thumbnails or related assets, not the source image
                     # We might still want them if we can't find others.
                     pass # Keep them for now, but prioritize others if possible

                image_urls.add(decoded_url)

            if len(image_urls) >= max_images:
                 break # Stop once we have enough unique URLs

        # If still not enough, look for img tags (likely thumbnails)
        if len(image_urls) < max_images:
            print("Trying to find image URLs in <img> tags (might be thumbnails)...")
            img_tags = soup.find_all("img")
            for img in img_tags:
                src = img.get('src') or img.get('data-src')
                if src and src.startswith('http') and not src.startswith("data:image"):
                    try:
                         # Basic check for image-like extension in the URL path
                         if any(ext in src.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']):
                            image_urls.add(src)
                    except Exception:
                        pass # Ignore errors during processing src
                if len(image_urls) >= max_images:
                    break
                    
        print(f"Collected {len(image_urls)} unique potential image URLs.")
        return list(image_urls)[:max_images] # Return the required number

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"An error occurred during parsing: {e}", file=sys.stderr)
        # Consider saving response.text to a file here for debugging
        # with open("error_page.html", "w", encoding="utf-8") as f:
        #     f.write(response.text)
        # print("Saved error page HTML to error_page.html for debugging.")
        return []


def download_image(url: str, save_path: str):
    """Downloads a single image from a URL and saves it."""
    try:
        print(f"  Downloading: {url}")
        img_response = requests.get(url, headers=HEADERS, stream=True, timeout=10)
        img_response.raise_for_status()

        # Check content type if possible, although headers can be misleading
        content_type = img_response.headers.get('content-type')
        if content_type and 'image' not in content_type.lower():
            print(f"  Skipping URL (content-type not image): {content_type} - {url}")
            return False

        # Save the image
        with open(save_path, 'wb') as f:
            for chunk in img_response.iter_content(1024):
                f.write(chunk)
        print(f"  Saved to: {save_path}")
        time.sleep(0.1) # Small delay between downloads
        return True

    except requests.exceptions.Timeout:
        print(f"  Timeout downloading: {url}", file=sys.stderr)
        return False
    except requests.exceptions.RequestException as e:
        print(f"  Failed to download {url}: {e}", file=sys.stderr)
        return False
    except IOError as e:
        print(f"  Could not save image to {save_path}: {e}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"  An unexpected error occurred during download of {url}: {e}", file=sys.stderr)
        return False


# --- Main Execution ---

def main():
    parser = argparse.ArgumentParser(description="Scrape images from Google Images (without Selenium)")
    parser.add_argument("query", help="The search query for images.")
    parser.add_argument("-n", "--num_images", type=int, default=10, help="Number of images to attempt to download.")
    parser.add_argument("-d", "--directory", default=DEFAULT_SAVE_DIR, help="Directory to save images.")
    parser.add_argument("-ns", "--no-safe-search", action="store_true", help="Disable Google's SafeSearch filter.")

    args = parser.parse_args()

    query = args.query
    num_images_to_download = args.num_images
    save_dir = args.directory
    use_safe_search = not args.no_safe_search

    # --- Get Image URLs ---
    print(f"Searching for '{query}'...")
    image_urls = fetch_image_urls(query, num_images_to_download, use_safe_search)

    if not image_urls:
        print("No image URLs found. Exiting.")
        sys.exit(1)

    print(f"\nFound {len(image_urls)} image URLs. Attempting to download...")

    # --- Create Save Directory ---
    if not os.path.exists(save_dir):
        print(f"Creating directory: {save_dir}")
        os.makedirs(save_dir)
    else:
        print(f"Saving images to existing directory: {save_dir}")

    # --- Download Images ---
    downloaded_count = 0
    for i, url in enumerate(image_urls):
        if downloaded_count >= num_images_to_download:
            print(f"\nReached target of {num_images_to_download} successfully downloaded images.")
            break

        # Try to determine a file extension
        file_extension = ".jpg" # Default
        possible_extensions = re.findall(r'\.(png|jpg|jpeg|gif|bmp|webp)(?=[?&]|$)', url.lower())
        if possible_extensions:
            file_extension = f".{possible_extensions[-1]}" # Use the last found extension

        # Create filename
        # Sanitize query for use in filename
        safe_query = "".join(c if c.isalnum() else "_" for c in query)[:30]
        filename = f"{safe_query}_{downloaded_count + 1:03d}{file_extension}"
        save_path = os.path.join(save_dir, filename)

        # Download the image
        if download_image(url, save_path):
            downloaded_count += 1
        else:
            print(f"  Download failed for URL {i+1}.")

        # Add a small delay to be polite to servers
        time.sleep(0.2)


    print(f"\nFinished. Successfully downloaded {downloaded_count} images.")
    if downloaded_count < num_images_to_download:
         print(f"Could not download the requested {num_images_to_download} images. Only found/downloaded {downloaded_count}.")

if __name__ == "__main__":
    main()