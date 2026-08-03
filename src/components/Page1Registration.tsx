import React, { useState, useRef } from 'react';
import { NeonFunnelFlow } from './NeonFunnelFlow';
import {
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  Users,
  Target,
  BarChart3,
  Bot,
  Zap,
  Lock,
  Building,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Compass,
} from 'lucide-react';
import {
  QualificationAnswers,
  ContactDetails,
  LeadRecord,
  BusinessType,
  CoursePrice,
  MonthlyStudents,
  MonthlyRevenue,
  MarketingSpend,
  BiggestChallenge,
  BusinessRole,
  NextStepTimeline,
  MonthlyInvestmentScale,
  UtmParams,
} from '../types';
import { calculateLeadScore } from '../utils/leadScoring';
import { pixelTracker } from '../utils/pixel';
import { submitLeadToGoogleSheets } from '../utils/googleSheetsSync';
import { saveLeadToFirestore } from '../utils/firebase';
import { WHO_SHOULD_ATTEND_POINTS, WEBINAR_TOPICS } from '../data/mockData';

interface Page1RegistrationProps {
  onRegistrationComplete: (lead: LeadRecord) => void;
}

export const Page1Registration: React.FC<Page1RegistrationProps> = ({
  onRegistrationComplete,
}) => {
  const formRef = useRef<HTMLDivElement>(null);

  // Form phase: 'details' -> 'part1' (Qs 1-4) -> 'part2' (Qs 5-8)
  const [formPhase, setFormPhase] = useState<'details' | 'part1' | 'part2'>('details');
  const [answers, setAnswers] = useState<QualificationAnswers>({});
  const [contact, setContact] = useState<ContactDetails>({
    fullName: '',
    instituteName: '',
    whatsappNumber: '',
    email: '',
    city: '',
    agreedToTerms: true,
  });

  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [qError, setQError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToForm = () => {
    pixelTracker.track('WebinarRegistrationStarted', { phase: formPhase });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Select answer handler
  const handleSelectAnswer = (key: keyof QualificationAnswers, value: any) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setQError('');
  };

  // Helper to extract clean 10-digit mobile number handling +91, 91, 0 prefixes
  const extractMobileDigits = (val: string): string => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 10) {
      if (digits.startsWith('91') && digits.length === 12) {
        digits = digits.slice(2);
      } else if (digits.startsWith('0') && digits.length === 11) {
        digits = digits.slice(1);
      }
    }
    return digits.slice(0, 10);
  };

  // Validate contact details before moving to qualifying questions
  const validateContact = () => {
    const errors: Record<string, string> = {};
    if (!contact.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!contact.instituteName.trim()) errors.instituteName = 'Institute / Business Name is required';
    
    const digitsOnly = extractMobileDigits(contact.whatsappNumber);
    if (!contact.whatsappNumber.trim()) {
      errors.whatsappNumber = 'WhatsApp Number is required';
    } else if (digitsOnly.length !== 10) {
      errors.whatsappNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!contact.email.trim()) errors.email = 'Email Address is required';
    else if (!/\S+@\S+\.\S+/.test(contact.email)) errors.email = 'Valid email address required';
    if (!contact.city.trim()) errors.city = 'City is required';

    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPart1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContact()) return;
    setFormPhase('part1');
    setQError('');
  };

  const handleProceedToPart2 = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate first 4 questions
    if (!answers.businessType) {
      setQError('Please select Question 1: Academy / Business Model');
      return;
    }
    if (!answers.coursePrice) {
      setQError('Please select Question 2: Course Price Bracket');
      return;
    }
    if (!answers.monthlyStudents) {
      setQError('Please select Question 3: Monthly Student Admissions');
      return;
    }
    if (!answers.monthlyRevenue) {
      setQError('Please select Question 4: Monthly Institute Revenue');
      return;
    }

    setQError('');
    setFormPhase('part2');
  };

  // Submit Handler after qualifying part 2 confirmation
  const handleSubmitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateContact()) {
      setFormPhase('details');
      return;
    }

    // Validate questions 5-8
    if (!answers.marketingSpend) {
      setQError('Please select Question 5: Monthly Marketing Budget');
      return;
    }
    if (!answers.biggestChallenge) {
      setQError('Please select Question 6: Primary Bottleneck');
      return;
    }
    if (!answers.businessRole) {
      setQError('Please select Question 7: Your Role in Institute');
      return;
    }
    if (!answers.nextStepTimeline) {
      setQError('Please select Question 8: Implementation Timeline');
      return;
    }

    setQError('');
    setIsSubmitting(true);

    const formattedDigits = extractMobileDigits(contact.whatsappNumber);
    const formattedContact: ContactDetails = {
      ...contact,
      whatsappNumber: `+91${formattedDigits}`,
    };

    const utmParams: UtmParams = {
      utm_source: 'meta_ads',
      utm_medium: 'cpc',
      utm_campaign: 'institute_growth_webinar',
      utm_content: 'tofu_video_ad',
    };

    const { score, category } = calculateLeadScore(answers);

    const newLead: LeadRecord = {
      id: `lead-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      contact: formattedContact,
      answers,
      leadScore: score,
      category,
      stage: 'NEW REGISTRATION',
      utmParams,
      hasViewedWebinar: false,
      hasClickedWhatsapp: false,
      visitCount: 1,
      lastVisitedAt: new Date().toISOString(),
      isSyncedToGoogleSheets: true,
      syncedToGoogleSheetsAt: new Date().toISOString(),
    };

    // Auto-submit lead filling data to Google Sheets & Firestore CRM asynchronously
    // Non-blocking sync calls ensure instant redirect on Vercel or mobile browsers
    submitLeadToGoogleSheets(newLead).catch((err) =>
      console.warn('Google Sheets sync warning:', err)
    );
    saveLeadToFirestore(newLead).catch((err) =>
      console.warn('Firestore save warning:', err)
    );

    pixelTracker.track('Lead', {
      lead_id: newLead.id,
      lead_score: score,
      category,
      institute: contact.instituteName,
      city: contact.city,
    });

    if (category === 'HOT OPPORTUNITY' || category === 'QUALIFIED') {
      pixelTracker.track('QualifiedLead', {
        lead_id: newLead.id,
        score,
        category,
      });
    }

    setIsSubmitting(false);
    onRegistrationComplete(newLead);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* ============================================================ */}
      {/* SECTION 1 — HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-slate-950 pt-8 pb-16 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          {/* Top Eyebrow Badge */}
          <div className="flex justify-center lg:justify-start">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              Free Webinar for Training Institute Owners
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Copy & Value Prop */}
            <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight sm:leading-[1.05] tracking-tight text-white mb-4 sm:mb-6 text-center lg:text-left">
                STOP DEPENDING ON RANDOM ENQUIRIES —{' '}
                <span className="text-blue-500 block sm:inline mt-1 sm:mt-0">
                  BUILD A 24/7 SYSTEM FOR 3X STUDENT ENROLMENTS
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-slate-400 max-w-xl leading-relaxed mb-6 sm:mb-8 mx-auto lg:mx-0 text-center lg:text-left">
                Discover how leading Training Institutes build a{' '}
                <span className="text-slate-100 font-semibold">
                  Connected Student Acquisition System
                </span>{' '}
                to get predictable leads, automated follow-ups, and consistent course admissions.
              </p>

              {/* Status bullets */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-medium tracking-wide text-slate-400 uppercase">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Free Registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>Online Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>Decision Makers</span>
                </div>
              </div>
            </div>

            {/* Right: Registration Form Banner Component */}
            <div className="lg:col-span-5" ref={formRef}>
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-500/10 text-slate-900 flex flex-col justify-between border border-slate-200 min-h-[520px] sm:min-h-[550px]">
                <div>
                  {/* Form Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      {formPhase !== 'details' && (
                        <button
                          type="button"
                          onClick={() => {
                            setQError('');
                            if (formPhase === 'part2') setFormPhase('part1');
                            else setFormPhase('details');
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Previous Step"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      <span className="text-slate-900 font-extrabold tracking-tight text-base sm:text-lg">
                        {formPhase === 'details' && 'Instant Registration'}
                        {formPhase === 'part1' && 'Qualifying (Part 1 of 2)'}
                        {formPhase === 'part2' && 'Qualifying (Part 2 of 2)'}
                      </span>
                    </div>
                    <div className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-blue-100">
                      {formPhase === 'details' && 'Step 1/3: Contact'}
                      {formPhase === 'part1' && 'Step 2/3: Q1–Q4'}
                      {formPhase === 'part2' && 'Step 3/3: Q5–Q8'}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{
                        width: formPhase === 'details' ? '33%' : formPhase === 'part1' ? '66%' : '100%',
                      }}
                    ></div>
                  </div>

                  {/* PHASE 1: CONTACT DETAILS FORM */}
                  {formPhase === 'details' && (
                    <form onSubmit={handleProceedToPart1} className="space-y-3.5">
                      <h3 className="text-slate-900 font-bold text-sm sm:text-base leading-snug">
                        Enter your details to receive free webinar access:
                      </h3>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rajesh Kumar"
                          value={contact.fullName}
                          onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                          className={`w-full bg-slate-50 border rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            contactErrors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                          }`}
                        />
                        {contactErrors.fullName && (
                          <p className="text-[10px] text-red-600 mt-0.5">{contactErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Academy / Institute Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Excellence Career Academy"
                          value={contact.instituteName}
                          onChange={(e) => setContact({ ...contact, instituteName: e.target.value })}
                          className={`w-full bg-slate-50 border rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            contactErrors.instituteName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                          }`}
                        />
                        {contactErrors.instituteName && (
                          <p className="text-[10px] text-red-600 mt-0.5">{contactErrors.instituteName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Mobile / WhatsApp Number *
                          </label>
                          <div className="flex items-center">
                            <span className="bg-slate-200 border border-r-0 border-slate-300 rounded-l-xl px-2.5 py-3 text-xs sm:text-sm font-extrabold text-slate-700 flex items-center space-x-1 shrink-0">
                              <span>🇮🇳</span>
                              <span>+91</span>
                            </span>
                            <input
                              type="tel"
                              maxLength={10}
                              placeholder="9876543210"
                              value={contact.whatsappNumber}
                              onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setContact({ ...contact, whatsappNumber: digitsOnly });
                              }}
                              className={`w-full bg-slate-50 border rounded-r-xl p-3 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                contactErrors.whatsappNumber ? 'border-red-500 bg-red-50' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {contactErrors.whatsappNumber ? (
                            <p className="text-[10px] text-red-600 mt-0.5">{contactErrors.whatsappNumber}</p>
                          ) : (
                            <p className="text-[10px] text-slate-400 mt-0.5">10 digits only</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Pune"
                            value={contact.city}
                            onChange={(e) => setContact({ ...contact, city: e.target.value })}
                            className={`w-full bg-slate-50 border rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              contactErrors.city ? 'border-red-500 bg-red-50' : 'border-slate-300'
                            }`}
                          />
                          {contactErrors.city && (
                            <p className="text-[10px] text-red-600 mt-0.5">{contactErrors.city}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          placeholder="rajesh@academy.com"
                          value={contact.email}
                          onChange={(e) => setContact({ ...contact, email: e.target.value })}
                          className={`w-full bg-slate-50 border rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            contactErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-300'
                          }`}
                        />
                        {contactErrors.email && (
                          <p className="text-[10px] text-red-600 mt-0.5">{contactErrors.email}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wide mt-4"
                      >
                        <span>PROCEED TO QUALIFICATION (8 QUESTIONS)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* PHASE 2: QUALIFYING PART 1 (QUESTIONS 1-4) */}
                  {formPhase === 'part1' && (
                    <form onSubmit={handleProceedToPart2} className="space-y-4 animate-fadeIn">
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-extrabold flex items-center justify-between">
                        <span>PART 1 OF 2: ACADEMY PROFILE</span>
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">
                          4 Questions
                        </span>
                      </div>

                      {/* Question 1 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          1. What best describes your training business or academy? *
                        </label>
                        <select
                          value={answers.businessType || ''}
                          onChange={(e) => handleSelectAnswer('businessType', e.target.value as BusinessType)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Academy / Business Model --</option>
                          <option value="Online Training Institute">Online Training Institute</option>
                          <option value="Offline Training Institute">Offline Training Institute</option>
                          <option value="Online + Offline">Online + Offline</option>
                          <option value="Coaching Centre / Academy">Coaching Centre / Academy</option>
                          <option value="Independent Trainer / Course Creator">Independent Trainer / Course Creator</option>
                          <option value="Planning to Start">Planning to Start</option>
                        </select>
                      </div>

                      {/* Question 2 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          2. What is the average price range of your main courses? *
                        </label>
                        <select
                          value={answers.coursePrice || ''}
                          onChange={(e) => handleSelectAnswer('coursePrice', e.target.value as CoursePrice)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Course Price Bracket --</option>
                          <option value="Below ₹5,000">Below ₹5,000</option>
                          <option value="₹5,000 – ₹10,000">₹5,000 – ₹10,000</option>
                          <option value="₹10,000 – ₹25,000">₹10,000 – ₹25,000</option>
                          <option value="₹25,000 – ₹50,000">₹25,000 – ₹50,000</option>
                          <option value="₹50,000+">₹50,000+</option>
                        </select>
                      </div>

                      {/* Question 3 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          3. How many new students do you enroll per month? *
                        </label>
                        <select
                          value={answers.monthlyStudents || ''}
                          onChange={(e) => handleSelectAnswer('monthlyStudents', e.target.value as MonthlyStudents)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Monthly Admissions --</option>
                          <option value="0–10">0–10 Students/Month</option>
                          <option value="11–25">11–25 Students/Month</option>
                          <option value="26–50">26–50 Students/Month</option>
                          <option value="51–100">51–100 Students/Month</option>
                          <option value="100+">100+ Students/Month</option>
                        </select>
                      </div>

                      {/* Question 4 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          4. What is your approximate monthly institute revenue? *
                        </label>
                        <select
                          value={answers.monthlyRevenue || ''}
                          onChange={(e) => handleSelectAnswer('monthlyRevenue', e.target.value as MonthlyRevenue)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Revenue Bracket --</option>
                          <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                          <option value="₹1–₹3 Lakhs">₹1–₹3 Lakhs</option>
                          <option value="₹3–₹5 Lakhs">₹3–₹5 Lakhs</option>
                          <option value="₹5–₹10 Lakhs">₹5–₹10 Lakhs</option>
                          <option value="₹10 Lakhs+">₹10 Lakhs+</option>
                        </select>
                      </div>

                      {qError && (
                        <div className="flex items-center gap-1.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold animate-fadeIn">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{qError}</span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQError('');
                            setFormPhase('details');
                          }}
                          className="px-3.5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wide transition-all cursor-pointer"
                        >
                          <span>CONTINUE TO PART 2 (FINAL 4 QUESTIONS)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* PHASE 3: QUALIFYING PART 2 (QUESTIONS 5-8) */}
                  {formPhase === 'part2' && (
                    <form onSubmit={handleSubmitForm} className="space-y-4 animate-fadeIn">
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-extrabold flex items-center justify-between">
                        <span>PART 2 OF 2: GROWTH & GOALS</span>
                        <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase">
                          Final 4 Questions
                        </span>
                      </div>

                      {/* Question 5 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          5. What is your current monthly ad / marketing budget? *
                        </label>
                        <select
                          value={answers.marketingSpend || ''}
                          onChange={(e) => handleSelectAnswer('marketingSpend', e.target.value as MarketingSpend)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Ad Budget --</option>
                          <option value="Not Running Ads">Not Running Ads</option>
                          <option value="Below ₹10,000">Below ₹10,000</option>
                          <option value="₹10,000–₹25,000">₹10,000–₹25,000</option>
                          <option value="₹25,000–₹50,000">₹25,000–₹50,000</option>
                          <option value="₹50,000–₹1 Lakh">₹50,000–₹1 Lakh</option>
                          <option value="₹1 Lakh+">₹1 Lakh+</option>
                        </select>
                      </div>

                      {/* Question 6 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          6. What is your biggest student acquisition challenge right now? *
                        </label>
                        <select
                          value={answers.biggestChallenge || ''}
                          onChange={(e) => handleSelectAnswer('biggestChallenge', e.target.value as BiggestChallenge)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Primary Bottleneck --</option>
                          <option value="Not getting enough enquiries">Not getting enough enquiries</option>
                          <option value="Lead quality is poor">Lead quality is poor</option>
                          <option value="Advertising cost is too high">Advertising cost is too high</option>
                          <option value="Low webinar / workshop attendance">Low webinar / workshop attendance</option>
                          <option value="Follow-up is inconsistent">Follow-up is inconsistent</option>
                          <option value="Getting leads but not enough admissions">Getting leads but not enough admissions</option>
                          <option value="No proper CRM / automation">No proper CRM / automation</option>
                          <option value="Not sure where the problem is">Not sure where the problem is</option>
                        </select>
                      </div>

                      {/* Question 7 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          7. What is your role in your institute or business? *
                        </label>
                        <select
                          value={answers.businessRole || ''}
                          onChange={(e) => handleSelectAnswer('businessRole', e.target.value as BusinessRole)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Your Role --</option>
                          <option value="Founder / Owner">Founder / Owner</option>
                          <option value="Co-Founder / Partner">Co-Founder / Partner</option>
                          <option value="Director / Management">Director / Management</option>
                          <option value="Marketing Head / Manager">Marketing Head / Manager</option>
                          <option value="Sales / Admissions Head">Sales / Admissions Head</option>
                          <option value="Team Member">Team Member</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Question 8 */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-900">
                          8. When are you looking to implement an automated student pipeline? *
                        </label>
                        <select
                          value={answers.nextStepTimeline || ''}
                          onChange={(e) => handleSelectAnswer('nextStepTimeline', e.target.value as NextStepTimeline)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>-- Select Timeline --</option>
                          <option value="I'd like to implement it as soon as possible">As soon as possible (Immediate)</option>
                          <option value="I'd consider implementation within 7–30 days">Within 7–30 days</option>
                          <option value="I'd consider implementation within 1–3 months">Within 1–3 months</option>
                          <option value="I'm currently comparing different growth solutions">Currently comparing solutions</option>
                          <option value="I'm attending mainly to understand the system first">Mainly to understand the system first</option>
                        </select>
                      </div>

                      {qError && (
                        <div className="flex items-center gap-1.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold animate-fadeIn">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{qError}</span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQError('');
                            setFormPhase('part1');
                          }}
                          className="px-3.5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wide transition-all cursor-pointer"
                        >
                          {isSubmitting ? (
                            <span>CONFIRMING & ACCESSING WEBINAR...</span>
                          ) : (
                            <>
                              <span>CONFIRM & ACCESS WEBINAR NOW</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Bar */}
        <div className="bg-slate-900 mt-12 px-6 sm:px-10 py-5 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          <div className="flex items-center gap-4">
            <div className="text-blue-500 font-mono text-xs font-bold">01</div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              Relevant Ads
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-800 pl-4 sm:pl-8">
            <div className="text-blue-500 font-mono text-xs font-bold">02</div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              Lead Acquisition
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-800 pl-4 sm:pl-8">
            <div className="text-blue-500 font-mono text-xs font-bold">03</div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              CRM Automation
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-800 pl-4 sm:pl-8">
            <div className="text-blue-500 font-mono text-xs font-bold">04</div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              Sales Opportunities
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DEDICATED SECTION — AUTOMATED STUDENT LEADS FUNNEL FLOW */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-[#06030e] border-b border-pink-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,128,0.2)]">
              <span>VISUAL LEADS ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Automated Student Leads Funnel Flow
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
              Live interactive visualization of how cold ad traffic gets qualified through our 8-Question Engine and converts into direct course admissions.
            </p>
          </div>

          <NeonFunnelFlow />
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — WHO SHOULD ATTEND? */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              THIS FREE WEBINAR IS FOR YOU IF...
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHO_SHOULD_ATTEND_POINTS.map((point, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800/80 hover:border-blue-700/60 rounded-2xl transition-all flex items-start space-x-3.5 shadow-sm group"
              >
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-slate-200 font-semibold text-sm sm:text-base leading-snug">
                  {point}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={scrollToForm}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-600/25 transition-all inline-flex items-center space-x-2"
            >
              <span>RESERVE MY FREE ACCESS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — THE REAL PROBLEM */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
              THE LEAKY BUCKET SYNDROME
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              MORE LEADS ALONE DON'T BUILD REVENUE.
            </h2>
          </div>

          {/* Timeline of standard failure */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative">
              <div className="text-xs font-bold text-blue-400 mb-1">STAGE 1</div>
              <div className="font-bold text-white text-sm mb-2">AD RUNS → LEAD ARRIVES</div>
              <p className="text-xs text-slate-400">Nobody responds immediately or qualification is absent.</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative">
              <div className="text-xs font-bold text-amber-400 mb-1">STAGE 2</div>
              <div className="font-bold text-white text-sm mb-2">WEBINAR REGISTRATION</div>
              <p className="text-xs text-slate-400">No automated WhatsApp reminders, student forgets to attend.</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative">
              <div className="text-xs font-bold text-amber-400 mb-1">STAGE 3</div>
              <div className="font-bold text-white text-sm mb-2">INTERESTED PROSPECT</div>
              <p className="text-xs text-slate-400">Follow-up delayed by days, opportunity becomes cold.</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative">
              <div className="text-xs font-bold text-red-400 mb-1">STAGE 4</div>
              <div className="font-bold text-white text-sm mb-2">OLD LEADS</div>
              <p className="text-xs text-slate-400">Forgotten inside chaotic spreadsheets or phone chats.</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center max-w-3xl mx-auto space-y-3">
            <p className="text-slate-300 text-sm sm:text-base">
              Many institutes conclude: <strong className="text-red-400">"Facebook Ads Are Not Working."</strong>
            </p>
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-300 font-extrabold text-base sm:text-lg">
                BUT THE REAL PROBLEM MAY BE THE MISSING CONVERSION SYSTEM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — WHAT YOU'LL DISCOVER */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-blue-400 font-extrabold text-xs uppercase tracking-widest">
              WEBINAR CURRICULUM
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              INSIDE THIS FREE WEBINAR
            </h2>
          </div>

          {/* 5 Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WEBINAR_TOPICS.map((topic, i) => (
              <div
                key={topic.number}
                className={`p-6 bg-slate-950 border border-slate-800 hover:border-blue-600/60 rounded-2xl transition-all shadow-md flex flex-col justify-between ${
                  i === 3 ? 'md:col-span-1' : ''
                }`}
              >
                <div>
                  <span className="text-3xl font-black text-blue-500/40">{topic.number}</span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2">{topic.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{topic.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connected Flow Bar */}
          <div className="mt-10 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center text-xs sm:text-sm font-bold text-slate-300 flex flex-wrap items-center justify-center gap-2">
            <span className="text-blue-400">ADVERTISING</span>
            <span>→</span>
            <span className="text-blue-400">LEADS</span>
            <span>→</span>
            <span className="text-amber-400">PRESENTATION</span>
            <span>→</span>
            <span className="text-emerald-400">FOLLOW-UP</span>
            <span>→</span>
            <span className="text-emerald-400 font-extrabold">SALES OPPORTUNITIES</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-slate-500 text-xs text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Institute Growth System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
