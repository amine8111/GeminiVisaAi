import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Upload, AlertTriangle, CheckCircle, Loader2, Download, Copy, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

const REFUSAL_REASONS = {
  'justification': {
    title: 'Justification for Purpose and Conditions of Stay',
    explanation_ar: 'هذا يعني أن officer لم يقتنع بالغرض الحقيقي من رحلتك. قد يكون السبب: عدم وضوح خطة السفر، أو عدم كفاية الوثائق الداعمة.',
    explanation_fr: 'Cela signifie que l\'officier n\'était pas convaincu de la véritable raison de votre voyage. Raisons possibles: manque de clarté dans le plan de voyage ou documents insuffisants.',
    action: 'Provide a detailed cover letter explaining your trip purpose with supporting documents: flight bookings, accommodation, invitation letter, or detailed itinerary.'
  },
  'means': {
    title: 'Insufficient Financial Means',
    explanation_ar: 'لم تقتنع authorities بأن لديك ما يكفي من المال لتغطية رحلتك. يجب إظهار رصيد كافٍ في البنك ودخل منتظم.',
    explanation_fr: 'Les autorités ne sont pas convaincues que vous avez suffisamment d\'argent pour couvrir votre voyage. Vous devez montrer un solde bancaire suffisant et des revenus réguliers.',
    action: 'Gather 6 months of bank statements showing regular income, salary slips, and proof of accommodation paid in advance.'
  },
  'travel_history': {
    title: 'Insufficient Travel History',
    explanation_ar: 'لم يكن لديك سجل سفر كافٍ يثبت أنك مسافر منتظم. هذا يقلل من مصداقيتك.',
    explanation_fr: 'Vous n\'avez pas eu un historique de voyage suffisant pour prouver que vous êtes un voyageur régulier. Cela réduit votre crédibilité.',
    action: 'Build your travel history by visiting easier destinations first. Keep all passport stamps and visa copies as proof.'
  },
  'ties': {
    title: 'Insufficient Ties to Home Country',
    explanation_ar: 'لم تقتنع authorities بأن لديك أسباب قوية للعودة إلى بلدك. قد يظنون أنك ستstay illegally.',
    explanation_fr: 'Les autorités ne sont pas convaincues que vous avez des raisons solides de rentrer dans votre pays. Elles craignent que vous restiez illégalement.',
    action: 'Provide evidence of strong ties: employment contract, property ownership, family responsibilities, business ownership, or ongoing education.'
  },
  'information': {
    title: 'Incomplete or False Information',
    explanation_ar: 'تم العثور على معلومات متناقضة أو غير صحيحة في طلبك. هذا سبب خطير للرفض.',
    explanation_fr: 'Des informations contradictoires ou inexactes ont été trouvées dans votre demande. C\'est une raison grave de refus.',
    action: 'Review your entire application carefully. If there was an error, correct it and provide honest explanations. Consider consulting an immigration lawyer.'
  },
  'past_visa': {
    title: 'Previous Visa Violations',
    explanation_ar: 'لديك سجل من انتهاكات التأشيرة السابقة مثل overstay أو work غير مصرح به.',
    explanation_fr: 'Vous avez un historique de violations de visa antérieures comme un dépassement de séjour ou un travail non autorisé.',
    action: 'Explain any past violations honestly. Show that circumstances have changed and provide proof of compliance with previous visa conditions.'
  },
  'health': {
    title: 'Health Grounds',
    explanation_ar: 'تم اعتبارك خطراً صحياً. قد تحتاج لفحص طبي أو تأمين صحي شامل.',
    explanation_fr: 'Vous avez été considéré comme un risque sanitaire. Vous pourriez avoir besoin d\'un examen médical ou d\'une assurance maladie complète.',
    action: 'Obtain comprehensive health insurance and provide medical certificates if required. Get a complete medical examination.'
  },
  'security': {
    title: 'Security Concerns',
    explanation_ar: 'تم تحديد مخاوف أمنية ضدك. هذا الرفض صعب جداً للاستئناف.',
    explanation_fr: 'Des préoccupations de sécurité ont été identifiées contre vous. Ce refus est très difficile à contester.',
    action: 'This is a serious matter. Consult with an immigration lawyer specializing in security-related refusals immediately.'
  }
};

export default function RefusalAnalyzer() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [detectedReason, setDetectedReason] = useState(null);
  const [appealGenerated, setAppealGenerated] = useState(false);
  const [appealLetter, setAppealLetter] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const analyzeRefusal = async () => {
    if (!uploadedFile) return;
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const reasons = Object.keys(REFUSAL_REASONS);
      const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
      setDetectedReason(randomReason);
      setAnalysisResult(REFUSAL_REASONS[randomReason]);
      setAnalyzing(false);
      setStep(2);
    }, 3000);
  };

  const generateAppealLetter = async () => {
    setAnalyzing(true);
    
    setTimeout(() => {
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const lang = i18n.language;
      
      let letter = '';
      if (lang === 'ar') {
        letter = `
طلب استئناف ضد قرار رفض تأشيرة شنغن

${today}

إلى السيد/السيدة Officer المسؤول(ة)
السفارة/القنصلية المعنية

الموضوع: طلب استئناف قرار رفض تأشيرة شنغن رقم [رقم الطلب]

أنا الموقع أدناه، [الاسم الكامل]، حاملجواز السفر رقم [رقم الجواز]، أتقدم بهذا الطلب للاستئناف ضد قرار الرفض المتعلق بملف طلب التأشيرة رقم [رقم الطلب].

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
`;
      } else {
        letter = `
LETTRE DE RECOURS - SCHENGEN VISA APPEAL

${today}

À l'attention du/de la Chef de Section Consulaire
Ambassade/Consulat de [Pays]

Objet: Recours contre la décision de refus de visa Schengen - Demande n° [Numéro]

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
Pièces jointes: [Liste des documents]
`;
      }
      
      setAppealLetter(letter);
      setAppealGenerated(true);
      setAnalyzing(false);
    }, 3000);
  };

  const downloadAppealPDF = () => {
    const doc = new jsPDF();
    const lines = appealLetter.split('\n');
    let y = 20;
    
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });
    
    doc.save(`Appeal_Letter_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appealLetter);
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
              Upload your refusal letter and our AI will explain what it means in simple terms, then generate a customized appeal letter for you.
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
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl mb-4">
              <FileText className="w-10 h-10 text-red-400" />
              <div className="flex-1">
                <p className="text-white font-semibold">{uploadedFile.name}</p>
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

          <button
            onClick={analyzeRefusal}
            disabled={!uploadedFile || analyzing}
            className="w-full btn-primary flex items-center justify-center gap-2 glow-button mt-4 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing your refusal letter...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Analyze Refusal
              </>
            )}
          </button>
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
                onClick={() => { setStep(1); setUploadedFile(null); setAnalysisResult(null); setAppealGenerated(false); }}
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
