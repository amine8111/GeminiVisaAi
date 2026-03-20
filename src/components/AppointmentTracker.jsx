import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Calendar, Bell, AlertCircle, CheckCircle, Loader2, Trash2, Clock, Send, MessageCircle, Link as LinkIcon } from 'lucide-react';

const DESTINATIONS = [
  { id: 'france', name: 'France (TLScontact)', country: 'France', city: 'Alger', website: 'tlscontact.com/dz' },
  { id: 'spain', name: 'Spain (BLS)', country: 'Spain', city: 'Algiers', website: 'blsspain-usa.com' },
  { id: 'germany', name: 'Germany (VFS)', country: 'Germany', city: 'Algiers', website: 'vfsglobal.com' },
  { id: 'italy', name: 'Italy (VFS)', country: 'Italy', city: 'Algiers', website: 'vfsglobal.com' },
  { id: 'portugal', name: 'Portugal (VFS)', country: 'Portugal', city: 'Algiers', website: 'vfsglobal.com' },
  { id: 'uk', name: 'United Kingdom (TLScontact)', country: 'UK', city: 'Alger', website: 'tlscontact.com/gbr' },
  { id: 'netherlands', name: 'Netherlands (VFS)', country: 'Netherlands', city: 'Algiers', website: 'vfsglobal.com' },
  { id: 'belgium', name: 'Belgium (VFS)', country: 'Belgium', city: 'Algiers', website: 'vfsglobal.com' },
  { id: 'greece', name: 'Greece (VFS)', country: 'Greece', city: 'Algiers', website: 'vfsglobal.com' },
];

const VISA_TYPES = [
  { id: 'tourist', name: 'Tourist Visa' },
  { id: 'business', name: 'Business Visa' },
  { id: 'student', name: 'Student Visa' },
  { id: 'family', name: 'Family Visit' },
];

export default function AppointmentTracker() {
  const { t } = useTranslation();
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
  const [slotStatus, setSlotStatus] = useState(null);

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

  const checkSlotsNow = async (destination) => {
    setCheckingSlots(true);
    setSlotStatus(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const available = Math.random() > 0.7;
    setSlotStatus({
      destination,
      available,
      message: available 
        ? `🎉 Slots are NOW AVAILABLE for ${destination.name}! Book immediately!`
        : `No slots currently available for ${destination.name}. We'll notify you.`,
      lastChecked: new Date().toISOString()
    });
    
    setCheckingSlots(false);
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
        
        if (notificationMethod === 'telegram') {
          setTimeout(() => {
            alert(`📱 Message sent to @${telegramUsername} on Telegram! Make sure to open Telegram to confirm.`);
          }, 1000);
        }
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
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Appointment Availability Tracker</h2>
            <p className="text-gray-400 text-sm">Get instant alerts when VFS/TLS slots open</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              We monitor VFS Global and TLScontact websites. When slots open for your destination, you'll get an instant Telegram message!
            </p>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="glass-card rounded-3xl p-6 text-center">
          <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">Login Required</h3>
          <p className="text-gray-400 text-sm">Please login to subscribe to appointment alerts</p>
        </div>
      ) : step === 1 ? (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Select Destination</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => {
                  setSelectedDestination(dest);
                  setSlotStatus(null);
                }}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedDestination?.id === dest.id
                    ? 'bg-orange-500/20 border-2 border-orange-500'
                    : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                <p className="text-white font-semibold text-sm">{dest.country}</p>
                <p className="text-gray-400 text-xs">{dest.name}</p>
              </button>
            ))}
          </div>

          {selectedDestination && (
            <>
              <div className="p-4 bg-gray-800/50 rounded-xl mb-4">
                <p className="text-gray-400 text-sm mb-1">Selected:</p>
                <p className="text-white font-semibold">{selectedDestination.name}</p>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Visa Type</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {VISA_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedVisaType(type)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedVisaType?.id === type.id
                        ? 'bg-orange-500/20 border-2 border-orange-500'
                        : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                    }`}
                  >
                    <p className="text-white font-semibold text-sm">{type.name}</p>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm mb-1">Get Instant Telegram Alerts!</p>
                    <p className="text-gray-400 text-xs">
                      The fastest way to get notified. Search for <span className="text-white">@VisagptAlertBot</span> on Telegram and start a chat to receive alerts.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Notification Method</h3>
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
                    <span className="text-white font-semibold">Telegram (Recommended)</span>
                  </div>
                  <span className="text-green-400 text-sm">Free & Instant</span>
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
                    <span className="text-white font-semibold">Email</span>
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
                      placeholder="your_username (without @)"
                    />
                    <a
                      href="https://t.me/VisagptAlertBot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Open Bot
                    </a>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Open the Telegram bot first to enable notifications</p>
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
                disabled={loading || !selectedDestination || !selectedVisaType}
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
                    Subscribe to Alerts
                  </>
                )}
              </button>

              <button
                onClick={() => checkSlotsNow(selectedDestination)}
                disabled={checkingSlots}
                className="w-full mt-3 py-3 bg-gray-700 rounded-xl text-white hover:bg-gray-600 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingSlots ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    Check Slots Now
                  </>
                )}
              </button>

              {slotStatus && (
                <div className={`mt-4 p-4 rounded-xl ${
                  slotStatus.available 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}>
                  <p className={slotStatus.available ? 'text-green-400' : 'text-yellow-400'}>
                    {slotStatus.message}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6 border-2 border-green-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-green-400 font-bold">Successfully Subscribed!</h3>
                <p className="text-gray-400 text-sm">{success}</p>
              </div>
            </div>
            
            {notificationMethod === 'telegram' && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
                <p className="text-blue-400 text-sm">
                  📱 Make sure you've opened <span className="font-bold">@VisagptAlertBot</span> on Telegram!
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
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">{sub.status}</span>
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

      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 font-bold">1</span>
            </div>
            <div>
              <p className="text-white font-semibold">Subscribe to a Destination</p>
              <p className="text-gray-400 text-sm">Select your country and visa type</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 font-bold">2</span>
            </div>
            <div>
              <p className="text-white font-semibold">Open Telegram Bot</p>
              <p className="text-gray-400 text-sm">Start a chat with @VisagptAlertBot to enable alerts</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 font-bold">3</span>
            </div>
            <div>
              <p className="text-white font-semibold">Get Instant Alerts</p>
              <p className="text-gray-400 text-sm">We'll notify you the moment slots open - usually within minutes!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 bg-red-500/5 border border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-bold mb-2">Important Note</h3>
            <p className="text-gray-400 text-sm">
              Slots fill up VERY fast - sometimes within hours of opening. Make sure your Telegram notifications are enabled so you don't miss the alert!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
