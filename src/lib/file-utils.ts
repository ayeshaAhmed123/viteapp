
/**
 * File utility functions for handling file uploads and validation
 */

/**
 * Check if a file is of an allowed type
 */
export const isAllowedFileType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  return allowedTypes.includes(file.type);
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Convert file to base64 string for preview
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Get file icon based on file type
 */
export const getFileIcon = (file: File): string => {
  if (file.type.includes('image')) {
    return 'image';
  } else if (file.type.includes('pdf')) {
    return 'file-pdf';
  } else {
    return 'file';
  }
};

