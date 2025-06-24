import React, { useState, useRef, useEffect } from 'react';
import { usePayments } from '../../hooks/useDatabase';
import { formatCurrency } from '../../utils/calculations';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check,
  IndianRupee,
  User,
  Smartphone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const PaymentInterface: React.FC = () => {
  const { addPayment } = usePayments();
  const [formData, setFormData] = useState({
    upiId: 'ghumangroceries@pnb',
    name: 'GURINDER SINGH',
    amount: '',
    description: ''
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateUPIURL = ({ upi, name, amount }: { upi: string; name: string; amount: string }) => {
    const params = new URLSearchParams({
      pa: upi,
      pn: name,
      am: amount,
      cu: 'INR'
    });
    return `upi://pay?${params.toString()}`;
  };

  const generateQR = async () => {
    setError('');
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (!formData.upiId.trim()) {
      setError('UPI ID is required.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Recipient name is required.');
      return;
    }

    setLoading(true);
    try {
      const upiUrl = generateUPIURL({
        upi: formData.upiId.trim(),
        name: formData.name.trim(),
        amount: formData.amount
      });

      // Generate QR code using QRCode library
      const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrDataUrl(qrCodeDataUrl);

      // Also draw on canvas for download functionality
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, upiUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
      }

      // Record the payment request
      await addPayment({
        amount: parseFloat(formData.amount),
        description: formData.description || `UPI Payment Request - ${formData.name}`,
        upiId: formData.upiId.trim(),
        recipientName: formData.name.trim(),
        status: 'pending',
        date: new Date()
      });

    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `payment-qr-${formData.amount}-${Date.now()}.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareQR = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `payment-qr-${formData.amount}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'Payment QR Code',
          text: `Pay ₹${formData.amount} to ${formData.name}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        downloadQR();
      }
    } else {
      downloadQR();
    }
  };

  const copyUPIId = async () => {
    try {
      await navigator.clipboard.writeText(formData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formData.upiId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setFormData({
      ...formData,
      amount: '',
      description: ''
    });
    setQrDataUrl('');
    setError('');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <QrCode className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Payment QR</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* UPI ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                UPI ID *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="your-upi@bank"
                  required
                />
                <button
                  onClick={copyUPIId}
                  className="p-3 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Amount (₹) *
              </label>
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  Amount: {formatCurrency(parseFloat(formData.amount) || 0)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="Payment description..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={generateQR}
                disabled={loading || !formData.amount || !formData.upiId.trim() || !formData.name.trim()}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" />
                    <span>Generate QR</span>
                  </>
                )}
              </button>
              
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Display Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment QR Code</h3>
            {qrDataUrl && (
              <div className="flex space-x-2">
                <button
                  onClick={downloadQR}
                  className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                  title="Download QR"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={shareQR}
                  className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                  title="Share QR"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            {qrDataUrl ? (
              <div className="space-y-6 w-full">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-slate-600 mx-auto w-fit">
                  <img 
                    src={qrDataUrl} 
                    alt="Payment QR Code" 
                    className="w-72 h-72 object-contain"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                </div>
                
                {/* Payment Details */}
                <div className="w-full bg-gray-50 dark:bg-slate-700 rounded-lg p-4 space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(parseFloat(formData.amount))}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Payment Amount</p>
                  </div>
                  
                  <div className="border-t dark:border-slate-600 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-slate-400">To:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-slate-400">UPI ID:</span>
                      <span className="font-mono text-xs text-gray-900 dark:text-white">{formData.upiId}</span>
                    </div>
                    {formData.description && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Note:</span>
                        <span className="text-right max-w-32 truncate text-gray-900 dark:text-white">{formData.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Instructions */}
                <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">How to Pay</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code to make the payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No QR Code Generated</h3>
                <p className="text-gray-600 dark:text-slate-400">Enter an amount and click "Generate QR" to create a payment QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInterface;