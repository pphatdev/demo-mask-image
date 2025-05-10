import { DownloadIcon } from '@radix-ui/react-icons';
import React from 'react';

interface SaveButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const SaveButton = ({ onClick, disabled = false }: SaveButtonProps) => {
    return (
        <div className='bg-foreground/5 z-50 absolute right-3 top-3 ring-1 w-fit ml-auto ring-foreground/10 justify-end flex rounded-full p-1'>
            <button
                aria-label={`Share`}
                type="button"
                onClick={onClick}
                disabled={disabled}
                className="flex cursor-pointer rounded-full p-2 hover:ring hover:text-primary ring-foreground/20 outline-none hover:bg-foreground/10 transition-all items-center justify-center"
            >
                <DownloadIcon className='size-4'/>
                <span className="sr-only">Share this post</span>
            </button>
        </div>
    );
};