/**
 * Script to generate responsive image variants for performance optimization.
 * Creates small (500w) and medium (800w) versions of WebP images.
 * 
 * Usage: node scripts/generateResponsiveImages.cjs
 * 
 * Requires: sharp package (npm install sharp --save-dev)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const IMAGES_TO_PROCESS = [
    'get-matched.webp',
    'connect-scale.webp',
    'discover-compare.webp'
];

const SIZES = [
    { suffix: '-small', width: 500 },
    { suffix: '-medium', width: 800 }
];

async function generateResponsiveImages() {
    console.log('Generating responsive image variants...\n');

    for (const imageName of IMAGES_TO_PROCESS) {
        const inputPath = path.join(IMAGES_DIR, imageName);

        if (!fs.existsSync(inputPath)) {
            console.log(`[SKIP] ${imageName} - file not found`);
            continue;
        }

        const baseName = path.basename(imageName, '.webp');

        for (const size of SIZES) {
            const outputName = `${baseName}${size.suffix}.webp`;
            const outputPath = path.join(IMAGES_DIR, outputName);

            try {
                await sharp(inputPath)
                    .resize(size.width, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                const stats = fs.statSync(outputPath);
                const sizeKB = (stats.size / 1024).toFixed(1);
                console.log(`[OK] Created ${outputName} (${sizeKB} KB)`);
            } catch (error) {
                console.error(`[ERROR] Processing ${imageName}:`, error.message);
            }
        }
    }

    console.log('\nDone!');
}

generateResponsiveImages().catch(console.error);
