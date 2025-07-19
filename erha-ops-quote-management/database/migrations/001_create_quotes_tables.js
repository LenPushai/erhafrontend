/**
 * ERHA OPS Quote Management - Database Migration
 * Enhanced with Quality Cost Integration & Safety Assessment
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('quotes', function (table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('quote_number').unique().notNullable();
      table.uuid('rfq_id').references('id').inTable('rfqs').onDelete('SET NULL');
      table.uuid('client_id').references('id').inTable('clients').notNullable();
      table.uuid('created_by').references('id').inTable('users').notNullable();
      table.uuid('assigned_to').references('id').inTable('users');
      
      // Basic Quote Information
      table.string('title').notNullable();
      table.text('description');
      table.enum('status', [
        'draft', 'pending_review', 'pending_approval', 
        'approved', 'sent', 'accepted', 'rejected', 'expired'
      ]).defaultTo('draft');
      table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
      
      // Financial Information
      table.decimal('subtotal', 15, 2).defaultTo(0);
      table.decimal('tax_amount', 15, 2).defaultTo(0);
      table.decimal('total_amount', 15, 2).notNullable();
      table.string('currency', 3).defaultTo('ZAR');
      
      // Quality & Safety Enhanced Fields
      table.decimal('quality_cost', 15, 2).defaultTo(0);
      table.decimal('safety_cost', 15, 2).defaultTo(0);
      table.decimal('compliance_cost', 15, 2).defaultTo(0);
      table.json('quality_requirements');
      table.json('safety_assessment');
      table.integer('risk_score').defaultTo(0); // 0-100 scale
      table.enum('quality_level', ['standard', 'enhanced', 'premium']).defaultTo('standard');
      
      // Timeline
      table.datetime('valid_until');
      table.integer('delivery_days');
      table.datetime('estimated_start');
      table.datetime('estimated_completion');
      
      // Approval Workflow
      table.uuid('approved_by').references('id').inTable('users');
      table.datetime('approved_at');
      table.text('approval_notes');
      table.uuid('quality_reviewed_by').references('id').inTable('users');
      table.datetime('quality_reviewed_at');
      table.text('quality_notes');
      
      // Client Communication
      table.datetime('sent_at');
      table.datetime('viewed_at');
      table.text('client_feedback');
      table.json('revision_history');
      
      // Terms & Conditions
      table.text('terms_conditions');
      table.text('payment_terms');
      table.text('delivery_terms');
      table.text('warranty_terms');
      
      // Metadata
      table.json('metadata');
      table.timestamps(true, true);
      table.datetime('deleted_at');
      
      // Indexes
      table.index(['status', 'created_at']);
      table.index(['client_id', 'created_at']);
      table.index(['quote_number']);
      table.index(['assigned_to', 'status']);
      table.index(['risk_score']);
    })
    .createTable('quote_items', function (table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('quote_id').references('id').inTable('quotes').onDelete('CASCADE');
      
      // Item Details
      table.string('item_code');
      table.string('description').notNullable();
      table.string('category');
      table.decimal('quantity', 10, 3).notNullable();
      table.string('unit');
      table.decimal('unit_price', 15, 2).notNullable();
      table.decimal('total_price', 15, 2).notNullable();
      
      // Quality & Safety Item Fields
      table.decimal('quality_cost_per_unit', 15, 2).defaultTo(0);
      table.decimal('safety_cost_per_unit', 15, 2).defaultTo(0);
      table.json('quality_specs');
      table.json('safety_requirements');
      table.enum('risk_category', ['low', 'medium', 'high', 'critical']).defaultTo('low');
      
      // Material & Labor Breakdown
      table.decimal('material_cost', 15, 2).defaultTo(0);
      table.decimal('labor_cost', 15, 2).defaultTo(0);
      table.decimal('overhead_cost', 15, 2).defaultTo(0);
      table.decimal('margin_percentage', 5, 2).defaultTo(0);
      
      // Timeline
      table.integer('lead_time_days');
      table.text('notes');
      
      table.integer('sort_order').defaultTo(0);
      table.timestamps(true, true);
      
      table.index(['quote_id', 'sort_order']);
    })
    .createTable('quote_approvals', function (table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('quote_id').references('id').inTable('quotes').onDelete('CASCADE');
      table.uuid('approver_id').references('id').inTable('users').notNullable();
      
      table.enum('approval_type', ['technical', 'quality', 'safety', 'financial', 'management']).notNullable();
      table.enum('status', ['pending', 'approved', 'rejected', 'requires_changes']).defaultTo('pending');
      table.text('comments');
      table.json('checklist_items');
      table.datetime('responded_at');
      
      table.timestamps(true, true);
      
      table.unique(['quote_id', 'approver_id', 'approval_type']);
      table.index(['quote_id', 'status']);
    })
    .createTable('quote_revisions', function (table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('quote_id').references('id').inTable('quotes').onDelete('CASCADE');
      table.uuid('revised_by').references('id').inTable('users').notNullable();
      
      table.integer('revision_number').notNullable();
      table.text('revision_reason');
      table.json('changes_made');
      table.json('previous_data');
      table.json('new_data');
      
      table.timestamps(true, true);
      
      table.index(['quote_id', 'revision_number']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('quote_revisions')
    .dropTableIfExists('quote_approvals')
    .dropTableIfExists('quote_items')
    .dropTableIfExists('quotes');
};
