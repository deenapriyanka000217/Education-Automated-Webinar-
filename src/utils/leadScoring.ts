import { QualificationAnswers, CrmCategory } from '../types';

export interface ScoreBreakdown {
  score: number;
  category: CrmCategory;
  signals: string[];
}

export function calculateLeadScore(answers: QualificationAnswers): ScoreBreakdown {
  let score = 0;
  const signals: string[] = [];

  // 1. Business Role (Max 20 pts)
  const highRole = ['Founder / Owner', 'Co-Founder / Partner', 'Director / Management'];
  if (answers.businessRole && highRole.includes(answers.businessRole)) {
    score += 20;
    signals.push(`Key Decision Maker (${answers.businessRole})`);
  } else if (answers.businessRole === 'Marketing Head / Manager' || answers.businessRole === 'Sales / Admissions Head') {
    score += 12;
    signals.push(`Department Leader (${answers.businessRole})`);
  } else if (answers.businessRole) {
    score += 5;
  }

  // 2. Course Price (Max 15 pts)
  if (answers.coursePrice === '₹50,000+') {
    score += 15;
    signals.push('High Ticket Course (₹50,000+)');
  } else if (answers.coursePrice === '₹25,000 – ₹50,000') {
    score += 13;
    signals.push('Mid-High Ticket Course (₹25k-50k)');
  } else if (answers.coursePrice === '₹10,000 – ₹25,000') {
    score += 10;
    signals.push('Core Course Value (₹10k-25k)');
  } else if (answers.coursePrice === '₹5,000 – ₹10,000') {
    score += 5;
  } else {
    score += 2;
  }

  // 3. Monthly Revenue (Max 15 pts)
  if (answers.monthlyRevenue === '₹10 Lakhs+') {
    score += 15;
    signals.push('High Revenue Institute (₹10L+)');
  } else if (answers.monthlyRevenue === '₹5–₹10 Lakhs') {
    score += 13;
    signals.push('Strong Revenue (₹5-10L)');
  } else if (answers.monthlyRevenue === '₹3–₹5 Lakhs') {
    score += 10;
    signals.push('Growing Revenue (₹3-5L)');
  } else if (answers.monthlyRevenue === '₹1–₹3 Lakhs') {
    score += 5;
  } else {
    score += 2;
  }

  // 4. Marketing Spend (Max 15 pts)
  if (answers.marketingSpend === '₹1 Lakh+') {
    score += 15;
    signals.push('Heavy Ad Spend (₹1L+)');
  } else if (answers.marketingSpend === '₹50,000–₹1 Lakh') {
    score += 13;
    signals.push('Active Ad Budget (₹50k-1L)');
  } else if (answers.marketingSpend === '₹25,000–₹50,000') {
    score += 10;
    signals.push('Regular Marketing Budget (₹25k-50k)');
  } else if (answers.marketingSpend === '₹10,000–₹25,000') {
    score += 7;
    signals.push('Running Paid Ads (₹10k-25k)');
  } else if (answers.marketingSpend === 'Below ₹10,000') {
    score += 4;
  } else {
    score += 1;
  }

  // 5. Monthly Student Enrollment (Max 10 pts)
  if (answers.monthlyStudents === '100+') {
    score += 10;
    signals.push('High Volume (100+ Students/mo)');
  } else if (answers.monthlyStudents === '51–100') {
    score += 8;
    signals.push('Solid Volume (51-100 Students/mo)');
  } else if (answers.monthlyStudents === '26–50') {
    score += 6;
    signals.push('Medium Volume (26-50 Students/mo)');
  } else if (answers.monthlyStudents === '11–25') {
    score += 4;
  } else {
    score += 2;
  }

  // 6. Implementation Timeline (Max 15 pts)
  if (answers.nextStepTimeline === "I'd like to implement it as soon as possible") {
    score += 15;
    signals.push('Immediate Action Intent (ASAP)');
  } else if (answers.nextStepTimeline === "I'd consider implementation within 7–30 days") {
    score += 12;
    signals.push('Near-term Action Intent (7-30 days)');
  } else if (answers.nextStepTimeline === "I'd consider implementation within 1–3 months") {
    score += 7;
  } else {
    score += 3;
  }

  // 7. Optional Investment Comfort Level (Max 10 pts)
  if (answers.investmentScale === '₹1 Lakh+/month') {
    score += 10;
    signals.push('Comfortable with ₹1L+ Growth Investment');
  } else if (answers.investmentScale === '₹50,000–₹1 Lakh/month') {
    score += 9;
    signals.push('Comfortable with ₹50k-1L Growth Investment');
  } else if (answers.investmentScale === '₹25,000–₹50,000/month') {
    score += 8;
    signals.push('Comfortable with ₹25k-50k Growth Investment');
  } else if (answers.investmentScale === '₹10,000–₹25,000/month') {
    score += 4;
  }

  // Categorize
  let category: CrmCategory = 'TOFU';
  if (score >= 75) {
    category = 'HOT OPPORTUNITY';
  } else if (score >= 55) {
    category = 'QUALIFIED';
  } else if (score >= 35) {
    category = 'WARM';
  } else if (score >= 20) {
    category = 'NURTURE';
  } else {
    category = 'TOFU';
  }

  return { score, category, signals };
}
