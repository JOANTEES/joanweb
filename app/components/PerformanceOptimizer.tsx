'use client';

import { useEffect } from 'react';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload hero video
      const videoLink = document.createElement('link');
      videoLink.rel = 'preload';
      videoLink.as = 'video';
      videoLink.href = '/hero.mp4';
      document.head.appendChild(videoLink);
      
      // Preload critical images
      const imageLinks = ['/1.jpg', '/2.jpg', '/3.jpg'];
      imageLinks.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Optimize scroll performance
    const optimizeScroll = () => {
      let ticking = false;
      
      const updateScroll = () => {
        // Throttle scroll events
        ticking = false;
      };
      
      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateScroll);
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', requestTick, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', requestTick);
      };
    };

    // Initialize optimizations
    preloadCriticalResources();
    const cleanupScroll = optimizeScroll();

    return () => {
      cleanupScroll();
    };
  }, []);

  return null; // This component doesn't render anything
}

