import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateTotalScore, calculateCountryScores, getRiskLevel, analyzeRisks, generateActionPlan } from '../utils/scoringEngine';
import { saveAssessment } from '../services/supabase';

export default function Processing() {
  const navigate = useNavigate();
  const { profile, documents, setAssessment } = useApp();
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const calculateAndStore = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const scores = calculateTotalScore(profile, documents);
      setProgress(50);
      
      const countryScores = calculateCountryScores(scores.total, profile.nationality);
      setProgress(70);
      
      const riskLevel = getRiskLevel(scores.total);
      const risks = analyzeRisks(profile, scores);
      const actions = generateActionPlan(profile, scores, risks);
      setProgress(85);

      const assessment = {
        totalScore: scores.total,
        breakdown: scores.breakdown,
        countryScores,
        riskLevel,
        risks,
        actions,
        profile,
        documents,
        createdAt: new Date().toISOString(),
      };

      setSaving(true);
      try {
        await saveAssessment('demo-user', assessment);
        console.log('Assessment saved to database');
      } catch (err) {
        console.log('Could not save to database:', err);
      }
      setSaving(false);
      
      setProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssessment(assessment);
      navigate('/results');
    };

    calculateAndStore();
  }, []);

  useEffect(() => {
    if (progress < 100) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 1;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, []);

  const processingSteps = [
    'Analyzing profile data...',
    'Calculating financial score...',
    'Evaluating employment status...',
    'Assessing travel history...',
    'Generating country recommendations...',
    'Identifying risk factors...',
    'Creating action plan...',
    saving ? 'Saving results...' : 'Finalizing...',
  ];

  const currentStep = Math.min(
    Math.ceil((progress / 100) * processingSteps.length),
    processingSteps.length - 1
  );

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-8 relative">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="none" className="text-navy-700" />
            <circle
              cx="48" cy="48" r="44" stroke="url(#loadingGrad)" strokeWidth="6" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 276} 276`}
            />
            <defs>
              <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold gradient-text">{progress}%</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          {saving ? 'Saving Your Results' : 'Analyzing Your Profile'}
        </h2>
        
        <div className="max-w-md mx-auto space-y-2">
          {processingSteps.slice(0, currentStep + 1).map((step, index) => (
            <div key={index} className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              {step}
            </div>
          ))}
        </div>

        <div className="mt-8 max-w-md mx-auto h-2 bg-navy-700 rounded-full overflow-hidden">
          <div className="h-full gradient-bg transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
