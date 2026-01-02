
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, BarChart3, ShieldCheck, Zap, CircleDollarSign, Briefcase, Users, Megaphone, TrendingUp, Heart, Cpu, PlayCircle, FileText, Stethoscope, Target, Brain, Sparkles, TrendingDown, Battery, Star, Quote, ChevronDown, Play, MessageCircle } from 'lucide-react';
import Button from '../components/Button';
import { getPlans } from '../constants';

import { useLanguage } from '../services/languageContext';
import { TestCategory } from '../types';

export const Landing = () => {
  const navigate = useNavigate();
  const { content, language } = useLanguage();
  const plans = getPlans(language);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleStart = () => {
    navigate('/auth');
  };

  const categories = [
    { id: TestCategory.FINANCE, icon: CircleDollarSign, desc: language === 'id' ? 'Kesehatan Finansial' : 'Wealth & Cashflow' },
    { id: TestCategory.BUSINESS, icon: Briefcase, desc: language === 'id' ? 'Kematangan Bisnis' : 'Operations & Strategy' },
    { id: TestCategory.PRODUCTIVITY, icon: Zap, desc: language === 'id' ? 'Audit Fokus & Kebiasaan' : 'Focus & Habits' },
    { id: TestCategory.LEADERSHIP, icon: Users, desc: language === 'id' ? 'Kekuatan Kepemimpinan' : 'Team & Management' },
    { id: TestCategory.MARKETING, icon: Megaphone, desc: language === 'id' ? 'Kejelasan Brand' : 'Brand & Growth' },
    { id: TestCategory.CAREER, icon: TrendingUp, desc: language === 'id' ? 'Momentum Karir' : 'Skills & Progression' },
    { id: TestCategory.WELLBEING, icon: Heart, desc: language === 'id' ? 'Keseimbangan Hidup' : 'Burnout & Balance' },
    { id: TestCategory.META, icon: Cpu, desc: language === 'id' ? 'Kesiapan Masa Depan' : 'AI & Future Tech' },
  ];

  const problemItems = [
    { icon: Target, title: content.landing.problems?.items?.[0]?.title || 'Tidak Tahu Kelemahan Bisnis', desc: content.landing.problems?.items?.[0]?.desc || 'Banyak pengusaha tidak menyadari titik lemah dalam operasional mereka.' },
    { icon: Brain, title: content.landing.problems?.items?.[1]?.title || 'Keputusan Tanpa Data', desc: content.landing.problems?.items?.[1]?.desc || 'Mengambil keputusan penting hanya berdasarkan intuisi atau asumsi.' },
    { icon: Battery, title: content.landing.problems?.items?.[2]?.title || 'Burnout Tanpa Sadar', desc: content.landing.problems?.items?.[2]?.desc || 'Terlalu sibuk bekerja tanpa memperhatikan kesehatan mental dan fisik.' },
    { icon: TrendingDown, title: content.landing.problems?.items?.[3]?.title || 'Skill Gap Tersembunyi', desc: content.landing.problems?.items?.[3]?.desc || 'Tidak menyadari keterampilan penting yang perlu dikembangkan.' }
  ];

  const solutionItems = [
    { icon: Stethoscope, title: content.landing.solutions?.items?.[0]?.title || 'Audit Komprehensif', desc: content.landing.solutions?.items?.[0]?.desc || 'Diagnosa menyeluruh untuk setiap aspek bisnis dan karir Anda.' },
    { icon: Sparkles, title: content.landing.solutions?.items?.[1]?.title || 'Analisis AI-Powered', desc: content.landing.solutions?.items?.[1]?.desc || 'Teknologi AI canggih menganalisis data Anda secara objektif.' },
    { icon: FileText, title: content.landing.solutions?.items?.[2]?.title || 'Action Plan Jelas', desc: content.landing.solutions?.items?.[2]?.desc || 'Rekomendasi langkah konkret yang bisa langsung dieksekusi.' },
    { icon: ShieldCheck, title: content.landing.solutions?.items?.[3]?.title || 'Deteksi Blindspot', desc: content.landing.solutions?.items?.[3]?.desc || 'Identifikasi masalah tersembunyi sebelum menjadi kritis.' }
  ];

  const faqItems = content.landing.faq?.items || [
    { q: language === 'id' ? 'Apa itu Diagnospace?' : 'What is Diagnospace?', a: language === 'id' ? 'Diagnospace adalah platform diagnosa berbasis AI yang membantu profesional dan pengusaha mengidentifikasi kelemahan tersembunyi.' : 'Diagnospace is an AI-powered diagnostic platform that helps professionals identify hidden weaknesses.' },
    { q: language === 'id' ? 'Berapa lama waktu diagnosa?' : 'How long does a diagnostic take?', a: language === 'id' ? 'Sebagian besar diagnosa hanya membutuhkan 5-10 menit.' : 'Most diagnostics take only 5-10 minutes to complete.' },
    { q: language === 'id' ? 'Apakah data saya aman?' : 'Is my data secure?', a: language === 'id' ? 'Ya, kami menggunakan enkripsi kelas enterprise.' : 'Yes, we use enterprise-grade encryption.' },
    { q: language === 'id' ? 'Apakah ada paket gratis?' : 'Is there a free plan?', a: language === 'id' ? 'Ya, kami menawarkan paket gratis.' : 'Yes, we offer a free plan.' },
  ];

  const videoFeatures = content.landing.videoDemo?.features || [
    language === 'id' ? 'Selesaikan diagnosa dalam 5 menit' : 'Complete diagnostic in 5 minutes',
    language === 'id' ? 'Analisis AI dengan grafik radar' : 'AI analysis with radar charts',
    language === 'id' ? 'Rekomendasi yang actionable' : 'Actionable recommendations',
    language === 'id' ? 'Pantau perkembangan' : 'Track your progress',
  ];

  return (
    <div className="bg-background overflow-hidden">
      {/* Hero Section - Premium Dark Gradient like Auth */}
      <section id="hero" className="relative min-h-screen flex items-center">
        {/* Background Gradient like Auth page */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-white mb-8 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              {language === 'id' ? 'Platform Diagnostik Berbasis AI' : 'AI-Powered Diagnostic Platform'}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
              {language === 'id' ? (
                <>Cek Kesehatan Bisnis <span className="text-indigo-400">&</span> Karir Anda</>
              ) : (
                <>Check Your Business <span className="text-indigo-400">&</span> Career Health</>
              )}
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-200">
              {content.landing.heroSub}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400">
              <Button size="lg" variant="gradient" onClick={handleStart} className="h-14 px-8 text-base rounded-xl w-full sm:w-auto shadow-lg shadow-indigo-500/30">
                {content.landing.cta} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <a href="#video-demo" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium">
                <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <PlayCircle className="h-5 w-5" />
                </div>
                {content.landing.learnMore}
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in animation-delay-600">
              {[
                { value: '50+', label: language === 'id' ? 'Tes Diagnostik' : 'Diagnostic Tests' },
                { value: '10K+', label: language === 'id' ? 'Pengguna' : 'Users' },
                { value: '5min', label: language === 'id' ? 'Waktu Tes' : 'Test Time' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-card scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {language === 'id' ? 'Masalah' : 'Problem'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {content.landing.problems?.title || content.landing.problem.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.landing.problems?.sub || content.landing.problem.sub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {problemItems.map((item, idx) => (
              <div key={idx} className="group bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section - Dark like Auth */}
      <section id="solution" className="py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 h-96 w-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {language === 'id' ? 'Solusi' : 'Solution'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {content.landing.solutions?.title || (language === 'id' ? 'Diagnosa Dini dengan Diagnospace' : 'Early Diagnosis with Diagnospace')}
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              {content.landing.solutions?.sub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {solutionItems.map((item, idx) => (
              <div key={idx} className="group bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-indigo-500/5 hover:bg-white/10 hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="gradient" onClick={handleStart} className="h-14 px-10 rounded-xl shadow-lg shadow-indigo-500/30">
              {content.landing.cta} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{content.landing.intro.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{content.landing.intro.desc}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: content.landing.visReports, desc: content.landing.visReportsDesc },
              { icon: ShieldCheck, title: content.landing.expertVal, desc: content.landing.expertValDesc },
              { icon: Zap, title: content.landing.actionSteps, desc: content.landing.actionStepsDesc },
            ].map((f, idx) => (
              <div key={idx} className="group text-center p-8 rounded-3xl bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-muted scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {language === 'id' ? 'Cara Kerja' : 'How It Works'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{content.landing.howItWorks.title}</h2>
            <p className="text-muted-foreground">{content.landing.howItWorks.sub}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {content.landing.howItWorks.steps.map((step: any, idx: number) => (
              <div key={idx} className="group relative text-center p-6 bg-white dark:bg-slate-800/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg mb-4 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="tests" className="py-24 bg-card scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {language === 'id' ? 'Laboratorium' : 'Labs'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{content.landing.categoriesTitle}</h2>
            <p className="text-muted-foreground">{content.landing.categoriesSub}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={handleStart}
                className="group text-center p-6 bg-white dark:bg-slate-800/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 text-primary mb-4 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all group-hover:scale-110">
                  <cat.icon className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold text-foreground">{cat.id}</span>
                <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {language === 'id' ? 'Harga' : 'Pricing'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{content.landing.pricingTitle}</h2>
            <p className="text-muted-foreground">{content.landing.pricingSub}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan: any) => (
              <div key={plan.name} className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white shadow-2xl shadow-indigo-500/20 scale-105' : 'bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-xl'}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {language === 'id' ? 'Populer' : 'Popular'}
                  </span>
                )}
                <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-base font-normal opacity-70">/{language === 'id' ? 'bln' : 'mo'}</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <CheckCircle2 className={`h-5 w-5 shrink-0 ${plan.highlight ? 'text-green-400' : 'text-primary'}`} />
                      <span className={plan.highlight ? 'text-slate-300' : 'text-muted-foreground'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? 'gradient' : 'outline'} className="w-full h-12 rounded-xl" onClick={handleStart}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {language === 'id' ? 'Testimoni' : 'Testimonials'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {content.landing.testimonials?.title}
            </h2>
            <p className="text-muted-foreground">{content.landing.testimonials?.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(content.landing.testimonials?.items || []).slice(0, 6).map((testimonial: any, idx: number) => (
              <div key={idx} className="group bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="video-demo" className="py-24 bg-muted scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {language === 'id' ? 'Video Demo' : 'Video Demo'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {content.landing.videoDemo?.title || (language === 'id' ? 'Lihat Diagnospace Beraksi' : 'See Diagnospace in Action')}
              </h2>
              <p className="text-muted-foreground mb-8">
                {content.landing.videoDemo?.subtitle}
              </p>
              
              <ul className="space-y-4 mb-8">
                {videoFeatures.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-foreground font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" variant="gradient" onClick={handleStart} className="h-14 px-8 rounded-xl shadow-lg shadow-indigo-500/30">
                {content.landing.cta} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 shadow-2xl shadow-indigo-500/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={handleStart} className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:scale-110 hover:bg-white/20 transition-all">
                    <Play className="h-8 w-8 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-card scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {content.landing.faq?.title || (language === 'id' ? 'Pertanyaan Umum' : 'Frequently Asked Questions')}
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-bold text-foreground pr-4">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-muted rounded-2xl border border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">{content.landing.faq?.contact || (language === 'id' ? 'Masih punya pertanyaan?' : 'Still have questions?')}</span>
            </div>
            <Button variant="outline" onClick={handleStart} className="rounded-xl border-border hover:border-primary/30">
              {content.landing.faq?.contactCta || (language === 'id' ? 'Hubungi Kami' : 'Contact Us')}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark like Auth */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {content.landing.finalCtaTitle}
          </h2>
          <p className="text-slate-300 mb-10 max-w-2xl mx-auto">
            {content.landing.finalCtaSub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={handleStart} size="lg" variant="gradient" className="h-14 px-10 rounded-xl w-full sm:w-auto shadow-lg shadow-indigo-500/30">
              {content.landing.finalCtaButton}
            </Button>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              {language === 'id' ? '100% Gratis & Privat' : '100% Free & Private'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
