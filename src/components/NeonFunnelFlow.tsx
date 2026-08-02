import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  BookOpen,
  Handshake,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  Zap,
  Target,
  ArrowDown,
  Filter,
} from 'lucide-react';

export const NeonFunnelFlow: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  // Auto cycle stages to simulate live lead flow (GIF-like continuous animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#090514] border border-pink-500/30 rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(255,0,128,0.15)] my-6 select-none">
      {/* Background Cyberpunk Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Cyberpunk Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-pink-500/20 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-pink-500/20 border border-pink-400/50 text-pink-300 shadow-[0_0_20px_rgba(255,0,128,0.5)]">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-wider uppercase text-white flex items-center space-x-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-emerald-400">
                AUTOMATED STUDENT LEADS FUNNEL
              </span>
            </h3>
            <p className="text-xs text-pink-200/70 font-medium">
              3D Cyberpunk Neon Lead Flow — How cold traffic converts into paying admissions
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-pink-500/50 shadow-[0_0_15px_rgba(255,0,128,0.3)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest text-pink-300">
            LIVE AUTOMATED FLOW
          </span>
        </div>
      </div>

      {/* Main Funnel Canvas Layout (Grid on Desktop, Stacked on Mobile) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px] py-2">
        {/* Japanese Side Katakana Marking - Left */}
        <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col items-center text-[11px] font-black tracking-[0.3em] text-pink-500/40 uppercase pointer-events-none select-none write-vertical">
          <span>マ</span>
          <span>ー</span>
          <span>ケ</span>
          <span>テ</span>
          <span>ィ</span>
          <span>ン</span>
          <span>グ</span>
        </div>

        {/* Japanese Side Katakana Marking - Right */}
        <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col items-center text-[11px] font-black tracking-[0.3em] text-pink-500/40 uppercase pointer-events-none select-none write-vertical">
          <span>成</span>
          <span>長</span>
        </div>

        {/* LEFT / CENTER: 3D CYBERPUNK STACKED NEON FUNNEL (5 TIERS) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-4">
          {/* Animated Falling Lead Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-20">
            <div className="w-1 h-3 bg-pink-400 rounded-full shadow-[0_0_12px_#ff007f] animate-bounce opacity-80" style={{ animationDuration: '1.8s' }}></div>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981] animate-ping absolute top-1/3 opacity-90" style={{ animationDuration: '2.4s' }}></div>
          </div>

          {/* Funnel Tier 1 (TOP) - Pink/Magenta Neon */}
          <div
            onClick={() => setActiveStage(0)}
            className={`w-[88%] sm:w-[92%] h-16 sm:h-20 rounded-2xl border-2 border-pink-500 bg-gradient-to-b from-pink-950/80 to-pink-900/40 transition-all duration-300 cursor-pointer flex items-center justify-between px-4 sm:px-6 relative group shadow-[0_0_30px_rgba(255,0,128,0.5)] hover:shadow-[0_0_45px_rgba(255,0,128,0.8)] ${
              activeStage === 0 ? 'ring-2 ring-pink-300 scale-105 z-10' : 'opacity-90'
            }`}
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 91% 100%, 9% 100%)' }}
          >
            {/* Grid line texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ff007f_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none"></div>
            
            <div className="flex items-center space-x-2 text-pink-300 font-extrabold text-xs sm:text-sm pl-4 sm:pl-8">
              <Target className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>TOP FUNNEL: COLD TRAFFIC</span>
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase text-pink-200 bg-pink-900/80 border border-pink-400/50 px-2.5 py-1 rounded-full pr-4 sm:pr-8">
              100% Clicks
            </span>
          </div>

          {/* Funnel Tier 2 - Orange/Red Neon */}
          <div
            onClick={() => setActiveStage(0)}
            className={`w-[74%] sm:w-[78%] h-14 sm:h-16 rounded-xl border-2 border-red-500 bg-gradient-to-b from-red-950/80 to-pink-900/40 transition-all duration-300 cursor-pointer flex items-center justify-between px-4 sm:px-6 relative group shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] -mt-1 ${
              activeStage === 0 ? 'ring-2 ring-red-300 scale-105 z-10' : 'opacity-90'
            }`}
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 88% 100%, 12% 100%)' }}
          >
            <div className="flex items-center space-x-2 text-red-300 font-bold text-xs pl-3 sm:pl-6">
              <Filter className="w-3.5 h-3.5 text-red-400" />
              <span>ADS & OPT-IN</span>
            </div>
            <span className="text-[10px] font-bold text-red-200 pr-3 sm:pr-6">
              85% Leads
            </span>
          </div>

          {/* Funnel Tier 3 - Purple Neon */}
          <div
            onClick={() => setActiveStage(1)}
            className={`w-[60%] sm:w-[64%] h-14 sm:h-16 rounded-xl border-2 border-purple-500 bg-gradient-to-b from-purple-950/80 to-purple-900/40 transition-all duration-300 cursor-pointer flex items-center justify-between px-3 sm:px-5 relative group shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] -mt-1 ${
              activeStage === 1 ? 'ring-2 ring-purple-300 scale-105 z-10' : 'opacity-90'
            }`}
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' }}
          >
            <div className="flex items-center space-x-1.5 text-purple-300 font-bold text-[11px] sm:text-xs pl-2 sm:pl-4">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>8-Q FORM & WEBINAR</span>
            </div>
            <span className="text-[10px] font-bold text-purple-200 pr-2 sm:pr-4">
              68% Qualified
            </span>
          </div>

          {/* Funnel Tier 4 - Blue/Cyan Neon */}
          <div
            onClick={() => setActiveStage(2)}
            className={`w-[46%] sm:w-[50%] h-12 sm:h-14 rounded-xl border-2 border-cyan-400 bg-gradient-to-b from-cyan-950/80 to-cyan-900/40 transition-all duration-300 cursor-pointer flex items-center justify-between px-3 relative group shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] -mt-1 ${
              activeStage === 2 ? 'ring-2 ring-cyan-300 scale-105 z-10' : 'opacity-90'
            }`}
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }}
          >
            <div className="flex items-center space-x-1 text-cyan-300 font-bold text-[10px] sm:text-[11px] pl-1.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>AI HOT LEADS</span>
            </div>
            <span className="text-[9px] font-bold text-cyan-200 pr-1.5">
              SCORE 85+
            </span>
          </div>

          {/* Funnel Tier 5 (Spout) - Emerald Green Neon */}
          <div
            onClick={() => setActiveStage(2)}
            className={`w-[30%] sm:w-[34%] h-12 sm:h-14 rounded-b-2xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-950 to-emerald-900/60 transition-all duration-300 cursor-pointer flex items-center justify-center relative group shadow-[0_0_35px_rgba(16,185,129,0.8)] hover:shadow-[0_0_50px_rgba(16,185,129,1)] -mt-1 ${
              activeStage === 2 ? 'ring-2 ring-emerald-300 scale-110 z-10' : 'opacity-100'
            }`}
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 65% 100%, 35% 100%)' }}
          >
            <div className="flex items-center space-x-1 text-emerald-300 font-black text-[10px] uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>PAID SALES</span>
            </div>
          </div>

          {/* Concentric Neon Rings on Floor (Perspective Base Grid) */}
          <div className="relative mt-2 flex flex-col items-center">
            <div className="w-36 h-6 border border-pink-500/60 rounded-[100%] shadow-[0_0_20px_#ff007f] bg-pink-950/20 animate-pulse"></div>
            <div className="w-24 h-4 border border-purple-400/80 rounded-[100%] shadow-[0_0_15px_#a855f7] -mt-4"></div>
            <div className="w-14 h-2.5 border border-emerald-400/90 rounded-[100%] shadow-[0_0_15px_#10b981] -mt-3"></div>
          </div>
        </div>

        {/* RIGHT: CONNECTED NEON INFO BOXES (Matching Image 44 Layout) */}
        <div className="lg:col-span-6 flex flex-col space-y-5 relative">
          {/* Connector Line 1 */}
          <div
            onClick={() => setActiveStage(0)}
            className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-md ${
              activeStage === 0
                ? 'border-pink-400 bg-pink-950/60 shadow-[0_0_35px_rgba(255,0,128,0.6)] ring-2 ring-pink-300'
                : 'border-pink-500/40 bg-slate-950/70 shadow-[0_0_15px_rgba(255,0,128,0.2)] hover:border-pink-400'
            }`}
          >
            {/* Dashed connector line to funnel */}
            <div className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 items-center">
              <div className="w-3 h-3 rounded-full bg-pink-400 shadow-[0_0_10px_#ff007f]"></div>
              <div className="w-9 border-t-2 border-dashed border-pink-400"></div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-400/60 text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.4)] shrink-0">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white leading-tight lowercase">
                  advertising, social media, word of mouth
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 bg-pink-900/60 px-2 py-0.5 rounded border border-pink-500/40">
                    Targeted Meta & IG Ads
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">100% Cold Traffic</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Line 2 */}
          <div
            onClick={() => setActiveStage(1)}
            className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-md ${
              activeStage === 1
                ? 'border-purple-400 bg-purple-950/60 shadow-[0_0_35px_rgba(168,85,247,0.6)] ring-2 ring-purple-300'
                : 'border-purple-500/40 bg-slate-950/70 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:border-purple-400'
            }`}
          >
            {/* Dashed connector line to funnel */}
            <div className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 items-center">
              <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]"></div>
              <div className="w-9 border-t-2 border-dashed border-purple-400"></div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-400/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white leading-tight lowercase">
                  learn more about your business, building trust
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-500/40">
                    8-Q Filter & 24/7 Webinar
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">68% High Engagement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Line 3 */}
          <div
            onClick={() => setActiveStage(2)}
            className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-md ${
              activeStage === 2
                ? 'border-pink-400 bg-gradient-to-r from-pink-950/80 to-emerald-950/80 shadow-[0_0_35px_rgba(255,0,128,0.7)] ring-2 ring-pink-300'
                : 'border-pink-500/40 bg-slate-950/70 shadow-[0_0_15px_rgba(255,0,128,0.2)] hover:border-pink-400'
            }`}
          >
            {/* Dashed connector line to funnel */}
            <div className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></div>
              <div className="w-9 border-t-2 border-dashed border-pink-400"></div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0 flex space-x-1">
                <Handshake className="w-5 h-5" />
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white leading-tight lowercase">
                  customers are ready to buy
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                    Instant WhatsApp & CRM Admissions
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">3X ROI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Footer Banner */}
      <div className="mt-6 pt-4 border-t border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-pink-200/80 font-medium">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Automated student qualification filters out 80%+ low-budget enquiries instantly.</span>
        </div>
        <div className="text-[11px] font-bold text-pink-400 uppercase tracking-widest bg-pink-950/60 border border-pink-500/40 px-3 py-1 rounded-full">
          Real-Time Lead Tracking Active
        </div>
      </div>
    </div>
  );
};
