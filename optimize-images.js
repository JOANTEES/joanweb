#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const publicDir = path.join(__dirname, 'public');
  const images = ['1.jpg', '2.jpg', '3.jpg'];
  
  console.log('🖼️  Optimizing images...');
  
  for (const imageName of images) {
    const inputPath = path.join(publicDir, imageName);
    const outputPath = path.join(publicDir, imageName.replace('.jpg', '-optimized.jpg'));
    
    if (fs.existsSync(inputPath)) {
      try {
        const stats = fs.statSync(inputPath);
        const originalSize = (stats.size / 1024 / 1024).toFixed(2);
        
        await sharp(inputPath)
          .resize(800, 800, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85,
            progressive: true,
            mozjpeg: true
          })
          .toFile(outputPath);
        
        const newStats = fs.statSync(outputPath);
        const newSize = (newStats.size / 1024 / 1024).toFixed(2);
        const savings = ((stats.size - newStats.size) / stats.size * 100).toFixed(1);
        
        console.log(`✅ ${imageName}: ${originalSize}MB → ${newSize}MB (${savings}% smaller)`);
        
        // Replace original with optimized version
        fs.renameSync(outputPath, inputPath);
        
      } catch (error) {
        console.error(`❌ Error optimizing ${imageName}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Image optimization complete!');
}

// Check if sharp is available
try {
  require.resolve('sharp');
  optimizeImages();
} catch (error) {
  console.log('📦 Installing sharp for image optimization...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    console.log('✅ Sharp installed successfully!');
    optimizeImages();
  } catch (installError) {
    console.error('❌ Failed to install sharp:', installError.message);
    console.log('💡 Please run: npm install sharp --save-dev');
  }
}

