import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import type {
  MemoryStatus,
  SoulConfig,
  UserMemory,
  UserMemoryListResponse,
  SearchMemoryParams,
  SearchMemoryResult,
  ClearMemoryParams,
  BackupMemoryResult,
  CliUserMemory,
} from '../../types/memory';

// Default paths for memory storage
const DEFAULT_SOUL_PATH = path.join(process.cwd(), 'SOUL.md');
const DEFAULT_USER_MEMORY_PATH = path.join(process.cwd(), 'memory');
const DEFAULT_BACKUP_PATH = path.join(process.cwd(), 'backups', 'memory');

// Cache for performance optimization
interface MemoryCache {
  memories: UserMemory[];
  lastUpdated: number;
  ttl: number; // Time to live in milliseconds
}

const memoryCache: MemoryCache = {
  memories: [],
  lastUpdated: 0,
  ttl: 60000, // 1 minute cache
};

const soulConfigCache = {
  config: null as SoulConfig | null,
  lastUpdated: 0,
  ttl: 30000, // 30 seconds cache
};

/**
 * Invalidate cache
 */
export function invalidateCache(): void {
  memoryCache.lastUpdated = 0;
  soulConfigCache.lastUpdated = 0;
  logger.debug('Memory cache invalidated');
}

/**
 * Check if cache is valid
 */
function isCacheValid(cache: { lastUpdated: number; ttl: number }): boolean {
  return Date.now() - cache.lastUpdated < cache.ttl;
}

/**
 * Get memory status overview
 */
export async function getMemoryStatus(): Promise<MemoryStatus> {
  try {
    const soulPath = process.env.SOUL_PATH || DEFAULT_SOUL_PATH;
    const userMemoryPath = process.env.USER_MEMORY_PATH || DEFAULT_USER_MEMORY_PATH;

    // Check if SOUL.md exists
    const soulExists = fs.existsSync(soulPath);

    // Get user memory files
    let userMemoryFiles: string[] = [];
    let totalSize = 0;

    if (fs.existsSync(userMemoryPath)) {
      const files = fs.readdirSync(userMemoryPath);
      userMemoryFiles = files.filter((file) => file.endsWith('.json') || file.endsWith('.md'));

      for (const file of userMemoryFiles) {
        const filePath = path.join(userMemoryPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    }

    // Check for last backup
    let lastBackup: string | undefined;
    const backupPath = process.env.MEMORY_BACKUP_PATH || DEFAULT_BACKUP_PATH;
    if (fs.existsSync(backupPath)) {
      const backupFiles = fs.readdirSync(backupPath)
        .filter((f) => f.startsWith('memory-backup-'))
        .sort()
        .reverse();

      if (backupFiles.length > 0) {
        const lastBackupFile = backupFiles[0];
        const stats = fs.statSync(path.join(backupPath, lastBackupFile));
        lastBackup = stats.mtime.toISOString();
      }
    }

    return {
      soulPath,
      userMemoryPath,
      soulExists,
      userMemoryFiles,
      totalSize,
      lastBackup,
    };
  } catch (error) {
    logger.error('Failed to get memory status', { error });
    throw error;
  }
}

/**
 * Get SOUL layer configuration
 */
export async function getSoulConfig(): Promise<SoulConfig | null> {
  try {
    // Check cache first
    if (isCacheValid(soulConfigCache) && soulConfigCache.config !== null) {
      return soulConfigCache.config;
    }

    const soulPath = process.env.SOUL_PATH || DEFAULT_SOUL_PATH;

    if (!fs.existsSync(soulPath)) {
      return null;
    }

    const content = fs.readFileSync(soulPath, 'utf-8');

    // Parse SOUL.md content
    const config: SoulConfig = {
      name: 'Default Soul',
      description: '',
      systemPrompt: '',
      behaviorGuidelines: [],
    };

    // Extract sections from markdown
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('# ')) {
        config.name = line.substring(2).trim();
      } else if (line.startsWith('## Description')) {
        currentSection = 'description';
        currentContent = [];
      } else if (line.startsWith('## System Prompt')) {
        currentSection = 'systemPrompt';
        currentContent = [];
      } else if (line.startsWith('## Behavior Guidelines')) {
        currentSection = 'behaviorGuidelines';
        currentContent = [];
      } else if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection === 'description') {
          config.description = currentContent.join('\n').trim();
        } else if (currentSection === 'systemPrompt') {
          config.systemPrompt = currentContent.join('\n').trim();
        } else if (currentSection === 'behaviorGuidelines') {
          config.behaviorGuidelines = currentContent
            .filter((l) => l.trim().startsWith('-'))
            .map((l) => l.trim().substring(1).trim());
        }
        currentSection = '';
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection === 'description') {
      config.description = currentContent.join('\n').trim();
    } else if (currentSection === 'systemPrompt') {
      config.systemPrompt = currentContent.join('\n').trim();
    } else if (currentSection === 'behaviorGuidelines') {
      config.behaviorGuidelines = currentContent
        .filter((l) => l.trim().startsWith('-'))
        .map((l) => l.trim().substring(1).trim());
    }

    // Update cache
    soulConfigCache.config = config;
    soulConfigCache.lastUpdated = Date.now();

    return config;
  } catch (error) {
    logger.error('Failed to get SOUL config', { error });
    throw error;
  }
}

/**
 * Load all memories with caching
 */
async function loadAllMemories(): Promise<UserMemory[]> {
  // Check cache
  if (isCacheValid(memoryCache)) {
    return memoryCache.memories;
  }

  const userMemoryPath = process.env.USER_MEMORY_PATH || DEFAULT_USER_MEMORY_PATH;

  if (!fs.existsSync(userMemoryPath)) {
    memoryCache.memories = [];
    memoryCache.lastUpdated = Date.now();
    return [];
  }

  const memories: UserMemory[] = [];
  const files = fs.readdirSync(userMemoryPath).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    try {
      const filePath = path.join(userMemoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Handle both array and single object formats
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        memories.push(adaptCliUserMemory(item));
      }
    } catch (e) {
      logger.warn(`Failed to parse memory file: ${file}`, { error: e });
    }
  }

  // Sort by timestamp descending
  memories.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Update cache
  memoryCache.memories = memories;
  memoryCache.lastUpdated = Date.now();

  return memories;
}

/**
 * Get user memory list
 */
export async function getUserMemory(
  page: number = 1,
  limit: number = 20,
  type?: 'preference' | 'fact' | 'context'
): Promise<UserMemoryListResponse> {
  try {
    // Use cached memory loading
    const allMemories = await loadAllMemories();

    // Filter by type if specified
    const memories = type
      ? allMemories.filter((m) => m.type === type)
      : allMemories;

    const total = memories.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedMemories = memories.slice(startIndex, startIndex + limit);

    return {
      memories: paginatedMemories,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    logger.error('Failed to get user memory', { error });
    throw error;
  }
}

/**
 * Get specific user memory by ID
 */
export async function getUserMemoryById(id: string): Promise<UserMemory | null> {
  try {
    // Use cached memory loading for better performance
    const allMemories = await loadAllMemories();
    return allMemories.find((m) => m.id === id) || null;
  } catch (error) {
    logger.error('Failed to get user memory by ID', { error });
    throw error;
  }
}

/**
 * Search memory
 */
export async function searchMemory(params: SearchMemoryParams): Promise<SearchMemoryResult> {
  try {
    const { query, type, limit = 50 } = params;

    // Use cached memory loading
    const allMemories = await loadAllMemories();
    const queryLower = query.toLowerCase();

    const memories = allMemories
      .filter((memory) => {
        // Filter by type if specified
        if (type && memory.type !== type) {
          return false;
        }
        // Search in content
        return memory.content.toLowerCase().includes(queryLower);
      })
      .sort((a, b) => {
        // Sort by relevance (more occurrences = higher relevance)
        const countA = (a.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
        const countB = (b.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
        return countB - countA;
      });

    const total = memories.length;

    return {
      memories: memories.slice(0, limit),
      total,
      query,
    };
  } catch (error) {
    logger.error('Failed to search memory', { error });
    throw error;
  }
}

/**
 * Clear specific memory
 */
export async function clearMemory(params: ClearMemoryParams): Promise<{ deleted: number }> {
  try {
    const userMemoryPath = process.env.USER_MEMORY_PATH || DEFAULT_USER_MEMORY_PATH;
    let deleted = 0;

    if (!fs.existsSync(userMemoryPath)) {
      return { deleted: 0 };
    }

    // Clear by IDs
    if (params.ids && params.ids.length > 0) {
      const files = fs.readdirSync(userMemoryPath).filter((f) => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(userMemoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const items = Array.isArray(data) ? data : [data];

        const remaining = items.filter((item: CliUserMemory) => {
          const memory = adaptCliUserMemory(item);
          const shouldDelete = params.ids!.includes(memory.id);
          if (shouldDelete) deleted++;
          return !shouldDelete;
        });

        if (remaining.length === 0) {
          fs.unlinkSync(filePath);
        } else {
          fs.writeFileSync(filePath, JSON.stringify(remaining, null, 2));
        }
      }
    }

    // Clear by type
    else if (params.type) {
      const files = fs.readdirSync(userMemoryPath).filter((f) => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(userMemoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const items = Array.isArray(data) ? data : [data];

        const remaining = items.filter((item: CliUserMemory) => {
          const memory = adaptCliUserMemory(item);
          const shouldDelete = memory.type === params.type;
          if (shouldDelete) deleted++;
          return !shouldDelete;
        });

        if (remaining.length === 0) {
          fs.unlinkSync(filePath);
        } else {
          fs.writeFileSync(filePath, JSON.stringify(remaining, null, 2));
        }
      }
    }

    // Clear by date
    else if (params.before) {
      const beforeDate = new Date(params.before);
      const files = fs.readdirSync(userMemoryPath).filter((f) => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(userMemoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const items = Array.isArray(data) ? data : [data];

        const remaining = items.filter((item: CliUserMemory) => {
          const memory = adaptCliUserMemory(item);
          const memoryDate = new Date(memory.timestamp);
          const shouldDelete = memoryDate < beforeDate;
          if (shouldDelete) deleted++;
          return !shouldDelete;
        });

        if (remaining.length === 0) {
          fs.unlinkSync(filePath);
        } else {
          fs.writeFileSync(filePath, JSON.stringify(remaining, null, 2));
        }
      }
    }

    logger.info(`Cleared ${deleted} memory entries`);

    // Invalidate cache after modification
    invalidateCache();

    return { deleted };
  } catch (error) {
    logger.error('Failed to clear memory', { error });
    throw error;
  }
}

/**
 * Backup memory to file
 */
export async function backupMemory(): Promise<BackupMemoryResult> {
  try {
    const userMemoryPath = process.env.USER_MEMORY_PATH || DEFAULT_USER_MEMORY_PATH;
    const backupPath = process.env.MEMORY_BACKUP_PATH || DEFAULT_BACKUP_PATH;

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `memory-backup-${timestamp}.json`;
    const backupFilePath = path.join(backupPath, backupFileName);

    // Collect all memories
    const memories: UserMemory[] = [];

    if (fs.existsSync(userMemoryPath)) {
      const files = fs.readdirSync(userMemoryPath).filter((f) => f.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(userMemoryPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          const items = Array.isArray(data) ? data : [data];

          for (const item of items) {
            memories.push(adaptCliUserMemory(item));
          }
        } catch (e) {
          logger.warn(`Failed to include file in backup: ${file}`, { error: e });
        }
      }
    }

    // Include SOUL config if exists
    const soulConfig = await getSoulConfig();

    const backupData = {
      timestamp: new Date().toISOString(),
      soulConfig,
      memories,
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    const stats = fs.statSync(backupFilePath);

    logger.info(`Memory backed up to ${backupFilePath}`);

    // Clean up old backups (keep last 10)
    cleanupOldBackups(backupPath, 10);

    return {
      success: true,
      backupPath: backupFilePath,
      timestamp: backupData.timestamp,
      size: stats.size,
    };
  } catch (error) {
    logger.error('Failed to backup memory', { error });
    throw error;
  }
}

/**
 * Cleanup old backups, keeping only the most recent ones
 */
export function cleanupOldBackups(backupPath: string, keepCount: number = 10): number {
  try {
    if (!fs.existsSync(backupPath)) {
      return 0;
    }

    const backupFiles = fs.readdirSync(backupPath)
      .filter((f) => f.startsWith('memory-backup-'))
      .sort()
      .reverse();

    const toDelete = backupFiles.slice(keepCount);
    let deleted = 0;

    for (const file of toDelete) {
      try {
        fs.unlinkSync(path.join(backupPath, file));
        deleted++;
      } catch (e) {
        logger.warn(`Failed to delete old backup: ${file}`, { error: e });
      }
    }

    if (deleted > 0) {
      logger.info(`Cleaned up ${deleted} old backup(s)`);
    }

    return deleted;
  } catch (error) {
    logger.error('Failed to cleanup old backups', { error });
    return 0;
  }
}

/**
 * Get memory statistics
 */
export async function getMemoryStatistics(): Promise<{
  totalMemories: number;
  byType: Record<string, number>;
  averageContentLength: number;
  oldestMemory?: string;
  newestMemory?: string;
}> {
  try {
    const allMemories = await loadAllMemories();

    const byType: Record<string, number> = {
      preference: 0,
      fact: 0,
      context: 0,
    };

    let totalLength = 0;

    for (const memory of allMemories) {
      byType[memory.type] = (byType[memory.type] || 0) + 1;
      totalLength += memory.content.length;
    }

    return {
      totalMemories: allMemories.length,
      byType,
      averageContentLength: allMemories.length > 0 ? Math.round(totalLength / allMemories.length) : 0,
      oldestMemory: allMemories.length > 0 ? allMemories[allMemories.length - 1].timestamp : undefined,
      newestMemory: allMemories.length > 0 ? allMemories[0].timestamp : undefined,
    };
  } catch (error) {
    logger.error('Failed to get memory statistics', { error });
    throw error;
  }
}

/**
 * Adapt CLI user memory to standard format
 */
function adaptCliUserMemory(cliMemory: CliUserMemory): UserMemory {
  return {
    id: cliMemory.id || generateId(),
    content: cliMemory.content || '',
    timestamp: cliMemory.timestamp || new Date().toISOString(),
    type: (['preference', 'fact', 'context'].includes(cliMemory.type)
      ? cliMemory.type
      : 'context') as 'preference' | 'fact' | 'context',
    metadata: cliMemory.metadata as UserMemory['metadata'],
  };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
