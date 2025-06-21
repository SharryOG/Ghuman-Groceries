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
  RefreshCw
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
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const upiUrl = generateUPIURL({
        upi: formData.upiId,
        name: formData.name,
        amount: formData.amount
      });

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, upiUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Convert canvas to data URL for sharing
        const dataUrl = canvasRef.current.toDataURL();
        setQrDataUrl(dataUrl);
      }

      // Record the payment request
      await addPayment({
        amount: parseFloat(formData.amount),
        description: formData.description || `UPI Payment Request - ${formData.name}`,
        upiId: formData.upiId,
        recipientName: formData.name,
        status: 'pending',
        date: new Date()
      });

    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `payment-qr-${formData.amount}.png`;
      link.href = qrDataUrl;
      link.click();
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
    }
  };

  const resetForm = () => {
    setFormData({
      ...formData,
      amount: '',
      description: ''
    });
    setQrDataUrl('');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <QrCode className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Generate Payment QR</h2>
          </div>

          <div className="space-y-6">
            {/* UPI ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your-upi@bank"
                />
                <button
                  onClick={copyUPIId}
                  className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Recipient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name
              </label>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Recipient Name"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) *
              </label>
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {formData.amount && (
                <p className="mt-2 text-sm text-gray-600">
                  Amount: {formatCurrency(parseFloat(formData.amount) || 0)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Payment description..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={generateQR}
                disabled={loading || !formData.amount}
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
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Display Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment QR Code</h3>
            {qrDataUrl && (
              <div className="flex space-x-2">
                <button
                  onClick={downloadQR}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Download QR"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={shareQR}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Share QR"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            {qrDataUrl ? (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto"
                  />
                </div>
                
                {/* Payment Details */}
                <div className="w-full bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(parseFloat(formData.amount))}
                    </p>
                    <p className="text-sm text-gray-600">Payment Amount</p>
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">UPI ID:</span>
                      <span className="font-mono text-xs">{formData.upiId}</span>
                    </div>
                    {formData.description && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Note:</span>
                        <span className="text-right max-w-32 truncate">{formData.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Instructions */}
                <div className="w-full bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">How to Pay</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code to make the payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Code Generated</h3>
                <p className="text-gray-600">Enter an amount and click "Generate QR" to create a payment QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInterface;