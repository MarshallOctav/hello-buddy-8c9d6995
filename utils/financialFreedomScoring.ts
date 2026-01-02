// Financial Freedom Progress Index Scoring
// Based on Vicki Robin & Joe Dominguez + FIRE Principles

export interface FIInput {
  monthly_income: number;        // Q1: Penghasilan bersih bulanan
  current_expenses: number;      // Q2: Total pengeluaran bulanan rata-rata
  target_fi_expenses: number;    // Q3: Target pengeluaran saat FI
  total_investments: number;     // Q4: Total aset investasi
  monthly_savings: number;       // Q5: Tabungan & investasi rutin bulanan
  current_age: number;           // Q6: Usia saat ini
  target_fi_age: number;         // Q7: Target usia FI
  expected_return: number;       // Q8: Expected annual return (5/7/8)
  consumer_debt: number;         // Q9: Utang konsumtif
  annual_large_expenses: number; // Q10: Pengeluaran tahunan besar
  passive_income: number;        // Q11: Pemasukan pasif bulanan
  dependents: number;            // Q12: Jumlah dependents
}

export interface FIResult {
  score: number;                 // 0-100
  category: string;
  categoryKey: 'starting_out' | 'early_stage' | 'building_momentum' | 'on_track' | 'financial_independence';
  progress_percent: number;
  fi_number: number;
  current_net_worth: number;
  savings_rate: number;
  years_to_fi: number;
  desired_fi_age: number;
  projected_fi_age: number;
  annual_fi_expenses: number;
  insights: string[];
}

export const calculateFinancialFreedom = (
  input: FIInput,
  language: 'en' | 'id'
): FIResult => {
  const isId = language === 'id';
  
  // 1. Calculate Annual FI Expenses
  const annual_fi_expenses = (input.target_fi_expenses * 12) + input.annual_large_expenses;
  
  // 2. Calculate FI Number (4% rule = 25x annual expenses)
  const safe_withdrawal_rate = 0.04;
  const fi_number = annual_fi_expenses > 0 ? annual_fi_expenses / safe_withdrawal_rate : 0;
  
  // 3. Calculate Current Investable Net Worth
  const net_worth = Math.max(0, input.total_investments - input.consumer_debt);
  
  // 4. Calculate Progress Percentage
  let progress_percent = 0;
  if (fi_number > 0) {
    progress_percent = (net_worth / fi_number) * 100;
  }
  progress_percent = Math.max(0, Math.min(100, progress_percent));
  
  // 5. Calculate Savings Rate
  let savings_rate = 0;
  if (input.monthly_income > 0) {
    savings_rate = (input.monthly_savings / input.monthly_income) * 100;
  }
  savings_rate = Math.max(0, Math.min(100, savings_rate));
  
  // 6. Calculate Years to FI (with compound growth)
  const years_to_fi_desired = input.target_fi_age - input.current_age;
  
  let projected_years = 99;
  const expected_return = input.expected_return / 100; // Convert to decimal
  const monthly_return = Math.pow(1 + expected_return, 1/12) - 1;
  
  if (input.monthly_savings > 0 && net_worth >= 0) {
    const remaining_to_fi = fi_number - net_worth;
    if (remaining_to_fi <= 0) {
      projected_years = 0;
    } else if (monthly_return > 0) {
      // Future Value formula solved for N
      // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
      // Simplified approximation using log
      const numerator = Math.log(1 + (remaining_to_fi * monthly_return / input.monthly_savings));
      const denominator = Math.log(1 + monthly_return);
      projected_years = numerator / denominator / 12;
    }
  }
  
  projected_years = Math.max(0, Math.round(projected_years * 10) / 10);
  const projected_fi_age = Math.round(input.current_age + projected_years);
  
  // 7. Calculate Main Score (0-100)
  let score = 0;
  score += progress_percent * 0.6;           // 60% from current progress
  score += Math.min(50, savings_rate) * 0.4; // 40% from savings habit (max 50%)
  
  // Bonus if ahead of schedule
  if (projected_years <= years_to_fi_desired && projected_years > 0) {
    score += 20;
  }
  
  // Cap score at 100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine category based on progress
  let category: string;
  let categoryKey: FIResult['categoryKey'];
  
  if (progress_percent >= 80) {
    category = isId ? '🏆 Financial Independence' : '🏆 Financial Independence';
    categoryKey = 'financial_independence';
  } else if (progress_percent >= 50) {
    category = isId ? '🚀 On Track' : '🚀 On Track';
    categoryKey = 'on_track';
  } else if (progress_percent >= 25) {
    category = isId ? '📈 Building Momentum' : '📈 Building Momentum';
    categoryKey = 'building_momentum';
  } else if (progress_percent >= 10) {
    category = isId ? '🌱 Early Stage' : '🌱 Early Stage';
    categoryKey = 'early_stage';
  } else {
    category = isId ? '🚀 Starting Out' : '🚀 Starting Out';
    categoryKey = 'starting_out';
  }
  
  // Generate Insights
  const insights: string[] = [];
  
  // Progress insight
  if (progress_percent >= 80) {
    insights.push(
      isId 
        ? `Anda sudah ${Math.round(progress_percent)}% menuju FI — luar biasa! Passive income sudah cukup untuk nutup hidup.`
        : `You are ${Math.round(progress_percent)}% towards FI — amazing! Passive income is enough to cover living expenses.`
    );
  } else if (progress_percent >= 50) {
    insights.push(
      isId 
        ? `Anda sudah ${Math.round(progress_percent)}% menuju FI — setengah jalan!`
        : `You are ${Math.round(progress_percent)}% towards FI — halfway there!`
    );
  } else {
    insights.push(
      isId 
        ? `Progress FI Anda: ${Math.round(progress_percent)}%. Tetap konsisten!`
        : `Your FI progress: ${Math.round(progress_percent)}%. Stay consistent!`
    );
  }
  
  // Savings rate insight
  if (savings_rate >= 50) {
    insights.push(
      isId 
        ? `Savings rate ${Math.round(savings_rate)}% — Anda penabung agresif!`
        : `Savings rate ${Math.round(savings_rate)}% — you're an aggressive saver!`
    );
  } else if (savings_rate >= 30) {
    insights.push(
      isId 
        ? `Savings rate ${Math.round(savings_rate)}% sudah baik. Target FIRE biasanya 30-50%.`
        : `Savings rate ${Math.round(savings_rate)}% is good. FIRE target is usually 30-50%.`
    );
  } else if (savings_rate >= 20) {
    insights.push(
      isId 
        ? `Savings rate ${Math.round(savings_rate)}%. Tingkatkan ke 30%+ untuk percepat FI.`
        : `Savings rate ${Math.round(savings_rate)}%. Increase to 30%+ to accelerate FI.`
    );
  } else {
    insights.push(
      isId 
        ? `Savings rate ${Math.round(savings_rate)}% perlu ditingkatkan drastis. Target minimal 20-30%.`
        : `Savings rate ${Math.round(savings_rate)}% needs drastic improvement. Target at least 20-30%.`
    );
  }
  
  // Projection insight
  if (projected_years > 0 && projected_years < 99) {
    const comparison = projected_fi_age < input.target_fi_age 
      ? (isId ? `${input.target_fi_age - projected_fi_age} tahun lebih cepat dari target` : `${input.target_fi_age - projected_fi_age} years ahead of target`)
      : (isId ? `${projected_fi_age - input.target_fi_age} tahun lebih lambat dari target` : `${projected_fi_age - input.target_fi_age} years behind target`);
    
    insights.push(
      isId 
        ? `Dengan savings rate ${Math.round(savings_rate)}%, Anda diproyeksi capai FI di usia ${projected_fi_age} (${comparison}).`
        : `With ${Math.round(savings_rate)}% savings rate, you're projected to reach FI at age ${projected_fi_age} (${comparison}).`
    );
  }
  
  // Consumer debt warning
  if (input.consumer_debt > 0) {
    insights.push(
      isId 
        ? `Prioritaskan lunasi utang konsumtif Rp${formatFICurrency(input.consumer_debt)} terlebih dahulu.`
        : `Prioritize paying off consumer debt of ${formatFICurrency(input.consumer_debt, 'en')} first.`
    );
  }
  
  // Recommendation based on category
  if (categoryKey === 'starting_out') {
    insights.push(
      isId 
        ? 'Rekomendasi: Baca "Your Money or Your Life", buat budget, mulai tabung rutin.'
        : 'Recommendation: Read "Your Money or Your Life", create a budget, start saving regularly.'
    );
  } else if (categoryKey === 'early_stage') {
    insights.push(
      isId 
        ? 'Rekomendasi: Target savings rate minimal 30-50%, track pengeluaran ketat.'
        : 'Recommendation: Target savings rate minimum 30-50%, track expenses strictly.'
    );
  } else if (categoryKey === 'building_momentum') {
    insights.push(
      isId 
        ? 'Rekomendasi: Kurangi pengeluaran non-esensial, cari tambahan income.'
        : 'Recommendation: Reduce non-essential expenses, find additional income.'
    );
  } else if (categoryKey === 'on_track') {
    insights.push(
      isId 
        ? 'Rekomendasi: Tingkatkan savings rate untuk percepat FI.'
        : 'Recommendation: Increase savings rate to accelerate FI.'
    );
  } else {
    insights.push(
      isId 
        ? 'Rekomendasi: Pertahankan, pertimbangkan semi-retire atau diversify investasi.'
        : 'Recommendation: Maintain this, consider semi-retirement or diversify investments.'
    );
  }
  
  return {
    score,
    category,
    categoryKey,
    progress_percent: Math.round(progress_percent * 10) / 10,
    fi_number,
    current_net_worth: net_worth,
    savings_rate: Math.round(savings_rate * 10) / 10,
    years_to_fi: projected_years,
    desired_fi_age: input.target_fi_age,
    projected_fi_age,
    annual_fi_expenses,
    insights
  };
};

// Format currency for display
export const formatFICurrency = (value: number, locale: string = 'id'): string => {
  if (locale === 'id') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
