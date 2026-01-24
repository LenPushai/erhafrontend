import { supabase } from '../lib/supabase';
import { sendNotification } from './notificationService';

export interface SignatureRequest {
  rfqId: string;
  quoteNumber: string;
  clientEmail: string;
  clientName: string;
  quoteTotal: number;
  quoteDescription: string;
  signatureStage: 'manager' | 'client';
}

export interface SignatureData {
  signerName: string;
  signerEmail: string;
  signerTitle?: string;
  signerCompany?: string;
  signatureData?: string;
  signatureType: 'click' | 'drawn';
  ipAddress: string;
  userAgent: string;
}

// Generate token for either Manager or Client signature
export const generateSignatureToken = async (request: SignatureRequest): Promise<{
  success: boolean;
  token?: string;
  signUrl?: string;
  error?: string
}> => {
  try {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabase
      .from('signature_tokens')
      .insert({
        rfq_id: request.rfqId,
        token,
        client_email: request.clientEmail,
        client_name: request.clientName,
        signature_stage: request.signatureStage,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    const baseUrl = window.location.origin;
    const signUrl = `${baseUrl}/sign/${token}`;

    return { success: true, token, signUrl };
  } catch (error) {
    console.error('Error generating signature token:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Validate signature token - handles both database tokens and base64 tokens from RFQPage
export const validateSignatureToken = async (token: string): Promise<{
  valid: boolean;
  rfqId?: string;
  clientEmail?: string;
  clientName?: string;
  signatureStage?: 'manager' | 'client';
  error?: string;
}> => {
  try {
    // First, try to decode as base64 JSON (from RFQPage.tsx handleSendForSignature)
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.rfqId && decoded.timestamp) {
        console.log('Decoded base64 token:', decoded);
        
        // Check if token is not expired (30 days)
        const tokenAge = Date.now() - decoded.timestamp;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
        
        if (tokenAge > maxAge) {
          return { valid: false, error: 'Token has expired' };
        }
        
        // Verify the RFQ exists
        const { data: rfq, error: rfqError } = await supabase
          .from('rfqs')
          .select('id, signature_token, client_id')
          .eq('id', decoded.rfqId)
          .single();
        
        if (rfqError || !rfq) {
          console.error('RFQ lookup error:', rfqError);
          return { valid: false, error: 'RFQ not found' };
        }
        
        // Get client info
        let clientEmail = '';
        let clientName = '';
        if (rfq.client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('contact_email, company_name')
            .eq('id', rfq.client_id)
            .single();
          if (client) {
            clientEmail = client.contact_email || '';
            clientName = client.company_name || '';
          }
        }
        
        return {
          valid: true,
          rfqId: decoded.rfqId,
          clientEmail,
          clientName,
          signatureStage: 'manager' // Default to manager for base64 tokens
        };
      }
    } catch (decodeError) {
      console.log('Not a base64 token, trying database lookup...');
    }
    
    // Try database lookup (for tokens from generateSignatureToken)
    const { data, error } = await supabase
      .from('signature_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      console.error('Database token lookup failed:', error);
      return { valid: false, error: 'Invalid or expired token' };
    }

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'Token has expired' };
    }

    // Check if already used
    if (data.used_at) {
      return { valid: false, error: 'Token has already been used' };
    }

    return {
      valid: true,
      rfqId: data.rfq_id,
      clientEmail: data.client_email,
      clientName: data.client_name,
      signatureStage: data.signature_stage || 'client'
    };
  } catch (error) {
    console.error('Error validating signature token:', error);
    return { valid: false, error: 'Validation failed' };
  }
};

// Record signature and handle stage transitions
export const recordSignature = async (
  token: string,
  rfqId: string,
  quoteNumber: string,
  signatureData: SignatureData,
  quoteTotal: number,
  quoteDescription: string,
  signatureStage: 'manager' | 'client'
): Promise<{ success: boolean; signatureId?: string; nextStage?: string; error?: string }> => {
  try {
    // Record the signature
    const { data: signature, error: sigError } = await supabase
      .from('quote_signatures')
      .insert({
        rfq_id: rfqId,
        quote_number: quoteNumber,
        // @ts-ignore
        signer_name: signatureData.signerName as any,
        signer_email: signatureData.signerEmail,
        signer_title: signatureData.signerTitle,
        signer_company: signatureData.signerCompany,
        signature_data: signatureData.signatureData,
        signature_type: signatureData.signatureType,
        signature_stage: signatureStage,
        ip_address: signatureData.ipAddress,
        user_agent: signatureData.userAgent,
        quote_total: quoteTotal,
        quote_description: quoteDescription
      })
      .select()
      .single();

    if (sigError) throw sigError;

    // Mark token as used
    await supabase
      .from('signature_tokens')
      .update({ used_at: new Date().toISOString(), is_valid: false })
      .eq('token', token);

    // Handle stage-specific logic
    if (signatureStage === 'manager') {
      // Manager signed - Update status and notify
      await supabase
        .from('rfqs')
        .update({ 
          status: 'APPROVED_INTERNAL',
          manager_signed_at: new Date().toISOString(),
          manager_signed_by: signatureData.signerName
        })
        .eq('id', rfqId);

      // Send notification that manager signed
      sendNotification('lenklopper03@gmail.com', 'docusign_manager_signed', {
        quote_number: quoteNumber,
        manager_name: signatureData.signerName,
        total_value: quoteTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }),
        description: quoteDescription
      }).catch(e => console.error('Manager signed notification failed:', e));

      return { success: true, signatureId: signature.id, nextStage: 'client' };

    } else {
      // Client signed - Final stage, ORDER WON!
      await supabase
        .from('rfqs')
        .update({ 
          status: 'ACCEPTED',
          client_signed_at: new Date().toISOString(),
          client_signed_by: signatureData.signerName
        })
        .eq('id', rfqId);

      // Send ORDER WON notification
      sendNotification('lenklopper03@gmail.com', 'order_won', {
        client_name: signatureData.signerCompany || signatureData.signerName,
        total_value: quoteTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }),
        description: quoteDescription
      }).catch(e => console.error('Order won notification failed:', e));

      // Send completion notification
      sendNotification('lenklopper03@gmail.com', 'docusign_completed', {
        quote_number: quoteNumber,
        client_name: signatureData.signerCompany || signatureData.signerName,
        // @ts-ignore
        signer_name: signatureData.signerName as any,
        total_value: quoteTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })
      }).catch(e => console.error('Completion notification failed:', e));

      return { success: true, signatureId: signature.id, nextStage: 'complete' };
    }
  } catch (error) {
    console.error('Error recording signature:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Send signature request to Manager (ERHA Internal)
export const sendForManagerSignature = async (rfqId: string, quoteNumber: string, managerEmail: string, managerName: string, quoteTotal: number, description: string): Promise<{ success: boolean; signUrl?: string; error?: string }> => {
  const result = await generateSignatureToken({
    rfqId,
    quoteNumber,
    clientEmail: managerEmail,
    clientName: managerName,
    quoteTotal,
    quoteDescription: description,
    signatureStage: 'manager'
  });

  if (result.success && result.signUrl) {
    // Send email to manager
    sendNotification(managerEmail, 'docusign_manager_pending', {
      quote_number: quoteNumber,
      manager_name: managerName,
      total_value: quoteTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }),
      description,
      // @ts-ignore
      sign_url: result.signUrl as any
    }).catch(e => console.error('Manager pending notification failed:', e));
  }

  return result;
};

// Send signature request to Client (External)
export const sendForClientSignature = async (rfqId: string, quoteNumber: string, clientEmail: string, clientName: string, quoteTotal: number, description: string): Promise<{ success: boolean; signUrl?: string; error?: string }> => {
  const result = await generateSignatureToken({
    rfqId,
    quoteNumber,
    clientEmail,
    clientName,
    quoteTotal,
    quoteDescription: description,
    signatureStage: 'client'
  });

  if (result.success && result.signUrl) {
    // Send email to client
    sendNotification(clientEmail, 'docusign_client_pending', {
      quote_number: quoteNumber,
      client_name: clientName,
      total_value: quoteTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }),
      description,
      // @ts-ignore
      sign_url: result.signUrl as any
    }).catch(e => console.error('Client pending notification failed:', e));

    // Also notify admin
    sendNotification('lenklopper03@gmail.com', 'docusign_sent', {
      quote_number: quoteNumber,
      client_name: clientName,
      contact_email: clientEmail,
      total_value: quoteTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })
    }).catch(e => console.error('Admin notification failed:', e));
  }

  return result;
};





