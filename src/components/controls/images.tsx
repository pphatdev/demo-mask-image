import { useState, useEffect, useRef, useCallback } from 'react';
import { useExampleImages } from '@app/hooks/useExampleImages';
import Image from 'next/image';
import { DownloadIcon, UploadIcon } from '@radix-ui/react-icons';

type ImageItem = {
    id: number;
    path: string;
    name: string;
};

type ImagesProps = {
    selectedImage?: string | null;
    setSelectedImage: (imagePath: string | null) => void;
};

export const Images = ({ selectedImage, setSelectedImage }: ImagesProps) => {
    const [displayImages, setDisplayImages] = useState<ImageItem[]>([]);
    const { images, loading, error } = useExampleImages();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [storageError, setStorageError] = useState<string | null>(null);

    // Load images from session storage
    const loadImagesFromSession = useCallback((): ImageItem[] => {
        try {
            const storedImages = sessionStorage.getItem('uploadedImages');
            return storedImages ? JSON.parse(storedImages) : [];
        } catch (err) {
            console.error('Failed to load images from session storage:', err);
            return [];
        }
    }, []);

    // On initial load, check if there was a previously selected image ID
    useEffect(() => {
        const savedSelectionId = sessionStorage.getItem('selectedImageId');
        if (savedSelectionId) {
            // Find the image with this ID
            const allImages = loadImagesFromSession();
            const selectedImg = allImages.find(img => img.id.toString() === savedSelectionId);

            if (selectedImg) {
                setSelectedImage(selectedImg.path);
            } else {
                // If we can't find the image by ID, try to use the old path method
                const savedPath = sessionStorage.getItem('selectedImage');
                if (savedPath) {
                    setSelectedImage(savedPath);
                }
            }
        }
    }, [setSelectedImage, loadImagesFromSession]);

    // Load images from both API and session storage
    useEffect(() => {
        // Load from API
        if (images) {
            // Convert the image filenames into template objects
            const imageList = images.map((filename, index) => ({
                id: index + 1,
                path: `/assets/example/template/${filename}`,
                name: filename.split('.')[0] // Use filename (without extension) as name
            }));

            // Load from session storage
            const sessionImages = loadImagesFromSession();

            // Combine both sources
            setDisplayImages([...imageList, ...sessionImages]);
        }
    }, [images, loadImagesFromSession]);

    // Save uploaded images to session storage
    const saveImageToSession = useCallback((image: ImageItem) => {
        try {
            // Get existing stored images
            const storedImages = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');

            // Add new image
            const updatedImages = [...storedImages, image];

            // Try to save to session storage
            try {
                sessionStorage.setItem('uploadedImages', JSON.stringify(updatedImages));
                setStorageError(null); // Clear any previous errors
            } catch (storageErr) {
                console.error('Storage quota exceeded:', storageErr);
                setStorageError('Storage quota exceeded. Some images may not persist after refresh.');

                // Still update the state for current session
                return true;
            }

            return true;
        } catch (err) {
            console.error('Failed to save image to session storage:', err);
            return false;
        }
    }, []);

    // Save selected image reference by ID instead of path
    const saveSelectedImageId = useCallback((imageId: number) => {
        try {
            sessionStorage.setItem('selectedImageId', imageId.toString());
        } catch (storageErr) {
            console.error('Failed to save selected image ID to storage:', storageErr);
            setStorageError('Selected image reference could not be saved due to storage limitations.');
        }
    }, []);

    const handleImageClick = useCallback((image: ImageItem) => {
        // Save the selected image ID instead of the full path
        saveSelectedImageId(image.id);
        setSelectedImage(image.path);
    }, [setSelectedImage, saveSelectedImageId]);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size before processing
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setStorageError('Image may be too large to save in browser storage. It will be available for this session only.');
            }

            // Use FileReader to convert file to data URL (base64 string)
            const reader = new FileReader();

            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;

                // Create a new image object with a unique ID
                const newImageId = Date.now();
                const newImage: ImageItem = {
                    id: newImageId,
                    path: dataUrl,
                    name: file.name.split('.')[0]
                };

                // Add to display images
                setDisplayImages(prev => [...prev, newImage]);

                // Save to session storage
                saveImageToSession(newImage);

                // Automatically select the new image using ID instead of path
                saveSelectedImageId(newImageId);
                setSelectedImage(dataUrl);
            };

            // Read file as data URL
            reader.readAsDataURL(file);
        }

        // Reset the file input to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [setSelectedImage, saveImageToSession, saveSelectedImageId]);

    return (
        <section id='gallery-images'>
            {error && <p className="text-red-500">Error loading examples images: {error}</p>}
            {storageError && <p className="text-amber-500 mb-2">{storageError}</p>}
            <div className="flex space-x-4 py-2.5 overflow-x-auto overflow-y-hidden px-1 select-none">
                {loading ? (
                    <>
                        {[...Array(7)].map((_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="aspect-square relative mb-3 size-14 bg-foreground/5 rounded-lg animate-pulse"
                            >
                                <span className="text-[12px] w-full text-foreground h-3 rounded-full bg-foreground/5 animate-pulse text-center absolute inset-x-0 -bottom-5"></span>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {displayImages.map((image) => (
                            <div
                                key={image.id}
                                className={`aspect-square size-14 bg-white/50 relative mb-2 rounded cursor-pointer hover:ring-2 transition-all ${selectedImage === image.path ? 'ring-2 ring-primary' : 'ring-primary/0'}`}
                                onClick={() => handleImageClick(image)}
                            >
                                <Image
                                    src={image.path}
                                    alt={image.name}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover rounded aspect-square"
                                    onError={(e) => {
                                        console.error(`Failed to load image: ${image.path}`);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <span className="text-[12px] text-foreground w-full text-center absolute inset-x-0 -bottom-5 line-clamp-1">{image.name}</span>
                            </div>
                        ))}

                        <div className='bg-foreground/5 z-50 absolute right-3 top-3 ring-1 w-fit ml-auto ring-foreground/10 justify-end flex rounded-full p-1'>
                            <button
                                aria-label={`Browse`}
                                type="button"
                                onClick={handleUploadClick}
                                className="flex cursor-pointer rounded-full p-2 hover:ring hover:text-primary ring-foreground/20 outline-none hover:bg-foreground/10 transition-all items-center justify-center"
                            >
                                <UploadIcon className='size-4' />
                                <span className="sr-only">Browse</span>
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};