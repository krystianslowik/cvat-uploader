import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react';
import { UploadRecord, UploadStatus } from '../types';
import { getUploadHistory } from '../utils/api';
import { HISTORY_CONFIG } from '../config';
import { LogsModal } from './LogsModal';

const STATUS_ICONS = {
  Uploaded: Clock,
  Processing: Loader2,
  Completed: CheckCircle,
  Failed: AlertCircle,
};

const STATUS_COLORS = {
  Uploaded: 'bg-amber-900/30 text-amber-300 border-amber-800/30',
  Processing: 'bg-sky-900/30 text-sky-300 border-sky-800/30',
  Completed: 'bg-emerald-900/30 text-emerald-300 border-emerald-800/30',
  Failed: 'bg-rose-900/30 text-rose-300 border-rose-800/30',
};

const STATUS_ICON_COLORS = {
  Uploaded: 'text-amber-400',
  Processing: 'text-sky-400',
  Completed: 'text-emerald-400',
  Failed: 'text-rose-400',
};

interface UploadHistoryProps {
  onViewLogs: (upload: UploadRecord) => void;
}

export function UploadHistory({ onViewLogs }: UploadHistoryProps) {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<UploadStatus | ''>('');
  const [page] = useState(HISTORY_CONFIG.defaultPage);
  const [limit] = useState(HISTORY_CONFIG.defaultLimit);
  const [selectedUpload, setSelectedUpload] = useState<UploadRecord | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  const loadHistory = async () => {
    try {
      setError(null);
      const history = await getUploadHistory(
        selectedStatus || undefined,
        page,
        limit
      );
      setUploads(history || []);
    } catch (error) {
      console.error('Failed to load upload history:', error);
      setError('Failed to load upload history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const interval = setInterval(() => {
      const hasInProgressUploads = uploads?.some(
        u => u.status === 'Uploaded' || u.status === 'Processing'
      );
      if (hasInProgressUploads) {
        loadHistory();
      }
    }, HISTORY_CONFIG.pollInterval);

    return () => clearInterval(interval);
  }, [selectedStatus, page, limit]);

  const handleViewLogs = (upload: UploadRecord) => {
    setSelectedUpload(upload);
    setIsLogsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-700/30 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-300">Loading upload history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-700/30 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="bg-rose-900/30 rounded-full p-3 mx-auto mb-3 w-fit">
              <AlertCircle className="h-6 w-6 text-rose-400" />
            </div>
            <p className="text-rose-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-700/30 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 text-transparent bg-clip-text">
          Upload History
        </h2>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as UploadStatus | '')}
          className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-lg"
        >
          <option value="">All Status</option>
          <option value="Uploaded">Uploaded</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {uploads.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="bg-slate-700/50 rounded-2xl p-4 mx-auto mb-4 w-fit">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-1">No uploads yet</h3>
          <p className="text-slate-400">Upload a file to see it in your history</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-700/30">
          <table className="min-w-full divide-y divide-slate-700/30">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800/30 divide-y divide-slate-700/30">
              {uploads.map((upload) => {
                const StatusIcon = STATUS_ICONS[upload.status];
                return (
                  <tr key={upload.job_id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border ${STATUS_COLORS[upload.status]}`}>
                          <StatusIcon className={`h-4 w-4 mr-1.5 ${STATUS_ICON_COLORS[upload.status]}`} />
                          {upload.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-200">{upload.filename}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-400">
                        {new Date(upload.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewLogs(upload)}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-600 text-sm font-medium rounded-xl text-slate-300 bg-slate-800/80 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                      >
                        <FileText className="h-4 w-4 mr-1.5 text-slate-400" />
                        View Logs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedUpload && (
        <LogsModal
          upload={selectedUpload}
          isOpen={isLogsModalOpen}
          onClose={() => {
            setIsLogsModalOpen(false);
            setSelectedUpload(null);
          }}
        />
      )}
    </div>
  );
}