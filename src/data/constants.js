export const COUNTRIES = [
  { name: 'France', code: 'FR', flag: '🇫🇷', type: 'Schengen', multiplier: 0.95, requirements: {} },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', type: 'Schengen', multiplier: 1.10, requirements: {} },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', type: 'Schengen', multiplier: 1.05, requirements: {} },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', type: 'Schengen', multiplier: 0.90, requirements: {} },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', type: 'Schengen', multiplier: 0.95, requirements: {} },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪', type: 'Schengen', multiplier: 0.95, requirements: {} },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹', type: 'Schengen', multiplier: 1.05, requirements: {} },
  { name: 'Greece', code: 'GR', flag: '🇬🇷', type: 'Schengen', multiplier: 1.10, requirements: {} },
  { name: 'USA', code: 'US', flag: '🇺🇸', type: 'Visa', multiplier: 0.75, requirements: { interview: true, fee: 185 } },
  { name: 'UK', code: 'GB', flag: '🇬🇧', type: 'Visa', multiplier: 0.65, requirements: { interview: true, fee: 100 } },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', type: 'Visa', multiplier: 0.70, requirements: { biometric: true } },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', type: 'Visa', multiplier: 0.70, requirements: { biometric: true } },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', type: 'Visa Waiver', multiplier: 0.85, requirements: { eta: true } },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷', type: 'Visa Waiver', multiplier: 0.85, requirements: { eta: true } },
  { name: 'UAE', code: 'AE', flag: '🇦🇪', type: 'Visa', multiplier: 0.60, requirements: { fee: 350 } },
];

export const VISA_FREE_COUNTRIES = {
  'France': ['USA', 'UK', 'Canada', 'Australia', 'Japan', 'South Korea', 'EU', 'Schengen'],
  'Germany': ['USA', 'UK', 'Canada', 'Australia', 'Japan', 'South Korea', 'EU', 'Schengen'],
  'Spain': ['USA', 'UK', 'Canada', 'Australia', 'Japan', 'South Korea', 'EU', 'Schengen'],
  'Italy': ['USA', 'UK', 'Canada', 'Australia', 'Japan', 'South Korea', 'EU', 'Schengen'],
};

export const NATIONALITIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bangladesh', 'Belarus', 'Belgium', 'Bhutan', 'Bolivia', 'Bosnia', 'Brazil',
  'Bulgaria', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Guatemala', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Latvia',
  'Lebanon', 'Libya', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Mauritania', 'Mexico', 'Moldova', 'Mongolia', 'Montenegro', 'Morocco',
  'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain',
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
].sort();

export const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];

export const EMPLOYMENT_STATUS = [
  'Unemployed',
  'Freelancer',
  'Employee (< 1 year)',
  'Employee (1-3 years)',
  'Employee (3-5 years)',
  'Stable job (5+ years)',
  'Self-employed',
  'Business Owner',
  'Student',
  'Retired'
];

export const getVisaRequirement = (nationality, targetCountry) => {
  const visaFreeList = VISA_FREE_COUNTRIES[targetCountry] || [];
  
  const euCountries = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 
    'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 
    'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'];
  
  const schengenCountries = ['Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 'Lithuania', 
    'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Slovakia', 
    'Slovenia', 'Spain', 'Sweden', 'Switzerland'];
  
  if (nationality === targetCountry) {
    return { required: false, reason: 'Citizen of this country' };
  }
  
  if (euCountries.includes(nationality) && euCountries.includes(targetCountry)) {
    return { required: false, reason: 'EU citizen' };
  }
  
  if (schengenCountries.includes(nationality) && schengenCountries.includes(targetCountry)) {
    return { required: false, reason: 'Schengen citizen' };
  }
  
  if (nationality === 'United States' && visaFreeList.includes('USA')) {
    return { required: false, reason: 'Visa-free travel' };
  }
  
  if (nationality === 'United Kingdom' && visaFreeList.includes('UK')) {
    return { required: false, reason: 'Visa-free travel' };
  }
  
  return { required: true, reason: 'Visa required' };
};
