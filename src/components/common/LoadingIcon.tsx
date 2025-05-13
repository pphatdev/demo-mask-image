import React from 'react';

type LoadingIconProps = {
    size?: number; // Size of the spinner in pixels
    color?: string; // Color of the spinner
};

export const LoadingIcon: React.FC<LoadingIconProps> = () => {
    return (
        <div className='relative flex shrink-0 items-center justify-center size-7 rounded-full'>
            <div className="animate-ping absolute inline-flex h-[90%] w-[90%] rounded-full bg-primary/75 ring-1 ring-primary"></div>
            <div className="absolute inline-flex h-[60%] w-[60%] rounded-full bg-primary"></div>
        </div>
    );
};