import { useState, useEffect, useRef, useCallback } from 'react';
import { useExampleMasks } from '@app/hooks/useExampleMasks';
import Image from 'next/image';

type MaskItem = {
    id: number;
    path: string;
    name: string;
};

type MasksProps = {
    selectedMask?: string | null;
    onMaskSelect?: (maskPath: string) => void;
};

export const Masks = ({ selectedMask, onMaskSelect }: MasksProps = {}) => {
    const [displayMasks, setDisplayMasks] = useState<MaskItem[]>([]);
    const { masks, loading, error } = useExampleMasks();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [storageError, setStorageError] = useState<string | null>(null);

    // Load masks from session storage
    const loadMasksFromSession = useCallback((): MaskItem[] => {
        try {
            const storedMasks = sessionStorage.getItem('uploadedMasks');
            return storedMasks ? JSON.parse(storedMasks) : [];
        } catch (err) {
            console.error('Failed to load masks from session storage:', err);
            return [];
        }
    }, []);

    // On initial load, check if there was a previously selected mask ID
    useEffect(() => {
        const savedSelectionId = sessionStorage.getItem('selectedMaskId');
        if (savedSelectionId) {
            // Find the mask with this ID
            const allMasks = loadMasksFromSession();
            const selectedMask = allMasks.find(mask => mask.id.toString() === savedSelectionId);

            if (selectedMask && onMaskSelect) {
                onMaskSelect(selectedMask.path);
            } else {
                // If we can't find the mask by ID, try to use the old path method
                const savedPath = sessionStorage.getItem('selectedMask');
                if (savedPath && onMaskSelect) {
                    onMaskSelect(savedPath);
                }
            }
        }
    }, [onMaskSelect, loadMasksFromSession]);

    // Load masks from both API and session storage
    useEffect(() => {
        // Load from API
        if (masks) {
            // Convert the mask filenames into template objects
            const maskList = masks.map((filename, index) => ({
                id: index + 1,
                path: `/assets/example/masks/${filename}`,
                name: filename.split('.')[0] // Use filename (without extension) as name
            }));

            // Load from session storage
            const sessionMasks = loadMasksFromSession();

            // Combine both sources
            setDisplayMasks([...maskList, ...sessionMasks]);
        }
    }, [masks, loadMasksFromSession]);

    // Save uploaded masks to session storage
    const saveMaskToSession = useCallback((mask: MaskItem) => {
        try {
            // Get existing stored masks
            const storedMasks = JSON.parse(sessionStorage.getItem('uploadedMasks') || '[]');

            // Add new mask
            const updatedMasks = [...storedMasks, mask];

            // Try to save to session storage
            try {
                sessionStorage.setItem('uploadedMasks', JSON.stringify(updatedMasks));
                setStorageError(null); // Clear any previous errors
            } catch (storageErr) {
                console.error('Storage quota exceeded:', storageErr);
                setStorageError('Storage quota exceeded. Some masks may not persist after refresh.');

                // Still update the state for current session
                return true;
            }

            return true;
        } catch (err) {
            console.error('Failed to save mask to session storage:', err);
            return false;
        }
    }, []);

    // Save selected mask reference by ID instead of path
    const saveSelectedMaskId = useCallback((maskId: number) => {
        try {
            sessionStorage.setItem('selectedMaskId', maskId.toString());
        } catch (storageErr) {
            console.error('Failed to save selected mask ID to storage:', storageErr);
            setStorageError('Selected mask reference could not be saved due to storage limitations.');
        }
    }, []);

    const handleMaskClick = useCallback((mask: MaskItem) => {
        if (onMaskSelect) {
            // Save the selected mask ID instead of the full path
            saveSelectedMaskId(mask.id);
            onMaskSelect(mask.path);
        }
    }, [onMaskSelect, saveSelectedMaskId]);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size before processing
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setStorageError('Mask may be too large to save in browser storage. It will be available for this session only.');
            }

            // Use FileReader to convert file to data URL (base64 string)
            const reader = new FileReader();

            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;

                // Create a new mask object with a unique ID
                const newMaskId = Date.now();
                const newMask: MaskItem = {
                    id: newMaskId,
                    path: dataUrl,
                    name: file.name.split('.')[0]
                };

                // Add to display masks
                setDisplayMasks(prev => [...prev, newMask]);

                // Save to session storage
                saveMaskToSession(newMask);

                // Automatically select the new mask using ID instead of path
                if (onMaskSelect) {
                    saveSelectedMaskId(newMaskId);
                    onMaskSelect(dataUrl);
                }
            };

            // Read file as data URL
            reader.readAsDataURL(file);
        }

        // Reset the file input to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onMaskSelect, saveMaskToSession, saveSelectedMaskId]);

    return (
        <section id='gallery-masks'>
            <h2 className="text-2xl font-bold mb-4">Gallery Masks</h2>
            {error && <p className="text-red-500">Error loading example masks: {error}</p>}
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
                        {displayMasks.map((mask) => (
                            <div
                                key={mask.id}
                                className={`aspect-square bg-foreground/5 rounded-xl cursor-pointer hover:bg-foreground/10 ring-foreground/20 hover:ring-2 transition-all ${selectedMask === mask.path ? 'ring-2 ring-primary' : 'ring-foreground/20'}`}
                                onClick={() => handleMaskClick(mask)}
                            >
                                <Image
                                    src={mask.path}
                                    alt={mask.name}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-fill rounded-lg aspect-square"
                                    onError={(e) => {
                                        console.error(`Failed to load mask: ${mask.path}`);
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
                            <span className="sr-only">Upload mask</span>
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