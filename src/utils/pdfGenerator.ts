import { jsPDF } from 'jspdf';
import { LeadRecord } from '../types';

export function downloadPersonalizedPDF(lead: LeadRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const name = lead.contact.fullName || 'Academy Owner';
  const institute = lead.contact.instituteName || 'Your Training Institute';
  const city = lead.contact.city || 'India';
  const category = lead.category || 'QUALIFIED LEAD';
  const score = lead.leadScore || 85;
  const role = lead.answers.businessRole || 'Founder / Owner';
  const coursePrice = lead.answers.coursePrice || 'Below ₹5,000';
  const marketingSpend = lead.answers.marketingSpend || 'Below ₹10,000';
  const biggestChallenge = lead.answers.biggestChallenge || 'Getting consistent student leads';

  // Helper: Draw page header
  const addHeader = (pageNum: number) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('AUTOMATED STUDENT ACQUISITION SYSTEM BLUEPRINT', 12, 10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Page ${pageNum}`, 190, 10);
  };

  // Helper: Draw page footer
  const addFooter = () => {
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 282, 210, 15, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(0, 282, 210, 282);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('© 2026 Training Institute Growth System. All Rights Reserved.', 12, 291);
    doc.text('Support WhatsApp: +91 98765 43210', 145, 291);
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  // Draw deep dark background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 297, 'F');

  // Accent gold details
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 80, 210, 15, 'F');

  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 95, 210, 3, 'F');

  // Cover Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('AUTOMATED STUDENT', 15, 60);
  doc.text('ACQUISITION SYSTEM', 15, 72);

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('THE 24/7 HIGH-CONVERTING SYSTEM FOR ACADEMIES', 15, 91);

  // Personalized subtitle
  doc.setTextColor(226, 232, 240); // slate-200
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('A Custom Growth Roadmap Prepared Exclusively For:', 15, 120);

  // Name and Academy Box
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(12, 126, 186, 32, 'F');
  doc.setDrawColor(51, 65, 85); // slate-700
  doc.rect(12, 126, 186, 32, 'S');

  doc.setTextColor(251, 191, 36); // amber-400
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(name, 20, 134);

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Institute: ${institute}`, 20, 142);
  doc.text(`Location: ${city}`, 20, 149);

  // System Badges
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(10);
  doc.text('Lead Score Diagnosis:', 15, 180);
  doc.setTextColor(34, 197, 94); // green-500
  doc.setFont('Helvetica', 'bold');
  doc.text(`${score} / 100 - ${category}`, 55, 180);

  // Features list
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('What is Included in This Strategy Blueprint:', 15, 205);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  const highlights = [
    '• Part 1: Your Custom Admission Bottleneck Analysis',
    '• Part 2: The 3-Step Automated Lead Ingestion Pipeline',
    '• Part 3: Meta Pixel Optimization & Signal Capture',
    '• Part 4: Google Sheets Real-Time Sync & CRM Automation',
    '• Part 5: The High-Converting WhatsApp Follow-up Framework',
  ];
  highlights.forEach((line, index) => {
    doc.text(line, 15, 216 + index * 8);
  });

  // Footer on cover
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text('CONFIDENTIAL ROADMAP — STAGE: REGISTERED SYSTEM BRIEF', 15, 270);

  // ==========================================
  // PAGE 2: DIAGNOSIS & ROADMAP
  // ==========================================
  doc.addPage();
  addHeader(2);

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PART 1: INDIVIDUAL DIAGNOSIS & DIAGRAM', 12, 30);

  // Intro text
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(
    `Based on your registration, ${name}, our system has calculated a Lead Score of ${score}/100.`,
    12,
    38
  );
  doc.text(
    `Your institute, "${institute}", is placed in the ${category} category. Here is your roadmap:`,
    12,
    44
  );

  // Profile Table Background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(12, 52, 186, 52, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(12, 52, 186, 52, 'S');

  // Profile Table Headers & Rows
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('METRIC', 18, 60);
  doc.text('YOUR RESPONSE', 80, 60);
  doc.text('IMPACT ANALYSIS', 140, 60);

  doc.setDrawColor(203, 213, 225);
  doc.line(15, 63, 195, 63);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Role', 18, 70);
  doc.setFont('Helvetica', 'bold');
  doc.text(role, 80, 70);
  doc.setFont('Helvetica', 'normal');
  doc.text('High alignment for automated tools', 140, 70);

  doc.text('Course Fee', 18, 78);
  doc.setFont('Helvetica', 'bold');
  doc.text(coursePrice, 80, 78);
  doc.setFont('Helvetica', 'normal');
  doc.text(score >= 80 ? 'Premium positioning' : 'Requires high volume flow', 140, 78);

  doc.text('Marketing Spend', 18, 86);
  doc.setFont('Helvetica', 'bold');
  doc.text(marketingSpend, 80, 86);
  doc.setFont('Helvetica', 'normal');
  doc.text('Requires high ROI lead-nurturing', 140, 86);

  doc.text('Primary Challenge', 18, 94);
  doc.setFont('Helvetica', 'bold');
  // Truncate challenge if too long
  const truncatedChallenge = biggestChallenge.length > 35 ? biggestChallenge.slice(0, 32) + '...' : biggestChallenge;
  doc.text(truncatedChallenge, 80, 94);
  doc.setFont('Helvetica', 'normal');
  doc.text('Addressed directly in Part 4', 140, 94);

  // Recommendations header
  doc.setTextColor(29, 78, 216); // blue-700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Tailored Growth Strategy For Your Category:', 12, 116);

  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);

  let recs: string[] = [];
  if (score >= 80) {
    recs = [
      '1. IMPLEMENT INSTANT CRITICAL ENGAGEMENT: Because your courses are high value, your leads require instant touchpoints. Establish a real-time WhatsApp greeting system immediately.',
      '2. HIGH-INTENT CONVERSION FLOWS: Route low-intent signups into automated educational webinars rather than manual, cold follow-up calls to save valuable sales representative hours.',
      '3. CONTEXTUAL RE-TARGETING: Set up Meta custom audiences triggered by 75%+ webinar views to recapture hot prospects who abandoned the flow before scheduling a strategy call.',
    ];
  } else {
    recs = [
      '1. SCALE LEAD VOLUME COST-EFFECTIVELY: Focus on a broad TOFU (Top of Funnel) audience using Meta Ads, driving traffic to a direct WhatsApp link or rapid qualification page.',
      '2. LIGHTWEIGHT CHATBOT NUTRITION: Deploy automated interactive FAQ sequences on WhatsApp Business to qualify inquiries before routing them to human support.',
      '3. BATCH COMMUNICATOR BROADCASTS: Utilize a professional WhatsApp API broadcaster to send automated follow-up messages twice a week with social proof and testimonials.',
    ];
  }

  recs.forEach((rec, index) => {
    const splitText = doc.splitTextToSize(rec, 186);
    doc.text(splitText, 12, 124 + index * 24);
  });

  // Funnel System Flow Visual
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(12, 202, 186, 68, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(12, 202, 186, 68, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('THE AUTOMATED STUDENT ADMISSION PIPELINE SYSTEM', 50, 210);

  // Draw 3 pipeline blocks
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(20, 218, 48, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('1. TRAFFIC GENERATION', 23, 226);
  doc.setFont('Helvetica', 'normal');
  doc.text('Meta Ads / Lead Form', 24, 232);

  // Arrow
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('→', 73, 230);

  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(80, 218, 48, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('2. MASTERCLASS / Q&A', 82, 226);
  doc.setFont('Helvetica', 'normal');
  doc.text('Engage & Build Trust', 84, 232);

  // Arrow
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('→', 133, 230);

  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(140, 218, 48, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('3. INSTANT CONVERSION', 142, 226);
  doc.setFont('Helvetica', 'normal');
  doc.text('WhatsApp Sync / Close', 143, 232);

  // Caption
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.text('Result: Raw prospects are instantly converted into highly motivated, qualified applicants automatically.', 20, 258);

  addFooter();

  // ==========================================
  // PAGE 3: TECHNICAL INTEGRATION & ACTION STEPS
  // ==========================================
  doc.addPage();
  addHeader(3);

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PART 2: REAL-TIME GOOGLE SHEETS & CRM SYNC', 12, 30);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    'A manual sales system has a 24-hour response lag, killing 80% of prospective student interest.',
    12,
    38
  );
  doc.text(
    'Our system eliminates this entirely by instantly syncing user profiles and tracking watch behavior.',
    12,
    44
  );

  // Diagram Box
  doc.setFillColor(248, 250, 252);
  doc.rect(12, 52, 186, 92, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(12, 52, 186, 92, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('YOUR WEB APP REAL-TIME INTEGRATION DIAGRAM', 55, 60);

  // Box 1: Web Registration
  doc.setFillColor(255, 255, 255);
  doc.rect(20, 70, 72, 14, 'DF');
  doc.setFontSize(8.5);
  doc.text('User Submits Form (Page 1)', 24, 76);
  doc.setFont('Helvetica', 'normal');
  doc.text('Captured Name, WhatsApp, Email, City', 24, 81);

  // Line & text
  doc.line(56, 84, 56, 94);
  doc.text('Triggers instantly', 59, 90);

  // Box 2: Google Sheets API
  doc.setFillColor(236, 253, 245); // light emerald
  doc.rect(20, 94, 72, 14, 'DF');
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('Google Sheets Webhook Sync', 24, 100);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Data instantly appended to spreadsheet rows', 24, 105);

  // Line & text
  doc.line(56, 108, 56, 118);
  doc.text('Automated Routing', 59, 114);

  // Box 3: WhatsApp
  doc.setFillColor(254, 242, 242); // light red/amber
  doc.rect(20, 118, 72, 14, 'DF');
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text('WhatsApp Pre-filled Message', 24, 124);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Connects lead directly with the sales team', 24, 129);

  // Right Side text inside Diagram Box
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Major Benefits:', 105, 75);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('• No Manual Work: No copying phone numbers.', 105, 83);
  doc.text('• Zero Response Time: Closes leads instantly.', 105, 91);
  doc.text('• Full Accountability: Tracking leads on Google Sheets.', 105, 99);
  doc.text('• Meta Pixel Optimization: Auto-fires qualified events', 105, 107);
  doc.text('  to optimize advertisement spend on Facebook/Insta.', 105, 112);

  // Step-by-Step checklist header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(29, 78, 216);
  doc.text('5 IMMEDIATE STEPS TO LAUNCH YOUR AUTOMATED PIPELINE', 12, 160);

  const steps = [
    '1. Connect Google Sheets: Input your Google Apps Script Webhook URL inside the CRM Settings panel.',
    '2. Double check Meta Pixel: Ensure the Facebook Pixel (ID: 872413505634447) is tracking Lead registration.',
    '3. Review WhatsApp Links: Test the pre-filled message templates to verify WhatsApp routing on mobile.',
    '4. Verify CRM Dashboard: Check live incoming registrations inside the real-time CRM panel.',
    '5. Launch Traffic: Direct traffic to Page 1 and monitor conversion scores dynamically.',
  ];

  steps.forEach((step, index) => {
    const splitStep = doc.splitTextToSize(step, 186);
    doc.text(splitStep, 12, 170 + index * 18);
  });

  // Call to action banner at bottom
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(12, 258, 186, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Ready to activate this 24/7 system for "${institute}"?`, 18, 268);
  doc.setTextColor(245, 158, 11);
  doc.text('Click "Connect on WhatsApp" to schedule your live 1-on-1 strategy call!', 115, 268);

  addFooter();

  // Save the PDF
  const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_Admission_Growth_Blueprint.pdf`;
  doc.save(filename);
}
