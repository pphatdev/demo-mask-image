"use client";
import { Canvas } from "@app/components/canvas";
import React from "react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Canvas />
        </div>
    );
}
