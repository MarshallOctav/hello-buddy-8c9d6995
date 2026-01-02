import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, CreditCard, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Download, FileText } from 'lucide-react';
import { useLanguage } from '../services/languageContext';
import { useAuth } from '../services/authContext';
import { getPaymentHistory, PaymentHistoryItem } from '../services/api';
import Button from '../components/Button';

export const PaymentHistory = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const content = {
    id: {
      title: 'Riwayat Pembayaran',
      subtitle: 'Lihat semua transaksi dan invoice Anda',
      back: 'Kembali',
      noPayments: 'Belum ada riwayat pembayaran',
      noPaymentsDesc: 'Upgrade ke Pro atau Premium untuk melihat riwayat pembayaran Anda.',
      upgradeCta: 'Lihat Paket',
      orderId: 'ID Pesanan',
      plan: 'Paket',
      amount: 'Jumlah',
      paymentMethod: 'Metode',
      status: 'Status',
      date: 'Tanggal',
      expiresAt: 'Berlaku Sampai',
      loading: 'Memuat...',
      error: 'Gagal memuat riwayat pembayaran',
      retry: 'Coba Lagi',
      downloadInvoice: 'Unduh Invoice',
      currentPlan: 'Paket Saat Ini',
      planExpires: 'Berlaku Sampai',
    },
    en: {
      title: 'Payment History',
      subtitle: 'View all your transactions and invoices',
      back: 'Back',
      noPayments: 'No payment history yet',
      noPaymentsDesc: 'Upgrade to Pro or Premium to see your payment history.',
      upgradeCta: 'View Plans',
      orderId: 'Order ID',
      plan: 'Plan',
      amount: 'Amount',
      paymentMethod: 'Method',
      status: 'Status',
      date: 'Date',
      expiresAt: 'Valid Until',
      loading: 'Loading...',
      error: 'Failed to load payment history',
      retry: 'Retry',
      downloadInvoice: 'Download Invoice',
      currentPlan: 'Current Plan',
      planExpires: 'Valid Until',
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPaymentHistory();
      if (result.success) {
        setPayments(result.data);
      } else {
        setError(t.error);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'settlement':
      case 'capture':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancel':
      case 'deny':
      case 'expire':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'refund':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settlement':
      case 'capture':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancel':
      case 'deny':
      case 'expire':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'refund':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return '-';
    const methods: Record<string, string> = {
      'credit_card': 'Kartu Kredit',
      'bank_transfer': 'Transfer Bank',
      'echannel': 'Mandiri Bill',
      'bca_klikpay': 'BCA KlikPay',
      'bca_klikbca': 'KlikBCA',
      'bri_epay': 'BRI Epay',
      'cimb_clicks': 'CIMB Clicks',
      'danamon_online': 'Danamon Online',
      'gopay': 'GoPay',
      'shopeepay': 'ShopeePay',
      'qris': 'QRIS',
      'cstore': 'Convenience Store',
      'akulaku': 'Akulaku',
    };
    return methods[method] || method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">{t.back}</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Receipt className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{t.title}</h1>
              <p className="text-white/80">{t.subtitle}</p>
            </div>
          </div>

          {/* Current Plan Badge */}
          {user && (
            <div className="mt-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">{t.currentPlan}:</span>
                <span className="font-bold text-white">{user.plan}</span>
              </div>
              {user.planExpiresAt && (
                <>
                  <div className="h-4 w-px bg-white/30"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm">{t.planExpires}:</span>
                    <span className="font-bold text-white">{formatDate(user.planExpiresAt)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchPayments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.retry}
            </Button>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.noPayments}</h3>
            <p className="text-slate-500 mb-6 max-w-md">{t.noPaymentsDesc}</p>
            <Button variant="gradient" onClick={() => navigate('/plans')}>
              {t.upgradeCta}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">{t.orderId}</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">{t.plan}</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">{t.amount}</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">{t.paymentMethod}</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">{t.status}</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">{t.date}</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">{t.expiresAt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">
                          {payment.order_id}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-indigo-500" />
                          <span className="font-semibold text-slate-800">{payment.plan_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {payment.formatted_amount}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatPaymentMethod(payment.payment_type)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(payment.paid_at || payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(payment.expires_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-5 w-5 text-indigo-500" />
                        <span className="font-bold text-slate-800">{payment.plan_name}</span>
                      </div>
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                        {payment.order_id}
                      </code>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status_label}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.amount}</span>
                      <span className="font-bold text-slate-800">{payment.formatted_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.paymentMethod}</span>
                      <span className="text-slate-700">{formatPaymentMethod(payment.payment_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.date}</span>
                      <span className="text-slate-700">{formatDate(payment.paid_at || payment.created_at)}</span>
                    </div>
                    {payment.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.expiresAt}</span>
                        <span className="text-slate-700">{formatDate(payment.expires_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
