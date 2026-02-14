// Installation Types
export interface InstallStatus {
  installed: boolean;
  version?: string;
  path?: string;
  latestVersion?: string;
  updateAvailable?: boolean;
}

export interface InstallRequest {
  version?: string;
  force?: boolean;
}

export interface InstallResponse {
  message: string;
  taskId?: string;
}

export interface UpdateResponse {
  message: string;
  fromVersion?: string;
  toVersion?: string;
}

// Progress tracking
export type InstallStep =
  | 'checking'
  | 'downloading'
  | 'extracting'
  | 'installing'
  | 'verifying'
  | 'configuring'
  | 'complete'
  | 'failed';

export interface InstallProgress {
  step: InstallStep;
  percentage: number;
  message: string;
  error?: string;
  canRetry?: boolean;
  canRollback?: boolean;
  details?: {
    bytesDownloaded?: number;
    totalBytes?: number;
    downloadSpeed?: string;
    estimatedTime?: number;
  };
}
