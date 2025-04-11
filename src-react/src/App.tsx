import Navbar from "./components/Navbar"
import ImageSearchBar from "./components/ImageSearchBar"
import Sidebar from "./components/Sidebar"
import { useState } from "react";
import ResultsContainer from "./components/ResultsContainer";
import { ApiResponse, ImageSearchResponse } from "./types/pywebview";
import useSidebar from "./hooks/useSidebar";

function App() {
  const [searchResults, setSearchResults] = useState<ImageSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const {containerClass, open, setOpen, triggerSidebar} = useSidebar();


  const handleSearch = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setOriginalImage(base64String);
      
      window.pywebview.api.search_similar_img(base64String.split(',')[1], 15)
        .then((res: ApiResponse<ImageSearchResponse[]>) => {
          setSearchResults(res.data || []);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    };
    
    reader.readAsDataURL(acceptedFiles[0]);
  }

  const handleBackClick = () => {
    setSearchResults([]);
    setOriginalImage(null);
  }

  return (
    <main className="font-open-sans relative overflow-hidden">
      <Navbar triggerSidebar={triggerSidebar}/>
      {searchResults.length === 0 && !isLoading ? 
        <div className="flex flex-col items-center justify-center h-screen mt-[-100px]">
          <div className="flex flex-col items-center justify-center mb-20">
            <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">Discover Matches in Your Image Library</h1>
            <p className="text-center mt-4 text-base sm:text-lg text-zinc-500">Search your local images visually. Upload an image to find similar matches.</p>
          </div>
          <ImageSearchBar onFileDrop={handleSearch}/>
        </div>
        :
        <ResultsContainer 
          results={searchResults} 
          isLoading={isLoading} 
          originalImage={originalImage} 
          onNewSearch={handleSearch} 
          onBackClick={handleBackClick}
        /> 
      }
      
      <Sidebar open={open} setOpen={setOpen} containerClass={containerClass}/>
    </main>
  )
}

export default App
