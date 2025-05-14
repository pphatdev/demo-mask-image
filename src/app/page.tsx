"use client";
import { Canvas } from "@app/components/canvas/main-canvas";
import { Images } from "@app/components/controls/images";
import { Masks } from "@app/components/controls/masks";
import React, { act, useEffect, useState } from "react";
import { Footer } from "./components/layout/footer";
import { ImageIcon, MaskOnIcon, ResetIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";



export default function Home() {
    // State to track the currently selected mask and image
    const [selectedMask, setSelectedMask] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>('/assets/example/template/avatar.JPG');
    // State to track active tab
    const [activeTab, setActiveTab] = useState<'masks' | 'images' | null>(null);

    const router = useRouter();

    const handleTabClick = (tab: 'masks' | 'images') => {
        router.push(`/?tab=${tab}`);
    }

    const handleBackClick = () => {
        setActiveTab(null);
        setSelectedMask(null);
        setSelectedImage(null);
        router.push('/');
    }


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') as 'masks' | 'images' | null;

        setActiveTab(tab);

    }, [activeTab])


    return (
        <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="sticky top-0 flex flex-col items-center justify-center w-full aspect-square">
                <div className="max-w-2xl w-full flex items-center justify-center max-h-[calc(100vh_-10rem)] h-screen rounded-t-2xl">
                    <Canvas selectedMask={selectedMask} selectedImage={selectedImage} />
                </div>
            </div>

            <div className="flex min-h-[10rem] flex-col gap-4 w-full bg-background/80 backdrop-blur-lg shadow-2xl p-5 pt-5">
                <div className="flex flex-col w-full max-w-2xl gap-10 mx-auto">

                    {activeTab && (
                        <div className='bg-foreground/5 z-50 absolute left-3 top-3 ring-1 w-fit ml-auto ring-foreground/10 justify-end flex rounded-full p-1'>
                            <button
                                aria-label={`Reset`}
                                type="button"
                                onClick={handleBackClick}
                                className="flex cursor-pointer rounded-full p-2 hover:ring hover:text-primary ring-foreground/20 outline-none hover:bg-foreground/10 transition-all items-center justify-center"
                            >
                                <ResetIcon className='size-4' />
                                <span className="sr-only">Back</span>
                            </button>
                        </div>
                    )}

                    {!activeTab && (
                        <div className="flex items-center justify-center gap-1">
                            <button
                                type="button"
                                onClick={() => handleTabClick('masks')}
                                className={`relative flex items-center justify-center rounded aspect-square bg-foreground/5 size-14`}
                            >
                                <MaskOnIcon className="size-9 text-foreground" />
                                <span className="text-[12px] text-foreground w-full text-center absolute inset-x-0 -bottom-5 line-clime-1">Masks</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabClick('images')}
                                className={`relative flex items-center justify-center rounded aspect-square bg-foreground/5 size-14`}
                            >
                                <ImageIcon className="size-9 text-foreground" />
                                <span className="text-[12px] text-foreground w-full text-center absolute inset-x-0 -bottom-5 line-clime-1">Images</span>
                            </button>
                        </div>
                    )}



                    {activeTab === 'masks' ? (
                        <Masks selectedMask={selectedMask} onMaskSelect={setSelectedMask} />
                    ) : (
                        <Images selectedImage={selectedImage} onImageSelect={setSelectedImage} />
                    )}
                    <Footer />
                </div>
            </div>
        </div>
    );
}
