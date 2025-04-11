import webview
import image_search
import os
import sys
import subprocess

import chromadb

import tkinter as tk
from tkinter import filedialog

window = None
DB_PATH = os.environ.get("DB_PATH", "./image_db")
COLLECTION_NAME = os.environ.get("COLLECTION_NAME", "images")

class Api:

    def __init__(self) -> None:
        self.db_client = chromadb.PersistentClient(path=DB_PATH)
        self.collection = self.db_client.get_or_create_collection(name=COLLECTION_NAME)
    
    def search_similar_img(self, img_b64: str, n_results: int):
        try:
            res = image_search.search_similar_images(self.collection, img_b64, n_results)
            return {
                'success': True,
                'data': res
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
        
    def get_image_by_id(self, image_id: str):
        try:
            res = image_search.get_image_by_id(self.collection, image_id)
            return {
                'success': True,
                'data': res
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def index_images(self, image_folder: str):
        try:
            res = image_search.index_images_route(self.collection, image_folder, self.log_message)
            return {
                'success': True,
                'data': res
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_count(self):
        return self.collection.count()
    
    def log_message(self, message: str):
        if not window:
            print("Warning: No window found")
            return 
        
        window.evaluate_js(f'window.addOutput("{message}")')
    
    def delete_all(self):
        try:
            count = self.collection.count()
            self.db_client.delete_collection(name=COLLECTION_NAME)
            self.collection = self.db_client.get_or_create_collection(name=COLLECTION_NAME)
            return {
                'success': True,
                'data': f"Deleted {count} images"
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_folder_path(self):
        root = tk.Tk()
        root.withdraw()
        
        folder_path = filedialog.askdirectory(title="Select a Folder")
        root.destroy()
        return folder_path if folder_path else ""

    def open_file_in_explorer(self, file_path: str):
        try:
            if not os.path.exists(file_path):
                return {
                    'success': False,
                    'error': f"File not found: {file_path}"
                }
            
            if os.name == 'nt': 
                os.startfile(file_path)
            elif os.name == 'posix':  
                if sys.platform == 'darwin': 
                    subprocess.call(['open', '-R', file_path])
                else:  
                    subprocess.call(['xdg-open', os.path.dirname(file_path)])
            
            return {
                'success': True,
                'data': f"Opened file explorer at: {file_path}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

if __name__ == '__main__':
    api = Api()
    webview.settings['OPEN_DEVTOOLS_IN_DEBUG'] = False
    # for development
    # window = webview.create_window('ImageSearch', 'http://localhost:5173/', min_size=(1280, 820), js_api=api)
    # Run a built version: 
    window = webview.create_window('ImageSearch', '../src-react/dist/index.html', min_size=(1280, 820), js_api=api)
    webview.start(window, icon='./favicon.png', debug=False) # debug=True for development