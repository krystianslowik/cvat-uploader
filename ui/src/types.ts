export type UploadStatus = 'Uploaded' | 'Processing' | 'Completed' | 'Failed';

export interface UploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'paused' | 'error' | 'completed';
  error?: string;
}

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

export interface UploadRecord {
  job_id: string;
  filename: string;
  status: UploadStatus;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export interface UploadResponse {
  job_id: string;
  message: string;
}

export interface UploadHistoryResponse {
  total: number;
  page: number;
  limit: number;
  uploads: UploadRecord[];
}