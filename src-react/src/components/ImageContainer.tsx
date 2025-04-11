import { ImageSearchResponse } from "../types/pywebview"
import { useState } from "react"
import { FiFolder } from "react-icons/fi"

type ImageContainerProps = {
    image_data: ImageSearchResponse
}

const ImageContainer = ({image_data}: ImageContainerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenInExplorer = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click events
    
    if (!image_data.metadata.original_path || isOpening) return;
    
    setIsOpening(true);
    window.pywebview.api.open_file_in_explorer(image_data.metadata.original_path)
      .then(response => {
        if (!response.success) {
          console.error("Failed to open file:", response.error);
        }
      })
      .catch(error => {
        console.error("Error opening file:", error);
      })
      .finally(() => {
        setIsOpening(false);
      });
  };

  const addElipsis = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + "...";
    }
    return text;
  }
  return (
    <div 
      className="relative rounded-lg overflow-hidden bg-gray-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={image_data.image_url} 
        alt={image_data.metadata.original_filename} 
        className="w-full h-auto object-cover aspect-square" 
      />
      {isHovered && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 text-xs text-zinc-300 transition-all duration-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="truncate overflow-hidden whitespace-nowrap">{addElipsis(image_data.metadata.original_filename, 40)}</p>
              <p className="text-zinc-400">Similarity: {(1 - image_data.distance).toFixed(2)}</p>
            </div>
            <button 
              onClick={handleOpenInExplorer}
              className="p-1.5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
              title="Open in file explorer"
              disabled={isOpening}
            >
              <FiFolder size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageContainer