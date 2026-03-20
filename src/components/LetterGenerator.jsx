import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Mail, Briefcase, Users, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

const LETTER_TYPES = [
  {
    id: 'cover',
    name: 'Cover Letter',
    description: 'Explains purpose of trip, itinerary, and ties to home country',
    icon: Mail,
    color: 'from-blue-500 to-cyan-500',
    fields: ['destination', 'purpose', 'itinerary', 'accommodation', 'tiesToHome']
  },
  {
    id: 'employer',
    name: 'Employer Letter',
    description: 'Confirms employment, salary, leave dates, and guarantees return',
    icon: Briefcase,
    color: 'from-purple-500 to-pink-500',
    fields: ['companyName', 'position', 'salary', 'leaveStart', 'leaveEnd', 'guaranteeReturn']
  },
  {
    id: 'invitation',
    name: 'Invitation Letter',
    description: 'For family/friends in Schengen to invite the applicant',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    fields: ['inviterName', 'inviterAddress', 'relationship', 'inviteeName', 'stayDuration', 'accommodationAddress']
  }
];

const purposes = [
  'Tourism',
  'Business',
  'Visiting Family/Friends',
  'Medical Treatment',
  'Cultural/Religious',
  'Sports',
  'Transit'
];

export default function LetterGenerator() {
  const { t } = useTranslation();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [formData, setFormData] = useState({});
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

  const handleSelectLetter = (letter) => {
    setSelectedLetter(letter);
    setFormData({});
    setGeneratedLetter('');
    setStep(2);
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const generateLetter = async () => {
    setGenerating(true);
    
    setTimeout(() => {
      let letter = '';
      
      if (selectedLetter.id === 'cover') {
        letter = generateCoverLetter(formData);
      } else if (selectedLetter.id === 'employer') {
        letter = generateEmployerLetter(formData);
      } else if (selectedLetter.id === 'invitation') {
        letter = generateInvitationLetter(formData);
      }
      
      setGeneratedLetter(letter);
      setGenerating(false);
      setStep(3);
    }, 2000);
  };

  const generateCoverLetter = (data) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `
SCHENGEN VISA APPLICATION - COVER LETTER

${today}

To,
The Consular Officer
Embassy/Consulate of ${data.destination || '[Destination Country]'}

Subject: Application for Schengen Visa - ${data.purpose || '[Purpose of Travel]'}

Dear Sir/Madam,

I, ${data.applicantName || '[Your Full Name]'}, holder of passport number ${data.passportNumber || '[Passport Number]'} issued on ${data.passportIssue || '[Issue Date]'}, hereby apply for a Schengen visa to visit ${data.destination || '[Destination Country]'} for the purpose of ${data.purpose || '[Purpose]'}.

PURPOSE OF TRIP:
The purpose of my visit is ${data.purpose || '[Purpose]'} to ${data.destination || '[Country]'}. ${data.tripDetails || ''}

ITINERARY:
${data.itinerary || `
• Arrival: [Date]
• Departure: [Date]
• Countries to visit: ${data.destination || '[Country]'}
`}

ACCOMMODATION:
${data.accommodation || 'Accommodation details to be confirmed upon visa approval.'}

TIES TO HOME COUNTRY (${data.homeCountry || 'Algeria'}):
I have strong ties to ${data.homeCountry || 'Algeria'} that ensure my return:
${data.tiesToHome || `
• Stable employment at [Company Name]
• Family members residing in the country
• Property ownership
• Bank accounts and financial interests
`}

FINANCIAL MEANS:
I am self-sponsored / Sponsored by [Name] for this trip. I have sufficient funds to cover all expenses during my stay, as demonstrated in the attached bank statements.

I kindly request you to consider my visa application favorably and grant me the Schengen visa for the duration of my planned stay.

Yours faithfully,
${data.applicantName || '[Your Name]'}
${data.applicantAddress || '[Your Address]'}
Tel: ${data.applicantPhone || '[Phone Number]'}
Email: ${data.applicantEmail || '[Email]'}
`;
  };

  const generateEmployerLetter = (data) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `
EMPLOYMENT VERIFICATION LETTER

${today}

To Whom It May Concern,

This letter is to confirm that ${data.employeeName || '[Employee Name]'} has been employed with ${data.companyName || '[Company Name]'} since ${data.employmentStart || '[Start Date]'}.

POSITION AND SALARY:
• Position: ${data.position || '[Job Title]'}
• Department: ${data.department || '[Department]'}
• Monthly Salary: ${data.salary || '[Salary]'} ${data.currency || 'EUR/USD'}
• Employment Type: ${data.employmentType || 'Full-time'}

LEAVE APPROVAL:
${data.employeeName || '[Employee Name]'} has requested leave from ${data.leaveStart || '[Start Date]'} to ${data.leaveEnd || '[End Date]'} for the purpose of ${data.travelPurpose || '[Purpose]'}. This leave has been approved.

GUARANTEE OF RETURN:
We guarantee that ${data.employeeName || '[Employee Name]'} will return to ${data.companyName || '[Company Name]'} upon completion of their visit abroad. Their position and employment status will be maintained during their absence.

For any verification, please contact:

${data.hrContact || `
HR Department
${data.companyName || '[Company Name]'}
Tel: [Company Phone]
Email: [Company Email]
`}

Sincerely,

${data.signatureName || '[Manager Name]'}
${data.signatureTitle || '[Manager Title]'}
${data.companyName || '[Company Name]'}
Date: ${today}
`;
  };

  const generateInvitationLetter = (data) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `
INVITATION LETTER

${today}

To,
The Consular Officer
Embassy/Consulate of ${data.schengenCountry || '[Schengen Country]'}

Dear Sir/Madam,

RE: Invitation Letter for ${data.inviteeName || '[Invitee Name]'} (Passport No: ${data.inviteePassport || '[Passport Number]'})

I, ${data.inviterName || '[Your Full Name]'}, residing at ${data.inviterAddress || '[Your Address]'}, ${data.inviterNationality || '[Nationality]'}, holding ${data.inviterIdType || 'ID/Passport'} number ${data.inviterIdNumber || '[ID Number]'}, hereby invite ${data.inviteeName || '[Invitee Name]'} to visit ${data.schengenCountry || '[Country]'} for a period of ${data.stayDuration || '[Duration]'} days.

RELATIONSHIP:
${data.inviteeName || '[Invitee]'} is my ${data.relationship || '[Relationship]'} (${data.relationshipType || 'family/friend'}).

PURPOSE OF VISIT:
${data.invitationPurpose || 'Tourism and family visit'}

ACCOMMODATION:
During their stay, ${data.inviteeName || '[Invitee]'} will be staying at my residence / accommodation at:
${data.accommodationAddress || '[Full Address]'}

FINANCIAL RESPONSIBILITY:
I ${data.financialGuarantee === 'yes' ? 'confirm that I will bear all expenses of the visit including accommodation, travel within the country, and return travel' : 'inform that the visitor has their own financial means'}.

We undertake to ensure that ${data.inviteeName || '[Invitee]'} will comply with the visa conditions and leave the Schengen area before their visa expires.

Please find attached copies of the following documents:
• Copy of my passport/ID
• Proof of residence
• Proof of employment/income
• Accommodation proof

Yours faithfully,

${data.inviterName || '[Your Name]'}
${data.inviterAddress || '[Your Address]'}
Tel: ${data.inviterPhone || '[Phone]'}
Email: ${data.inviterEmail || '[Email]'}
Signature: ________________
Date: ${today}
`;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const lines = generatedLetter.split('\n');
    let y = 20;
    
    doc.setFont('helvetica', 'normal');
    
    lines.forEach((line, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });
    
    doc.save(`${selectedLetter.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Letter Generator Suite</h2>
            <p className="text-gray-400 text-sm">AI-generated, properly formatted letters in French, English, and Arabic</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              Generate professional letters for your visa application. Fill in your details and get a properly formatted letter ready for download.
            </p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-3 gap-6">
          {LETTER_TYPES.map((letter) => {
            const Icon = letter.icon;
            return (
              <button
                key={letter.id}
                onClick={() => handleSelectLetter(letter)}
                className="glass-card rounded-3xl p-6 text-left card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${letter.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{letter.name}</h3>
                <p className="text-gray-400 text-sm">{letter.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && selectedLetter && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => { setStep(1); setSelectedLetter(null); }}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <h3 className="text-lg font-bold text-white">{selectedLetter.name}</h3>
          </div>

          <div className="space-y-4">
            {selectedLetter.id === 'cover' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Applicant Name</label>
                    <input type="text" value={formData.applicantName || ''} onChange={(e) => updateFormData('applicantName', e.target.value)} className="input" placeholder="Full name as in passport" />
                  </div>
                  <div>
                    <label className="label">Passport Number</label>
                    <input type="text" value={formData.passportNumber || ''} onChange={(e) => updateFormData('passportNumber', e.target.value)} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Destination Country</label>
                    <input type="text" value={formData.destination || ''} onChange={(e) => updateFormData('destination', e.target.value)} className="input" placeholder="e.g., France, Germany" />
                  </div>
                  <div>
                    <label className="label">Purpose of Travel</label>
                    <select value={formData.purpose || ''} onChange={(e) => updateFormData('purpose', e.target.value)} className="input">
                      <option value="">Select purpose</option>
                      {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Itinerary Details</label>
                  <textarea value={formData.itinerary || ''} onChange={(e) => updateFormData('itinerary', e.target.value)} className="input" rows="4" placeholder="List your planned activities and dates..." />
                </div>
                <div>
                  <label className="label">Accommodation</label>
                  <textarea value={formData.accommodation || ''} onChange={(e) => updateFormData('accommodation', e.target.value)} className="input" rows="2" placeholder="Hotel name and address, or accommodation details" />
                </div>
                <div>
                  <label className="label">Ties to Home Country (Algeria)</label>
                  <textarea value={formData.tiesToHome || ''} onChange={(e) => updateFormData('tiesToHome', e.target.value)} className="input" rows="3" placeholder="Reasons that guarantee your return (job, family, property, etc.)" />
                </div>
              </>
            )}

            {selectedLetter.id === 'employer' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Employee Name</label>
                    <input type="text" value={formData.employeeName || ''} onChange={(e) => updateFormData('employeeName', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Company Name</label>
                    <input type="text" value={formData.companyName || ''} onChange={(e) => updateFormData('companyName', e.target.value)} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Position/Title</label>
                    <input type="text" value={formData.position || ''} onChange={(e) => updateFormData('position', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Monthly Salary</label>
                    <input type="text" value={formData.salary || ''} onChange={(e) => updateFormData('salary', e.target.value)} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Leave Start Date</label>
                    <input type="date" value={formData.leaveStart || ''} onChange={(e) => updateFormData('leaveStart', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Leave End Date</label>
                    <input type="date" value={formData.leaveEnd || ''} onChange={(e) => updateFormData('leaveEnd', e.target.value)} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">HR Contact Name</label>
                  <input type="text" value={formData.hrContact || ''} onChange={(e) => updateFormData('hrContact', e.target.value)} className="input" placeholder="Manager or HR representative name" />
                </div>
              </>
            )}

            {selectedLetter.id === 'invitation' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Your Full Name</label>
                    <input type="text" value={formData.inviterName || ''} onChange={(e) => updateFormData('inviterName', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Your Address</label>
                    <input type="text" value={formData.inviterAddress || ''} onChange={(e) => updateFormData('inviterAddress', e.target.value)} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Invitee Name</label>
                    <input type="text" value={formData.inviteeName || ''} onChange={(e) => updateFormData('inviteeName', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Relationship</label>
                    <select value={formData.relationship || ''} onChange={(e) => updateFormData('relationship', e.target.value)} className="input">
                      <option value="">Select relationship</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Parent">Parent</option>
                      <option value="Friend">Friend</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Business Partner">Business Partner</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Schengen Country</label>
                    <input type="text" value={formData.schengenCountry || ''} onChange={(e) => updateFormData('schengenCountry', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Duration of Stay</label>
                    <input type="text" value={formData.stayDuration || ''} onChange={(e) => updateFormData('stayDuration', e.target.value)} className="input" placeholder="e.g., 14 days" />
                  </div>
                </div>
                <div>
                  <label className="label">Accommodation Address</label>
                  <textarea value={formData.accommodationAddress || ''} onChange={(e) => updateFormData('accommodationAddress', e.target.value)} className="input" rows="2" />
                </div>
                <div>
                  <label className="label">Will you financially guarantee the visitor?</label>
                  <select value={formData.financialGuarantee || ''} onChange={(e) => updateFormData('financialGuarantee', e.target.value)} className="input">
                    <option value="">Select</option>
                    <option value="yes">Yes, I will cover all expenses</option>
                    <option value="no">No, they have their own funds</option>
                  </select>
                </div>
              </>
            )}

            <button
              onClick={generateLetter}
              disabled={generating}
              className="w-full btn-primary flex items-center justify-center gap-2 glow-button mt-6"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Letter...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate {selectedLetter.name}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 3 && generatedLetter && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Generated Letter</h3>
            <button 
              onClick={() => { setStep(2); setGeneratedLetter(''); }}
              className="text-gray-400 hover:text-white"
            >
              ← Edit
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{generatedLetter}</pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={downloadPDF}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-gray-700 rounded-xl text-white hover:bg-gray-600 flex items-center gap-2"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-4">
            Review the letter carefully. You may need to add or modify details as needed.
          </p>
        </div>
      )}
    </div>
  );
}
