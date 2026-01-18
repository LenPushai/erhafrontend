import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, PenTool, Loader2, Shield, Building2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validateSignatureToken, recordSignature } from '../services/signatureService';
import { sendNotification } from '../services/notificationService';

interface QuoteData {
  rfqId: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  description: string;
  totalValue: number;
  quotePdfUrl?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

const SignQuotePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [signatureStage, setSignatureStage] = useState<'manager' | 'client'>('client');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [signerCompany, setSignerCompany] = useState('');
  const [signatureType, setSignatureType] = useState<'click' | 'drawn'>('click');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [nextStageUrl, setNextStageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (token) {
      loadQuoteData();
    } else {
      setError('No signature token provided');
      setLoading(false);
    }
  }, [token]);

  const loadQuoteData = async () => {
    try {
      const validation = await validateSignatureToken(token!);
      if (!validation.valid) {
        setError(validation.error || 'Invalid or expired link');
        setLoading(false);
        return;
      }

      setSignatureStage(validation.signatureStage || 'client');

      const { data: rfq, error: rfqError } = await supabase
        .from('rfqs')
        .select('*, rfq_line_items(*)')
        .eq('id', validation.rfqId)
        .single();

      if (rfqError || !rfq) {
        setError('Unable to load quote details');
        setLoading(false);
        return;
      }

      const { data: client } = await supabase
        .from('clients')
        .select('company_name, contact_person, contact_email')
        .eq('id', rfq.client_id)
        .single();

      setQuoteData({
        rfqId: rfq.id,
        quoteNumber: rfq.quote_number || rfq.rfq_no,
        clientName: client?.company_name || validation.clientName || 'Client',
        clientEmail: client?.contact_email || validation.clientEmail || '',
        description: rfq.description || '',
        totalValue: rfq.quote_value_excl_vat || rfq.estimated_value || 0,
        quotePdfUrl: rfq.quote_pdf_url,
        lineItems: (rfq.rfq_line_items || []).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          lineTotal: item.line_total
        }))
      });

      // Pre-fill based on stage
      if (validation.signatureStage === 'manager') {
        setSignerCompany('ERHA Fabrication & Construction');
      } else {
        setSignerEmail(client?.contact_email || validation.clientEmail || '');
        setSignerCompany(client?.company_name || '');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading quote:', err);
      setError('Failed to load quote data');
      setLoading(false);
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearSignature = () => initCanvas();

  const handleSubmit = async () => {
    if (!quoteData || !signerName || !signerEmail || !acceptedTerms) return;
    setSubmitting(true);
    try {
      let signatureData = undefined;
      if (signatureType === 'drawn' && canvasRef.current) {
        signatureData = canvasRef.current.toDataURL('image/png');
      }

      const result = await recordSignature(
        token!,
        quoteData.rfqId,
        quoteData.quoteNumber,
        {
          signerName,
          signerEmail,
          signerTitle,
          signerCompany,
          signatureData,
          signatureType,
          ipAddress: 'captured-server-side',
          userAgent: navigator.userAgent
        },
        quoteData.totalValue,
        quoteData.description,
        signatureStage
      );

      if (result.success) {
        setSigned(true);
        if (result.nextStage === 'client') {
          setNextStageUrl('pending-client');
        }
      } else {
        setError(result.error || 'Failed to record signature');
      }
    } catch (err) {
      console.error('Signature error:', err);
      setError('An error occurred while signing');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quote details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Quote</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (signed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {signatureStage === 'manager' ? 'Quote Approved!' : 'Quote Signed!'}
          </h2>
          <p className="text-gray-600 mb-4">
            {signatureStage === 'manager' 
              ? 'The quote has been approved internally. It will now be sent to the client for their signature.'
              : 'Thank you for signing! Your order has been confirmed and our team will begin processing it shortly.'}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-500">Quote Number</p>
            <p className="text-xl font-bold text-blue-600">{quoteData?.quoteNumber}</p>
            <p className="text-sm text-gray-500 mt-2">Signed by</p>
            <p className="font-medium">{signerName}</p>
            <p className="text-sm text-gray-500 mt-2">Total Value</p>
            <p className="text-xl font-bold text-green-600">
              R {quoteData?.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
          </div>
          {signatureStage === 'manager' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">Next Step:</p>
              <p className="text-blue-600 text-sm">Send to client for their signature from the RFQ page.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Signature form
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Stage Indicator */}
        <div className={`${signatureStage === 'manager' ? 'bg-amber-600' : 'bg-blue-600'} text-white rounded-t-xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            {signatureStage === 'manager' ? (
              <>
                <Shield className="w-8 h-8" />
                <span className="bg-amber-500 px-3 py-1 rounded-full text-sm font-medium">INTERNAL APPROVAL</span>
              </>
            ) : (
              <>
                <Building2 className="w-8 h-8" />
                <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-medium">CLIENT SIGNATURE</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {signatureStage === 'manager' ? 'Manager Approval Required' : 'Quote Signature Request'}
          </h1>
          <p className="opacity-90">
            {signatureStage === 'manager' 
              ? 'Please review and approve this quote before sending to the client.'
              : 'Please review and sign to confirm your order.'}
          </p>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg">
          {/* Quote Summary */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Quote Details</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Quote Number</p>
                <p className="font-bold text-lg">{quoteData?.quoteNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{quoteData?.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium truncate">{quoteData?.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value (Excl VAT)</p>
                <p className="font-bold text-xl text-green-600">
                  R {quoteData?.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* PDF Viewer Link */}
          {quoteData?.quotePdfUrl && (
            <div className="p-6 border-b bg-gray-50">
              <a 
                href={quoteData.quotePdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FileText className="w-5 h-5" />
                View Full Quote PDF
              </a>
            </div>
          )}

          {/* Line Items */}
          {quoteData?.lineItems && quoteData.lineItems.length > 0 && (
            <div className="p-6 border-b">
              <h3 className="font-medium text-gray-700 mb-3">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Unit Price</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.lineItems.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{item.description}</td>
                        <td className="text-right p-2">{item.quantity}</td>
                        <td className="text-right p-2">R {item.unitPrice?.toLocaleString()}</td>
                        <td className="text-right p-2 font-medium">R {item.lineTotal?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signer Information */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <User className="w-5 h-5" />
              <span className="font-medium">
                {signatureStage === 'manager' ? 'Approver Information' : 'Signer Information'}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={signatureStage === 'manager' ? 'Manager name' : 'Your full name'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title/Position</label>
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={signatureStage === 'manager' ? 'Operations Manager' : 'Your job title'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={signerCompany}
                  onChange={(e) => setSignerCompany(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Company name"
                  readOnly={signatureStage === 'manager'}
                />
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <PenTool className="w-5 h-5" />
              <span className="font-medium">Signature</span>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSignatureType('click')}
                className={`flex-1 py-3 rounded-lg border-2 transition ${
                  signatureType === 'click'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Click to Sign
              </button>
              <button
                onClick={() => { setSignatureType('drawn'); setTimeout(initCanvas, 100); }}
                className={`flex-1 py-3 rounded-lg border-2 transition ${
                  signatureType === 'drawn'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Draw Signature
              </button>
            </div>

            {signatureType === 'click' ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-2">By clicking "Sign & Submit" below, you agree that your typed name constitutes your electronic signature.</p>
                <div className="text-3xl font-signature text-blue-800 italic mt-4">
                  {signerName || 'Your signature will appear here'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <button onClick={clearSignature} className="text-sm text-blue-600 hover:underline">
                  Clear Signature
                </button>
              </div>
            )}
          </div>

          {/* Terms & Submit */}
          <div className="p-6">
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {signatureStage === 'manager' 
                  ? 'I confirm that I have reviewed this quote and approve it for sending to the client. I understand that this constitutes internal approval of the quoted pricing and terms.'
                  : 'I confirm that I have read and agree to the terms of this quote. By signing, I am authorizing the work to proceed and agree to the quoted pricing and terms.'}
              </span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!signerName || !signerEmail || !acceptedTerms || submitting}
              className={`w-full py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 ${
                signatureStage === 'manager'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white disabled:bg-gray-300'
                  : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : signatureStage === 'manager' ? (
                <>
                  <Shield className="w-5 h-5" />
                  Approve Quote
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Sign & Confirm Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>ERHA Fabrication & Construction</p>
          <p>Powered by PUSH AI Foundation</p>
        </div>
      </div>
    </div>
  );
};

export default SignQuotePage;
