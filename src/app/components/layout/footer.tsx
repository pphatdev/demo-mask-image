import React from "react";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="w-full py-4 text-center bg-background/90 backdrop-blur-sm border-t border-foreground/10">
            <div className="max-w-2xl mx-auto px-4">
                <p className="text-sm text-muted-foreground">
                    Created with ❤️ by{" "}
                    <Link
                        href="https://github.com/pphatdev"
                        target="_blank"
                        className="font-medium hover:text-primary transition-colors"
                    >
                        PPhat
                    </Link>

                    {" "} at {" "}
                    <Link
                        href="https://github.com/pphatlabs"
                        target="_blank"
                        className="font-medium hover:text-primary transition-colors"
                    >
                        Labs
                    </Link>
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    © {new Date().getFullYear()} · All rights reserved
                </p>
            </div>
        </footer>
    );
};