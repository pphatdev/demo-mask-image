'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

export const ThemeSwitch = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 w-9 h-9"></div>; // placeholder with same dimensions
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex cursor-pointer rounded-full p-2 ring text-primary ring-foreground/20 outline-none bg-foreground/10 hover:bg-foreground/20 transition-all duration-300 ease-in-out hover:scale-110 items-center justify-center"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <SunIcon className="size-4 animate-in spin-in-180 duration-300" />
            ) : (
                <MoonIcon className="size-4 animate-in spin-in-180 duration-300" />
            )}
        </button>
    );
};