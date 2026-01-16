import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, FileText, PenTool, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validateSignatureToken, recordSignature } from '../services/signatureService';

interface SignQuotePageProps {
  token?: string;
}

interface QuoteData {
  rfqId: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  description: string;
  totalValue: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

const SignQuotePage: React.FC<SignQuotePageProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [signerCompany, setSignerCompany] = useState('');
  const [signatureType, setSignatureType] = useState<'click' | 'drawn'>('click');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
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
        lineItems: (rfq.rfq_line_items || []).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          lineTotal: item.line_total
        }))
      });

      setSignerEmail(client?.contact_email || validation.clientEmail || '');
      setSignerCompany(client?.company_name || '');
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    initCanvas();
  };

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
        quoteData.description
      );
      if (result.success) {
        setSigned(true);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Quote</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Please contact ERHA Fabrication if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Accepted!</h1>
          <p className="text-gray-600 mb-6">Thank you for accepting quote <strong>{quoteData?.quoteNumber}</strong>.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Quote Value</p>
            <p className="text-2xl font-bold text-green-600">R {quoteData?.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
          </div>
          <p className="text-sm text-gray-500">A confirmation email has been sent. Our team will be in touch shortly.</p>
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-gray-400">ERHA Fabrication - Powered by PUSH AI Foundation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold">ERHA Fabrication and Construction</h1>
          <p className="text-blue-200 mt-1">Quote Acceptance Portal</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="font-semibold text-gray-900">Quote #{quoteData?.quoteNumber}</h2>
                <p className="text-sm text-gray-500">{quoteData?.clientName}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">{quoteData?.description}</p>
            {quoteData?.lineItems && quoteData.lineItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Qty</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Unit Price</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.lineItems.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">R {item.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-medium">R {item.lineTotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
              <span className="font-medium text-gray-700">Quote Total (excl. VAT)</span>
              <span className="text-2xl font-bold text-green-600">R {quoteData?.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={signerName} onChange={(e) => setSignerName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input type="text" value={signerTitle} onChange={(e) => setSignerTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Procurement Manager" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={signerCompany} onChange={(e) => setSignerCompany(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Company name" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Signature</h3>
          <div className="flex gap-4 mb-4">
            <button onClick={() => setSignatureType('click')} className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${signatureType === 'click' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <CheckCircle className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Click to Accept</span>
            </button>
            <button onClick={() => { setSignatureType('drawn'); setTimeout(initCanvas, 100); }} className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${signatureType === 'drawn' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <PenTool className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Draw Signature</span>
            </button>
          </div>
          {signatureType === 'drawn' && (
            <div className="mb-4">
              <canvas ref={canvasRef} width={500} height={150} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none" style={{ maxWidth: '500px' }} />
              <button onClick={clearSignature} className="mt-2 text-sm text-blue-600 hover:text-blue-800">Clear and redraw</button>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">I confirm that I am authorized to accept this quote on behalf of <strong>{signerCompany || 'my company'}</strong>, and I agree to the terms and conditions outlined in this quotation.</span>
            </label>
          </div>
          <button onClick={handleSubmit} disabled={!signerName || !signerEmail || !acceptedTerms || submitting} className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${(!signerName || !signerEmail || !acceptedTerms || submitting) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'}`}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Processing...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" />Accept Quote - R {quoteData?.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            )}
          </button>
        </div>
        <div className="text-center text-sm text-gray-500 pb-8">
          <p>ERHA Fabrication and Construction (Pty) Ltd</p>
          <p className="mt-1">Powered by PUSH AI Foundation | Proverbs 16:3</p>
        </div>
      </div>
    </div>
  );
};

export default SignQuotePage;
