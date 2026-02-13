// Filesystem Types (Sandbox Mode)

export interface FileSystemConfig {
  allowedPaths: string[];
  maxFileSize: number; // bytes
  readOnly: boolean;
  allowHiddenFiles: boolean;
  allowedExtensions?: string[];
  blockedExtensions?: string[];
}

export type FileType = 'file' | 'directory' | 'symlink' | 'unknown';

export interface FileInfo {
  name: string;
  path: string;
  type: FileType;
  size: number;
  createdAt: string;
  modifiedAt: string;
  permissions: string;
  extension?: string;
  mimeType?: string;
  isReadable: boolean;
  isWritable: boolean;
}

export interface FileListResult {
  files: FileInfo[];
  currentPath: string;
  parentPath?: string;
  total: number;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: string;
  size: number;
  lines?: number;
  language?: string;
}

export interface WriteFileRequest {
  path: string;
  content: string;
  encoding?: string;
  createDirectory?: boolean;
}

export interface CreateDirectoryRequest {
  path: string;
  recursive?: boolean;
}

export interface DeleteResult {
  success: boolean;
  path: string;
  message: string;
}

export interface FileSystemError {
  code: 'ACCESS_DENIED' | 'FILE_NOT_FOUND' | 'FILE_TOO_LARGE' | 'INVALID_PATH' | 'READ_ONLY' | 'IO_ERROR';
  message: string;
  path?: string;
}

// Path validation result
export interface PathValidationResult {
  valid: boolean;
  resolvedPath: string;
  error?: FileSystemError;
}

// File tree for explorer view
export interface FileTreeNode {
  name: string;
  path: string;
  type: FileType;
  children?: FileTreeNode[];
  expanded?: boolean;
}

// Search parameters
export interface FileSearchParams {
  path: string;
  pattern: string;
  recursive?: boolean;
  maxDepth?: number;
}

export interface FileSearchResult {
  matches: FileInfo[];
  total: number;
  query: string;
}
