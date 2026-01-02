
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { Link, useNavigate } from 'react-router-dom';
import { getMockTests, getPlans } from '../constants';
import { getTestHistory, getUserStats, getLeaderboard, getUserBadges, checkAndAwardBadges, TestHistoryItem, UserStats, LeaderboardItem, BadgeItem } from '../services/api';
import { 
  Award, TrendingUp, History, PlayCircle, Lock, Eye, FileText, Download, 
  CheckCircle2, BookOpen, Flame, Star, Trophy, Crown, Medal, Zap, Layout, User as UserIcon, Mail, Calendar, Shield, ArrowUpRight, Sparkles, Target, Layers, ArrowRight, AlertCircle, ThumbsUp, Lightbulb, Check, Info, Rocket, Loader2, Clock, Gift
} from 'lucide-react';
import { getMyAffiliate, type AffiliateData, type AffiliateSettings } from '../services/api';
import Button from '../components/Button';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { ProfileTab } from '../components/ProfileTab';
import { AccessLevel } from '../types';
import { UpgradeModal } from '../components/UpgradeModal';
import { canAccess } from '../components/FeatureLock';
import { generateDashboardPDF, generateResultPDF } from '../utils/pdfGenerator';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Cell
} from 'recharts';

// Transform API history to local format
const transformHistory = (apiHistory: TestHistoryItem[]) => {
  return apiHistory.map(item => ({
    id: `res_${item.id}`,
    testId: item.test_id,
    testTitle: item.test_title,
    category: item.category,
    date: item.date,
    score: item.score,
    level: item.level,
    xpEarned: item.xp_earned,
    dimensionScores: item.dimension_scores,
    recommendations: [
      "Focus on consistency in daily execution.",
      "Leverage your strengths in strategic planning."
    ]
  }));
};

// Transform API leaderboard to local format
const transformLeaderboard = (apiLeaderboard: LeaderboardItem[]) => {
  return apiLeaderboard.map(item => ({
    id: item.id,
    name: item.name,
    points: item.points,
    badges: item.badges,
    badgeList: item.badge_list || [],
    avatar: item.avatar,
    avatarUrl: item.avatar_url,
    isMe: item.is_me,
    trend: item.trend
  }));
};

export const Dashboard = () => {
  const { user, upgradePlan } = useAuth();
  const { content, language } = useLanguage();
  const navigate = useNavigate();
  const tests = getMockTests(language);
  const plans = getPlans(language);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'leaderboard' | 'profile'>('overview');
  const [viewResult, setViewResult] = useState<any | null>(null);
  const [showConsolidated, setShowConsolidated] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState<AccessLevel>(AccessLevel.PRO);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const userPlan = user?.plan || AccessLevel.FREE;

  const handleLockedFeature = (requiredLevel: AccessLevel) => {
    setUpgradeLevel(requiredLevel);
    setShowUpgradeModal(true);
  };

  const handleConsolidatedClick = () => {
    if (!canAccess(userPlan, AccessLevel.PREMIUM)) {
      handleLockedFeature(AccessLevel.PREMIUM);
    } else {
      setShowConsolidated(true);
    }
  };

  const handlePDFDownload = () => {
    if (!canAccess(userPlan, AccessLevel.PRO)) {
      handleLockedFeature(AccessLevel.PRO);
    } else if (consolidatedData) {
      // Generate holistic PDF
      generateDashboardPDF({
        userName: user.name,
        overallScore: consolidatedData.overallScore,
        archetype: consolidatedData.archetype,
        archetypeDesc: consolidatedData.archetypeDesc,
        categoryScores: consolidatedData.radarData.map(d => ({ subject: d.subject, score: d.A })),
        strengths: consolidatedData.strengths.map(s => ({ subject: s.subject, score: s.A })),
        weaknesses: consolidatedData.weaknesses.map(w => ({ subject: w.subject, score: w.A })),
        language
      });
      // Show success notification
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 4000);
    }
  };

  const handleHistoryPDFDownload = (res: any) => {
    const test = tests.find(t => t.id === res.testId);
    if (!test) return;
    
    generateResultPDF({
      testTitle: res.testTitle,
      testCategory: res.category,
      score: res.score,
      level: res.level,
      date: res.date,
      dimensions: test.dimensions?.map(d => ({
        subject: d.label[language],
        score: Math.max(0, Math.min(100, res.score + Math.floor(Math.random() * 20) - 10))
      })) || [
        { subject: language === 'id' ? 'Strategi' : 'Strategy', score: res.score },
        { subject: language === 'id' ? 'Eksekusi' : 'Execution', score: Math.max(0, res.score - 10) },
        { subject: language === 'id' ? 'Konsistensi' : 'Consistency', score: Math.min(100, res.score + 5) }
      ],
      recommendations: res.recommendations.map((r: string, i: number) => ({
        title: language === 'id' ? `Rekomendasi ${i + 1}` : `Recommendation ${i + 1}`,
        desc: r
      })),
      executiveSummary: language === 'id' 
        ? `Skor Anda ${res.score}% menunjukkan tingkat ${res.level} dalam ${res.testTitle}.`
        : `Your score of ${res.score}% indicates a ${res.level} level in ${res.testTitle}.`,
      vitalPoint: res.recommendations[0] || '',
      methodology: test.methodology,
      language
    });
  };
  
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activityData, setActivityData] = useState<Array<{ name: string; xp: number }>>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [earnedBadges, setEarnedBadges] = useState<BadgeItem[]>([]);
  const [lockedBadges, setLockedBadges] = useState<BadgeItem[]>([]);
  const [totalBadges, setTotalBadges] = useState(12);
  
  // Affiliate state
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateSettings, setAffiliateSettings] = useState<AffiliateSettings | null>(null);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [historyRes, statsRes, leaderboardRes, badgesRes, affiliateRes] = await Promise.all([
          getTestHistory(),
          getUserStats(),
          getLeaderboard(),
          getUserBadges(),
          getMyAffiliate()
        ]);
        
        if (historyRes.success) {
          setHistory(transformHistory(historyRes.data));
        }
        
        if (statsRes.success) {
          setStats(statsRes.data);
          setActivityData(statsRes.data.activity_data || []);
        }
        
        if (leaderboardRes.success) {
          setLeaderboard(transformLeaderboard(leaderboardRes.data));
        }
        
        if (badgesRes.success) {
          setEarnedBadges(badgesRes.data.earned);
          setLockedBadges(badgesRes.data.locked);
          setTotalBadges(badgesRes.data.total_badges);
        }
        
        if (affiliateRes.success) {
          setIsAffiliate(affiliateRes.data.is_affiliate);
          setAffiliateData(affiliateRes.data.affiliate || null);
          setAffiliateSettings(affiliateRes.data.settings);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.stats?.testsTaken === 0) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (!user) return <div className="p-20 text-center font-bold">{content.dashboard.accessDenied}</div>;

  const completedTests = stats?.completed_tests ?? history.length;
  const avgScore = stats?.avg_score ?? (history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0);
  const currentStreak = stats?.current_streak ?? 0;
  const totalXP = stats?.total_xp ?? 0;

  const getConsolidatedData = () => {
      if (!history.length) return null;

      const catStats = history.reduce((acc, curr) => {
          if (!acc[curr.category]) {
              acc[curr.category] = { total: 0, count: 0 };
          }
          acc[curr.category].total += curr.score;
          acc[curr.category].count += 1;
          return acc;
      }, {} as Record<string, {total: number, count: number}>);

      const radarData = Object.keys(catStats).map(cat => ({
          subject: cat,
          A: Math.round(catStats[cat].total / catStats[cat].count),
          fullMark: 100
      }));

      const sortedCats = [...radarData].sort((a, b) => b.A - a.A);
      const strengths = sortedCats.slice(0, 2);
      const weaknesses = sortedCats.slice(-2).reverse();

      const trendData = [...history]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(h => ({ date: h.date.split('/').slice(0, 2).join('/'), score: h.score, name: h.testTitle }));

      const topCategory = sortedCats[0]?.subject || '';
      let archetype = 'The Balanced Improver';
      let archetypeDesc = 'You maintain a steady pace across multiple domains, showing versatility and resilience.';
      
      if (topCategory.includes('Finance') || topCategory.includes('Keuangan')) {
          archetype = 'The Wealth Builder';
          archetypeDesc = 'Your financial acumen is your strongest asset. Leverage this stability to take calculated risks.';
      } else if (topCategory.includes('Business') || topCategory.includes('Bisnis')) {
          archetype = 'The Operator';
          archetypeDesc = 'You have a knack for systems and execution. Focus on scaling your impact through delegation.';
      }

      return {
          overallScore: avgScore,
          radarData,
          strengths,
          weaknesses,
          trendData,
          sortedCats,
          archetype,
          archetypeDesc
      };
  };

  const consolidatedData = getConsolidatedData();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (language === 'id' ? 'Selamat Pagi' : 'Good morning') : 
                   hour < 18 ? (language === 'id' ? 'Selamat Siang' : 'Good afternoon') : 
                               (language === 'id' ? 'Selamat Malam' : 'Good evening');

  // Badge icon mapping
  const getBadgeIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'zap': <Zap className="h-4 w-4" />,
      'trending-up': <TrendingUp className="h-4 w-4" />,
      'award': <Award className="h-4 w-4" />,
      'star': <Star className="h-4 w-4" />,
      'target': <Target className="h-4 w-4" />,
      'flame': <Flame className="h-4 w-4" />,
      'coins': <Star className="h-4 w-4" />,
      'check-circle': <CheckCircle2 className="h-4 w-4" />,
      'compass': <BookOpen className="h-4 w-4" />,
      'crown': <Crown className="h-4 w-4" />,
      'medal': <Medal className="h-4 w-4" />,
      'trophy': <Trophy className="h-4 w-4" />,
    };
    return icons[iconName] || <Award className="h-4 w-4" />;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader 
        title={<>{greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{user.name}</span></>}
        subtitle={
          <div className="flex flex-col gap-1">
             <span>{content.dashboard.subtitle}</span>
             <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-32 bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-green-400" style={{width: `${avgScore}%`}}></div>
                </div>
                <span className="text-xs font-bold text-slate-400">{avgScore}% to Mastery</span>
             </div>
          </div>
        }
        badge={
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-black uppercase tracking-wider ring-1 ring-inset ${
                user.plan === AccessLevel.PREMIUM ? 'bg-purple-500/20 text-purple-200 ring-purple-500/30' :
                user.plan === AccessLevel.PRO ? 'bg-blue-500/20 text-blue-200 ring-blue-500/30' :
                'bg-slate-500/20 text-slate-300 ring-slate-500/30'
            }`}>
                {user.plan} MEMBER
            </span>
          </div>
        }
      >
         <Link to="/catalog">
            <Button variant="gradient" size="lg" className="shadow-2xl shadow-indigo-500/40 w-full sm:w-auto h-16 rounded-2xl">
                <Rocket className="mr-2 h-5 w-5" /> {language === 'id' ? 'Mulai Diagnosa Baru' : 'New Assessment'}
            </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards - Scrollable on mobile with indicator */}
      <div className="mb-10 relative animate-slide-up">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 lg:grid lg:grid-cols-4 scrollbar-hide">
          <div className="group flex-shrink-0 w-[140px] sm:w-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
               <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-50 text-orange-600">
                 <Flame className="h-5 w-5 sm:h-6 sm:w-6" />
               </div>
               <Info className="h-3 w-3 sm:h-4 sm:w-4 text-slate-300" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{content.dashboard.stats.streak}</p>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900">{currentStreak} <span className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase">Days</span></h3>
          </div>

          <div className="group flex-shrink-0 w-[140px] sm:w-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
               <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-yellow-50 text-yellow-600">
                 <Star className="h-5 w-5 sm:h-6 sm:w-6" />
               </div>
               <Info className="h-3 w-3 sm:h-4 sm:w-4 text-slate-300" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{content.dashboard.stats.xp}</p>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900">{totalXP}</h3>
          </div>

          <div className="group flex-shrink-0 w-[140px] sm:w-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 mb-3 sm:mb-4">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{content.dashboard.stats.tests}</p>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900">{completedTests}</h3>
          </div>

          <div className="group flex-shrink-0 w-[140px] sm:w-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
               <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-green-50 text-green-600">
                 <Target className="h-5 w-5 sm:h-6 sm:w-6" />
               </div>
               <Info className="h-3 w-3 sm:h-4 sm:w-4 text-slate-300" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{content.dashboard.stats.score}</p>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900">{avgScore}%</h3>
          </div>
        </div>
        {/* Scroll indicator for mobile */}
        <div className="absolute right-0 top-0 bottom-2 bg-gradient-to-l from-background via-background to-transparent w-10 pointer-events-none lg:hidden flex items-center justify-end pr-1">
            <ArrowRight className="h-4 w-4 text-slate-400 animate-pulse" />
        </div>
      </div>

      {/* Tabs with scroll indicator on mobile */}
      <div className="mb-8 relative">
          <div className="flex space-x-1 overflow-x-auto rounded-2xl bg-slate-100 p-1 w-full sm:w-fit scrollbar-hide">
              {[
                { id: 'overview', label: content.dashboard.tabs.overview, icon: Layout },
                { id: 'history', label: content.dashboard.tabs.history, icon: History },
                { id: 'leaderboard', label: content.dashboard.tabs.leaderboard, icon: Trophy },
                { id: 'profile', label: content.dashboard.tabs.profile, icon: UserIcon }
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all
                      ${activeTab === tab.id 
                          ? 'bg-white text-slate-900 shadow-md' 
                          : 'text-slate-500 hover:text-slate-900'}`}
                  >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.id === 'overview' ? (language === 'id' ? 'Ikhtisar' : 'Overview') : tab.id === 'history' ? (language === 'id' ? 'Riwayat' : 'History') : tab.id === 'leaderboard' ? (language === 'id' ? 'Peringkat' : 'Rank') : (language === 'id' ? 'Profil' : 'Profile')}</span>
                  </button>
              ))}
          </div>
          {/* Scroll indicator for mobile */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background via-background to-transparent w-8 h-full pointer-events-none sm:hidden flex items-center justify-end pr-1">
              <ArrowRight className="h-4 w-4 text-slate-400 animate-pulse" />
          </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Consolidated Report Highlight Section */}
                    {consolidatedData ? (
                        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
                                     <div className="w-full md:w-1/2 space-y-4 md:space-y-6">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg w-fit">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            {content.dashboard.consolidated.title}
                                        </div>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{consolidatedData.archetype}</h2>
                                        <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                                            {consolidatedData.archetypeDesc}
                                        </p>
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health Index</p>
                                                <p className="text-2xl sm:text-3xl font-black text-indigo-600">{consolidatedData.overallScore}%</p>
                                            </div>
                                            <div className="h-8 sm:h-10 w-px bg-slate-100"></div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                <p className="text-base sm:text-lg font-black text-slate-700 uppercase">Proficient</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <Button 
                                              onClick={handleConsolidatedClick} 
                                              variant="primary" 
                                              size="md" 
                                              className="rounded-xl h-11 px-5 relative flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap"
                                            >
                                                <Eye className="h-4 w-4 flex-shrink-0" />
                                                <span>{content.dashboard.consolidated.button}</span>
                                                {!canAccess(userPlan, AccessLevel.PREMIUM) && (
                                                  <span className="inline-flex items-center justify-center rounded-full bg-purple-200 p-0.5 flex-shrink-0">
                                                    <Crown className="h-3 w-3 text-purple-600" />
                                                  </span>
                                                )}
                                            </Button>
                                            <Button 
                                              onClick={handlePDFDownload}
                                              variant="outline" 
                                              size="md" 
                                              className="rounded-xl h-11 px-5 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 relative flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap"
                                            >
                                                <FileText className="h-4 w-4 flex-shrink-0" />
                                                <span>{content.dashboard.consolidated.download}</span>
                                                {!canAccess(userPlan, AccessLevel.PRO) && (
                                                  <span className="inline-flex items-center justify-center rounded-full bg-blue-200 p-0.5 flex-shrink-0">
                                                    <Star className="h-3 w-3 text-blue-600" />
                                                  </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 h-[250px] sm:h-[300px] mt-6 md:mt-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={consolidatedData.radarData}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar name="Performance" dataKey="A" stroke="#4f46e5" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 text-center bg-white/50">
                             <div className="mx-auto mb-4 h-12 w-12 text-slate-300"><Layers className="h-full w-full" /></div>
                             <p className="text-slate-500 font-bold">{content.dashboard.consolidated.empty}</p>
                        </div>
                    )}

                    {/* Activity & AI Insights */}
                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{language === 'id' ? 'Tren Aktivitas' : 'Activity Trend'}</h2>
                                <p className="text-sm font-medium text-slate-500">Weekly performance summary</p>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <YAxis hide domain={[0, 'dataMax + 100']} />
                                    <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} cursor={{stroke: '#cbd5e1', strokeDasharray: '4 4'}} />
                                    <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorXp)" />
                                </AreaChart>
                             </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-8 flex items-center gap-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                           <Sparkles className="h-5 w-5 text-indigo-600" />
                           <div>
                              <p className="text-sm font-bold text-slate-900">{language === 'id' ? 'Wawasan AI' : 'AI Insight'}</p>
                              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                 {language === 'id' ? 'Performa stabil. Fokus pada manajemen energi minggu depan.' : 'Performance is stable. Focus on energy management next week.'}
                              </p>
                           </div>
                        </div>
                    </div>

                    {/* Prescriptions */}
                    <div>
                        <div className="mb-6 flex items-center justify-between px-1">
                            <h2 className="text-xl font-black text-slate-900">{content.dashboard.recommended}</h2>
                            <Link to="/catalog" className="text-sm font-bold text-blue-600 hover:underline">{content.dashboard.viewAll}</Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {tests.slice(0, 3).map((test) => (
                                <div key={test.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-900 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                          <PlayCircle className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{test.title}</h3>
                                            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mt-1">{test.category} • {test.durationMinutes} min</p>
                                        </div>
                                    </div>
                                    <Link to={`/test/${test.id}`} className="shrink-0">
                                        <Button size="md" variant="primary" className="rounded-xl h-12 px-8">
                                            {content.dashboard.start}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'history' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Consolidated Report Card */}
                    {consolidatedData && (
                        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 sm:p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-200/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                        <Layers className="h-6 w-6 sm:h-8 sm:w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{content.dashboard.consolidated.title}</span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">{consolidatedData.archetype}</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">{consolidatedData.archetypeDesc}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-indigo-100">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-2xl sm:text-3xl font-black text-indigo-600">{consolidatedData.overallScore}%</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.consolidated.overall}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button onClick={() => setShowConsolidated(true)} variant="primary" size="sm" className="rounded-xl h-10 sm:h-12 px-4 sm:px-6 flex-1 sm:flex-none text-xs sm:text-sm">
                                            <Eye className="mr-1.5 h-4 w-4" /> 
                                            <span className="hidden sm:inline">{content.dashboard.consolidated.button}</span>
                                            <span className="sm:hidden">{language === 'id' ? 'Lihat' : 'View'}</span>
                                        </Button>
                                        <Button onClick={handlePDFDownload} variant="outline" size="sm" className="rounded-xl h-10 sm:h-12 px-4 border-indigo-200 text-indigo-600 hover:bg-indigo-100">
                                            <Download className="h-4 w-4" />
                                            {!canAccess(userPlan, AccessLevel.PRO) && (
                                              <Star className="ml-1 h-3 w-3 text-blue-500" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Table */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                                    <History className="h-5 w-5 text-blue-600" />
                                    {content.dashboard.tabs.history}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">{language === 'id' ? `${history.length} diagnosa tercatat` : `${history.length} diagnostics recorded`}</p>
                            </div>
                        </div>
                        {isLoadingData ? (
                            <div className="p-8 sm:p-12 flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-sm font-bold text-slate-500">{language === 'id' ? 'Memuat riwayat...' : 'Loading history...'}</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <History className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{language === 'id' ? 'Belum Ada Riwayat' : 'No History Yet'}</h3>
                                <p className="text-sm text-slate-500 max-w-sm mb-6">{language === 'id' ? 'Mulai diagnosa pertama Anda untuk melihat riwayat di sini.' : 'Complete your first assessment to see your history here.'}</p>
                                <Link to="/catalog">
                                    <Button variant="primary" size="md" className="rounded-xl">
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        {language === 'id' ? 'Mulai Diagnosa' : 'Start Assessment'}
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Card View */}
                                <div className="block sm:hidden divide-y divide-slate-100">
                                    {history.map((res) => (
                                        <div key={res.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-slate-900 truncate">{res.testTitle}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{res.category}</p>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => setViewResult(res)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Eye className="h-4 w-4" /></button>
                                                    <button onClick={() => handleHistoryPDFDownload(res)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download className="h-4 w-4" /></button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs font-medium text-slate-500">{res.date}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{width: `${res.score}%`}}></div>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900">{res.score}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Desktop Table View */}
                                <table className="hidden sm:table min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 lg:px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.history.date}</th>
                                            <th className="px-4 lg:px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.history.test}</th>
                                            <th className="px-4 lg:px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.history.score}</th>
                                            <th className="px-4 lg:px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.history.action}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((res) => (
                                            <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 lg:px-8 py-4 lg:py-6 text-xs lg:text-sm font-bold text-slate-500 whitespace-nowrap">{res.date}</td>
                                                <td className="px-4 lg:px-8 py-4 lg:py-6">
                                                    <div className="text-xs lg:text-sm font-black text-slate-900">{res.testTitle}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{res.category}</div>
                                                </td>
                                                <td className="px-4 lg:px-8 py-4 lg:py-6">
                                                    <div className="flex items-center gap-2 lg:gap-3">
                                                        <span className="text-xs lg:text-sm font-black text-slate-900">{res.score}%</span>
                                                        <div className="h-1.5 lg:h-2 w-12 lg:w-16 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500" style={{width: `${res.score}%`}}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 lg:px-8 py-4 lg:py-6 text-right">
                                                    <div className="flex justify-end gap-1 lg:gap-2">
                                                        <button onClick={() => setViewResult(res)} className="p-1.5 lg:p-2 text-slate-400 hover:text-blue-600 transition-colors"><Eye className="h-4 lg:h-5 w-4 lg:w-5" /></button>
                                                        <button onClick={() => handleHistoryPDFDownload(res)} className="p-1.5 lg:p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download className="h-4 lg:h-5 w-4 lg:w-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-yellow-500" />
                                {content.dashboard.tabs.leaderboard}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">{language === 'id' ? 'Kompetisi mingguan para profesional' : 'Weekly competition among professionals'}</p>
                        </div>
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.leaderboard.rank}</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.leaderboard.user}</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.leaderboard.points}</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{content.dashboard.leaderboard.badges}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboard.map((item, idx) => (
                                    <tr key={item.id} className={`transition-colors ${item.isMe ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                        <td className="px-8 py-6">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-black text-sm ${
                                                idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                idx === 1 ? 'bg-slate-200 text-slate-700' :
                                                idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-50 text-slate-500'
                                            }`}>
                                                {idx === 0 ? <Crown className="h-5 w-5" /> : idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                {item.avatarUrl ? (
                                                    <img 
                                                        src={item.avatarUrl.startsWith('http') ? item.avatarUrl : `http://localhost:8000${item.avatarUrl}`}
                                                        alt={item.name}
                                                        className="h-12 w-12 rounded-full object-cover border-2 border-slate-200"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-lg text-white ${item.avatarUrl ? 'hidden' : ''}`}>
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                        {item.name}
                                                        {item.isMe && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-black">{language === 'id' ? 'Anda' : 'You'}</span>}
                                                    </div>
                                                    <div className="text-xs text-green-600 font-bold">{item.trend}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm font-black text-slate-900">{item.points.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-1 flex-wrap">
                                                {item.badgeList && item.badgeList.length > 0 ? (
                                                    item.badgeList.slice(0, 5).map((badge: any, i: number) => (
                                                        <div 
                                                            key={badge.id || i} 
                                                            className={`h-7 w-7 rounded-full flex items-center justify-center ${badge.color || 'bg-purple-100 text-purple-600'}`}
                                                            title={badge.name}
                                                        >
                                                            {getBadgeIcon(badge.icon)}
                                                        </div>
                                                    ))
                                                ) : item.badges > 0 ? (
                                                    Array.from({ length: Math.min(item.badges, 5) }).map((_, i) => (
                                                        <div key={i} className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                                            <Award className="h-3 w-3" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                                {item.badgeList && item.badgeList.length > 5 && (
                                                    <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                                        +{item.badgeList.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <ProfileTab 
                    user={user} 
                    language={language} 
                    content={content}
                    completedTests={completedTests}
                    avgScore={avgScore}
                    totalXP={totalXP}
                    currentStreak={currentStreak}
                />
            )}
        </div>

        {/* Sidebar - Scrollable on mobile with indicator */}
        <div className="relative lg:static">
            <div className="flex lg:flex-col gap-4 sm:gap-6 lg:gap-8 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-auto rounded-2xl sm:rounded-[2.5rem] border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                    <div className="mb-4 sm:mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-tight text-sm sm:text-base">
                            <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                            {content.dashboard.badges.title}
                        </h3>
                        <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{earnedBadges.length} / {totalBadges}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {earnedBadges.slice(0, 3).map(badge => (
                            <div key={badge.id} className={`flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center ring-1 ring-inset transition-all hover:scale-105 ${badge.color}`}>
                                {getBadgeIcon(badge.icon)}
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tight">{badge.name}</span>
                            </div>
                        ))}
                        {earnedBadges.length === 0 && (
                            <div className="col-span-2 flex flex-col items-center gap-2 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 sm:p-6 text-center">
                                <Lock className="h-5 w-5 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{language === 'id' ? 'Selesaikan tes untuk mendapat medali' : 'Complete tests to earn badges'}</span>
                            </div>
                        )}
                        {lockedBadges.slice(0, 4 - Math.min(earnedBadges.length, 3)).map(badge => (
                            <div key={badge.id} className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 sm:p-4 text-center group cursor-help" title={badge.criteria}>
                                <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                                <span className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-tight group-hover:text-slate-400 transition-colors">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Affiliate Card - Dynamic based on status */}
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-auto relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-slate-900 p-5 sm:p-8 text-white shadow-2xl">
                     <div className="relative z-10">
                        {!isAffiliate ? (
                          // Not registered
                          <>
                            <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-black">{content.dashboard.affiliateTitle}</h3>
                            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-400 leading-relaxed">
                              {language === 'id' 
                                ? `Bagikan perjalanan diagnostik Anda dan dapatkan komisi ${affiliateSettings?.commission_percentage || 10}%.`
                                : `Share your diagnostic journey and earn ${affiliateSettings?.commission_percentage || 10}% commission.`
                              }
                            </p>
                            <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl bg-white/5 p-3 sm:p-4 border border-white/10">
                              <p className="text-[10px] sm:text-xs font-medium text-slate-400">
                                {language === 'id' 
                                  ? `Dapatkan komisi ${affiliateSettings?.commission_percentage || 10}% dari setiap referral!`
                                  : `Earn ${affiliateSettings?.commission_percentage || 10}% commission from every referral!`
                                }
                              </p>
                            </div>
                            <Link to="/affiliate">
                              <Button variant="primary" size="lg" className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base">
                                  <Gift className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                  {language === 'id' ? 'Daftar Sekarang' : 'Register Now'}
                              </Button>
                            </Link>
                          </>
                        ) : !affiliateData?.is_active ? (
                          // Pending activation
                          <>
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-black">{language === 'id' ? 'Menunggu Aktivasi' : 'Pending Activation'}</h3>
                            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-400 leading-relaxed">
                              {language === 'id' 
                                ? 'Akun affiliate Anda sedang menunggu persetujuan admin.'
                                : 'Your affiliate account is pending admin approval.'
                              }
                            </p>
                            <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl bg-yellow-500/10 p-3 sm:p-4 border border-yellow-500/20">
                              <p className="text-[10px] sm:text-xs font-medium text-yellow-400">
                                {language === 'id' 
                                  ? 'Kode referral akan muncul setelah diaktifkan'
                                  : 'Referral code will appear after activation'
                                }
                              </p>
                            </div>
                            <Link to="/affiliate">
                              <Button variant="primary" size="lg" className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/30 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base">
                                  <Clock className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                  {language === 'id' ? 'Lihat Status' : 'View Status'}
                              </Button>
                            </Link>
                          </>
                        ) : (
                          // Active affiliate
                          <>
                            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-black">{content.dashboard.affiliateTitle}</h3>
                            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-400 leading-relaxed">
                              {language === 'id' 
                                ? `Bagikan perjalanan diagnostik Anda dan dapatkan komisi ${affiliateSettings?.commission_percentage || 10}%.`
                                : `Share your diagnostic journey and earn ${affiliateSettings?.commission_percentage || 10}% commission.`
                              }
                            </p>
                            <div className="mt-4 sm:mt-8 rounded-xl sm:rounded-2xl bg-white/5 p-3 sm:p-4 border border-white/10">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2">Referral Code</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-xs sm:text-sm font-black text-indigo-300">{affiliateData?.referral_code}</code>
                                    <button 
                                      className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white hover:text-indigo-300"
                                      onClick={() => {
                                        if (affiliateData?.referral_code) {
                                          navigator.clipboard.writeText(affiliateData.referral_code);
                                        }
                                      }}
                                    >
                                      {content.dashboard.copy}
                                    </button>
                                </div>
                            </div>
                            <Link to="/affiliate">
                              <Button variant="primary" size="lg" className="mt-4 sm:mt-8 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base">
                                  <ArrowUpRight className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                  {content.dashboard.viewEarnings}
                              </Button>
                            </Link>
                          </>
                        )}
                     </div>
                </div>
            </div>
            {/* Scroll indicator for mobile */}
            <div className="absolute right-0 top-0 bottom-2 bg-gradient-to-l from-background via-background to-transparent w-10 pointer-events-none lg:hidden flex items-center justify-end pr-1">
                <ArrowRight className="h-4 w-4 text-slate-400 animate-pulse" />
            </div>
        </div>
      </div>

      <Modal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} title="">
          <div className="text-center p-4">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl">
                  <Rocket className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-3xl font-black text-slate-900 leading-tight">
                {content.dashboard.onboarding.title.replace('{name}', user.name)}
              </h2>
              <p className="mx-auto mb-10 max-w-sm text-lg font-medium text-slate-600">
                {content.dashboard.onboarding.subtitle}
              </p>
              <Button 
                variant="gradient" 
                size="lg" 
                className="w-full h-16 rounded-2xl"
                onClick={() => {
                  setShowOnboarding(false);
                  navigate('/catalog');
                }}
              >
                  {content.dashboard.onboarding.cta} <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
          </div>
      </Modal>

      <Modal
        isOpen={showConsolidated}
        onClose={() => setShowConsolidated(false)}
        title={content.dashboard.consolidated.title}
      >
        {consolidatedData ? (
            <div className="space-y-6 sm:space-y-8">
                {/* Hero Section with Animated Background */}
                <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_50%)]"></div>
                        <div className="absolute top-0 left-0 w-40 sm:w-72 h-40 sm:h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-pink-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    <div className="relative z-10 p-5 sm:p-10 text-white">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full">
                                <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-yellow-300" />
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Your Archetype</span>
                            </div>
                        </div>
                        
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 leading-tight">{consolidatedData.archetype}</h2>
                        <p className="text-white/80 text-sm sm:text-lg leading-relaxed max-w-lg">{consolidatedData.archetypeDesc}</p>
                        
                        {/* Stats Grid - Responsive */}
                        <div className="mt-6 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                                <span className="text-[8px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1 sm:mb-2">Health Index</span>
                                <div className="flex items-baseline gap-0.5 sm:gap-1">
                                    <span className="text-xl sm:text-4xl font-black">{consolidatedData.overallScore}</span>
                                    <span className="text-sm sm:text-xl font-bold text-white/60">%</span>
                                </div>
                                <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full" style={{width: `${consolidatedData.overallScore}%`}}></div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                                <span className="text-[8px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1 sm:mb-2">Diagnoses</span>
                                <div className="flex items-baseline gap-0.5 sm:gap-1">
                                    <span className="text-xl sm:text-4xl font-black">{history.length}</span>
                                    <span className="text-[10px] sm:text-sm font-bold text-white/60">tests</span>
                                </div>
                                <div className="mt-2 sm:mt-3 flex gap-0.5 sm:gap-1">
                                    {Array.from({length: Math.min(history.length, 8)}).map((_, i) => (
                                        <div key={i} className="h-1 sm:h-1.5 flex-1 bg-white/40 rounded-full"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                                <span className="text-[8px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1 sm:mb-2">Status</span>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="h-2 sm:h-3 w-2 sm:w-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs sm:text-lg font-black uppercase">Proficient</span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-white/60 mt-1 sm:mt-2 hidden sm:block">Top 25% performers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Radar Chart Section - Enhanced & Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                    <div className="lg:col-span-3 rounded-2xl sm:rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 sm:w-40 h-20 sm:h-40 bg-indigo-100/50 rounded-full blur-3xl -mr-5 sm:-mr-10 -mt-5 sm:-mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-16 sm:w-32 h-16 sm:h-32 bg-purple-100/50 rounded-full blur-3xl -ml-5 sm:-ml-10 -mb-5 sm:-mb-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                                <div>
                                    <h4 className="text-base sm:text-lg font-black text-slate-900">{content.dashboard.consolidated.byCategory}</h4>
                                    <p className="text-xs sm:text-sm text-slate-500">Performance across all dimensions</p>
                                </div>
                                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 rounded-full w-fit">
                                    <div className="h-2 sm:h-2.5 w-2 sm:w-2.5 bg-indigo-500 rounded-full"></div>
                                    <span className="text-[10px] sm:text-xs font-bold text-indigo-600">Your Score</span>
                                </div>
                            </div>
                            <div className="h-[220px] sm:h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={consolidatedData.radarData}>
                                        <defs>
                                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.4}/>
                                            </linearGradient>
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                                        <PolarAngleAxis 
                                            dataKey="subject" 
                                            tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} 
                                            tickLine={false}
                                        />
                                        <PolarRadiusAxis 
                                            angle={30} 
                                            domain={[0, 100]} 
                                            tick={{ fill: '#94a3b8', fontSize: 8 }} 
                                            axisLine={false}
                                            tickCount={5}
                                        />
                                        <Radar 
                                            name="Performance" 
                                            dataKey="A" 
                                            stroke="#6366f1" 
                                            strokeWidth={2} 
                                            fill="url(#radarGradient)" 
                                            fillOpacity={0.6}
                                            filter="url(#glow)"
                                            dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '12px', 
                                                border: 'none', 
                                                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                                                padding: '8px 12px',
                                                fontSize: '12px'
                                            }}
                                            formatter={(value: number) => [`${value}%`, 'Score']}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    
                    {/* Category Breakdown - Responsive */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <ThumbsUp className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-green-500" />
                                {content.dashboard.consolidated.strengths}
                            </h4>
                            <div className="space-y-2 sm:space-y-3">
                                {consolidatedData.strengths.map((s, idx) => (
                                    <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-100">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-green-500 flex items-center justify-center text-white font-black text-xs sm:text-sm shrink-0">
                                            {s.A}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{s.subject}</p>
                                            <div className="mt-1 h-1 sm:h-1.5 bg-green-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{width: `${s.A}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <Lightbulb className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-amber-500" />
                                {content.dashboard.consolidated.weaknesses}
                            </h4>
                            <div className="space-y-2 sm:space-y-3">
                                {consolidatedData.weaknesses.map((w, idx) => (
                                    <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg sm:rounded-xl border border-amber-100">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-xs sm:text-sm shrink-0">
                                            {w.A}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{w.subject}</p>
                                            <div className="mt-1 h-1 sm:h-1.5 bg-amber-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{width: `${w.A}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trend Chart - Enhanced & Responsive */}
                <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 gap-2">
                        <div>
                            <h4 className="text-base sm:text-lg font-black text-slate-900">{content.dashboard.consolidated.trend}</h4>
                            <p className="text-xs sm:text-sm text-slate-500">Your performance journey over time</p>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-green-50 rounded-full w-fit">
                            <TrendingUp className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-green-600" />
                            <span className="text-xs sm:text-sm font-bold text-green-600">+12% this month</span>
                        </div>
                    </div>
                    <div className="h-[150px] sm:h-[200px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={consolidatedData.trendData}>
                                <defs>
                                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                                <YAxis hide domain={[0, 100]} />
                                <RechartsTooltip 
                                    contentStyle={{
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                                        padding: '8px 12px',
                                        fontSize: '12px'
                                    }} 
                                    formatter={(value: number) => [`${value}%`, 'Score']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#10b981" 
                                    strokeWidth={3} 
                                    fill="url(#trendGradient)"
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3, stroke: '#fff' }}
                                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                />
                            </AreaChart>
                         </ResponsiveContainer>
                    </div>
                </div>

                {/* Action Buttons - Responsive */}
                <div className="flex gap-2 sm:gap-4">
                    <Button variant="secondary" onClick={() => setShowConsolidated(false)} className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                        {content.feedback.close}
                    </Button>
                    <Button variant="gradient" onClick={() => alert('PDF')} className="flex-[2] h-11 sm:h-14 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30 text-sm sm:text-base">
                        <Download className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                        {content.dashboard.consolidated.download}
                    </Button>
                </div>
            </div>
        ) : (
            <div className="py-20 text-center">
                <AlertCircle className="mx-auto mb-6 h-10 w-10 text-slate-300" />
                <p className="text-lg font-bold text-slate-500">{content.dashboard.consolidated.empty}</p>
                <Link to="/catalog">
                    <Button variant="primary" className="mt-6">Mulai Diagnosa Sekarang</Button>
                </Link>
            </div>
        )}
      </Modal>

      <Modal 
        isOpen={!!viewResult} 
        onClose={() => setViewResult(null)}
        title={content.dashboard.modal.summary}
      >
          {viewResult && (
              <div className="space-y-8">
                  <div className="flex flex-col items-center">
                      <div className="h-32 w-32 rounded-full border-8 border-slate-50 bg-white shadow-xl flex items-center justify-center text-4xl font-black text-slate-900">
                          {viewResult.score}
                      </div>
                      <h3 className="mt-6 text-2xl font-black text-slate-900">{viewResult.testTitle}</h3>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">{viewResult.date}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                      <Button onClick={() => alert('PDF')} className="w-full h-14 rounded-2xl">
                          <Download className="mr-2 h-5 w-5" /> {content.dashboard.modal.download}
                      </Button>
                  </div>
              </div>
          )}
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        requiredLevel={upgradeLevel}
      />

      {/* Success Toast Notification */}
      {showSaveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-4 bg-white border border-green-200 rounded-2xl px-6 py-4 shadow-xl shadow-green-100/50">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-black text-slate-900">
                {language === 'id' ? 'Rekam Medis Tersimpan!' : 'Medical Record Saved!'}
              </p>
              <p className="text-sm text-slate-500">
                {language === 'id' ? 'File PDF berhasil diunduh ke perangkat Anda.' : 'PDF file downloaded to your device.'}
              </p>
            </div>
            <button 
              onClick={() => setShowSaveSuccess(false)}
              className="ml-2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
