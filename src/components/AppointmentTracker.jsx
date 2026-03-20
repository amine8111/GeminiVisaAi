import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Calendar, Bell, AlertCircle, CheckCircle, Loader2, Trash2, Clock, Send, MessageCircle, ExternalLink, Globe, Info } from 'lucide-react';

const DESTINATIONS = [
  {
    id: 'france',
    name: 'France',
    provider: 'Capago International',
    city: 'Algiers, Oran',
    website: 'https://capago.fr',
    bookingUrl: 'https://capago.fr/fr/booking',
    note: 'Capago replaced TLScontact & VFS as of March 2025'
  },
  {
    id: 'spain',
    name: 'Spain',
    provider: 'BLS International',
    city: 'Algiers',
    website: 'https://algeria.blsspainvisa.com',
    bookingUrl: 'https://algeria.blsspainvisa.com/algiers/',
    note: ''
  },
  {
    id: 'germany',
    name: 'Germany',
    provider: 'VFS Global',
    city: 'Algiers',
    website: 'https://visa.vfsglobal.com/dza/en/deu',
    bookingUrl: 'https://visa.vfsglobal.com/dza/en/deu/book-an-appointment',
    note: ''
  },
  {
    id: 'italy',
    name: 'Italy',
    provider: 'VFS Global',
    city: 'Algiers',
    website: 'https://visa.vfsglobal.com/dza/en/ita',
    bookingUrl: 'https://visa.vfsglobal.com/dza/en/ita/book-an-appointment',
    note: 'Centers also in Oran, Constantine, Annaba, Adrar'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    provider: 'VFS Global',
    city: 'Algiers',
    website: 'https://visa.vfsglobal.com/dza/en/gbr',
    bookingUrl: 'https://visa.vfsglobal.com/dza/en/gbr/book-an-appointment',
    note: 'VFS replaced TLScontact as of late 2024'
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    provider: 'VFS Global',
    city: 'Algiers',
    website: 'https://visa.vfsglobal.com/dza/en/nld',
    bookingUrl: 'https://visa.vfsglobal.com/dza/en/nld/book-an-appointment',
    note: ''
  },
  {
    id: 'portugal',
    name: 'Portugal',
    provider: 'VFS Global',
    city: 'Algiers',
    website: 'https://visa.vfsglobal.com/dza/en/prt',
    bookingUrl: 'https://visa.vfsglobal.com/dza/en/prt/book-an-appointment',
    note: ''
  },
  {
    id: 'belgium',
    name: 'Belgium',
    provider: 'VFS Global',
    city: 'Algiers',
    website: 'https://visa.vfsglobal.com/dza/en/bel',
    bookingUrl: 'https://visa.vfsglobal.com/dza/en/bel/book-an-appointment',
    note: ''
  },
  {
    id: 'greece',
    name: 'Greece',
    provider: 'VFS Global',
    city: 'Algiers',
    website: 'https://visa.vfsglobal.com/dza/en/grc',
    bookingUrl: 'https://visa.vfsglobal.com/dza/en/grc/book-an-appointment',
    note: ''
  },
];

const VISA_TYPES = [
  { id: 'tourist', name: 'Tourist Visa' },
  { id: 'business', name: 'Business Visa' },
  { id: 'student', name: 'Student Visa' },
  { id: 'family', name: 'Family Visit' },
  { id: 'work', name: 'Work Visa' },
];

export default function AppointmentTracker() {
  const { t, i18n } = useTranslation();
  const { API_URL, getAuthHeaders, user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedVisaType, setSelectedVisaType] = useState(null);
  const [notificationMethod, setNotificationMethod] = useState('telegram');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [showDestinations, setShowDestinations] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/subscriptions`, {
        headers: { ...getAuthHeaders() },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions');
    }
  };

  const subscribe = async () => {
    if (!selectedDestination || !selectedVisaType) {
      setError('Please select both destination and visa type');
      return;
    }

    if (notificationMethod === 'telegram' && !telegramUsername) {
      setError('Please enter your Telegram username');
      return;
    }

    if (notificationMethod === 'email' && !email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/appointments/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          destination: selectedDestination.id,
          destination_name: selectedDestination.name,
          visa_type: selectedVisaType.id,
          notification_method: notificationMethod,
          telegram_username: notificationMethod === 'telegram' ? telegramUsername : null,
          email: notificationMethod === 'email' ? email : null,
          phone: phone || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Successfully subscribed! You will be notified when slots open.');
        setStep(2);
        fetchSubscriptions();
      } else {
        setError(data.message || 'Failed to subscribe');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const unsubscribe = async (id) => {
    try {
      await fetch(`${API_URL}/api/appointments/unsubscribe/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to unsubscribe');
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedDestination(null);
    setSelectedVisaType(null);
    setTelegramUsername('');
    setEmail('');
    setError('');
    setSuccess('');
    setShowDestinations(true);
  };

  const openBookingSite = (destination) => {
    window.open(destination.bookingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Appointment Tracker</h2>
            <p className="text-gray-400 text-sm">Get notified when appointment slots open</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-gray-400 text-sm">
              <p className="mb-2">Subscribe to get instant Telegram alerts when slots open for your destination!</p>
              <p className="text-blue-300">Or click any destination below to go directly to the official booking website.</p>
            </div>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="glass-card rounded-3xl p-6 text-center">
          <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">Login Required</h3>
          <p className="text-gray-400 text-sm">Please login to subscribe to appointment alerts</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-400" />
              Select Destination & Book Appointment
            </h3>
            
            <div className="space-y-3">
              {DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedDestination?.id === dest.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                  onClick={() => {
                    setSelectedDestination(dest);
                    setShowDestinations(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-bold">{dest.name}</h4>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          {dest.provider}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{dest.city}</p>
                      {dest.note && (
                        <p className="text-yellow-400 text-xs mt-1">{dest.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedDestination?.id === dest.id && (
                        <CheckCircle className="w-5 h-5 text-orange-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBookingSite(dest);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedDestination && (
            <div className="glass-card rounded-3xl p-6 border-2 border-orange-500/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Subscribe to Alerts: {selectedDestination.name}
                </h3>
                <button
                  onClick={() => {
                    setSelectedDestination(null);
                    setShowDestinations(true);
                  }}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Change
                </button>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-semibold">{selectedDestination.provider}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="w-4 h-4" />
                  <a
                    href={selectedDestination.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {selectedDestination.website}
                  </a>
                </div>
              </div>

              <h4 className="text-white font-semibold mb-3">Visa Type</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                {VISA_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedVisaType(type)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedVisaType?.id === type.id
                        ? 'bg-orange-500/20 border-2 border-orange-500 text-white'
                        : 'bg-gray-800/50 border-2 border-transparent text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>

              <h4 className="text-white font-semibold mb-3">Get Alert Via</h4>
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setNotificationMethod('telegram')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    notificationMethod === 'telegram'
                      ? 'bg-blue-500/20 border-2 border-blue-500'
                      : 'bg-gray-800/50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <span className="text-white font-semibold">Telegram (Recommended)</span>
                      <p className="text-gray-400 text-xs">Instant notifications on your phone</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">Free</span>
                </button>

                <button
                  onClick={() => setNotificationMethod('email')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    notificationMethod === 'email'
                      ? 'bg-purple-500/20 border-2 border-purple-500'
                      : 'bg-gray-800/50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <div className="text-left">
                      <span className="text-white font-semibold">Email</span>
                      <p className="text-gray-400 text-xs">Get notified via email</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">Free</span>
                </button>
              </div>

              {notificationMethod === 'telegram' && (
                <div className="mb-4">
                  <label className="label">Telegram Username</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value.replace('@', ''))}
                      className="input flex-1"
                      placeholder="your_username"
                    />
                    <a
                      href="https://t.me/Visaaigptprobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Open Bot
                    </a>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Make sure you've started @Visaaigptprobot on Telegram first
                  </p>
                </div>
              )}

              {notificationMethod === 'email' && (
                <div className="mb-4">
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={subscribe}
                disabled={loading || !selectedVisaType || (notificationMethod === 'telegram' && !telegramUsername) || (notificationMethod === 'email' && !email)}
                className="w-full btn-primary flex items-center justify-center gap-2 glow-button disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    Subscribe for Alerts
                  </>
                )}
              </button>
            </div>
          )}

          {success && (
            <div className="glass-card rounded-3xl p-6 border-2 border-green-500/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-green-400 font-bold">Subscribed!</h3>
                  <p className="text-gray-400 text-sm">{success}</p>
                </div>
              </div>
              
              {notificationMethod === 'telegram' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
                  <p className="text-blue-400 text-sm">
                    📱 Check your Telegram - you should receive a confirmation from @Visaaigptprobot!
                  </p>
                </div>
              )}
              
              <button
                onClick={reset}
                className="text-orange-400 text-sm hover:underline"
              >
                + Subscribe to another destination
              </button>
            </div>
          )}

          {subscriptions.length > 0 && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Active Subscriptions</h3>
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl mb-2">
                  <div>
                    <p className="text-white font-semibold">{sub.destination_name || sub.destination}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {sub.notify_telegram && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Telegram</span>}
                      {sub.notify_email && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Email</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => unsubscribe(sub.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="glass-card rounded-3xl p-6 bg-yellow-500/5 border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-400 font-bold mb-2">Important</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Always book appointments through official websites only</li>
              <li>• Never pay intermediaries to book for you</li>
              <li>• Slots fill up fast - check websites daily</li>
              <li>• We notify you when subscribed destinations have openings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
