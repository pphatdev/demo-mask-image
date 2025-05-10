import { useState, useEffect, useRef } from 'react';
import { useExampleImages } from '@app/hooks/useExampleImages';
import Image from 'next/image';

type ImageItem = {
    id: number;
    path: string;
    name: string;
};

type ImagesProps = {
    selectedImage?: string | null;
    onImageSelect?: (imagePath: string) => void;
};

export const Images = ({ selectedImage, onImageSelect }: ImagesProps = {}) => {
    const [displayImages, setDisplayImages] = useState<ImageItem[]>([]);
    const { images, loading, error } = useExampleImages();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [storageError, setStorageError] = useState<string | null>(null);

    // On initial load, check if there was a previously selected image ID
    useEffect(() => {
        const savedSelectionId = sessionStorage.getItem('selectedImageId');
        if (savedSelectionId) {
            // Find the image with this ID
            const allImages = loadImagesFromSession();
            const selectedImg = allImages.find(img => img.id.toString() === savedSelectionId);

            if (selectedImg && onImageSelect) {
                onImageSelect(selectedImg.path);
            } else {
                // If we can't find the image by ID, try to use the old path method
                const savedPath = sessionStorage.getItem('selectedImage');
                if (savedPath && onImageSelect) {
                    onImageSelect(savedPath);
                }
            }
        }
    }, [onImageSelect]);

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
    }, [images]);

    // Save uploaded images to session storage
    const saveImageToSession = (image: ImageItem) => {
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
    };

    // Load images from session storage
    const loadImagesFromSession = (): ImageItem[] => {
        try {
            const storedImages = sessionStorage.getItem('uploadedImages');
            return storedImages ? JSON.parse(storedImages) : [];
        } catch (err) {
            console.error('Failed to load images from session storage:', err);
            return [];
        }
    };

    // Save selected image reference by ID instead of path
    const saveSelectedImageId = (imageId: number) => {
        try {
            sessionStorage.setItem('selectedImageId', imageId.toString());
        } catch (storageErr) {
            console.error('Failed to save selected image ID to storage:', storageErr);
            setStorageError('Selected image reference could not be saved due to storage limitations.');
        }
    };

    const handleImageClick = (image: ImageItem) => {
        if (onImageSelect) {
            // Save the selected image ID instead of the full path
            saveSelectedImageId(image.id);
            onImageSelect(image.path);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                if (onImageSelect) {
                    saveSelectedImageId(newImageId);
                    onImageSelect(dataUrl);
                }
            };

            // Read file as data URL
            reader.readAsDataURL(file);
        }

        // Reset the file input to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <section id='gallery-images'>
            <h2 className="text-2xl font-bold mb-4">Gallery Images</h2>
            {error && <p className="text-red-500">Error loading examples images: {error}</p>}
            {storageError && <p className="text-amber-500 mb-2">{storageError}</p>}
            <div className="grid grid-cols-6 gap-4 select-none">
                {loading ? (
                    <>
                        {[...Array(12)].map((_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="aspect-square bg-foreground/5 rounded-lg animate-pulse"
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {displayImages.map((image) => (
                            <div
                                key={image.id}
                                className={`aspect-square bg-foreground/5 rounded-lg cursor-pointer hover:ring-2 transition-all ${selectedImage === image.path ? 'ring-2 ring-primary' : 'ring-primary/0'}`}
                                onClick={() => handleImageClick(image)}
                            >
                                <Image
                                    src={image.path}
                                    alt={image.name}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-fill rounded-lg aspect-square"
                                    onError={(e) => {
                                        console.error(`Failed to load image: ${image.path}`);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        ))}
                        {/* Upload button */}
                        <div
                            className="aspect-square bg-foreground/5 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary transition-all flex items-center justify-center"
                            onClick={handleUploadClick}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="sr-only">Upload image</span>
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