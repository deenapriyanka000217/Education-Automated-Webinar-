import React, { useState, useEffect } from 'react';
import { Page1Registration } from './components/Page1Registration';
import { Page2Webinar } from './components/Page2Webinar';
import { PixelTrackerModal } from './components/PixelTrackerModal';
import { LeadRecord } from './types';
import { pixelTracker } from './utils/pixel';
import {
  saveLeadToFirestore,
  subscribeToLeads,
} from './utils/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'page1' | 'page2'>('page1');
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [currentLead, setCurrentLead] = useState<LeadRecord | null>(null);
  const [isPixelLogOpen, setIsPixelLogOpen] = useState(false);
  const [latestLeadName, setLatestLeadName] = useState<string | undefined>(undefined);

  // Initial load, tab detection & real-time Firestore sync listener
  useEffect(() => {
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (search.includes('webinar') || search.includes('thankyou') || hash.includes('webinar') || hash.includes('thankyou')) {
      setActiveTab('page2');
    }

    // Track initial page view
    pixelTracker.track('PageView', { path: '/' });

    // Subscribe to real-time leads from Firestore
    const unsubscribe = subscribeToLeads((realtimeLeads) => {
      setLeads(realtimeLeads);
      if (realtimeLeads.length > 0) {
        setCurrentLead((prev) => {
          if (!prev) return realtimeLeads[0];
          const updated = realtimeLeads.find((l) => l.id === prev.id);
          return updated || realtimeLeads[0];
        });
      } else {
        setCurrentLead(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Registration complete handler
  const handleRegistrationComplete = (newLead: LeadRecord) => {
    // Instantly insert lead into React state
    setLeads((prev) => {
      const filtered = prev.filter((l) => l.id !== newLead.id);
      return [newLead, ...filtered];
    });
    setCurrentLead(newLead);
    setLatestLeadName(newLead.contact.fullName);

    // Save asynchronously to Firestore and local storage
    saveLeadToFirestore(newLead);

    // Redirect immediately to Page 2 (Webinar Video Page)
    setActiveTab('page2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lead metrics updater (watch time, watch %, visit count, whatsapp click)
  const handleUpdateLeadMetrics = React.useCallback(
    (leadId: string, metrics: Partial<LeadRecord>) => {
      setLeads((prevLeads) => {
        const target = prevLeads.find((l) => l.id === leadId);
        if (target) {
          const updated = { ...target, ...metrics };
          saveLeadToFirestore(updated);
        }
        return prevLeads.map((l) => (l.id === leadId ? { ...l, ...metrics } : l));
      });
      setCurrentLead((prev) => (prev && prev.id === leadId ? { ...prev, ...metrics } : prev));
    },
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Main Body */}
      <main className="flex-1">
        {activeTab === 'page1' && (
          <Page1Registration
            onRegistrationComplete={handleRegistrationComplete}
          />
        )}

        {activeTab === 'page2' && (
          <Page2Webinar
            currentLead={currentLead}
            onUpdateLeadMetrics={handleUpdateLeadMetrics}
            onSwitchTab={setActiveTab}
          />
        )}
      </main>

      {/* Meta Pixel & Event Log Modal */}
      <PixelTrackerModal
        isOpen={isPixelLogOpen}
        onClose={() => setIsPixelLogOpen(false)}
      />
    </div>
  );
}
