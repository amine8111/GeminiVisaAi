import { COUNTRIES, getVisaRequirement } from '../data/constants';

export const calculateFinancialScore = (bankBalance) => {
  const balance = parseFloat(bankBalance) || 0;
  if (balance < 1500) return 5;
  if (balance < 3000) return 12;
  if (balance < 5000) return 20;
  if (balance < 10000) return 25;
  return 30;
};

export const calculateEmploymentScore = (employmentStatus, monthlyIncome) => {
  let score = 0;
  const income = parseFloat(monthlyIncome) || 0;
  
  switch (employmentStatus) {
    case 'Unemployed':
      score = 3;
      break;
    case 'Student':
      score = 5;
      break;
    case 'Retired':
      score = 8;
      break;
    case 'Freelancer':
      score = income > 3000 ? 15 : 10;
      break;
    case 'Employee (< 1 year)':
      score = 10;
      break;
    case 'Employee (1-3 years)':
      score = 14;
      break;
    case 'Employee (3-5 years)':
      score = 17;
      break;
    case 'Stable job (5+ years)':
      score = 20;
      break;
    case 'Self-employed':
      score = income > 5000 ? 18 : 12;
      break;
    case 'Business Owner':
      score = income > 10000 ? 20 : 15;
      break;
    default:
      score = 5;
  }
  
  return score;
};

export const calculateTravelScore = (travelHistory, previousVisaRefusals) => {
  const refusals = parseInt(previousVisaRefusals) || 0;
  const trips = parseInt(travelHistory) || 0;
  
  if (trips === 0) return 5;
  if (trips <= 2) return 10;
  if (trips <= 5) return 15;
  if (trips <= 10) return 18;
  return 20;
};

export const calculateProfileStrength = (age, maritalStatus, previousVisaRefusals) => {
  const ageNum = parseInt(age) || 0;
  const refusals = parseInt(previousVisaRefusals) || 0;
  let score = 0;
  
  if (ageNum >= 25 && ageNum <= 55) {
    score += 8;
  } else if (ageNum >= 18 && ageNum < 25) {
    score += 5;
  } else if (ageNum > 55) {
    score += 4;
  } else {
    score += 2;
  }
  
  if (maritalStatus === 'Married') {
    score += 7;
  } else if (maritalStatus === 'Divorced' || maritalStatus === 'Widowed') {
    score += 3;
  } else {
    score += 5;
  }
  
  score -= refusals * 5;
  
  return Math.max(0, Math.min(15, score));
};

export const calculateDocumentScore = (documents) => {
  let score = 0;
  if (documents.passport) score += 5;
  if (documents.bankStatement) score += 5;
  if (documents.employmentProof) score += 5;
  return score;
};

export const calculateTotalScore = (profile, documents) => {
  const financialScore = calculateFinancialScore(profile.bankBalance);
  const employmentScore = calculateEmploymentScore(profile.employmentStatus, profile.monthlyIncome);
  const travelScore = calculateTravelScore(profile.travelHistory, profile.previousVisaRefusals);
  const profileStrength = calculateProfileStrength(profile.age, profile.maritalStatus, profile.previousVisaRefusals);
  const documentScore = calculateDocumentScore(documents);
  
  return {
    total: financialScore + employmentScore + travelScore + profileStrength + documentScore,
    breakdown: {
      financial: financialScore,
      employment: employmentScore,
      travel: travelScore,
      profile: profileStrength,
      documents: documentScore
    }
  };
};

export const calculateCountryScores = (baseScore, nationality) => {
  return COUNTRIES.map(country => {
    const visaReq = getVisaRequirement(nationality, country.name);
    
    let multiplier = country.multiplier || 1;
    let adjustedScore = baseScore * multiplier;
    
    if (!visaReq.required) {
      adjustedScore = Math.min(100, adjustedScore + 15);
    } else if (country.type === 'Visa Waiver') {
      adjustedScore = Math.min(100, adjustedScore + 5);
    }
    
    return {
      ...country,
      visaRequired: visaReq.required,
      visaReason: visaReq.reason,
      successRate: Math.round(adjustedScore)
    };
  }).sort((a, b) => b.successRate - a.successRate);
};

export const getRiskLevel = (score) => {
  if (score >= 70) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' };
  if (score >= 45) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/20' };
};

export const analyzeRisks = (profile, scores) => {
  const risks = [];
  const bankBalance = parseFloat(profile.bankBalance) || 0;
  const travelHistory = parseInt(profile.travelHistory) || 0;
  const refusals = parseInt(profile.previousVisaRefusals) || 0;
  const age = parseInt(profile.age) || 0;
  
  if (bankBalance < 3000) {
    risks.push({
      type: 'financial',
      title: 'Low Bank Balance',
      message: bankBalance < 1500 
        ? 'Very low savings may result in visa rejection. Aim for at least $5,000.' 
        : 'Consider increasing savings to improve approval chances.',
      severity: bankBalance < 1500 ? 'high' : 'medium'
    });
  }
  
  if (travelHistory === 0) {
    risks.push({
      type: 'travel',
      title: 'No Travel History',
      message: 'No previous international travel may raise concerns. Consider visiting other countries first.',
      severity: 'high'
    });
  }
  
  if (profile.employmentStatus === 'Unemployed') {
    risks.push({
      type: 'employment',
      title: 'Unemployment',
      message: 'Being unemployed significantly reduces approval chances. Secure employment first.',
      severity: 'high'
    });
  }
  
  if (refusals > 0) {
    risks.push({
      type: 'refusal',
      title: refusals > 1 ? 'Multiple Visa Refusals' : 'Previous Visa Refusal',
      message: refusals > 1 
        ? 'Multiple refusals on record. Address underlying issues before applying again.'
        : 'Previous refusal may affect new application. Ensure circumstances have changed.',
      severity: refusals > 1 ? 'high' : 'medium'
    });
  }
  
  if (age < 21 || age > 65) {
    risks.push({
      type: 'age',
      title: age < 21 ? 'Young Applicant' : 'Senior Applicant',
      message: age < 21 
        ? 'Young age may require additional documentation and proof of ties to home country.'
        : 'Senior applicants may need additional health insurance and financial proofs.',
      severity: 'low'
    });
  }
  
  if (scores.breakdown.documents < 15) {
    risks.push({
      type: 'documents',
      title: 'Incomplete Documents',
      message: 'Missing documents reduce assessment accuracy. Upload all required documents.',
      severity: 'medium'
    });
  }
  
  if (profile.maritalStatus === 'Single' && bankBalance < 10000) {
    risks.push({
      type: 'ties',
      title: 'Weak Ties to Home Country',
      message: 'Single applicants with low savings may be seen as potential overstayer risk.',
      severity: 'low'
    });
  }
  
  return risks;
};

export const generateActionPlan = (profile, scores, risks) => {
  const actions = [];
  const bankBalance = parseFloat(profile.bankBalance) || 0;
  const travelHistory = parseInt(profile.travelHistory) || 0;
  const refusals = parseInt(profile.previousVisaRefusals) || 0;
  
  if (bankBalance < 6000) {
    actions.push({
      priority: 'high',
      title: 'Increase Bank Balance',
      description: 'Aim for at least $6,000 in savings. Wait 3-6 months to show consistent savings.',
      icon: '💰'
    });
  }
  
  if (travelHistory === 0) {
    actions.push({
      priority: 'high',
      title: 'Build Travel History',
      description: 'Start with easier destinations. Consider tourist visas to Turkey, Georgia, or Southeast Asia first.',
      icon: '✈️'
    });
  }
  
  if (profile.employmentStatus === 'Unemployed') {
    actions.push({
      priority: 'high',
      title: 'Secure Employment',
      description: 'Get stable employment for at least 6 months before applying.',
      icon: '💼'
    });
  }
  
  if (scores.breakdown.documents < 15) {
    actions.push({
      priority: 'medium',
      title: 'Complete Document Collection',
      description: 'Upload passport, bank statement (3 months), and employment proof for maximum score.',
      icon: '📄'
    });
  }
  
  if (refusals > 0) {
    actions.push({
      priority: 'medium',
      title: 'Address Previous Refusals',
      description: 'Ensure issues are resolved. Consider applying to less strict countries first.',
      icon: '⚠️'
    });
  }
  
  if (profile.maritalStatus === 'Single' && bankBalance < 15000) {
    actions.push({
      priority: 'low',
      title: 'Strengthen Ties to Home Country',
      description: 'Show property ownership, business interests, or family ties.',
      icon: '🏠'
    });
  }
  
  if (profile.employmentStatus === 'Freelancer' || profile.employmentStatus === 'Self-employed') {
    actions.push({
      priority: 'medium',
      title: 'Show Business Stability',
      description: 'Provide contracts, invoices, and client references to prove stable income.',
      icon: '📊'
    });
  }
  
  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};
