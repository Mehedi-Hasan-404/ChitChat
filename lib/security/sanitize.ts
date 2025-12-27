// lib/security/sanitize.ts

/**
 * Security utility functions to prevent XSS, injection attacks, and path traversal
 */

// Validate and sanitize URLs
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];
  
  const lowerUrl = trimmed.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }
  
  // Only allow http and https
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    return '';
  }
  
  try {
    const urlObj = new URL(trimmed);
    // Additional validation - ensure it's a valid URL
    return urlObj.href;
  } catch {
    return '';
  }
};

// Validate image URLs more strictly
export const sanitizeImageUrl = (url: string): string => {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return '';
  
  // Check if it's actually an image URL
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
  
  try {
    const urlObj = new URL(sanitized);
    const pathname = urlObj.pathname;
    
    // Allow URLs that end with image extensions or have image-related paths
    if (imageExtensions.test(pathname) || 
        pathname.includes('/image') || 
        urlObj.hostname.includes('imgur') ||
        urlObj.hostname.includes('cloudinary') ||
        urlObj.hostname.includes('supabase') ||
        urlObj.hostname.includes('firebasestorage')) {
      return sanitized;
    }
  } catch {
    return '';
  }
  
  return '';
};

// Sanitize text content - escape HTML
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize CSS values (for background-image URLs)
export const sanitizeCssUrl = (url: string): string => {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return '';
  
  // Escape any characters that could break out of CSS
  return sanitized
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/;/g, '\\;');
};

// Validate profile picture URL
export const sanitizeProfilePicUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return '';
  
  // Additional check for profile pictures
  const maxLength = 500;
  if (sanitized.length > maxLength) return '';
  
  return sanitizeCssUrl(sanitized);
};

// Sanitize user name
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  // Remove HTML tags and limit length
  const cleaned = name
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 50);
  
  return cleaned;
};

// Sanitize file names to prevent path traversal
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') return 'file';
  
  // Remove path traversal attempts and dangerous characters
  const cleaned = fileName
    .replace(/\.\./g, '') // Remove ..
    .replace(/[/\\]/g, '') // Remove slashes
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[<>:"|?*]/g, '_') // Remove Windows forbidden chars
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Allow only safe characters
    .substring(0, 100); // Limit length
  
  // Ensure file has a name
  if (!cleaned || cleaned === '.') return 'file';
  
  // Prevent reserved Windows filenames
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = cleaned.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return `file_${cleaned}`;
  }
  
  return cleaned;
};

// Check if a URL is a valid image URL
export const isValidImageUrl = (url: string): boolean => {
  const sanitized = sanitizeImageUrl(url);
  return sanitized !== '';
};

// Check if a URL is safe to open
export const isSafeUrl = (url: string): boolean => {
  const sanitized = sanitizeUrl(url);
  return sanitized !== '';
};

// Prevent prototype pollution
export const safeObjectMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
  allowedKeys: (keyof T)[]
): T => {
  const result = { ...target };
  
  for (const key of allowedKeys) {
    if (key in source && source[key] !== undefined) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      result[key] = source[key] as T[keyof T];
    }
  }
  
  return result;
};
