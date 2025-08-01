/**
 * Utility functions for video handling and URL processing
 */

// Video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.3gp'];

/**
 * Check if a URL points to a video file
 */
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  return VIDEO_EXTENSIONS.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('video') ||
         lowerUrl.includes('/video/');
};

/**
 * Get video MIME type from URL
 */
export const getVideoMimeType = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('.mp4') || lowerUrl.includes('.m4v')) return 'video/mp4';
  if (lowerUrl.includes('.webm')) return 'video/webm';
  if (lowerUrl.includes('.mov')) return 'video/quicktime';
  if (lowerUrl.includes('.avi')) return 'video/x-msvideo';
  if (lowerUrl.includes('.mkv')) return 'video/x-matroska';
  if (lowerUrl.includes('.3gp')) return 'video/3gpp';
  
  return 'video/mp4'; // Default fallback
};

/**
 * Check if browser supports video format
 */
export const canPlayVideo = (url: string): boolean => {
  const video = document.createElement('video');
  const mimeType = getVideoMimeType(url);
  return video.canPlayType(mimeType) !== '';
};

/**
 * Get optimized video URL for Supabase storage
 */
export const getOptimizedVideoUrl = (url: string): string => {
  // If it's already a full URL, return as is
  if (url.startsWith('http')) return url;
  
  // If it's a relative path, it might be from Supabase storage
  // The supabaseProvider should handle this, but we can add optimization here
  return url;
};

/**
 * Extract video thumbnail from video element
 */
export const extractVideoThumbnail = (videoElement: HTMLVideoElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    try {
      ctx.drawImage(videoElement, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    } catch (error) {
      reject(error);
    }
  });
};