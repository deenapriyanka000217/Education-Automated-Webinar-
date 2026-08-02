import { LeadRecord } from '../types';

export const INITIAL_LEADS: LeadRecord[] = [
  {
    id: 'lead-101',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    contact: {
      fullName: 'Vikram Sharma',
      instituteName: 'Apex Tech Academy',
      whatsappNumber: '919812345678',
      email: 'vikram@apextech.in',
      city: 'Bangalore',
      agreedToTerms: true,
    },
    answers: {
      businessType: 'Online + Offline',
      coursePrice: '₹25,000 – ₹50,000',
      monthlyStudents: '51–100',
      monthlyRevenue: '₹5–₹10 Lakhs',
      marketingSpend: '₹50,000–₹1 Lakh',
      biggestChallenge: 'Lead quality is poor',
      businessRole: 'Founder / Owner',
      nextStepTimeline: "I'd like to implement it as soon as possible",
      investmentScale: '₹25,000–₹50,000/month',
    },
    leadScore: 88,
    category: 'HOT OPPORTUNITY',
    stage: 'WHATSAPP CLICKED',
    utmParams: {
      utm_source: 'meta',
      utm_medium: 'cpc',
      utm_campaign: 'b2b_webinar_july',
      utm_content: 'video_ad_owner',
    },
    hasViewedWebinar: true,
    hasClickedWhatsapp: true,
    notes: 'Very interested in lead qualification and CRM integration. High ticket course fee.',
  },
  {
    id: 'lead-102',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    contact: {
      fullName: 'Ananya Verma',
      instituteName: 'Zenith Civil Services Coaching',
      whatsappNumber: '919898765432',
      email: 'ananya@zenithcoaching.com',
      city: 'Delhi',
      agreedToTerms: true,
    },
    answers: {
      businessType: 'Offline Training Institute',
      coursePrice: '₹50,000+',
      monthlyStudents: '26–50',
      monthlyRevenue: '₹10 Lakhs+',
      marketingSpend: '₹1 Lakh+',
      biggestChallenge: 'Follow-up is inconsistent',
      businessRole: 'Director / Management',
      nextStepTimeline: "I'd consider implementation within 7–30 days",
      investmentScale: '₹50,000–₹1 Lakh/month',
    },
    leadScore: 92,
    category: 'HOT OPPORTUNITY',
    stage: 'WEBINAR VIEWED',
    utmParams: {
      utm_source: 'facebook',
      utm_medium: 'feed',
      utm_campaign: 'ias_coaching_growth',
    },
    hasViewedWebinar: true,
    hasClickedWhatsapp: false,
    notes: 'Large scale IAS institute in Delhi. Struggling with lead tracking on spreadsheets.',
  },
  {
    id: 'lead-103',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    contact: {
      fullName: 'Rahul Deshmukh',
      instituteName: 'SkillCraft Digital Skills',
      whatsappNumber: '919765432109',
      email: 'rahul@skillcraft.io',
      city: 'Pune',
      agreedToTerms: true,
    },
    answers: {
      businessType: 'Online Training Institute',
      coursePrice: '₹10,000 – ₹25,000',
      monthlyStudents: '11–25',
      monthlyRevenue: '₹3–₹5 Lakhs',
      marketingSpend: '₹10,000–₹25,000',
      biggestChallenge: 'Getting leads but not enough admissions',
      businessRole: 'Co-Founder / Partner',
      nextStepTimeline: "I'd consider implementation within 7–30 days",
      investmentScale: '₹10,000–₹25,000/month',
    },
    leadScore: 62,
    category: 'QUALIFIED',
    stage: 'WEBINAR ACCESS SENT',
    utmParams: {
      utm_source: 'instagram',
      utm_medium: 'story',
      utm_campaign: 'digital_skills_leads',
    },
    hasViewedWebinar: false,
    hasClickedWhatsapp: false,
    notes: 'Needs WhatsApp automation reminders to boost webinar attendance and lead follow-up.',
  },
  {
    id: 'lead-104',
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
    contact: {
      fullName: 'Pooja Nair',
      instituteName: 'Nair Design Studio & Academy',
      whatsappNumber: '919823456789',
      email: 'pooja@nairdesign.in',
      city: 'Kochi',
      agreedToTerms: true,
    },
    answers: {
      businessType: 'Independent Trainer / Course Creator',
      coursePrice: '₹5,000 – ₹10,000',
      monthlyStudents: '0–10',
      monthlyRevenue: 'Below ₹1 Lakh',
      marketingSpend: 'Below ₹10,000',
      biggestChallenge: 'Not getting enough enquiries',
      businessRole: 'Founder / Owner',
      nextStepTimeline: "I'm attending mainly to understand the system first",
      investmentScale: "I'd first like to understand the system",
    },
    leadScore: 32,
    category: 'WARM',
    stage: 'NEW REGISTRATION',
    utmParams: {
      utm_source: 'organic',
      utm_medium: 'direct',
      utm_campaign: 'webinar_organic',
    },
    hasViewedWebinar: false,
    hasClickedWhatsapp: false,
  },
];

export const WHO_SHOULD_ATTEND_POINTS = [
  'You run an Online Training Business',
  'You operate an Offline Training Institute',
  'You run both Online + Offline Programs',
  "You're already spending money on advertising",
  "You're getting leads but conversions are inconsistent",
  'Your team struggles with systematic follow-up',
  'Leads are sitting inside WhatsApp or spreadsheets',
  'You want to understand CRM + WhatsApp Automation',
];

export const WEBINAR_TOPICS = [
  {
    number: '01',
    title: 'RELEVANT ADVERTISING',
    description: 'How to reach audiences more relevant to your course.',
  },
  {
    number: '02',
    title: 'LEAD ACQUISITION',
    description: 'How to structure a lead-generation journey.',
  },
  {
    number: '03',
    title: 'PRESENTATION',
    description: 'How webinars, workshops, demos and counselling fit into the acquisition process.',
  },
  {
    number: '04',
    title: 'FOLLOW-UP',
    description: 'How CRM + WhatsApp Automation + human follow-up work together.',
  },
  {
    number: '05',
    title: 'SALES OPPORTUNITIES',
    description: 'How a structured funnel helps your sales team identify and work opportunities.',
  },
];

export const IMPLEMENTATION_STEPS = [
  {
    day: 'DAY 1–2',
    title: 'Business + Funnel Audit',
    desc: 'Deep-dive into current courses, pricing, conversion rates, and existing ad account setup.',
  },
  {
    day: 'DAY 2–3',
    title: 'Landing Page + Lead Qualification',
    desc: 'Building high-converting mobile landing page and multi-step qualification engine.',
  },
  {
    day: 'DAY 3–4',
    title: 'CRM + WhatsApp Automation',
    desc: 'Connecting CRM pipeline, automated instant WhatsApp confirmations, and sequence reminders.',
  },
  {
    day: 'DAY 4–5',
    title: 'Meta Ads + Tracking System',
    desc: 'Structuring Meta CAPI pixel tracking, custom audiences, and high-intent ad creative framework.',
  },
  {
    day: 'DAY 5–6',
    title: 'Testing + Lead Journey',
    desc: 'End-to-end stress test of form submission, database sync, WhatsApp API, and sales notifications.',
  },
  {
    day: 'DAY 7',
    title: 'SYSTEM READY FOR LAUNCH',
    desc: 'Live traffic activation, real-time lead reporting dashboard, and sales team alignment.',
  },
];
