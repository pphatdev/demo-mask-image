import React, { useEffect, useRef } from "react";

export const Canvas = () => {
    // Add states for image uploads
    const [recentImages, setRecentImages] = React.useState<Array<{ id: string, name: string, dataUrl: string }>>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Add to existing states
    const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(null);
    const [imageScale, setImageScale] = React.useState<number>(1);
    const [maskScale, setMaskScale] = React.useState<number>(1);
    const [selectedMask, setSelectedMask] = React.useState<string>('mask-2.png');
    const [customMask, setCustomMask] = React.useState<HTMLImageElement | null>(null);
    const [imageData, setImageData] = React.useState<{ img: HTMLImageElement | null, mask: HTMLImageElement | null }>({
        img: null,
        mask: null
    });
    const [recentMasks, setRecentMasks] = React.useState<Array<{ id: string, name: string, isCustom?: boolean, dataUrl?: string }>>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Available masks
    const availableMasks = [
        { id: 'mask-1.png', name: 'Circle' },
        { id: 'mask-2.png', name: 'Rounded Square' },
        { id: 'mask-3.png', name: 'Heart' },
        { id: 'mask-4.png', name: 'Star' },
        { id: 'mask-5.png', name: 'Hexagon' }
    ];

    // Function to load recent masks from localStorage on component mount
    useEffect(() => {
        try {
            const savedRecentMasks = localStorage.getItem('recentMasks');
            if (!savedRecentMasks) return;

            const parsedMasks = JSON.parse(savedRecentMasks);

            // Load each mask's data from its separate storage item
            const masksWithData = parsedMasks.map((mask: any, index: number) => {
                let dataUrl = undefined;

                if (mask.isCustom) {
                    try {
                        dataUrl = localStorage.getItem(`recentMaskData_${index}`);
                    } catch (err) {
                        console.warn(`Couldn't retrieve mask data for mask ${index}`, err);
                    }
                }

                return {
                    ...mask,
                    dataUrl
                };
            });

            setRecentMasks(masksWithData);
        } catch (e) {
            console.error("Error loading recent masks:", e);
        }
    }, []);

    // Function to add mask to recent masks
    const addToRecentMasks = (maskId: string, customDataUrl?: string) => {
        const isCustom = maskId === 'custom';
        const maskName = isCustom
            ? 'Custom Mask'
            : availableMasks.find(m => m.id === maskId)?.name || 'Unknown';

        // Process custom mask dataUrl to prevent storage quota issues
        let processedDataUrl = customDataUrl;
        if (isCustom && customDataUrl) {
            // Reduce the size of the data URL by resizing the image
            try {
                const tempImg = new Image();
                tempImg.src = customDataUrl;

                // Create a temporary canvas to resize the image
                const tempCanvas = document.createElement('canvas');
                const ctx = tempCanvas.getContext('2d');

                // Set even smaller dimensions for the thumbnail to further reduce size
                tempCanvas.width = 32;  // Reduced from 64 to 32
                tempCanvas.height = 32; // Reduced from 64 to 32

                // Draw the image on the small canvas (resizing it)
                if (ctx) {
                    ctx.drawImage(tempImg, 0, 0, 32, 32);
                    // Get the compressed data URL with lower quality
                    processedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.3); // Lower quality: 0.5 to 0.3
                }
            } catch (e) {
                console.error("Error processing custom mask for storage:", e);
                // Fallback: don't store the data URL
                processedDataUrl = undefined;
            }
        }

        const newMask = {
            id: maskId,
            name: maskName,
            isCustom: isCustom,
            dataUrl: processedDataUrl
        };

        setRecentMasks(prev => {
            // Remove the mask from the list if it already exists
            const filtered = prev.filter(m => !(m.id === maskId && (m.isCustom === isCustom)));

            // Add the new mask to the beginning and keep only the 10 most recent
            const updated = [newMask, ...filtered].slice(0, 10);

            // Store masks in chunks to avoid quota issues
            storeRecentMasksWithChunking(updated);

            return updated;
        });
    };

    // Function to store masks in chunks to avoid quota issues
    const storeRecentMasksWithChunking = (masks: Array<{ id: string, name: string, isCustom?: boolean, dataUrl?: string }>) => {
        try {
            // Store basic mask info without dataUrls
            const masksWithoutDataUrls = masks.map(mask => ({
                id: mask.id,
                name: mask.name,
                isCustom: mask.isCustom
            }));

            localStorage.setItem('recentMasks', JSON.stringify(masksWithoutDataUrls));

            // Then try to store each dataUrl separately
            masks.forEach((mask, index) => {
                if (mask.isCustom && mask.dataUrl) {
                    try {
                        localStorage.setItem(`recentMaskData_${index}`, mask.dataUrl);
                    } catch (err) {
                        console.warn(`Couldn't store mask data for mask ${index}`, err);
                    }
                }
            });
        } catch (error) {
            console.error("Error saving to localStorage:", error);

            // If even basic storage fails, try with minimal information
            try {
                const minimalData = masks.map(mask => ({ id: mask.id }));
                localStorage.setItem('recentMasks', JSON.stringify(minimalData));
            } catch (finalError) {
                console.error("Cannot use localStorage at all:", finalError);
            }
        }
    };

    // Function to load a specific mask
    const loadMask = (maskId: string) => {
        if (!canvasRef) return;

        const loadImage = (src: string) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            });
        };

        // Load the new mask
        loadImage(`/assets/masks/${maskId}`).then(mask => {
            setImageData(prev => ({
                ...prev,
                mask
            }));

            // Add to recent masks
            addToRecentMasks(maskId);
        }).catch(error => {
            console.error("Error loading mask:", error);
        });
    };

    // Function to handle custom mask upload
    const handleMaskUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            const dataUrl = e.target?.result as string;

            img.onload = () => {
                setCustomMask(img);
                setSelectedMask('custom');
                setImageData(prev => ({
                    ...prev,
                    mask: img
                }));

                // Add custom mask to recent masks
                addToRecentMasks('custom', dataUrl);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    // Also modify the applyRecentMask function to handle missing dataUrls
    const applyRecentMask = (recentMask: { id: string, name: string, isCustom?: boolean, dataUrl?: string }) => {
        if (recentMask.isCustom && recentMask.dataUrl) {
            // Load custom mask from data URL
            const img = new Image();
            img.onload = () => {
                setCustomMask(img);
                setSelectedMask('custom');
                setImageData(prev => ({
                    ...prev,
                    mask: img
                }));
            };
            img.src = recentMask.dataUrl;
        } else if (recentMask.isCustom && !recentMask.dataUrl) {
            // Handle case where we have a custom mask reference but no data URL
            alert("The custom mask data is no longer available. Please upload it again.");
        } else {
            // Load predefined mask
            setSelectedMask(recentMask.id);
        }
    };

    // Effect to load new mask when selectedMask changes
    useEffect(() => {
        if (selectedMask && selectedMask !== 'custom') {
            loadMask(selectedMask);
        }
    }, [selectedMask]);

    // Function to redraw the canvas when scales change
    const redrawCanvas = () => {
        if (!canvasRef || !imageData.img || !imageData.mask) return;

        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

        // Calculate dimensions to cover the canvas with the current scale
        const baseScale = Math.max(
            canvasRef.width / imageData.img.width,
            canvasRef.height / imageData.img.height
        );
        const adjustedScale = baseScale * imageScale;

        const x = (canvasRef.width - imageData.img.width * adjustedScale) / 2;
        const y = (canvasRef.height - imageData.img.height * adjustedScale) / 2;

        // Draw image with object-cover behavior and scale
        ctx.drawImage(
            imageData.img,
            x, y,
            imageData.img.width * adjustedScale,
            imageData.img.height * adjustedScale
        );

        // Apply mask with its own scale
        ctx.globalCompositeOperation = 'destination-in';

        // Calculate mask dimensions based on its scale
        const maskWidth = canvasRef.width * maskScale;
        const maskHeight = canvasRef.height * maskScale;
        const maskX = (canvasRef.width - maskWidth) / 2;
        const maskY = (canvasRef.height - maskHeight) / 2;

        ctx.drawImage(
            imageData.mask,
            maskX, maskY,
            maskWidth, maskHeight
        );

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    };

    // Effect to redraw canvas when scales change
    useEffect(() => {
        redrawCanvas();
    }, [imageScale, maskScale, imageData]);

    const downloadImage = () => {
        if (!canvasRef) return;

        try {
            // Create a temporary link element
            const link = document.createElement('a');
            link.download = 'masked-image.png';

            // Convert canvas to data URL and set as href
            link.href = canvasRef.toDataURL('image/png');

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download image:", error);
            alert("Unable to download image. The image source might be protected.");
        }
    };

    const resetScales = () => {
        setImageScale(1);
        setMaskScale(1);
    };

    // Function to load recent images from localStorage on component mount
    useEffect(() => {
        try {
            const savedRecentImages = localStorage.getItem('recentImages');
            if (savedRecentImages) {
                setRecentImages(JSON.parse(savedRecentImages).slice(0, 5));
            }
        } catch (e) {
            console.error("Error loading recent images:", e);
        }
    }, []);

    // Function to handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;

            // Create image element from data URL
            const img = new Image();
            img.onload = () => {
                // Update canvas with new image
                setImageData(prev => ({
                    ...prev,
                    img
                }));

                // Add to recent images
                addToRecentImages(file.name, dataUrl);
            };
            img.crossOrigin = 'anonymous';
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    // Function to add image to recent images
    const addToRecentImages = (imageName: string, dataUrl: string) => {
        const newImage = {
            id: Date.now().toString(),
            name: imageName.length > 15 ? imageName.substring(0, 12) + '...' : imageName,
            dataUrl: dataUrl
        };

        setRecentImages(prev => {
            // Remove duplicates based on image content (approximate using first 1000 chars of dataUrl)
            const filtered = prev.filter(img =>
                img.dataUrl.substring(0, 1000) !== dataUrl.substring(0, 1000)
            );

            // Add the new image to the beginning and keep only the 5 most recent
            const updated = [newImage, ...filtered].slice(0, 5);

            // Store in localStorage
            try {
                localStorage.setItem('recentImages', JSON.stringify(updated));
            } catch (error) {
                console.error("Error saving recent images:", error);
                // If storage fails, try with just the IDs and names
                try {
                    const minimal = updated.map(img => ({ id: img.id, name: img.name }));
                    localStorage.setItem('recentImages', JSON.stringify(minimal));
                } catch (e) {
                    console.error("Cannot store recent images at all:", e);
                }
            }

            return updated;
        });
    };

    // Function to apply a recent image
    const applyRecentImage = (recentImage: { id: string, name: string, dataUrl: string }) => {
        const img = new Image();
        img.onload = () => {
            setImageData(prev => ({
                ...prev,
                img
            }));
        };
        img.crossOrigin = 'anonymous';
        img.src = recentImage.dataUrl;
    };

    return (
        <div className="flex flex-col items-center">
            <canvas
                ref={(canvas) => {
                    if (canvas && !canvasRef) {
                        setCanvasRef(canvas);
                        const ctx = canvas.getContext('2d');
                        canvas.width = 1200;
                        canvas.height = 1200;

                        const loadImage = (src: string) => {
                            return new Promise<HTMLImageElement>((resolve, reject) => {
                                const img = new Image();
                                // Set crossOrigin to allow exporting canvas with external images
                                img.crossOrigin = 'anonymous';
                                img.onload = () => resolve(img);
                                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                                img.src = src;
                            });
                        };

                        Promise.all([
                            loadImage('/assets/example/avatar.JPG'),
                            loadImage(`/assets/masks/${selectedMask}`)
                        ]).then(([img, mask]) => {
                            setImageData({ img, mask });
                        }).catch(error => {
                            console.error("Error rendering canvas:", error);
                        });
                    }
                }}
                className="h-full w-full bg-center max-w-2xl m-1 border border-gray-300"
            />

            {/* Image Upload and Recent Images */}
            <div className="w-full max-w-md mt-4 px-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Image Source</label>
                    <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                    />
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                        Upload Image
                    </button>
                </div>

                {recentImages.length > 0 && (
                    <div className="mt-2">
                        <label className="block text-xs text-gray-600 mb-1">Recent Uploads</label>
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {recentImages.map((image) => (
                                <div key={image.id} className="relative flex-shrink-0">
                                    <button
                                        onClick={() => applyRecentImage(image)}
                                        className="p-1 border rounded-md flex-shrink-0 hover:bg-gray-100 flex flex-col items-center"
                                        title={image.name}
                                    >
                                        <div
                                            className="w-14 h-14 bg-cover bg-center bg-no-repeat"
                                            style={{ backgroundImage: `url(${image.dataUrl})` }}
                                        ></div>
                                        <span className="text-xs mt-1 whitespace-nowrap">{image.name}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRecentImages(prev => {
                                                const updated = prev.filter(img => img.id !== image.id);
                                                try {
                                                    localStorage.setItem('recentImages', JSON.stringify(updated));
                                                } catch (e) {
                                                    console.error("Error updating localStorage:", e);
                                                }
                                                return updated;
                                            });
                                        }}
                                        className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs hover:bg-red-700"
                                        title="Remove from recent images"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Masks */}
            {recentMasks.length > 0 && (
                <div className="w-full max-w-md mt-4 px-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Recent Masks</label>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to clear all recent masks?')) {
                                    setRecentMasks([]);
                                    localStorage.removeItem('recentMasks');
                                    // Also remove individual mask data items
                                    for (let i = 0; i < 10; i++) {
                                        localStorage.removeItem(`recentMaskData_${i}`);
                                    }
                                }
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                            title="Clear all recent masks"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2 pt-5">
                        {recentMasks.map((mask, index) => (
                            <div key={`recent-${index}`} className="relative flex-shrink-0">
                                <button
                                    onClick={() => applyRecentMask(mask)}
                                    className={`p-2 border rounded-md flex-shrink-0 hover:bg-gray-100 flex flex-col items-center ${(mask.isCustom && selectedMask === 'custom') || (!mask.isCustom && selectedMask === mask.id)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300'
                                        }`}
                                    title={mask.name}
                                >
                                    <div
                                        className="w-10 h-10 bg-contain bg-center bg-no-repeat"
                                        style={{
                                            backgroundImage: mask.isCustom
                                                ? `url(${mask.dataUrl})`
                                                : `url(/assets/masks/${mask.id})`
                                        }}
                                    ></div>
                                    <span className="text-xs mt-1 whitespace-nowrap">{mask.name}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setRecentMasks(prev => {
                                            const updated = prev.filter((_, i) => i !== index);
                                            storeRecentMasksWithChunking(updated);
                                            return updated;
                                        });
                                        // Remove this specific mask's data from storage
                                        localStorage.removeItem(`recentMaskData_${index}`);
                                    }}
                                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs hover:bg-red-700"
                                    title="Remove from recent masks"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mask Selector */}
            <div className="w-full max-w-md mt-4 px-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Mask Shape</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                    {availableMasks.map((mask) => (
                        <button
                            key={mask.id}
                            onClick={() => setSelectedMask(mask.id)}
                            className={`p-2 border rounded-md hover:bg-gray-100 flex flex-col items-center ${selectedMask === mask.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            title={mask.name}
                        >
                            <div className="w-10 h-10 bg-contain bg-center bg-no-repeat"
                                style={{ backgroundImage: `url(/assets/masks/${mask.id})` }}></div>
                            <span className="text-xs mt-1">{mask.name}</span>
                        </button>
                    ))}
                </div>

                {/* Custom Mask Upload */}
                <div className="mt-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleMaskUpload}
                        className="hidden"
                        id="mask-upload"
                    />
                    <div className="flex items-center">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex items-center justify-center px-4 py-2 border rounded-md ${selectedMask === 'custom' && customMask ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-100'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Custom Mask
                        </button>
                        {selectedMask === 'custom' && customMask && (
                            <span className="ml-2 text-sm text-green-600">Custom mask applied</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Resize Controls remain unchanged */}
            <div className="w-full max-w-md mt-4 px-4">
                <label htmlFor="image-resize-slider" className="block text-sm font-medium text-gray-700 mb-1">
                    Resize Image (Scale: {imageScale.toFixed(2)}x)
                </label>
                <input
                    id="image-resize-slider"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.05"
                    value={imageScale}
                    onChange={(e) => setImageScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div className="w-full max-w-md mt-4 px-4">
                <label htmlFor="mask-resize-slider" className="block text-sm font-medium text-gray-700 mb-1">
                    Resize Mask (Scale: {maskScale.toFixed(2)}x)
                </label>
                <input
                    id="mask-resize-slider"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.05"
                    value={maskScale}
                    onChange={(e) => setMaskScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div className="flex space-x-4 mt-4">
                <button
                    onClick={resetScales}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                    Reset Size
                </button>
                <button
                    onClick={downloadImage}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Download Image
                </button>
            </div>
        </div>
    );
}