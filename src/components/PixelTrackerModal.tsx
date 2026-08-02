import React, { useEffect, useState } from 'react';
import { X, Activity, RefreshCw, Trash2, CheckCircle, Code } from 'lucide-react';
import { pixelTracker } from '../utils/pixel';
import { PixelEvent } from '../types';

interface PixelTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixelTrackerModal: React.FC<PixelTrackerModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<PixelEvent[]>([]);

  useEffect(() => {
    setEvents(pixelTracker.getEvents());
    const unsubscribe = pixelTracker.subscribe((updated) => setEvents(updated));
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-900/50 text-blue-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Meta Pixel & CAPI Event Stream</h3>
              <p className="text-xs text-slate-400">
                Simulated real-time Meta Conversions API & Pixel tracking log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/30 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Total Fired Events: <strong className="text-emerald-400">{events.length}</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => pixelTracker.clearEvents()}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>
        </div>

        {/* Content Event List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Code className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No Meta Pixel events recorded yet.</p>
              <p className="text-[11px] mt-1 text-slate-600">
                Navigate or submit forms to see standard events like Lead, PageView, WebinarPageViewed.
              </p>
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-300 text-sm">{evt.eventName}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{evt.timestamp}</span>
                </div>
                {Object.keys(evt.payload).length > 0 && (
                  <pre className="p-2.5 rounded bg-slate-900/90 text-blue-300 text-[11px] overflow-x-auto border border-slate-800/60">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
