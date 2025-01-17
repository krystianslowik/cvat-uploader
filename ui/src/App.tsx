import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { UploadProgress } from './components/UploadProgress';
import { UploadHistory } from './components/UploadHistory';
import { Toast } from './components/Toast';
import { Hero } from './components/Hero';
import { ProcessingState } from './components/ProcessingState';
import { uploadFile, getUploadStatus } from './utils/api';
import { UploadState, Toast as ToastType } from './types';
import { UPLOAD_CONFIG, ERROR_MESSAGES } from './config';

const { maxFileSize, allowedTypes } = UPLOAD_CONFIG;

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    status: 'idle'
  });
  const [toast, setToast] = useState<ToastType | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (statusPollRef.current) {
        clearInterval(statusPollRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return ERROR_MESSAGES.INVALID_FILE_TYPE;
    }
    if (file.size > maxFileSize) {
      return ERROR_MESSAGES.FILE_TOO_LARGE;
    }
    return null;
  };

  const pollUploadStatus = useCallback(async (jobId: string) => {
    try {
      const status = await getUploadStatus(jobId);
      
      switch (status.status) {
        case 'Completed':
          setUploadState({ progress: 100, status: 'completed' });
          setToast({ message: 'File processed successfully', type: 'success' });
          clearInterval(statusPollRef.current!);
          setCurrentJobId(null);
          setIsProcessing(false);
          break;
        case 'Failed':
          setUploadState({
            progress: 0,
            status: 'error',
            error: status.error_message || ERROR_MESSAGES.UPLOAD_FAILED
          });
          setToast({
            message: status.error_message || ERROR_MESSAGES.UPLOAD_FAILED,
            type: 'error'
          });
          clearInterval(statusPollRef.current!);
          setCurrentJobId(null);
          setIsProcessing(false);
          break;
        case 'Processing':
          setIsProcessing(true);
          setUploadState(prev => ({
            ...prev,
            progress: Math.min(95 + Math.random() * 4, 99)
          }));
          break;
      }
    } catch (error) {
      console.error('Failed to poll status:', error);
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const error = validateFile(selectedFile);
    if (error) {
      setUploadState({ progress: 0, status: 'error', error });
      setToast({ message: error, type: 'error' });
      return;
    }

    setFile(selectedFile);
    setUploadState({ progress: 0, status: 'idle' });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadState({ progress: 0, status: 'uploading' });
    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFile(formData, (progress) => {
        if (abortControllerRef.current) {
          setUploadState(prev => ({ ...prev, progress }));
        }
      });

      if (abortControllerRef.current) {
        setCurrentJobId(response.job_id);
        
        statusPollRef.current = setInterval(
          () => pollUploadStatus(response.job_id),
          2000
        );

        setToast({
          message: 'File uploaded successfully, processing...',
          type: 'success'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UPLOAD_FAILED;
      setUploadState({
        progress: 0,
        status: 'error',
        error: errorMessage
      });
      setToast({
        message: errorMessage,
        type: 'error'
      });
    }
  };

  const handleRetry = () => {
    if (file) {
      handleUpload();
    }
  };

  const handleCancel = () => {
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploadState({ progress: 0, status: 'idle' });
    setFile(null);
    setCurrentJobId(null);
    setIsProcessing(false);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const error = validateFile(droppedFile);
      if (error) {
        setUploadState({ progress: 0, status: 'error', error });
        setToast({ message: error, type: 'error' });
        return;
      }
      setFile(droppedFile);
      setUploadState({ progress: 0, status: 'idle' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Hero />

        <div className="bg-slate-800/20 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-700/30 p-8">
          {isProcessing && file ? (
            <ProcessingState filename={file.name} />
          ) : (
            <div
              className={`border-2 border-dashed rounded-2xl p-8 mb-6 transition-all duration-300 ease-out ${
                !file 
                  ? 'border-slate-700 hover:border-sky-500 hover:bg-sky-900/10' 
                  : 'border-sky-700 bg-sky-900/10'
              }`}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {!file ? (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-sky-400" />
                  <p className="mt-4 text-slate-300">
                    Drag and drop your ZIP file here, or
                    <label className="mx-1 text-sky-400 hover:text-sky-300 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".zip"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Maximum file size: 500MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Upload className="h-5 w-5 text-sky-400" />
                      <span className="text-slate-200 font-medium">
                        {file.name}
                      </span>
                      <span className="text-slate-400">
                        ({Math.round(file.size / (1024 * 1024))} MB)
                      </span>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="text-slate-400 hover:text-slate-300 transition-colors p-2 hover:bg-slate-700/50 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <UploadProgress state={uploadState} />
                  
                  <div className="flex justify-end space-x-3">
                    {uploadState.status === 'error' && (
                      <button
                        onClick={handleRetry}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl hover:from-sky-400 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                      >
                        Retry Upload
                      </button>
                    )}
                    {uploadState.status === 'idle' && (
                      <button
                        onClick={handleUpload}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl hover:from-sky-400 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                      >
                        Start Upload
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <UploadHistory onViewLogs={(upload) => {
          // Handle viewing logs
        }} />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;