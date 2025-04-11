import { IoMdImages } from "react-icons/io";
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";

type CompactSearchBarProps = {
  onFileDrop: (acceptedFiles: File[]) => void;
  originalImage: string | null;
  onBackClick: () => void;
}

const CompactSearchBar = ({ onFileDrop, originalImage, onBackClick }: CompactSearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileDrop(acceptedFiles);
    setIsExpanded(false);
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
    },
    multiple: false
  });

  return (
    <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 transition-all duration-300 shadow-md">
      <button 
        onClick={onBackClick}
        className="p-3 text-zinc-400 hover:text-white transition-colors"
        aria-label="Go back"
      >
        <FiArrowLeft size={20} />
      </button>

      {originalImage && (
        <div className="h-12 w-12 border-r border-zinc-700 flex-shrink-0">
          <img 
            src={originalImage} 
            alt="Original search" 
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="relative flex-1">
        {isExpanded ? (
          <div 
            {...getRootProps()} 
            className={`p-4 cursor-pointer ${isDragActive ? 'bg-zinc-700' : 'bg-zinc-800'}`}
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center">
              <IoMdImages className="text-2xl text-zinc-500 mr-2" />
              {isDragActive ? (
                <p className="text-blue-400">Drop to search...</p>
              ) : (
                <p className="text-zinc-400">Drop image or click to upload</p>
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsExpanded(true)} 
            className="w-full h-12 px-4 flex items-center text-left text-zinc-400 hover:text-white"
          >
            <FiRefreshCw className="mr-2" /> Try another search
          </button>
        )}
      </div>
    </div>
  );
};

export default CompactSearchBar; 