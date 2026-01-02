
import { Test, TestCategory, AccessLevel, QuestionType, Language, Dimension } from './types';

// ============================================
// DIMENSION DEFINITIONS FOR EACH TEST
// ============================================

const DRD_DIMENSIONS: Dimension[] = [
  { key: 'cognitive', label: { en: 'Cognitive Clarity', id: 'Kejelasan Kognitif' } },
  { key: 'emotional', label: { en: 'Emotional Regulation', id: 'Regulasi Emosi' } },
  { key: 'information', label: { en: 'Information Sufficiency', id: 'Kecukupan Informasi' } },
  { key: 'energy', label: { en: 'Energy & Mental Load', id: 'Energi & Beban Mental' } },
  { key: 'ownership', label: { en: 'Decision Ownership', id: 'Kepemilikan Keputusan' } }
];

const ORD_DIMENSIONS: Dimension[] = [
  { key: 'alertness', label: { en: 'Alertness', id: 'Kepekaan' } },
  { key: 'resource', label: { en: 'Resource Sync', id: 'Sinkronisasi Sumber Daya' } },
  { key: 'velocity', label: { en: 'Execution Velocity', id: 'Kecepatan Eksekusi' } },
  { key: 'risk', label: { en: 'Risk Calibration', id: 'Kalibrasi Risiko' } },
  { key: 'recovery', label: { en: 'Recovery Capacity', id: 'Kapasitas Pemulihan' } }
];

const TSD_DIMENSIONS: Dimension[] = [
  { key: 'impulse', label: { en: 'Impulse Control', id: 'Kontrol Impuls' } },
  { key: 'delay', label: { en: 'Delay Management', id: 'Manajemen Penundaan' } },
  { key: 'signal', label: { en: 'Signal Recognition', id: 'Pengenalan Sinyal' } },
  { key: 'riskTiming', label: { en: 'Risk-Timing Balance', id: 'Keseimbangan Risiko-Waktu' } },
  { key: 'regret', label: { en: 'Learning from Regret', id: 'Belajar dari Penyesalan' } }
];

const SAD_DIMENSIONS: Dimension[] = [
  { key: 'color', label: { en: 'Color Response', id: 'Respons Warna' } },
  { key: 'element', label: { en: 'Elemental Archetype', id: 'Arketipe Elemen' } },
  { key: 'environment', label: { en: 'Environment Fit', id: 'Kecocokan Lingkungan' } }
];

const EMD_DIMENSIONS: Dimension[] = [
  { key: 'availability', label: { en: 'Energy Availability', id: 'Ketersediaan Energi' } },
  { key: 'focus', label: { en: 'Focus Sustainability', id: 'Keberlanjutan Fokus' } },
  { key: 'momentum', label: { en: 'Momentum Continuity', id: 'Kontinuitas Momentum' } },
  { key: 'leakage', label: { en: 'Energy Management', id: 'Manajemen Energi' } },
  { key: 'recovery', label: { en: 'Recovery & Reset', id: 'Pemulihan & Reset' } }
];

const TIME_DIMENSIONS: Dimension[] = [
  { key: 'urgent_important', label: { en: 'Urgent-Important', id: 'Penting-Mendesak' } },
  { key: 'not_urgent_important', label: { en: 'Not Urgent-Important', id: 'Penting-Tidak Mendesak' } },
  { key: 'urgent_not_important', label: { en: 'Urgent-Not Important', id: 'Tidak Penting-Mendesak' } },
  { key: 'planning', label: { en: 'Planning & Prioritization', id: 'Perencanaan & Prioritas' } }
];

const HABIT_DIMENSIONS: Dimension[] = [
  { key: 'cue', label: { en: 'Cue (Make it Obvious)', id: 'Isyarat (Buat Terlihat)' } },
  { key: 'craving', label: { en: 'Craving (Make it Attractive)', id: 'Keinginan (Buat Menarik)' } },
  { key: 'response', label: { en: 'Response (Make it Easy)', id: 'Respons (Buat Mudah)' } },
  { key: 'reward', label: { en: 'Reward (Make it Satisfying)', id: 'Hadiah (Buat Memuaskan)' } }
];

const DEEPWORK_DIMENSIONS: Dimension[] = [
  { key: 'depth', label: { en: 'Deep Work Hours', id: 'Jam Kerja Mendalam' } },
  { key: 'distraction', label: { en: 'Distraction Resistance', id: 'Ketahanan Distraksi' } },
  { key: 'schedule', label: { en: 'Schedule Control', id: 'Kontrol Jadwal' } },
  { key: 'shallow', label: { en: 'Shallow Work Ratio', id: 'Rasio Kerja Dangkal' } }
];

const FINANCE_DIMENSIONS: Dimension[] = [
  { key: 'needs', label: { en: 'Needs (50%)', id: 'Kebutuhan (50%)' } },
  { key: 'wants', label: { en: 'Wants (30%)', id: 'Keinginan (30%)' } },
  { key: 'savings', label: { en: 'Savings (20%)', id: 'Tabungan (20%)' } }
];

const FIRE_DIMENSIONS: Dimension[] = [
  { key: 'progress', label: { en: 'FI Progress', id: 'Progres FI' } },
  { key: 'savings_rate', label: { en: 'Savings Rate', id: 'Tingkat Tabungan' } },
  { key: 'passive_income', label: { en: 'Passive Income', id: 'Pendapatan Pasif' } },
  { key: 'timeline', label: { en: 'Timeline', id: 'Timeline' } }
];

const RISK_DIMENSIONS: Dimension[] = [
  { key: 'tolerance', label: { en: 'Risk Tolerance', id: 'Toleransi Risiko' } },
  { key: 'horizon', label: { en: 'Time Horizon', id: 'Horizon Waktu' } },
  { key: 'capacity', label: { en: 'Risk Capacity', id: 'Kapasitas Risiko' } },
  { key: 'knowledge', label: { en: 'Investment Knowledge', id: 'Pengetahuan Investasi' } }
];

const UMKM_DIMENSIONS: Dimension[] = [
  { key: 'value', label: { en: 'Value Proposition', id: 'Proposisi Nilai' } },
  { key: 'customer', label: { en: 'Customer Segments', id: 'Segmen Pelanggan' } },
  { key: 'channel', label: { en: 'Channels', id: 'Saluran' } },
  { key: 'revenue', label: { en: 'Revenue Streams', id: 'Aliran Pendapatan' } },
  { key: 'resources', label: { en: 'Key Resources', id: 'Sumber Daya Kunci' } }
];

const SUSTAINABILITY_DIMENSIONS: Dimension[] = [
  { key: 'profit', label: { en: 'Profit', id: 'Keuntungan' } },
  { key: 'people', label: { en: 'People', id: 'Manusia' } },
  { key: 'planet', label: { en: 'Planet', id: 'Lingkungan' } },
  { key: 'resilience', label: { en: 'Resilience', id: 'Ketahanan' } }
];

const LEADERSHIP_DIMENSIONS: Dimension[] = [
  { key: 'directing', label: { en: 'Directing', id: 'Mengarahkan' } },
  { key: 'coaching', label: { en: 'Coaching', id: 'Melatih' } },
  { key: 'supporting', label: { en: 'Supporting', id: 'Mendukung' } },
  { key: 'delegating', label: { en: 'Delegating', id: 'Mendelegasi' } }
];

const EQ_DIMENSIONS: Dimension[] = [
  { key: 'self_awareness', label: { en: 'Self-Awareness', id: 'Kesadaran Diri' } },
  { key: 'self_regulation', label: { en: 'Self-Regulation', id: 'Regulasi Diri' } },
  { key: 'motivation', label: { en: 'Motivation', id: 'Motivasi' } },
  { key: 'empathy', label: { en: 'Empathy', id: 'Empati' } },
  { key: 'social', label: { en: 'Social Skills', id: 'Keterampilan Sosial' } }
];

const BRAND_DIMENSIONS: Dimension[] = [
  { key: 'identity', label: { en: 'Brand Identity', id: 'Identitas Merek' } },
  { key: 'message', label: { en: 'Brand Message', id: 'Pesan Merek' } },
  { key: 'consistency', label: { en: 'Consistency', id: 'Konsistensi' } },
  { key: 'differentiation', label: { en: 'Differentiation', id: 'Diferensiasi' } }
];

const CONTENT_DIMENSIONS: Dimension[] = [
  { key: 'attract', label: { en: 'Attract', id: 'Menarik' } },
  { key: 'engage', label: { en: 'Engage', id: 'Melibatkan' } },
  { key: 'delight', label: { en: 'Delight', id: 'Menyenangkan' } },
  { key: 'consistency', label: { en: 'Content Consistency', id: 'Konsistensi Konten' } }
];

const BURNOUT_DIMENSIONS: Dimension[] = [
  { key: 'exhaustion', label: { en: 'Emotional Exhaustion', id: 'Kelelahan Emosional' } },
  { key: 'cynicism', label: { en: 'Cynicism', id: 'Sinisme' } },
  { key: 'efficacy', label: { en: 'Professional Efficacy', id: 'Efikasi Profesional' } }
];

const LIFESTYLE_DIMENSIONS: Dimension[] = [
  { key: 'physical', label: { en: 'Physical Health', id: 'Kesehatan Fisik' } },
  { key: 'mental', label: { en: 'Mental Health', id: 'Kesehatan Mental' } },
  { key: 'social', label: { en: 'Social Health', id: 'Kesehatan Sosial' } },
  { key: 'purpose', label: { en: 'Purpose & Meaning', id: 'Tujuan & Makna' } }
];

const LIFE_DIMENSIONS: Dimension[] = [
  { key: 'career', label: { en: 'Career', id: 'Karier' } },
  { key: 'finance', label: { en: 'Finance', id: 'Keuangan' } },
  { key: 'health', label: { en: 'Health', id: 'Kesehatan' } },
  { key: 'relationships', label: { en: 'Relationships', id: 'Hubungan' } },
  { key: 'growth', label: { en: 'Personal Growth', id: 'Pertumbuhan Pribadi' } }
];

const DECISION_DIMENSIONS: Dimension[] = [
  { key: 'widen', label: { en: 'Widen Options', id: 'Perluas Opsi' } },
  { key: 'reality', label: { en: 'Reality-Test', id: 'Uji Realitas' } },
  { key: 'distance', label: { en: 'Attain Distance', id: 'Jaga Jarak' } },
  { key: 'prepare', label: { en: 'Prepare to be Wrong', id: 'Siap Salah' } }
];

const COACHING_DIMENSIONS: Dimension[] = [
  { key: 'awareness', label: { en: 'Self-Awareness', id: 'Kesadaran Diri' } },
  { key: 'openness', label: { en: 'Openness to Change', id: 'Keterbukaan Berubah' } },
  { key: 'action', label: { en: 'Action Orientation', id: 'Orientasi Aksi' } }
];

const IMPOSTER_DIMENSIONS: Dimension[] = [
  { key: 'achievement', label: { en: 'Achievement Doubt', id: 'Keraguan Pencapaian' } },
  { key: 'attribution', label: { en: 'External Attribution', id: 'Atribusi Eksternal' } },
  { key: 'comparison', label: { en: 'Social Comparison', id: 'Perbandingan Sosial' } }
];

const TRAVEL_DIMENSIONS: Dimension[] = [
  { key: 'adventure', label: { en: 'Adventure Seeking', id: 'Pencarian Petualangan' } },
  { key: 'comfort', label: { en: 'Comfort Preference', id: 'Preferensi Kenyamanan' } },
  { key: 'novelty', label: { en: 'Novelty Seeking', id: 'Pencarian Hal Baru' } }
];

const UMROH_DIMENSIONS: Dimension[] = [
  { key: 'spiritual', label: { en: 'Spiritual Readiness', id: 'Kesiapan Spiritual' } },
  { key: 'financial', label: { en: 'Financial Readiness', id: 'Kesiapan Finansial' } },
  { key: 'physical', label: { en: 'Physical Readiness', id: 'Kesiapan Fisik' } },
  { key: 'knowledge', label: { en: 'Knowledge', id: 'Pengetahuan' } }
];

const AI_DIMENSIONS: Dimension[] = [
  { key: 'usefulness', label: { en: 'Perceived Usefulness', id: 'Persepsi Kegunaan' } },
  { key: 'ease', label: { en: 'Ease of Use', id: 'Kemudahan Penggunaan' } },
  { key: 'readiness', label: { en: 'Technical Readiness', id: 'Kesiapan Teknis' } },
  { key: 'mindset', label: { en: 'Growth Mindset', id: 'Pola Pikir Bertumbuh' } }
];

// ============================================
// QUESTION GENERATORS WITH DIMENSIONS
// ============================================

// DRD Questions with dimensions
const getDrdQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // A. Cognitive Clarity
    { text: isId ? "Saya memahami dengan jelas keputusan apa yang sedang saya hadapi" : "I clearly understand the decision I am currently facing", dimension: 'cognitive' },
    { text: isId ? "Pikiran saya terasa fokus, tidak bercabang ke banyak hal" : "My mind feels focused, not scattered across many things", dimension: 'cognitive' },
    { text: isId ? "Saya tidak merasa bingung atau ragu berlebihan" : "I do not feel excessively confused or doubtful", dimension: 'cognitive' },
    { text: isId ? "Saya bisa menjelaskan alasan keputusan ini dengan singkat dan logis" : "I can explain the reason for this decision briefly and logically", dimension: 'cognitive' },
    
    // B. Emotional Regulation
    { text: isId ? "Emosi saya saat ini tidak mengganggu penilaian saya" : "My current emotions are not interfering with my judgment", dimension: 'emotional' },
    { text: isId ? "Saya tidak sedang tertekan, marah, atau cemas berlebihan" : "I am not feeling overly stressed, angry, or anxious", dimension: 'emotional' },
    { text: isId ? "Saya bisa membedakan antara perasaan dan fakta" : "I can distinguish between feelings and facts", dimension: 'emotional' },
    { text: isId ? "Saya merasa cukup tenang saat memikirkan keputusan ini" : "I feel reasonably calm when thinking about this decision", dimension: 'emotional' },
    
    // C. Information Sufficiency
    { text: isId ? "Saya memiliki informasi yang cukup untuk mengambil keputusan" : "I have sufficient information to make this decision", dimension: 'information' },
    { text: isId ? "Saya sudah mempertimbangkan risiko utama" : "I have considered the major risks involved", dimension: 'information' },
    { text: isId ? "Saya tidak hanya mengandalkan asumsi atau intuisi semata" : "I am not relying solely on assumptions or intuition", dimension: 'information' },
    { text: isId ? "Saya memahami konsekuensi jangka pendek dan panjang" : "I understand both the short-term and long-term consequences", dimension: 'information' },
    
    // D. Energy & Mental Load
    { text: isId ? "Kondisi fisik dan mental saya cukup bertenaga" : "My physical and mental condition feels energized", dimension: 'energy' },
    { text: isId ? "Saya tidak merasa terlalu lelah untuk berpikir jernih" : "I do not feel too tired to think clearly", dimension: 'energy' },
    { text: isId ? "Pikiran saya tidak penuh oleh terlalu banyak masalah lain" : "My mind is not cluttered with too many other problems", dimension: 'energy' },
    { text: isId ? "Saya merasa punya ruang mental untuk fokus pada keputusan ini" : "I feel I have the mental space to focus on this decision", dimension: 'energy' },
    
    // E. Decision Ownership
    { text: isId ? "Keputusan ini benar-benar berasal dari saya, bukan tekanan orang lain" : "This decision truly comes from me, not external pressure", dimension: 'ownership' },
    { text: isId ? "Saya siap bertanggung jawab atas hasil keputusan ini" : "I am ready to take responsibility for the outcome of this decision", dimension: 'ownership' },
    { text: isId ? "Saya tidak mengambil keputusan hanya karena takut tertinggal" : "I am not making this decision just out of fear of missing out (FOMO)", dimension: 'ownership' },
    { text: isId ? "Saya merasa keputusan ini selaras dengan nilai pribadi saya" : "I feel this decision aligns with my personal values", dimension: 'ownership' }
  ];

  return questions.map((q, i) => ({
    id: `drd_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// ORD Questions with dimensions
const getOrdQuestions = (lang: Language) => {
  const isId = lang === 'id';
  const questions = [
    // A. Alertness to Opportunity
    { text: isId ? "Saya sering menyadari peluang sebelum orang lain menyadarinya" : "I often notice opportunities before others do", dimension: 'alertness' },
    { text: isId ? "Saya mampu membedakan peluang nyata dan sekadar distraksi" : "I can distinguish between real opportunities and mere distractions", dimension: 'alertness' },
    { text: isId ? "Saya terbiasa mengamati perubahan kecil di sekitar saya" : "I am used to observing small changes around me", dimension: 'alertness' },
    { text: isId ? "Saya tidak melewatkan peluang karena terlalu sibuk hal lain" : "I do not miss opportunities because I am too busy with other things", dimension: 'alertness' },

    // B. Resource Synchronization
    { text: isId ? "Waktu saya cukup fleksibel saat peluang muncul" : "My time is flexible enough when opportunities arise", dimension: 'resource' },
    { text: isId ? "Energi saya memungkinkan untuk mengeksekusi hal baru" : "My energy allows me to execute new things", dimension: 'resource' },
    { text: isId ? "Kondisi finansial saya tidak menghambat peluang yang realistis" : "My financial condition does not hinder realistic opportunities", dimension: 'resource' },
    { text: isId ? "Saya punya akses orang/jaringan saat dibutuhkan" : "I have access to people/networks when needed", dimension: 'resource' },

    // C. Execution Velocity
    { text: isId ? "Saya bisa bergerak cepat tanpa harus menunggu terlalu lama" : "I can move quickly without waiting too long", dimension: 'velocity' },
    { text: isId ? "Saya tidak terlalu banyak menunda ketika peluang sudah jelas" : "I do not procrastinate much when the opportunity is clear", dimension: 'velocity' },
    { text: isId ? "Saya mampu membuat keputusan awal dengan cukup cepat" : "I am capable of making initial decisions quickly enough", dimension: 'velocity' },
    { text: isId ? "Saya tidak kehilangan momentum karena overthinking" : "I do not lose momentum due to overthinking", dimension: 'velocity' },

    // D. Risk Calibration
    { text: isId ? "Saya berani mengambil risiko yang masuk akal" : "I dare to take calculated risks", dimension: 'risk' },
    { text: isId ? "Saya menilai risiko sebelum bertindak" : "I assess risks before acting", dimension: 'risk' },
    { text: isId ? "Saya tidak menghindari peluang hanya karena takut gagal" : "I do not avoid opportunities just because I fear failure", dimension: 'risk' },
    { text: isId ? "Saya tidak asal lompat tanpa perhitungan" : "I do not just jump in without calculation", dimension: 'risk' },

    // E. Recovery Capacity
    { text: isId ? "Saya cepat bangkit setelah peluang tidak berjalan sesuai rencana" : "I bounce back quickly after an opportunity doesn't go as planned", dimension: 'recovery' },
    { text: isId ? "Kegagalan tidak membuat saya trauma berkepanjangan" : "Failure does not cause me prolonged trauma", dimension: 'recovery' },
    { text: isId ? "Saya bisa mengambil pelajaran dari peluang yang gagal" : "I can learn lessons from failed opportunities", dimension: 'recovery' },
    { text: isId ? "Saya tetap termotivasi meski hasil sebelumnya kurang baik" : "I stay motivated even if previous results were poor", dimension: 'recovery' }
  ];

  return questions.map((q, i) => ({
    id: `ord_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// TSD Questions with dimensions
const getTsdQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // A. Impulse Speed (Reverse: High impulse is bad)
    { text: isId ? "Saya sering bertindak spontan tanpa menunggu terlalu lama" : "I often act spontaneously without waiting too long", dimension: 'impulse', reverse: true },
    { text: isId ? "Saya pernah menyesal karena bertindak terlalu cepat" : "I have regretted acting too quickly", dimension: 'impulse', reverse: true },
    { text: isId ? "Saya merasa tidak nyaman jika terlalu lama menunggu" : "I feel uncomfortable if I wait too long", dimension: 'impulse', reverse: true },
    { text: isId ? "Saya cenderung langsung bergerak begitu ada peluang" : "I tend to move immediately when there is an opportunity", dimension: 'impulse', reverse: true },

    // B. Delay Tendency (Reverse: High delay is bad)
    { text: isId ? "Saya sering menunda meski tahu harus bertindak" : "I often procrastinate even when I know I must act", dimension: 'delay', reverse: true },
    { text: isId ? "Saya menunggu sampai benar-benar yakin sebelum mulai" : "I wait until I am absolutely sure before starting", dimension: 'delay', reverse: true },
    { text: isId ? "Saya sering merasa 'harusnya tadi'" : "I often feel 'I should have done it earlier'", dimension: 'delay', reverse: true },
    { text: isId ? "Saya melewatkan peluang karena terlalu banyak pertimbangan" : "I miss opportunities due to over-consideration", dimension: 'delay', reverse: true },

    // C. Signal Recognition (Positive)
    { text: isId ? "Saya bisa merasakan kapan saat yang tepat untuk bertindak" : "I can sense the right moment to act", dimension: 'signal', reverse: false },
    { text: isId ? "Saya mampu membedakan kesiapan nyata dan sekadar dorongan emosi" : "I can distinguish between real readiness and emotional impulse", dimension: 'signal', reverse: false },
    { text: isId ? "Saya tidak mudah terkecoh oleh hype atau tekanan sekitar" : "I am not easily swayed by hype or peer pressure", dimension: 'signal', reverse: false },
    { text: isId ? "Saya peka terhadap tanda-tanda perubahan situasi" : "I am sensitive to signs of changing situations", dimension: 'signal', reverse: false },

    // D. Risk-Timing Balance (Positive)
    { text: isId ? "Saya mempertimbangkan risiko sebelum menentukan waktu bertindak" : "I consider risks before determining when to act", dimension: 'riskTiming', reverse: false },
    { text: isId ? "Saya tidak asal nekat hanya karena momentum" : "I don't just jump in recklessly because of momentum", dimension: 'riskTiming', reverse: false },
    { text: isId ? "Saya tidak terlalu takut mengambil langkah saat waktunya tepat" : "I am not afraid to take steps when the time is right", dimension: 'riskTiming', reverse: false },
    { text: isId ? "Saya mampu menyesuaikan kecepatan dengan tingkat risiko" : "I can adjust my speed according to the risk level", dimension: 'riskTiming', reverse: false },

    // E. Regret Pattern (Mixed)
    { text: isId ? "Saya sering menyesal karena terlalu cepat bertindak" : "I often regret acting too quickly", dimension: 'regret', reverse: true },
    { text: isId ? "Saya sering menyesal karena terlalu lama menunggu" : "I often regret waiting too long", dimension: 'regret', reverse: true },
    { text: isId ? "Saya belajar dari kesalahan timing sebelumnya" : "I learn from past timing mistakes", dimension: 'regret', reverse: false },
    { text: isId ? "Saya jarang mengulangi kesalahan timing yang sama" : "I rarely repeat the same timing errors", dimension: 'regret', reverse: false }
  ];

  return questions.map((q, i) => ({
    id: `tsd_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension,
    reverse: q.reverse
  }));
};

// SAD Questions with dimensions
const getSadQuestions = (lang: Language) => {
  const isId = lang === 'id';
  const questions = [
    // A. Color-Cognitive Response (Q1-Q6)
    { text: isId ? "Saya merasa lebih fokus ketika berada di lingkungan dengan warna tertentu" : "I feel more focused when in an environment with specific colors", dimension: 'color' },
    { text: isId ? "Warna tertentu membuat saya lebih percaya diri saat bertindak" : "Certain colors make me feel more confident when acting", dimension: 'color' },
    { text: isId ? "Saya lebih cepat lelah di lingkungan visual yang terlalu ramai" : "I get tired faster in visually cluttered environments", dimension: 'color', reverse: true },
    { text: isId ? "Saya merasa tenang ketika berada di ruang dengan warna lembut" : "I feel calm when in a room with soft colors", dimension: 'color' },
    { text: isId ? "Warna cerah membantu saya lebih berani mengambil keputusan" : "Bright colors help me be braver in making decisions", dimension: 'color' },
    { text: isId ? "Warna gelap membantu saya berpikir lebih dalam dan serius" : "Dark colors help me think more deeply and seriously", dimension: 'color' },

    // B. Elemental Archetype Orientation (Q7-Q12)
    { text: isId ? "Saya merasa paling hidup ketika langsung bertindak" : "I feel most alive when taking immediate action", dimension: 'element' },
    { text: isId ? "Saya mudah beradaptasi dengan perubahan situasi" : "I adapt easily to changing situations", dimension: 'element' },
    { text: isId ? "Saya nyaman dengan rutinitas dan stabilitas" : "I am comfortable with routine and stability", dimension: 'element' },
    { text: isId ? "Saya lebih menikmati berpikir, berdiskusi, dan merancang ide" : "I enjoy thinking, discussing, and designing ideas more", dimension: 'element' },
    { text: isId ? "Saya tidak suka berdiam terlalu lama tanpa progres" : "I dislike staying still for too long without progress", dimension: 'element' },
    { text: isId ? "Saya membutuhkan waktu untuk menenangkan diri sebelum bertindak" : "I need time to calm myself before acting", dimension: 'element' },

    // C. Symbolic Environment Fit (Q13-Q18)
    { text: isId ? "Lingkungan saya saat ini mendukung cara saya bekerja" : "My current environment supports the way I work", dimension: 'environment' },
    { text: isId ? "Saya sering merasa 'tidak klik' dengan suasana sekitar" : "I often feel I don't 'click' with the surrounding atmosphere", dimension: 'environment', reverse: true },
    { text: isId ? "Saya lebih produktif di lingkungan yang sesuai dengan karakter saya" : "I am more productive in an environment that suits my character", dimension: 'environment' },
    { text: isId ? "Lingkungan yang salah membuat saya ragu bertindak" : "The wrong environment makes me hesitate to act", dimension: 'environment', reverse: true },
    { text: isId ? "Saya pernah berpikir, 'kalau tempatnya beda, hasilnya beda'" : "I have thought, 'if the place was different, the result would be different'", dimension: 'environment' },
    { text: isId ? "Saya merasa performa saya sangat dipengaruhi oleh suasana sekitar" : "I feel my performance is heavily influenced by the surroundings", dimension: 'environment' }
  ];

  return questions.map((q, i) => ({
    id: `sad_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension,
    reverse: q.reverse || false
  }));
};

// EMD Questions with dimensions
const getEmdQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // A. Energy Availability (Q1-Q4)
    { text: isId ? "Saya memiliki energi yang cukup untuk menjalani aktivitas penting harian" : "I have enough energy for important daily activities", dimension: 'availability', reverse: false },
    { text: isId ? "Saya jarang merasa kelelahan tanpa sebab jelas" : "I rarely feel tired without a clear reason", dimension: 'availability', reverse: false },
    { text: isId ? "Energi saya relatif stabil dari hari ke hari" : "My energy is relatively stable from day to day", dimension: 'availability', reverse: false },
    { text: isId ? "Saya tidak merasa 'habis' sebelum hari berakhir" : "I don't feel 'spent' before the day ends", dimension: 'availability', reverse: false },
    
    // B. Focus Sustainability (Q5-Q8)
    { text: isId ? "Saya mampu mempertahankan fokus pada satu hal cukup lama" : "I can maintain focus on one thing for quite a while", dimension: 'focus', reverse: false },
    { text: isId ? "Saya tidak mudah terdistraksi saat mengerjakan hal penting" : "I am not easily distracted when doing important things", dimension: 'focus', reverse: false },
    { text: isId ? "Fokus saya tidak cepat menurun setelah mulai bekerja" : "My focus doesn't drop quickly after starting work", dimension: 'focus', reverse: false },
    { text: isId ? "Saya jarang berpindah-pindah tugas tanpa menyelesaikan" : "I rarely switch tasks without finishing", dimension: 'focus', reverse: false },
    
    // C. Momentum Continuity (Q9-Q12)
    { text: isId ? "Jika sudah memulai sesuatu, saya cenderung melanjutkannya" : "Once I start something, I tend to continue it", dimension: 'momentum', reverse: false },
    { text: isId ? "Saya tidak sering mengulang dari nol" : "I don't often start over from scratch", dimension: 'momentum', reverse: false },
    { text: isId ? "Saya bisa menjaga ritme kerja dari hari ke hari" : "I can maintain work rhythm from day to day", dimension: 'momentum', reverse: false },
    { text: isId ? "Saya jarang kehilangan semangat di tengah proses" : "I rarely lose enthusiasm in the middle of the process", dimension: 'momentum', reverse: false },

    // D. Energy Leakage (Q13-Q16) - Reverse Scoring
    { text: isId ? "Banyak hal menguras energi saya tanpa memberi hasil berarti" : "Many things drain my energy without meaningful results", dimension: 'leakage', reverse: true },
    { text: isId ? "Emosi negatif sering mengganggu produktivitas saya" : "Negative emotions often disrupt my productivity", dimension: 'leakage', reverse: true },
    { text: isId ? "Saya sering terlibat terlalu banyak hal sekaligus" : "I am often involved in too many things at once", dimension: 'leakage', reverse: true },
    { text: isId ? "Saya merasa energi saya bocor ke aktivitas yang tidak penting" : "I feel my energy leaking into unimportant activities", dimension: 'leakage', reverse: true },

    // E. Recovery & Reset (Q17-Q20)
    { text: isId ? "Saya cepat pulih setelah merasa lelah" : "I recover quickly after feeling tired", dimension: 'recovery', reverse: false },
    { text: isId ? "Kegagalan tidak membuat saya kehilangan energi berkepanjangan" : "Failure doesn't cause me prolonged energy loss", dimension: 'recovery', reverse: false },
    { text: isId ? "Saya tahu kapan harus berhenti dan mengisi ulang energi" : "I know when to stop and recharge", dimension: 'recovery', reverse: false },
    { text: isId ? "Setelah istirahat, saya bisa kembali produktif" : "After resting, I can return to being productive", dimension: 'recovery', reverse: false }
  ];

  return questions.map((q, i) => ({
    id: `emd_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension,
    reverse: q.reverse
  }));
};

// Time Management Questions (Eisenhower Matrix)
const getTimeQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Urgent-Important
    { text: isId ? "Saya mampu mengenali tugas yang benar-benar mendesak dan penting" : "I can identify tasks that are truly urgent and important", dimension: 'urgent_important' },
    { text: isId ? "Saya langsung mengerjakan tugas kritis tanpa menunda" : "I immediately work on critical tasks without procrastinating", dimension: 'urgent_important' },
    { text: isId ? "Saya tidak panik saat menghadapi deadline mendesak" : "I don't panic when facing urgent deadlines", dimension: 'urgent_important' },
    
    // Not Urgent-Important (Quadrant 2)
    { text: isId ? "Saya rutin menyisihkan waktu untuk perencanaan jangka panjang" : "I regularly set aside time for long-term planning", dimension: 'not_urgent_important' },
    { text: isId ? "Saya berinvestasi waktu untuk pengembangan diri meski tidak mendesak" : "I invest time in self-development even when not urgent", dimension: 'not_urgent_important' },
    { text: isId ? "Saya memprioritaskan hubungan penting sebelum menjadi darurat" : "I prioritize important relationships before they become emergencies", dimension: 'not_urgent_important' },
    
    // Urgent-Not Important
    { text: isId ? "Saya sering terganggu oleh hal mendesak tapi tidak penting" : "I am often interrupted by urgent but unimportant things", dimension: 'urgent_not_important', reverse: true },
    { text: isId ? "Saya sulit menolak permintaan mendadak dari orang lain" : "I find it hard to refuse sudden requests from others", dimension: 'urgent_not_important', reverse: true },
    
    // Planning & Prioritization
    { text: isId ? "Saya membuat daftar prioritas setiap hari" : "I make a priority list every day", dimension: 'planning' },
    { text: isId ? "Saya mengevaluasi penggunaan waktu secara berkala" : "I evaluate my time usage periodically", dimension: 'planning' }
  ];

  return questions.map((q, i) => ({
    id: `time_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension,
    reverse: q.reverse || false
  }));
};

// Atomic Habits Questions (Four Laws)
const getHabitQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Cue - Make it Obvious
    { text: isId ? "Saya mendesain lingkungan agar kebiasaan baik mudah terlihat" : "I design my environment so good habits are easily visible", dimension: 'cue' },
    { text: isId ? "Saya memiliki trigger/pengingat visual untuk kebiasaan positif" : "I have visual triggers/reminders for positive habits", dimension: 'cue' },
    { text: isId ? "Saya menyembunyikan trigger kebiasaan buruk dari pandangan" : "I hide triggers for bad habits from view", dimension: 'cue' },
    
    // Craving - Make it Attractive
    { text: isId ? "Saya menggabungkan kebiasaan baru dengan aktivitas yang saya sukai" : "I combine new habits with activities I enjoy", dimension: 'craving' },
    { text: isId ? "Saya bergabung dengan komunitas yang mendukung kebiasaan positif" : "I join communities that support positive habits", dimension: 'craving' },
    { text: isId ? "Saya menemukan cara membuat kebiasaan sehat terasa menyenangkan" : "I find ways to make healthy habits feel enjoyable", dimension: 'craving' },
    
    // Response - Make it Easy
    { text: isId ? "Saya memulai kebiasaan baru dengan versi yang sangat sederhana" : "I start new habits with a very simple version", dimension: 'response' },
    { text: isId ? "Saya mengurangi hambatan untuk melakukan kebiasaan baik" : "I reduce friction for doing good habits", dimension: 'response' },
    { text: isId ? "Saya mengotomatiskan atau menyederhanakan kebiasaan yang berulang" : "I automate or simplify repetitive habits", dimension: 'response' },
    
    // Reward - Make it Satisfying
    { text: isId ? "Saya memberikan reward kecil setelah menyelesaikan kebiasaan" : "I give small rewards after completing habits", dimension: 'reward' },
    { text: isId ? "Saya melacak streak kebiasaan untuk kepuasan visual" : "I track habit streaks for visual satisfaction", dimension: 'reward' },
    { text: isId ? "Saya merayakan kemenangan kecil dalam membangun kebiasaan" : "I celebrate small wins in building habits", dimension: 'reward' }
  ];

  return questions.map((q, i) => ({
    id: `habit_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Deep Work Questions
const getDeepWorkQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Deep Work Hours
    { text: isId ? "Saya bisa fokus tanpa gangguan selama 2+ jam" : "I can focus without interruption for 2+ hours", dimension: 'depth' },
    { text: isId ? "Saya menjadwalkan blok waktu khusus untuk pekerjaan mendalam" : "I schedule dedicated blocks for deep work", dimension: 'depth' },
    { text: isId ? "Saya memiliki ritual untuk masuk ke mode fokus penuh" : "I have rituals to enter full focus mode", dimension: 'depth' },
    
    // Distraction Resistance
    { text: isId ? "Saya mematikan notifikasi saat bekerja" : "I turn off notifications when working", dimension: 'distraction' },
    { text: isId ? "Saya tidak memeriksa email/media sosial saat dalam sesi kerja" : "I don't check email/social media during work sessions", dimension: 'distraction' },
    { text: isId ? "Saya bisa mengabaikan gangguan dan kembali fokus dengan cepat" : "I can ignore distractions and refocus quickly", dimension: 'distraction' },
    
    // Schedule Control
    { text: isId ? "Saya mengontrol jadwal saya, bukan sebaliknya" : "I control my schedule, not the other way around", dimension: 'schedule' },
    { text: isId ? "Saya menolak meeting yang tidak perlu" : "I decline unnecessary meetings", dimension: 'schedule' },
    
    // Shallow Work Ratio
    { text: isId ? "Saya menghabiskan lebih banyak waktu untuk pekerjaan kognitif berat" : "I spend more time on cognitively demanding work", dimension: 'shallow' },
    { text: isId ? "Saya mendelegasikan atau mengotomatiskan pekerjaan administratif" : "I delegate or automate administrative work", dimension: 'shallow' }
  ];

  return questions.map((q, i) => ({
    id: `deep_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Financial Health Questions (50/30/20 Rule - Elizabeth Warren)
// Using CURRENCY_INPUT for actual rupiah amounts
const getFinanceQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Income
    { 
      id: 'income',
      text: isId 
        ? "Berapa penghasilan bersih bulanan Anda saat ini (setelah pajak & potongan)?" 
        : "What is your current monthly net income (after taxes & deductions)?",
      placeholder: isId ? "Contoh: 10.000.000" : "Example: 10,000,000",
      category: 'income'
    },
    // Needs - Housing
    { 
      id: 'housing',
      text: isId 
        ? "Berapa pengeluaran bulanan untuk tempat tinggal (sewa/KPR + maintenance)?" 
        : "What is your monthly housing expense (rent/mortgage + maintenance)?",
      placeholder: isId ? "Contoh: 3.000.000" : "Example: 3,000,000",
      category: 'needs'
    },
    // Needs - Food
    { 
      id: 'food',
      text: isId 
        ? "Berapa pengeluaran bulanan untuk makan sehari-hari (belanja bahan makanan + makan rutin)?" 
        : "What is your monthly food expense (groceries + regular meals)?",
      placeholder: isId ? "Contoh: 1.500.000" : "Example: 1,500,000",
      category: 'needs'
    },
    // Needs - Transport
    { 
      id: 'transport',
      text: isId 
        ? "Berapa pengeluaran bulanan untuk transportasi (bensin, tol, ojek online, cicilan kendaraan, parkir)?" 
        : "What is your monthly transportation expense (fuel, toll, ride-hailing, vehicle payments, parking)?",
      placeholder: isId ? "Contoh: 800.000" : "Example: 800,000",
      category: 'needs'
    },
    // Needs - Utilities
    { 
      id: 'utilities',
      text: isId 
        ? "Berapa pengeluaran bulanan untuk tagihan utilitas (listrik, air, internet, pulsa/telepon)?" 
        : "What is your monthly utility bills (electricity, water, internet, phone)?",
      placeholder: isId ? "Contoh: 500.000" : "Example: 500,000",
      category: 'needs'
    },
    // Needs - Mandatory Debt & Insurance
    { 
      id: 'mandatory_debt',
      text: isId 
        ? "Berapa pengeluaran bulanan untuk asuransi & cicilan utang minimal (asuransi kesehatan, cicilan kartu kredit minimal, pinjaman wajib)?" 
        : "What is your monthly insurance & minimum debt payments (health insurance, minimum credit card, mandatory loans)?",
      placeholder: isId ? "Contoh: 700.000" : "Example: 700,000",
      category: 'needs'
    },
    // Wants - Lifestyle
    { 
      id: 'lifestyle_wants',
      text: isId 
        ? "Berapa pengeluaran bulanan untuk keinginan/gaya hidup (makan di restoran, nongkrong, belanja baju/gadget, langganan streaming, hobi)?" 
        : "What is your monthly lifestyle spending (dining out, shopping, subscriptions, hobbies)?",
      placeholder: isId ? "Contoh: 2.000.000" : "Example: 2,000,000",
      category: 'wants'
    },
    // Wants - Entertainment
    { 
      id: 'entertainment',
      text: isId 
        ? "Berapa pengeluaran bulanan untuk hiburan & leisure (nonton bioskop, gym premium, traveling, konser)?" 
        : "What is your monthly entertainment & leisure (movies, premium gym, travel, concerts)?",
      placeholder: isId ? "Contoh: 800.000" : "Example: 800,000",
      category: 'wants'
    },
    // Savings
    { 
      id: 'savings',
      text: isId 
        ? "Berapa jumlah yang Anda tabung/investasikan setiap bulan (tabungan darurat, reksadana, saham, deposito, retirement)?" 
        : "How much do you save/invest each month (emergency fund, mutual funds, stocks, deposits, retirement)?",
      placeholder: isId ? "Contoh: 1.000.000" : "Example: 1,000,000",
      category: 'savings'
    },
    // Extra Debt Payoff
    { 
      id: 'extra_debt_payoff',
      text: isId 
        ? "Berapa jumlah untuk pelunasan utang ekstra bulanan (bayar lebih dari minimal kartu kredit/pinjaman)?" 
        : "How much extra debt payoff monthly (pay more than minimum on credit cards/loans)?",
      placeholder: isId ? "Contoh: 500.000" : "Example: 500,000",
      category: 'savings'
    }
  ];

  return questions.map((q) => ({
    id: `fin_${q.id}`,
    text: q.text,
    type: QuestionType.CURRENCY_INPUT,
    weight: 1,
    dimension: q.category,
    placeholder: q.placeholder
  }));
};

// FIRE Movement Questions - Financial Freedom Progress Index
// 12 Questions based on Vicki Robin & Joe Dominguez Framework
const getFireQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  return [
    // Q1: Monthly Income (take-home pay)
    {
      id: 'fi_income',
      text: isId 
        ? 'Berapa penghasilan bersih bulanan Anda saat ini (take-home pay setelah pajak & potongan)?'
        : 'What is your current monthly net income (take-home pay after tax & deductions)?',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'income',
      placeholder: isId ? 'Contoh: 15.000.000' : 'Example: 15,000,000'
    },
    // Q2: Current Monthly Expenses
    {
      id: 'fi_current_expenses',
      text: isId 
        ? 'Berapa total pengeluaran bulanan rata-rata Anda dalam 6-12 bulan terakhir? (Termasuk semua: kebutuhan, keinginan, tabungan, utang)'
        : 'What is your average total monthly spending over the last 6-12 months? (Including all: needs, wants, savings, debt)',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'expenses',
      placeholder: isId ? 'Contoh: 10.000.000' : 'Example: 10,000,000'
    },
    // Q3: Target FI Monthly Expenses
    {
      id: 'fi_target_expenses',
      text: isId 
        ? 'Berapa pengeluaran bulanan yang Anda anggap cukup untuk hidup nyaman saat FI/retire? (Biasanya lebih rendah dari spending sekarang)'
        : 'What monthly expenses do you consider sufficient for comfortable living when FI/retired? (Usually lower than current spending)',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'expenses',
      placeholder: isId ? 'Contoh: 8.000.000' : 'Example: 8,000,000'
    },
    // Q4: Total Investment Assets
    {
      id: 'fi_investments',
      text: isId 
        ? 'Berapa total aset investasi Anda saat ini yang bisa menghasilkan passive income? (Reksadana, saham, deposito, properti sewa — bukan rumah tinggal)'
        : 'What is your total investment assets that can generate passive income? (Mutual funds, stocks, deposits, rental properties — not primary residence)',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'investment',
      placeholder: isId ? 'Contoh: 500.000.000' : 'Example: 500,000,000'
    },
    // Q5: Monthly Savings & Investment
    {
      id: 'fi_monthly_savings',
      text: isId 
        ? 'Berapa total tabungan & investasi rutin yang Anda lakukan setiap bulan?'
        : 'What is your total regular monthly savings & investment?',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'savings_rate',
      placeholder: isId ? 'Contoh: 5.000.000' : 'Example: 5,000,000'
    },
    // Q6: Current Age
    {
      id: 'fi_current_age',
      text: isId 
        ? 'Berapa umur Anda saat ini?'
        : 'What is your current age?',
      type: QuestionType.NUMBER_INPUT,
      weight: 1,
      dimension: 'timeline',
      placeholder: isId ? 'Contoh: 30' : 'Example: 30'
    },
    // Q7: Target FI Age
    {
      id: 'fi_target_age',
      text: isId 
        ? 'Di usia berapa Anda ingin mencapai Financial Independence (bisa retire atau kerja opsional)?'
        : 'At what age do you want to achieve Financial Independence (optional work/early retirement)?',
      type: QuestionType.NUMBER_INPUT,
      weight: 1,
      dimension: 'timeline',
      placeholder: isId ? 'Contoh: 45' : 'Example: 45'
    },
    // Q8: Expected Return
    {
      id: 'fi_expected_return',
      text: isId 
        ? 'Berapa expected annual return investasi Anda setelah FI?'
        : 'What is your expected annual investment return after FI?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'investment',
      options: [
        { value: 5, label: isId ? '5% (Konservatif - Deposito/Obligasi)' : '5% (Conservative - Deposits/Bonds)' },
        { value: 7, label: isId ? '7% (Moderat - Campuran)' : '7% (Moderate - Mixed Portfolio)' },
        { value: 8, label: isId ? '8% (Agresif - Saham/Reksadana Saham)' : '8% (Aggressive - Stocks/Equity Funds)' }
      ]
    },
    // Q9: Consumer Debt
    {
      id: 'fi_consumer_debt',
      text: isId 
        ? 'Apakah Anda punya utang konsumtif saat ini (kartu kredit, pinjol, dll)? Jika ya, berapa totalnya?'
        : 'Do you have any consumer debt (credit cards, personal loans, etc.)? If yes, what is the total?',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'expenses',
      placeholder: isId ? 'Contoh: 0 atau 10.000.000' : 'Example: 0 or 10,000,000'
    },
    // Q10: Annual Large Expenses
    {
      id: 'fi_annual_large_expenses',
      text: isId 
        ? 'Berapa pengeluaran tahunan besar yang tidak bulanan (liburan besar, renovasi, dll)? Estimasi rata-rata per tahun.'
        : 'What are your large annual expenses not included monthly (major vacations, renovations, etc.)? Estimate average per year.',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'expenses',
      placeholder: isId ? 'Contoh: 24.000.000' : 'Example: 24,000,000'
    },
    // Q11: Passive Income
    {
      id: 'fi_passive_income',
      text: isId 
        ? 'Berapa pemasukan pasif Anda saat ini per bulan (dividen, sewa properti, royalti, dll)?'
        : 'What is your current monthly passive income (dividends, rental income, royalties, etc.)?',
      type: QuestionType.CURRENCY_INPUT,
      weight: 1,
      dimension: 'passive_income',
      placeholder: isId ? 'Contoh: 1.000.000' : 'Example: 1,000,000'
    },
    // Q12: Dependents
    {
      id: 'fi_dependents',
      text: isId 
        ? 'Berapa jumlah dependents (anak/pasangan/orang tua yang ditanggung)?'
        : 'How many dependents do you have (children/spouse/parents you support)?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'expenses',
      options: [
        { value: 0, label: isId ? '0 orang' : '0 people' },
        { value: 1, label: isId ? '1 orang' : '1 person' },
        { value: 2, label: isId ? '2 orang' : '2 people' },
        { value: 3, label: isId ? '3 orang' : '3 people' },
        { value: 4, label: isId ? '4+ orang' : '4+ people' }
      ]
    }
  ];
};

// Investment Risk Tolerance Questions (MPT - Harry Markowitz)
// 10 Questions with scored multiple choice (1-5)
const getRiskQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  return [
    // Q1: Age
    {
      id: 'risk_q1',
      text: isId ? 'Berapa umur Anda saat ini?' : 'What is your current age?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'horizon',
      options: [
        { value: 5, label: isId ? 'Di bawah 30 tahun' : 'Under 30 years' },
        { value: 4, label: isId ? '30-40 tahun' : '30-40 years' },
        { value: 3, label: isId ? '41-50 tahun' : '41-50 years' },
        { value: 2, label: isId ? '51-60 tahun' : '51-60 years' },
        { value: 1, label: isId ? 'Di atas 60 tahun' : 'Over 60 years' }
      ]
    },
    // Q2: Time Horizon
    {
      id: 'risk_q2',
      text: isId ? 'Kapan Anda berencana menggunakan sebagian besar uang investasi ini?' : 'When do you plan to use most of this investment money?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'horizon',
      options: [
        { value: 5, label: isId ? 'Lebih dari 10 tahun lagi' : 'More than 10 years' },
        { value: 4, label: isId ? '7-10 tahun' : '7-10 years' },
        { value: 3, label: isId ? '4-6 tahun' : '4-6 years' },
        { value: 2, label: isId ? '2-3 tahun' : '2-3 years' },
        { value: 1, label: isId ? 'Kurang dari 2 tahun' : 'Less than 2 years' }
      ]
    },
    // Q3: Investment Goal
    {
      id: 'risk_q3',
      text: isId ? 'Apa tujuan utama investasi Anda?' : 'What is your main investment goal?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'tolerance',
      options: [
        { value: 5, label: isId ? 'Pertumbuhan maksimal, saya siap ambil risiko tinggi' : 'Maximum growth, I\'m ready for high risk' },
        { value: 4, label: isId ? 'Pertumbuhan sedang dengan risiko sedang' : 'Moderate growth with moderate risk' },
        { value: 3, label: isId ? 'Keseimbangan antara pertumbuhan dan keamanan' : 'Balance between growth and security' },
        { value: 2, label: isId ? 'Melindungi modal, pertumbuhan sedang saja' : 'Protect capital, moderate growth only' },
        { value: 1, label: isId ? 'Keamanan utama, tidak ingin rugi' : 'Safety first, don\'t want losses' }
      ]
    },
    // Q4: Reaction to 20% Drop
    {
      id: 'risk_q4',
      text: isId ? 'Jika nilai investasi Anda turun 20% dalam 1 tahun, apa reaksi Anda?' : 'If your investment drops 20% in 1 year, what is your reaction?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'tolerance',
      options: [
        { value: 5, label: isId ? 'Tidak masalah, saya tambah beli' : 'No problem, I\'ll buy more' },
        { value: 4, label: isId ? 'Sedikit khawatir tapi tetap hold' : 'Slightly worried but hold' },
        { value: 3, label: isId ? 'Agak gelisah, mungkin kurangi posisi' : 'Somewhat anxious, might reduce position' },
        { value: 2, label: isId ? 'Sangat khawatir, akan jual sebagian' : 'Very worried, will sell some' },
        { value: 1, label: isId ? 'Panik, akan jual semua' : 'Panic, will sell everything' }
      ]
    },
    // Q5: Investment Experience
    {
      id: 'risk_q5',
      text: isId ? 'Berapa pengalaman Anda berinvestasi di pasar saham/reksadana saham?' : 'How much experience do you have investing in stocks/equity funds?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'knowledge',
      options: [
        { value: 5, label: isId ? '>5 tahun, sering aktif' : '>5 years, often active' },
        { value: 4, label: isId ? '3-5 tahun' : '3-5 years' },
        { value: 3, label: isId ? '1-2 tahun' : '1-2 years' },
        { value: 2, label: isId ? '<1 tahun' : '<1 year' },
        { value: 1, label: isId ? 'Belum pernah' : 'Never' }
      ]
    },
    // Q6: Income Allocation
    {
      id: 'risk_q6',
      text: isId ? 'Berapa persen penghasilan rumah tangga Anda yang bisa dialokasikan untuk investasi berisiko?' : 'What percentage of your household income can be allocated to risky investments?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'capacity',
      options: [
        { value: 5, label: '>30%' },
        { value: 4, label: '20-30%' },
        { value: 3, label: '10-19%' },
        { value: 2, label: '5-9%' },
        { value: 1, label: isId ? '<5% atau tidak ada' : '<5% or none' }
      ]
    },
    // Q7: Emergency Fund
    {
      id: 'risk_q7',
      text: isId ? 'Anda memiliki dana darurat berapa bulan pengeluaran?' : 'How many months of expenses do you have in emergency fund?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'capacity',
      options: [
        { value: 5, label: isId ? '>12 bulan' : '>12 months' },
        { value: 4, label: isId ? '9-12 bulan' : '9-12 months' },
        { value: 3, label: isId ? '6-8 bulan' : '6-8 months' },
        { value: 2, label: isId ? '3-5 bulan' : '3-5 months' },
        { value: 1, label: isId ? '<3 bulan' : '<3 months' }
      ]
    },
    // Q8: Volatility Comfort
    {
      id: 'risk_q8',
      text: isId ? 'Mana pernyataan yang paling sesuai dengan Anda?' : 'Which statement best describes you?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'tolerance',
      options: [
        { value: 5, label: isId ? 'Saya nyaman dengan fluktuasi besar demi potensi keuntungan tinggi' : 'I\'m comfortable with big fluctuations for high potential gains' },
        { value: 4, label: isId ? 'Saya oke dengan fluktuasi sedang' : 'I\'m okay with moderate fluctuations' },
        { value: 3, label: isId ? 'Saya ingin fluktuasi minimal' : 'I want minimal fluctuations' },
        { value: 2, label: isId ? 'Saya tidak suka melihat nilai turun sama sekali' : 'I don\'t like seeing any value decrease' },
        { value: 1, label: isId ? 'Saya tidak tahan melihat portofolio merah' : 'I can\'t stand seeing my portfolio in red' }
      ]
    },
    // Q9: Dependents
    {
      id: 'risk_q9',
      text: isId ? 'Apakah Anda punya tanggungan (anak/orang tua yang harus dibantu)?' : 'Do you have dependents (children/parents to support)?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'capacity',
      options: [
        { value: 5, label: isId ? 'Tidak ada' : 'None' },
        { value: 4, label: isId ? '1 orang' : '1 person' },
        { value: 3, label: isId ? '2 orang' : '2 people' },
        { value: 2, label: isId ? '3 orang' : '3 people' },
        { value: 1, label: isId ? '4 orang atau lebih' : '4 or more people' }
      ]
    },
    // Q10: Hypothetical Portfolio Choice
    {
      id: 'risk_q10',
      text: isId ? 'Jika harus pilih satu portofolio hipotetis (return rata-rata tahunan historis), mana yang Anda pilih?' : 'If you had to choose one hypothetical portfolio (historical average annual return), which would you choose?',
      type: QuestionType.MULTIPLE_CHOICE,
      weight: 1,
      dimension: 'tolerance',
      options: [
        { value: 5, label: isId ? '+12% tapi bisa turun sampai -30% di tahun buruk' : '+12% but could drop to -30% in bad years' },
        { value: 4, label: isId ? '+9% tapi bisa turun sampai -20%' : '+9% but could drop to -20%' },
        { value: 3, label: isId ? '+7% tapi bisa turun sampai -12%' : '+7% but could drop to -12%' },
        { value: 2, label: isId ? '+5% tapi bisa turun sampai -5%' : '+5% but could drop to -5%' },
        { value: 1, label: isId ? '+3% dengan hampir tidak ada risiko turun' : '+3% with almost no downside risk' }
      ]
    }
  ];
};

// UMKM Business Maturity Questions (Business Model Canvas)
const getUmkmQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Value Proposition
    { text: isId ? "Produk/jasa saya memecahkan masalah nyata pelanggan" : "My product/service solves real customer problems", dimension: 'value' },
    { text: isId ? "Saya bisa menjelaskan keunikan bisnis saya dalam satu kalimat" : "I can explain my business uniqueness in one sentence", dimension: 'value' },
    { text: isId ? "Pelanggan rela membayar lebih untuk nilai yang saya berikan" : "Customers are willing to pay more for the value I provide", dimension: 'value' },
    
    // Customer Segments
    { text: isId ? "Saya tahu persis siapa target pelanggan ideal saya" : "I know exactly who my ideal target customers are", dimension: 'customer' },
    { text: isId ? "Saya memahami pain points dan kebutuhan pelanggan" : "I understand customer pain points and needs", dimension: 'customer' },
    { text: isId ? "Saya memiliki data demografis pelanggan yang jelas" : "I have clear customer demographic data", dimension: 'customer' },
    
    // Channels
    { text: isId ? "Saya memiliki saluran distribusi yang efektif" : "I have effective distribution channels", dimension: 'channel' },
    { text: isId ? "Pelanggan mudah menemukan dan membeli dari saya" : "Customers can easily find and buy from me", dimension: 'channel' },
    { text: isId ? "Saya hadir di platform yang relevan dengan target pasar" : "I'm present on platforms relevant to my target market", dimension: 'channel' },
    
    // Revenue Streams
    { text: isId ? "Saya memiliki lebih dari satu sumber pendapatan" : "I have more than one revenue source", dimension: 'revenue' },
    { text: isId ? "Pendapatan bisnis saya predictable dan recurring" : "My business revenue is predictable and recurring", dimension: 'revenue' },
    { text: isId ? "Margin keuntungan saya sehat dan sustainable" : "My profit margins are healthy and sustainable", dimension: 'revenue' },
    
    // Key Resources
    { text: isId ? "Saya memiliki tim atau sistem yang bisa berjalan tanpa saya" : "I have a team or system that can run without me", dimension: 'resources' },
    { text: isId ? "Aset dan IP bisnis saya terlindungi" : "My business assets and IP are protected", dimension: 'resources' },
    { text: isId ? "Saya memiliki modal kerja yang cukup untuk operasional" : "I have sufficient working capital for operations", dimension: 'resources' }
  ];

  return questions.map((q, i) => ({
    id: `umkm_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Business Sustainability Questions (Triple Bottom Line)
const getSustainabilityQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Profit
    { text: isId ? "Bisnis saya profitable secara konsisten" : "My business is consistently profitable", dimension: 'profit' },
    { text: isId ? "Saya memiliki runway finansial minimal 6 bulan" : "I have at least 6 months financial runway", dimension: 'profit' },
    { text: isId ? "Pertumbuhan pendapatan saya stabil atau meningkat" : "My revenue growth is stable or increasing", dimension: 'profit' },
    
    // People
    { text: isId ? "Tim saya engaged dan memiliki work-life balance" : "My team is engaged and has work-life balance", dimension: 'people' },
    { text: isId ? "Saya berinvestasi dalam pengembangan karyawan" : "I invest in employee development", dimension: 'people' },
    { text: isId ? "Tingkat turnover karyawan saya rendah" : "My employee turnover rate is low", dimension: 'people' },
    
    // Planet
    { text: isId ? "Bisnis saya mempertimbangkan dampak lingkungan" : "My business considers environmental impact", dimension: 'planet' },
    { text: isId ? "Saya mengurangi limbah dan mengoptimalkan sumber daya" : "I reduce waste and optimize resources", dimension: 'planet' },
    { text: isId ? "Saya memiliki inisiatif sustainability yang terukur" : "I have measurable sustainability initiatives", dimension: 'planet' },
    
    // Resilience
    { text: isId ? "Bisnis saya bisa bertahan di kondisi ekonomi sulit" : "My business can survive difficult economic conditions", dimension: 'resilience' },
    { text: isId ? "Saya memiliki rencana kontingensi untuk krisis" : "I have contingency plans for crises", dimension: 'resilience' },
    { text: isId ? "Supply chain saya tidak tergantung satu vendor saja" : "My supply chain doesn't depend on just one vendor", dimension: 'resilience' }
  ];

  return questions.map((q, i) => ({
    id: `sust_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Leadership Style Questions (Situational Leadership)
const getLeadershipQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Directing (S1)
    { text: isId ? "Saya memberikan instruksi jelas dan spesifik kepada tim baru" : "I give clear and specific instructions to new team members", dimension: 'directing' },
    { text: isId ? "Saya nyaman mengambil kendali penuh saat diperlukan" : "I'm comfortable taking full control when needed", dimension: 'directing' },
    { text: isId ? "Saya memonitor progress secara ketat untuk tugas kritis" : "I monitor progress closely for critical tasks", dimension: 'directing' },
    { text: isId ? "Saya membuat keputusan cepat dalam situasi darurat" : "I make quick decisions in emergency situations", dimension: 'directing' },
    
    // Coaching (S2)
    { text: isId ? "Saya menjelaskan 'mengapa' di balik setiap keputusan" : "I explain the 'why' behind every decision", dimension: 'coaching' },
    { text: isId ? "Saya mengajukan pertanyaan untuk mengembangkan pemikiran tim" : "I ask questions to develop team thinking", dimension: 'coaching' },
    { text: isId ? "Saya memberikan feedback konstruktif secara rutin" : "I give constructive feedback regularly", dimension: 'coaching' },
    { text: isId ? "Saya membantu tim melihat perspektif yang lebih luas" : "I help the team see broader perspectives", dimension: 'coaching' },
    
    // Supporting (S3)
    { text: isId ? "Saya mendorong tim untuk mencari solusi sendiri" : "I encourage the team to find solutions themselves", dimension: 'supporting' },
    { text: isId ? "Saya memberikan dukungan emosional saat tim menghadapi tantangan" : "I provide emotional support when the team faces challenges", dimension: 'supporting' },
    { text: isId ? "Saya mendengarkan lebih banyak daripada berbicara" : "I listen more than I talk", dimension: 'supporting' },
    { text: isId ? "Saya merayakan keberhasilan tim secara publik" : "I celebrate team successes publicly", dimension: 'supporting' },
    
    // Delegating (S4)
    { text: isId ? "Saya memberikan otonomi penuh kepada anggota tim yang kompeten" : "I give full autonomy to competent team members", dimension: 'delegating' },
    { text: isId ? "Saya percaya tim untuk mengambil keputusan tanpa saya" : "I trust the team to make decisions without me", dimension: 'delegating' },
    { text: isId ? "Saya fokus pada hasil, bukan proses detail" : "I focus on results, not detailed processes", dimension: 'delegating' }
  ];

  return questions.map((q, i) => ({
    id: `lead_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// EQ Assessment Questions (Goleman)
const getEqQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Self-Awareness
    { text: isId ? "Saya mengenali emosi saya saat terjadi" : "I recognize my emotions as they happen", dimension: 'self_awareness' },
    { text: isId ? "Saya memahami kekuatan dan kelemahan saya" : "I understand my strengths and weaknesses", dimension: 'self_awareness' },
    { text: isId ? "Saya tahu bagaimana emosi mempengaruhi kinerja saya" : "I know how emotions affect my performance", dimension: 'self_awareness' },
    
    // Self-Regulation
    { text: isId ? "Saya bisa mengendalikan dorongan impulsif" : "I can control impulsive urges", dimension: 'self_regulation' },
    { text: isId ? "Saya tetap tenang di bawah tekanan" : "I stay calm under pressure", dimension: 'self_regulation' },
    { text: isId ? "Saya berpikir sebelum bertindak dalam situasi emosional" : "I think before acting in emotional situations", dimension: 'self_regulation' },
    
    // Motivation
    { text: isId ? "Saya tetap optimis meski menghadapi kemunduran" : "I stay optimistic despite setbacks", dimension: 'motivation' },
    { text: isId ? "Saya termotivasi oleh tujuan intrinsik, bukan hanya reward" : "I'm motivated by intrinsic goals, not just rewards", dimension: 'motivation' },
    
    // Empathy
    { text: isId ? "Saya bisa merasakan emosi orang lain" : "I can sense others' emotions", dimension: 'empathy' },
    { text: isId ? "Saya mendengarkan dengan penuh perhatian tanpa menghakimi" : "I listen attentively without judging", dimension: 'empathy' },
    { text: isId ? "Saya memahami perspektif orang yang berbeda dari saya" : "I understand perspectives different from mine", dimension: 'empathy' },
    
    // Social Skills
    { text: isId ? "Saya efektif dalam mempengaruhi dan meyakinkan orang" : "I'm effective at influencing and persuading people", dimension: 'social' }
  ];

  return questions.map((q, i) => ({
    id: `eq_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Brand Clarity Questions (Brand Archetypes)
const getBrandQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Brand Identity
    { text: isId ? "Saya memiliki logo dan identitas visual yang konsisten" : "I have consistent logo and visual identity", dimension: 'identity' },
    { text: isId ? "Brand personality saya jelas dan berbeda dari kompetitor" : "My brand personality is clear and different from competitors", dimension: 'identity' },
    { text: isId ? "Tim saya memahami dan bisa menjelaskan brand dengan benar" : "My team understands and can explain the brand correctly", dimension: 'identity' },
    
    // Brand Message
    { text: isId ? "Pesan brand saya mudah dipahami target audiens" : "My brand message is easily understood by target audience", dimension: 'message' },
    { text: isId ? "Saya memiliki tagline yang memorable" : "I have a memorable tagline", dimension: 'message' },
    { text: isId ? "Storytelling brand saya menyentuh emosi pelanggan" : "My brand storytelling touches customer emotions", dimension: 'message' },
    
    // Consistency
    { text: isId ? "Komunikasi saya konsisten di semua channel" : "My communication is consistent across all channels", dimension: 'consistency' },
    { text: isId ? "Pengalaman pelanggan sama di setiap touchpoint" : "Customer experience is the same at every touchpoint", dimension: 'consistency' },
    
    // Differentiation
    { text: isId ? "Pelanggan tahu apa yang membedakan saya dari kompetitor" : "Customers know what differentiates me from competitors", dimension: 'differentiation' },
    { text: isId ? "Brand saya memiliki positioning yang unik di pasar" : "My brand has unique positioning in the market", dimension: 'differentiation' }
  ];

  return questions.map((q, i) => ({
    id: `brand_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Content Strategy Questions (Inbound Marketing)
const getContentQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Attract
    { text: isId ? "Konten saya menarik audiens baru secara organik" : "My content attracts new audiences organically", dimension: 'attract' },
    { text: isId ? "Saya memahami keyword dan topik yang dicari target" : "I understand keywords and topics my target searches for", dimension: 'attract' },
    { text: isId ? "SEO konten saya sudah dioptimasi" : "My content SEO is optimized", dimension: 'attract' },
    
    // Engage
    { text: isId ? "Konten saya mendapat engagement tinggi (like, comment, share)" : "My content gets high engagement (like, comment, share)", dimension: 'engage' },
    { text: isId ? "Saya memiliki lead magnet yang efektif" : "I have effective lead magnets", dimension: 'engage' },
    { text: isId ? "Konten saya mendorong audiens untuk mengambil tindakan" : "My content drives audience to take action", dimension: 'engage' },
    
    // Delight
    { text: isId ? "Pelanggan merekomendasikan brand saya ke orang lain" : "Customers recommend my brand to others", dimension: 'delight' },
    { text: isId ? "Saya memiliki program loyalty atau referral" : "I have loyalty or referral programs", dimension: 'delight' },
    { text: isId ? "Pelanggan membagikan konten saya secara sukarela" : "Customers share my content voluntarily", dimension: 'delight' },
    
    // Consistency
    { text: isId ? "Saya memiliki content calendar yang dijalankan konsisten" : "I have a content calendar that's executed consistently", dimension: 'consistency' },
    { text: isId ? "Kualitas konten saya terjaga dari waktu ke waktu" : "My content quality is maintained over time", dimension: 'consistency' },
    { text: isId ? "Saya posting sesuai jadwal yang sudah ditentukan" : "I post according to the determined schedule", dimension: 'consistency' }
  ];

  return questions.map((q, i) => ({
    id: `content_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Burnout Assessment Questions (MBI)
const getBurnoutQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Emotional Exhaustion
    { text: isId ? "Saya merasa kelelahan emosional dari pekerjaan" : "I feel emotionally drained from work", dimension: 'exhaustion', reverse: true },
    { text: isId ? "Saya merasa lelah saat bangun dan harus menghadapi hari kerja" : "I feel tired when I wake up and face another workday", dimension: 'exhaustion', reverse: true },
    { text: isId ? "Bekerja sepanjang hari benar-benar menguras tenaga saya" : "Working all day is really draining for me", dimension: 'exhaustion', reverse: true },
    { text: isId ? "Saya merasa frustrasi dengan pekerjaan saya" : "I feel frustrated by my job", dimension: 'exhaustion', reverse: true },
    
    // Cynicism/Depersonalization
    { text: isId ? "Saya menjadi lebih sinis terhadap pekerjaan" : "I've become more cynical about work", dimension: 'cynicism', reverse: true },
    { text: isId ? "Saya kurang antusias dengan pekerjaan dibanding dulu" : "I'm less enthusiastic about work than before", dimension: 'cynicism', reverse: true },
    { text: isId ? "Saya merasa pekerjaan saya tidak bermakna" : "I feel my work is meaningless", dimension: 'cynicism', reverse: true },
    
    // Professional Efficacy (Positive - not reversed)
    { text: isId ? "Saya merasa efektif dalam menyelesaikan pekerjaan" : "I feel effective in accomplishing work", dimension: 'efficacy' },
    { text: isId ? "Saya merasa membuat kontribusi berarti" : "I feel I make meaningful contributions", dimension: 'efficacy' },
    { text: isId ? "Saya percaya diri dengan kemampuan profesional saya" : "I'm confident in my professional abilities", dimension: 'efficacy' }
  ];

  return questions.map((q, i) => ({
    id: `burnout_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension,
    reverse: q.reverse || false
  }));
};

// Lifestyle Balance Questions (Biopsychosocial)
const getLifestyleQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Physical
    { text: isId ? "Saya berolahraga minimal 3x seminggu" : "I exercise at least 3 times a week", dimension: 'physical' },
    { text: isId ? "Saya tidur 7-8 jam setiap malam" : "I sleep 7-8 hours every night", dimension: 'physical' },
    { text: isId ? "Pola makan saya seimbang dan teratur" : "My eating pattern is balanced and regular", dimension: 'physical' },
    
    // Mental
    { text: isId ? "Saya memiliki waktu untuk relaksasi setiap hari" : "I have time for relaxation every day", dimension: 'mental' },
    { text: isId ? "Saya mengelola stres dengan baik" : "I manage stress well", dimension: 'mental' },
    { text: isId ? "Saya memiliki hobi yang menyenangkan di luar pekerjaan" : "I have enjoyable hobbies outside work", dimension: 'mental' },
    
    // Social
    { text: isId ? "Saya memiliki hubungan sosial yang memuaskan" : "I have satisfying social relationships", dimension: 'social' },
    { text: isId ? "Saya menghabiskan waktu berkualitas dengan orang tersayang" : "I spend quality time with loved ones", dimension: 'social' },
    
    // Purpose
    { text: isId ? "Saya merasa hidup saya memiliki tujuan yang jelas" : "I feel my life has a clear purpose", dimension: 'purpose' },
    { text: isId ? "Aktivitas harian saya selaras dengan nilai-nilai saya" : "My daily activities align with my values", dimension: 'purpose' }
  ];

  return questions.map((q, i) => ({
    id: `lifebal_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Life Clarity Questions (Wheel of Life)
const getLifeQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Career
    { text: isId ? "Saya puas dengan perkembangan karier saya" : "I'm satisfied with my career development", dimension: 'career' },
    { text: isId ? "Pekerjaan saya memberikan kepuasan dan makna" : "My work provides satisfaction and meaning", dimension: 'career' },
    
    // Finance
    { text: isId ? "Kondisi keuangan saya stabil dan terkontrol" : "My financial condition is stable and controlled", dimension: 'finance' },
    { text: isId ? "Saya tidak khawatir tentang uang sehari-hari" : "I don't worry about money day-to-day", dimension: 'finance' },
    
    // Health
    { text: isId ? "Kesehatan fisik saya dalam kondisi prima" : "My physical health is in prime condition", dimension: 'health' },
    { text: isId ? "Saya proaktif menjaga kesehatan" : "I'm proactive in maintaining health", dimension: 'health' },
    
    // Relationships
    { text: isId ? "Hubungan dengan keluarga dan teman saya harmonis" : "My relationships with family and friends are harmonious", dimension: 'relationships' },
    { text: isId ? "Saya merasa didukung oleh orang-orang di sekitar saya" : "I feel supported by people around me", dimension: 'relationships' },
    
    // Personal Growth
    { text: isId ? "Saya terus belajar dan berkembang" : "I continue to learn and grow", dimension: 'growth' },
    { text: isId ? "Saya memiliki goals yang jelas dan terukur" : "I have clear and measurable goals", dimension: 'growth' }
  ];

  return questions.map((q, i) => ({
    id: `life_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Decision Readiness Index Questions (WRAP)
const getDecisionQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Widen Options
    { text: isId ? "Saya mempertimbangkan lebih dari 2 pilihan sebelum memutuskan" : "I consider more than 2 options before deciding", dimension: 'widen' },
    { text: isId ? "Saya mencari perspektif dari orang yang berpikir berbeda" : "I seek perspectives from people who think differently", dimension: 'widen' },
    { text: isId ? "Saya tidak terjebak dalam pola 'ini atau itu'" : "I don't get trapped in 'this or that' patterns", dimension: 'widen' },
    
    // Reality-Test
    { text: isId ? "Saya mencari data untuk memvalidasi asumsi saya" : "I seek data to validate my assumptions", dimension: 'reality' },
    { text: isId ? "Saya melakukan eksperimen kecil sebelum komitmen besar" : "I do small experiments before big commitments", dimension: 'reality' },
    
    // Attain Distance
    { text: isId ? "Saya tidak membuat keputusan besar saat emosional" : "I don't make big decisions when emotional", dimension: 'distance' },
    { text: isId ? "Saya bertanya 'apa yang akan saya sarankan ke teman?'" : "I ask 'what would I advise a friend?'", dimension: 'distance' },
    { text: isId ? "Saya mempertimbangkan dampak 10 tahun ke depan" : "I consider the impact 10 years from now", dimension: 'distance' },
    
    // Prepare to be Wrong
    { text: isId ? "Saya memiliki rencana cadangan jika keputusan salah" : "I have a backup plan if the decision is wrong", dimension: 'prepare' },
    { text: isId ? "Saya menetapkan tripwire untuk mengevaluasi keputusan" : "I set tripwires to evaluate decisions", dimension: 'prepare' }
  ];

  return questions.map((q, i) => ({
    id: `decide_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Coaching Readiness Questions (Transtheoretical)
const getCoachingQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Self-Awareness
    { text: isId ? "Saya menyadari area yang perlu saya kembangkan" : "I'm aware of areas I need to develop", dimension: 'awareness' },
    { text: isId ? "Saya menerima feedback dengan terbuka" : "I accept feedback openly", dimension: 'awareness' },
    { text: isId ? "Saya jujur tentang kekurangan saya" : "I'm honest about my shortcomings", dimension: 'awareness' },
    
    // Openness to Change
    { text: isId ? "Saya siap keluar dari zona nyaman" : "I'm ready to step out of my comfort zone", dimension: 'openness' },
    { text: isId ? "Saya melihat kesulitan sebagai peluang belajar" : "I see difficulties as learning opportunities", dimension: 'openness' },
    { text: isId ? "Saya tidak defensif saat dikritik" : "I'm not defensive when criticized", dimension: 'openness' },
    { text: isId ? "Saya bersedia mengubah kebiasaan lama yang tidak efektif" : "I'm willing to change old ineffective habits", dimension: 'openness' },
    
    // Action Orientation
    { text: isId ? "Saya menerapkan apa yang saya pelajari dengan segera" : "I apply what I learn immediately", dimension: 'action' },
    { text: isId ? "Saya konsisten dalam menjalankan action plan" : "I'm consistent in executing action plans", dimension: 'action' },
    { text: isId ? "Saya tidak hanya belajar tapi juga mempraktikkan" : "I don't just learn but also practice", dimension: 'action' }
  ];

  return questions.map((q, i) => ({
    id: `coach_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Imposter Syndrome Questions (Clance Scale)
const getImposterQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Achievement Doubt
    { text: isId ? "Saya takut orang lain akan menyadari saya tidak sekompeten yang mereka kira" : "I fear others will discover I'm not as competent as they think", dimension: 'achievement', reverse: true },
    { text: isId ? "Saya sering merasa tidak pantas atas kesuksesan saya" : "I often feel undeserving of my success", dimension: 'achievement', reverse: true },
    { text: isId ? "Saya meragukan kemampuan saya meski ada bukti keberhasilan" : "I doubt my abilities despite evidence of success", dimension: 'achievement', reverse: true },
    
    // External Attribution
    { text: isId ? "Saya menganggap kesuksesan saya karena keberuntungan" : "I attribute my success to luck", dimension: 'attribution', reverse: true },
    { text: isId ? "Saya merasa orang lain memiliki ekspektasi terlalu tinggi pada saya" : "I feel others have too high expectations of me", dimension: 'attribution', reverse: true },
    { text: isId ? "Saya sulit menerima pujian dengan tulus" : "I have difficulty accepting compliments genuinely", dimension: 'attribution', reverse: true },
    { text: isId ? "Saya pikir timing yang tepat lebih berperan dari kemampuan saya" : "I think right timing plays more role than my ability", dimension: 'attribution', reverse: true },
    
    // Social Comparison
    { text: isId ? "Saya sering membandingkan diri dengan orang yang lebih sukses" : "I often compare myself to more successful people", dimension: 'comparison', reverse: true },
    { text: isId ? "Saya merasa orang lain lebih mampu dari saya" : "I feel others are more capable than me", dimension: 'comparison', reverse: true },
    { text: isId ? "Saya takut gagal dan mengecewakan orang lain" : "I fear failing and disappointing others", dimension: 'comparison', reverse: true }
  ];

  return questions.map((q, i) => ({
    id: `imposter_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension,
    reverse: q.reverse || false
  }));
};

// Travel Personality Questions (Plog's Model)
const getTravelQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Adventure Seeking (Allocentric)
    { text: isId ? "Saya lebih suka destinasi yang belum banyak dikunjungi turis" : "I prefer destinations not yet visited by many tourists", dimension: 'adventure' },
    { text: isId ? "Saya menikmati tantangan dan ketidakpastian saat traveling" : "I enjoy challenges and uncertainty when traveling", dimension: 'adventure' },
    { text: isId ? "Saya suka berinteraksi dengan budaya lokal yang berbeda" : "I like interacting with different local cultures", dimension: 'adventure' },
    { text: isId ? "Saya lebih suka merencanakan sendiri daripada ikut tour" : "I prefer planning myself rather than joining tours", dimension: 'adventure' },
    
    // Comfort Preference (Psychocentric)
    { text: isId ? "Saya lebih nyaman dengan destinasi yang familiar dan populer" : "I'm more comfortable with familiar and popular destinations", dimension: 'comfort' },
    { text: isId ? "Fasilitas dan kenyamanan penting bagi saya saat traveling" : "Facilities and comfort are important to me when traveling", dimension: 'comfort' },
    { text: isId ? "Saya lebih suka akomodasi berbintang daripada homestay" : "I prefer star-rated accommodations over homestays", dimension: 'comfort' },
    
    // Novelty Seeking
    { text: isId ? "Saya selalu ingin mencoba makanan dan pengalaman baru" : "I always want to try new food and experiences", dimension: 'novelty' },
    { text: isId ? "Saya bosan jika mengunjungi tempat yang sama dua kali" : "I get bored if visiting the same place twice", dimension: 'novelty' },
    { text: isId ? "Saya lebih tertarik dengan pengalaman unik daripada sightseeing biasa" : "I'm more interested in unique experiences than regular sightseeing", dimension: 'novelty' }
  ];

  return questions.map((q, i) => ({
    id: `travel_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// Umroh Readiness Questions
const getUmrohQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Spiritual Readiness
    { text: isId ? "Saya memahami makna dan tujuan ibadah umroh" : "I understand the meaning and purpose of umroh", dimension: 'spiritual' },
    { text: isId ? "Saya sudah belajar tata cara manasik umroh" : "I have learned the umroh rituals", dimension: 'spiritual' },
    { text: isId ? "Saya melakukan persiapan spiritual (doa, dzikir) secara rutin" : "I do spiritual preparation (prayer, dhikr) regularly", dimension: 'spiritual' },
    
    // Financial Readiness
    { text: isId ? "Dana umroh saya sudah terkumpul 100%" : "My umroh funds are 100% collected", dimension: 'financial' },
    { text: isId ? "Dana tersebut berasal dari sumber yang halal" : "The funds come from halal sources", dimension: 'financial' },
    { text: isId ? "Saya sudah menyiapkan dana darurat terpisah" : "I have prepared separate emergency funds", dimension: 'financial' },
    
    // Physical Readiness
    { text: isId ? "Kondisi fisik saya siap untuk ibadah yang cukup berat" : "My physical condition is ready for demanding worship", dimension: 'physical' },
    { text: isId ? "Saya rutin berolahraga untuk stamina" : "I exercise regularly for stamina", dimension: 'physical' },
    
    // Knowledge
    { text: isId ? "Saya memahami syarat sah dan rukun umroh" : "I understand the requirements and pillars of umroh", dimension: 'knowledge' },
    { text: isId ? "Saya tahu doa-doa yang dibaca saat umroh" : "I know the prayers recited during umroh", dimension: 'knowledge' }
  ];

  return questions.map((q, i) => ({
    id: `umroh_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// AI Adoption Readiness Questions (TAM)
const getAiQuestions = (lang: Language) => {
  const isId = lang === 'id';
  
  const questions = [
    // Perceived Usefulness
    { text: isId ? "Saya percaya AI bisa meningkatkan produktivitas saya" : "I believe AI can increase my productivity", dimension: 'usefulness' },
    { text: isId ? "AI akan memberikan keunggulan kompetitif dalam pekerjaan saya" : "AI will give competitive advantage in my work", dimension: 'usefulness' },
    { text: isId ? "Saya sudah merasakan manfaat nyata dari tools AI" : "I have felt real benefits from AI tools", dimension: 'usefulness' },
    
    // Ease of Use
    { text: isId ? "Tools AI mudah saya pahami dan gunakan" : "AI tools are easy for me to understand and use", dimension: 'ease' },
    { text: isId ? "Saya tidak takut mencoba teknologi AI baru" : "I'm not afraid to try new AI technology", dimension: 'ease' },
    { text: isId ? "Saya bisa mengintegrasikan AI ke workflow saya" : "I can integrate AI into my workflow", dimension: 'ease' },
    
    // Technical Readiness
    { text: isId ? "Saya familiar dengan berbagai tools AI (ChatGPT, Midjourney, dll)" : "I'm familiar with various AI tools (ChatGPT, Midjourney, etc)", dimension: 'readiness' },
    { text: isId ? "Saya mengikuti perkembangan AI secara aktif" : "I actively follow AI developments", dimension: 'readiness' },
    
    // Growth Mindset
    { text: isId ? "Saya siap belajar skill baru untuk era AI" : "I'm ready to learn new skills for the AI era", dimension: 'mindset' },
    { text: isId ? "Saya melihat AI sebagai partner, bukan ancaman" : "I see AI as a partner, not a threat", dimension: 'mindset' }
  ];

  return questions.map((q, i) => ({
    id: `ai_q${i + 1}`,
    text: q.text,
    type: QuestionType.LIKERT,
    weight: 1,
    dimension: q.dimension
  }));
};

// ============================================
// MAIN TEST CATALOG
// ============================================

export const getMockTests = (lang: Language = 'en'): Test[] => [
  // --- DECISION & OPPORTUNITY ---
  {
    id: 't_drd',
    title: lang === 'id' ? 'Decision Readiness Diagnostic (DRD)' : 'Decision Readiness Diagnostic (DRD)',
    category: TestCategory.DECISION,
    description: lang === 'id' 
      ? 'Jangan andalkan "hoki". Ukur kesiapan kognitif, emosional, dan informasi Anda sebelum mengambil keputusan besar.' 
      : 'Don\'t rely on luck. Measure your cognitive, emotional, and informational readiness before making high-stakes decisions.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 7,
    questions: getDrdQuestions(lang),
    dimensions: DRD_DIMENSIONS,
    methodology: {
      name: 'Integrated Decision Readiness Framework',
      author: 'Diagnospace Research',
      source: 'Behavioral Economics & Cognitive Science',
      description: lang === 'id'
        ? 'Menggabungkan Executive Function theory dan regulasi emosi untuk mencegah "decision fatigue" dan bias kognitif.'
        : 'Combines Executive Function theory and emotional regulation research to prevent decision fatigue and cognitive bias.'
    }
  },
  {
    id: 't_ord',
    title: lang === 'id' ? 'Opportunity Readiness Diagnostic (ORD)' : 'Opportunity Readiness Diagnostic (ORD)',
    category: TestCategory.DECISION,
    description: lang === 'id'
      ? 'Apakah saya siap MENANGKAP peluang sekarang? Ukur kesiapan sumber daya, mental, dan kecepatan eksekusi Anda.'
      : 'Am I ready to CAPTURE opportunity now? Measure your resource, mental, and execution readiness.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 8,
    questions: getOrdQuestions(lang),
    dimensions: ORD_DIMENSIONS,
    methodology: {
      name: 'Opportunity Capture Framework',
      author: 'Diagnospace Research',
      source: 'Opportunity Recognition & Behavioral Economics',
      description: lang === 'id'
        ? 'Mengevaluasi 5 dimensi: Kepekaan (Alertness), Sinkronisasi Sumber Daya, Kecepatan Eksekusi, Kalibrasi Risiko, dan Pemulihan.'
        : 'Evaluates 5 dimensions: Alertness, Resource Synchronization, Execution Velocity, Risk Calibration, and Recovery.'
    }
  },
  {
    id: 't_tsd',
    title: lang === 'id' ? 'Timing Sensitivity Diagnostic (TSD)' : 'Timing Sensitivity Diagnostic (TSD)',
    category: TestCategory.DECISION,
    description: lang === 'id'
      ? 'Apakah saya terlalu cepat, terlalu lambat, atau tepat waktu? Ukur pola timing keputusan Anda untuk menghindari penyesalan.'
      : 'Am I too fast, too slow, or on time? Measure your decision timing patterns to avoid regret.',
    accessLevel: AccessLevel.PREMIUM,
    durationMinutes: 7,
    questions: getTsdQuestions(lang),
    dimensions: TSD_DIMENSIONS,
    methodology: {
      name: 'Temporal Decision Dynamics',
      author: 'Diagnospace Research',
      source: 'Decision Timing Theory & Behavioral Economics',
      description: lang === 'id'
        ? 'Menganalisis keseimbangan antara kecepatan impuls dan kecenderungan menunda untuk menentukan profil waktu yang optimal.'
        : 'Analyzes the balance between impulse speed and delay tendency to determine optimal timing profiles.'
    }
  },

  // --- SYMBOLIC & ALIGNMENT ---
  {
    id: 't_sad',
    title: lang === 'id' ? 'Symbolic Alignment Diagnostic (SAD)' : 'Symbolic Alignment Diagnostic (SAD)',
    category: TestCategory.SYMBOLIC,
    description: lang === 'id'
      ? 'Temukan bagaimana simbol, warna, dan lingkungan mempengaruhi cara Anda berpikir dan bertindak.'
      : 'Discover how symbols, colors, and environment affect your thinking and action patterns.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 6,
    questions: getSadQuestions(lang),
    dimensions: SAD_DIMENSIONS,
    methodology: {
      name: 'Symbolic-Cognitive Integration',
      author: 'Diagnospace Research',
      source: 'Environmental & Cognitive Psychology',
      description: lang === 'id'
        ? 'Mengukur kecocokan antara profil kognitif (Elemen) dan stimulus lingkungan (Warna/Ruang) untuk kinerja puncak.'
        : 'Measures the fit between cognitive profile (Elements) and environmental stimuli (Color/Space) for peak performance.'
    }
  },
  
  // --- PRODUCTIVITY ---
  {
    id: 't_emd',
    title: lang === 'id' ? 'Energy & Momentum Diagnostic (EMD)' : 'Energy & Momentum Diagnostic (EMD)',
    category: TestCategory.PRODUCTIVITY,
    description: lang === 'id'
      ? 'Kenapa saya paham harus ngapain, tapi susah konsisten? Ukur kesiapan energi fungsional & momentum eksekusi Anda.'
      : 'Why is it hard to stay consistent? Measure your functional energy readiness and execution momentum.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 7,
    questions: getEmdQuestions(lang),
    dimensions: EMD_DIMENSIONS,
    methodology: {
      name: 'Functional Energy Regulation Model',
      author: 'Diagnospace Research',
      source: 'Self-Regulation Theory & Productivity Science',
      description: lang === 'id'
        ? 'Mendiagnosis kebocoran energi (Energy Leakage) dan keberlanjutan fokus (Focus Sustainability) untuk konsistensi jangka panjang.'
        : 'Diagnoses energy leakage and focus sustainability to ensure long-term consistency and prevent burnout.'
    }
  },
  {
    id: 't3',
    title: lang === 'id' ? 'Diagnostik Manajemen Waktu' : 'Time Management Diagnostic',
    category: TestCategory.PRODUCTIVITY,
    description: lang === 'id' ? 'Temukan kebocoran waktu dan hambatan efisiensi Anda.' : 'Discover your time leaks and efficiency bottlenecks.',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 4,
    questions: getTimeQuestions(lang),
    dimensions: TIME_DIMENSIONS,
    methodology: {
      name: 'Eisenhower Matrix',
      author: 'Dwight D. Eisenhower',
      source: 'The 7 Habits of Highly Effective People',
      description: lang === 'id'
        ? 'Memprioritaskan tugas berdasarkan urgensi dan kepentingan untuk fokus pada yang benar-benar penting.'
        : 'Prioritizing tasks by urgency and importance to focus on what truly matters.'
    }
  },
  {
    id: 't4',
    title: lang === 'id' ? 'Skor Kebiasaan Atom' : 'Atomic Habits Score Check',
    category: TestCategory.PRODUCTIVITY,
    description: lang === 'id' ? 'Apakah kebiasaan harian Anda bekerja untuk atau melawan Anda?' : 'Are your daily habits compounding for or against you?',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 6,
    questions: getHabitQuestions(lang),
    dimensions: HABIT_DIMENSIONS,
    methodology: {
      name: 'Four Laws of Behavior Change',
      author: 'James Clear',
      source: 'Atomic Habits',
      description: lang === 'id'
        ? 'Menganalisis 4 hukum perubahan perilaku: Buat Terlihat (Cue), Buat Menarik (Craving), Buat Mudah (Response), Buat Memuaskan (Reward).'
        : 'Analyzes 4 laws of behavior change: Make it Obvious (Cue), Make it Attractive (Craving), Make it Easy (Response), Make it Satisfying (Reward).'
    }
  },
  {
    id: 't22',
    title: lang === 'id' ? 'Audit Fokus & Deep Work' : 'Deep Work & Focus Audit',
    category: TestCategory.PRODUCTIVITY,
    description: lang === 'id' ? 'Ukur kemampuan Anda untuk bekerja tanpa gangguan dalam waktu lama.' : 'Measure your ability to perform distraction-free concentration tasks.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 7,
    questions: getDeepWorkQuestions(lang),
    dimensions: DEEPWORK_DIMENSIONS,
    methodology: {
      name: 'Deep Work Theory',
      author: 'Cal Newport',
      source: 'Deep Work: Rules for Focused Success',
      description: lang === 'id' 
        ? 'Membedakan antara "Deep Work" (kognitif intensif) dan "Shallow Work" (logistik) untuk memaksimalkan output.'
        : 'Distinguishes between "Deep Work" (cognitively demanding) and "Shallow Work" (logistical style) to maximize output.'
    }
  },

  // --- FINANCE ---
  {
    id: 't1',
    title: lang === 'id' ? 'Cek Kesehatan Finansial' : 'Personal Financial Health Check',
    category: TestCategory.FINANCE,
    description: lang === 'id' ? 'Nilai stabilitas keuangan, tingkat tabungan, dan kesehatan portofolio investasi Anda.' : 'Assess your financial stability, savings rate, and investment portfolio health.',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 5,
    questions: getFinanceQuestions(lang),
    dimensions: FINANCE_DIMENSIONS,
    methodology: {
      name: lang === 'id' ? 'Aturan Anggaran 50/30/20' : '50/30/20 Budgeting Rule',
      author: 'Elizabeth Warren',
      source: 'All Your Worth: The Ultimate Lifetime Money Plan',
      description: lang === 'id' 
        ? 'Membagi pendapatan menjadi Kebutuhan (50%), Keinginan (30%), dan Tabungan (20%) untuk keberlanjutan finansial.'
        : 'Divides income into Needs (50%), Wants (30%), and Savings (20%) to ensure long-term sustainability.'
    }
  },
  {
    id: 't15',
    title: lang === 'id' ? 'Indeks Kebebasan Finansial' : 'Financial Freedom Progress Index',
    category: TestCategory.FINANCE,
    description: lang === 'id' ? 'Seberapa dekat Anda dengan pensiun dini dan kebebasan waktu?' : 'How close are you to early retirement and time freedom?',
    accessLevel: AccessLevel.PREMIUM,
    durationMinutes: 8,
    questions: getFireQuestions(lang),
    dimensions: FIRE_DIMENSIONS,
    methodology: {
      name: lang === 'id' ? 'Gerakan FIRE (Financial Independence)' : 'FIRE Movement Framework',
      author: 'Vicki Robin & Joe Dominguez',
      source: 'Your Money or Your Life',
      description: lang === 'id'
        ? 'Mengukur rasio tabungan dan "angka crossover" di mana pendapatan pasif melebihi biaya hidup.'
        : 'Measures savings rate and the "crossover point" where passive income exceeds living expenses.'
    }
  },
  {
    id: 't26',
    title: lang === 'id' ? 'Profil Risiko Investasi' : 'Investment Risk Tolerance',
    category: TestCategory.FINANCE,
    description: lang === 'id' ? 'Apakah Anda tipe Konservatif, Moderat, atau Agresif?' : 'Are you a Conservative, Moderate, or Aggressive investor?',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 4,
    questions: getRiskQuestions(lang),
    dimensions: RISK_DIMENSIONS,
    methodology: {
      name: 'Modern Portfolio Theory (MPT)',
      author: 'Harry Markowitz',
      source: 'Journal of Finance',
      description: lang === 'id'
        ? 'Menilai trade-off antara risiko dan pengembalian untuk membangun portofolio yang optimal.'
        : 'Assesses the trade-off between risk and return to construct an optimal portfolio.'
    }
  },

  // --- BUSINESS ---
  {
    id: 't2',
    title: lang === 'id' ? 'Diagnostik Kematangan Bisnis UMKM' : 'UMKM Business Maturity Diagnostic',
    category: TestCategory.BUSINESS,
    description: lang === 'id' ? 'Evaluasi bisnis kecil Anda di seluruh pilar operasi dan pemasaran.' : 'Evaluate your small business across operations and marketing pillars.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 10,
    questions: getUmkmQuestions(lang),
    dimensions: UMKM_DIMENSIONS,
    methodology: {
      name: 'Business Model Canvas (BMC)',
      author: 'Alexander Osterwalder',
      source: 'Business Model Generation',
      description: lang === 'id'
        ? 'Mengukur kekuatan di 9 blok bangunan utama bisnis, dari proposisi nilai hingga aliran pendapatan.'
        : 'Measures strength across the 9 key building blocks of business, from value proposition to revenue streams.'
    }
  },
  {
    id: 't16',
    title: lang === 'id' ? 'Indeks Keberlanjutan Bisnis' : 'Business Sustainability Index',
    category: TestCategory.BUSINESS,
    description: lang === 'id' ? 'Apakah bisnis Anda tahan banting terhadap resesi dan perubahan pasar?' : 'Is your business resilient against recession and market shifts?',
    accessLevel: AccessLevel.PREMIUM,
    durationMinutes: 12,
    questions: getSustainabilityQuestions(lang),
    dimensions: SUSTAINABILITY_DIMENSIONS,
    methodology: {
      name: 'Triple Bottom Line (TBL)',
      author: 'John Elkington',
      source: 'Cannibals with Forks',
      description: lang === 'id'
        ? 'Mengevaluasi bisnis berdasarkan Profit (Keuntungan), People (Manusia), dan Planet (Lingkungan) untuk umur panjang.'
        : 'Evaluates business based on Profit, People, and Planet to ensure long-term viability.'
    }
  },

  // --- PERSONAL & LIFE ---
  {
    id: 't17',
    title: lang === 'id' ? 'Diagnostik Kejelasan Hidup' : 'Life Clarity Diagnostic',
    category: TestCategory.PERSONAL,
    description: lang === 'id' ? 'Berhenti bingung. Temukan di mana Anda macet dan ke mana harus melangkah.' : 'Stop the confusion. Find out where you are stuck and where to go next.',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 6,
    questions: getLifeQuestions(lang),
    dimensions: LIFE_DIMENSIONS,
    methodology: {
      name: lang === 'id' ? 'Roda Kehidupan' : 'The Wheel of Life',
      author: 'Paul J. Meyer',
      source: 'Success Motivation Institute',
      description: lang === 'id'
        ? 'Alat visual untuk menilai kepuasan di berbagai domain kehidupan (Karier, Keuangan, Kesehatan, Hubungan).'
        : 'A visual tool to assess satisfaction across different life domains (Career, Finance, Health, Relationships).'
    }
  },
  {
    id: 't18',
    title: lang === 'id' ? 'Indeks Kesiapan Keputusan' : 'Decision Readiness Index',
    category: TestCategory.PERSONAL,
    description: lang === 'id' ? 'Cek apakah Anda siap mengambil keputusan besar (pindah, nikah, resign).' : 'Check if you are ready to make a big decision (move, marry, resign).',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 5,
    questions: getDecisionQuestions(lang),
    dimensions: DECISION_DIMENSIONS,
    methodology: {
      name: 'WRAP Framework',
      author: 'Chip & Dan Heath',
      source: 'Decisive',
      description: lang === 'id'
        ? 'Menilai proses keputusan: Widen options (Perluas opsi), Reality-test (Uji realitas), Attain distance (Jaga jarak), Prepare to be wrong (Siap salah).'
        : 'Assesses decision process: Widen options, Reality-test, Attain distance, and Prepare to be wrong.'
    }
  },

  // --- LEADERSHIP ---
  {
    id: 't6',
    title: lang === 'id' ? 'Asesmen Gaya Kepemimpinan' : 'Leadership Style Assessment',
    category: TestCategory.LEADERSHIP,
    description: lang === 'id' ? 'Pahami apakah Anda pemimpin Visioner, Operator, atau People-First.' : 'Understand if you are a Visionary, Operator, or People-First leader.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 12,
    questions: getLeadershipQuestions(lang),
    dimensions: LEADERSHIP_DIMENSIONS,
    methodology: {
      name: 'Situational Leadership Theory',
      author: 'Hersey & Blanchard',
      source: 'Management of Organizational Behavior',
      description: lang === 'id'
        ? 'Menyesuaikan gaya kepemimpinan (Directing, Coaching, Supporting, Delegating) dengan tingkat kematangan tim.'
        : 'Adapting leadership style (Directing, Coaching, Supporting, Delegating) to the maturity of the team.'
    }
  },
  {
    id: 't27',
    title: lang === 'id' ? 'Kecerdasan Emosional (EQ) Pemimpin' : 'Leadership EQ Assessment',
    category: TestCategory.LEADERSHIP,
    description: lang === 'id' ? 'Pemimpin hebat memimpin dengan empati, bukan hanya otoritas.' : 'Great leaders lead with empathy, not just authority.',
    accessLevel: AccessLevel.PREMIUM,
    durationMinutes: 10,
    questions: getEqQuestions(lang),
    dimensions: EQ_DIMENSIONS,
    methodology: {
      name: 'Emotional Intelligence Framework',
      author: 'Daniel Goleman',
      source: 'Emotional Intelligence',
      description: lang === 'id'
        ? 'Mengukur 5 komponen EQ: Kesadaran Diri, Regulasi Diri, Motivasi, Empati, dan Keterampilan Sosial.'
        : 'Measures 5 EQ components: Self-awareness, Self-regulation, Motivation, Empathy, and Social skills.'
    }
  },

  // --- MARKETING ---
  {
    id: 't9',
    title: lang === 'id' ? 'Audit Kejelasan Brand' : 'Brand Clarity Diagnostic',
    category: TestCategory.MARKETING,
    description: lang === 'id' ? 'Apakah audiens Anda benar-benar paham siapa Anda?' : 'Does your audience actually understand who you are?',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 7,
    questions: getBrandQuestions(lang),
    dimensions: BRAND_DIMENSIONS,
    methodology: {
      name: 'Brand Archetypes',
      author: 'Carl Jung / Margaret Mark',
      source: 'The Hero and the Outlaw',
      description: lang === 'id'
        ? 'Menggunakan 12 arketipe kepribadian universal untuk menyelaraskan suara merek dan identitas visual.'
        : 'Uses 12 universal personality archetypes to align brand voice and visual identity.'
    }
  },
  {
    id: 't24',
    title: lang === 'id' ? 'Kematangan Strategi Konten' : 'Content Strategy Maturity',
    category: TestCategory.MARKETING,
    description: lang === 'id' ? 'Evaluasi pilar konten, konsistensi, dan loop keterlibatan audiens Anda.' : 'Evaluate your content pillars, consistency, and audience engagement loops.',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 8,
    questions: getContentQuestions(lang),
    dimensions: CONTENT_DIMENSIONS,
    methodology: {
      name: 'Inbound Marketing Methodology',
      author: 'Brian Halligan / HubSpot',
      source: 'Inbound Marketing',
      description: lang === 'id'
        ? 'Fase: Attract (Tarik), Engage (Libatkan), Delight (Puaskan) untuk mengubah orang asing menjadi promotor.'
        : 'Phases: Attract, Engage, and Delight to turn strangers into promoters.'
    }
  },

  // --- WELLBEING ---
  {
    id: 't11',
    title: lang === 'id' ? 'Asesmen Risiko Burnout' : 'Burnout Risk Assessment',
    category: TestCategory.WELLBEING,
    description: lang === 'id' ? 'Ukur tingkat kelelahan emosional sebelum terlambat.' : 'Measure emotional exhaustion levels before it\'s too late.',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 4,
    questions: getBurnoutQuestions(lang),
    dimensions: BURNOUT_DIMENSIONS,
    methodology: {
      name: 'Maslach Burnout Inventory (MBI)',
      author: 'Christina Maslach',
      source: 'Journal of Occupational Behavior',
      description: lang === 'id'
        ? 'Mengukur 3 dimensi burnout: Kelelahan Emosional, Sinisme/Depersonalisasi, dan Efikasi Profesional.'
        : 'Measures 3 burnout dimensions: Emotional Exhaustion, Cynicism/Depersonalization, and Professional Efficacy.'
    }
  },
  {
    id: 't19',
    title: lang === 'id' ? 'Cek Keseimbangan Gaya Hidup' : 'Lifestyle Balance Diagnostic',
    category: TestCategory.WELLBEING,
    description: lang === 'id' ? 'Audit kesehatan fisik, mental, dan sosial Anda.' : 'Audit your physical, mental, and social health.',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 5,
    questions: getLifestyleQuestions(lang),
    dimensions: LIFESTYLE_DIMENSIONS,
    methodology: {
      name: 'Biopsychosocial Model',
      author: 'George Engel',
      source: 'Science Journal (1977)',
      description: lang === 'id'
        ? 'Melihat kesehatan sebagai interaksi faktor biologis, psikologis, dan sosial, bukan hanya fisik semata.'
        : 'Views health as an interaction of biological, psychological, and social factors.'
    }
  },

  // --- CAREER ---
  {
    id: 't7',
    title: lang === 'id' ? 'Tes Kesiapan Coaching' : 'Coaching Readiness Test',
    category: TestCategory.CAREER,
    description: lang === 'id' ? 'Apakah Anda siap dilatih untuk kinerja tinggi?' : 'Are you ready to be coached for high performance?',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 3,
    questions: getCoachingQuestions(lang),
    dimensions: COACHING_DIMENSIONS,
    methodology: {
      name: 'Transtheoretical Model',
      author: 'Prochaska & DiClemente',
      source: 'Journal of Consulting and Clinical Psychology',
      description: lang === 'id'
        ? 'Mengidentifikasi tahap perubahan: Pra-kontemplasi, Kontemplasi, Persiapan, Aksi, dan Pemeliharaan.'
        : 'Identifies stages of change: Pre-contemplation, Contemplation, Preparation, Action, and Maintenance.'
    }
  },
  {
    id: 't23',
    title: lang === 'id' ? 'Skor Sindrom Imposter' : 'Imposter Syndrome Score',
    category: TestCategory.CAREER,
    description: lang === 'id' ? 'Apakah Anda merasa tidak pantas atas kesuksesan Anda sendiri?' : 'Do you feel like a fraud despite your accomplishments?',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 5,
    questions: getImposterQuestions(lang),
    dimensions: IMPOSTER_DIMENSIONS,
    methodology: {
      name: 'Clance Impostor Phenomenon Scale',
      author: 'Pauline Rose Clance',
      source: 'Psychotherapy: Theory, Research and Practice',
      description: lang === 'id'
        ? 'Mengidentifikasi perasaan penipuan intelektual dan ketidakmampuan untuk menginternalisasi kesuksesan.'
        : 'Identifies feelings of intellectual phoniness and inability to internalize success.'
    }
  },

  // --- TRAVEL ---
  {
    id: 't20',
    title: lang === 'id' ? 'Profil Kepribadian Traveler' : 'Travel Personality Diagnostic',
    category: TestCategory.TRAVEL,
    description: lang === 'id' ? 'Apakah Anda tipe Allocentric (Petualang) atau Psychocentric (Nyaman)?' : 'Are you Allocentric (Adventurous) or Psychocentric (Comfort-seeking)?',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 5,
    questions: getTravelQuestions(lang),
    dimensions: TRAVEL_DIMENSIONS,
    methodology: {
      name: 'Plog\'s Model of Tourism',
      author: 'Stanley Plog',
      source: 'Journal of Travel Research',
      description: lang === 'id'
        ? 'Mengkategorikan wisatawan berdasarkan preferensi risiko, kebaruan, dan kenyamanan.'
        : 'Categorizes travelers based on risk, novelty, and comfort preferences.'
    }
  },
  {
    id: 't10',
    title: lang === 'id' ? 'Tes Kesiapan Umroh (Dasar)' : 'Umroh Readiness Test (Basic)',
    category: TestCategory.TRAVEL,
    description: lang === 'id' ? 'Cek kesiapan spiritual, finansial, dan fisik Anda.' : 'Check your spiritual, financial, and physical readiness.',
    accessLevel: AccessLevel.FREE,
    durationMinutes: 5,
    questions: getUmrohQuestions(lang),
    dimensions: UMROH_DIMENSIONS,
    methodology: {
      name: 'Maqasid al-Shari\'ah',
      author: 'Imam Al-Shatibi',
      source: 'Al-Muwafaqat',
      description: lang === 'id'
        ? 'Memastikan kesiapan spiritual (Din), finansial (Mal), dan fisik (Nafs) sebelum ibadah.'
        : 'Ensures spiritual (Din), financial (Mal), and physical (Nafs) readiness before worship.'
    }
  },

  // --- META / FUTURE ---
  {
    id: 't21',
    title: lang === 'id' ? 'Kesiapan Adopsi AI' : 'AI Adoption Readiness',
    category: TestCategory.META,
    description: lang === 'id' ? 'Apakah Anda siap bekerja berdampingan dengan AI atau akan tertinggal?' : 'Are you ready to co-work with AI or will you be left behind?',
    accessLevel: AccessLevel.PRO,
    durationMinutes: 6,
    questions: getAiQuestions(lang),
    dimensions: AI_DIMENSIONS,
    methodology: {
      name: 'Technology Acceptance Model (TAM)',
      author: 'Fred Davis',
      source: 'MIS Quarterly',
      description: lang === 'id'
        ? 'Memprediksi penerimaan teknologi baru berdasarkan Persepsi Kegunaan (Perceived Usefulness) dan Kemudahan Penggunaan (Ease of Use).'
        : 'Predicts acceptance of new tech based on Perceived Usefulness and Perceived Ease of Use.'
    }
  }
];

// ============================================
// PRICING PLANS
// ============================================

export const getPlans = (lang: Language = 'en') => [
  {
    name: 'Free',
    price: lang === 'id' ? 'Gratis' : 'Rp 0',
    priceValue: 0,
    period: '',
    features: lang === 'id' 
        ? ['Akses ke 5 Tes Dasar', 'Hasil Sederhana', 'Tanpa Riwayat'] 
        : ['Access to 5 Basic Tests', 'Simple Results', 'No History'],
    cta: lang === 'id' ? 'Mulai' : 'Get Started',
    level: AccessLevel.FREE
  },
  {
    name: 'Pro',
    price: 'Rp 299.000',
    priceValue: 299000,
    period: lang === 'id' ? '/bulan' : '/month',
    features: lang === 'id'
        ? ['Akses Semua Tes', 'Laporan PDF', 'Pelacakan Progres', 'Analisis Mendalam']
        : ['Access All Tests', 'PDF Reports', 'Progress Tracking', 'Deep Analysis'],
    cta: lang === 'id' ? 'Jadi Pro' : 'Go Pro',
    highlight: true,
    level: AccessLevel.PRO
  },
  {
    name: 'Premium',
    price: 'Rp 1.499.000',
    priceValue: 1499000,
    period: lang === 'id' ? '/tahun' : '/year',
    features: lang === 'id'
        ? ['Semua Fitur Pro', 'Dukungan Prioritas', 'Panggilan Konsultasi', 'Bonus Afiliasi']
        : ['All Pro Features', 'Priority Support', 'Consultation Call', 'Affiliate Bonus'],
    cta: lang === 'id' ? 'Ambil Premium' : 'Get Premium',
    level: AccessLevel.PREMIUM
  }
];

// Re-export for backward compatibility
export const MOCK_TESTS = getMockTests('en');
export const PLANS = getPlans('en');
