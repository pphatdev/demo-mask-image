"use client"

import { useEffect, useRef, useState } from 'react';
import { SaveButton } from '../controls/save-button';
import { Riple } from 'react-loading-indicators';

type CanvasProps = {
    selectedMask: string | null;
    selectedImage: string | null;
};

export const Canvas = ({ selectedMask, selectedImage }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [loading, setLoading] = useState(true);

    const loadImage = (src: string) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    };

    const onSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'masked-image.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!ctx) return;

        setLoading(true); // Set loading to true when mask starts loading

        const imagePath = selectedImage || '/assets/example/template/avatar.JPG';
        const maskPath = selectedMask || '/assets/example/masks/mask-2.png';

        Promise.all([loadImage(imagePath), loadImage(maskPath)])
            .then(([img, mask]) => {
                canvas.width = 2048;
                canvas.height = 2048;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const scale = Math.max(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(mask, 0, 0, 2048, 2048);

                ctx.globalCompositeOperation = 'source-over';
            })
            .catch((error) => {
                console.error('Error loading images:', error);
            })
            .finally(() => {
                setLoading(false); // Set loading to false when mask finishes loading
            });
    }, [selectedMask, selectedImage]);

    return (
        <div className='bg-background'>
            { loading && <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"> <Riple color="#32cd32" size="large" /> </div> }
            <SaveButton onClick={onSave} />
            <canvas ref={canvasRef} className="h-full z-50 aspect-square w-full bg-center" />
        </div>
    );
};