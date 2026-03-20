import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Building, Calendar, CreditCard, Loader2, CheckCircle, Download, AlertCircle, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';

const AIRLINES = [
  { id: 'airfrance', name: 'Air France', code: 'AF' },
  { id: 'lufthansa', name: 'Lufthansa', code: 'LH' },
  { id: 'iberia', name: 'Iberia', code: 'IB' },
  { id: 'vueling', name: 'Vueling', code: 'VY' },
  { id: 'easyjet', name: 'EasyJet', code: 'U2' },
];

const HOTEL_CHAINS = [
  { id: 'accor', name: 'Accor Hotels (Ibis, Novotel)', code: 'ACC' },
  { id: 'marriott', name: 'Marriott Bonvoy', code: 'MAR' },
  { id: 'ihg', name: 'IHG (Holiday Inn)', code: 'IHG' },
];

export default function DummyBooking() {
  const { t } = useTranslation();
  const [bookingType, setBookingType] = useState('flight');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    from: '',
    to: '',
    date: '',
    returnDate: '',
    passengers: 1,
    hotel: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    duration: '48'
  });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const generateBooking = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const bookingRef = 'VG' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const booking = {
        ref: bookingRef,
        type: bookingType,
        ...bookingDetails,
        status: 'Confirmed',
        validUntil: new Date(Date.now() + parseInt(bookingDetails.duration) * 60 * 60 * 1000).toISOString(),
        issuedAt: new Date().toISOString(),
        price: bookingType === 'flight' ? 2000 : 1500,
        currency: 'DZD'
      };
      setConfirmedBooking(booking);
      setLoading(false);
      setStep(2);
    }, 3000);
  };

  const downloadBookingPDF = () => {
    if (!confirmedBooking) return;
    
    const doc = new jsPDF();
    
    doc.setFillColor(0, 26, 77);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RESERVATION CONFIRMATION', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booking Ref: ${confirmedBooking.ref}`, 20, 35);
    
    let y = 55;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(confirmedBooking.type === 'flight' ? 'FLIGHT RESERVATION' : 'HOTEL RESERVATION', 20, y);
    
    y += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (confirmedBooking.type === 'flight') {
      doc.text(`Route: ${confirmedBooking.from} → ${confirmedBooking.to}`, 20, y);
      y += 7;
      doc.text(`Date: ${confirmedBooking.date}`, 20, y);
      y += 7;
      doc.text(`Return: ${confirmedBooking.returnDate}`, 20, y);
      y += 7;
      doc.text(`Passengers: ${confirmedBooking.passengers}`, 20, y);
      y += 7;
      doc.text(`Airline: Reserved via VisaGpt Service`, 20, y);
    } else {
      doc.text(`Hotel: ${confirmedBooking.hotel}`, 20, y);
      y += 7;
      doc.text(`Check-in: ${confirmedBooking.checkIn}`, 20, y);
      y += 7;
      doc.text(`Check-out: ${confirmedBooking.checkOut}`, 20, y);
      y += 7;
      doc.text(`Guests: ${confirmedBooking.guests}`, 20, y);
    }
    
    y += 15;
    doc.setFillColor(255, 243, 205);
    doc.rect(20, y - 5, doc.internal.pageSize.getWidth() - 40, 25, 'F');
    
    doc.setTextColor(156, 83, 60);
    doc.setFontSize(10);
    doc.text('⚠️ IMPORTANT NOTICE', 25, y + 3);
    doc.setFontSize(8);
    doc.text('This is a TEMPORARY reservation for visa application purposes only.', 25, y + 10);
    doc.text('Valid for ' + confirmedBooking.duration + ' hours from issuance. Do not use for actual travel.', 25, y + 16);
    
    y += 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Status: ${confirmedBooking.status}`, 20, y);
    y += 7;
    doc.text(`Issued: ${new Date(confirmedBooking.issuedAt).toLocaleString()}`, 20, y);
    y += 7;
    doc.text(`Valid Until: ${new Date(confirmedBooking.validUntil).toLocaleString()}`, 20, y);
    
    y += 15;
    doc.setFillColor(0, 26, 77);
    doc.rect(0, y, doc.internal.pageSize.getWidth(), 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VisaGpt - Dummy Booking Service | For visa application purposes only | This is not a real travel booking', 20, y + 12);
    
    doc.save(`Booking_${confirmedBooking.ref}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Flight & Hotel Dummy Booking</h2>
            <p className="text-gray-400 text-sm">Get verifiable reservations for your visa application</p>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              Don't risk buying real, non-refundable tickets before getting your visa. Get temporary verifiable reservations that are accepted by embassies.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setBookingType('flight')}
          className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
            bookingType === 'flight'
              ? 'bg-blue-500/20 border-2 border-blue-500'
              : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
          }`}
        >
          <Plane className="w-5 h-5 text-blue-400" />
          <span className="text-white font-semibold">Flight Reservation</span>
        </button>
        <button
          onClick={() => setBookingType('hotel')}
          className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
            bookingType === 'hotel'
              ? 'bg-purple-500/20 border-2 border-purple-500'
              : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
          }`}
        >
          <Building className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">Hotel Reservation</span>
        </button>
      </div>

      {step === 1 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            {bookingType === 'flight' ? 'Flight Details' : 'Hotel Details'}
          </h3>

          {bookingType === 'flight' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">From (Airport)</label>
                  <input
                    type="text"
                    value={bookingDetails.from}
                    onChange={(e) => setBookingDetails({...bookingDetails, from: e.target.value})}
                    className="input"
                    placeholder="e.g., Algiers (ALG)"
                  />
                </div>
                <div>
                  <label className="label">To (Airport)</label>
                  <input
                    type="text"
                    value={bookingDetails.to}
                    onChange={(e) => setBookingDetails({...bookingDetails, to: e.target.value})}
                    className="input"
                    placeholder="e.g., Paris (CDG)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Departure Date</label>
                  <input
                    type="date"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Return Date</label>
                  <input
                    type="date"
                    value={bookingDetails.returnDate}
                    onChange={(e) => setBookingDetails({...bookingDetails, returnDate: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Passengers</label>
                  <select
                    value={bookingDetails.passengers}
                    onChange={(e) => setBookingDetails({...bookingDetails, passengers: parseInt(e.target.value)})}
                    className="input"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Reservation Valid For</label>
                  <select
                    value={bookingDetails.duration}
                    onChange={(e) => setBookingDetails({...bookingDetails, duration: e.target.value})}
                    className="input"
                  >
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                    <option value="96">96 hours (4 days)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label">Hotel Name/City</label>
                <input
                  type="text"
                  value={bookingDetails.hotel}
                  onChange={(e) => setBookingDetails({...bookingDetails, hotel: e.target.value})}
                  className="input"
                  placeholder="e.g., Ibis Paris CDG Airport"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Check-in Date</label>
                  <input
                    type="date"
                    value={bookingDetails.checkIn}
                    onChange={(e) => setBookingDetails({...bookingDetails, checkIn: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Check-out Date</label>
                  <input
                    type="date"
                    value={bookingDetails.checkOut}
                    onChange={(e) => setBookingDetails({...bookingDetails, checkOut: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Guests</label>
                  <select
                    value={bookingDetails.guests}
                    onChange={(e) => setBookingDetails({...bookingDetails, guests: parseInt(e.target.value)})}
                    className="input"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Reservation Valid For</label>
                  <select
                    value={bookingDetails.duration}
                    onChange={(e) => setBookingDetails({...bookingDetails, duration: e.target.value})}
                    className="input"
                  >
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                    <option value="96">96 hours (4 days)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Service Fee:</span>
              <span className="text-white font-bold">2,000 DZD</span>
            </div>
            <p className="text-gray-500 text-xs">Includes verifiable booking confirmation</p>
          </div>

          <button
            onClick={generateBooking}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 glow-button mt-4 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Reservation...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay 2,000 DZD & Generate
              </>
            )}
          </button>
        </div>
      )}

      {step === 2 && confirmedBooking && (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6 border-2 border-green-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 font-bold">Booking Confirmed!</p>
                <p className="text-gray-400 text-sm">Ref: {confirmedBooking.ref}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{confirmedBooking.type === 'flight' ? 'Flight Reservation' : 'Hotel Reservation'}</span>
              </div>
              {confirmedBooking.type === 'flight' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Route:</span>
                    <span className="text-white">{confirmedBooking.from} → {confirmedBooking.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{confirmedBooking.date}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hotel:</span>
                    <span className="text-white">{confirmedBooking.hotel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Check-in:</span>
                    <span className="text-white">{confirmedBooking.checkIn}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Valid Until:</span>
                <span className="text-orange-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(confirmedBooking.validUntil).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={downloadBookingPDF}
              className="w-full btn-primary flex items-center justify-center gap-2 glow-button mt-4"
            >
              <Download className="w-5 h-5" />
              Download Booking PDF
            </button>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-semibold text-sm">Important</p>
                <p className="text-gray-400 text-xs mt-1">
                  This is a temporary booking valid for {confirmedBooking.duration} hours. It's accepted by most Schengen embassies as proof of travel plans. To use it for actual travel, you'll need to purchase real tickets later.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setStep(1); setConfirmedBooking(null); }}
            className="w-full text-orange-400 text-sm hover:underline"
          >
            Make Another Reservation
          </button>
        </div>
      )}
    </div>
  );
}
