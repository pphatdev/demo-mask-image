"use client";
import { Canvas } from "@app/components/canvas/main-canvas";
import { Images } from "@app/components/controls/images";
import { Masks } from "@app/components/controls/masks";
import React, { useEffect, useState } from "react";
import { ImageIcon, MaskOnIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { GridPattern } from "@app/components/magicui/grid-pattern";
import { cn } from "@app/lib/utils";
import { Footer } from "./components/layout/footer";
import { Header } from "./components/layout/header";

export default function Home() {
    const [selectedMask, setSelectedMask] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>('/assets/example/template/avatar.JPG');
    const [activeTab, setActiveTab] = useState<'masks' | 'images' | null>(null);
    const [isMenuView, setIsMenuView] = useState<boolean>(true);

    const router = useRouter();

    const handleTabClick = (tab: 'masks' | 'images') => {
        setActiveTab(tab);
        setIsMenuView(false);
        router.push(`/?tab=${tab}`);
    }

    const handleBackClick = () => {
        setActiveTab(null);
        setIsMenuView(true);
        router.push('/');
    }

    const handleSave = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'masked-image.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') as 'masks' | 'images' | null;

        if (tab) {
            setActiveTab(tab);
            setIsMenuView(false);
        } else {
            setIsMenuView(true);
        }
    }, [])


    return (
        <div className="flex flex-col relative items-center justify-center max-w-xl mx-auto">
            <Header onSave={handleSave} />
            <GridPattern
                width={30}
                height={30}
                x={-1}
                y={-1}
                strokeDasharray={"4 2"}
                className={cn(
                    "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
                )}
            />
            <div className="sticky top-0 flex flex-col items-center justify-center w-full aspect-square">
                <div className="max-w-2xl w-full flex items-center translate-y-7 justify-center max-h-[calc(100vh_-12rem)] h-screen rounded-t-2xl">
                    <Canvas selectedMask={selectedMask} selectedImage={selectedImage} />
                </div>
            </div>

            <div className="flex min-h-[12rem] border-t drop-shadow-md border-foreground/10 rounded-t-4xl flex-col gap-4 w-full bg-foreground/10 backdrop-blur-lg shadow-2xl p-5 pt-5">
                <div className="flex flex-col w-full max-w-2xl gap-10 mx-auto">
                    {isMenuView ? (
                        <div className="flex items-center pt-5 justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleTabClick('masks')}
                                className={`relative flex items-center cursor-pointer justify-center rounded aspect-square bg-foreground/5 size-14`}
                            >
                                <MaskOnIcon className="size-9 text-foreground" />
                                <span className="text-[12px] text-foreground w-full text-center absolute inset-x-0 -bottom-5 line-clamp-1">Masks</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabClick('images')}
                                className={`relative flex items-center cursor-pointer justify-center rounded aspect-square bg-foreground/5 size-14`}
                            >
                                <ImageIcon className="size-9 text-foreground" />
                                <span className="text-[12px] text-foreground w-full text-center absolute inset-x-0 -bottom-5 line-clamp-1">Images</span>
                            </button>
                        </div>
                    ) : (
                        <div className="w-full pt-10">
                            <div className="bg-foreground/5 z-50 absolute left-4 top-3 ring-1 w-fit ml-auto ring-foreground/10 justify-end flex rounded-full p-1">
                                <button
                                    type="button"
                                    onClick={handleBackClick}
                                    className="flex cursor-pointer rounded-full px-2 hover:ring hover:text-primary ring-foreground/20 outline-none hover:bg-foreground/10 transition-all items-center justify-center"
                                >
                                    <ChevronLeftIcon className="size-4 mr-1" />
                                    <span>Back</span>
                                </button>
                            </div>

                            {activeTab === 'masks' && (
                                <Masks selectedMask={selectedMask} setSelectedMask={setSelectedMask} />
                            )}

                            {activeTab === 'images' && (
                                <Images selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
