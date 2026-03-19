import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Loader2, CheckCircle, AlertCircle, User, Camera, MapPin, Calendar, ChevronDown, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';

export default function FormFilling() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getAuthHeaders, API_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      console.log('Fetching with headers:', headers);
      
      const profileRes = await fetch(`${API_URL}/api/user/profile`, {
        headers: headers
      });
      
      console.log('Profile response status:', profileRes.status);

      if (profileRes.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        console.log('Profile data:', profileData);
        if (profileData.passport_photo) {
          setPassportPhoto(profileData.passport_photo);
          console.log('Passport photo found');
        }
      } else {
        setError('Could not load profile. Please try again.');
      }

      const appsRes = await fetch(`${API_URL}/api/applications`, {
        headers: headers
      });

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
        console.log('Applications:', appsData);
        if (appsData.length > 0) {
          setSelectedApp(appsData[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to connect to server. The backend may be sleeping. Please wait 30 seconds and try again.');
    }
    setLoading(false);
  };

  const generatePDF = async () => {
    if (!profile) {
      alert('Please complete your profile first');
      return;
    }
    
    setGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const width = doc.internal.pageSize.getWidth();

      doc.setFillColor(0, 26, 77);
      doc.rect(0, 0, width, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SCHENGEN VISA APPLICATION FORM', 20, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Application for Schengen Visa - Type D/Type C', 20, 26);

      let y = 45;

      doc.setTextColor(0, 26, 77);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.rect(15, y - 4, width - 30, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('SECTION A: PERSONAL INFORMATION', 20, y + 1);

      y += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      doc.text('Surname (Family Name):', 20, y);
      doc.setFont('helvetica', 'bold');
      const lastName = profile.last_name || profile.Last_Name || '';
      doc.text(lastName.toUpperCase() || '_______________', 55, y);

      doc.setFont('helvetica', 'normal');
      doc.text('Surname at birth (if different):', 105, y);
      doc.text('_______________', 155, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Given Name(s) (First Name):', 20, y);
      doc.setFont('helvetica', 'bold');
      const firstName = profile.first_name || profile.First_Name || '';
      doc.text(firstName || '_______________', 60, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Date of Birth:', 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatDate(profile.date_of_birth || profile.dateOfBirth), 45, y);

      doc.setFont('helvetica', 'normal');
      doc.text('Place of Birth:', 85, y);
      doc.setFont('helvetica', 'bold');
      doc.text(profile.place_of_birth || profile.placeOfBirth || '_______________', 115, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Sex:', 20, y);
      doc.text('☐ Male    ☐ Female', 35, y);

      doc.setFont('helvetica', 'normal');
      doc.text('Marital Status:', 85, y);
      doc.setFont('helvetica', 'bold');
      const maritalStatus = profile.marital_status || profile.maritalStatus || '';
      doc.text(
        `${maritalStatus === 'Single' ? '☑' : '☐'} Single    ${maritalStatus === 'Married' ? '☑' : '☐'} Married    ${maritalStatus === 'Divorced' ? '☑' : '☐'} Divorced    ${maritalStatus === 'Widowed' ? '☑' : '☐'} Widowed`,
        120, y
      );

      y += 12;
      doc.setTextColor(0, 26, 77);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.rect(15, y - 4, width - 30, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('SECTION B: TRAVEL DOCUMENT INFORMATION', 20, y + 1);

      y += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      doc.text('Travel Document Type:', 20, y);
      doc.text('☑ Ordinary Passport    ☐ Diplomatic Passport    ☐ Service Passport', 55, y);

      y += 7;
      doc.text('Passport Number:', 20, y);
      doc.setFont('helvetica', 'bold');
      const passportNum = profile.passport_number || profile.passportNumber || '';
      doc.text(passportNum || '_______________', 50, y);

      doc.setFont('helvetica', 'normal');
      doc.text('Issue Date:', 100, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatDate(profile.passport_issue_date || profile.passportIssueDate), 125, y);

      doc.setFont('helvetica', 'normal');
      doc.text('Expiry Date:', 165, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatDate(profile.passport_expiry_date || profile.passportExpiryDate), 188, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Issued by:', 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(profile.passport_issue_country || profile.passportIssueCountry || '_______________', 40, y);

      if (selectedApp) {
        y += 12;
        doc.setTextColor(0, 26, 77);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.rect(15, y - 4, width - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('SECTION C: VISA INFORMATION', 20, y + 1);

        y += 12;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        doc.text('Purpose of Travel:', 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text((selectedApp.purpose_of_travel || selectedApp.purposeOfTravel || '_______________').toUpperCase(), 55, y);

        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Number of Entries:', 20, y);
        doc.text('☑ Single    ☐ Two    ☐ Multiple', 55, y);

        y += 7;
        doc.text('Intended Date of Arrival:', 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text(formatDate(selectedApp.intended_travel_start || selectedApp.intendedTravelStart), 70, y);

        doc.setFont('helvetica', 'normal');
        doc.text('Intended Date of Departure:', 115, y);
        doc.setFont('helvetica', 'bold');
        doc.text(formatDate(selectedApp.intended_travel_end || selectedApp.intendedTravelEnd), 172, y);

        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Main Destination (Country):', 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text((selectedApp.destination_country || selectedApp.destinationCountry || '_______________').toUpperCase(), 75, y);

        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Country of First Entry:', 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text((selectedApp.destination_country || selectedApp.destinationCountry || '_______________').toUpperCase(), 68, y);
      }

      y += 12;
      doc.setTextColor(0, 26, 77);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.rect(15, y - 4, width - 30, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('SECTION D: FINANCIAL MEANS', 20, y + 1);

      y += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      doc.text('Means of Subsistence:', 20, y);
      doc.text('☑ Cash    ☑ Credit Cards    ☐ Traveller\'s Cheques    ☐ Other', 60, y);

      y += 7;
      doc.text('Monthly Income:', 20, y);
      doc.setFont('helvetica', 'bold');
      const monthlyIncome = profile.monthly_income || profile.monthlyIncome || 0;
      doc.text(`€ ${(monthlyIncome * 0.92).toFixed(2)}`, 50, y);

      doc.setFont('helvetica', 'normal');
      doc.text('Bank Balance (6 mo avg):', 105, y);
      doc.setFont('helvetica', 'bold');
      const bankBalance = profile.bank_balance_avg_6m || profile.bankBalance || 0;
      doc.text(`€ ${(bankBalance * 0.92).toFixed(2)}`, 155, y);

      y += 12;
      doc.setTextColor(0, 26, 77);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.rect(15, y - 4, width - 30, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('SECTION E: EMPLOYMENT INFORMATION', 20, y + 1);

      y += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      doc.text('Employment Status:', 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(profile.employment_status || profile.employmentStatus || '_______________', 55, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Company/Employer:', 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(profile.company_name || profile.companyName || '_______________', 60, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Job Title:', 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(profile.job_title || profile.jobTitle || '_______________', 45, y);

      y += 15;

      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 5, width - 30, 40, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DECLARATION', 20, y);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('I declare that the information provided in this application is accurate and complete.', 20, y + 7);
      doc.text('I am aware that any false or incomplete information may lead to the rejection of my application.', 20, y + 13);
      doc.text('I consent to the processing of my personal data for the purposes of this visa application.', 20, y + 19);

      y += 35;
      doc.setFontSize(9);
      doc.text('Date:', 20, y);
      doc.text(new Date().toLocaleDateString('en-GB'), 35, y);

      doc.text('Signature:', 80, y);
      doc.line(105, y, 160, y);

      y += 15;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('VISA GPT - AI-ASSISTED PREPARATION', 20, y);

      doc.setFont('helvetica', 'normal');
      doc.text('This document was prepared using AI-assisted visa eligibility analysis', 20, y + 6);
      doc.text('Application ID: ' + (selectedApp?.id || 'N/A') + ' | Probability: ' + (selectedApp?.success_probability || selectedApp?.successProbability || 'N/A') + '%', 20, y + 12);

      if (passportPhoto) {
        try {
          doc.addPage();
          doc.setFillColor(0, 26, 77);
          doc.rect(0, 0, width, 20, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('PASSPORT PHOTO', 20, 13);

          const imgData = passportPhoto;
          const imgWidth = 40;
          const imgHeight = 50;
          const x = (width - imgWidth) / 2;
          const imgY = 40;
          
          doc.addImage(imgData, 'JPEG', x, imgY, imgWidth, imgHeight);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`${firstName} ${lastName}`.trim(), x + 5, imgY + imgWidth + 10);
        } catch (imgErr) {
          console.error('Error adding photo:', imgErr);
        }
      }

      const fileName = `Schengen_Application_${lastName || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log('PDF generated successfully:', fileName);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF. Please try again.');
    }
    
    setGenerating(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '____/____/________';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen ai-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen ai-bg flex items-center justify-center">
        <div className="glass-card rounded-3xl p-8 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const missingFields = [];
  if (!profile?.first_name && !profile?.First_Name) missingFields.push(t('profile.firstName'));
  if (!profile?.last_name && !profile?.Last_Name) missingFields.push(t('profile.lastName'));
  if (!profile?.date_of_birth && !profile?.dateOfBirth) missingFields.push(t('profile.dateOfBirth'));
  if (!profile?.passport_number && !profile?.passportNumber) missingFields.push(t('formFilling.passportNumber'));
  if (!passportPhoto) missingFields.push(t('formFilling.passportPhoto'));

  const profileComplete = missingFields.length === 0;

  return (
    <div className="min-h-screen ai-bg grid-pattern pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('formFilling.title')}</h1>
          <p className="text-gray-400">{t('formFilling.subtitle')}</p>
        </div>

        {missingFields.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-medium mb-1">{t('formFilling.missingInfo')}</p>
                <p className="text-gray-400 text-sm mb-2">{t('formFilling.missingFields')}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {missingFields.map((field) => (
                    <span key={field} className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-400 text-xs">
                      {field}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-yellow-500 text-sm hover:underline"
                >
                  {t('formFilling.updateProfile')}
                </button>
              </div>
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-500 font-medium mb-1">No Application Found</p>
                <p className="text-gray-400 text-sm mb-3">
                  You need to create an application first. Go to AI Eligibility Assessment to create one.
                </p>
                <button 
                  onClick={() => navigate('/eligibility-test')}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Go to Eligibility Assessment →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card rounded-3xl p-8 glow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('formFilling.schengenForm')}</h2>
              <p className="text-gray-400 text-sm">{t('formFilling.prefilled')}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
              <User className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">{t('formFilling.name')}</p>
                <p className="text-white">{(profile?.first_name || profile?.First_Name) || '—'} {(profile?.last_name || profile?.Last_Name) || '—'}</p>
              </div>
              {profile?.first_name || profile?.First_Name ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">{t('formFilling.dateOfBirth')}</p>
                <p className="text-white">{formatDate(profile?.date_of_birth || profile?.dateOfBirth)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
              <MapPin className="w-5 h-5 text-pink-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">{t('formFilling.passportNumber')}</p>
                <p className="text-white">{profile?.passport_number || profile?.passportNumber || '—'}</p>
              </div>
              {profile?.passport_number || profile?.passportNumber ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
              <Camera className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">{t('formFilling.passportPhoto')}</p>
                {passportPhoto ? (
                  <div className="flex items-center gap-3 mt-1">
                    <img src={passportPhoto} alt="Passport" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {t('formFilling.ready')}
                    </span>
                  </div>
                ) : (
                  <p className="text-yellow-400">{t('formFilling.notUploaded')}</p>
                )}
              </div>
            </div>
          </div>

          {applications.length > 0 && (
            <div className="mb-6">
              <label className="label mb-2">Select Application</label>
              <div className="relative">
                <select 
                  value={selectedApp?.id || ''}
                  onChange={(e) => {
                    const app = applications.find(a => a.id === parseInt(e.target.value));
                    setSelectedApp(app);
                  }}
                  className="input appearance-none pr-10"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.destination_country || app.destinationCountry} - {app.purpose_of_travel || app.purposeOfTravel}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}

          {selectedApp && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
              <p className="text-purple-400 text-sm font-medium mb-2">{t('formFilling.applicationDetails')}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">{t('formFilling.destination')}</p>
                  <p className="text-white">{selectedApp.destination_country || selectedApp.destinationCountry}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('formFilling.purpose')}</p>
                  <p className="text-white">{selectedApp.purpose_of_travel || selectedApp.purposeOfTravel}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('formFilling.travelDates')}</p>
                  <p className="text-white">
                    {formatDate(selectedApp.intended_travel_start || selectedApp.intendedTravelStart)} - {formatDate(selectedApp.intended_travel_end || selectedApp.intendedTravelEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">{t('formFilling.probabilityScore')}</p>
                  <p className="text-white">{selectedApp.success_probability || selectedApp.successProbability || '—'}%</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={generatePDF}
            disabled={generating || !profileComplete}
            className={`w-full btn-primary flex items-center justify-center gap-2 glow-button ${!profileComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('formFilling.generating')}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {t('formFilling.downloadPdf')}
              </>
            )}
          </button>

          <p className="text-gray-500 text-xs text-center mt-4">
            {t('formFilling.note')}
          </p>
        </div>
      </div>
    </div>
  );
}
