// Investment Risk Tolerance Scoring
// Based on Modern Portfolio Theory (Harry Markowitz)

export interface RiskResult {
  total_score: number;           // 10-50
  normalized_score: number;      // 0-100 for UI compatibility
  profile: string;
  profileKey: 'conservative' | 'moderately_conservative' | 'moderate' | 'moderately_aggressive' | 'aggressive';
  description: string;
  asset_allocation: {
    equity: string;
    equity_percent: number;
    fixed_income: string;
    fixed_income_percent: number;
    cash: string;
    cash_percent: number;
  };
  insights: string[];
}

export const calculateRiskTolerance = (
  answers: number[], // Array of scores 1-5 for each of 10 questions
  language: 'en' | 'id'
): RiskResult => {
  const isId = language === 'id';
  
  // 1. Calculate total score
  const total_score = answers.reduce((sum, score) => sum + score, 0);
  
  // Normalize to 0-100 scale for UI compatibility
  // Min score = 10, Max score = 50
  const normalized_score = Math.round(((total_score - 10) / 40) * 100);
  
  // 2. Determine risk profile
  let profile: string;
  let profileKey: RiskResult['profileKey'];
  let description: string;
  let asset_allocation: RiskResult['asset_allocation'];
  
  if (total_score >= 42) {
    profileKey = 'aggressive';
    profile = isId ? '🔥 Aggressive' : '🔥 Aggressive';
    description = isId 
      ? 'Anda nyaman dengan volatilitas tinggi demi pertumbuhan maksimal. Cocok untuk investor muda/berpengalaman.'
      : 'You are comfortable with high volatility for maximum growth. Suitable for young/experienced investors.';
    asset_allocation = {
      equity: '85%',
      equity_percent: 85,
      fixed_income: '15%',
      fixed_income_percent: 15,
      cash: '0%',
      cash_percent: 0
    };
  } else if (total_score >= 34) {
    profileKey = 'moderately_aggressive';
    profile = isId ? '📈 Moderately Aggressive' : '📈 Moderately Aggressive';
    description = isId 
      ? 'Anda siap ambil risiko cukup tinggi, tapi tetap ingin sedikit perlindungan saat pasar turun.'
      : 'You are ready to take fairly high risks, but still want some protection when the market falls.';
    asset_allocation = {
      equity: '75%',
      equity_percent: 75,
      fixed_income: '25%',
      fixed_income_percent: 25,
      cash: '0%',
      cash_percent: 0
    };
  } else if (total_score >= 26) {
    profileKey = 'moderate';
    profile = isId ? '⚖️ Moderate' : '⚖️ Moderate';
    description = isId 
      ? 'Anda mencari keseimbangan antara pertumbuhan dan keamanan. Profil paling umum di kalangan investor.'
      : 'You seek a balance between growth and security. The most common profile among investors.';
    asset_allocation = {
      equity: '55%',
      equity_percent: 55,
      fixed_income: '40%',
      fixed_income_percent: 40,
      cash: '5%',
      cash_percent: 5
    };
  } else if (total_score >= 18) {
    profileKey = 'moderately_conservative';
    profile = isId ? '🛡️ Moderately Conservative' : '🛡️ Moderately Conservative';
    description = isId 
      ? 'Anda lebih prioritas melindungi modal, pertumbuhan sedang saja tidak masalah.'
      : 'You prioritize protecting capital over high growth.';
    asset_allocation = {
      equity: '35%',
      equity_percent: 35,
      fixed_income: '55%',
      fixed_income_percent: 55,
      cash: '10%',
      cash_percent: 10
    };
  } else {
    profileKey = 'conservative';
    profile = isId ? '🏦 Conservative' : '🏦 Conservative';
    description = isId 
      ? 'Anda tidak suka risiko, prioritas utama adalah jangan rugi nominal.'
      : 'You don\'t like risk, the main priority is not losing nominal value.';
    asset_allocation = {
      equity: '15%',
      equity_percent: 15,
      fixed_income: '65%',
      fixed_income_percent: 65,
      cash: '20%',
      cash_percent: 20
    };
  }
  
  // 3. Generate Insights
  const insights: string[] = [];
  
  // Time horizon insight (Q2)
  if (answers[1] >= 4) {
    insights.push(
      isId 
        ? 'Profil Anda cocok untuk investasi jangka panjang (>7 tahun).'
        : 'Your profile is suitable for long-term investments (>7 years).'
    );
  } else if (answers[1] <= 2) {
    insights.push(
      isId 
        ? 'Dengan horizon waktu pendek, pertimbangkan alokasi lebih konservatif.'
        : 'With a short time horizon, consider a more conservative allocation.'
    );
  }
  
  // Experience insight (Q5)
  if (answers[4] >= 4) {
    insights.push(
      isId 
        ? 'Pengalaman investasi Anda mendukung strategi yang lebih agresif.'
        : 'Your investment experience supports a more aggressive strategy.'
    );
  } else if (answers[4] <= 2) {
    insights.push(
      isId 
        ? 'Pertimbangkan untuk belajar lebih lanjut sebelum mengambil risiko tinggi.'
        : 'Consider learning more before taking high risks.'
    );
  }
  
  // Emergency fund insight (Q7)
  if (answers[6] >= 4) {
    insights.push(
      isId 
        ? 'Dana darurat yang kuat memberi Anda fleksibilitas mengambil risiko.'
        : 'A strong emergency fund gives you flexibility to take risks.'
    );
  } else if (answers[6] <= 2) {
    insights.push(
      isId 
        ? 'Prioritaskan membangun dana darurat 6+ bulan sebelum investasi agresif.'
        : 'Prioritize building a 6+ month emergency fund before aggressive investing.'
    );
  }
  
  // Dependents insight (Q9)
  if (answers[8] <= 2) {
    insights.push(
      isId 
        ? 'Dengan banyak tanggungan, pertimbangkan perlindungan asuransi yang memadai.'
        : 'With many dependents, consider adequate insurance protection.'
    );
  }
  
  // Recommendation
  if (profileKey === 'aggressive' || profileKey === 'moderately_aggressive') {
    insights.push(
      isId 
        ? `Rekomendasi: ${asset_allocation.equity_percent}% reksadana saham, ${asset_allocation.fixed_income_percent}% reksadana pendapatan tetap.`
        : `Recommendation: ${asset_allocation.equity_percent}% equity funds, ${asset_allocation.fixed_income_percent}% fixed income funds.`
    );
  } else if (profileKey === 'moderate') {
    insights.push(
      isId 
        ? `Rekomendasi: ${asset_allocation.equity_percent}% saham/reksadana saham, ${asset_allocation.fixed_income_percent}% obligasi, ${asset_allocation.cash_percent}% deposito.`
        : `Recommendation: ${asset_allocation.equity_percent}% stocks/equity funds, ${asset_allocation.fixed_income_percent}% bonds, ${asset_allocation.cash_percent}% deposits.`
    );
  } else {
    insights.push(
      isId 
        ? `Rekomendasi: ${asset_allocation.equity_percent}% saham, ${asset_allocation.fixed_income_percent}% obligasi/reksadana pendapatan tetap, ${asset_allocation.cash_percent}% deposito.`
        : `Recommendation: ${asset_allocation.equity_percent}% stocks, ${asset_allocation.fixed_income_percent}% bonds/fixed income funds, ${asset_allocation.cash_percent}% deposits.`
    );
  }
  
  return {
    total_score,
    normalized_score: Math.max(0, Math.min(100, normalized_score)),
    profile,
    profileKey,
    description,
    asset_allocation,
    insights
  };
};
