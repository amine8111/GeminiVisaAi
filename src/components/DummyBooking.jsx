import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Building, Calendar, CreditCard, Loader2, CheckCircle, Download, AlertCircle, Clock, MapPin, Users } from 'lucide-react';
import { jsPDF } from 'jspdf';

const FLIGHT_ROUTES = {
  'Algiers-Paris': { airlines: ['Air France', 'Air Algerie', 'Transavia'], priceRange: [35000, 85000], duration: '1h 50m' },
  'Algiers-London': { airlines: ['Air Algerie', 'British Airways'], priceRange: [55000, 120000], duration: '3h 15m' },
  'Algiers-Frankfurt': { airlines: ['Air Algerie', 'Lufthansa', 'Transavia'], priceRange: [45000, 95000], duration: '2h 40m' },
  'Algiers-Rome': { airlines: ['Air Algerie', 'ITA Airways'], priceRange: [40000, 80000], duration: '1h 45m' },
  'Algiers-Madrid': { airlines: ['Air Algerie', 'Iberia', 'Vueling'], priceRange: [38000, 75000], duration: '1h 30m' },
  'Algiers-Amsterdam': { airlines: ['Air Algerie', 'KLM', 'Transavia'], priceRange: [48000, 100000], duration: '2h 55m' },
  'Algiers-Brussels': { airlines: ['Air Algerie', 'Brussels Airlines'], priceRange: [42000, 88000], duration: '2h 30m' },
  'Algiers-Istanbul': { airlines: ['Air Algerie', 'Turkish Airlines'], priceRange: [55000, 130000], duration: '3h 30m' },
  'Oran-Paris': { airlines: ['Air France', 'Air Algerie', 'Transavia'], priceRange: [38000, 90000], duration: '2h 10m' },
  'Constantine-Paris': { airlines: ['Air Algerie', 'Transavia'], priceRange: [42000, 95000], duration: '2h 30m' },
};

const HOTELS = {
  'France': [
    { name: 'Ibis Paris CDG Airport', stars: 3, pricePerNight: 75 },
    { name: 'Novotel Paris Centre', stars: 4, pricePerNight: 120 },
    { name: 'Mercure Paris Opéra', stars: 4, pricePerNight: 135 },
    { name: 'Pullman Paris Montparnasse', stars: 5, pricePerNight: 180 },
    { name: 'Ibis Budget Lyon', stars: 2, pricePerNight: 50 },
  ],
  'Germany': [
    { name: 'Ibis Berlin Hauptbahnhof', stars: 3, pricePerNight: 70 },
    { name: 'Novotel Frankfurt City', stars: 4, pricePerNight: 110 },
    { name: 'Mercure Hotel München', stars: 4, pricePerNight: 125 },
    { name: 'Steigenberger Hamburg', stars: 5, pricePerNight: 165 },
    { name: 'Ibis Budget Köln', stars: 2, pricePerNight: 55 },
  ],
  'Italy': [
    { name: 'Ibis Roma Fiumicino', stars: 3, pricePerNight: 65 },
    { name: 'Novotel Milano Centrale', stars: 4, pricePerNight: 100 },
    { name: 'Mercure Firenze', stars: 4, pricePerNight: 115 },
    { name: 'NH Collection Venezia', stars: 5, pricePerNight: 190 },
    { name: 'Ibis Budget Torino', stars: 2, pricePerNight: 45 },
  ],
  'Spain': [
    { name: 'Ibis Madrid Aeropuerto', stars: 3, pricePerNight: 60 },
    { name: 'Novotel Barcelona City', stars: 4, pricePerNight: 95 },
    { name: 'Mercure Sevilla', stars: 4, pricePerNight: 85 },
    { name: 'NH Collection Madrid', stars: 5, pricePerNight: 150 },
    { name: 'Ibis Budget Valencia', stars: 2, pricePerNight: 42 },
  ],
  'Netherlands': [
    { name: 'Ibis Amsterdam City', stars: 3, pricePerNight: 90 },
    { name: 'Novotel Rotterdam', stars: 4, pricePerNight: 115 },
    { name: 'Mercure Utrecht', stars: 4, pricePerNight: 105 },
    { name: 'NH Collection Amsterdam', stars: 5, pricePerNight: 180 },
    { name: 'Ibis Budget Eindhoven', stars: 2, pricePerNight: 55 },
  ],
  'Belgium': [
    { name: 'Ibis Brussels Centre', stars: 3, pricePerNight: 75 },
    { name: 'Novotel Bruges', stars: 4, pricePerNight: 110 },
    { name: 'Mercure Gent', stars: 4, pricePerNight: 95 },
    { name: 'NH Collection Brussels', stars: 5, pricePerNight: 160 },
    { name: 'Ibis Budget Charleroi', stars: 2, pricePerNight: 50 },
  ],
};

export default function DummyBooking() {
  const { t } = useTranslation();
  const [bookingType, setBookingType] = useState('flight');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [flightResults, setFlightResults] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  
  const [searchParams, setSearchParams] = useState({
    from: 'Algiers',
    destination: 'France',
    date: '',
    returnDate: '',
    passengers: 1,
    tripDuration: 7,
    budget: 'medium'
  });

  const generateFlights = () => {
    setLoading(true);
    setFlightResults([]);
    
    setTimeout(() => {
      const routeKey = `${searchParams.from}-${searchParams.destination.split('-')[0]}`;
      const routeData = FLIGHT_ROUTES[routeKey] || FLIGHT_ROUTES['Algiers-Paris'];
      
      const flights = routeData.airlines.map((airline, idx) => {
        const basePrice = routeData.priceRange[0] + (idx * 10000);
        const departureHour = 6 + Math.floor(Math.random() * 14);
        const departureMin = Math.random() > 0.5 ? '00' : '30';
        const arrivalHour = departureHour + parseInt(routeData.duration);
        const arrivalMin = Math.random() > 0.5 ? '00' : '30';
        
        return {
          id: `FL${Date.now()}${idx}`,
          airline,
          flightNumber: `${airline.substring(0, 2).toUpperCase()}${100 + Math.floor(Math.random() * 800)}`,
          from: searchParams.from,
          to: searchParams.destination.split('-')[0],
          departure: `${departureHour.toString().padStart(2, '0')}:${departureMin}`,
          arrival: `${(arrivalHour % 24).toString().padStart(2, '0')}:${arrivalMin}`,
          duration: routeData.duration,
          price: basePrice,
          currency: 'DZD',
          stops: idx === 0 ? 0 : (idx === 1 ? 0 : 1),
          class: 'Economy'
        };
      });
      
      setFlightResults(flights);
      setStep(2);
      setLoading(false);
    }, 2000);
  };

  const generateHotels = () => {
    setLoading(true);
    setHotelResults([]);
    
    setTimeout(() => {
      const countryHotels = HOTELS[searchParams.destination] || HOTELS['France'];
      const budgetMultiplier = searchParams.budget === 'low' ? 0.7 : (searchParams.budget === 'high' ? 1.5 : 1);
      
      const hotels = countryHotels.map((hotel, idx) => {
        const pricePerNight = Math.round(hotel.pricePerNight * budgetMultiplier);
        const totalPrice = pricePerNight * searchParams.tripDuration;
        
        return {
          id: `HT${Date.now()}${idx}`,
          name: hotel.name,
          stars: hotel.stars,
          location: `${searchParams.destination}, Europe`,
          pricePerNight,
          totalPrice,
          currency: 'EUR',
          amenities: ['WiFi', 'Breakfast', 'AC', ...(hotel.stars >= 4 ? ['Gym', 'Spa'] : [])],
          freeCancellation: idx < 3,
          rating: (3.5 + (idx * 0.3)).toFixed(1)
        };
      });
      
      setHotelResults(hotels);
      setStep(4);
      setLoading(false);
    }, 2000);
  };

  const confirmBooking = () => {
    setLoading(true);
    
    setTimeout(() => {
      const booking = {
        ref: `VG${Date.now().toString(36).toUpperCase()}`,
        type: bookingType,
        flight: selectedFlight,
        hotel: selectedHotel,
        passenger: { name: 'Visa Applicant', passport: 'Passport No.' },
        validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED'
      };
      
      setConfirmedBooking(booking);
      setStep(bookingType === 'flight' ? 3 : 5);
      setLoading(false);
    }, 1500);
  };

  const downloadBookingPDF = () => {
    if (!confirmedBooking) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING CONFIRMATION', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text('VisaGpt - Temporary Reservation', pageWidth / 2, 40, { align: 'center' });
    
    // Reference
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Booking Reference: ${confirmedBooking.ref}`, 20, 65);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${confirmedBooking.status}`, 20, 75);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 75);
    
    let y = 95;
    
    if (confirmedBooking.type === 'flight' && confirmedBooking.flight) {
      const flight = confirmedBooking.flight;
      
      // Flight section
      doc.setFillColor(240, 240, 245);
      doc.rect(15, y - 5, pageWidth - 30, 80, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FLIGHT RESERVATION', 20, y + 8);
      y += 25;
      
      doc.setFontSize(11);
      doc.text(`Airline: ${flight.airline}`, 20, y);
      doc.text(`Flight: ${flight.flightNumber}`, 120, y);
      y += 12;
      doc.text(`Route: ${flight.from} → ${flight.to}`, 20, y);
      y += 12;
      doc.text(`Departure: ${flight.departure}`, 20, y);
      doc.text(`Arrival: ${flight.arrival}`, 100, y);
      y += 12;
      doc.text(`Duration: ${flight.duration}`, 20, y);
      doc.text(`Class: ${flight.class}`, 100, y);
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.text(`Price: ${flight.price.toLocaleString()} DZD`, 20, y);
      y += 25;
    }
    
    if (confirmedBooking.type === 'hotel' && confirmedBooking.hotel) {
      const hotel = confirmedBooking.hotel;
      
      // Hotel section
      doc.setFillColor(240, 240, 245);
      doc.rect(15, y - 5, pageWidth - 30, 80, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('HOTEL RESERVATION', 20, y + 8);
      y += 25;
      
      doc.setFontSize(11);
      doc.text(`Hotel: ${hotel.name}`, 20, y);
      doc.text(`Stars: ${'★'.repeat(hotel.stars)}${'☆'.repeat(5 - hotel.stars)}`, 120, y);
      y += 12;
      doc.text(`Location: ${hotel.location}`, 20, y);
      y += 12;
      doc.text(`Check-in: ${searchParams.date}`, 20, y);
      doc.text(`Check-out: ${searchParams.returnDate || 'TBD'}`, 100, y);
      y += 12;
      doc.text(`Duration: ${searchParams.tripDuration} nights`, 20, y);
      doc.text(`Rating: ${hotel.rating}/5`, 100, y);
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.text(`Price: €${hotel.pricePerNight}/night - Total: €${hotel.totalPrice}`, 20, y);
      y += 25;
    }
    
    // Validity
    doc.setFillColor(255, 243, 224);
    doc.rect(15, y, pageWidth - 30, 35, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTANT: TEMPORARY RESERVATION', 20, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('This is a temporary booking valid for 72 hours. It is accepted by most Schengen', 20, y + 22);
    doc.text('embassies as proof of travel plans. To use for actual travel, purchase real tickets.', 20, y + 30);
    
    y += 50;
    
    // Declaration
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This document was generated by VisaGpt as proof of travel arrangements for visa application purposes.', pageWidth / 2, y, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()} | Reference: ${confirmedBooking.ref}`, pageWidth / 2, y + 8, { align: 'center' });
    
    doc.save(`Booking_${confirmedBooking.ref}.pdf`);
  };

  const reset = () => {
    setStep(1);
    setFlightResults([]);
    setHotelResults([]);
    setSelectedFlight(null);
    setSelectedHotel(null);
    setConfirmedBooking(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Flight & Hotel Booking</h2>
            <p className="text-gray-400 text-sm">Temporary verifiable reservations for visa applications</p>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              These are <strong className="text-yellow-400">temporary reservations</strong> valid for 72 hours, accepted by most Schengen embassies for visa applications. For actual travel, purchase real tickets.
            </p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setBookingType('flight')}
              className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                bookingType === 'flight' ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-gray-800/50 border-2 border-transparent'
              }`}
            >
              <Plane className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Flight</span>
            </button>
            <button
              onClick={() => setBookingType('hotel')}
              className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                bookingType === 'hotel' ? 'bg-purple-500/20 border-2 border-purple-500' : 'bg-gray-800/50 border-2 border-transparent'
              }`}
            >
              <Building className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Hotel</span>
            </button>
          </div>

          {bookingType === 'flight' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">From</label>
                  <select
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                    className="input"
                  >
                    <option value="Algiers">Algiers (ALG)</option>
                    <option value="Oran">Oran (ORN)</option>
                    <option value="Constantine">Constantine (CZL)</option>
                  </select>
                </div>
                <div>
                  <label className="label">To</label>
                  <select
                    value={searchParams.destination}
                    onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
                    className="input"
                  >
                    <option value="France">France (Paris)</option>
                    <option value="Germany">Germany (Frankfurt)</option>
                    <option value="Italy">Italy (Rome)</option>
                    <option value="Spain">Spain (Madrid)</option>
                    <option value="Netherlands">Netherlands (Amsterdam)</option>
                    <option value="Belgium">Belgium (Brussels)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Departure Date</label>
                  <input
                    type="date"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="label">Return Date (Optional)</label>
                  <input
                    type="date"
                    value={searchParams.returnDate}
                    onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                    className="input"
                    min={searchParams.date}
                  />
                </div>
              </div>
              <div>
                <label className="label">Passengers</label>
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value)})}
                  className="input"
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label">Destination</label>
                <select
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
                  className="input"
                >
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Check-in</label>
                  <input
                    type="date"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="label">Check-out</label>
                  <input
                    type="date"
                    value={searchParams.returnDate}
                    onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Guests</label>
                  <select
                    value={searchParams.passengers}
                    onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value)})}
                    className="input"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                  </select>
                </div>
                <div>
                  <label className="label">Budget</label>
                  <select
                    value={searchParams.budget}
                    onChange={(e) => setSearchParams({...searchParams, budget: e.target.value})}
                    className="input"
                  >
                    <option value="low">Budget (€40-60/night)</option>
                    <option value="medium">Mid-range (€80-130/night)</option>
                    <option value="high">Luxury (€150+/night)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={bookingType === 'flight' ? generateFlights : generateHotels}
            disabled={loading || !searchParams.date}
            className="w-full btn-primary mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</>
            ) : (
              <>{bookingType === 'flight' ? <Plane className="w-5 h-5" /> : <Building className="w-5 h-5" />} Search {bookingType === 'flight' ? 'Flights' : 'Hotels'}</>
            )}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Available Flights</h3>
            <button onClick={reset} className="text-gray-400 hover:text-white text-sm">← New Search</button>
          </div>
          
          {flightResults.map((flight) => (
            <div
              key={flight.id}
              onClick={() => setSelectedFlight(flight)}
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
                selectedFlight?.id === flight.id ? 'border-2 border-blue-500' : 'border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{flight.airline}</p>
                  <p className="text-gray-400 text-sm">{flight.flightNumber} • {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{flight.price.toLocaleString()} DZD</p>
                  <p className="text-gray-400 text-sm">{flight.class}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{flight.departure}</p>
                  <p className="text-gray-400 text-sm">{flight.from}</p>
                </div>
                <div className="flex-1 mx-4">
                  <div className="border-t-2 border-gray-600 relative">
                    <Plane className="w-4 h-4 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800" />
                  </div>
                  <p className="text-center text-gray-400 text-xs mt-1">{flight.duration}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{flight.arrival}</p>
                  <p className="text-gray-400 text-sm">{flight.to}</p>
                </div>
              </div>
            </div>
          ))}

          {selectedFlight && (
            <button
              onClick={confirmBooking}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</> : <><CheckCircle className="w-5 h-5" /> Confirm Booking (2,000 DZD)</>}
            </button>
          )}
        </div>
      )}

      {step === 3 && confirmedBooking && (
        <div className="glass-card rounded-3xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Flight Booked!</h3>
            <p className="text-gray-400">Your reservation is confirmed</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Reference:</span>
              <span className="text-white font-mono">{confirmedBooking.ref}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Flight:</span>
              <span className="text-white">{confirmedBooking.flight.airline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Valid Until:</span>
              <span className="text-orange-400">{new Date(confirmedBooking.validUntil).toLocaleString()}</span>
            </div>
          </div>

          <button onClick={downloadBookingPDF} className="w-full btn-primary flex items-center justify-center gap-2 mb-3">
            <Download className="w-5 h-5" /> Download Booking PDF
          </button>
          <button onClick={reset} className="w-full text-orange-400 text-sm hover:underline">Make Another Booking</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Available Hotels</h3>
            <button onClick={reset} className="text-gray-400 hover:text-white text-sm">← New Search</button>
          </div>
          
          {hotelResults.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => setSelectedHotel(hotel)}
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
                selectedHotel?.id === hotel.id ? 'border-2 border-purple-500' : 'border-2 border-transparent'
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-white font-bold">{hotel.name}</p>
                  <p className="text-yellow-400 text-sm">{'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}</p>
                  <p className="text-gray-400 text-sm">{hotel.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">€{hotel.pricePerNight}</p>
                  <p className="text-gray-400 text-sm">per night</p>
                  <p className="text-green-400 text-sm">Total: €{hotel.totalPrice}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {hotel.amenities.map((amenity, idx) => (
                  <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{amenity}</span>
                ))}
                {hotel.freeCancellation && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Free Cancellation</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">{hotel.rating}</span>
                <span className="text-gray-400 text-xs">Excellent</span>
              </div>
            </div>
          ))}

          {selectedHotel && (
            <button
              onClick={confirmBooking}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</> : <><CheckCircle className="w-5 h-5" /> Confirm Booking (2,000 DZD)</>}
            </button>
          )}
        </div>
      )}

      {step === 5 && confirmedBooking && (
        <div className="glass-card rounded-3xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Hotel Booked!</h3>
            <p className="text-gray-400">Your reservation is confirmed</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Reference:</span>
              <span className="text-white font-mono">{confirmedBooking.ref}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Hotel:</span>
              <span className="text-white">{confirmedBooking.hotel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Valid Until:</span>
              <span className="text-orange-400">{new Date(confirmedBooking.validUntil).toLocaleString()}</span>
            </div>
          </div>

          <button onClick={downloadBookingPDF} className="w-full btn-primary flex items-center justify-center gap-2 mb-3">
            <Download className="w-5 h-5" /> Download Booking PDF
          </button>
          <button onClick={reset} className="w-full text-orange-400 text-sm hover:underline">Make Another Booking</button>
        </div>
      )}
    </div>
  );
}
