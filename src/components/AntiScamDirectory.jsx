import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Globe, Star, Shield, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';

const CATEGORIES = [
  { id: 'translator', name: 'Sworn Translators', icon: '🔤', color: 'from-blue-500 to-cyan-500' },
  { id: 'medical', name: 'Medical Centers', icon: '🏥', color: 'from-red-500 to-pink-500' },
  { id: 'agency', name: 'Travel Agencies', icon: '✈️', color: 'from-green-500 to-emerald-500' },
  { id: 'lawyer', name: 'Immigration Lawyers', icon: '⚖️', color: 'from-purple-500 to-pink-500' },
];

const CITIES = ['All', 'Algiers', 'Oran', 'Constantine', 'Annaba', 'Tlemcen', 'Setif', 'Mostaganem'];

const AGENCIES = [
  {
    id: 1,
    name: 'Cabinet Traduction Ben Ali',
    category: 'translator',
    city: 'Algiers',
    address: 'Cite Zerzour, Hydra',
    phone: '+213 555 123 456',
    verified: true,
    rating: 4.8,
    reviews: 127,
    languages: ['Arabic', 'French', 'English'],
    specializations: ['Schengen visa docs', 'Birth certificates', 'Marriage certificates'],
    price: '1500-3000 DA per page'
  },
  {
    id: 2,
    name: 'Centre Médical El Baraka',
    category: 'medical',
    city: 'Algiers',
    address: 'RN 11, Bab Ezzouar',
    phone: '+213 770 456 789',
    verified: true,
    rating: 4.5,
    reviews: 89,
    languages: ['Arabic', 'French', 'English'],
    specializations: ['Medical certificates', 'Drug tests', 'X-rays'],
    price: '5000-8000 DA'
  },
  {
    id: 3,
    name: 'Voyages & Services Hadj',
    category: 'agency',
    city: 'Oran',
    address: 'Bd Colonel Amirouche',
    phone: '+213 555 789 012',
    verified: true,
    rating: 4.9,
    reviews: 203,
    languages: ['Arabic', 'French', 'English', 'Spanish'],
    specializations: ['Umrah packages', 'Schengen visas', 'Flight bookings'],
    price: 'From 25,000 DA'
  },
  {
    id: 4,
    name: 'Avocat Meksi Immigration',
    category: 'lawyer',
    city: 'Algiers',
    address: 'Lotissement Djebel, Ben Aknoun',
    phone: '+213 770 111 222',
    verified: true,
    rating: 4.7,
    reviews: 56,
    languages: ['Arabic', 'French', 'English'],
    specializations: ['Visa appeals', 'Rejection cases', 'Family reunification'],
    price: 'Consultation: 10,000 DA'
  },
  {
    id: 5,
    name: 'Traductions Certifiées Sahel',
    category: 'translator',
    city: 'Constantine',
    address: 'Centre Ville, Rue Didouche Mourad',
    phone: '+213 555 234 567',
    verified: true,
    rating: 4.6,
    reviews: 78,
    languages: ['Arabic', 'French', 'English', 'German'],
    specializations: ['Official documents', 'Legal translations', 'Technical docs'],
    price: '1200-2500 DA per page'
  },
  {
    id: 6,
    name: 'Clinique du Voyage Annaba',
    category: 'medical',
    city: 'Annaba',
    address: 'Route de Serag, Annaba',
    phone: '+213 770 345 678',
    verified: false,
    rating: 4.2,
    reviews: 45,
    languages: ['Arabic', 'French'],
    specializations: ['Travel health', 'Vaccinations', 'Medical exams'],
    price: '4000-6000 DA'
  },
];

export default function AntiScamDirectory() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [expandedAgency, setExpandedAgency] = useState(null);

  const filteredAgencies = AGENCIES.filter(agency => {
    if (selectedCategory && agency.category !== selectedCategory) return false;
    if (selectedCity !== 'All' && agency.city !== selectedCity) return false;
    if (showVerifiedOnly && !agency.verified) return false;
    if (searchQuery && !agency.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Verified Agency Directory</h2>
            <p className="text-gray-400 text-sm">Find trusted services & avoid scams</p>
          </div>
        </div>
        
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              Protect yourself from visa scams! We verify all agencies before listing. Look for the ✓ Verified badge.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="input pl-10"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input md:w-48"
          >
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-white text-sm">Verified Only</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              !selectedCategory
                ? 'bg-green-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            All Services
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredAgencies.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No agencies found matching your criteria</p>
            </div>
          ) : (
            filteredAgencies.map(agency => {
              const category = CATEGORIES.find(c => c.id === agency.category);
              const isExpanded = expandedAgency === agency.id;
              
              return (
                <div
                  key={agency.id}
                  className={`p-4 rounded-xl transition-all ${
                    agency.verified
                      ? 'bg-gray-800/50 border border-gray-700'
                      : 'bg-gray-900/50 border border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category?.color} flex items-center justify-center text-lg`}>
                        {category?.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-semibold">{agency.name}</h4>
                          {agency.verified && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full text-green-400 text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{agency.city} • {category?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{agency.rating}</span>
                      </div>
                      <p className="text-gray-500 text-xs">{agency.reviews} reviews</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {agency.languages.map(lang => (
                      <span key={lang} className="px-2 py-1 bg-gray-700/50 rounded text-gray-300 text-xs">
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-gray-400 mb-3">
                    <p className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {agency.address}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {agency.phone}
                    </p>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Specializations:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {agency.specializations.map(spec => (
                          <span key={spec} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                      <p className="text-green-400 text-sm font-semibold">
                        Price range: {agency.price}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setExpandedAgency(isExpanded ? null : agency.id)}
                      className="flex-1 py-2 bg-gray-700/50 rounded-xl text-white text-sm hover:bg-gray-600 transition-colors"
                    >
                      {isExpanded ? 'Show Less' : 'View Details'}
                    </button>
                    <a
                      href={`tel:${agency.phone}`}
                      className="px-4 py-2 bg-green-600 rounded-xl text-white text-sm hover:bg-green-500 transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 bg-red-500/5 border border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-bold mb-2">Protect Yourself from Scams</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Always verify agency credentials before paying</li>
              <li>• Never pay full amount upfront</li>
              <li>• Get written receipts for all payments</li>
              <li>• Report suspicious agencies to us</li>
              <li>• Look for the ✓ Verified badge</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
