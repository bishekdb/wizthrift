/**
 * Secure file upload utilities with comprehensive validation
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_UPLOAD = 5;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_IMAGE_DIMENSION = 4096; // 4K max

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadRateLimiter {
  canUpload: () => boolean;
  recordUpload: () => void;
}

// Rate limiter: Max 10 uploads per minute
const uploadAttempts: number[] = [];
const MAX_UPLOADS_PER_MINUTE = 10;

export const uploadRateLimiter: UploadRateLimiter = {
  canUpload: () => {
    const now = Date.now();
    const recentAttempts = uploadAttempts.filter(time => now - time < 60000);
    uploadAttempts.length = 0;
    uploadAttempts.push(...recentAttempts);
    return recentAttempts.length < MAX_UPLOADS_PER_MINUTE;
  },
  
  recordUpload: () => {
    uploadAttempts.push(Date.now());
  }
};

/**
 * Validate file before upload
 */
export const validateFile = async (file: File): Promise<FileValidationResult> => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Check file type (MIME)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Verify it's actually an image by reading file header
  const isValidImage = await verifyImageHeader(file);
  if (!isValidImage) {
    return {
      valid: false,
      error: 'File is not a valid image (header verification failed)'
    };
  }

  // Check image dimensions
  const dimensions = await getImageDimensions(file);
  if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: `Image too large. Maximum dimensions: ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}px`
    };
  }

  return { valid: true };
};

/**
 * Verify file is actually an image by checking magic bytes
 */
const verifyImageHeader = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      
      // Check magic bytes for common image formats
      const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
      const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
      const isWebP = arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50;
      
      resolve(isPNG || isJPEG || isWebP);
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
};

/**
 * Get image dimensions without full load
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special chars
    .replace(/\.+/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 100); // Limit length
};

/**
 * Generate secure filename
 */
export const generateSecureFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.toLowerCase().match(/\.[^.]+$/)?.[0] || '.jpg';
  const sanitized = sanitizeFilename(originalFilename.replace(extension, ''));
  
  return `${timestamp}_${random}_${sanitized}${extension}`;
};

/**
 * Validate batch of files
 */
export const validateFiles = async (files: FileList | File[]): Promise<{
  valid: File[];
  invalid: { file: File; error: string }[];
}> => {
  if (files.length > MAX_FILES_PER_UPLOAD) {
    return {
      valid: [],
      invalid: [{ 
        file: files[0], 
        error: `Too many files. Maximum ${MAX_FILES_PER_UPLOAD} at once` 
      }]
    };
  }

  const results = await Promise.all(
    Array.from(files).map(async (file) => ({
      file,
      validation: await validateFile(file)
    }))
  );

  return {
    valid: results.filter(r => r.validation.valid).map(r => r.file),
    invalid: results
      .filter(r => !r.validation.valid)
      .map(r => ({ file: r.file, error: r.validation.error || 'Unknown error' }))
  };
};
