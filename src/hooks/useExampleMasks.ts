import { useState, useEffect } from 'react';

export function useExampleMasks() {
    const [masks, setMasks] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMasks() {
            try {
                const response = await fetch('/api/example-masks');
                if (!response.ok) {
                    throw new Error('Failed to fetch template masks');
                }
                const data = await response.json();
                setMasks(data.masks);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        }

        fetchMasks();
    }, []);

    return { masks, loading, error };
}