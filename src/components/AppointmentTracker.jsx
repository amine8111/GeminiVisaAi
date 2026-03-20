import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Bell, AlertCircle, CheckCircle, Loader2, Trash2, Clock } from 'lucide-react';

const DESTINATIONS = [
  { id: 'france', name: 'France (TLScontact)', country: 'France', website: 'tlscontact.com' },
  { id: 'spain', name: 'Spain (BLS)', country: 'Spain', website: 'blsspain-usa.com' },
  { id: 'germany', name: 'Germany (VFS)', country: 'Germany', website: 'vfsglobal.com' },
  { id: 'italy', name: 'Italy (VFS)', country: 'Italy', website: 'vfsglobal.com' },
  { id: 'portugal', name: 'Portugal (VFS)', country: 'Portugal', website: 'vfsglobal.com' },
  { id: 'uk', name: 'United Kingdom (TLScontact)', country: 'UK', website: 'tlscontact.com' },
  { id: 'netherlands', name: 'Netherlands (VFS)', country: 'Netherlands', website: 'vfsglobal.com' },
  { id: 'belgium', name: 'Belgium (VFS)', country: 'Belgium', website: 'vfsglobal.com' },
  { id: 'greece', name: 'Greece (VFS)', country: 'Greece', website: 'vfsglobal.com' },
];

const NOTIFICATION_METHODS = [
  { id: 'sms', name: 'SMS', price: '50 DZD/month' },
  { id: 'email', name: 'Email', price: 'Free' },
  { id: 'whatsapp', name: 'WhatsApp', price: '100 DZD/month' },
];

export default function AppointmentTracker() {
  const { t } = useTranslation();
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [notificationMethods, setNotificationMethods] = useState(['email']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleNotificationMethod = (method) => {
    if (notificationMethods.includes(method)) {
      setNotificationMethods(notificationMethods.filter(m => m !== method));
    } else {
      setNotificationMethods([...notificationMethods, method]);
    }
  };

  const subscribe = async () => {
    if (!selectedDestination) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const newSub = {
        id: Date.now(),
        destination: selectedDestination,
        notifications: notificationMethods,
        phone: phoneNumber,
        email: email,
        status: 'active',
        lastChecked: new Date().toISOString(),
        subscribedAt: new Date().toISOString()
      };
      setSubscriptions([...subscriptions, newSub]);
      setSubscribed(true);
      setLoading(false);
    }, 2000);
  };

  const unsubscribe = (id) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
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
            <p className="text-gray-400 text-sm">Get instant alerts when appointment slots open</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              We monitor official visa processing websites 24/7. When a slot opens for your selected destination, you'll be notified immediately via your preferred method.
            </p>
          </div>
        </div>
      </div>

      {!subscribed ? (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Select Your Destination</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedDestination?.id === dest.id
                    ? 'bg-orange-500/20 border-2 border-orange-500'
                    : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                <p className="text-white font-semibold">{dest.name}</p>
                <p className="text-gray-400 text-xs">{dest.website}</p>
              </button>
            ))}
          </div>

          {selectedDestination && (
            <>
              <div className="p-4 bg-gray-800/50 rounded-xl mb-4">
                <p className="text-gray-400 text-sm mb-1">Selected:</p>
                <p className="text-white font-semibold">{selectedDestination.name}</p>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Notification Methods</h3>
              <div className="space-y-3 mb-6">
                {NOTIFICATION_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                      notificationMethods.includes(method.id)
                        ? 'bg-orange-500/20 border-2 border-orange-500'
                        : 'bg-gray-800/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationMethods.includes(method.id)}
                        onChange={() => toggleNotificationMethod(method.id)}
                        className="hidden"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        notificationMethods.includes(method.id)
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-500'
                      }`}>
                        {notificationMethods.includes(method.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-white font-semibold">{method.name}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{method.price}</span>
                  </label>
                ))}
              </div>

              {(notificationMethods.includes('sms') || notificationMethods.includes('whatsapp')) && (
                <div className="mb-4">
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input"
                    placeholder="+213 XXX XXX XXX"
                  />
                </div>
              )}

              {notificationMethods.includes('email') && (
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

              <button
                onClick={subscribe}
                disabled={loading || notificationMethods.length === 0 || (notificationMethods.includes('email') && !email)}
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
                <p className="text-gray-400 text-sm">We'll notify you when slots open</p>
              </div>
            </div>
            <button
              onClick={() => setSubscribed(false)}
              className="text-orange-400 text-sm hover:underline"
            >
              + Subscribe to another destination
            </button>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Active Subscriptions</h3>
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl mb-2">
                <div>
                  <p className="text-white font-semibold">{sub.destination.name}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Monitoring since {new Date(sub.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    Active
                  </span>
                  <button
                    onClick={() => unsubscribe(sub.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              <p className="text-white font-semibold">Select Your Destination</p>
              <p className="text-gray-400 text-sm">Choose the country and visa type you need</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 font-bold">2</span>
            </div>
            <div>
              <p className="text-white font-semibold">Set Up Notifications</p>
              <p className="text-gray-400 text-sm">Choose SMS, Email, or WhatsApp alerts</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 font-bold">3</span>
            </div>
            <div>
              <p className="text-white font-semibold">Get Instant Alerts</p>
              <p className="text-gray-400 text-sm">We'll notify you the moment a slot opens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
