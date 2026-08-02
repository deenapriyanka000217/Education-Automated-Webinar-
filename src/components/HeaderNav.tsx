import React from 'react';
import { PlayCircle, ShieldCheck, Activity } from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'page1' | 'page2';
  setActiveTab: (tab: 'page1' | 'page2') => void;
  openPixelLog: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  openPixelLog,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('page1')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              G
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-lg font-bold tracking-tight uppercase text-white">
                GrowthSystem
              </span>
              <span className="hidden lg:inline-block text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                Education-Business Focus
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="h-4 w-[1px] bg-slate-800"></div>
              <span className="text-[10px] font-medium text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20">
                Institute Owners Only
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Page 1 Button */}
            <button
              onClick={() => setActiveTab('page1')}
              id="nav-page1-btn"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'page1'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Registration</span>
            </button>

            {/* Page 2 Button */}
            <button
              onClick={() => setActiveTab('page2')}
              id="nav-page2-btn"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'page2'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PlayCircle className="w-4 h-4 text-amber-400" />
              <span>Webinar</span>
            </button>

            {/* Pixel Tracker Toggle */}
            <button
              onClick={openPixelLog}
              id="nav-pixel-log-btn"
              title="View Meta Pixel & CAPI Event Stream"
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-900 rounded-xl transition-colors relative"
            >
              <Activity className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

