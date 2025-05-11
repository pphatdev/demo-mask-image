"use client";
import { Canvas } from "@app/components/canvas/main-canvas";
import { Images } from "@app/components/controls/images";
import { Masks } from "@app/components/controls/masks";
import React, { useState } from "react";
import { Footer } from "./components/layout/footer";

export default function Home() {
    // State to track the currently selected mask and image
    const [selectedMask, setSelectedMask] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>('/assets/example/template/avatar.JPG');

    return (
        <div className="flex items-center flex-col mx-auto justify-center min-h-screen">
            <div className="sticky top-0 flex flex-col items-center px-5 pt-5 justify-center w-full ring-green-900 bg-background">
                <div className="max-w-2xl w-full h-full rounded-t-2xl max-h-[50rem] md:min-h-[50rem] p-5">
                    <Canvas selectedMask={selectedMask} selectedImage={selectedImage} />
                </div>
            </div>

            <div className="min-h-[40rem] flex flex-col gap-4 w-full bg-background/80 backdrop-blur-lg rounded-t-4xl shadow-2xl p-5 pt-10">
                <div className="mx-auto w-full flex flex-col gap-10 max-w-2xl">
                    <Masks selectedMask={selectedMask} onMaskSelect={setSelectedMask} />
                    <Images selectedImage={selectedImage} onImageSelect={setSelectedImage} />
                    <Footer />
                </div>
            </div>
        </div>
    );
}
