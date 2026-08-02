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
} from 'lucide-react';
import { LeadRecord } from '../types';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '../utils/whatsapp';
import { pixelTracker } from '../utils/pixel';
import { submitLeadToGoogleSheets } from '../utils/googleSheetsSync';

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

  // Auto-sync initial visit to Google Sheets
  useEffect(() => {
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
  const isUnlocked = watchPct >= 50 || isManualUnlocked;

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
      {/* Minimal Top Session Banner — Zero Distraction */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-extrabold uppercase tracking-wider text-slate-200">
              LIVE WEBINAR SESSION
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">
              Training Institutes & Academies
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {activeLead.contact.instituteName
                  ? `${activeLead.contact.fullName} (${activeLead.contact.instituteName})`
                  : 'Institute Visitor'}{' '}
                <strong className="text-blue-400 font-bold ml-1">
                  (Visit #{visitCount})
                </strong>
              </span>
            </div>
          </div>
        </div>
      </header>

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

        {/* WhatsApp Unlocked CTA Button Area */}
        <div className="w-full max-w-2xl text-center space-y-4 pt-2">
          <div className="space-y-3 animate-fadeIn">
            {/* Small text above the button */}
            <div className="text-slate-300 text-xs sm:text-sm font-semibold">
              Get PDF Now
            </div>

            {isUnlocked ? (
              <div className="p-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.4)]">
                <button
                  onClick={handleWhatsAppClick}
                  id="webinar-whatsapp-cta"
                  className="w-full font-black py-4 px-5 rounded-xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2.5 cursor-pointer text-sm sm:text-base font-bold tracking-wide uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.7)]"
                >
                  <MessageSquare className="w-5 h-5 shrink-0 fill-slate-950" />
                  <span className="whitespace-nowrap">Get PDF Now</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-amber-400 font-semibold text-xs sm:text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Get PDF Now (Unlocks after watching 50%)</span>
                </div>
              </div>
            )}
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
