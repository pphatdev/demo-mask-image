import type { Metadata } from "next";
import { Kantumruy_Pro, Poppins } from "next/font/google";
import "./globals.css";

const kantumruyPro = Kantumruy_Pro({
    variable: "--font-kantumruy",
    subsets: ["latin"],
});

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const title = "Maskify - Image Masking Tool";
const description = "Maskify is a web application that allows you to create and customize masks for your images. It provides a user-friendly interface and a variety of features to help you achieve the perfect mask for your photos.";
const keywords = "maskify, image masking, photo editing, image processing, pphat tools";
const authors = [{ name: title, url: "https://maskify.pphat.top" }];

export const metadata: Metadata = {
    title: title,
    description: description,
    keywords: keywords,
    authors: authors,
    creator: "PPhat",
    publisher: "PPhat",
    metadataBase: new URL("https://maskify.pphat.top"),
    openGraph: {
        title: title,
        description: description,
        url: "https://maskify.pphat.top",
        siteName: title,
        images: [
            {
                url: "/assets/screenshots/maskify.png",
                width: 1200,
                height: 630,
                alt: title,
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
        images: "/assets/screenshots/maskify.png",
        creator: "@pphatdev",
    },
    icons: {
        icon: "/logo/favicon.ico",
        shortcut: "/logo/favicon.ico",
        apple: "/logo/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body className={`${kantumruyPro.variable} ${poppins.variable} antialiased font-sans`} >
                {children}
            </body>
        </html>
    );
}
