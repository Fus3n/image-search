import { IoMdImages } from "react-icons/io";
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';


type ImageSearchBarProps = {
    onFileDrop: (acceptedFiles: File[]) => void
}

const ImageSearchBar = ({ onFileDrop }: ImageSearchBarProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFileDrop(acceptedFiles);
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
        <div className="p-5 w-md h-80 rounded-2xl bg-zinc-800 border-1 border-zinc-600 bg-gradient-to-t from-neutral-900/40 via-neutral-900/10 to-transparent bottom-shine">
            <div>
                <p className="text-2xl font-semibold text-zinc-200">Upload an image</p>
                <p className="text-zinc-400 text-sm mt-1">It must be a .jpg, .png, .jpeg, .webp, bmp file.</p>
            </div>

            <div {...getRootProps()} className={`mt-3 h-[78%] w-full rounded-md border-2 border-dashed border-zinc-600 cursor-pointer ${isDragActive ? 'border-blue-500 bg-zinc-700/50' : ''}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center h-full">
                    <IoMdImages className="text-6xl text-zinc-600" />
                    {
                        isDragActive ?
                            <p className="text-blue-400 text-lg mt-1 mb-2">Drop the file here ...</p> :
                            <>
                                <p className="text-zinc-400 text-lg mt-1 mb-2">Drag & Drop</p>
                                <p className="text-zinc-400 text-sm ">or <span className="text-zinc-200 cursor-pointer">click to upload</span></p>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default ImageSearchBar