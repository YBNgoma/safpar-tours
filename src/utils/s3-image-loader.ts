import { ImageLoaderProps } from 'next/image';

// Custom S3 image loader for Next.js Image component
// Handles image optimization and CDN delivery for Safpar Tours

const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com';

export default function s3ImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If the src already includes a domain, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Remove leading slash if present
  const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
  
  // For now, return the direct S3 URL
  // In production, this could be enhanced with CloudFront CDN or image optimization service
  const imageUrl = `${S3_BUCKET_URL}/${cleanSrc}`;
  
  // Note: S3 doesn't support query parameters for optimization by default
  // Future CloudFront integration will support quality and width parameters:
  // const qualityParam = quality ? `&q=${quality}` : '';
  // const widthParam = width ? `&w=${width}` : '';
  // return `${imageUrl}?${widthParam}${qualityParam}`;
  
  return imageUrl;
}

// Helper function to get the full S3 URL for an image
export function getS3ImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${S3_BUCKET_URL}/${cleanPath}`;
}

// Helper function to get optimized image sizes for responsive design
export function getResponsiveImageSizes(imagePath: string) {
  const baseUrl = getS3ImageUrl(imagePath);
  
  return {
    thumbnail: baseUrl, // 150x150 - for thumbnails
    small: baseUrl,     // 400x300 - for mobile cards
    medium: baseUrl,    // 800x600 - for desktop cards
    large: baseUrl,     // 1200x900 - for hero images
    xlarge: baseUrl     // 1600x1200 - for full-screen displays
  };
}