import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, DollarSign, Calendar, Users, MapPin, Info, CheckCircle, AlertCircle, TrendingUp, Download } from 'lucide-react';

const EU_MINIMUM_DAILY = {
  'Germany': { person: 45, first_day: 45, subsequent: 45 },
  'France': { person: 45, first_day: 45, subsequent: 45 },
  'Italy': { person: 35, first_day: 35, subsequent: 35 },
  'Spain': { person: 45, first_day: 45, subsequent: 45 },
  'Netherlands': { person: 45, first_day: 45, subsequent: 45 },
  'Belgium': { person: 45, first_day: 45, subsequent: 45 },
  'Austria': { person: 45, first_day: 45, subsequent: 45 },
  'Switzerland': { person: 100, first_day: 100, subsequent: 100 },
  'Greece': { person: 35, first_day: 35, subsequent: 35 },
  'Portugal': { person: 40, first_day: 40, subsequent: 40 },
  'Czech Republic': { person: 30, first_day: 30, subsequent: 30 },
  'Poland': { person: 30, first_day: 30, subsequent: 30 },
  'Hungary': { person: 30, first_day: 30, subsequent: 30 },
  'Sweden': { person: 45, first_day: 45, subsequent: 45 },
  'Norway': { person: 50, first_day: 50, subsequent: 50 },
  'Denmark': { person: 45, first_day: 45, subsequent: 45 },
  'Finland': { person: 45, first_day: 45, subsequent: 45 },
  'Ireland': { person: 45, first_day: 45, subsequent: 45 },
  'Slovakia': { person: 30, first_day: 30, subsequent: 30 },
  'Slovenia': { person: 35, first_day: 35, subsequent: 35 },
  'Lithuania': { person: 30, first_day: 30, subsequent: 30 },
  'Latvia': { person: 30, first_day: 30, subsequent: 30 },
  'Estonia': { person: 30, first_day: 30, subsequent: 30 },
  'Malta': { person: 45, first_day: 45, subsequent: 45 },
  'Luxembourg': { person: 45, first_day: 45, subsequent: 45 },
  'Iceland': { person: 50, first_day: 50, subsequent: 50 },
  'Croatia': { person: 35, first_day: 35, subsequent: 35 },
};

const countries = Object.keys(EU_MINIMUM_DAILY).sort();

const accommodationRates = {
  'hotel': 80,
  'hostel': 30,
  'airbnb': 60,
  'sponsor': 0,
};

export default function FinancialProofPlanner() {
  const { t } = useTranslation();
  const [destination, setDestination] = useState('');
  const [stayDays, setStayDays] = useState(14);
  const [travelers, setTravelers] = useState(1);
  const [accommodation, setAccommodation] = useState('hotel');
  const [result, setResult] = useState(null);
  const [showTip, setShowTip] = useState(false);

  const calculateProof = () => {
    if (!destination) return;

    const dailyRate = EU_MINIMUM_DAILY[destination] || { person: 45, first_day: 45, subsequent: 45 };
    const accomCost = accommodationRates[accommodation];
    
    const minDailyMeans = dailyRate.person;
    const accommodationMultiplier = accommodation === 'sponsor' ? 0 : (accommodation === 'hostel' ? 0.7 : 1);
    
    const minRequired = (minDailyMeans * stayDays * travelers);
    const accommodationBonus = (accomCost * stayDays * travelers * accommodationMultiplier);
    const recommended = minRequired + (accommodationBonus * 0.3);
    
    const withBuffer = {
      minimum: Math.ceil(minRequired / 10) * 10,
      recommended: Math.ceil(recommended / 10) * 10,
      withBankStatement: Math.ceil((minRequired * 1.3) / 10) * 10,
    };

    const dailyBreakdown = {
      food: minDailyMeans * 0.5,
      transport: minDailyMeans * 0.2,
      misc: minDailyMeans * 0.3,
    };

    setResult({
      country: destination,
      days: stayDays,
      people: travelers,
      accommodation,
      minRequired: withBuffer.minimum,
      recommended: withBuffer.recommended,
      withBankStatement: withBuffer.withBankStatement,
      dailyBreakdown,
      dailyRate: minDailyMeans,
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Financial Proof Planner</h2>
            <p className="text-gray-400 text-sm">Estimate required funds for your Schengen visa application</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              Each Schengen country has minimum daily requirements. This calculator uses official EU guidance to help you understand how much you should show in your bank statements.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination Country
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Duration of Stay (days)
            </label>
            <input
              type="number"
              value={stayDays}
              onChange={(e) => setStayDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="input"
              min="1"
              max="90"
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Users className="w-4 h-4" />
              Number of Travelers
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value))}
              className="input"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} person{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Accommodation Type
            </label>
            <select
              value={accommodation}
              onChange={(e) => setAccommodation(e.target.value)}
              className="input"
            >
              <option value="hotel">Hotel (3-star)</option>
              <option value="hostel">Hostel/Budget</option>
              <option value="airbnb">Airbnb/ Apartment</option>
              <option value="sponsor">Sponsored/ Friend's Place</option>
            </select>
          </div>
        </div>

        <button
          onClick={calculateProof}
          disabled={!destination}
          className="w-full btn-primary mt-6 flex items-center justify-center gap-2 glow-button disabled:opacity-50"
        >
          <Calculator className="w-5 h-5" />
          Calculate Required Funds
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6 border-2 border-green-500/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Your Financial Requirements
            </h3>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-1">For {result.days} days in {result.country} with {result.people} traveler{result.people > 1 ? 's' : ''}</p>
              <p className="text-white text-lg">
                You should be ready to show at least{' '}
                <span className="text-2xl font-bold gradient-text">
                  €{result.minRequired.toLocaleString()} - €{result.recommended.toLocaleString()}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">Minimum</p>
                <p className="text-xl font-bold text-white">€{result.minRequired.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <p className="text-gray-400 text-xs mb-1">Recommended</p>
                <p className="text-xl font-bold gradient-text">€{result.recommended.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">With Bank Statement</p>
                <p className="text-xl font-bold text-white">€{result.withBankStatement.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-semibold text-sm">Pro Tip</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Having slightly more than the minimum (recommended amount) shows stronger financial stability and increases your chances of approval.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Daily Breakdown (per person)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <span className="text-orange-400 text-sm">🍽️</span>
                  </div>
                  <span className="text-gray-300">Food & Meals</span>
                </div>
                <span className="text-white font-semibold">€{result.dailyBreakdown.food.toFixed(0)}/day</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-sm">🚌</span>
                  </div>
                  <span className="text-gray-300">Local Transport</span>
                </div>
                <span className="text-white font-semibold">€{result.dailyBreakdown.transport.toFixed(0)}/day</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 text-sm">📱</span>
                  </div>
                  <span className="text-gray-300">Miscellaneous</span>
                </div>
                <span className="text-white font-semibold">€{result.dailyBreakdown.misc.toFixed(0)}/day</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-gray-400">Minimum per day (EU guidance):</span>
              <span className="text-green-400 font-bold">€{result.dailyRate}/day</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">What Counts as Proof?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Bank Statements</p>
                  <p className="text-gray-400 text-sm">Last 3-6 months of official bank statements showing regular income</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Sponsorship Letter</p>
                  <p className="text-gray-400 text-sm">Official sponsor declaration + sponsor's bank statements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Cash Allowance</p>
                  <p className="text-gray-400 text-sm">Traveler's checks or prepaid travel cards with clear balance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Credit Cards</p>
                  <p className="text-gray-400 text-sm">Recent statements showing available credit limit</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowTip(!showTip)}
            className="w-full p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-left"
          >
            <p className="text-purple-400 font-semibold flex items-center gap-2">
              <Info className="w-4 h-4" />
              {showTip ? 'Hide Tips' : 'Show Tips for Stronger Proof'}
            </p>
            {showTip && (
              <div className="mt-3 space-y-2 text-gray-400 text-sm">
                <p>• Average balance matters more than one-time deposits</p>
                <p>• Regular salary deposits show stable income</p>
                <p>• Avoid large unexplained deposits just before application</p>
                <p>• If using sponsor, their funds should be easily traceable</p>
                <p>• Consider showing 20-30% more than minimum for buffer</p>
              </div>
            )}
          </button>
        </div>
      )}

      {!result && (
        <div className="glass-card rounded-3xl p-8 text-center">
          <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Select your destination and enter your trip details to calculate required funds</p>
        </div>
      )}
    </div>
  );
}
