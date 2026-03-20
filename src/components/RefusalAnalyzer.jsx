import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Upload, AlertTriangle, CheckCircle, Loader2, Download, Copy, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import Tesseract from 'tesseract.js';

const REFUSAL_REASONS = {
  'justification': {
    title: 'Justification for Purpose and Conditions of Stay',
    keywords: ['justification', 'purpose', 'conditions', 'stay', 'travel', 'objective', 'intentions', 'justify', 'motif', 'séjour', 'objectif', 'الغرض', 'الهدف'],
    explanation_ar: 'هذا يعني أن officer لم يقتنع بالغرض الحقيقي من رحلتك. قد يكون السبب: عدم وضوح خطة السفر، أو عدم كفاية الوثائق الداعمة.',
    explanation_fr: 'Cela signifie que lofficier nétait pas convaincu de la véritable raison de votre voyage. Raisons possibles: manque de clarté dans le plan de voyage ou documents insuffisants.',
    action: 'Provide a detailed cover letter explaining your trip purpose with supporting documents: flight bookings, accommodation, invitation letter, or detailed itinerary.'
  },
  'means': {
    title: 'Insufficient Financial Means',
    keywords: ['financial', 'means', 'money', 'funds', 'income', 'bank', 'balance', 'financier', 'argent', 'revenu', 'banque', 'المال', 'المالية', 'دخل', 'رصيد'],
    explanation_ar: 'لم تقتنع authorities بأن لديك ما يكفي من المال لتغطية رحلتك. يجب إظهار رصيد كافٍ في البنك ودخل منتظم.',
    explanation_fr: 'Les autorités ne sont pas convaincues que vous avez suffisamment dargent pour couvrir votre voyage. Vous devez montrer un solde bancaire suffisant et des revenus réguliers.',
    action: 'Gather 6 months of bank statements showing regular income, salary slips, and proof of accommodation paid in advance.'
  },
  'travel_history': {
    title: 'Insufficient Travel History',
    keywords: ['travel', 'history', 'previous', 'trips', 'voyage', 'historique', 'antecedents', 'السفر', 'تاريخ', 'رحلات'],
    explanation_ar: 'لم يكن لديك سجل سفر كافٍ يثبت أنك مسافر منتظم. هذا يقلل من مصداقيتك.',
    explanation_fr: 'Vous navez pas eu un historique de voyage suffisant pour prouver que vous êtes un voyageur régulier. Cela réduit votre crédibilité.',
    action: 'Build your travel history by visiting easier destinations first. Keep all passport stamps and visa copies as proof.'
  },
  'ties': {
    title: 'Insufficient Ties to Home Country',
    keywords: ['ties', 'home', 'return', 'returning', 'family', 'employment', 'job', 'property', 'liens', 'retour', 'famille', 'emploi', 'liens', 'العودة', 'العائلة', 'العمل', 'الملكية'],
    explanation_ar: 'لم تقتنع authorities بأن لديك أسباب قوية للعودة إلى بلدك. قد يظنون أنك ستstay illegally.',
    explanation_fr: 'Les autorités ne sont pas convaincues que vous avez des raisons solides de rentrer dans votre pays. Elles craignent que vous restiez illégalement.',
    action: 'Provide evidence of strong ties: employment contract, property ownership, family responsibilities, business ownership, or ongoing education.'
  },
  'information': {
    title: 'Incomplete or False Information',
    keywords: ['information', 'false', 'incorrect', 'incomplete', 'contradictory', 'information', 'faux', 'incorrect', 'incomplet', 'المعلومات', 'خطأ', 'غير صحيح'],
    explanation_ar: 'تم العثور على معلومات متناقضة أو غير صحيحة في طلبك. هذا سبب خطير للرفض.',
    explanation_fr: 'Des informations contradictoires ou inexactes ont été trouvées dans votre demande. Cest une raison grave de refus.',
    action: 'Review your entire application carefully. If there was an error, correct it and provide honest explanations. Consider consulting an immigration lawyer.'
  },
  'past_visa': {
    title: 'Previous Visa Violations',
    keywords: ['violation', 'previous', 'overstay', 'expired', 'unauthorized', 'violation', 'dépassement', 'dépasse', 'previous', 'انتهاك', 'تجاوز'],
    explanation_ar: 'لديك سجل من انتهاكات التأشيرة السابقة مثل overstay أو work غير مصرح به.',
    explanation_fr: 'Vous avez un historique de violations de visa antérieures comme un dépassement de séjour ou un travail non autorisé.',
    action: 'Explain any past violations honestly. Show that circumstances have changed and provide proof of compliance with previous visa conditions.'
  },
  'health': {
    title: 'Health Grounds',
    keywords: ['health', 'medical', 'disease', 'infection', 'santé', 'médical', 'maladie', 'الصحة', 'طبي', 'مرض'],
    explanation_ar: 'تم اعتبارك خطراً صحياً. قد تحتاج لفحص طبي أو تأمين صحي شامل.',
    explanation_fr: 'Vous avez été considéré comme un risque sanitaire. Vous pourriez avoir besoin dun examen médical ou dune assurance maladie complète.',
    action: 'Obtain comprehensive health insurance and provide medical certificates if required. Get a complete medical examination.'
  },
  'security': {
    title: 'Security Concerns',
    keywords: ['security', 'criminal', 'police', 'danger', 'sécurité', 'criminel', 'police', 'الأمن', 'أمني', 'جنائي'],
    explanation_ar: 'تم تحديد مخاوف أمنية ضدك. هذا الرفض صعب جداً للاستئناف.',
    explanation_fr: 'Des préoccupations de sécurité ont été identifiées contre vous. Ce refus est très difficile à contester.',
    action: 'This is a serious matter. Consult with an immigration lawyer specializing in security-related refusals immediately.'
  },
  'general': {
    title: 'General Grounds for Refusal',
    keywords: [],
    explanation_ar: 'تم رفض طلبك لأسباب عامة. راجع خطاب الرفض للحصول على تفاصيل محددة.',
    explanation_fr: 'Votre demande a été refusée pour des raisons générales. Consultez la lettre de refus pour plus de détails.',
    action: 'Carefully read the refusal letter for specific reasons. Gather additional supporting documents and consider reapplying with stronger evidence.'
  }
};

export default function RefusalAnalyzer() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [detectedReason, setDetectedReason] = useState(null);
  const [appealGenerated, setAppealGenerated] = useState(false);
  const [appealLetter, setAppealLetter] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedPreview(null);
      }
    }
  };

  const detectRefusalReason = (text) => {
    const lowerText = text.toLowerCase();
    let bestMatch = { reason: 'general', score: 0 };
    
    for (const [key, reason] of Object.entries(REFUSAL_REASONS)) {
      if (key === 'general') continue;
      
      let score = 0;
      for (const keyword of reason.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (lowerText.includes(keywordLower)) {
          score += 1;
          const regex = new RegExp(keywordLower, 'gi');
          const matches = lowerText.match(regex);
          if (matches) score += matches.length * 0.5;
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { reason: key, score };
      }
    }
    
    return bestMatch.score > 0 ? bestMatch.reason : 'general';
  };

  const analyzeRefusal = async () => {
    if (!uploadedFile) return;
    
    setAnalyzing(true);
    setOcrProgress(0);
    
    try {
      let textToAnalyze = '';
      
      if (uploadedFile.type.startsWith('image/') || uploadedFile.type === 'application/pdf') {
        const result = await Tesseract.recognize(
          uploadedPreview || uploadedFile,
          'eng+fra+ara',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                setOcrProgress(Math.round(m.progress * 100));
              }
            }
          }
        );
        
        textToAnalyze = result.data.text;
        setExtractedText(textToAnalyze);
      } else {
        textToAnalyze = 'General refusal - no specific text detected';
      }
      
      const detected = detectRefusalReason(textToAnalyze);
      setDetectedReason(detected);
      setAnalysisResult(REFUSAL_REASONS[detected]);
      setStep(2);
    } catch (error) {
      console.error('OCR Error:', error);
      const detected = 'general';
      setDetectedReason(detected);
      setAnalysisResult(REFUSAL_REASONS[detected]);
      setExtractedText('Text extraction had issues. Please review the detected reason below.');
      setStep(2);
    }
    
    setAnalyzing(false);
  };

  const generateAppealLetter = async () => {
    setAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const lang = i18n.language;
    
    let letter = '';
    if (lang === 'ar') {
      letter = `طلب استئناف ضد قرار رفض تأشيرة شنغن

${today}

إلى السيد/السيدة Officer المسؤول(ة)
السفارة/القنصلية المعنية

الموضوع: طلب استئناف قرار رفض تأشيرة شنغن

أنا الموقع أدناه، [الاسم الكامل]، حامل جواز السفر رقم [رقم الجواز]، أتقدم بهذا الطلب للاستئناف ضد قرار الرفض المتعلق بملف طلب التأشيرة.

أولاً، أود أن أعرب عن احترامي لعملية مراجعة طلبات التأشيرة، وأقدم هذا الاستئناف لمعالجة المخاوف التي أثارها القرار السابق.

وفقاً للوثائق المرفقة، أقدم ما يلي:
1. توضيحاً مفصلاً لظروف سفري
2. إثباتات مالية محدثة
3. خطابات داعمة من صاحب العمل/الجامعة
4. وثائق توضح روابط قوية ببلدي

أقر بأن أقوم بجميع المتطلبات وألتزم بشروط التأشيرة.
أطلب منكم إعادة النظر في طلبي ومنحي التأشيرة.

مع خالص الاحترام،
[الاسم الكامل]
[رقم الهاتف]
[البريد الإلكتروني]

المرفقات:
- صورة عن جواز السفر
- كشف حساب بنكي محدث
- خطاب من صاحب العمل
- خطاب الدعوة/الحجز الفندقي`;
    } else if (lang === 'fr') {
      letter = `LETTRE DE RECOURS - RECOURS CONTRE UN REFUS DE VISA SCHENGEN

${today}

À l'attention du/de la Chef de Section Consulaire
Ambassade/Consulat de [Pays]

Objet: Recours contre la décision de refus de visa Schengen

Je, soussigné(e) [Nom Complet], titulaire du passeport n° [Numéro] délivré le [Date], déclare contester la décision de refus de mon visa Schengen en date du [Date de refus].

RÉSUMÉ DE LA DÉCISION:
Motif invoqué: "${analysisResult?.title || 'À déterminer'}"

EXPOSÉ DES MOTIFS:
1. Explication détaillée des circonstances de mon voyage
2. Preuves de mes attaches solides avec mon pays de résidence
3. Documents financiers mis à jour
4. Lettre d'invitation/de l'employeur

ENGAGEMENTS:
Je m'engage formellement à:
- Respecter scrupuleusement les conditions du visa
- Quitter l'espace Schengen avant l'expiration de mon visa
- Ne pas exercer d'activité rémunérée
- Ne pas dépasser la durée autorisée

Je vous prie de bien vouloir reconsidérer ma demande et de m'accorder le visa demandé.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Nom Complet]
[Téléphone]
[Email]

Pièces jointes:
- Copie du passeport
- Relevés bancaires récents
- Attestation de l'employeur
- Lettre d'invitation/réservation d'hôtel`;
    } else {
      letter = `SCHENGEN VISA APPEAL LETTER

${today}

To: The Consular Officer
Embassy/Consulate of [Country]

Subject: Appeal Against Schengen Visa Refusal

I, [Full Name], holder of passport number [Number], issued on [Date], am writing to formally appeal the decision to refuse my Schengen visa application dated [Date].

SUMMARY OF REFUSAL:
Stated Reason: "${analysisResult?.title || 'To be determined'}"

GROUNDS FOR APPEAL:
1. Detailed explanation of my travel circumstances
2. Evidence of strong ties to my country of residence
3. Updated financial documentation
4. Supporting letters from employer/invitee

COMMITMENTS:
I hereby commit to:
- Strictly comply with all visa conditions
- Leave the Schengen area before visa expiration
- Not engage in any paid employment
- Not exceed the authorized duration

I kindly request that you reconsider my application and grant me the requested visa.

Yours faithfully,

[Full Name]
[Phone]
[Email]

Enclosures:
- Passport copy
- Recent bank statements
- Employment letter
- Invitation/hotel reservation`;
    }
    
    setAppealLetter(letter);
    setAppealGenerated(true);
    setAnalyzing(false);
  };

  const downloadAppealPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(139, 0, 0);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('VISA REFUSAL APPEAL', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} - VisaGpt`, pageWidth / 2, 30, { align: 'center' });
    
    let y = 50;
    const lines = appealLetter.split('\n');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    lines.forEach((line, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      if (line.trim() === '') {
        y += 4;
        return;
      }
      
      if (line.match(/^[A-Z\s]+$/) && line.length > 5) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      }
      
      const cleanedLine = line.replace(/\*/g, '');
      const linesInParagraph = doc.splitTextToSize(cleanedLine, pageWidth - 40);
      
      linesInParagraph.forEach(l => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(l, 20, y);
        y += 6;
      });
    });
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by VisaGpt - Know Your Visa Chances Before You Apply', pageWidth / 2, 290, { align: 'center' });
    
    doc.save(`Appeal_Letter_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appealLetter);
  };

  const resetForm = () => {
    setStep(1);
    setUploadedFile(null);
    setUploadedPreview(null);
    setAnalysisResult(null);
    setDetectedReason(null);
    setAppealGenerated(false);
    setAppealLetter('');
    setExtractedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Refusal Analysis & Appeal Generator</h2>
            <p className="text-gray-400 text-sm">Understand your refusal and generate appeal letters</p>
          </div>
        </div>
        
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              Upload your refusal letter and our AI will extract text and explain what it means in simple terms, then generate a customized appeal letter for you.
            </p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Upload Refusal Letter</h3>
          
          {!uploadedFile ? (
            <label className="block border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-red-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Upload your refusal letter (photo or PDF)</p>
              <p className="text-gray-400 text-sm">We accept photos and PDF documents</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              {uploadedPreview && (
                <div className="flex justify-center mb-4">
                  <img
                    src={uploadedPreview}
                    alt="Uploaded"
                    className="max-h-64 rounded-xl border border-gray-600"
                  />
                </div>
              )}
              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                <FileText className="w-10 h-10 text-red-400" />
                <div className="flex-1">
                  <p className="text-white font-semibold">{uploadedFile.name}</p>
                  <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadedPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-gray-400 hover:text-red-400 p-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <button
            onClick={analyzeRefusal}
            disabled={!uploadedFile || analyzing}
            className="w-full btn-primary flex items-center justify-center gap-2 glow-button mt-4 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {ocrProgress > 0 ? `Extracting text... ${ocrProgress}%` : 'Analyzing your refusal letter...'}
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Analyze Refusal
              </>
            )}
          </button>

          {analyzing && ocrProgress > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm text-center mt-2">Extracting text from document...</p>
            </div>
          )}
        </div>
      )}

      {step === 2 && analysisResult && (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6 border-2 border-red-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-semibold">Detected Refusal Reason</p>
                <p className="text-white font-bold">{analysisResult.title}</p>
              </div>
            </div>

            {extractedText && (
              <details className="mb-4">
                <summary className="text-gray-400 text-sm cursor-pointer hover:text-white">
                  View extracted text ({extractedText.length} characters)
                </summary>
                <div className="mt-2 p-3 bg-gray-800/50 rounded-xl max-h-40 overflow-y-auto">
                  <p className="text-gray-300 text-xs whitespace-pre-wrap">{extractedText}</p>
                </div>
              </details>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h4 className="text-blue-400 font-semibold mb-2">What this means (English):</h4>
                <p className="text-gray-300 text-sm">
                  {analysisResult.explanation_fr}
                </p>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <h4 className="text-yellow-400 font-semibold mb-2">What this means (العربية):</h4>
                <p className="text-gray-300 text-sm" dir="rtl">
                  {analysisResult.explanation_ar}
                </p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <h4 className="text-green-400 font-semibold mb-2">Recommended Action:</h4>
                <p className="text-gray-300 text-sm">{analysisResult.action}</p>
              </div>
            </div>
          </div>

          {!appealGenerated ? (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Generate Appeal Letter</h3>
              <p className="text-gray-400 text-sm mb-4">
                We'll generate a customized, formal appeal letter addressed to the specific consulate based on your refusal reason and profile.
              </p>
              <button
                onClick={generateAppealLetter}
                disabled={analyzing}
                className="w-full btn-primary flex items-center justify-center gap-2 glow-button disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Appeal Letter...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Appeal Letter
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Generated Appeal Letter</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-700 rounded-xl text-white hover:bg-gray-600 flex items-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={downloadAppealPDF}
                    className="px-4 py-2 bg-green-600 rounded-xl text-white hover:bg-green-500 flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="text-gray-300 text-xs whitespace-pre-wrap font-mono">{appealLetter}</pre>
              </div>

              <button
                onClick={resetForm}
                className="w-full mt-4 text-orange-400 text-sm hover:underline"
              >
                Analyze Another Refusal Letter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
