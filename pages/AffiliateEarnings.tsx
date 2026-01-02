import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { PageHeader } from '../components/PageHeader';
import Button from '../components/Button';
import { 
  DollarSign, Users, Clock, CheckCircle, Share2,
  TrendingUp, ArrowUpRight, Calendar, Filter, Download,
  Wallet, Gift, Star, Copy, Check, MessageCircle, Edit3,
  AlertCircle, Loader2, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  getMyAffiliate,
  getAffiliateStats,
  getAffiliateTransactions,
  getWithdrawals,
  registerAffiliate,
  updateReferralCode,
  requestWithdrawal,
  type AffiliateData,
  type AffiliateSettings,
  type ReferralTransaction,
  type WithdrawalItem
} from '../services/api';

export const AffiliateEarnings = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'transactions' | 'withdrawals'>('overview');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  
  // UI State
  const [copied, setCopied] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showEditCode, setShowEditCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Withdrawal form
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    payment_method: 'bank_transfer' as const,
    bank_name: '',
    account_name: '',
    account_number: '',
  });
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const t = {
    title: language === 'id' ? 'Pendapatan Afiliasi' : 'Affiliate Earnings',
    subtitle: language === 'id' ? 'Lacak komisi dan referral Anda' : 'Track your commissions and referrals',
    notAffiliate: language === 'id' ? 'Anda belum terdaftar sebagai affiliate' : 'You are not registered as an affiliate',
    registerBtn: language === 'id' ? 'Daftar Affiliate' : 'Register as Affiliate',
    pendingActivation: language === 'id' ? 'Menunggu Aktivasi' : 'Pending Activation',
    contactCs: language === 'id' ? 'Hubungi CS untuk aktivasi' : 'Contact CS for activation',
    stats: {
      totalEarnings: language === 'id' ? 'Total Pendapatan' : 'Total Earnings',
      balance: language === 'id' ? 'Saldo' : 'Balance',
      pendingWithdrawals: language === 'id' ? 'Pending Withdraw' : 'Pending Withdrawals',
      totalWithdrawals: language === 'id' ? 'Total Penarikan' : 'Total Withdrawals',
      activeReferrals: language === 'id' ? 'Total Referral' : 'Total Referrals',
    },
    tabs: {
      overview: language === 'id' ? 'Ringkasan' : 'Overview',
      referrals: language === 'id' ? 'Referral' : 'Referrals',
      transactions: language === 'id' ? 'Transaksi' : 'Transactions',
      withdrawals: language === 'id' ? 'Penarikan' : 'Withdrawals',
    },
    referralCode: language === 'id' ? 'Kode Referral Anda' : 'Your Referral Code',
    copyCode: language === 'id' ? 'Salin' : 'Copy',
    copied: language === 'id' ? 'Tersalin!' : 'Copied!',
    editCode: language === 'id' ? 'Ubah Kode' : 'Change Code',
    earningsChart: language === 'id' ? 'Grafik Pendapatan' : 'Earnings Chart',
    withdrawBtn: language === 'id' ? 'Tarik Dana' : 'Withdraw',
    howItWorks: language === 'id' ? 'Cara Kerja' : 'How It Works',
    step1: language === 'id' ? 'Bagikan kode referral Anda' : 'Share your referral code',
    step2: language === 'id' ? 'Teman bayar pakai kode Anda' : 'Friend pays using your code',
    step3: language === 'id' ? 'Dapatkan komisi' : 'Earn commission',
    table: {
      name: language === 'id' ? 'Nama' : 'Name',
      date: language === 'id' ? 'Tanggal' : 'Date',
      status: language === 'id' ? 'Status' : 'Status',
      plan: language === 'id' ? 'Plan' : 'Plan',
      commission: language === 'id' ? 'Komisi' : 'Commission',
      type: language === 'id' ? 'Tipe' : 'Type',
      amount: language === 'id' ? 'Jumlah' : 'Amount',
      referral: language === 'id' ? 'Referral' : 'Referral',
      method: language === 'id' ? 'Metode' : 'Method',
      account: language === 'id' ? 'Rekening' : 'Account',
    },
    withdraw: {
      title: language === 'id' ? 'Tarik Dana' : 'Withdraw Funds',
      amount: language === 'id' ? 'Jumlah' : 'Amount',
      method: language === 'id' ? 'Metode Pembayaran' : 'Payment Method',
      bankName: language === 'id' ? 'Nama Bank' : 'Bank Name',
      accountName: language === 'id' ? 'Nama Akun' : 'Account Name',
      accountNumber: language === 'id' ? 'Nomor Rekening' : 'Account Number',
      submit: language === 'id' ? 'Ajukan Penarikan' : 'Submit Withdrawal',
      minAmount: language === 'id' ? 'Minimal penarikan' : 'Minimum withdrawal',
    },
    noData: language === 'id' ? 'Belum ada data' : 'No data yet',
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const affiliateRes = await getMyAffiliate();
        if (affiliateRes.success) {
          setIsAffiliate(affiliateRes.data.is_affiliate);
          setAffiliate(affiliateRes.data.affiliate || null);
          setSettings(affiliateRes.data.settings);
          
          if (affiliateRes.data.is_affiliate && affiliateRes.data.affiliate?.is_active) {
            // Fetch more data in parallel
            const [statsRes, txRes, wdRes] = await Promise.all([
              getAffiliateStats(),
              getAffiliateTransactions(),
              getWithdrawals(),
            ]);
            
            if (statsRes.success) setStats(statsRes.data);
            if (txRes.success) setTransactions(txRes.data);
            if (wdRes.success) setWithdrawals(wdRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch affiliate data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const handleCopyCode = () => {
    if (affiliate?.referral_code) {
      navigator.clipboard.writeText(affiliate.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    setError('');
    try {
      const res = await registerAffiliate();
      if (res.success) {
        setSuccess(res.message);
        // Refresh data
        const affiliateRes = await getMyAffiliate();
        if (affiliateRes.success) {
          setIsAffiliate(affiliateRes.data.is_affiliate);
          setAffiliate(affiliateRes.data.affiliate || null);
        }
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdateCode = async () => {
    if (!newCode || newCode.length < 4) {
      setError(language === 'id' ? 'Kode minimal 4 karakter' : 'Code must be at least 4 characters');
      return;
    }
    
    setIsUpdatingCode(true);
    setError('');
    try {
      const res = await updateReferralCode(newCode);
      if (res.success) {
        setAffiliate(prev => prev ? { ...prev, referral_code: res.data?.referral_code || newCode.toUpperCase() } : null);
        setShowEditCode(false);
        setNewCode('');
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update code');
    } finally {
      setIsUpdatingCode(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const amount = parseFloat(withdrawForm.amount);
    if (!amount || amount < (settings?.min_withdrawal || 50000)) {
      setError(`${t.withdraw.minAmount}: ${formatCurrency(settings?.min_withdrawal || 50000)}`);
      return;
    }

    if (amount > (affiliate?.balance || 0)) {
      setError(language === 'id' ? 'Saldo tidak mencukupi' : 'Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await requestWithdrawal({
        amount,
        payment_method: withdrawForm.payment_method,
        bank_name: withdrawForm.payment_method === 'bank_transfer' ? withdrawForm.bank_name : undefined,
        account_name: withdrawForm.account_name,
        account_number: withdrawForm.account_number,
      });

      if (res.success) {
        setSuccess(res.message);
        setShowWithdrawModal(false);
        setWithdrawForm({
          amount: '',
          payment_method: 'bank_transfer',
          bank_name: '',
          account_name: '',
          account_number: '',
        });
        // Update both affiliate and stats for realtime UI update
        if (res.data) {
          const withdrawnAmount = parseFloat(withdrawForm.amount);
          
          setAffiliate(prev => prev ? { ...prev, balance: res.data!.new_balance } : null);
          
          setStats(prev => prev ? {
            ...prev,
            balance: res.data!.new_balance,
            pending_withdrawals: (prev.pending_withdrawals || 0) + withdrawnAmount
          } : null);
        }
        const wdRes = await getWithdrawals();
        if (wdRes.success) setWithdrawals(wdRes.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const openWhatsApp = () => {
    if (settings?.whatsapp_cs) {
      const message = encodeURIComponent(
        language === 'id' 
          ? `Halo, saya ingin mengaktifkan akun affiliate saya. Email: ${user?.email}`
          : `Hello, I want to activate my affiliate account. Email: ${user?.email}`
      );
      window.open(`https://wa.me/${settings.whatsapp_cs}?text=${message}`, '_blank');
    }
  };

  if (!user) return <div className="p-20 text-center font-bold">Access Denied</div>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not registered as affiliate
  if (!isAffiliate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">
            {language === 'id' ? 'Program Affiliate' : 'Affiliate Program'}
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            {language === 'id' 
              ? `Dapatkan komisi ${settings?.commission_percentage || 10}% setiap kali referral Anda melakukan pembayaran. Referral Anda juga mendapat diskon ${settings?.discount_percentage || 5}%!`
              : `Earn ${settings?.commission_percentage || 10}% commission every time your referral makes a payment. Your referrals also get ${settings?.discount_percentage || 5}% discount!`
            }
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2 max-w-md mx-auto">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button 
            variant="gradient" 
            size="lg" 
            onClick={handleRegister}
            disabled={isRegistering}
            className="shadow-2xl shadow-green-500/40"
          >
            {isRegistering ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Gift className="mr-2 h-5 w-5" />
            )}
            {t.registerBtn}
          </Button>

          {/* How it works */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: 1, title: t.step1, icon: Share2, color: 'bg-blue-100 text-blue-600' },
              { step: 2, title: t.step2, icon: Users, color: 'bg-purple-100 text-purple-600' },
              { step: 3, title: t.step3, icon: Gift, color: 'bg-green-100 text-green-600' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.color}`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Step {item.step}</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Registered but not active
  if (!affiliate?.is_active) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">{t.pendingActivation}</h1>
          <p className="text-lg text-slate-600 mb-4">
            {language === 'id' 
              ? 'Akun affiliate Anda sedang menunggu aktivasi dari admin.'
              : 'Your affiliate account is pending activation from admin.'
            }
          </p>
          <p className="text-slate-500 mb-8">
            {language === 'id' 
              ? 'Kode referral Anda akan ditampilkan setelah akun diaktifkan oleh admin.'
              : 'Your referral code will be displayed after your account is activated by admin.'
            }
          </p>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-600 text-sm max-w-md mx-auto">
              {success}
            </div>
          )}

          <Button 
            variant="gradient" 
            size="lg" 
            onClick={openWhatsApp}
            className="shadow-2xl shadow-green-500/40"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            {t.contactCs}
          </Button>
        </div>
      </div>
    );
  }

  // Active affiliate - full dashboard
  const totalEarnings = stats?.total_earned || affiliate?.total_earned || 0;
  const balance = stats?.balance || affiliate?.balance || 0;
  const pendingWithdrawals = stats?.pending_withdrawals || 0;
  const totalWithdrawals = stats?.total_withdrawals || 0;
  const totalReferrals = stats?.total_referrals || affiliate?.total_referrals || 0;
  const monthlyEarnings = stats?.monthly_earnings || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        badge={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-200 ring-1 ring-inset ring-green-500/30">
              {language === 'id' ? `Komisi ${settings?.commission_percentage}%` : `${settings?.commission_percentage}% Commission`}
            </span>
          </div>
        }
      >
        <Button 
          variant="gradient" 
          size="lg" 
          className="shadow-2xl shadow-green-500/40 w-full sm:w-auto h-14 rounded-2xl"
          onClick={() => setShowWithdrawModal(true)}
          disabled={balance < (settings?.min_withdrawal || 50000)}
        >
          <Wallet className="mr-2 h-5 w-5" /> {t.withdrawBtn}
        </Button>
      </PageHeader>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-600 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X className="h-4 w-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Referral Code Card */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-100 mb-1">{t.referralCode}</p>
            <div className="flex items-center gap-3">
              {showEditCode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder={affiliate?.referral_code}
                    className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 font-mono font-bold text-lg w-40 focus:outline-none focus:ring-2 focus:ring-white/50"
                    maxLength={15}
                    minLength={4}
                  />
                  <button
                    onClick={handleUpdateCode}
                    disabled={isUpdatingCode}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    {isUpdatingCode ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => { setShowEditCode(false); setNewCode(''); }}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-2xl tracking-wider">{affiliate?.referral_code}</span>
                  <button
                    onClick={() => setShowEditCode(true)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    title={t.editCode}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-medium"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t.copied : t.copyCode}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-slide-up">
        <div className="group rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{t.stats.totalEarnings}</p>
          <h3 className="text-2xl font-black text-slate-900">{formatCurrency(totalEarnings)}</h3>
        </div>

        <div className="group rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{t.stats.balance}</p>
          <h3 className="text-2xl font-black text-slate-900">{formatCurrency(balance)}</h3>
        </div>

        <div className="group rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{t.stats.pendingWithdrawals}</p>
          <h3 className="text-2xl font-black text-slate-900">{formatCurrency(pendingWithdrawals)}</h3>
        </div>

        <div className="group rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{t.stats.activeReferrals}</p>
          <h3 className="text-2xl font-black text-slate-900">{totalReferrals}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex space-x-1 overflow-x-auto rounded-2xl bg-slate-100 p-1 w-full sm:w-fit">
        {[
          { id: 'overview', label: t.tabs.overview, icon: TrendingUp },
          { id: 'transactions', label: t.tabs.transactions, icon: Calendar },
          { id: 'withdrawals', label: t.tabs.withdrawals, icon: Wallet }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all
            ${activeTab === tab.id 
              ? 'bg-white text-slate-900 shadow-md' 
              : 'text-slate-500 hover:text-slate-900'}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Earnings Chart */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">{t.earningsChart}</h3>
                </div>
                <div className="h-64">
                  {monthlyEarnings.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyEarnings}>
                        <defs>
                          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(val) => `${val/1000}k`} />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), language === 'id' ? 'Pendapatan' : 'Earnings']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      {t.noData}
                    </div>
                  )}
                </div>
              </div>

              {/* How It Works */}
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">{t.howItWorks}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: 1, title: t.step1, icon: Share2, color: 'bg-blue-100 text-blue-600' },
                    { step: 2, title: t.step2, icon: Users, color: 'bg-purple-100 text-purple-600' },
                    { step: 3, title: t.step3, icon: Gift, color: 'bg-green-100 text-green-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Step {item.step}</span>
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">{t.tabs.transactions}</h3>
              </div>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.date}</th>
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.referral}</th>
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.plan}</th>
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.status}</th>
                        <th className="text-right py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.commission}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-4 px-2 text-sm text-slate-600">
                            {new Date(tx.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-4 px-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{tx.referred_user.name}</p>
                              <p className="text-xs text-slate-400">{tx.referred_user.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <span className="text-sm font-medium text-slate-700">{tx.plan_name}</span>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                              tx.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : tx.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right text-sm font-bold text-green-600">
                            +{formatCurrency(tx.commission_earned)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">{t.noData}</div>
              )}
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">{t.tabs.withdrawals}</h3>
              </div>
              {withdrawals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.date}</th>
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.amount}</th>
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.method}</th>
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.account}</th>
                        <th className="text-left py-3 px-2 text-xs font-bold uppercase text-slate-400">{t.table.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-4 px-2 text-sm text-slate-600">
                            {new Date(w.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-4 px-2 text-sm font-bold text-slate-900">
                            {formatCurrency(w.amount)}
                          </td>
                          <td className="py-4 px-2 text-sm text-slate-600">
                            {w.payment_method_label}
                            {w.bank_name && <span className="text-slate-400"> ({w.bank_name})</span>}
                          </td>
                          <td className="py-4 px-2">
                            <p className="text-sm text-slate-800">{w.account_name}</p>
                            <p className="text-xs text-slate-400">{w.account_number}</p>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                              w.status === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : w.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {w.status}
                            </span>
                            {w.status === 'rejected' && w.admin_notes && (
                              <p className="text-xs text-red-500 mt-1">{w.admin_notes}</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">{t.noData}</div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">{language === 'id' ? 'Statistik' : 'Statistics'}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">{language === 'id' ? 'Total Penarikan' : 'Total Withdrawals'}</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(totalWithdrawals)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">{language === 'id' ? 'Bulan Ini' : 'This Month'}</span>
                <span className="text-sm font-bold text-indigo-600">{formatCurrency(stats?.this_month_earnings || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">{language === 'id' ? 'Min. Penarikan' : 'Min. Withdrawal'}</span>
                <span className="text-sm font-bold text-slate-600">{formatCurrency(settings?.min_withdrawal || 50000)}</span>
              </div>
            </div>
          </div>

          {/* Contact CS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">{language === 'id' ? 'Butuh Bantuan?' : 'Need Help?'}</h3>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={openWhatsApp}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {language === 'id' ? 'Hubungi CS' : 'Contact CS'}
            </Button>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{t.withdraw.title}</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.withdraw.amount}</label>
                <input
                  type="number"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  placeholder={`Min. ${formatCurrency(settings?.min_withdrawal || 50000)}`}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min={settings?.min_withdrawal || 50000}
                  max={balance}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">{language === 'id' ? 'Saldo tersedia:' : 'Available balance:'} {formatCurrency(balance)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.withdraw.method}</label>
                <select
                  value={withdrawForm.payment_method}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, payment_method: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="dana">Dana</option>
                  <option value="gopay">GoPay</option>
                  <option value="ovo">OVO</option>
                  <option value="shopeepay">ShopeePay</option>
                </select>
              </div>

              {withdrawForm.payment_method === 'bank_transfer' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.withdraw.bankName}</label>
                  <input
                    type="text"
                    value={withdrawForm.bank_name}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })}
                    placeholder="BCA, BNI, Mandiri, etc."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.withdraw.accountName}</label>
                <input
                  type="text"
                  value={withdrawForm.account_name}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, account_name: e.target.value })}
                  placeholder={language === 'id' ? 'Nama sesuai rekening' : 'Name as on account'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.withdraw.accountNumber}</label>
                <input
                  type="text"
                  value={withdrawForm.account_number}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, account_number: e.target.value })}
                  placeholder={language === 'id' ? 'Nomor rekening/akun' : 'Account number'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-12"
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-5 w-5" />
                )}
                {t.withdraw.submit}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
