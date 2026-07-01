/**
 * AuditRepository – interface only, no implementation.
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';

export interface CreateAuditLogInput {
  actorId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}

export interface AuditFilters {
  actorId?: string;
  action?: AuditAction;
  entity?: string;
  entityId?: string;
  from?: Date;
  to?: Date;
}

export interface AuditLogRecord {
  id: string;
  actorId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface IAuditRepository {
  findById(id: string): Promise<AuditLogRecord | null>;
  findMany(filters?: AuditFilters): Promise<AuditLogRecord[]>;
  create(data: CreateAuditLogInput): Promise<AuditLogRecord>;
}
