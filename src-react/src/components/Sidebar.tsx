import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaCircleStop } from "react-icons/fa6";

type SidebarProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    containerClass: string
}

const Sidebar = ({open, setOpen, containerClass}: SidebarProps) => {
    const [folder, setFolder] = useState("");
    const [loading, setLoading] = useState(false);
    const [outputData, setOutputData] = useState<string[]>([]);


    const addOutput = (data: string) => {
        setOutputData(prev => [...prev, data])
    }

    useEffect(() => {

        window.addOutput = addOutput; 

        if (window.pywebview && window.pywebview.api && window.pywebview.api.get_count !== undefined) {
            window.pywebview.api.get_count().then((res: number) => {
                setOutputData([])
                addOutput(`${res} Images indexed`)
            })
          } else {
            const interval = setInterval(() => {
              if (window.pywebview && window.pywebview.api) {
                window.pywebview.api.get_count().then((res: number) => {
                    setOutputData([])
                    addOutput(`${res} Images indexed`)
                    clearInterval(interval);
                })
              }
            }, 200);
            return () => clearInterval(interval);
          }
    }, [])

    const indexImages = async () => {
        if (!folder) return;
        
        setLoading(true);
        const res = await window.pywebview.api.index_images(folder)
        setOutputData([])
        if (res.success) {
            addOutput(`Indexing complete`);
            addOutput(`Processed: ${res?.data?.processed_files}`);
            addOutput(`Added: ${res?.data?.added}`);
            addOutput(`Skipped: ${res?.data?.skipped}`);
            addOutput(`Errors: ${res?.data?.errors}`);
            addOutput(`Duplicates: ${res?.data?.duplicates}`);
        } else {
            setOutputData([res.error || "Unknown error"])
        }
        const totalCount = await window.pywebview.api.get_count();
        addOutput(`${totalCount} Images indexed`);
        setLoading(false);
    }

    const handleGetFolder = async () => {
        try {
            const result = await window.pywebview.api.get_folder_path();
            if (result) {
                setFolder(result);
            }
        } catch (error) {
            console.error("Error selecting folder:", error);
        }
    }

    return (
        <div className={`${containerClass} absolute border-l-1 shadow-[0_5px_50px_rgba(0,0,0,0.25)] border-neutral-700 rounded-sm w-96 right-0 top-0 bg-zinc-800 h-full z-50 p-8`}>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-zinc-200">Settings</h1>
                <IoClose className="text-zinc-400 text-2xl cursor-pointer hover:brightness-110" onClick={() => setOpen(!open)} />
            </div>

            <div>
                <div className="mt-5">
                    <p className="text-lg font-semibold text-zinc-200">Image Folder</p>
                </div>
                <div className="mt-3 h-12 w-full">
                    {folder ? (
                        <div className="relative flex items-center w-full h-full">
                            <div 
                                className="w-full h-full rounded-md border-2 border-zinc-600 px-2 py-2 flex items-center justify-between cursor-pointer hover:border-zinc-400 group"
                                onClick={handleGetFolder}
                            >
                                <span className="text-zinc-400 text-lg truncate">{folder}</span>
                                <button 
                                    className="flex-shrink-0 text-zinc-500 group-hover:text-zinc-300 ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFolder('');
                                    }}
                                    aria-label="Clear folder selection"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleGetFolder}
                            className="w-full h-full bg-transparent rounded-md border-2 border-zinc-600 outline-none hover:border-zinc-400 text-zinc-400 text-lg p-2 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Select Folder
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <button 
                        className={`${loading ? "pointer-events-none bg-zinc-900/50" : "bg-zinc-700"} mt-3 w-full h-12 rounded-md  hover:bg-zinc-600 text-zinc-200 text-lg flex items-center justify-center cursor-pointer`}
                        onClick={indexImages}
                    >
                        {loading ? "Indexing..." : `Start Indexing`}
                    </button>

                    <button 
                        className={`${loading ? "mt-3 w-[25%] h-12 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-lg flex items-center justify-center cursor-pointer" : "hidden"}`}
                        onClick={() => setLoading(false)}
                    >
                        <FaCircleStop className="text-xl"/>
                    </button>
                </div>

                <div className="mt-3 h-48 w-full rounded-md bg-zinc-700 border-1 border-zinc-600 overflow-y-auto p-2">
                    {outputData.map((line, index) => (
                        <p key={index} className="text-zinc-400 text-sm">{line}</p>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Sidebar