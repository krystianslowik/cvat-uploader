import { UploadRecord, UploadResponse } from '../types';

// Mock upload records
export const mockUploads: UploadRecord[] = [
  {
    job_id: 'job_123456789',
    filename: 'project-files.zip',
    status: 'Completed',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    error_message: null
  },
  {
    job_id: 'job_987654321',
    filename: 'large-dataset.zip',
    status: 'Failed',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
    error_message: 'File size exceeds maximum limit of 500MB'
  },
  {
    job_id: 'job_456789123',
    filename: 'processing.zip',
    status: 'Processing',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    updated_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    error_message: null
  },
  {
    job_id: 'job_789123456',
    filename: 'pending-upload.zip',
    status: 'Uploaded',
    created_at: new Date(Date.now() - 1000 * 30).toISOString(), // 30 seconds ago
    updated_at: new Date(Date.now() - 1000 * 29).toISOString(),
    error_message: null
  }
];