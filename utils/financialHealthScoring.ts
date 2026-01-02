// Financial Health Scoring Algorithm based on 50/30/20 Rule (Elizabeth Warren)

export interface FinancialHealthInput {
  income: number;
  housing: number;
  food: number;
  transport: number;
  utilities: number;
  mandatory_debt: number;
  lifestyle_wants: number;
  entertainment: number;
  savings: number;
  extra_debt_payoff: number;
}

export interface FinancialHealthResult {
  score: number;
  category: string;
  categoryKey: 'crisis' | 'needs_improvement' | 'fair' | 'healthy' | 'very_healthy';
  percentages: {
    needs: number;
    wants: number;
    savings: number;
  };
  ideal: {
    needs: number;
    wants: number;
    savings: number;
  };
  insights: string[];
  rawValues: {
    income: number;
    totalNeeds: number;
    totalWants: number;
    totalSavings: number;
  };
}

export const calculateFinancialHealth = (
  input: FinancialHealthInput,
  language: 'en' | 'id'
): FinancialHealthResult => {
  const isId = language === 'id';
  
  // Calculate totals
  const totalNeeds = input.housing + input.food + input.transport + input.utilities + input.mandatory_debt;
  const totalWants = input.lifestyle_wants + input.entertainment;
  const totalSavings = input.savings + input.extra_debt_payoff;
  
  // Calculate percentages
  const income = input.income || 1; // Prevent division by zero
  const percentNeeds = Math.round((totalNeeds / income) * 100);
  const percentWants = Math.round((totalWants / income) * 100);
  const percentSavings = Math.round((totalSavings / income) * 100);
  
  // Calculate score starting from 100
  let score = 100;
  
  // Penalties for deviation from 50/30/20
  if (percentNeeds > 50) {
    score -= (percentNeeds - 50) * 3;
  }
  if (percentWants > 30) {
    score -= (percentWants - 30) * 2;
  }
  if (percentSavings < 20) {
    score -= (20 - percentSavings) * 4;
  }
  
  // Bonuses for excellent performance
  if (percentNeeds < 40) {
    score += 10;
  }
  if (percentSavings > 30) {
    score += 20;
  }
  
  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine category
  let category: string;
  let categoryKey: FinancialHealthResult['categoryKey'];
  
  if (score >= 90) {
    category = isId ? 'Sangat Sehat' : 'Very Healthy';
    categoryKey = 'very_healthy';
  } else if (score >= 70) {
    category = isId ? 'Sehat' : 'Healthy';
    categoryKey = 'healthy';
  } else if (score >= 50) {
    category = isId ? 'Cukup' : 'Fair';
    categoryKey = 'fair';
  } else if (score >= 30) {
    category = isId ? 'Perlu Perbaikan' : 'Needs Improvement';
    categoryKey = 'needs_improvement';
  } else {
    category = isId ? 'Krisis' : 'Crisis';
    categoryKey = 'crisis';
  }
  
  // Generate insights
  const insights: string[] = [];
  
  if (percentNeeds > 50) {
    const diff = percentNeeds - 50;
    insights.push(
      isId
        ? `Needs Anda ${percentNeeds}% (${diff}% di atas ideal 50%). Pertimbangkan turunkan biaya tempat tinggal atau transport.`
        : `Your Needs are ${percentNeeds}% (${diff}% above ideal 50%). Consider reducing housing or transport costs.`
    );
  } else if (percentNeeds < 40) {
    insights.push(
      isId
        ? `Needs Anda sangat efisien di ${percentNeeds}% (di bawah 40%). Anda memiliki ruang lebih untuk savings.`
        : `Your Needs are very efficient at ${percentNeeds}% (below 40%). You have more room for savings.`
    );
  }
  
  if (percentWants > 30) {
    const diff = percentWants - 30;
    const amountToReduce = Math.round((diff / 100) * income);
    insights.push(
      isId
        ? `Wants Anda ${percentWants}% (${diff}% di atas ideal 30%). Kurangi Rp${amountToReduce.toLocaleString('id-ID')}/bulan untuk lebih seimbang.`
        : `Your Wants are ${percentWants}% (${diff}% above ideal 30%). Reduce ${amountToReduce.toLocaleString()}/month for better balance.`
    );
  }
  
  if (percentSavings < 20) {
    const diff = 20 - percentSavings;
    const amountNeeded = Math.round((diff / 100) * income);
    insights.push(
      isId
        ? `Savings Anda ${percentSavings}% (${diff}% di bawah ideal 20%). Tambahkan Rp${amountNeeded.toLocaleString('id-ID')}/bulan ke tabungan.`
        : `Your Savings are ${percentSavings}% (${diff}% below ideal 20%). Add ${amountNeeded.toLocaleString()}/month to savings.`
    );
  } else if (percentSavings >= 30) {
    insights.push(
      isId
        ? `Luar biasa! Savings Anda ${percentSavings}% — Anda adalah penabung agresif. Pertimbangkan diversifikasi investasi.`
        : `Excellent! Your Savings are ${percentSavings}% — you're an aggressive saver. Consider diversifying investments.`
    );
  }
  
  // Add general recommendation based on category
  if (categoryKey === 'crisis') {
    insights.push(
      isId
        ? 'Prioritas: cari tambahan income, restrukturisasi utang, konsultasi financial planner jika memungkinkan.'
        : 'Priority: seek additional income, restructure debt, consult a financial planner if possible.'
    );
  } else if (categoryKey === 'needs_improvement') {
    insights.push(
      isId
        ? 'Prioritas: potong wants drastis, cari cara turunkan needs, buat budget ketat.'
        : 'Priority: cut wants drastically, find ways to reduce needs, create a strict budget.'
    );
  }
  
  return {
    score,
    category,
    categoryKey,
    percentages: {
      needs: percentNeeds,
      wants: percentWants,
      savings: percentSavings
    },
    ideal: {
      needs: 50,
      wants: 30,
      savings: 20
    },
    insights,
    rawValues: {
      income: input.income,
      totalNeeds,
      totalWants,
      totalSavings
    }
  };
};

// Format currency for display
export const formatCurrency = (value: number, locale: string = 'id-ID'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Parse currency string to number
export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters except for the last decimal separator
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
};
