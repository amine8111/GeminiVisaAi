import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Shield, FileText, Upload, Download, Globe, Clock, CreditCard, CheckCircle, AlertCircle, Loader2, ChevronDown, FileUp, Calculator, Mail, Camera, Search, Plane, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import FinancialProofPlanner from '../components/FinancialProofPlanner';
import LetterGenerator from '../components/LetterGenerator';
import AppointmentTracker from '../components/AppointmentTracker';
import RefusalAnalyzer from '../components/RefusalAnalyzer';
import DummyBooking from '../components/DummyBooking';
import PhotoValidator from '../components/PhotoValidator';
import AntiScamDirectory from '../components/AntiScamDirectory';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function Services() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('insurance');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['insurance', 'translation', 'financial', 'letters', 'appointment', 'refusal', 'booking', 'photo', 'directory'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [translationType, setTranslationType] = useState('normal');
  const [insuranceQuote, setInsuranceQuote] = useState(null);
  const [translatedFile, setTranslatedFile] = useState(null);
  const [message, setMessage] = useState('');

  const insurancePlans = [
    {
      id: 'basic',
      name: 'Basic Coverage',
      price: 25,
      currency: 'EUR',
      coverage: ['Medical Emergencies up to €30,000', 'Trip Cancellation', 'Lost Luggage'],
      recommended: false
    },
    {
      id: 'standard',
      name: 'Standard Coverage',
      price: 45,
      currency: 'EUR',
      coverage: ['Medical Emergencies up to €50,000', 'Trip Cancellation', 'Flight Delays', 'Lost Luggage', '24/7 Assistance'],
      recommended: true
    },
    {
      id: 'premium',
      name: 'Premium Coverage',
      price: 75,
      currency: 'EUR',
      coverage: ['Medical Emergencies up to €100,000', 'Full Trip Protection', 'All Travel Delays', 'Valuables Coverage', 'Priority Support', 'Visa Rejection Cover'],
      recommended: false
    }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ru', name: 'Russian' }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        setMessage('');
      } else {
        setMessage('Please upload a PDF file');
      }
    }
  };

  const getInsuranceQuote = async (plan) => {
    setInsuranceLoading(true);
    setInsuranceQuote(plan);
    setTimeout(() => {
      setInsuranceLoading(false);
    }, 1500);
  };

  const purchaseInsurance = async () => {
    if (!insuranceQuote) return;
    setInsuranceLoading(true);
    setMessage('Processing payment...');
    
    setTimeout(() => {
      setInsuranceLoading(false);
      setMessage('Insurance purchased successfully! Your policy document has been added to your profile.');
      setInsuranceQuote(null);
    }, 2000);
  };

  const translateDocument = async () => {
    if (!uploadedFile) {
      setMessage('Please upload a document first');
      return;
    }

    setTranslationLoading(true);
    setMessage(translationType === 'official' 
      ? 'Submitting for official translation...' 
      : 'Extracting text and translating...');
    
    try {
      if (translationType === 'normal') {
        // Extract text from PDF
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        if (!fullText.trim()) {
          setMessage('Could not extract text from PDF. The document may be image-based or encrypted.');
          setTranslationLoading(false);
          return;
        }

        setMessage('Text extracted. Translating to ' + languages.find(l => l.code === selectedLanguage)?.name + '...');
        
        // Translate using MyMemory API (free, 5000 chars/day)
        const langPair = `en|${selectedLanguage}`;
        const chunks = [];
        const chunkSize = 4500;
        
        for (let i = 0; i < fullText.length; i += chunkSize) {
          chunks.push(fullText.substring(i, i + chunkSize));
        }
        
        let translatedText = '';
        for (const chunk of chunks) {
          const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langPair}`
          );
          const data = await response.json();
          if (data.responseData && data.responseData.translatedText) {
            translatedText += data.responseData.translatedText + '\n';
          }
          await new Promise(r => setTimeout(r, 100)); // Rate limiting
        }
        
        const langName = languages.find(l => l.code === selectedLanguage)?.name;
        setTranslatedFile({
          name: uploadedFile.name.replace('.pdf', `_${selectedLanguage}.pdf`),
          language: langName,
          originalName: uploadedFile.name,
          targetLang: selectedLanguage,
          originalText: fullText.substring(0, 500),
          translatedText: translatedText.substring(0, 500)
        });
        setMessage('Translation complete! Download your translated document below.');
      } else {
        setMessage('Official translation request submitted. It will be available in your profile within 24 hours.');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setMessage('Translation error. Please try again with a different PDF.');
    }
    
    setTranslationLoading(false);
  };

  const downloadTranslatedPDF = () => {
    if (!translatedFile) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(0, 26, 77);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSLATED DOCUMENT', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`VisaGpt Translation Service - ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    // Translation info box
    doc.setFillColor(240, 240, 250);
    doc.rect(15, 50, pageWidth - 30, 40, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Translation Details:', 20, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Original File: ${translatedFile.originalName}`, 20, 70);
    doc.text(`Translated to: ${translatedFile.language}`, 20, 78);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 70);
    doc.text(`Ref: VG-TR-${Date.now().toString(36).toUpperCase()}`, 120, 78);
    
    // Content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSLATED CONTENT', 20, 105);
    
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(20, 110, pageWidth - 20, 110);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    let y = 120;
    
    // Add actual translated text if available
    if (translatedFile.translatedText) {
      const lines = doc.splitTextToSize(translatedFile.translatedText, pageWidth - 40);
      lines.forEach(line => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 6;
      });
      y += 10;
    }
    
    // Note
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is an AI-assisted translation. For official purposes,', 20, y);
    doc.text('use our Official Translation service for certified translations.', 20, y + 6);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by VisaGpt - Know Your Visa Chances Before You Apply', pageWidth / 2, 285, { align: 'center' });
    
    const filename = `Translated_${translatedFile.originalName.replace('.pdf', '')}_${translatedFile.targetLang}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="min-h-screen ai-bg grid-pattern pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text mb-2">Visa Services</h1>
          <p className="text-gray-400">Additional services to complete your visa application</p>
        </div>

        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="inline-flex bg-gray-800/50 rounded-xl p-1 gap-1 flex-wrap">
            <button
              onClick={() => setActiveTab('insurance')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'insurance' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield size={18} />
              <span>Insurance</span>
            </button>
            <button
              onClick={() => setActiveTab('translation')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'translation' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe size={18} />
              <span>Translation</span>
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'financial' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calculator size={18} />
              <span>Financial</span>
            </button>
            <button
              onClick={() => setActiveTab('letters')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'letters' 
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail size={18} />
              <span>Letters</span>
            </button>
            <button
              onClick={() => setActiveTab('appointment')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'appointment' 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Search size={18} />
              <span>Appointments</span>
            </button>
            <button
              onClick={() => setActiveTab('refusal')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'refusal' 
                  ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertCircle size={18} />
              <span>Refusal Help</span>
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'booking' 
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plane size={18} />
              <span>Bookings</span>
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'photo' 
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera size={18} />
              <span>Photo</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'directory' 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Directory</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.includes('success') || message.includes('complete')
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
          }`}>
            {message.includes('success') || message.includes('complete') ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Travel Insurance</h2>
                  <p className="text-gray-400 text-sm">Required for Schengen visa applications. Get coverage instantly.</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Travel insurance is mandatory for Schengen visa applications. We partner with leading insurance providers to offer you comprehensive coverage at competitive prices.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {insurancePlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`glass-card rounded-3xl p-6 relative ${
                    plan.recommended ? 'border-2 border-purple-500 glow' : ''
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs text-white font-semibold">
                      Recommended
                    </div>
                  )}
                  
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.currency}</span>
                    <span className="text-gray-500 text-sm"> / trip</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.coverage.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => getInsuranceQuote(plan)}
                    disabled={insuranceLoading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    {insuranceLoading && insuranceQuote?.id === plan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Get Quote'
                    )}
                  </button>
                </div>
              ))}
            </div>

            {insuranceQuote && (
              <div className="glass-card rounded-3xl p-6 border-2 border-purple-500/50">
                <h3 className="text-xl font-bold text-white mb-4">Complete Your Purchase</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">Selected Plan</h4>
                    <p className="text-white font-semibold">{insuranceQuote.name}</p>
                    <p className="text-2xl font-bold gradient-text">{insuranceQuote.price} {insuranceQuote.currency}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">What's Included</h4>
                    <ul className="space-y-1">
                      {insuranceQuote.coverage.map((item, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-semibold">Payment</span>
                  </div>
                  <button
                    onClick={purchaseInsurance}
                    disabled={insuranceLoading}
                    className="w-full btn-primary flex items-center justify-center gap-2 glow-button"
                  >
                    {insuranceLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay {insuranceQuote.price} {insuranceQuote.currency}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'translation' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Document Translation</h2>
                  <p className="text-gray-400 text-sm">Translate your documents to any language</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Upload Document</h3>
                
                <div className="mb-6">
                  <label className="label mb-2">Translation Type</label>
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      translationType === 'normal' 
                        ? 'bg-purple-500/20 border-2 border-purple-500' 
                        : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                    }`}>
                      <input
                        type="radio"
                        name="translationType"
                        value="normal"
                        checked={translationType === 'normal'}
                        onChange={() => setTranslationType('normal')}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-white font-semibold">Normal Translation</p>
                        <p className="text-gray-400 text-sm">AI-powered translation, available instantly. Free service.</p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      translationType === 'official' 
                        ? 'bg-purple-500/20 border-2 border-purple-500' 
                        : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                    }`}>
                      <input
                        type="radio"
                        name="translationType"
                        value="official"
                        checked={translationType === 'official'}
                        onChange={() => setTranslationType('official')}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-white font-semibold">Official Translation</p>
                        <p className="text-gray-400 text-sm">Certified translation by professional translators. €15 per page. Ready in 24 hours.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {!uploadedFile && (
                  <label className="block border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                    <FileUp className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">Drop your PDF here</p>
                    <p className="text-gray-400 text-sm">or click to browse</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {uploadedFile && (
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                    <FileText className="w-10 h-10 text-purple-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{uploadedFile.name}</p>
                      <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="mt-6">
                  <label className="label mb-2">Translate To</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="input"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={translateDocument}
                  disabled={translationLoading || !uploadedFile}
                  className="w-full btn-primary mt-6 flex items-center justify-center gap-2 glow-button disabled:opacity-50"
                >
                  {translationLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {translationType === 'official' ? 'Submitting...' : 'Translating...'}
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5" />
                      {translationType === 'official' ? 'Request Official Translation' : 'Translate Document'}
                    </>
                  )}
                </button>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
                
                {translatedFile ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Translation Complete!</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Your document has been translated to {translatedFile.language}.
                    </p>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 text-left">
                      <p className="text-green-400 text-sm font-semibold mb-2">✓ Translation Ready</p>
                      <p className="text-gray-400 text-xs">
                        Download the translated document below. For official certified translations accepted by embassies, use the Official Translation option.
                      </p>
                    </div>
                    <button onClick={downloadTranslatedPDF} className="btn-primary flex items-center gap-2 mx-auto">
                      <Download className="w-5 h-5" />
                      Download Translated PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Upload a document to preview</p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="text-white font-semibold mb-2">Supported Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span key={lang.code} className="px-3 py-1 bg-gray-700 rounded-full text-gray-300 text-sm">
                        {lang.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-purple-400 font-semibold text-sm">Official Translation</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Professional certified translations delivered within 24 hours. Perfect for visa applications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && <FinancialProofPlanner />}

        {activeTab === 'letters' && <LetterGenerator />}

        {activeTab === 'appointment' && <AppointmentTracker />}

        {activeTab === 'refusal' && <RefusalAnalyzer />}

        {activeTab === 'booking' && <DummyBooking />}

        {activeTab === 'photo' && <PhotoValidator />}

        {activeTab === 'directory' && <AntiScamDirectory />}
      </div>
    </div>
  );
}
