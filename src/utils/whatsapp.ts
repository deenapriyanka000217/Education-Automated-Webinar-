import { LeadRecord } from '../types';

export function generateWhatsAppMessage(lead: LeadRecord): string {
  const name = lead.contact.fullName || 'Institute Owner';
  const institute = lead.contact.instituteName || 'Training Institute';
  const role = lead.answers.businessRole || 'Owner / Director';
  const courseFee = lead.answers.coursePrice || 'Not specified';
  const students = lead.answers.monthlyStudents || 'Not specified';
  const spend = lead.answers.marketingSpend || 'Not specified';
  const challenge = lead.answers.biggestChallenge || 'Not specified';

  return `Hi, I watched the webinar. Please send me the PDF and details.

Name: ${name}
Institute: ${institute}
My Role: ${role}
Course Fee: ${courseFee}
Monthly Students: ${students}
Current Marketing Spend: ${spend}
Main Challenge: ${challenge}

I'd like to connect on WhatsApp and get the PDF.`;
}

export function generateWhatsAppUrl(phone: string = '919876543210', message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone || '919876543210'}?text=${encodedMsg}`;
}
