import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import type {
  AuditEntry,
  AuditAction,
  AuditResult,
  AuditLogFilter,
  AuditLogResponse,
  AuditSummary,
} from '../../types/audit';

// Default audit log path
const DEFAULT_AUDIT_PATH = path.join(process.cwd(), 'logs', 'audit');

// In-memory audit log for recent entries
const auditLog: AuditEntry[] = [];
const MAX_IN_MEMORY_ENTRIES = 1000;

/**
 * Log an audit entry
 */
export function logAudit(params: {
  action: AuditAction;
  result: AuditResult;
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, unknown>;
  errorMessage?: string;
  duration?: number;
}): AuditEntry {
  const entry: AuditEntry = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    action: params.action,
    result: params.result,
    userId: params.userId,
    ip: params.ip,
    userAgent: params.userAgent,
    resource: params.resource,
    details: params.details,
    errorMessage: params.errorMessage,
    duration: params.duration,
  };

  // Add to in-memory log
  auditLog.unshift(entry);

  // Keep only recent entries in memory
  if (auditLog.length > MAX_IN_MEMORY_ENTRIES) {
    auditLog.pop();
  }

  // Write to file
  writeAuditToFile(entry);

  // Log to application logger
  const logLevel = params.result === 'denied' ? 'warn' : params.result === 'failure' ? 'error' : 'info';
  logger.log(logLevel, `Audit: ${params.action} - ${params.result}`, {
    action: params.action,
    result: params.result,
    resource: params.resource,
    userId: params.userId,
    ip: params.ip,
  });

  return entry;
}

/**
 * Get audit log with filtering
 */
export function getAuditLog(filter: AuditLogFilter = {}): AuditLogResponse {
  const {
    action,
    result,
    userId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = filter;

  let filtered = [...auditLog];

  // Apply filters
  if (action) {
    filtered = filtered.filter((e) => e.action === action);
  }

  if (result) {
    filtered = filtered.filter((e) => e.result === result);
  }

  if (userId) {
    filtered = filtered.filter((e) => e.userId === userId);
  }

  if (startDate) {
    const start = new Date(startDate);
    filtered = filtered.filter((e) => new Date(e.timestamp) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    filtered = filtered.filter((e) => new Date(e.timestamp) <= end);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedEntries = filtered.slice(startIndex, startIndex + limit);

  return {
    entries: paginatedEntries,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get audit summary
 */
export function getAuditSummary(): AuditSummary {
  const successCount = auditLog.filter((e) => e.result === 'success').length;
  const failureCount = auditLog.filter((e) => e.result === 'failure').length;
  const deniedCount = auditLog.filter((e) => e.result === 'denied').length;

  // Count actions
  const actionCounts: Record<AuditAction, number> = {} as Record<AuditAction, number>;
  for (const entry of auditLog) {
    actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
  }

  // Sort by count
  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action: action as AuditAction, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEntries: auditLog.length,
    successCount,
    failureCount,
    deniedCount,
    topActions,
    recentActivity: auditLog.slice(0, 10),
  };
}

/**
 * Clear audit log
 */
export function clearAuditLog(): { cleared: number } {
  const cleared = auditLog.length;
  auditLog.length = 0;

  logger.info('Audit log cleared', { cleared });

  return { cleared };
}

/**
 * Export audit log to file
 */
export function exportAuditLog(format: 'json' | 'csv' = 'json'): string {
  const auditPath = process.env.AUDIT_PATH || DEFAULT_AUDIT_PATH;

  if (!fs.existsSync(auditPath)) {
    fs.mkdirSync(auditPath, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `audit-export-${timestamp}.${format}`;
  const filePath = path.join(auditPath, fileName);

  if (format === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(auditLog, null, 2));
  } else {
    // CSV format
    const headers = ['id', 'timestamp', 'action', 'result', 'userId', 'ip', 'resource', 'errorMessage'];
    const rows = auditLog.map((e) =>
      headers.map((h) => {
        const value = e[h as keyof AuditEntry];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(filePath, csv);
  }

  logger.info(`Audit log exported to ${filePath}`);

  return filePath;
}

/**
 * Helper functions for common audit actions
 */

export function auditFileRead(resource: string, result: AuditResult, details?: Record<string, unknown>, ip?: string): AuditEntry {
  return logAudit({ action: 'file_read', result, resource, details, ip });
}

export function auditFileWrite(resource: string, result: AuditResult, details?: Record<string, unknown>, ip?: string): AuditEntry {
  return logAudit({ action: 'file_write', result, resource, details, ip });
}

export function auditFileDelete(resource: string, result: AuditResult, details?: Record<string, unknown>, ip?: string): AuditEntry {
  return logAudit({ action: 'file_delete', result, resource, details, ip });
}

export function auditCommandExecute(resource: string, result: AuditResult, details?: Record<string, unknown>, duration?: number, ip?: string): AuditEntry {
  return logAudit({ action: 'command_execute', result, resource, details, duration, ip });
}

export function auditMemoryDelete(resource: string, result: AuditResult, details?: Record<string, unknown>, ip?: string): AuditEntry {
  return logAudit({ action: 'memory_delete', result, resource, details, ip });
}

export function auditAccessDenied(action: AuditAction, resource: string, reason: string, ip?: string): AuditEntry {
  return logAudit({ action, result: 'denied', resource, errorMessage: reason, ip });
}

// Private helper functions

function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function writeAuditToFile(entry: AuditEntry): void {
  try {
    const auditPath = process.env.AUDIT_PATH || DEFAULT_AUDIT_PATH;

    if (!fs.existsSync(auditPath)) {
      fs.mkdirSync(auditPath, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(auditPath, `audit-${date}.log`);

    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    logger.error('Failed to write audit entry to file', { error });
  }
}

// Load recent audit entries from file on startup
function loadRecentAuditEntries(): void {
  try {
    const auditPath = process.env.AUDIT_PATH || DEFAULT_AUDIT_PATH;

    if (!fs.existsSync(auditPath)) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(auditPath, `audit-${today}.log`);

    if (!fs.existsSync(logFile)) {
      return;
    }

    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.trim().split('\n');

    // Load last entries
    const startIndex = Math.max(0, lines.length - MAX_IN_MEMORY_ENTRIES);
    for (let i = startIndex; i < lines.length; i++) {
      try {
        const entry = JSON.parse(lines[i]) as AuditEntry;
        auditLog.push(entry);
      } catch (e) {
        // Skip invalid lines
      }
    }

    logger.info(`Loaded ${auditLog.length} audit entries from file`);
  } catch (error) {
    logger.error('Failed to load audit entries from file', { error });
  }
}

// Initialize on module load
loadRecentAuditEntries();
