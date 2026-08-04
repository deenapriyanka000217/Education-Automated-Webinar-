import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  MessageSquare,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Eye,
  BarChart,
  Tv,
  ArrowRight,
  Zap,
  Lock,
  X,
  FileSpreadsheet,
  Download,
  FileDown,
  Gift,
} from 'lucide-react';
import { LeadRecord } from '../types';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '../utils/whatsapp';
import { pixelTracker } from '../utils/pixel';
import { submitLeadToGoogleSheets } from '../utils/googleSheetsSync';
import { downloadPersonalizedPDF } from '../utils/pdfGenerator';

interface Page2WebinarProps {
  currentLead: LeadRecord | null;
  onUpdateLeadMetrics?: (leadId: string, metrics: Partial<LeadRecord>) => void;
  onSwitchTab?: (tab: 'page1' | 'page2' | 'crm') => void;
}

export const Page2Webinar: React.FC<Page2WebinarProps> = ({
  currentLead,
  onUpdateLeadMetrics,
  onSwitchTab,
}) => {
  // Total video duration simulated in seconds (e.g. 20 minutes = 1200s or 15 mins = 900s)
  const TOTAL_VIDEO_SECONDS = 900;
  // Delay before showing WhatsApp CTA (e.g., 60 seconds = 1 min)
  const WHATSAPP_UNLOCK_SECONDS = 60;

  const [watchSeconds, setWatchSeconds] = useState<number>(
    currentLead?.watchTimeSeconds || 0
  );
  const [isPlaying] = useState<boolean>(true);
  const [showWhatsappCta] = useState<boolean>(true);
  const [visitCount, setVisitCount] = useState<number>(
    (currentLead?.visitCount || 0) + 1
  );

  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default lead fallback if user navigates directly
  const activeLead: LeadRecord = currentLead || {
    id: 'demo-lead',
    createdAt: new Date().toISOString(),
    contact: {
      fullName: 'Academy Director',
      instituteName: 'Excellence Training Academy',
      whatsappNumber: '919876543210',
      email: 'owner@academy.com',
      city: 'Mumbai',
      agreedToTerms: true,
    },
    answers: {
      businessRole: 'Founder / Owner',
      coursePrice: '₹25,000 – ₹50,000',
      monthlyStudents: '26–50',
      monthlyRevenue: '₹5–₹10 Lakhs',
      marketingSpend: '₹25,000–₹50,000',
      biggestChallenge: 'Inconsistent lead follow-up & conversion',
    },
    leadScore: 85,
    category: 'HOT OPPORTUNITY',
    stage: 'WEBINAR VIEWED',
    utmParams: {},
    watchTimeSeconds: 0,
    watchPercentage: 0,
    visitCount: 1,
  };

  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [isManualUnlocked, setIsManualUnlocked] = useState<boolean>(false);

  // Auto-sync initial visit to Google Sheets and set Thank You URL
  useEffect(() => {
    if (window.location.pathname !== '/thank-you') {
      window.history.replaceState(null, '', '/thank-you');
    }
    document.title = "Thank You - Training Institute Growth System";

    const newVisits = (currentLead?.visitCount || 0) + 1;
    setVisitCount(newVisits);

    // Dynamically inject Wistia player scripts
    if (!document.querySelector('script[src="https://fast.wistia.com/player.js"]')) {
      const s1 = document.createElement('script');
      s1.src = 'https://fast.wistia.com/player.js';
      s1.async = true;
      document.head.appendChild(s1);
    }

    if (!document.querySelector('script[src="https://fast.wistia.com/embed/3lk29gzqo6.js"]')) {
      const s2 = document.createElement('script');
      s2.src = 'https://fast.wistia.com/embed/3lk29gzqo6.js';
      s2.async = true;
      s2.type = 'module';
      document.head.appendChild(s2);
    }

    pixelTracker.track('WebinarPageViewed', {
      lead_id: activeLead.id,
      institute: activeLead.contact.instituteName,
      visitCount: newVisits,
      pageUrl: '/thank-you',
    });

    const updatedLeadRecord: LeadRecord = {
      ...activeLead,
      visitCount: newVisits,
      lastVisitedAt: new Date().toISOString(),
      hasViewedWebinar: true,
      stage: 'WEBINAR VIEWED',
    };

    if (onUpdateLeadMetrics && activeLead.id) {
      onUpdateLeadMetrics(activeLead.id, {
        visitCount: newVisits,
        lastVisitedAt: new Date().toISOString(),
        hasViewedWebinar: true,
        stage: 'WEBINAR VIEWED',
      });
    }
  }, []);

  // Refs to hold latest state for exit handler
  const watchSecondsRef = useRef(watchSeconds);
  useEffect(() => {
    watchSecondsRef.current = watchSeconds;
  }, [watchSeconds]);

  const activeLeadRef = useRef(activeLead);
  useEffect(() => {
    activeLeadRef.current = activeLead;
  }, [activeLead]);

  // Sync to Google Sheets ONLY ONCE when the user exits/leaves the page or component unmounts
  useEffect(() => {
    const handleExitSync = () => {
      const currentSeconds = watchSecondsRef.current;
      const currentLead = activeLeadRef.current;
      const finalWatchPct = Math.min(100, Math.round((currentSeconds / TOTAL_VIDEO_SECONDS) * 100));

      const updatedLead: LeadRecord = {
        ...currentLead,
        watchTimeSeconds: currentSeconds,
        watchPercentage: finalWatchPct,
        visitCount,
        lastVisitedAt: new Date().toISOString(),
      };

      if (onUpdateLeadMetrics && currentLead.id) {
        onUpdateLeadMetrics(currentLead.id, {
          watchTimeSeconds: currentSeconds,
          watchPercentage: finalWatchPct,
          lastVisitedAt: new Date().toISOString(),
        });
      }

      // Send to Google Sheets only if user watched some video
      if (currentSeconds > 0) {
        submitLeadToGoogleSheets(updatedLead);
      }
    };

    window.addEventListener('beforeunload', handleExitSync);

    return () => {
      window.removeEventListener('beforeunload', handleExitSync);
      handleExitSync();
    };
  }, [visitCount, TOTAL_VIDEO_SECONDS, onUpdateLeadMetrics]);

  // Timer loop for video playback counter
  useEffect(() => {
    if (!isPlaying) return;

    watchTimerRef.current = setInterval(() => {
      setWatchSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, [isPlaying]);

  // Handle milestone pixel tracking and local CRM state updates
  const activeLeadId = activeLead.id;
  useEffect(() => {
    if (watchSeconds === 0) return;

    const watchPct = Math.min(100, Math.round((watchSeconds / TOTAL_VIDEO_SECONDS) * 100));

    if (watchPct === 25) {
      pixelTracker.track('Webinar25PercentViewed', {
        lead_id: activeLeadId,
        watchSeconds,
      });
    } else if (watchPct === 50) {
      pixelTracker.track('Webinar50PercentViewed', {
        lead_id: activeLeadId,
        watchSeconds,
      });
    } else if (watchPct === 75) {
      pixelTracker.track('Webinar75PercentViewed', {
        lead_id: activeLeadId,
        watchSeconds,
      });
    } else if (watchPct >= 100) {
      pixelTracker.track('WebinarCompleted', {
        lead_id: activeLeadId,
        watchSeconds,
      });
    }

    // Periodically update local CRM state every 5 seconds
    if ((watchSeconds % 5 === 0 || watchPct >= 100) && onUpdateLeadMetrics && activeLeadId) {
      onUpdateLeadMetrics(activeLeadId, {
        watchTimeSeconds: watchSeconds,
        watchPercentage: watchPct,
        lastVisitedAt: new Date().toISOString(),
      });
    }
  }, [watchSeconds, activeLeadId, onUpdateLeadMetrics, TOTAL_VIDEO_SECONDS]);

  // Construct dynamic WhatsApp pre-filled message
  const whatsappMessage = generateWhatsAppMessage(activeLead);
  const whatsappUrl = generateWhatsAppUrl('919876543210', whatsappMessage);

  const watchPct = Math.min(100, Math.round((watchSeconds / TOTAL_VIDEO_SECONDS) * 100));
  const isUnlocked = true; // Always unlocked for immediate, friction-free browser downloads and conversions

  const [pdfDownloadCount, setPdfDownloadCount] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownloadPDFClick = () => {
    try {
      setIsDownloading(true);
      // Generate and download personalized PDF
      downloadPersonalizedPDF(activeLead);
      setPdfDownloadCount((prev) => prev + 1);

      const updatedLead: LeadRecord = {
        ...activeLead,
        watchTimeSeconds: watchSeconds,
        watchPercentage: watchPct,
        hasDownloadedPdf: true,
        stage: 'PDF DOWNLOADED',
        lastVisitedAt: new Date().toISOString(),
      };

      submitLeadToGoogleSheets(updatedLead);

      pixelTracker.track('PdfDownloaded', {
        lead_id: activeLead.id,
        institute: activeLead.contact.instituteName,
        lead_score: activeLead.leadScore,
        downloadCount: pdfDownloadCount + 1,
      });

      if (onUpdateLeadMetrics && activeLead.id) {
        onUpdateLeadMetrics(activeLead.id, {
          hasDownloadedPdf: true,
          stage: 'PDF DOWNLOADED',
        });
      }
      setTimeout(() => setIsDownloading(false), 1500);
    } catch (err) {
      console.error('PDF Download failed', err);
      setIsDownloading(false);
    }
  };

  const handleWhatsAppClick = () => {
    // Gating check: User must watch full presentation video to unlock PDF & strategy call
    if (!isUnlocked) {
      setShowLockModal(true);
      return;
    }

    const updatedLead: LeadRecord = {
      ...activeLead,
      watchTimeSeconds: watchSeconds,
      watchPercentage: watchPct,
      hasClickedWhatsapp: true,
      stage: 'WHATSAPP CLICKED',
      lastVisitedAt: new Date().toISOString(),
    };

    submitLeadToGoogleSheets(updatedLead);

    pixelTracker.track('WhatsAppClick', {
      lead_id: activeLead.id,
      institute: activeLead.contact.instituteName,
      lead_score: activeLead.leadScore,
      watchSeconds,
      watchPercentage: watchPct,
    });

    if (onUpdateLeadMetrics && activeLead.id) {
      onUpdateLeadMetrics(activeLead.id, {
        hasClickedWhatsapp: true,
        stage: 'WHATSAPP CLICKED',
      });
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Format time helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Main Autoplay Video Area — Single Focus */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-10 flex flex-col items-center justify-center space-y-6">
        {/* Webinar Headline */}
        <div className="text-center space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>8-Minute Exclusive Masterclass Presentation</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Stop Wasting Time on Social Media — Build Your 24/7 Automated Student Acquisition System
          </h1>
        </div>

        {/* Video Player Card */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative group">
          <style>{`
            wistia-player[media-id='3lk29gzqo6']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/3lk29gzqo6/swatch');
              display: block;
              filter: blur(5px);
              padding-top: 56.25%;
            }
            wistia-player .w-chrome,
            wistia-player .w-control-bar,
            wistia-player .w-controls,
            wistia-player .w-play-button,
            wistia-player [class*="control"],
            wistia-player [class*="playbar"],
            wistia-player [class*="chrome"],
            wistia-player [class*="logo"],
            .wistia_embed .wistia_logo,
            [class*="wistia_logo"],
            [class*="w-logo"] {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `}</style>

          {/* 16:9 Clean Video Embed */}
          <div className="relative aspect-video w-full bg-black overflow-hidden rounded-2xl">
            <iframe
              src="https://fast.wistia.net/embed/iframe/3lk29gzqo6?autoPlay=true&silentAutoPlay=false&controlsVisibleOnLoad=false&playbar=false&smallPlayButton=false&volumeControl=false&fullscreenButton=false&settingsControl=false&wistiaLogo=false&wistiaPopover=false&popover=false&videoFoam=true"
              title="Live Webinar Session"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </div>
        </div>

        {/* Dynamic High-Converting CTA Area — Fully Unlocked for Instant Access */}
        <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm animate-fadeIn">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-amber-400 animate-pulse" />
              <span>Your Custom System Materials Are Ready!</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Your personalized <strong>Automated Admission Growth Blueprint (PDF)</strong> has been compiled based on your institute profile. Choose an action below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action 1: Instant Direct PDF Download */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-extrabold uppercase tracking-wider inline-block">
                  Resource 1 of 2
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">Personalized Growth Guide</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contains your customized lead score diagnosis, funnel blueprints, integration setups, and launch plan.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleDownloadPDFClick}
                  disabled={isDownloading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm uppercase tracking-wide disabled:opacity-70"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>COMPILING GUIDE...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4.5 h-4.5" />
                      <span>📥 Download Custom PDF Blueprint</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-tight">
                  💡 In-app browser (Instagram/FB) blocking your download? Tap WhatsApp on the right to receive it directly!
                </p>
              </div>
            </div>

            {/* Action 2: WhatsApp Chat Connection */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-extrabold uppercase tracking-wider inline-block">
                  Resource 2 of 2
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">Live Strategy Consultation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Schedule your free 1-on-1 blueprint walkthrough call to activate your 24/7 student acquisition pipeline.
                </p>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm uppercase tracking-wide shadow-emerald-500/10 hover:shadow-emerald-500/25"
              >
                <MessageSquare className="w-4.5 h-4.5 fill-slate-950 text-slate-950" />
                <span>💬 WhatsApp Me - Book Call</span>
              </button>
            </div>
          </div>

          {/* Mini info banner */}
          <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5 leading-relaxed">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span>Both downloads and WhatsApp interactions are automatically synchronized with your spreadsheet.</span>
          </div>
        </div>

        {/* Video Lock Notice Modal */}
        {showLockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative">
              <button
                onClick={() => setShowLockModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">50% Video Viewing Required</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Please watch at least 50% of the presentation video to unlock <strong>"WhatsApp me - PDF"</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1 text-slate-400">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>Current Watch Progress:</span>
                  <span className="text-amber-400">{watchPct}% Completed</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${watchPct}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  ⚡ All watch progress & visit counts are automatically submitted & tracked in Google Sheets.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setShowLockModal(false)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-sm cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Continue Watching Presentation</span>
                </button>

                <button
                  onClick={() => {
                    setIsManualUnlocked(true);
                    setShowLockModal(false);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  (Admin/Demo Unlock: I Have Watched Presentation)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
