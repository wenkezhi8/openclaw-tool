import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import type {
  FileSystemConfig,
  FileInfo,
  FileListResult,
  FileContent,
  WriteFileRequest,
  CreateDirectoryRequest,
  DeleteResult,
  PathValidationResult,
  FileType,
} from '../../types/filesystem';

// Default configuration for sandbox mode
const DEFAULT_CONFIG: FileSystemConfig = {
  allowedPaths: [
    process.cwd(),
    path.join(process.cwd(), 'memory'),
    path.join(process.cwd(), 'skills'),
    path.join(process.cwd(), 'backups'),
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  readOnly: false,
  allowHiddenFiles: false,
  blockedExtensions: ['.env', '.pem', '.key', '.secret'],
};

// Current configuration
let currentConfig: FileSystemConfig = { ...DEFAULT_CONFIG };

/**
 * Configure filesystem service
 */
export function configureFilesystem(config: Partial<FileSystemConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  logger.info('Filesystem configuration updated', {
    allowedPaths: currentConfig.allowedPaths.length,
    readOnly: currentConfig.readOnly,
  });
}

/**
 * Get current configuration
 */
export function getConfig(): FileSystemConfig {
  return { ...currentConfig };
}

/**
 * Validate if path is within allowed paths
 */
export function validatePath(requestPath: string): PathValidationResult {
  try {
    // Normalize and resolve the path
    const normalizedPath = path.normalize(requestPath);
    const resolvedPath = path.resolve(normalizedPath);

    // Check if path is within allowed paths
    const isAllowed = currentConfig.allowedPaths.some((allowedPath) => {
      const resolvedAllowed = path.resolve(allowedPath);
      return resolvedPath.startsWith(resolvedAllowed);
    });

    if (!isAllowed) {
      return {
        valid: false,
        resolvedPath,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Path is outside allowed directories',
          path: requestPath,
        },
      };
    }

    // Check for hidden files if not allowed
    if (!currentConfig.allowHiddenFiles) {
      const parts = resolvedPath.split(path.sep);
      if (parts.some((part) => part.startsWith('.'))) {
        return {
          valid: false,
          resolvedPath,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Hidden files are not allowed',
            path: requestPath,
          },
        };
      }
    }

    // Check blocked extensions
    if (currentConfig.blockedExtensions) {
      const ext = path.extname(resolvedPath).toLowerCase();
      if (currentConfig.blockedExtensions.includes(ext)) {
        return {
          valid: false,
          resolvedPath,
          error: {
            code: 'ACCESS_DENIED',
            message: 'File extension is blocked',
            path: requestPath,
          },
        };
      }
    }

    return {
      valid: true,
      resolvedPath,
    };
  } catch (error) {
    return {
      valid: false,
      resolvedPath: requestPath,
      error: {
        code: 'INVALID_PATH',
        message: error instanceof Error ? error.message : 'Invalid path',
        path: requestPath,
      },
    };
  }
}

/**
 * List files in a directory
 */
export async function listFiles(dirPath: string): Promise<FileListResult> {
  const validation = validatePath(dirPath);

  if (!validation.valid) {
    throw validation.error;
  }

  const resolvedPath = validation.resolvedPath;

  if (!fs.existsSync(resolvedPath)) {
    throw {
      code: 'FILE_NOT_FOUND',
      message: 'Directory does not exist',
      path: dirPath,
    };
  }

  const stats = fs.statSync(resolvedPath);

  if (!stats.isDirectory()) {
    throw {
      code: 'INVALID_PATH',
      message: 'Path is not a directory',
      path: dirPath,
    };
  }

  const files = fs.readdirSync(resolvedPath);
  const fileInfos: FileInfo[] = [];

  for (const file of files) {
    // Skip hidden files if not allowed
    if (!currentConfig.allowHiddenFiles && file.startsWith('.')) {
      continue;
    }

    const filePath = path.join(resolvedPath, file);
    const fileValidation = validatePath(filePath);

    if (!fileValidation.valid) {
      continue;
    }

    try {
      const info = await getFileInfo(filePath);
      fileInfos.push(info);
    } catch (error) {
      logger.warn(`Failed to get info for file: ${filePath}`, { error });
    }
  }

  // Sort: directories first, then files
  fileInfos.sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

  const parentPath = path.dirname(resolvedPath);
  const parentValidation = validatePath(parentPath);

  return {
    files: fileInfos,
    currentPath: resolvedPath,
    parentPath: parentValidation.valid ? parentPath : undefined,
    total: fileInfos.length,
  };
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<FileContent> {
  const validation = validatePath(filePath);

  if (!validation.valid) {
    throw validation.error;
  }

  const resolvedPath = validation.resolvedPath;

  if (!fs.existsSync(resolvedPath)) {
    throw {
      code: 'FILE_NOT_FOUND',
      message: 'File does not exist',
      path: filePath,
    };
  }

  const stats = fs.statSync(resolvedPath);

  if (stats.isDirectory()) {
    throw {
      code: 'INVALID_PATH',
      message: 'Path is a directory, not a file',
      path: filePath,
    };
  }

  // Check file size
  if (stats.size > currentConfig.maxFileSize) {
    throw {
      code: 'FILE_TOO_LARGE',
      message: `File size (${stats.size} bytes) exceeds maximum allowed size (${currentConfig.maxFileSize} bytes)`,
      path: filePath,
    };
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const ext = path.extname(resolvedPath).toLowerCase();

  // Detect language from extension
  const languageMap: Record<string, string> = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.jsx': 'javascript',
    '.json': 'json',
    '.md': 'markdown',
    '.py': 'python',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.html': 'html',
    '.css': 'css',
    '.sh': 'bash',
  };

  return {
    path: resolvedPath,
    content,
    encoding: 'utf-8',
    size: stats.size,
    lines: content.split('\n').length,
    language: languageMap[ext] || 'plaintext',
  };
}

/**
 * Write file content
 */
export async function writeFile(request: WriteFileRequest): Promise<FileContent> {
  // Check if in read-only mode
  if (currentConfig.readOnly) {
    throw {
      code: 'READ_ONLY',
      message: 'File system is in read-only mode',
      path: request.path,
    };
  }

  const validation = validatePath(request.path);

  if (!validation.valid) {
    throw validation.error;
  }

  const resolvedPath = validation.resolvedPath;

  // Check content size
  const contentSize = Buffer.byteLength(request.content, (request.encoding || 'utf-8') as BufferEncoding);
  if (contentSize > currentConfig.maxFileSize) {
    throw {
      code: 'FILE_TOO_LARGE',
      message: `Content size (${contentSize} bytes) exceeds maximum allowed size (${currentConfig.maxFileSize} bytes)`,
      path: request.path,
    };
  }

  // Create directory if needed
  if (request.createDirectory) {
    const dirPath = path.dirname(resolvedPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Write file
  fs.writeFileSync(resolvedPath, request.content, { encoding: (request.encoding || 'utf-8') as 'utf-8' });

  logger.info('File written', { path: resolvedPath, size: contentSize });

  // Return file content info
  return await readFile(resolvedPath);
}

/**
 * Delete file
 */
export async function deleteFile(filePath: string): Promise<DeleteResult> {
  // Check if in read-only mode
  if (currentConfig.readOnly) {
    throw {
      code: 'READ_ONLY',
      message: 'File system is in read-only mode',
      path: filePath,
    };
  }

  const validation = validatePath(filePath);

  if (!validation.valid) {
    throw validation.error;
  }

  const resolvedPath = validation.resolvedPath;

  if (!fs.existsSync(resolvedPath)) {
    throw {
      code: 'FILE_NOT_FOUND',
      message: 'File does not exist',
      path: filePath,
    };
  }

  const stats = fs.statSync(resolvedPath);

  if (stats.isDirectory()) {
    // Only delete empty directories
    const files = fs.readdirSync(resolvedPath);
    if (files.length > 0) {
      throw {
        code: 'IO_ERROR',
        message: 'Cannot delete non-empty directory',
        path: filePath,
      };
    }
    fs.rmdirSync(resolvedPath);
  } else {
    fs.unlinkSync(resolvedPath);
  }

  logger.info('File deleted', { path: resolvedPath });

  return {
    success: true,
    path: resolvedPath,
    message: 'File deleted successfully',
  };
}

/**
 * Create directory
 */
export async function createDirectory(request: CreateDirectoryRequest): Promise<FileInfo> {
  // Check if in read-only mode
  if (currentConfig.readOnly) {
    throw {
      code: 'READ_ONLY',
      message: 'File system is in read-only mode',
      path: request.path,
    };
  }

  const validation = validatePath(request.path);

  if (!validation.valid) {
    throw validation.error;
  }

  const resolvedPath = validation.resolvedPath;

  if (fs.existsSync(resolvedPath)) {
    throw {
      code: 'IO_ERROR',
      message: 'Directory already exists',
      path: request.path,
    };
  }

  if (request.recursive) {
    fs.mkdirSync(resolvedPath, { recursive: true });
  } else {
    fs.mkdirSync(resolvedPath);
  }

  logger.info('Directory created', { path: resolvedPath });

  return await getFileInfo(resolvedPath);
}

/**
 * Get file information
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const validation = validatePath(filePath);

  if (!validation.valid) {
    throw validation.error;
  }

  const resolvedPath = validation.resolvedPath;

  if (!fs.existsSync(resolvedPath)) {
    throw {
      code: 'FILE_NOT_FOUND',
      message: 'File does not exist',
      path: filePath,
    };
  }

  const stats = fs.statSync(resolvedPath);

  let type: FileType = 'file';
  if (stats.isDirectory()) {
    type = 'directory';
  } else if (stats.isSymbolicLink()) {
    type = 'symlink';
  }

  // Get permissions string
  const mode = stats.mode;
  const permissions = [
    mode & 0o400 ? 'r' : '-',
    mode & 0o200 ? 'w' : '-',
    mode & 0o100 ? 'x' : '-',
    mode & 0o040 ? 'r' : '-',
    mode & 0o020 ? 'w' : '-',
    mode & 0o010 ? 'x' : '-',
    mode & 0o004 ? 'r' : '-',
    mode & 0o002 ? 'w' : '-',
    mode & 0o001 ? 'x' : '-',
  ].join('');

  const ext = path.extname(resolvedPath);

  return {
    name: path.basename(resolvedPath),
    path: resolvedPath,
    type,
    size: stats.size,
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString(),
    permissions,
    extension: ext || undefined,
    isReadable: true, // Already validated
    isWritable: !currentConfig.readOnly && (mode & 0o200) !== 0,
  };
}
