import { PixelEvent } from '../types';

type PixelListener = (events: PixelEvent[]) => void;

class PixelTracker {
  private events: PixelEvent[] = [];
  private listeners: PixelListener[] = [];

  constructor() {
    // Load from session or initialize
    try {
      const stored = sessionStorage.getItem('meta_pixel_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (e) {
      this.events = [];
    }
  }

  public track(eventName: string, payload: Record<string, any> = {}) {
    const newEvent: PixelEvent = {
      id: Math.random().toString(36).substring(2, 9),
      eventName,
      timestamp: new Date().toLocaleTimeString(),
      payload,
    };

    this.events.unshift(newEvent);
    if (this.events.length > 50) this.events.pop();

    try {
      sessionStorage.setItem('meta_pixel_events', JSON.stringify(this.events));
    } catch (e) {
      // ignore
    }

    // Forward to window.fbq if initialized
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', eventName, payload);
      } catch (err) {
        console.warn('Meta Pixel fbq call error:', err);
      }
    }

    // Log to browser console as simulated Meta Pixel
    console.log(`[Meta Pixel Event Fired]: %c${eventName}`, 'color: #10B981; font-weight: bold;', payload);

    // Notify listeners
    this.notify();
  }

  public getEvents(): PixelEvent[] {
    return [...this.events];
  }

  public clearEvents() {
    this.events = [];
    try {
      sessionStorage.removeItem('meta_pixel_events');
    } catch (e) {}
    this.notify();
  }

  public subscribe(listener: PixelListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.events]));
  }
}

export const pixelTracker = new PixelTracker();
