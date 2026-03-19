import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Play, RotateCcw, Info } from 'lucide-react';
import { NATIONALITIES, MARITAL_STATUS, EMPLOYMENT_STATUS, COUNTRIES } from '../data/constants';
import { calculateTotalScore, calculateCountryScores, getRiskLevel } from '../utils/scoringEngine';

export default function Simulator() {
  const navigate = useNavigate();
  const { assessment } = useApp();

  const initialProfile = assessment?.profile || {
    age: 30,
    nationality: 'India',
    maritalStatus: 'Single',
    employmentStatus: 'Employee (1-3 years)',
    monthlyIncome: 3000,
    bankBalance: 5000,
    travelHistory: 2,
    previousVisaRefusals: 0,
  };

  const [profile, setProfile] = useState(initialProfile);
  const [selectedCountry, setSelectedCountry] = useState('France');

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const scores = useMemo(() => {
    return calculateTotalScore(profile, { passport: true, bankStatement: true, employmentProof: true }, selectedCountry);
  }, [profile, selectedCountry]);

  const countryScores = useMemo(() => {
    return calculateCountryScores(scores.total, profile.nationality);
  }, [scores.total, profile.nationality]);

  const riskLevel = getRiskLevel(scores.total);

  const resetProfile = () => {
    setProfile(initialProfile);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 55) return 'text-yellow-400';
    if (score >= 35) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">What-If Simulator</h1>
          <p className="text-gray-400">Adjust your profile to see how changes affect your visa chances</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Play className="text-neon-purple" size={20} />
                Profile Settings
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Age</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="18"
                      max="70"
                      value={profile.age}
                      onChange={(e) => updateProfile('age', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-12 text-center">{profile.age}</span>
                  </div>
                </div>

                <div>
                  <label className="label">Monthly Income ($)</label>
                  <input
                    type="number"
                    value={profile.monthlyIncome}
                    onChange={(e) => updateProfile('monthlyIncome', parseInt(e.target.value) || 0)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Bank Balance ($)</label>
                  <input
                    type="number"
                    value={profile.bankBalance}
                    onChange={(e) => updateProfile('bankBalance', parseInt(e.target.value) || 0)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Nationality</label>
                  <select
                    value={profile.nationality}
                    onChange={(e) => updateProfile('nationality', e.target.value)}
                    className="input"
                  >
                    <option value="">Select nationality</option>
                    {[...new Set([...NATIONALITIES.VISA_FREE, ...NATIONALITIES.SCHENGEN_VISA_REQUIRED])]
                      .sort()
                      .map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="label">Marital Status</label>
                  <select
                    value={profile.maritalStatus}
                    onChange={(e) => updateProfile('maritalStatus', e.target.value)}
                    className="input"
                  >
                    {MARITAL_STATUS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Employment Status</label>
                  <select
                    value={profile.employmentStatus}
                    onChange={(e) => updateProfile('employmentStatus', e.target.value)}
                    className="input"
                  >
                    {EMPLOYMENT_STATUS.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Travel History (international trips)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={profile.travelHistory}
                      onChange={(e) => updateProfile('travelHistory', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-12 text-center">{profile.travelHistory}</span>
                  </div>
                </div>

                <div>
                  <label className="label">Previous Visa Refusals</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={profile.previousVisaRefusals}
                      onChange={(e) => updateProfile('previousVisaRefusals', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-12 text-center">{profile.previousVisaRefusals}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetProfile}
                className="mt-6 flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <RotateCcw size={16} />
                Reset to Original
              </button>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="text-cyan-400" size={20} />
                Score Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Financial', value: scores.breakdown.financial, max: 30 },
                  { label: 'Employment', value: scores.breakdown.employment, max: 20 },
                  { label: 'Travel History', value: scores.breakdown.travel, max: 20 },
                  { label: 'Profile Strength', value: scores.breakdown.profile, max: 15 },
                  { label: 'Documents', value: scores.breakdown.documents, max: 15 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white">{item.value}/{item.max}</span>
                    </div>
                    <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg transition-all duration-300"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 text-center sticky top-24">
              <h3 className="text-gray-400 text-sm mb-2">Simulated Score</h3>

              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-navy-700" />
                  <circle
                    cx="64" cy="64" r="56" stroke="url(#simGrad)" strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(scores.total / 100) * 352} 352`}
                  />
                  <defs>
                    <linearGradient id="simGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(scores.total)}`}>{scores.total}</span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${riskLevel.bg} ${riskLevel.color}`}>
                {riskLevel.level} Risk
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <label className="label">Compare Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="input"
                >
                  {COUNTRIES.slice(0, 10).map(c => (
                    <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-white font-semibold mb-4">Country Comparison</h3>
              <div className="space-y-2">
                {countryScores.slice(0, 5).map((country, index) => (
                  <div
                    key={country.name}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      country.name === selectedCountry ? 'bg-neon-purple/20 border border-neon-purple/50' : 'bg-navy-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-white text-sm">{country.name}</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(country.successRate)}`}>
                      {country.successRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/eligibility-test')}
              className="btn-primary w-full"
            >
              Full Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
