import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LeadRecord } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const LEADS_COLLECTION = 'leads';
const LOCAL_STORAGE_KEY = 'institute_growth_leads';

/**
 * Saves or updates a lead record in Firestore and localStorage.
 */
export async function saveLeadToFirestore(lead: LeadRecord): Promise<void> {
  // 1. Always update local storage first for immediate UI responsiveness
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let existingList: LeadRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    if (!Array.isArray(existingList)) existingList = [];

    const map = new Map<string, LeadRecord>();
    map.set(lead.id, lead);
    existingList.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    const updatedList = Array.from(map.values());
    updatedList.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

    // Broadcast change to other open browser tabs
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('crm_leads_sync');
        bc.postMessage({ type: 'LEAD_UPDATED', lead });
        bc.close();
      } catch (e) {}
    }
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }

  // 2. Persist to Firestore for multi-device/multi-tab real-time sync
  try {
    const docRef = doc(db, LEADS_COLLECTION, lead.id);
    await setDoc(docRef, lead, { merge: true });
    console.log('Successfully saved lead to Firestore:', lead.id);
  } catch (e) {
    console.warn('Firestore save warning (operating in local fallback):', e);
  }
}

/**
 * Real-time listener for Firestore leads collection.
 * Falls back gracefully to localStorage if offline/restricted.
 */
export function subscribeToLeads(onUpdate: (leads: LeadRecord[]) => void): () => void {
  let unsubscribeFirestore = () => {};

  try {
    const colRef = collection(db, LEADS_COLLECTION);
    
    unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        const firestoreLeads: LeadRecord[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            firestoreLeads.push(docSnap.data() as LeadRecord);
          }
        });

        // Always merge Firestore leads with local storage leads
        let localLeads: LeadRecord[] = [];
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localLeads = parsed;
          }
        } catch (e) {}

        const map = new Map<string, LeadRecord>();
        // Add firestore leads first
        firestoreLeads.forEach((l) => map.set(l.id, l));
        // Add local leads if missing
        localLeads.forEach((l) => {
          if (!map.has(l.id)) map.set(l.id, l);
        });

        const combined = Array.from(map.values());
        combined.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
        onUpdate(combined);
      },
      (error) => {
        console.warn('Firestore snapshot listener warning, using local storage:', error);
        loadLocalLeads(onUpdate);
      }
    );
  } catch (e) {
    console.warn('Firestore init warning, using local storage:', e);
    loadLocalLeads(onUpdate);
  }

  // Cross-tab BroadcastChannel fallback
  let bc: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && window.BroadcastChannel) {
    try {
      bc = new BroadcastChannel('crm_leads_sync');
      bc.onmessage = () => {
        loadLocalLeads(onUpdate);
      };
    } catch (e) {}
  }

  return () => {
    unsubscribeFirestore();
    if (bc) bc.close();
  };
}

function loadLocalLeads(onUpdate: (leads: LeadRecord[]) => void) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        onUpdate(parsed);
        return;
      }
    }
  } catch (e) {}
  onUpdate([]);
}

/**
 * Deletes a single lead from Firestore & localStorage
 */
export async function deleteLeadFromFirestore(leadId: string): Promise<void> {
  // Update localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed: LeadRecord[] = JSON.parse(raw);
      const filtered = parsed.filter((l) => l.id !== leadId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}

  // Delete from Firestore
  try {
    const docRef = doc(db, LEADS_COLLECTION, leadId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Failed to delete lead from Firestore:', e);
  }
}

/**
 * Clears all leads from Firestore & localStorage
 */
export async function clearAllLeadsFromFirestore(): Promise<void> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  } catch (e) {}

  try {
    const snapshot = await getDocs(collection(db, LEADS_COLLECTION));
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (e) {
    console.warn('Failed to clear Firestore leads collection:', e);
  }
}

const SETTINGS_COLLECTION = 'settings';

export async function saveWebhookUrlToCloud(url: string): Promise<void> {
  try {
    localStorage.setItem('google_sheet_webhook_url', url);
    const docRef = doc(db, SETTINGS_COLLECTION, 'config');
    await setDoc(docRef, { googleSheetWebhookUrl: url }, { merge: true });
  } catch (e) {
    console.warn('Failed to save webhook URL to cloud:', e);
  }
}

export async function getWebhookUrlFromCloud(): Promise<string> {
  try {
    const local = localStorage.getItem('google_sheet_webhook_url');
    if (local && local.trim()) return local.trim();

    const docRef = doc(db, SETTINGS_COLLECTION, 'config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.googleSheetWebhookUrl) {
      const cloudUrl = docSnap.data().googleSheetWebhookUrl;
      localStorage.setItem('google_sheet_webhook_url', cloudUrl);
      return cloudUrl;
    }
  } catch (e) {
    console.warn('Failed to get webhook URL from cloud:', e);
  }
  return localStorage.getItem('google_sheet_webhook_url') || '';
}
