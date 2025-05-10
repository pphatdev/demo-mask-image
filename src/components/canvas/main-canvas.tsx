import { useEffect, useRef } from 'react';
import { SaveButton } from '../controls/save-button';

// Update the CanvasProps type
type CanvasProps = {
    selectedMask: string | null;
    selectedImage: string | null;
};

// Update the component parameter destructuring
export const Canvas = ({ selectedMask, selectedImage }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const loadImage = (src: string) => {
        return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });
    };

    const onSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a temporary link element
        const link = document.createElement('a');
        link.download = 'masked-image.png';

        // Convert canvas to data URL and set as href
        link.href = canvas.toDataURL('image/png');

        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!ctx) return;

        // Use the selected image or fall back to default
        const imagePath = selectedImage || '/assets/example/template/avatar.JPG';
        const maskPath = selectedMask || '/assets/example/masks/mask-2.png';

        Promise.all([
            loadImage(imagePath),
            loadImage(maskPath)
        ]).then(([img, mask]: [HTMLImageElement, HTMLImageElement]) => {
            canvas.width = 2048;
            canvas.height = 2048;

            // Clear canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate dimensions to cover the canvas
            const scale: number = Math.max(
                canvas.width / img.width,
                canvas.height / img.height
            );
            const x: number = (canvas.width - img.width * scale) / 2;
            const y: number = (canvas.height - img.height * scale) / 2;

            // Draw image with object-cover behavior
            ctx.drawImage(
                img,
                x, y,
                img.width * scale,
                img.height * scale
            );

            // Apply mask
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(mask, 0, 0, 2048, 2048);

            // Reset the composite operation
            ctx.globalCompositeOperation = 'source-over';
        }).catch(error => {
            console.error("Error loading images:", error);
        });
    }, [selectedMask, selectedImage]); // Re-run when either selectedMask or selectedImage changes

    return (
        <div className='relative w-full h-full'>
            <SaveButton onClick={onSave} />
            <canvas ref={canvasRef} className="h-full z-50 w-full bg-center border border-foreground/10 rounded-4xl" />
        </div>
    );
};