import { useState, useEffect } from 'react';

export function useExampleImages() {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchImages() {
            try {
                const response = await fetch('/api/example-images');
                if (!response.ok) {
                    throw new Error('Failed to fetch template images');
                }
                const data = await response.json();
                setImages(data.images);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        }

        fetchImages();
    }, []);

    return { images, loading, error };
}