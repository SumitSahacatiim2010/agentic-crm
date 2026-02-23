/**
 * Shared audit trail write utility — all compliance-sensitive actions call this.
 * Appends to audit_logs (INSERT only — no UPDATE/DELETE possible via RLS).
 */
import { insforge } from './insforge-client';

export type RegulatoryDomain = 'AML_CTF' | 'GDPR' | 'CONSUMER_PROTECTION' | 'CREDIT' | 'GENERAL';
export type ActionClass = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'RESOLVE' | 'ESCALATE' | 'APPROVE' | 'DECLINE';

export interface AuditEntry {
    entity_name: string;
    entity_id: string;
    action: string;
    changes?: Record<string, unknown>;
    actor_persona?: string;
    regulatory_domain: RegulatoryDomain;
    action_class: ActionClass;
    reason?: string;
}

export async function writeAuditEntry(entry: AuditEntry): Promise<void> {
    await insforge.database.from('audit_logs').insert([{
        entity_name: entry.entity_name,
        entity_id: entry.entity_id,
        action: entry.action,
        changes: entry.changes ?? {},
        actor_persona: entry.actor_persona ?? 'SYSTEM',
        regulatory_domain: entry.regulatory_domain,
        action_class: entry.action_class,
        reason: entry.reason ?? '',
        event_time: new Date().toISOString(),
    }]);
}
