import { ThemeSwitch } from '@app/app/components/layout/theme-switch';
import { DownloadIcon } from '@radix-ui/react-icons';
import React from 'react';

interface SaveButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const SaveButton = ({ onClick, disabled = false }: SaveButtonProps) => {
    return (
        <button
            aria-label={`Download`}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex shrink-0 cursor-pointer rounded-r-full p-2 hover:ring hover:text-primary ring-foreground/20 outline-none hover:bg-foreground/10 transition-all items-center justify-center"
        >
            <DownloadIcon className='size-4' />
            <span className="sr-only">Download</span>
        </button>
    );
};