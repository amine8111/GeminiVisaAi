import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateTotalScore, calculateCountryScores, getRiskLevel, analyzeRisks, generateActionPlan } from '../utils/scoringEngine';

export default function Processing() {
  const navigate = useNavigate();
  const { profile, documents, setAssessment } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateAndStore = async () => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const scores = calculateTotalScore(profile, documents);
      const countryScores = calculateCountryScores(scores.total, profile.nationality);
      const riskLevel = getRiskLevel(scores.total);
      const risks = analyzeRisks(profile, scores);
      const actions = generateActionPlan(profile, scores, risks);

      const assessment = {
        totalScore: scores.total,
        breakdown: scores.breakdown,
        countryScores,
        riskLevel,
        risks,
        actions,
        profile,
        documents,
      };

      setAssessment(assessment);
      navigate('/results');
    };

    calculateAndStore();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const processingSteps = [
    'Analyzing profile data...',
    'Calculating financial score...',
    'Evaluating employment status...',
    'Assessing travel history...',
    'Generating country recommendations...',
    'Identifying risk factors...',
    'Creating action plan...',
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-neon-purple/20"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-neon-purple border-t-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold gradient-text">{progress}%</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Analyzing Your Profile</h2>
        
        <div className="max-w-md mx-auto space-y-2">
          {processingSteps.slice(0, Math.ceil((progress / 100) * processingSteps.length)).map((step, index) => (
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
