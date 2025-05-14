import React from "react";
import { SaveButton } from '../../../components/controls/save-button';
import { SparklesText } from "@app/components/magicui/sparkles-text";
import { ThemeSwitch } from "./theme-switch";

interface HeaderProps {
    onSave?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSave }) => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full bg-background/80 backdrop-blur-lg">
            <div className="max-w-xl mx-auto relative py-4 flex items-center justify-between w-full">
                <div className="flex px-2 items-center">
                    <img src="/logo/logo.png" alt="Logo" className="size-10 mr-2 border bg-foreground/10 p-1 rounded-lg" />
                    <SparklesText className="text-xl">Maskify</SparklesText>
                </div>
                <div className='bg-foreground/5 z-50 absolute right-3 space-x-1 top-3 ring-1 w-fit ml-auto ring-foreground/10 justify-end flex rounded-full p-1'>
                    <ThemeSwitch />
                    <SaveButton onClick={() => onSave?.()} />
                </div>
            </div>
        </div>
    );
};