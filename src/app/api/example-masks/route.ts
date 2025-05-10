import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Get the directory path for the template images
        const templateDir = path.join(process.cwd(), 'public', 'assets', 'example', 'masks');

        // Read the directory
        const files = fs.readdirSync(templateDir);

        // Filter for mask files (jpg, png, etc.)
        const maskFiles = files.filter(file =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        // Return the list of mask files
        return NextResponse.json({
            masks: maskFiles,
            count: maskFiles.length
        });
    } catch (error) {
        console.error('Error reading template directory:', error);
        return NextResponse.json(
            {
                error: 'Failed to read template images directory',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}