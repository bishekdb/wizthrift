/**
 * Audit logging utility for admin actions
 * Logs all security-critical administrative operations
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export type AuditAction = 
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'user_promoted_admin'
  | 'user_demoted_admin'
  | 'order_status_changed'
  | 'settings_updated'
  | 'password_changed';

interface AuditLogEntry {
  action: AuditAction;
  user_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an admin action for audit trail
 */
export const logAdminAction = async (
  action: AuditAction,
  details: Record<string, any>
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.warn('Attempted to log action without authenticated user');
      return;
    }

    const auditEntry: AuditLogEntry = {
      action,
      user_id: user.id,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
    };

    // Log to console in development
    logger.info('Admin Action:', auditEntry);

    // TODO: Store in database audit_logs table
    // const { error } = await supabase
    //   .from('audit_logs')
    //   .insert(auditEntry);
    
    // if (error) {
    //   logger.error('Failed to log audit entry', error);
    // }
    
    // For now, log to localStorage as backup
    const logs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
    logs.push(auditEntry);
    
    // Keep only last 100 logs in localStorage
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem('admin_audit_logs', JSON.stringify(logs));
    
  } catch (error) {
    logger.error('Error logging admin action', error);
  }
};

/**
 * Get client IP address (best effort)
 */
const getClientIP = async (): Promise<string | undefined> => {
  try {
    // This would need to be implemented via edge function
    // For now, return undefined
    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * Retrieve audit logs (for admin dashboard)
 */
export const getAuditLogs = (limit = 50): AuditLogEntry[] => {
  try {
    const logs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
    return logs.slice(-limit).reverse();
  } catch {
    return [];
  }
};

/**
 * Clear old audit logs
 */
export const clearAuditLogs = (): void => {
  localStorage.removeItem('admin_audit_logs');
};
