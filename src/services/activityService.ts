import { supabase } from '../lib/supabase'

export type ActionType = 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGE' | 'SYSTEM'
export type EntityType = 'RFQ' | 'JOB' | 'CLIENT' | 'QUOTE' | 'SYSTEM'

interface LogActivityParams {
  actionType: ActionType
  entityType: EntityType
  entityId?: string
  entityReference?: string
  description?: string
  oldValue?: string
  newValue?: string
  metadata?: Record<string, any>
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    // Get current user (simplified - you can expand this)
    const userName = 'admin' // In production, get from auth context

    await supabase.from('activity_log').insert({
      user_name: userName,
      action_type: params.actionType,
      entity_type: params.entityType,
      entity_id: params.entityId,
      entity_reference: params.entityReference,
      description: params.description,
      old_value: params.oldValue,
      new_value: params.newValue,
      metadata: params.metadata,
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

// Convenience functions
export const logJobCreated = (jobNumber: string, jobId: string) => 
  logActivity({
    actionType: 'CREATED',
    entityType: 'JOB',
    entityId: jobId,
    entityReference: jobNumber,
    description: `Created job ${jobNumber}`,
  })

export const logRfqCreated = (rfqNumber: string, rfqId: string) =>
  logActivity({
    actionType: 'CREATED',
    entityType: 'RFQ',
    entityId: rfqId,
    entityReference: rfqNumber,
    description: `Created RFQ ${rfqNumber}`,
  })

export const logStatusChange = (entityType: EntityType, reference: string, oldStatus: string, newStatus: string) =>
  logActivity({
    actionType: 'STATUS_CHANGE',
    entityType,
    entityReference: reference,
    description: `Changed status from ${oldStatus} to ${newStatus}`,
    oldValue: oldStatus,
    newValue: newStatus,
  })

export default { logActivity, logJobCreated, logRfqCreated, logStatusChange }