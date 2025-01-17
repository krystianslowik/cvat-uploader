import axios, { AxiosError } from 'axios';
import { ChunkMetadata } from '../types';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export async function uploadFileChunk(
  chunk: Blob,
  file: File,
  metadata: ChunkMetadata,
  onProgress: (progress: number) => void
): Promise<void> {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('fileName', file.name);
  formData.append('metadata', JSON.stringify(metadata));

  try {
    await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const chunkProgress = (progressEvent.loaded / progressEvent.total);
          const overallProgress = (metadata.chunkIndex + chunkProgress) / metadata.totalChunks;
          onProgress(Math.min(overallProgress * 100, 99.9));
        }
      },
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(
      axiosError.response?.data?.message || 
      'Failed to upload chunk. Please try again.'
    );
  }
}

export function createFileChunks(file: File): { chunks: Blob[], totalChunks: number } {
  const chunks: Blob[] = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + CHUNK_SIZE, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }

  return { chunks, totalChunks: chunks.length };
}