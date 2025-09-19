#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function optimizeVideo() {
  const publicDir = path.join(__dirname, 'public');
  const videoPath = path.join(publicDir, 'hero.mp4');
  
  if (!fs.existsSync(videoPath)) {
    console.log('❌ hero.mp4 not found');
    return;
  }
  
  const stats = fs.statSync(videoPath);
  const originalSize = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`🎬 Current video size: ${originalSize}MB`);
  
  // Check if ffmpeg is available
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ FFmpeg not found. Please install FFmpeg to optimize video.');
    console.log('💡 On Ubuntu/Debian: sudo apt install ffmpeg');
    console.log('💡 On macOS: brew install ffmpeg');
    return;
  }
  
  const outputPath = path.join(publicDir, 'hero-optimized.mp4');
  
  try {
    console.log('🎬 Optimizing video...');
    
    // Optimize video with ffmpeg
    execSync(`ffmpeg -i "${videoPath}" -c:v libx264 -crf 28 -c:a aac -b:a 128k -movflags +faststart -preset fast "${outputPath}"`, {
      stdio: 'inherit'
    });
    
    const newStats = fs.statSync(outputPath);
    const newSize = (newStats.size / 1024 / 1024).toFixed(2);
    const savings = ((stats.size - newStats.size) / stats.size * 100).toFixed(1);
    
    console.log(`✅ Video optimized: ${originalSize}MB → ${newSize}MB (${savings}% smaller)`);
    
    // Create backup and replace
    fs.renameSync(videoPath, path.join(publicDir, 'hero-backup.mp4'));
    fs.renameSync(outputPath, videoPath);
    
    console.log('🎉 Video optimization complete!');
    console.log('💾 Original video backed up as hero-backup.mp4');
    
  } catch (error) {
    console.error('❌ Error optimizing video:', error.message);
  }
}

optimizeVideo();

