interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface IndexImagesResponse {
    message?: string;
    processed_files: number;
    added: number;
    skipped: number;
    errors: number;
    duplicates: number;
}

interface MetaData {
    original_path: string;
    original_filename: string;
}

interface ImageSearchResponse {
    id: string;
    distance: number;
    metadata: MetaData;
    image_url: string;
}

interface ImageDetailsResponse {
    original_path: string;
    data_url: string;
    filename: string;
}

declare global {
    interface Window {
        addOutput: (message: string) => void;
        pywebview: {
            api: {
                search_similar_img: (img_b64: string, n_results: number) => Promise<ApiResponse<ImageSearchResponse[]>>;
                get_image_by_id: (image_id: string) => Promise<ApiResponse<ImageDetailsResponse>>;
                index_images: (image_folder: string) => Promise<ApiResponse<IndexImagesResponse>>;
                get_count: () => Promise<number>;
                get_folder_path: () => Promise<string>;
                open_file_in_explorer: (file_path: string) => Promise<ApiResponse<string>>;
            };
        };
    }
}

export {
    ApiResponse,
    ImageSearchResponse
};