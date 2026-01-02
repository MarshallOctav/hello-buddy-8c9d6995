import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Crown, Zap, Star, Sparkles, Shield, Gift, Loader2, Receipt, Calendar, AlertTriangle, XCircle } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { AccessLevel } from '../types';
import { Modal } from '../components/Modal';
import { ReferralCodeModal } from '../components/ReferralCodeModal';
import { getMidtransClientKey, createPaymentTransaction, getPublicPlans, PublicPlan, verifyAndUpgradePlan, cancelPlan } from '../services/api';
import { toast } from 'sonner';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

interface PlanDisplay {
  name: string;
  price: string;
  priceValue: number;
  period: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  level: AccessLevel;
}

export const Plans = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, upgradePlan, refreshUser } = useAuth();
  const { language } = useLanguage();
  const [plans, setPlans] = useState<PlanDisplay[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [pendingPlanLevel, setPendingPlanLevel] = useState<AccessLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [snapReady, setSnapReady] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getPublicPlans();
        if (response.success && response.plans) {
          const formattedPlans = formatPlansFromApi(response.plans);
          setPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        // Fallback to default plans
        setPlans(getDefaultPlans());
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [language]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPlansFromApi = (apiPlans: PublicPlan[]): PlanDisplay[] => {
    // Add Free plan first
    const displayPlans: PlanDisplay[] = [
      {
        name: 'Free',
        price: language === 'id' ? 'Gratis' : 'Rp 0',
        priceValue: 0,
        period: '',
        features: language === 'id' 
          ? ['Akses ke 5 Tes Dasar', 'Hasil Sederhana', 'Tanpa Riwayat'] 
          : ['Access to 5 Basic Tests', 'Simple Results', 'No History'],
        cta: language === 'id' ? 'Mulai' : 'Get Started',
        level: AccessLevel.FREE
      }
    ];

    // Find Pro plan from API (slug: PRO)
    const proPlan = apiPlans.find(p => p.id === 'PRO');
    // Find Premium plan from API (slug: PREMIUM)
    const premiumPlan = apiPlans.find(p => p.id === 'PREMIUM');

    if (proPlan) {
      displayPlans.push({
        name: proPlan.name,
        price: formatCurrency(proPlan.price),
        priceValue: proPlan.price,
        period: language === 'id' ? '/bulan' : '/month',
        features: proPlan.features,
        cta: language === 'id' ? 'Jadi Pro' : 'Go Pro',
        highlight: true,
        level: AccessLevel.PRO
      });
    }

    if (premiumPlan) {
      displayPlans.push({
        name: premiumPlan.name,
        price: formatCurrency(premiumPlan.price),
        priceValue: premiumPlan.price,
        period: language === 'id' ? '/tahun' : '/year',
        features: premiumPlan.features,
        cta: language === 'id' ? 'Ambil Premium' : 'Get Premium',
        level: AccessLevel.PREMIUM
      });
    }

    return displayPlans;
  };

  const getDefaultPlans = (): PlanDisplay[] => [
    {
      name: 'Free',
      price: language === 'id' ? 'Gratis' : 'Rp 0',
      priceValue: 0,
      period: '',
      features: language === 'id' 
        ? ['Akses ke 5 Tes Dasar', 'Hasil Sederhana', 'Tanpa Riwayat'] 
        : ['Access to 5 Basic Tests', 'Simple Results', 'No History'],
      cta: language === 'id' ? 'Mulai' : 'Get Started',
      level: AccessLevel.FREE
    },
    {
      name: 'Pro',
      price: 'Rp 299.000',
      priceValue: 299000,
      period: language === 'id' ? '/bulan' : '/month',
      features: language === 'id'
        ? ['Akses Semua Tes', 'Laporan PDF', 'Pelacakan Progres', 'Analisis Mendalam']
        : ['Access All Tests', 'PDF Reports', 'Progress Tracking', 'Deep Analysis'],
      cta: language === 'id' ? 'Jadi Pro' : 'Go Pro',
      highlight: true,
      level: AccessLevel.PRO
    },
    {
      name: 'Premium',
      price: 'Rp 1.499.000',
      priceValue: 1499000,
      period: language === 'id' ? '/tahun' : '/year',
      features: language === 'id'
        ? ['Semua Fitur Pro', 'Dukungan Prioritas', 'Panggilan Konsultasi', 'Bonus Afiliasi']
        : ['All Pro Features', 'Priority Support', 'Consultation Call', 'Affiliate Bonus'],
      cta: language === 'id' ? 'Ambil Premium' : 'Get Premium',
      level: AccessLevel.PREMIUM
    }
  ];

  // Load Midtrans Snap script
  useEffect(() => {
    const loadSnapScript = async () => {
      try {
        const { client_key, is_production } = await getMidtransClientKey();
        
        // Check if script already exists
        const existingScript = document.getElementById('midtrans-snap');
        if (existingScript) {
          setSnapReady(true);
          return;
        }

        const script = document.createElement('script');
        script.id = 'midtrans-snap';
        script.src = is_production 
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', client_key);
        script.onload = () => setSnapReady(true);
        document.body.appendChild(script);
      } catch (error) {
        console.error('Failed to load Midtrans:', error);
      }
    };

    loadSnapScript();
  }, []);

  // Handle payment result from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setShowSuccessModal(true);
      // Clear the URL params
      navigate('/plans', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSelectPlan = async (planLevel: AccessLevel, planName: string) => {
    if (user?.plan === planLevel) return;
    
    // Free plan - no payment needed
    if (planLevel === AccessLevel.FREE) {
      setSelectedPlan(planName);
      upgradePlan(planLevel);
      setShowSuccessModal(true);
      return;
    }

    // Pro or Premium - show referral modal first
    if (!snapReady) {
      alert(language === 'id' ? 'Sistem pembayaran sedang dimuat...' : 'Payment system is loading...');
      return;
    }

    setSelectedPlan(planName);
    setPendingPlanLevel(planLevel);
    setShowReferralModal(true);
  };

  const handleReferralConfirm = async (referralCode: string | null, voucherCode: string | null) => {
    if (!pendingPlanLevel || !selectedPlan) return;
    
    setIsLoading(true);
    setLoadingPlan(selectedPlan);
    setShowReferralModal(false);

    try {
      const response = await createPaymentTransaction({
        plan: pendingPlanLevel as 'PRO' | 'PREMIUM',
        referral_code: referralCode,
        voucher_code: voucherCode
      });

      if (response.success && response.token) {
        const orderId = response.order_id;
        
        window.snap.pay(response.token, {
          onSuccess: async (result) => {
            console.log('Payment success:', result);
            
            // Verify and upgrade via backend
            if (orderId) {
              try {
                const verifyResult = await verifyAndUpgradePlan(orderId);
                console.log('Verify result:', verifyResult);
                
                if (verifyResult.success) {
                  // Refresh user data from backend to get updated plan
                  await refreshUser();
                  setShowSuccessModal(true);
                } else {
                  // Fallback: update local state
                  upgradePlan(pendingPlanLevel);
                  setShowSuccessModal(true);
                }
              } catch (error) {
                console.error('Verification failed:', error);
                // Fallback: update local state
                upgradePlan(pendingPlanLevel);
                setShowSuccessModal(true);
              }
            } else {
              upgradePlan(pendingPlanLevel);
              setShowSuccessModal(true);
            }
            
            setIsLoading(false);
            setLoadingPlan(null);
            setPendingPlanLevel(null);
          },
          onPending: (result) => {
            console.log('Payment pending:', result);
            alert(language === 'id' 
              ? 'Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.' 
              : 'Payment is being processed. Please complete your payment.');
            setIsLoading(false);
            setLoadingPlan(null);
            setPendingPlanLevel(null);
          },
          onError: (result) => {
            console.error('Payment error:', result);
            alert(language === 'id' 
              ? 'Pembayaran gagal. Silakan coba lagi.' 
              : 'Payment failed. Please try again.');
            setIsLoading(false);
            setLoadingPlan(null);
            setPendingPlanLevel(null);
          },
          onClose: () => {
            console.log('Payment popup closed');
            setIsLoading(false);
            setLoadingPlan(null);
            setPendingPlanLevel(null);
          }
        });
      } else {
        alert(response.message || (language === 'id' ? 'Gagal membuat transaksi' : 'Failed to create transaction'));
        setIsLoading(false);
        setLoadingPlan(null);
        setPendingPlanLevel(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
      setIsLoading(false);
      setLoadingPlan(null);
      setPendingPlanLevel(null);
    }
  };

  const handleCancelPlan = async () => {
    setIsCancelling(true);
    try {
      const response = await cancelPlan();
      if (response.success) {
        toast.success(language === 'id' ? 'Paket berhasil diakhiri' : 'Plan ended successfully');
        refreshUser();
        setShowCancelModal(false);
      } else {
        toast.error(response.message || (language === 'id' ? 'Gagal mengakhiri paket' : 'Failed to cancel plan'));
      }
    } catch (error) {
      toast.error(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setIsCancelling(false);
    }
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!user?.planExpiresAt) return 0;
    const expiresAt = new Date(user.planExpiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const content = {
    id: {
      title: 'Pilih Paket Anda',
      subtitle: 'Upgrade untuk membuka semua fitur diagnostik profesional',
      currentPlan: 'Paket Saat Ini',
      selectPlan: 'Pilih Paket',
      back: 'Kembali',
      successTitle: 'Upgrade Berhasil!',
      successMessage: 'Anda sekarang adalah member',
      continue: 'Lanjutkan',
      benefits: 'Keuntungan Upgrade',
      benefitsList: [
        'Akses ke 50+ alat diagnostik profesional',
        'Laporan PDF yang dapat diunduh',
        'Analisis mendalam dengan rekomendasi AI',
        'Pelacakan progres tanpa batas'
      ],
      processing: 'Memproses...',
      yourPlanStatus: 'Status Paket Anda',
      activePlan: 'Paket Aktif',
      daysRemaining: 'Sisa Hari',
      expiresOn: 'Berakhir pada',
      cancelPlan: 'Akhiri Paket',
      cancelConfirmTitle: 'Akhiri Paket?',
      cancelConfirmMessage: 'Apakah Anda yakin ingin mengakhiri paket? Anda akan kehilangan akses ke fitur premium dan dikembalikan ke paket Free.',
      cancelConfirm: 'Ya, Akhiri Paket',
      cancelCancel: 'Batal',
      cancelling: 'Mengakhiri...'
    },
    en: {
      title: 'Choose Your Plan',
      subtitle: 'Upgrade to unlock all professional diagnostic features',
      currentPlan: 'Current Plan',
      selectPlan: 'Select Plan',
      back: 'Back',
      successTitle: 'Upgrade Successful!',
      successMessage: 'You are now a',
      continue: 'Continue',
      benefits: 'Benefits of Upgrading',
      benefitsList: [
        'Access to 50+ professional diagnostic tools',
        'Downloadable PDF reports',
        'Deep analysis with AI recommendations',
        'Unlimited progress tracking'
      ],
      processing: 'Processing...',
      yourPlanStatus: 'Your Plan Status',
      activePlan: 'Active Plan',
      daysRemaining: 'Days Remaining',
      expiresOn: 'Expires on',
      cancelPlan: 'End Plan',
      cancelConfirmTitle: 'End Plan?',
      cancelConfirmMessage: 'Are you sure you want to end your plan? You will lose access to premium features and be downgraded to the Free plan.',
      cancelConfirm: 'Yes, End Plan',
      cancelCancel: 'Cancel',
      cancelling: 'Ending...'
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  const getPlanIcon = (name: string) => {
    switch (name) {
      case 'Free': return <Zap className="h-6 w-6" />;
      case 'Pro': return <Star className="h-6 w-6" />;
      case 'Premium': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (name: string) => {
    switch (name) {
      case 'Free': return 'from-slate-500 to-slate-600';
      case 'Pro': return 'from-blue-500 to-indigo-600';
      case 'Premium': return 'from-purple-500 to-pink-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">{t.back}</span>
            </button>
            
            <Link
              to="/payment-history"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/20"
            >
              <Receipt className="h-5 w-5" />
              <span className="font-semibold">{language === 'id' ? 'Riwayat Pembayaran' : 'Payment History'}</span>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-bold text-white">{language === 'id' ? 'Hemat hingga 40%' : 'Save up to 40%'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t.title}</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Current Plan Status Card - Only show for paid users */}
      {user && user.plan !== AccessLevel.FREE && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Plan Info */}
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getPlanColor(user.plan === AccessLevel.PRO ? 'Pro' : 'Premium')} flex items-center justify-center text-white shadow-lg`}>
                  {user.plan === AccessLevel.PRO ? <Star className="h-8 w-8" /> : <Crown className="h-8 w-8" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{t.yourPlanStatus}</p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {user.plan === AccessLevel.PRO ? 'Pro' : 'Premium'}
                  </h3>
                </div>
              </div>

              {/* Days Remaining */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl px-5 py-3">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                  <div>
                    <p className="text-xs font-medium text-indigo-600">{t.daysRemaining}</p>
                    <p className="text-2xl font-black text-indigo-700">{getDaysRemaining()}</p>
                  </div>
                </div>

                {user.planExpiresAt && (
                  <div className="hidden md:block text-sm text-slate-500">
                    <p>{t.expiresOn}</p>
                    <p className="font-semibold text-slate-700">
                      {new Date(user.planExpiresAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-semibold"
              >
                <XCircle className="h-5 w-5" />
                {t.cancelPlan}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid - Only show for FREE users or non-logged-in users */}
      {(!user || user.plan === AccessLevel.FREE) && (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {loadingPlans ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="relative flex flex-col rounded-3xl border-2 border-slate-200 p-8 shadow-xl bg-white animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200"></div>
                  <div>
                    <div className="h-6 w-20 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 w-12 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="h-10 w-32 bg-slate-200 rounded mb-8"></div>
                <div className="space-y-3 flex-1 mb-8">
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                </div>
                <div className="h-14 w-full bg-slate-200 rounded-2xl"></div>
              </div>
            ))
          ) : plans.map((plan, idx) => {
            const isCurrentPlan = user?.plan === plan.level;
            const isLoadingThisPlan = loadingPlan === plan.name;
            
            return (
              <div 
                key={idx} 
                className={`relative flex flex-col rounded-3xl border-2 p-8 shadow-xl transition-all hover:shadow-2xl bg-white ${
                  plan.highlight 
                    ? 'border-indigo-500 ring-4 ring-indigo-100' 
                    : isCurrentPlan 
                      ? 'border-green-500 ring-4 ring-green-100'
                      : 'border-slate-200'
                }`}
              >
                {plan.highlight && !isCurrentPlan && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    {language === 'id' ? 'Paling Populer' : 'Most Popular'}
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t.currentPlan}
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${getPlanColor(plan.name)} flex items-center justify-center text-white shadow-lg`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{language === 'id' ? 'Paket' : 'Plan'}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight text-slate-900">{plan.price}</span>
                    {plan.period && <span className="text-lg font-semibold text-slate-500">{plan.period}</span>}
                  </div>
                  {plan.name === 'Premium' && (
                    <p className="mt-2 text-sm text-green-600 font-bold">
                      {language === 'id' ? '💰 Hemat Rp 2.089.000/tahun' : '💰 Save $129/year'}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 flex-1 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-x-3 text-sm text-slate-600">
                      <CheckCircle2 className="h-5 w-5 flex-none text-green-500" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  variant={isCurrentPlan ? 'secondary' : plan.highlight ? 'gradient' : 'primary'}
                  className={`w-full h-14 rounded-2xl ${plan.highlight && !isCurrentPlan ? 'shadow-lg shadow-indigo-500/30' : ''}`}
                  onClick={() => handleSelectPlan(plan.level, plan.name)}
                  disabled={isCurrentPlan || isLoading}
                >
                  {isCurrentPlan ? (
                    <><CheckCircle2 className="mr-2 h-5 w-5" /> {t.currentPlan}</>
                  ) : isLoadingThisPlan ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t.processing}</>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-900 p-10 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400 uppercase tracking-widest">{t.benefits}</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-6">
                {language === 'id' ? 'Mengapa Upgrade ke Pro atau Premium?' : 'Why Upgrade to Pro or Premium?'}
              </h2>
              <ul className="space-y-4">
                {t.benefitsList.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <Shield className="h-20 w-20 text-white mx-auto mb-4" />
                  <p className="text-center text-white font-bold text-lg">
                    {language === 'id' ? 'Garansi Uang Kembali 30 Hari' : '30-Day Money Back Guarantee'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/dashboard');
        }}
        title={t.successTitle}
      >
        <div className="text-center py-8">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">{t.successTitle}</h3>
          <p className="text-lg text-slate-600">
            {t.successMessage} <span className="font-bold text-indigo-600">{selectedPlan}</span> member!
          </p>
          <Button 
            variant="gradient" 
            className="mt-8 h-14 px-12 rounded-2xl"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard');
            }}
          >
            {t.continue}
          </Button>
        </div>
      </Modal>

      {/* Referral Code Modal */}
      <ReferralCodeModal
        isOpen={showReferralModal}
        onClose={() => {
          setShowReferralModal(false);
          setPendingPlanLevel(null);
        }}
        onConfirm={handleReferralConfirm}
        planName={selectedPlan || ''}
        planPrice={plans.find(p => p.name === selectedPlan)?.priceValue || 0}
        isLoading={isLoading}
      />

      {/* Cancel Plan Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t.cancelConfirmTitle}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <p className="text-center text-slate-600">{t.cancelConfirmMessage}</p>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 h-12 rounded-xl"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              {t.cancelCancel}
            </Button>
            <Button
              variant="primary"
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700"
              onClick={handleCancelPlan}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.cancelling}
                </>
              ) : (
                t.cancelConfirm
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
