import { supabase } from '../lib/supabase';
import { notifyOrderWon } from './notificationService';

export interface SignatureRequest {
  rfqId: string;
  quoteNumber: string;
  clientEmail: string;
  clientName: string;
  quoteTotal: number;
  quoteDescription: string;
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

export const validateSignatureToken = async (token: string): Promise<{
  valid: boolean;
  rfqId?: string;
  clientName?: string;
  clientEmail?: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('signature_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_valid', true)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'This link has expired' };
    }

    if (data.used_at) {
      return { valid: false, error: 'This quote has already been signed' };
    }

    return {
      valid: true,
      rfqId: data.rfq_id,
      clientName: data.client_name,
      clientEmail: data.client_email
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: 'Failed to validate token' };
  }
};

export const recordSignature = async (
  token: string,
  rfqId: string,
  quoteNumber: string,
  signatureData: SignatureData,
  quoteTotal: number,
  quoteDescription: string
): Promise<{ success: boolean; signatureId?: string; error?: string }> => {
  try {
    const { data: signature, error: sigError } = await supabase
      .from('quote_signatures')
      .insert({
        rfq_id: rfqId,
        quote_number: quoteNumber,
        signer_name: signatureData.signerName,
        signer_email: signatureData.signerEmail,
        signer_title: signatureData.signerTitle,
        signer_company: signatureData.signerCompany,
        signature_data: signatureData.signatureData,
        signature_type: signatureData.signatureType,
        ip_address: signatureData.ipAddress,
        user_agent: signatureData.userAgent,
        quote_total: quoteTotal,
        quote_description: quoteDescription
      })
      .select()
      .single();

    if (sigError) throw sigError;

    await supabase
      .from('signature_tokens')
      .update({ used_at: new Date().toISOString(), is_valid: false })
      .eq('token', token);

    await supabase
      .from('rfqs')
      .update({ status: 'ACCEPTED' })
      .eq('id', rfqId);

    const teamEmails = ['lenklopper03@gmail.com'];
    await notifyOrderWon(teamEmails, {
      client_name: signatureData.signerCompany || signatureData.signerName,
      total_value: quoteTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }),
      description: quoteDescription
    });

    return { success: true, signatureId: signature.id };
  } catch (error) {
    console.error('Error recording signature:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
