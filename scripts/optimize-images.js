const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { width, height, quality = 75 } = options;
  
  try {
    let pipeline = sharp(inputPath);
    
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center'
      });
    }
    
    await pipeline
      .webp({ quality })
      .toFile(outputPath.replace(/\.[^/.]+$/, '.webp'));
      
    await pipeline
      .avif({ quality })
      .toFile(outputPath.replace(/\.[^/.]+$/, '.avif'));
      
    console.log(`Optimized: ${inputPath}`);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      const outputPath = filePath;
      await optimizeImage(filePath, outputPath);
    }
  }
}

async function main() {
  try {
    await processDirectory(IMAGES_DIR);
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error during optimization:', error);
  }
}

main(); 