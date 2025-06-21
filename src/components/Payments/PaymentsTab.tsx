import React, { useState } from 'react';
import { usePayments } from '../../hooks/useDatabase';
import PaymentInterface from './PaymentInterface';
import PaymentHistory from './PaymentHistory';
import { CreditCard, History, QrCode, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

const PaymentsTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'new-payment' | 'history'>('new-payment');
  const { payments } = usePayments();

  const todayPayments = payments.filter(payment => 
    new Date(payment.date).toDateString() === new Date().toDateString()
  );

  const totalToday = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalAll = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const views = [
    { id: 'new-payment' as const, label: 'Generate QR', icon: QrCode, count: null },
    { id: 'history' as const, label: 'Payment History', icon: History, count: payments.length }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'new-payment':
        return <PaymentInterface />;
      case 'history':
        return <PaymentHistory />;
      default:
        return <PaymentInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>{todayPayments.length} Payments Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-4 w-4" />
              <span>Today: {formatCurrency(totalToday)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Total: {formatCurrency(totalAll)}</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Payments</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalToday)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAll)}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Count</p>
                <p className="text-2xl font-bold text-purple-600">{payments.length}</p>
              </div>
              <QrCode className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 bg-white rounded-lg shadow-sm p-2">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{view.label}</span>
                  {view.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeView === view.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {view.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentsTab;