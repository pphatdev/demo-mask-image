import React from 'react';

export interface SizeOption {
    label: string;
    width: number;
    height: number;
}

interface SizeSelectorProps {
    sizeOptions: SizeOption[];
    selectedSize: SizeOption;
    onSizeChange: (size: SizeOption) => void;
}

export const SizeSelector = ({ sizeOptions, selectedSize, onSizeChange }: SizeSelectorProps) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Size:</span>
            <select
                className="px-3 py-1.5 bg-gray-800 text-white rounded-md border border-gray-700 text-sm"
                value={`${selectedSize.width}x${selectedSize.height}`}
                onChange={(e) => {
                    const [width, height] = e.target.value.split('x').map(Number);
                    const newSize = sizeOptions.find(size => size.width === width && size.height === height);
                    if (newSize) onSizeChange(newSize);
                }}
            >
                {sizeOptions.map((size) => (
                    <option
                        key={`${size.width}x${size.height}`}
                        value={`${size.width}x${size.height}`}
                    >
                        {size.label}
                    </option>
                ))}
            </select>
        </div>
    );
};