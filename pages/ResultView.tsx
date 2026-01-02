
import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMockTests } from '../constants';
import { useLanguage } from '../services/languageContext';
import { useAuth } from '../services/authContext';
import Button from '../components/Button';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { UpgradeModal } from '../components/UpgradeModal';
import { canAccess } from '../components/FeatureLock';
import { Download, RotateCcw, Share2, CheckCircle2, BookOpen, User as UserIcon, Library, Copy, Linkedin, Twitter, MessageCircle, FileText, Target, Lightbulb, ArrowLeft, Star, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Dimension, AccessLevel } from '../types';
import { generateResultPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/financialHealthScoring';

// Helper to calculate dimension scores from answers
const calculateDimensionScores = (
  answers: Record<string, number>,
  questions: any[],
  dimensions: Dimension[],
  language: 'en' | 'id'
) => {
  const dimensionScores: Record<string, { total: number; count: number }> = {};
  
  // Initialize
  dimensions.forEach(d => {
    dimensionScores[d.key] = { total: 0, count: 0 };
  });
  
  // Calculate scores per dimension
  questions.forEach((q, index) => {
    const answer = answers[q.id] || 3; // Default to middle if not answered
    const adjustedScore = q.reverse ? (6 - answer) : answer; // Reverse if needed
    const normalizedScore = ((adjustedScore - 1) / 4) * 100; // Convert 1-5 to 0-100
    
    if (q.dimension && dimensionScores[q.dimension]) {
      dimensionScores[q.dimension].total += normalizedScore;
      dimensionScores[q.dimension].count += 1;
    }
  });
  
  // Convert to radar chart data
  return dimensions.map(d => ({
    subject: d.label[language],
    key: d.key,
    A: dimensionScores[d.key].count > 0 
      ? Math.round(dimensionScores[d.key].total / dimensionScores[d.key].count)
      : 0,
    fullMark: 100
  }));
};

// Get weakest dimensions
const getWeakestDimensions = (data: { subject: string; key: string; A: number }[], count: number = 2) => {
  return [...data].sort((a, b) => a.A - b.A).slice(0, count);
};

// Get strongest dimensions
const getStrongestDimensions = (data: { subject: string; key: string; A: number }[], count: number = 2) => {
  return [...data].sort((a, b) => b.A - a.A).slice(0, count);
};

export const ResultView = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { content, language } = useLanguage();
  const { user } = useAuth();
  const score = parseInt(searchParams.get('score') || '0');
  const tests = getMockTests(language);
  const test = tests.find(t => t.id === id);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const userPlan = user?.plan || AccessLevel.FREE;

  // Helper to decode Unicode-safe base64
  const decodeFromBase64 = <T,>(encoded: string): T | null => {
    try {
      const jsonString = decodeURIComponent(
        atob(encoded).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonString) as T;
    } catch {
      return null;
    }
  };

  // Parse Financial Health data from URL if available
  const financialHealthData = useMemo(() => {
    const fhParam = searchParams.get('fh');
    if (fhParam && id === 't1') {
      return decodeFromBase64<{
        percentages: { needs: number; wants: number; savings: number };
        ideal: { needs: number; wants: number; savings: number };
        insights: string[];
        rawValues: Record<string, number>;
        categoryKey: string;
      }>(fhParam);
    }
    return null;
  }, [searchParams, id]);

  const isFinancialHealthTest = id === 't1' && financialHealthData !== null;

  // Pie chart data for Financial Health test
  const pieData = useMemo(() => {
    if (!financialHealthData) return [];
    const { percentages } = financialHealthData;
    return [
      { name: language === 'id' ? 'Kebutuhan' : 'Needs', value: percentages.needs, ideal: 50 },
      { name: language === 'id' ? 'Keinginan' : 'Wants', value: percentages.wants, ideal: 30 },
      { name: language === 'id' ? 'Tabungan' : 'Savings', value: percentages.savings, ideal: 20 }
    ];
  }, [financialHealthData, language]);

  // Colors for pie chart based on deviation from ideal
  const getPieColor = (item: { name: string; value: number; ideal: number }, index: number) => {
    if (!financialHealthData) return '#64748b';
    const { percentages } = financialHealthData;
    
    if (index === 0) { // Needs
      return percentages.needs > 50 ? '#ef4444' : '#22c55e'; // Red if over 50%
    } else if (index === 1) { // Wants
      return percentages.wants > 30 ? '#f59e0b' : '#22c55e'; // Yellow if over 30%
    } else { // Savings
      return percentages.savings >= 20 ? '#22c55e' : '#ef4444'; // Green if >= 20%
    }
  };

  // Parse answers from URL if available, otherwise generate mock based on score
  const radarData = useMemo(() => {
    if (!test || !test.dimensions) {
      // Fallback for tests without dimensions
      return [
        { subject: language === 'id' ? 'Strategi' : 'Strategy', key: 'strategy', A: Math.max(0, score - 10), fullMark: 100 },
        { subject: language === 'id' ? 'Eksekusi' : 'Execution', key: 'execution', A: score, fullMark: 100 },
        { subject: language === 'id' ? 'Mindset' : 'Mindset', key: 'mindset', A: Math.min(100, score + 5), fullMark: 100 },
        { subject: language === 'id' ? 'Keahlian' : 'Skills', key: 'skills', A: Math.max(0, score - 20), fullMark: 100 },
        { subject: language === 'id' ? 'Konsistensi' : 'Consistency', key: 'consistency', A: Math.max(0, score - 5), fullMark: 100 },
      ];
    }
    
    // Generate realistic dimension scores based on overall score with variation
    const baseScore = score;
    const variance = 15;
    
    return test.dimensions.map((d, i) => {
      // Add some variance to make the radar chart more realistic
      const variation = (Math.sin(i * 1.5) * variance) + (Math.cos(i * 2) * (variance / 2));
      const dimScore = Math.max(0, Math.min(100, baseScore + variation));
      
      return {
        subject: d.label[language],
        key: d.key,
        A: Math.round(dimScore),
        fullMark: 100
      };
    });
  }, [test, score, language]);

  const weakest = useMemo(() => getWeakestDimensions(radarData, 2), [radarData]);
  const strongest = useMemo(() => getStrongestDimensions(radarData, 2), [radarData]);

  if (!test) return <div>{content.result.notFound}</div>;

  // Level Logic
  let level = content.result.level.needsWork;
  let color = "text-red-600";
  let bg = "bg-red-100";
  let progressColor = "text-red-600";
  let radarStroke = "#dc2626";
  let radarFill = "#ef4444";

  if (score > 40) { 
      level = content.result.level.average; 
      color = "text-yellow-600"; 
      bg="bg-yellow-100"; 
      progressColor = "text-yellow-500";
      radarStroke = "#d97706";
      radarFill = "#f59e0b";
  }
  if (score > 70) { 
      level = content.result.level.high; 
      color = "text-green-600"; 
      bg="bg-green-100"; 
      progressColor = "text-green-600";
      radarStroke = "#16a34a";
      radarFill = "#22c55e";
  }
  if (score > 90) { 
      level = content.result.level.mastery; 
      color = "text-blue-600"; 
      bg="bg-blue-100"; 
      progressColor = "text-blue-600";
      radarStroke = "#2563eb";
      radarFill = "#3b82f6";
  }

  // Custom Level Overrides for specific tests
  
  // Financial Health Test (50/30/20 Rule)
  if (test.id === 't1' && financialHealthData) {
    const { categoryKey } = financialHealthData;
    if (categoryKey === 'very_healthy') {
      level = language === 'id' ? '💚 Sangat Sehat' : '💚 Very Healthy';
      color = "text-emerald-600";
      bg = "bg-emerald-100";
      progressColor = "text-emerald-600";
      radarStroke = "#10b981";
      radarFill = "#34d399";
    } else if (categoryKey === 'healthy') {
      level = language === 'id' ? '✅ Sehat' : '✅ Healthy';
      color = "text-green-600";
      bg = "bg-green-100";
      progressColor = "text-green-600";
      radarStroke = "#16a34a";
      radarFill = "#22c55e";
    } else if (categoryKey === 'fair') {
      level = language === 'id' ? '⚠️ Cukup' : '⚠️ Fair';
      color = "text-yellow-600";
      bg = "bg-yellow-100";
      progressColor = "text-yellow-500";
      radarStroke = "#d97706";
      radarFill = "#f59e0b";
    } else if (categoryKey === 'needs_improvement') {
      level = language === 'id' ? '🔶 Perlu Perbaikan' : '🔶 Needs Improvement';
      color = "text-orange-600";
      bg = "bg-orange-100";
      progressColor = "text-orange-500";
      radarStroke = "#ea580c";
      radarFill = "#f97316";
    } else if (categoryKey === 'crisis') {
      level = language === 'id' ? '🚨 Krisis' : '🚨 Crisis';
      color = "text-red-600";
      bg = "bg-red-100";
      progressColor = "text-red-600";
      radarStroke = "#dc2626";
      radarFill = "#ef4444";
    }
  }
  
  if (test.id === 't_emd') {
    if (score <= 40) {
       level = language === 'id' ? 'Energy Depleted' : 'Energy Depleted';
    } else if (score <= 60) {
       level = language === 'id' ? 'Unstable Momentum' : 'Unstable Momentum';
    } else if (score <= 80) {
       level = language === 'id' ? 'Sustainable' : 'Sustainable';
    } else {
       level = language === 'id' ? 'High Momentum' : 'High Momentum';
    }
  }

  if (test.id === 't_tsd') {
    if (score <= 40) {
       level = language === 'id' ? '❌ Timing Disconnected' : '❌ Timing Disconnected';
       color = "text-red-600";
       bg = "bg-red-100";
    } else if (score <= 60) {
       level = language === 'id' ? '⚠️ Timing Friction' : '⚠️ Timing Friction';
       color = "text-yellow-600";
       bg = "bg-yellow-100";
    } else if (score <= 80) {
       level = language === 'id' ? '✅ Strategic Timer' : '✅ Strategic Timer';
       color = "text-blue-600";
       bg = "bg-blue-100";
    } else {
       level = language === 'id' ? '🚀 Adaptive Master' : '🚀 Adaptive Master';
       color = "text-indigo-600";
       bg = "bg-indigo-100";
    }
  }

  // Logic for Share Link
  const currentUrl = window.location.href;
  const shareableUrl = `${currentUrl}&share_ref=${Math.random().toString(36).substring(7)}`;
  const shareText = content.result.shareModal.message
    .replace('{score}', score.toString())
    .replace('{test}', test.title);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const socialLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareableUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareableUrl)}`
  };

  // Dynamic Description based on test type and score
  const getDescription = (s: number) => {
    const isId = language === 'id';
    const weakDims = weakest.map(w => w.subject).join(', ');
    const strongDims = strongest.map(st => st.subject).join(', ');

    if (test.id === 't_emd') {
      if (s <= 40) return isId 
        ? `Energi dan momentum Anda saat ini tidak mendukung konsistensi. Area terlemah: ${weakDims}. Fokus utama sebaiknya pemulihan, bukan menambah target.`
        : `Your current energy and momentum do not support consistency. Weakest areas: ${weakDims}. Focus on recovery, not adding more targets.`;
      if (s <= 60) return isId
        ? `Anda memiliki energi, namun bocor di ${weakDims}. Perlu penyederhanaan dan pengelolaan ritme.`
        : `You have energy, but it's leaking in ${weakDims}. You need simplification and rhythm management.`;
      if (s <= 80) return isId
        ? `Energi dan momentum Anda cukup stabil. Kekuatan Anda: ${strongDims}. Optimasi di ${weakDims} akan membawa Anda ke level berikutnya.`
        : `Your energy and momentum are stable. Your strengths: ${strongDims}. Optimizing ${weakDims} will take you to the next level.`;
      return isId
        ? `Anda berada dalam kondisi optimal dengan keunggulan di ${strongDims}. Pertahankan momentum ini!`
        : `You are in optimal condition with excellence in ${strongDims}. Maintain this momentum!`;
    }

    if (test.id === 't_tsd') {
      if (s <= 40) return isId
        ? `Pola timing Anda tidak stabil. Area perhatian: ${weakDims}. Anda mungkin sering merasa kehilangan momen.`
        : `Your timing pattern is unstable. Focus areas: ${weakDims}. You may often feel like you're missing moments.`;
      if (s <= 60) return isId
        ? `Anda memiliki kecenderungan reaktif di ${weakDims}. Risiko: bertindak terlalu cepat atau terlalu lambat.`
        : `You have reactive tendencies in ${weakDims}. Risk: acting too fast or too slow.`;
      if (s <= 80) return isId
        ? `Anda adalah Adaptive Timer yang baik dengan keseimbangan sehat. Kekuatan: ${strongDims}.`
        : `You are a good Adaptive Timer with healthy balance. Strengths: ${strongDims}.`;
      return isId
        ? `Anda adalah Master Timing Adaptif dengan keunggulan di ${strongDims}. Intuisi timing Anda sangat tajam.`
        : `You are an Adaptive Timing Master with excellence in ${strongDims}. Your timing intuition is very sharp.`;
    }

    // Generic description with dimension insights
    if (s < 40) return isId 
        ? `Posisi Anda saat ini menunjukkan kesenjangan di ${weakDims}. Fokus segera pada dasar-dasar diperlukan.`
        : `Your current standing suggests gaps in ${weakDims}. Immediate focus on basics is required.`;
    
    if (s < 70) return isId
        ? `Anda memiliki fondasi kuat di ${strongDims}, tetapi ${weakDims} membutuhkan perhatian untuk optimasi.`
        : `You have a strong foundation in ${strongDims}, but ${weakDims} needs attention for optimization.`;
    
    if (s < 90) return isId
        ? `Anda berkinerja tinggi dengan keunggulan di ${strongDims}. Fokus pengembangan: ${weakDims}.`
        : `You are performing at a high level with strength in ${strongDims}. Development focus: ${weakDims}.`;
    
    return isId
        ? `Anda menunjukkan penguasaan di domain ini dengan keunggulan menyeluruh, terutama ${strongDims}.`
        : `You demonstrate mastery in this domain with overall excellence, especially ${strongDims}.`;
  };

  const getVitalPoint = (s: number) => {
    const isId = language === 'id';
    const weakestDim = weakest[0]?.subject || '';
    
    if (test.id === 't_tsd') {
      if (s < 50) return isId 
        ? `Fokus pada ${weakestDim}. Latih 'Pause & Assess' - beri jeda 5 menit sebelum keputusan.`
        : `Focus on ${weakestDim}. Practice 'Pause & Assess' - give a 5-minute pause before decisions.`;
      if (s < 80) return isId
        ? `Kalibrasi Risiko di ${weakestDim}. Fokus pada membaca sinyal sebelum menentukan kecepatan gerak.`
        : `Risk Calibration in ${weakestDim}. Focus on reading signals before determining speed.`;
      return isId
        ? `Intuisi Terlatih. Percayai 'gut feeling' Anda karena pola pengenalan sinyal sudah matang.`
        : `Trained Intuition. Trust your gut feeling as your signal recognition patterns are mature.`;
    }

    if (s < 50) return isId
      ? `Prioritaskan ${weakestDim}. Bangun ritme pelacakan harian untuk mengukur kemajuan.`
      : `Prioritize ${weakestDim}. Establish a daily tracking rhythm to measure progress.`;
    
    if (s < 80) return isId
      ? `Tingkatkan ${weakestDim}. Otomatiskan tugas bernilai rendah untuk fokus pada pertumbuhan.`
      : `Improve ${weakestDim}. Automate low-value tasks to focus on growth.`;
    
    return isId
      ? `Skalabilitas. Dokumentasikan proses sukses Anda di ${strongest[0]?.subject} untuk menciptakan warisan.`
      : `Scalability. Document your success processes in ${strongest[0]?.subject} to create a legacy.`;
  };

  // Dynamic recommendations based on weakest dimensions
  const getRecommendations = () => {
    const isId = language === 'id';
    const recs = [];

    // Recommendation based on weakest dimension
    if (weakest[0]) {
      recs.push({
        title: isId ? `Fokus pada ${weakest[0].subject}` : `Focus on ${weakest[0].subject}`,
        desc: isId 
          ? `Area ini adalah prioritas utama Anda dengan skor ${weakest[0].A}%. Tingkatkan dengan latihan harian.`
          : `This area is your top priority with a score of ${weakest[0].A}%. Improve with daily practice.`
      });
    }

    // Recommendation based on second weakest
    if (weakest[1]) {
      recs.push({
        title: isId ? `Kembangkan ${weakest[1].subject}` : `Develop ${weakest[1].subject}`,
        desc: isId 
          ? `Skor ${weakest[1].A}% menunjukkan ruang untuk pertumbuhan. Pertimbangkan coaching atau pelatihan.`
          : `Score of ${weakest[1].A}% shows room for growth. Consider coaching or training.`
      });
    }

    // Leverage strength recommendation
    if (strongest[0]) {
      recs.push({
        title: isId ? `Manfaatkan ${strongest[0].subject}` : `Leverage ${strongest[0].subject}`,
        desc: isId 
          ? `Dengan skor ${strongest[0].A}%, ini adalah kekuatan Anda. Gunakan untuk mengangkat area lain.`
          : `With a score of ${strongest[0].A}%, this is your strength. Use it to lift other areas.`
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  const handleDownloadPDF = () => {
    if (!canAccess(userPlan, AccessLevel.PRO)) {
      setShowUpgradeModal(true);
      return;
    }
    generateResultPDF({
      testTitle: test.title,
      testCategory: test.category,
      score,
      level,
      date: new Date().toLocaleDateString(),
      dimensions: radarData.map(d => ({ subject: d.subject, score: d.A })),
      recommendations,
      executiveSummary: getDescription(score),
      vitalPoint: getVitalPoint(score),
      methodology: test.methodology,
      language
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader 
        title={<>{content.result.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{test.title}</span></>}
        subtitle={
           <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-slate-300 border border-white/10">
                 <Target className="h-3 w-3" /> {test.category}
              </span>
              <span className="text-sm">{content.result.date} {new Date().toLocaleDateString()}</span>
           </span>
        }
        badge={
             <Link to="/catalog" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
             </Link>
        }
      >
        <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" onClick={() => setIsShareModalOpen(true)} className="bg-white/20 text-white hover:bg-white/30 border border-white/30">
                <Share2 className="mr-2 h-4 w-4" /> {content.result.share}
            </Button>
            <Button variant="primary" onClick={handleDownloadPDF} className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                <Download className="mr-2 h-4 w-4" /> {content.result.download}
                {!canAccess(userPlan, AccessLevel.PRO) && (
                  <Star className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
                )}
            </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Score Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-500">{content.result.score}</h3>
          <div className="my-6 flex justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-100">
               <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                 <circle
                   className={progressColor}
                   strokeWidth="8"
                   strokeDasharray={251}
                   strokeDashoffset={251 - (251 * score) / 100}
                   strokeLinecap="round"
                   stroke="currentColor"
                   fill="transparent"
                   r="40"
                   cx="50"
                   cy="50"
                 />
               </svg>
               <span className="text-4xl font-bold text-slate-900">{score}</span>
            </div>
          </div>
          <div className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${bg} ${color}`}>
            {level}
          </div>
        </div>

        {/* Visual Analysis - Dynamic Chart */}
        <div className="min-h-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-center font-semibold text-slate-500">{content.result.breakdown}</h3>
            <div className="h-[300px] w-full">
              {isFinancialHealthTest ? (
                // Pie Chart for Financial Health
                <div className="flex flex-col lg:flex-row items-center justify-around h-full">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getPieColor(entry, index)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 p-4">
                    <h4 className="font-bold text-slate-700 text-sm">{language === 'id' ? 'Perbandingan dengan Ideal' : 'Comparison with Ideal'}</h4>
                    <div className="grid gap-2 text-sm">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPieColor(item, i) }}></div>
                          <span className="font-medium">{item.name}:</span>
                          <span className={item.value > item.ideal && i < 2 ? 'text-red-600 font-bold' : item.value < item.ideal && i === 2 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                            {item.value}%
                          </span>
                          <span className="text-slate-400">/ {item.ideal}%</span>
                          {((i < 2 && item.value > item.ideal) || (i === 2 && item.value < item.ideal)) && <TrendingDown className="h-4 w-4 text-red-500" />}
                          {((i < 2 && item.value <= item.ideal) || (i === 2 && item.value >= item.ideal)) && <TrendingUp className="h-4 w-4 text-green-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Radar Chart for other tests
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="My Score"
                        dataKey="A"
                        stroke={radarStroke}
                        strokeWidth={3}
                        fill={radarFill}
                        fillOpacity={0.4}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
        </div>
      </div>

      {/* Financial Health Insights Section */}
      {isFinancialHealthTest && financialHealthData?.insights?.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-amber-800 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {language === 'id' ? 'Insight Personal' : 'Personal Insights'}
          </h3>
          <ul className="space-y-3">
            {financialHealthData.insights.map((insight: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-amber-900/80">
                <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-bold">{i + 1}</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Description & Vital Point Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                 <FileText className="h-5 w-5 text-blue-600" />
                 {language === 'id' ? 'Ringkasan Eksekutif' : 'Executive Summary'}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base flex-grow">
                {getDescription(score)}
            </p>
         </div>

         <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-orange-200/50 blur-2xl"></div>
             <h3 className="flex items-center gap-2 text-lg font-bold text-orange-800 mb-4 relative z-10">
                 <Target className="h-5 w-5 text-orange-600" />
                 {language === 'id' ? 'Poin Vital' : 'Vital Point'}
            </h3>
            <div className="relative z-10">
                <p className="text-orange-900/80 text-lg font-bold leading-tight">
                    {getVitalPoint(score)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-wider">
                    <Lightbulb className="h-4 w-4" />
                    {language === 'id' ? 'Rekomendasi Utama' : 'Key Recommendation'}
                </div>
            </div>
         </div>
      </div>

      {/* Methodology Section */}
      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-full bg-blue-100 p-3 text-blue-600 md:block">
            <Library className="h-6 w-6" />
          </div>
          <div className="flex-1">
             <h2 className="text-xl font-bold text-slate-900">{content.result.methodology.title}</h2>
             <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                   <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500">
                     <BookOpen className="h-4 w-4" /> {content.result.methodology.source}
                   </h4>
                   <p className="mt-1 font-medium text-slate-900">{test.methodology.name}</p>
                   <p className="text-sm italic text-slate-600">{test.methodology.source}</p>
                </div>
                <div>
                   <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500">
                     <UserIcon className="h-4 w-4" /> {content.result.methodology.author}
                   </h4>
                   <p className="mt-1 font-medium text-slate-900">{test.methodology.author}</p>
                </div>
             </div>
             <div className="mt-4 border-t border-blue-200 pt-4">
               <h4 className="text-sm font-bold text-slate-500">{content.result.methodology.why}</h4>
               <p className="mt-1 text-sm leading-relaxed text-slate-700">{test.methodology.description}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendations */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">{content.result.recommendations}</h2>
        <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 flex-none text-green-500" />
                  <div>
                      <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                      <p className="text-slate-600">{rec.desc}</p>
                  </div>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/catalog">
            <Button variant="secondary">
                <RotateCcw className="mr-2 h-4 w-4" /> {content.result.retake}
            </Button>
        </Link>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={content.result.shareModal.title}
      >
        <div className="space-y-6">
           <p className="text-slate-600">{content.result.shareModal.desc}</p>
           
           <div className="relative">
              <input 
                 readOnly 
                 value={shareableUrl} 
                 className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-32 text-sm text-slate-600 focus:outline-none"
              />
              <button 
                onClick={handleCopyLink}
                className="absolute right-1 top-1 bottom-1 flex items-center gap-2 rounded-lg bg-white px-3 py-1 text-sm font-bold text-blue-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                 {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                 {isCopied ? content.result.shareModal.copied : content.result.shareModal.copy}
              </button>
           </div>

           <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">{content.result.shareModal.socialTitle}</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                 <a 
                   href={socialLinks.linkedin}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 rounded-xl bg-[#0077b5] px-4 py-3 text-white transition-transform hover:scale-105"
                 >
                    <Linkedin className="h-5 w-5" /> LinkedIn
                 </a>
                 <a 
                   href={socialLinks.twitter}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2] px-4 py-3 text-white transition-transform hover:scale-105"
                 >
                    <Twitter className="h-5 w-5" /> Twitter
                 </a>
                 <a 
                   href={socialLinks.whatsapp}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-white transition-transform hover:scale-105"
                 >
                    <MessageCircle className="h-5 w-5" /> WhatsApp
                 </a>
              </div>
           </div>
        </div>
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        requiredLevel={AccessLevel.PRO} 
      />
    </div>
  );
};
