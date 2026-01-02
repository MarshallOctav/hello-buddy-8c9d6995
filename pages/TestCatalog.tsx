import React, { useState, useEffect } from 'react';
import { getMockTests } from '../constants';
import { TestCategory, AccessLevel } from '../types';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Lock, Clock, Tag, BookOpen, Search, Sparkles, Trophy, Activity, Target, Flame, Star, Crown, CheckCircle2 } from 'lucide-react';
import { UpgradeModal } from '../components/UpgradeModal';
import { canAccess } from '../components/FeatureLock';
import { getTestHistory, TestHistoryItem, getUserStats, UserStats } from '../services/api';

// Import category images
import categoryFinance from '../src/assets/category-finance.png';
import categoryBusiness from '../src/assets/category-business.png';
import categoryProductivity from '../src/assets/category-productivity.png';
import categoryLeadership from '../src/assets/category-leadership.png';
import categoryWellbeing from '../src/assets/category-wellbeing.png';
import categoryMeta from '../src/assets/category-meta.png';

export const TestCatalog = () => {
  const { user } = useAuth();
  const { content, language } = useLanguage();
  const allTests = getMockTests(language);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState<AccessLevel>(AccessLevel.PRO);
  const [userTestScores, setUserTestScores] = useState<Record<string, { score: number; level: string }>>({});
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const userPlan = user?.plan || AccessLevel.FREE;

  // Fetch user's test history and stats to show their scores
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const [historyResponse, statsResponse] = await Promise.all([
          getTestHistory(),
          getUserStats()
        ]);
        
        if (historyResponse.success && historyResponse.data) {
          // Create a map of test_id to latest score
          const scoresMap: Record<string, { score: number; level: string }> = {};
          historyResponse.data.forEach((item: TestHistoryItem) => {
            // Keep the latest score for each test (assuming data is sorted by date desc)
            if (!scoresMap[item.test_id]) {
              scoresMap[item.test_id] = { score: item.score, level: item.level };
            }
          });
          setUserTestScores(scoresMap);
        }
        
        if (statsResponse.success && statsResponse.data) {
          setUserStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLockedClick = (requiredLevel: AccessLevel) => {
    setUpgradeLevel(requiredLevel);
    setShowUpgradeModal(true);
  };

  const filteredTests = allTests.filter(t => {
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        t.title.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...Object.values(TestCategory)];

  // Helper to get color per category for visuals
  const getCategoryColor = (cat: TestCategory) => {
      switch(cat) {
          case TestCategory.FINANCE: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
          case TestCategory.BUSINESS: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
          case TestCategory.PRODUCTIVITY: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
          case TestCategory.LEADERSHIP: return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
          default: return 'bg-muted text-muted-foreground';
      }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Reusable Dynamic Header */}
      <PageHeader
        title={content.catalog.title}
        subtitle="Select your next diagnostic test to unlock new insights."
        badge={
          user && <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-200 ring-1 ring-inset ring-indigo-500/30">
                Catalog
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <Sparkles className="h-3 w-3 text-yellow-500" /> {user.plan} Member
            </span>
          </div>
        }
        bottomContent={
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
                type="text" 
                className="block w-full rounded-2xl border border-white/30 bg-white/95 dark:bg-slate-800/90 backdrop-blur-md py-4 pl-12 pr-4 text-foreground shadow-2xl placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" 
                placeholder="Search diagnostics by name, category, or skill..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      >
        {user && (
            <div className="flex flex-1 w-full lg:max-w-xl gap-2 sm:gap-4">
                 <div className="flex-1 rounded-xl sm:rounded-2xl bg-white/10 p-2 sm:p-4 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 text-blue-300"><BookOpen className="h-3 w-3 sm:h-4 sm:w-4" /></div>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">Tests</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white">{userStats?.completed_tests ?? user.stats?.testsTaken ?? 0}</div>
                 </div>
                 <div className="flex-1 rounded-xl sm:rounded-2xl bg-white/10 p-2 sm:p-4 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20 text-green-300"><Target className="h-3 w-3 sm:h-4 sm:w-4" /></div>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">Avg Score</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white">{userStats?.avg_score ?? user.stats?.avgScore ?? 0}%</div>
                 </div>
                 <div className="flex-1 rounded-xl sm:rounded-2xl bg-white/10 p-2 sm:p-4 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-500/20 text-yellow-300"><Trophy className="h-3 w-3 sm:h-4 sm:w-4" /></div>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">XP</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white">{userStats?.total_xp ?? user.stats?.xp ?? 0}</div>
                 </div>
              </div>
        )}
      </PageHeader>

      {/* Filters - Dropdown on mobile, buttons on desktop */}
      <div className="mb-10">
        {/* Mobile Dropdown */}
        <div className="block sm:hidden px-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? content.catalog.filterAll : cat}
              </option>
            ))}
          </select>
        </div>
        
        {/* Desktop Buttons */}
        <div className="hidden sm:flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 transform scale-105' 
                  : 'bg-white dark:bg-slate-800/50 text-muted-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {cat === 'All' ? content.catalog.filterAll : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map(test => {
          const isLocked = !canAccess(userPlan, test.accessLevel);
          const isPro = test.accessLevel === AccessLevel.PRO;
          const isPremium = test.accessLevel === AccessLevel.PREMIUM;
          const catColor = getCategoryColor(test.category);
          const userScore = userTestScores[test.id];
          
          return (
            <div 
              key={test.id} 
              className="group flex flex-col rounded-3xl bg-white dark:bg-slate-800/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              onClick={() => isLocked && handleLockedClick(test.accessLevel)}
            >
              <div className="relative h-40 overflow-hidden">
                {/* Category Image */}
                <img 
                  src={
                    test.category === TestCategory.FINANCE ? categoryFinance : 
                    test.category === TestCategory.BUSINESS ? categoryBusiness :
                    test.category === TestCategory.PRODUCTIVITY ? categoryProductivity : 
                    test.category === TestCategory.LEADERSHIP ? categoryLeadership :
                    test.category === TestCategory.WELLBEING ? categoryWellbeing :
                    test.category === TestCategory.META ? categoryMeta : categoryBusiness
                  }
                  alt={test.category}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent"></div>
                {/* User Score Badge - if user has completed this test */}
                {userScore && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{userScore.score}%</span>
                  </div>
                )}
                {/* Access Level Badge with Icon */}
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg ${
                  test.accessLevel === AccessLevel.FREE 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : isPro
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  {isPro && <Star className="h-3 w-3" />}
                  {isPremium && <Crown className="h-3 w-3" />}
                  {test.accessLevel}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${catColor}`}>
                        {test.category}
                    </span>
                    {/* Feature Lock Badge */}
                    {isLocked && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLockedClick(test.accessLevel);
                        }}
                        className={`inline-flex items-center justify-center rounded-full p-1 transition-all hover:scale-110 ${
                          isPro 
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50' 
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
                        }`}
                        title={isPro ? 'Pro Feature' : 'Premium Feature'}
                      >
                        {isPro ? <Star className="h-3 w-3" /> : <Crown className="h-3 w-3" />}
                      </button>
                    )}
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{test.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{test.description}</p>
                
                {/* Methodology Badge / Section */}
                <div className="mb-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 p-3 transition-all group-hover:from-indigo-50 group-hover:to-blue-50 dark:group-hover:from-indigo-900/20 dark:group-hover:to-blue-900/20">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
                             <BookOpen className="h-3 w-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">{content.catalog.basedOn}</span>
                    </div>
                    <div className="ml-1">
                        <p className="text-xs font-bold text-foreground leading-snug">{test.methodology.name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">by {test.methodology.author}</p>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between text-xs font-medium text-muted-foreground mb-5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {test.durationMinutes} {content.catalog.min}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> {test.questions.length} Qs
                  </div>
                </div>

                {isLocked ? (
                  <Button 
                    className="w-full justify-between shadow-none group-hover:shadow-lg transition-all" 
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLockedClick(test.accessLevel);
                    }}
                  >
                    <span>{content.catalog.unlock}</span>
                    {isPro ? <Star className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  </Button>
                ) : (
                  <Link to={`/test/${test.id}`} className="w-full">
                    <Button 
                      className="w-full shadow-none group-hover:shadow-lg transition-all" 
                      variant="primary"
                    >
                      {content.catalog.start}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        requiredLevel={upgradeLevel}
      />
    </div>
  );
};
