// Security Audit Types

export type AuditAction =
  | 'file_read'
  | 'file_write'
  | 'file_delete'
  | 'directory_create'
  | 'command_execute'
  | 'memory_read'
  | 'memory_delete'
  | 'memory_backup'
  | 'memory_clear'
  | 'heartbeat_trigger'
  | 'config_update'
  | 'login'
  | 'logout'
  | 'access_denied';

export type AuditResult = 'success' | 'failure' | 'denied';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  result: AuditResult;
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, unknown>;
  errorMessage?: string;
  duration?: number;
}

export interface AuditLogFilter {
  action?: AuditAction;
  result?: AuditResult;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  entries: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditSummary {
  totalEntries: number;
  successCount: number;
  failureCount: number;
  deniedCount: number;
  topActions: Array<{ action: AuditAction; count: number }>;
  recentActivity: AuditEntry[];
}
