import { ImageSearchResponse } from "../types/pywebview"
import ImageContainer from "./ImageContainer"
import CompactSearchBar from "./CompactSearchBar"

type ResultsContainerProps = {
    results: Array<ImageSearchResponse>;
    isLoading: boolean;
    originalImage: string | null;
    onNewSearch: (acceptedFiles: File[]) => void;
    onBackClick: () => void;
}

const ResultsContainer = ({
  results, 
  isLoading, 
  originalImage, 
  onNewSearch, 
  onBackClick
}: ResultsContainerProps) => {
  const placeholders = Array(10).fill(null).map((_, index) => index);

  return (
    <div className="p-8 mt-4 overflow-y-auto overflow-x-hidden h-[calc(100vh-80px)] overscroll-none">
      <div className="mb-6">
        <CompactSearchBar 
          onFileDrop={onNewSearch} 
          originalImage={originalImage} 
          onBackClick={onBackClick}
        />
      </div>
      
      <h2 className="text-2xl font-semibold mb-4 text-white">
        {isLoading ? 
          <div className="w-64 h-8 bg-gray-800 rounded animate-pulse"></div> :
          <>Search Results <span className="text-zinc-400 text-sm ml-2">{results.length} matches found</span></>
        }
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading ? (
          placeholders.map((index) => (
            <div 
              key={`placeholder-${index}`} 
              className="rounded-lg overflow-hidden bg-gray-800 animate-pulse"
            >
              <div className="w-full aspect-square"></div>
            </div>
          ))
        ) : (
          results.map((result) => (
            <ImageContainer key={result.id} image_data={result} />
          ))
        )}
      </div>

      {!isLoading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <p className="text-xl">No matching images found</p>
          <p className="text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}

export default ResultsContainer