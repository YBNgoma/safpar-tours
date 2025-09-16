// S3 Management Utility for Safpar Tours
// Handles image uploads, deletions, and URL generation

export interface S3ImageUpload {
  file: File;
  category: 'river-cruises' | 'adventure-activities' | 'wildlife-safaris' | 'cultural-tours';
  fileName?: string;
}

export interface S3ImageMetadata {
  url: string;
  key: string;
  size: number;
  contentType: string;
  category: string;
  uploadedAt: Date;
}

const S3_BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'safpar-tours-images-1758010007';
const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || `https://${S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`;

// Generate S3 key for organized storage
export function generateS3Key(category: string, fileName: string): string {
  const timestamp = new Date().getTime();
  const cleanFileName = fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
  return `images/${category}/${timestamp}-${cleanFileName}`;
}

// Get full S3 URL from key
export function getS3Url(key: string): string {
  return `${S3_BUCKET_URL}/${key}`;
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 5MB.'
    };
  }

  return { valid: true };
}

// Client-side presigned URL upload (for future admin implementation)
export async function uploadImageToS3(imageUpload: S3ImageUpload): Promise<S3ImageMetadata> {
  const { file, category, fileName } = imageUpload;
  
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const key = generateS3Key(category, fileName || file.name);
  
  // This would require a backend API endpoint to generate presigned URLs
  // For now, return mock data for type safety
  return {
    url: getS3Url(key),
    key: key,
    size: file.size,
    contentType: file.type,
    category: category,
    uploadedAt: new Date()
  };
}

// Get all images for a specific category
export function getCategoryImages(category: string): string[] {
  // In a real implementation, this would fetch from S3 or a database
  // For now, return the known images
  const images = {
    'river-cruises': ['images/river-cruises/zambezi-sunset-cruise.jpg'],
    'adventure-activities': ['images/adventure-activities/white-water-rafting.jpg'],
    'wildlife-safaris': ['images/wildlife-safaris/mosi-oa-tunya-safari.jpg'],
    'cultural-tours': ['images/cultural-tours/village-experience.jpg']
  };
  
  return images[category as keyof typeof images] || [];
}

// Generate responsive image sizes for a given image
export function getResponsiveImageUrls(imageKey: string) {
  const baseUrl = getS3Url(imageKey);
  
  // In production, these would use CloudFront with image optimization
  return {
    thumbnail: baseUrl,   // 150x150
    small: baseUrl,       // 400x300
    medium: baseUrl,      // 800x600
    large: baseUrl,       // 1200x900
    xlarge: baseUrl       // 1600x1200
  };
}

// Helper to get optimized image URL with fallback
export function getOptimizedImageUrl(imageKey: string, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' = 'medium'): string {
  const responsiveUrls = getResponsiveImageUrls(imageKey);
  return responsiveUrls[size];
}