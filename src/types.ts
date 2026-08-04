export type BusinessType =
  | 'Online Training Institute'
  | 'Offline Training Institute'
  | 'Online + Offline'
  | 'Coaching Centre / Academy'
  | 'Independent Trainer / Course Creator'
  | 'Planning to Start';

export type CoursePrice =
  | 'Below ₹5,000'
  | '₹5,000 – ₹10,000'
  | '₹10,000 – ₹25,000'
  | '₹25,000 – ₹50,000'
  | '₹50,000+';

export type MonthlyStudents =
  | '0–10'
  | '11–25'
  | '26–50'
  | '51–100'
  | '100+';

export type MonthlyRevenue =
  | 'Below ₹1 Lakh'
  | '₹1–₹3 Lakhs'
  | '₹3–₹5 Lakhs'
  | '₹5–₹10 Lakhs'
  | '₹10 Lakhs+';

export type MarketingSpend =
  | 'Not Running Ads'
  | 'Below ₹10,000'
  | '₹10,000–₹25,000'
  | '₹25,000–₹50,000'
  | '₹50,000–₹1 Lakh'
  | '₹1 Lakh+';

export type BiggestChallenge =
  | 'Not getting enough enquiries'
  | 'Lead quality is poor'
  | 'Advertising cost is too high'
  | 'Low webinar / workshop attendance'
  | 'Follow-up is inconsistent'
  | 'Getting leads but not enough admissions'
  | 'No proper CRM / automation'
  | 'Not sure where the problem is';

export type BusinessRole =
  | 'Founder / Owner'
  | 'Co-Founder / Partner'
  | 'Director / Management'
  | 'Marketing Head / Manager'
  | 'Sales / Admissions Head'
  | 'Team Member'
  | 'Other';

export type NextStepTimeline =
  | "I'd like to implement it as soon as possible"
  | "I'd consider implementation within 7–30 days"
  | "I'd consider implementation within 1–3 months"
  | "I'm currently comparing different growth solutions"
  | "I'm attending mainly to understand the system first";

export type MonthlyInvestmentScale =
  | 'Below ₹10,000/month'
  | '₹10,000–₹25,000/month'
  | '₹25,000–₹50,000/month'
  | '₹50,000–₹1 Lakh/month'
  | '₹1 Lakh+/month'
  | "I'd first like to understand the system";

export type CrmCategory =
  | 'HOT OPPORTUNITY'
  | 'QUALIFIED'
  | 'WARM'
  | 'NURTURE'
  | 'TOFU';

export type PipelineStage =
  | 'NEW REGISTRATION'
  | 'WEBINAR ACCESS SENT'
  | 'WEBINAR VIEWED'
  | 'ENGAGED'
  | 'WHATSAPP CLICKED'
  | 'PDF DOWNLOADED'
  | 'CONTACTED'
  | 'QUALIFIED OPPORTUNITY'
  | 'DISCOVERY CALL'
  | 'PROPOSAL'
  | 'WON'
  | 'LOST';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface QualificationAnswers {
  businessType?: BusinessType;
  coursePrice?: CoursePrice;
  monthlyStudents?: MonthlyStudents;
  monthlyRevenue?: MonthlyRevenue;
  marketingSpend?: MarketingSpend;
  biggestChallenge?: BiggestChallenge;
  businessRole?: BusinessRole;
  nextStepTimeline?: NextStepTimeline;
  investmentScale?: MonthlyInvestmentScale;
}

export interface ContactDetails {
  fullName: string;
  instituteName: string;
  whatsappNumber: string;
  email: string;
  city: string;
  agreedToTerms: boolean;
}

export interface LeadRecord {
  id: string;
  createdAt: string;
  contact: ContactDetails;
  answers: QualificationAnswers;
  leadScore: number;
  category: CrmCategory;
  stage: PipelineStage;
  utmParams: UtmParams;
  hasViewedWebinar?: boolean;
  hasClickedWhatsapp?: boolean;
  hasDownloadedPdf?: boolean;
  watchTimeSeconds?: number;
  watchPercentage?: number;
  visitCount?: number;
  lastVisitedAt?: string;
  isSyncedToGoogleSheets?: boolean;
  syncedToGoogleSheetsAt?: string;
  notes?: string;
}

export interface PixelEvent {
  id: string;
  eventName: string;
  timestamp: string;
  payload: Record<string, any>;
}
