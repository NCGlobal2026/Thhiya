// Script to convert PNG images to WebP format
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const images = ['connect-scale.png', 'discover-compare.png', 'get-matched.png'];

async function convertImages() {
    for (const imageName of images) {
        const inputPath = path.join(imagesDir, imageName);
        const outputPath = path.join(imagesDir, imageName.replace('.png', '.webp'));

        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${imageName} - file not found`);
            continue;
        }

        const inputStats = fs.statSync(inputPath);
        console.log(`Converting ${imageName} (${(inputStats.size / 1024 / 1024).toFixed(2)} MB)...`);

        await sharp(inputPath)
            .webp({ quality: 85 })
            .toFile(outputPath);

        const outputStats = fs.statSync(outputPath);
        const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
        console.log(`  ✓ Created ${imageName.replace('.png', '.webp')} (${(outputStats.size / 1024).toFixed(0)} KB) - ${savings}% smaller`);
    }
    console.log('\nDone! Update image references in HowItWorksSection.tsx to use .webp extension.');
}

convertImages().catch(console.error);
