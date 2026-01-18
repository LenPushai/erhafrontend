import { supabase } from '../lib/supabase';

export interface JobLineItem {
  id?: string;
  job_id?: string;
  item_type: string;
  description: string;
  specification?: string;
  worker_type?: string;
  quantity: number;
  uom: string;
  cost_price: number;
  sell_price: number;
  line_total: number;
  sort_order?: number;
}

export interface Job {
  id?: string;
  job_number: string;
  job_type: 'STANDARD' | 'EMERGENCY';
  is_emergency: boolean;
  client_id?: string;
  client_name?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  special_requirements?: string;
  site_location?: string;
  rfq_id?: string;
  rfq_number?: string;
  po_number?: string;
  order_number?: string;
  order_date?: string;
  quoted_value?: number;
  actual_cost?: number;
  status: string;
  priority: string;
  severity_level?: string;
  production_stopped?: boolean;
  safety_risk?: boolean;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_supervisor?: string;
  assigned_workers?: string;
  special_equipment?: string;
  invoice_number?: string;
  invoice_date?: string;
  created_at?: string;
  updated_at?: string;
  // Parent-Child relationships
  parent_job_id?: string;
  job_suffix?: string;
  is_child_job?: boolean;
  child_sequence?: number;
  job_phase?: string;
  internal_notes?: string;
  customer_notes?: string;
  // Joined data
  line_items?: JobLineItem[];
  child_jobs?: Job[];
  parent_job?: Job;
}

const JOB_PHASES = [
  'FABRICATION',
  'ASSEMBLY', 
  'WELDING',
  'MACHINING',
  'ELECTRICAL',
  'INSTALLATION',
  'SITE_WORK',
  'SUBCONTRACT',
  'TESTING',
  'FINISHING',
  'DELIVERY'
];

class JobService {
  
  // Generate next job number
  async generateJobNumber(type: 'STANDARD' | 'EMERGENCY', parentJobNumber?: string): Promise<string> {
    if (parentJobNumber) {
      // Child job - get next suffix (A, B, C, etc.)
      const { data: siblings } = await supabase
        .from('jobs')
        .select('job_suffix')
        .like('job_number', `${parentJobNumber}-%`)
        .order('child_sequence', { ascending: false })
        .limit(1);
      
      let nextSuffix = 'A';
      if (siblings && siblings.length > 0 && siblings[0].job_suffix) {
        const lastSuffix = siblings[0].job_suffix;
        nextSuffix = String.fromCharCode(lastSuffix.charCodeAt(0) + 1);
      }
      
      return `${parentJobNumber}-${nextSuffix}`;
    }
    
    const sequenceType = type === 'EMERGENCY' ? 'EMERGENCY' : 'STANDARD';
    
    // Get current sequence
    const { data: seq, error } = await supabase
      .from('job_sequences')
      .select('*')
      .eq('sequence_type', sequenceType)
      .single();
    
    if (error || !seq) {
      // Fallback: generate based on count
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_emergency', type === 'EMERGENCY')
        .is('parent_job_id', null);
      
      const num = (count || 0) + 1;
      return type === 'EMERGENCY' 
        ? `EMG-${String(num).padStart(3, '0')}`
        : `JOB-2026-${String(num).padStart(3, '0')}`;
    }
    
    // Update sequence
    const newNumber = seq.current_number + 1;
    await supabase
      .from('job_sequences')
      .update({ current_number: newNumber, updated_at: new Date().toISOString() })
      .eq('sequence_type', sequenceType);
    
    return type === 'EMERGENCY'
      ? `${seq.prefix}-${String(newNumber).padStart(3, '0')}`
      : `${seq.prefix}-2026-${String(newNumber).padStart(3, '0')}`;
  }
  
  // Get all jobs (with optional filters)
  async getJobs(filters?: { status?: string; isEmergency?: boolean; parentOnly?: boolean }): Promise<Job[]> {
    let query = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.isEmergency !== undefined) {
      query = query.eq('is_emergency', filters.isEmergency);
    }
    if (filters?.parentOnly) {
      query = query.is('parent_job_id', null);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to fetch jobs:', error);
      return [];
    }
    
    return data || [];
  }
  
  // Get job by ID with line items and child jobs
  async getJobById(id: string): Promise<Job | null> {
    // Get job
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !job) {
      console.error('Failed to fetch job:', error);
      return null;
    }
    
    // Get line items
    const { data: lineItems } = await supabase
      .from('job_line_items')
      .select('*')
      .eq('job_id', id)
      .order('sort_order', { ascending: true });
    
    // Get child jobs
    const { data: childJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('parent_job_id', id)
      .order('child_sequence', { ascending: true });
    
    // Get parent job if this is a child
    let parentJob = null;
    if (job.parent_job_id) {
      const { data: parent } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.parent_job_id)
        .single();
      parentJob = parent;
    }
    
    return {
      ...job,
      line_items: lineItems || [],
      child_jobs: childJobs || [],
      parent_job: parentJob
    };
  }
  
  // Create job
  async createJob(jobData: Partial<Job>, lineItems?: JobLineItem[]): Promise<Job | null> {
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create job:', error);
      return null;
    }
    
    // Insert line items if provided
    if (lineItems && lineItems.length > 0) {
      const items = lineItems.map((item, index) => ({
        ...item,
        job_id: job.id,
        sort_order: index,
        created_at: new Date().toISOString()
      }));
      
      await supabase.from('job_line_items').insert(items);
    }
    
    return job;
  }
  
  // Update job
  async updateJob(id: string, jobData: Partial<Job>): Promise<Job | null> {
    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        ...jobData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to update job:', error);
      return null;
    }
    
    return job;
  }
  
  // Update job line items (replace all)
  async updateJobLineItems(jobId: string, lineItems: JobLineItem[]): Promise<boolean> {
    // Delete existing
    await supabase.from('job_line_items').delete().eq('job_id', jobId);
    
    // Insert new
    if (lineItems.length > 0) {
      const items = lineItems.map((item, index) => ({
        ...item,
        job_id: jobId,
        sort_order: index,
        created_at: new Date().toISOString()
      }));
      
      const { error } = await supabase.from('job_line_items').insert(items);
      if (error) {
        console.error('Failed to update line items:', error);
        return false;
      }
    }
    
    return true;
  }
  
  // Create child job
  async createChildJob(parentJobId: string, childData: {
    job_phase: string;
    description: string;
    due_date?: string;
    assigned_supervisor?: string;
    estimated_hours?: number;
    lineItems?: JobLineItem[];
  }): Promise<Job | null> {
    // Get parent job
    const parent = await this.getJobById(parentJobId);
    if (!parent) {
      console.error('Parent job not found');
      return null;
    }
    
    // Get next child sequence
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('parent_job_id', parentJobId);
    
    const childSequence = (count || 0) + 1;
    const suffix = String.fromCharCode(64 + childSequence); // A, B, C, etc.
    const childJobNumber = `${parent.job_number}-${suffix}`;
    
    const jobData: Partial<Job> = {
      job_number: childJobNumber,
      job_type: parent.job_type,
      is_emergency: parent.is_emergency,
      parent_job_id: parentJobId,
      job_suffix: suffix,
      is_child_job: true,
      child_sequence: childSequence,
      job_phase: childData.job_phase,
      client_id: parent.client_id,
      client_name: parent.client_name,
      contact_person: parent.contact_person,
      contact_phone: parent.contact_phone,
      rfq_id: parent.rfq_id,
      rfq_number: parent.rfq_number,
      description: childData.description,
      due_date: childData.due_date,
      assigned_supervisor: childData.assigned_supervisor,
      estimated_hours: childData.estimated_hours,
      status: 'PENDING',
      priority: parent.priority
    };
    
    return this.createJob(jobData, childData.lineItems);
  }
  
  // Create job from RFQ (when Order received)
  async createJobFromRFQ(rfqId: string): Promise<Job | null> {
    // Get RFQ data
    const { data: rfq, error: rfqError } = await supabase
      .from('rfqs')
      .select('*')
      .eq('id', rfqId)
      .single();
    
    if (rfqError || !rfq) {
      console.error('Failed to fetch RFQ:', rfqError);
      return null;
    }
    
    // Check if job already exists for this RFQ
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('rfq_id', rfqId)
      .single();
    
    if (existingJob) {
      console.log('Job already exists for this RFQ');
      return null;
    }
    
    // Generate job number
    const jobNumber = await this.generateJobNumber('STANDARD');
    
    // Get client info
    let clientName = rfq.client_name;
    if (rfq.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', rfq.client_id)
        .single();
      if (client) clientName = client.name;
    }
    
    // Create job
    const jobData: Partial<Job> = {
      job_number: jobNumber,
      job_type: 'STANDARD',
      is_emergency: false,
      client_id: rfq.client_id,
      client_name: clientName,
      contact_person: rfq.contact_person,
      contact_phone: rfq.contact_phone,
      contact_email: rfq.contact_email,
      description: rfq.description,
      special_requirements: rfq.special_requirements,
      rfq_id: rfq.id,
      rfq_number: rfq.rfq_number,
      po_number: rfq.client_po_number,
      order_number: rfq.order_no,
      order_date: rfq.order_date,
      quoted_value: rfq.quote_value,
      status: 'PENDING',
      priority: rfq.priority || 'NORMAL',
      due_date: rfq.delivery_due_date || rfq.required_by,
    };
    
    // Get RFQ line items
    const { data: rfqItems } = await supabase
      .from('rfq_line_items')
      .select('*')
      .eq('rfq_id', rfqId)
      .order('sort_order', { ascending: true });
    
    const lineItems: JobLineItem[] = (rfqItems || []).map((item, index) => ({
      item_type: item.item_type,
      description: item.description,
      specification: item.specification,
      worker_type: item.worker_type,
      quantity: item.quantity,
      uom: item.uom,
      cost_price: item.cost_price,
      sell_price: item.sell_price,
      line_total: item.line_total,
      sort_order: index
    }));
    
    const job = await this.createJob(jobData, lineItems);
    
    if (job) {
      // Update RFQ with job reference
      await supabase
        .from('rfqs')
        .update({ job_id: job.id, job_card_no: jobNumber })
        .eq('id', rfqId);
    }
    
    return job;
  }
  
  // Create Emergency Job
  async createEmergencyJob(data: {
    clientId?: string;
    clientName?: string;
    contactPerson: string;
    contactPhone: string;
    siteLocation?: string;
    description?: string;
    productionStopped: boolean;
    safetyRisk: boolean;
    estimatedHours?: number;
    specialEquipment?: string;
    assignedSupervisor?: string;
    lineItems: JobLineItem[];
  }): Promise<Job | null> {
    
    // Generate EMG number
    const jobNumber = await this.generateJobNumber('EMERGENCY');
    
    // Determine severity
    let severity = 'NORMAL';
    let priority = 'URGENT';
    if (data.safetyRisk) {
      severity = 'CRITICAL';
      priority = 'CRITICAL';
    } else if (data.productionStopped) {
      severity = 'HIGH';
      priority = 'URGENT';
    }
    
    // Calculate total value from line items
    const totalValue = data.lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    
    const jobData: Partial<Job> = {
      job_number: jobNumber,
      job_type: 'EMERGENCY',
      is_emergency: true,
      client_id: data.clientId || undefined,
      client_name: data.clientName || 'Walk-in Client',
      contact_person: data.contactPerson,
      contact_phone: data.contactPhone,
      description: data.description,
      site_location: data.siteLocation,
      status: 'IN_PROGRESS',
      priority: priority,
      severity_level: severity,
      production_stopped: data.productionStopped,
      safety_risk: data.safetyRisk,
      estimated_hours: data.estimatedHours,
      special_equipment: data.specialEquipment,
      assigned_supervisor: data.assignedSupervisor,
      quoted_value: totalValue,
      start_date: new Date().toISOString().split('T')[0],
    };
    
    return this.createJob(jobData, data.lineItems.filter(i => i.description));
  }
  
  // Get job statistics
  async getJobStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    emergency: number;
    totalValue: number;
  }> {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('status, is_emergency, quoted_value')
      .is('parent_job_id', null); // Only count parent jobs
    
    if (!jobs) return { total: 0, pending: 0, inProgress: 0, completed: 0, emergency: 0, totalValue: 0 };
    
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'PENDING').length,
      inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
      completed: jobs.filter(j => j.status === 'COMPLETED' || j.status === 'INVOICED').length,
      emergency: jobs.filter(j => j.is_emergency).length,
      totalValue: jobs.reduce((sum, j) => sum + (j.quoted_value || 0), 0)
    };
  }
  
  // Get job phases for dropdown
  getJobPhases(): string[] {
    return JOB_PHASES;
  }
}

export const jobService = new JobService();
export default jobService;