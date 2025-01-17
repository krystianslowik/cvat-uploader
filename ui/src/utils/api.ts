import axios, { AxiosError } from 'axios';
import { UploadHistoryResponse, UploadRecord, UploadResponse, UploadStatus } from '../types';
import { API_CONFIG, ERROR_MESSAGES } from '../config';

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
});

// Error handler utility
const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    
    // Network errors
    if (!axiosError.response) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Handle specific HTTP status codes
    switch (axiosError.response.status) {
      case 400:
        throw new Error(axiosError.response.data?.detail || ERROR_MESSAGES.INVALID_REQUEST);
      case 401:
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      case 404:
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      case 413:
        throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
      case 408:
      case 504:
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      case 500:
      case 502:
      case 503:
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      default:
        throw new Error(axiosError.response.data?.detail || ERROR_MESSAGES.UPLOAD_FAILED);
    }
  }
  
  // Handle non-Axios errors
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  
  throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
};

// Add response interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => Promise.reject(handleError(error))
);

// Retry failed requests
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = API_CONFIG.retries
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && !error.response) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

export async function getUploadHistory(
  status?: UploadStatus,
  page: number = 1,
  limit: number = 10
): Promise<UploadRecord[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await withRetry(() => 
      api.get<UploadHistoryResponse>(`/uploads?${params.toString()}`)
    );

    // Sort the uploads by created_at in descending order (newest first)
    return response.data.uploads.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    throw new Error(ERROR_MESSAGES.HISTORY_LOAD_ERROR);
  }
}

export async function getUploadStatus(jobId: string): Promise<UploadRecord> {
  try {
    const response = await withRetry(() =>
      api.get<UploadRecord>(`/upload/${jobId}/status`)
    );
    return response.data;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.STATUS_UPDATE_ERROR);
  }
}

export async function uploadFile(
  formData: FormData,
  onUploadProgress?: (progress: number) => void
): Promise<UploadResponse> {
  try {
    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onUploadProgress(Math.min(progress, 95)); // Reserve last 5% for processing
        }
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error(ERROR_MESSAGES.UPLOAD_TIMEOUT);
    }
    throw error; // Will be handled by the global error handler
  }
}