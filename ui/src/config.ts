// API Configuration
export const API_CONFIG = {
  baseURL: 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedTypes: ['application/zip', 'application/x-zip-compressed'],
  chunkSize: 5 * 1024 * 1024, // 5MB for chunked uploads
};

// History Configuration
export const HISTORY_CONFIG = {
  pollInterval: 5000, // 5 seconds
  defaultPage: 1,
  defaultLimit: 10,
};

// Error Messages
export const ERROR_MESSAGES = {
  // API Errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  NOT_FOUND: 'API endpoint not found. Please check your server connection.',
  UNAUTHORIZED: 'Unauthorized. Please log in and try again.',
  FORBIDDEN: 'Access denied. You don\'t have permission to perform this action.',
  
  // Upload Errors
  FILE_TOO_LARGE: 'File is too large. Maximum size is 500MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Only ZIP files are allowed.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  UPLOAD_TIMEOUT: 'Upload timed out. Please try again.',
  
  // Validation Errors
  INVALID_REQUEST: 'Invalid request. Please check your input.',
  MISSING_FILE: 'No file selected. Please select a file to upload.',
  
  // History Errors
  HISTORY_LOAD_ERROR: 'Failed to load upload history. Please try again later.',
  STATUS_UPDATE_ERROR: 'Failed to update status. Please refresh the page.',
};