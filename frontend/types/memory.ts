// Memory System Types

export interface MemoryStatus {
  soulPath: string;
  userMemoryPath: string;
  soulExists: boolean;
  userMemoryFiles: string[];
  totalSize: number;
  lastBackup?: string;
}

export interface SoulConfig {
  name: string;
  description: string;
  systemPrompt: string;
  behaviorGuidelines: string[];
  personality?: {
    traits: string[];
    tone: string;
  };
  capabilities?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type UserMemoryType = 'preference' | 'fact' | 'context';

export interface UserMemory {
  id: string;
  content: string;
  timestamp: string;
  type: UserMemoryType;
  metadata?: {
    source?: string;
    importance?: number;
    tags?: string[];
  };
}

export interface UserMemoryListResponse {
  memories: UserMemory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchMemoryParams {
  query: string;
  type?: UserMemoryType;
  limit?: number;
}

export interface SearchMemoryResult {
  memories: UserMemory[];
  total: number;
  query: string;
}

export interface ClearMemoryParams {
  type?: UserMemoryType;
  before?: string;
  ids?: string[];
}

export interface BackupMemoryResult {
  success: boolean;
  backupPath: string;
  timestamp: string;
  size: number;
}
