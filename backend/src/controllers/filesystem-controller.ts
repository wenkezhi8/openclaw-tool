import { Response } from 'express';
import * as filesystemService from '../services/filesystem/filesystem-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';
import type { WriteFileRequest, CreateDirectoryRequest } from '../types/filesystem';

/**
 * List Files in Directory
 * GET /api/fs
 */
export const listFiles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dirPath = (req.query.path as string) || process.cwd();

  try {
    const result = await filesystemService.listFiles(dirPath);
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const fsError = error as { code: string; message: string; path?: string };
    res.status(400).json({
      success: false,
      error: {
        code: fsError.code || 'IO_ERROR',
        message: fsError.message,
        details: fsError.path ? { path: fsError.path } : undefined,
      },
    });
  }
});

/**
 * Read File Content
 * GET /api/fs/file
 */
export const readFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filePath = req.query.path as string;

  if (!filePath) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'File path is required',
      },
    });
    return;
  }

  try {
    const result = await filesystemService.readFile(filePath);
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const fsError = error as { code: string; message: string; path?: string };
    const statusCode = fsError.code === 'FILE_NOT_FOUND' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: fsError.code || 'IO_ERROR',
        message: fsError.message,
        details: fsError.path ? { path: fsError.path } : undefined,
      },
    });
  }
});

/**
 * Write File Content
 * POST /api/fs/file
 */
export const writeFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: WriteFileRequest = {
    path: req.body.path,
    content: req.body.content,
    encoding: req.body.encoding,
    createDirectory: req.body.createDirectory,
  };

  if (!request.path) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'File path is required',
      },
    });
    return;
  }

  if (request.content === undefined) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'File content is required',
      },
    });
    return;
  }

  try {
    const result = await filesystemService.writeFile(request);
    res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    const fsError = error as { code: string; message: string; path?: string };
    res.status(400).json({
      success: false,
      error: {
        code: fsError.code || 'IO_ERROR',
        message: fsError.message,
        details: fsError.path ? { path: fsError.path } : undefined,
      },
    });
  }
});

/**
 * Delete File
 * DELETE /api/fs/file
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filePath = req.query.path as string;

  if (!filePath) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'File path is required',
      },
    });
    return;
  }

  try {
    const result = await filesystemService.deleteFile(filePath);
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const fsError = error as { code: string; message: string; path?: string };
    const statusCode = fsError.code === 'FILE_NOT_FOUND' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: fsError.code || 'IO_ERROR',
        message: fsError.message,
        details: fsError.path ? { path: fsError.path } : undefined,
      },
    });
  }
});

/**
 * Create Directory
 * POST /api/fs/directory
 */
export const createDirectory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: CreateDirectoryRequest = {
    path: req.body.path,
    recursive: req.body.recursive,
  };

  if (!request.path) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Directory path is required',
      },
    });
    return;
  }

  try {
    const result = await filesystemService.createDirectory(request);
    res.status(201).json({ success: true, data: result });
  } catch (error: unknown) {
    const fsError = error as { code: string; message: string; path?: string };
    res.status(400).json({
      success: false,
      error: {
        code: fsError.code || 'IO_ERROR',
        message: fsError.message,
        details: fsError.path ? { path: fsError.path } : undefined,
      },
    });
  }
});

/**
 * Get File Info
 * GET /api/fs/info
 */
export const getFileInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filePath = req.query.path as string;

  if (!filePath) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'File path is required',
      },
    });
    return;
  }

  try {
    const result = await filesystemService.getFileInfo(filePath);
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const fsError = error as { code: string; message: string; path?: string };
    const statusCode = fsError.code === 'FILE_NOT_FOUND' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: fsError.code || 'IO_ERROR',
        message: fsError.message,
        details: fsError.path ? { path: fsError.path } : undefined,
      },
    });
  }
});

/**
 * Get Filesystem Configuration
 * GET /api/fs/config
 */
export const getConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const config = filesystemService.getConfig();
  res.json({ success: true, data: config });
});
