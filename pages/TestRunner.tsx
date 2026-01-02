
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMockTests } from '../constants';
import { useLanguage } from '../services/languageContext';
import { useAuth } from '../services/authContext';
import { saveTestResult, checkAndAwardBadges } from '../services/api';
import Button from '../components/Button';
import { 
  ChevronRight, ChevronLeft, BookOpen, Library, User as UserIcon, Clock, Hash, PlayCircle, 
  BarChart, Sparkles, Info, ShieldCheck, CheckCircle2,
  Eye, Zap, Repeat, Wallet, Compass, GitBranch, Shield, Wrench, Search, Map, Gauge, Scale, TrendingUp, Users, Target
} from 'lucide-react';
import { TestCategory, QuestionType } from '../types';
import { calculateFinancialHealth, formatCurrency, parseCurrency, FinancialHealthInput } from '../utils/financialHealthScoring';
import { calculateFinancialFreedom, FIInput, formatFICurrency } from '../utils/financialFreedomScoring';
import { calculateRiskTolerance } from '../utils/riskToleranceScoring';

export const TestRunner = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content, language } = useLanguage();
  const { user } = useAuth();
  const tests = getMockTests(language);
  const test = tests.find(t => t.id === id);

  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!test) navigate('/catalog');
  }, [test, navigate]);

  if (!test) return null;

  // Helper for category styles
  const getCategoryStyle = (cat: TestCategory) => {
    switch (cat) {
      case TestCategory.FINANCE: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case TestCategory.BUSINESS: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case TestCategory.PRODUCTIVITY: return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case TestCategory.LEADERSHIP: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Helper to get relevant icon based on question text keywords
  const getQuestionIcon = (text: string) => {
    const lower = text.toLowerCase();
    
    // Vision / Clarity
    if (lower.includes('vision') || lower.includes('visi') || lower.includes('clarity') || lower.includes('kejelasan')) 
      return <Eye className="h-6 w-6" />;
    
    // Execution / Action
    if (lower.includes('execution') || lower.includes('eksekusi') || lower.includes('action')) 
      return <Zap className="h-6 w-6" />;
    
    // Habits / Consistency
    if (lower.includes('habit') || lower.includes('kebiasaan') || lower.includes('consisten') || lower.includes('konsisten')) 
      return <Repeat className="h-6 w-6" />;
    
    // Finance
    if (lower.includes('financ') || lower.includes('finansial') || lower.includes('money')) 
      return <Wallet className="h-6 w-6" />;
    
    // Strategy
    if (lower.includes('strateg') || lower.includes('plan') || lower.includes('perencanaan')) 
      return <Compass className="h-6 w-6" />;
    
    // Adaptability
    if (lower.includes('adapt') || lower.includes('change') || lower.includes('perubahan')) 
      return <GitBranch className="h-6 w-6" />;
    
    // Resilience
    if (lower.includes('resilien') || lower.includes('ketahanan') || lower.includes('pressure') || lower.includes('tekanan')) 
      return <Shield className="h-6 w-6" />;
    
    // Tools / Resources
    if (lower.includes('tool') || lower.includes('alat') || lower.includes('access') || lower.includes('akses')) 
      return <Wrench className="h-6 w-6" />;
    
    // Knowledge
    if (lower.includes('knowledge') || lower.includes('pengetahuan') || lower.includes('learn')) 
      return <BookOpen className="h-6 w-6" />;

    // Review
    if (lower.includes('review') || lower.includes('tinjauan') || lower.includes('audit')) 
      return <Search className="h-6 w-6" />;

    // Efficiency
    if (lower.includes('efficien') || lower.includes('efisiensi') || lower.includes('speed')) 
      return <Gauge className="h-6 w-6" />;

    // Balance
    if (lower.includes('balance') || lower.includes('seimbang') || lower.includes('life')) 
      return <Scale className="h-6 w-6" />;

    // Growth
    if (lower.includes('growth') || lower.includes('tumbuh') || lower.includes('mindset')) 
      return <TrendingUp className="h-6 w-6" />;

    // People / Support
    if (lower.includes('support') || lower.includes('dukung') || lower.includes('team') || lower.includes('tim')) 
      return <Users className="h-6 w-6" />;

    // Default
    return <Target className="h-6 w-6" />;
  };

  // Intro Screen
  if (!hasStarted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Interactive Dynamic Header */}
        <div className="group relative mb-8 overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl sm:p-12 animate-fade-in">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px] transition-all duration-1000 group-hover:bg-blue-600/30 group-hover:scale-110"></div>
                <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px] transition-all duration-1000 group-hover:bg-indigo-600/30 group-hover:scale-110"></div>
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[80px] opacity-0 transition-opacity duration-1000 group-hover:opacity-100"></div>
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                    {/* Meta Tags */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${getCategoryStyle(test.category)}`}>
                            {test.category}
                        </span>
                        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                            <Clock className="h-3.5 w-3.5 text-blue-400" /> 
                            {test.durationMinutes} min
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> 
                            Pro Diagnostic
                        </div>
                    </div>

                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                        {test.title}
                    </h1>
                    
                    <p className="mb-8 text-lg leading-relaxed text-slate-300">
                        {test.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                         <Button 
                            size="lg" 
                            variant="gradient" 
                            onClick={() => setHasStarted(true)} 
                            className="h-14 rounded-2xl px-10 text-base shadow-xl shadow-blue-500/20 hover:scale-105 hover:shadow-blue-500/30 ring-1 ring-white/20"
                         >
                            {content.runner.intro.start} <PlayCircle className="ml-2 h-5 w-5 fill-current" />
                         </Button>
                         
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-400 px-4">
                            <Info className="h-4 w-4" />
                            <span>100% Confidential</span>
                         </div>
                    </div>
                </div>

                {/* Right Side Stats/Visual */}
                <div className="hidden lg:block">
                    <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:bg-white/10">
                         <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-1">
                                 <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-white">{test.questions.length}</span>
                                    <span className="text-sm font-medium text-slate-500">items</span>
                                 </div>
                             </div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Time</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-white">~{test.durationMinutes}</span>
                                    <span className="text-sm font-medium text-slate-500">min</span>
                                 </div>
                             </div>
                             <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                                 <div className="flex items-center gap-3">
                                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                                        <ShieldCheck className="h-5 w-5" />
                                     </div>
                                     <div>
                                         <p className="text-xs font-bold text-white">Expert Verified</p>
                                         <p className="text-[10px] text-slate-400">{test.methodology.name}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Methodology Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Library className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{content.result.methodology.title}</h2>
            </div>
            
            <div className="space-y-6">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                     <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                        <BookOpen className="h-3.5 w-3.5" /> {content.result.methodology.source}
                     </div>
                     <p className="font-bold text-slate-900">{test.methodology.name}</p>
                     <p className="text-sm text-slate-500 mt-1">{test.methodology.source}</p>
                  </div>
                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                     <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                        <UserIcon className="h-3.5 w-3.5" /> {content.result.methodology.author}
                     </div>
                     <p className="font-bold text-slate-900">{test.methodology.author}</p>
                     <p className="text-sm text-slate-500 mt-1">Research Lead</p>
                  </div>
               </div>
               
               <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 border border-slate-100">
                 <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    {content.result.methodology.why}
                 </h4>
                 <p className="text-sm leading-7 text-slate-600 font-medium">{test.methodology.description}</p>
               </div>
            </div>
          </div>

          {/* Tips / Info */}
          <div className="space-y-6">
             <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Before you start</h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green-100 text-green-600">
                            <span className="text-xs font-bold">1</span>
                        </div>
                        <p className="text-sm text-slate-600">Answer honestly. There are no right or wrong answers.</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green-100 text-green-600">
                            <span className="text-xs font-bold">2</span>
                        </div>
                        <p className="text-sm text-slate-600">Complete in one sitting for the most accurate results.</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green-100 text-green-600">
                            <span className="text-xs font-bold">3</span>
                        </div>
                        <p className="text-sm text-slate-600">Your results are generated immediately after completion.</p>
                    </li>
                </ul>
             </div>
             
             <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-indigo-200 shrink-0" />
                    <p className="text-sm font-medium leading-relaxed text-indigo-50">
                        This test adapts to your profile. Pro members get a detailed PDF report including a 30-day action plan.
                    </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Question Runner
  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    if (!test) return;
    
    try {
      let percentage: number;
      let level: string;
      let dimensionScores: Array<{ subject: string; score: number }> = [];
      let financialHealthData: any = undefined;
      let financialFreedomData: any = undefined;
      let riskToleranceData: any = undefined;

      // Check if this is the Financial Health test (t1) with currency inputs
      const isFinancialHealthTest = test.id === 't1' && test.questions[0]?.type === QuestionType.CURRENCY_INPUT;
      
      // Check if this is Financial Freedom Progress Index (t15)
      const isFinancialFreedomTest = test.id === 't15';
      
      // Check if this is Investment Risk Tolerance (t26)
      const isRiskToleranceTest = test.id === 't26';
      
      if (isFinancialHealthTest) {
        // Use 50/30/20 algorithm for Financial Health test
        const input: FinancialHealthInput = {
          income: answers['fin_income'] || 0,
          housing: answers['fin_housing'] || 0,
          food: answers['fin_food'] || 0,
          transport: answers['fin_transport'] || 0,
          utilities: answers['fin_utilities'] || 0,
          mandatory_debt: answers['fin_mandatory_debt'] || 0,
          lifestyle_wants: answers['fin_lifestyle_wants'] || 0,
          entertainment: answers['fin_entertainment'] || 0,
          savings: answers['fin_savings'] || 0,
          extra_debt_payoff: answers['fin_extra_debt_payoff'] || 0
        };
        
        const result = calculateFinancialHealth(input, language);
        percentage = result.score;
        level = result.category;
        
        // Store dimension scores for radar chart
        dimensionScores = [
          { subject: language === 'id' ? 'Kebutuhan' : 'Needs', score: Math.max(0, 100 - Math.abs(result.percentages.needs - 50) * 2) },
          { subject: language === 'id' ? 'Keinginan' : 'Wants', score: Math.max(0, 100 - Math.abs(result.percentages.wants - 30) * 2) },
          { subject: language === 'id' ? 'Tabungan' : 'Savings', score: Math.min(100, result.percentages.savings * 5) }
        ];
        
        // Store financial health data for result page
        financialHealthData = {
          percentages: result.percentages,
          ideal: result.ideal,
          insights: result.insights,
          rawValues: result.rawValues,
          categoryKey: result.categoryKey
        };
      } else if (isFinancialFreedomTest) {
        // Use FIRE algorithm for Financial Freedom Progress Index
        const input: FIInput = {
          monthly_income: answers['fi_income'] || 0,
          current_expenses: answers['fi_current_expenses'] || 0,
          target_fi_expenses: answers['fi_target_expenses'] || 0,
          total_investments: answers['fi_investments'] || 0,
          monthly_savings: answers['fi_monthly_savings'] || 0,
          current_age: answers['fi_current_age'] || 30,
          target_fi_age: answers['fi_target_age'] || 55,
          expected_return: answers['fi_expected_return'] || 7,
          consumer_debt: answers['fi_consumer_debt'] || 0,
          annual_large_expenses: answers['fi_annual_large_expenses'] || 0,
          passive_income: answers['fi_passive_income'] || 0,
          dependents: answers['fi_dependents'] || 0
        };
        
        const result = calculateFinancialFreedom(input, language);
        percentage = result.score;
        level = result.category;
        
        // Store dimension scores for display
        dimensionScores = [
          { subject: language === 'id' ? 'Progres FI' : 'FI Progress', score: Math.round(result.progress_percent) },
          { subject: language === 'id' ? 'Tingkat Tabungan' : 'Savings Rate', score: Math.min(100, Math.round(result.savings_rate * 2)) },
          { subject: language === 'id' ? 'Pendapatan Pasif' : 'Passive Income', score: Math.min(100, Math.round((input.passive_income / (input.target_fi_expenses || 1)) * 100)) },
          { subject: language === 'id' ? 'Timeline' : 'Timeline', score: result.years_to_fi <= (input.target_fi_age - input.current_age) ? 100 : Math.max(0, 100 - (result.years_to_fi - (input.target_fi_age - input.current_age)) * 5) }
        ];
        
        // Store financial freedom data for result page
        financialFreedomData = {
          score: result.score,
          category: result.category,
          categoryKey: result.categoryKey,
          progress_percent: result.progress_percent,
          fi_number: result.fi_number,
          current_net_worth: result.current_net_worth,
          savings_rate: result.savings_rate,
          years_to_fi: result.years_to_fi,
          desired_fi_age: result.desired_fi_age,
          projected_fi_age: result.projected_fi_age,
          annual_fi_expenses: result.annual_fi_expenses,
          insights: result.insights
        };
      } else if (isRiskToleranceTest) {
        // Use MPT algorithm for Risk Tolerance
        const riskAnswers = test.questions.map(q => answers[q.id] || 3);
        
        const result = calculateRiskTolerance(riskAnswers, language);
        percentage = result.normalized_score;
        level = result.profile;
        
        // Store dimension scores
        dimensionScores = [
          { subject: language === 'id' ? 'Toleransi Risiko' : 'Risk Tolerance', score: Math.round((riskAnswers[2] + riskAnswers[3] + riskAnswers[7] + riskAnswers[9]) / 4 * 20) },
          { subject: language === 'id' ? 'Horizon Waktu' : 'Time Horizon', score: Math.round((riskAnswers[0] + riskAnswers[1]) / 2 * 20) },
          { subject: language === 'id' ? 'Kapasitas Risiko' : 'Risk Capacity', score: Math.round((riskAnswers[5] + riskAnswers[6] + riskAnswers[8]) / 3 * 20) },
          { subject: language === 'id' ? 'Pengetahuan' : 'Knowledge', score: Math.round(riskAnswers[4] * 20) }
        ];
        
        // Store risk tolerance data for result page
        riskToleranceData = {
          total_score: result.total_score,
          normalized_score: result.normalized_score,
          profile: result.profile,
          profileKey: result.profileKey,
          description: result.description,
          asset_allocation: result.asset_allocation,
          insights: result.insights
        };
      } else {
        // Standard Likert scoring for other tests
        const values = test.questions.map(q => {
          const rawValue = answers[q.id] || 0;
          if (q.reverse && rawValue > 0) {
            return 6 - rawValue;
          }
          return rawValue;
        });
        
        const totalScore = values.reduce((a, b) => a + b, 0);
        const maxScore = test.questions.length * 5; 
        percentage = Math.round((totalScore / maxScore) * 100);
        
        level = percentage >= 90 ? 'Expert' : 
                percentage >= 70 ? 'High' : 
                percentage >= 50 ? 'Medium' : 'Low';
        
        // Calculate dimension scores if test has dimensions
        if (test.dimensions) {
          test.dimensions.forEach(dim => {
            const dimQuestions = test.questions.filter((_, idx) => 
              idx % test.dimensions!.length === test.dimensions!.indexOf(dim)
            );
            const dimTotal = dimQuestions.reduce((acc, q) => {
              const rawVal = answers[q.id] || 0;
              return acc + (q.reverse && rawVal > 0 ? 6 - rawVal : rawVal);
            }, 0);
            const dimScore = dimQuestions.length > 0 
              ? Math.round((dimTotal / (dimQuestions.length * 5)) * 100)
              : percentage;
            dimensionScores.push({
              subject: dim.label[language],
              score: dimScore
            });
          });
        }
      }
      
      // Save to backend if user is logged in
      if (user) {
        const result = await saveTestResult({
          test_id: test.id,
          test_title: test.title,
          category: test.category,
          score: percentage,
          level,
          answers,
          dimension_scores: dimensionScores.length > 0 ? dimensionScores : undefined
        });
        
        if (!result.success) {
          console.error('Failed to save test result:', result.message);
        } else {
          try {
            await checkAndAwardBadges();
          } catch (badgeError) {
            console.error('Failed to check badges:', badgeError);
          }
        }
      }
      
      // Navigate with appropriate data
      const queryParams = new URLSearchParams({ score: String(percentage) });
      if (financialHealthData) {
        queryParams.set('fh', btoa(JSON.stringify(financialHealthData)));
      }
      if (financialFreedomData) {
        queryParams.set('fi', btoa(JSON.stringify(financialFreedomData)));
      }
      if (riskToleranceData) {
        queryParams.set('rt', btoa(JSON.stringify(riskToleranceData)));
      }
      
      navigate(`/result/${test.id}?${queryParams.toString()}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      setSubmitError(language === 'id' ? 'Gagal menyimpan hasil. Silakan coba lagi.' : 'Failed to save result. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Currency input handler
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseCurrency(e.target.value);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: rawValue }));
  };

  // Check if current question requires special input
  const isCurrencyQuestion = currentQuestion.type === QuestionType.CURRENCY_INPUT;
  const isNumberQuestion = currentQuestion.type === QuestionType.NUMBER_INPUT;
  const isMultipleChoice = currentQuestion.type === QuestionType.MULTIPLE_CHOICE;
  const hasAnswer = currentAnswer !== undefined && (isCurrencyQuestion || isNumberQuestion ? currentAnswer > 0 : true);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700">{currentQuestionIndex + 1}</span>
            <span className="text-slate-400">/ {test.questions.length}</span>
          </span>
          <span className="uppercase tracking-wider text-xs">{test.category}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="relative overflow-visible rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-slate-50 opacity-50 blur-3xl"></div>
        
        {/* Floating Context Icon */}
        <div className="absolute -top-6 left-8 sm:left-10 z-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg ring-4 ring-white transition-all duration-300 hover:scale-110 hover:shadow-xl">
                 {getQuestionIcon(currentQuestion.text)}
            </div>
        </div>

        <div className="relative z-10 pt-4">
            <h2 className="mb-10 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
            {currentQuestion.text}
            </h2>

            <div className="space-y-8">
            {currentQuestion.type === QuestionType.CURRENCY_INPUT ? (
              // Currency Input UI
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentAnswer ? formatCurrency(currentAnswer) : ''}
                    onChange={handleCurrencyChange}
                    placeholder={(currentQuestion as any).placeholder || '0'}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white py-5 pl-14 pr-6 text-2xl font-bold text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>
                <p className="text-center text-sm text-slate-500">
                  {language === 'id' ? 'Masukkan nominal dalam Rupiah' : 'Enter amount in Rupiah'}
                </p>
              </div>
            ) : currentQuestion.type === QuestionType.NUMBER_INPUT ? (
              // Number Input UI
              <div className="space-y-4">
                <input
                  type="number"
                  inputMode="numeric"
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswer(parseInt(e.target.value) || 0)}
                  placeholder={(currentQuestion as any).placeholder || '0'}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white py-5 px-6 text-2xl font-bold text-slate-900 text-center transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                />
              </div>
            ) : currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options ? (
              // Multiple Choice UI
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200
                      ${currentAnswer === option.value 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50'}`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {currentAnswer === option.value && (
                      <CheckCircle2 className="float-right h-5 w-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              // Standard Likert Scale UI
              <>
                <div className="flex justify-between px-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>{content.runner.disagree}</span>
                    <span>{content.runner.agree}</span>
                </div>
                
                <div className="grid grid-cols-5 gap-3 sm:gap-6">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <button
                            key={val}
                            onClick={() => handleAnswer(val)}
                            className={`group relative flex h-14 w-full items-center justify-center rounded-xl border-2 text-xl font-bold transition-all duration-200
                            ${currentAnswer === val 
                                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                                : 'border-slate-100 bg-white text-slate-400 hover:border-blue-200 hover:text-blue-500 hover:-translate-y-1'}`}
                        >
                            {val}
                            {currentAnswer === val && (
                                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                                    <CheckCircle2 className="h-3 w-3" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-2">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
              </>
            )}
            </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={currentQuestionIndex === 0 || isSubmitting}
            className="text-slate-500 hover:text-slate-900"
        >
            <ChevronLeft className="mr-2 h-4 w-4" /> {content.runner.prev}
        </Button>
        
        <Button 
            onClick={handleNext} 
            disabled={!hasAnswer || isSubmitting}
            isLoading={isSubmitting}
            size="lg"
            className="rounded-xl px-8 shadow-lg shadow-blue-500/20"
        >
            {isLastQuestion ? content.runner.complete : content.runner.next} 
            {!isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
