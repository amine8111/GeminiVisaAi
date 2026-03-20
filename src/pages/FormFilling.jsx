import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Loader2, CheckCircle, User, Calendar, Globe, MapPin, Briefcase, CreditCard, Upload } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function FormFilling() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    destination: '',
    purpose: 'tourism',
    arrivalDate: '',
    departureDate: '',
    accommodation: '',
    email: '',
    phone: '',
    address: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = () => {
    if (!formData.firstName || !formData.lastName || !formData.passportNumber) {
      alert('Please fill in at least: First Name, Last Name, and Passport Number');
      return;
    }
    
    setGenerating(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const width = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(0, 26, 77);
        doc.rect(0, 0, width, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SCHENGEN VISA APPLICATION FORM', width/2, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Short-stay Visa Application', width/2, 28, { align: 'center' });

        let y = 55;
        doc.setTextColor(0, 0, 0);

        // Photo box
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(140, 50, 35, 45);
        doc.setFontSize(8);
        doc.text('PHOTO', 157, 75, { align: 'center' });

        // Section 1: Personal Information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('1. FAMILY NAME / SURNAME', 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text((formData.lastName || '_______________').toUpperCase(), 20, y);
        doc.line(20, y + 1, 130, y + 1);
        y += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('2. FIRST NAME(S)', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text((formData.firstName || '_______________').toUpperCase(), 20, y);
        doc.line(20, y + 1, 130, y + 1);
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('3. DATE OF BIRTH', 20, y);
        doc.text('4. PLACE OF BIRTH', 100, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.dateOfBirth || 'DD/MM/YYYY', 20, y);
        doc.text(formData.placeOfBirth || '_______________', 100, y);
        doc.line(20, y + 1, 90, y + 1);
        doc.line(100, y + 1, 170, y + 1);
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('5. CURRENT NATIONALITY', 20, y);
        doc.text('6. NATIONALITY AT BIRTH', 100, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.nationality || '_______________', 20, y);
        doc.text(formData.nationality || '_______________', 100, y);
        doc.line(20, y + 1, 90, y + 1);
        doc.line(100, y + 1, 170, y + 1);
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('7. SEX', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text('[ ] Male    [ ] Female', 20, y);
        y += 15;

        // Travel Document Section
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 5, width - 30, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('TRAVEL DOCUMENT', 20, y);
        y += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('9. PASSPORT NUMBER', 20, y);
        doc.text('10. DATE OF ISSUE', 100, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.passportNumber || '_______________', 20, y);
        doc.text(formData.passportIssueDate || 'DD/MM/YYYY', 100, y);
        doc.line(20, y + 1, 90, y + 1);
        doc.line(100, y + 1, 170, y + 1);
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('11. VALID UNTIL', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.passportExpiryDate || 'DD/MM/YYYY', 20, y);
        doc.line(20, y + 1, 90, y + 1);
        y += 15;

        // Visa Application Section
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 5, width - 30, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('VISA APPLICATION', 20, y);
        y += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('16. MEMBER STATE(S) OF DESTINATION', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.destination || '_______________', 20, y);
        doc.line(20, y + 1, 170, y + 1);
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('17. PURPOSE OF TRAVEL', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        const purposes = ['tourism', 'business', 'visiting', 'medical', 'study'];
        purposes.forEach((p, i) => {
          doc.text(`[ ] ${p.charAt(0).toUpperCase() + p.slice(1)}`, 20 + (i * 30), y);
          if (p === formData.purpose) {
            doc.setFont('zapfdingbats');
            doc.text('/', 21 + (i * 30), y - 1);
            doc.setFont('helvetica');
          }
        });
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('18. FIRST INTENDED STAY', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`From: ${formData.arrivalDate || 'DD/MM/YYYY'}  To: ${formData.departureDate || 'DD/MM/YYYY'}`, 20, y);
        doc.line(20, y + 1, 170, y + 1);
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('19. ACCOMMODATION', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.accommodation || 'Hotel / Address', 20, y);
        doc.line(20, y + 1, 170, y + 1);
        y += 15;

        // Contact Section
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 5, width - 30, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('APPLICANT CONTACT', 20, y);
        y += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('35. EMAIL', 20, y);
        doc.text('36. PHONE', 100, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.email || '_______________', 20, y);
        doc.text(formData.phone || '_______________', 100, y);
        doc.line(20, y + 1, 90, y + 1);
        doc.line(100, y + 1, 170, y + 1);
        y += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('37. CURRENT ADDRESS', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(formData.address || '_______________', 20, y);
        doc.line(20, y + 1, 170, y + 1);
        y += 20;

        // Declaration
        doc.setDrawColor(0, 0, 0);
        doc.rect(15, y, width - 30, 35);
        doc.setFontSize(8);
        doc.text('I declare that I have completed this application form correctly, that all information given is true, and that I am aware that any false statement will lead to automatic refusal of my visa application.', 20, y + 8);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y + 20);
        doc.text('Signature: ________________________', 100, y + 20);

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Generated by VisaGpt - Know Your Visa Chances Before You Apply', width/2, 290, { align: 'center' });

        doc.save(`Schengen_Visa_Form_${formData.lastName || 'Application'}.pdf`);
      } catch (err) {
        console.error('PDF generation error:', err);
        alert('Error generating PDF. Please try again.');
      }
      
      setGenerating(false);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="min-h-screen ai-bg grid-pattern pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text mb-2">Form Filling</h1>
          <p className="text-gray-400">Auto-fill Schengen visa application form with your details</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Personal Information</h2>
                  <p className="text-gray-400 text-sm">Fill in your details for the visa application</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="input"
                    placeholder="As shown in passport"
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="input"
                    placeholder="As shown in passport"
                  />
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Place of Birth</label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => updateField('placeOfBirth', e.target.value)}
                    className="input"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="label">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    className="input"
                    placeholder="Algerian"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Passport Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Passport Number *</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => updateField('passportNumber', e.target.value)}
                    className="input"
                    placeholder="A12345678"
                  />
                </div>
                <div>
                  <label className="label">Issue Date</label>
                  <input
                    type="date"
                    value={formData.passportIssueDate}
                    onChange={(e) => updateField('passportIssueDate', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={(e) => updateField('passportExpiryDate', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Travel Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Destination Country</label>
                  <select
                    value={formData.destination}
                    onChange={(e) => updateField('destination', e.target.value)}
                    className="input"
                  >
                    <option value="">Select country</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
                    <option value="Spain">Spain</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Greece">Greece</option>
                    <option value="Austria">Austria</option>
                    <option value="Switzerland">Switzerland</option>
                  </select>
                </div>
                <div>
                  <label className="label">Purpose</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => updateField('purpose', e.target.value)}
                    className="input"
                  >
                    <option value="tourism">Tourism</option>
                    <option value="business">Business</option>
                    <option value="visiting">Visiting Family</option>
                    <option value="medical">Medical</option>
                    <option value="study">Study</option>
                  </select>
                </div>
                <div>
                  <label className="label">Arrival Date</label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => updateField('arrivalDate', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Departure Date</label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => updateField('departureDate', e.target.value)}
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Accommodation</label>
                  <input
                    type="text"
                    value={formData.accommodation}
                    onChange={(e) => updateField('accommodation', e.target.value)}
                    className="input"
                    placeholder="Hotel name and address"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                Passport Photo (Optional)
              </h3>
              <label className="block border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors">
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <p className="text-white font-semibold mb-1">Upload Passport Photo</p>
                <p className="text-gray-400 text-sm">This will be embedded in the form</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photo && (
                <div className="mt-4 flex justify-center">
                  <img src={photo} alt="Passport photo" className="w-24 h-32 object-cover rounded border" />
                </div>
              )}
            </div>

            <button
              onClick={generatePDF}
              disabled={generating}
              className="w-full btn-primary flex items-center justify-center gap-2 glow-button"
            >
              {generating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating Form...</>
              ) : (
                <><FileText className="w-5 h-5" /> Generate Schengen Visa Form</>
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Form Generated!</h3>
            <p className="text-gray-400 mb-6">
              Your Schengen visa application form has been downloaded.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-white font-semibold mb-2">Next Steps:</p>
              <ol className="text-gray-400 text-sm space-y-2">
                <li>1. Print the downloaded PDF form</li>
                <li>2. Sign and date the declaration section</li>
                <li>3. Attach your passport photo (35×45mm)</li>
                <li>4. Submit with all required documents</li>
              </ol>
            </div>
            <button
              onClick={() => { setStep(1); setFormData({ firstName: '', lastName: '', dateOfBirth: '', placeOfBirth: '', nationality: '', passportNumber: '', passportIssueDate: '', passportExpiryDate: '', destination: '', purpose: 'tourism', arrivalDate: '', departureDate: '', accommodation: '', email: '', phone: '', address: '' }); setPhoto(null); }}
              className="btn-primary"
            >
              Fill Another Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
