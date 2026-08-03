import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Building2,
  FileSpreadsheet,
  PlusCircle,
  Eye,
  Clock,
  CheckCircle2,
  Tv,
  RefreshCw,
  ExternalLink,
  Code,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { LeadRecord, CrmCategory, PipelineStage } from '../types';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '../utils/whatsapp';
import { submitLeadToGoogleSheets, saveWebhookUrl } from '../utils/googleSheetsSync';
import { getWebhookUrlFromCloud } from '../utils/firebase';

interface CrmDashboardProps {
  leads: LeadRecord[];
  onUpdateLeadStage: (leadId: string, stage: PipelineStage) => void;
  onUpdateLeadMetrics?: (leadId: string, metrics: Partial<LeadRecord>) => void;
  onAddTestLead?: () => void;
  onDeleteLead?: (leadId: string) => void;
  onRefreshLeads?: () => void;
  onClearDemoLeads?: () => void;
  onOpenPage2ForLead?: (lead: LeadRecord) => void;
}

export const CrmDashboard: React.FC<CrmDashboardProps> = ({
  leads,
  onUpdateLeadStage,
  onUpdateLeadMetrics,
  onAddTestLead,
  onDeleteLead,
  onRefreshLeads,
  onClearDemoLeads,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLead, setActiveLead] = useState<LeadRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'sheets'>('leads');
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Google Sheets integration state
  const [googleSheetWebhookUrl, setGoogleSheetWebhookUrl] = useState<string>(
    localStorage.getItem('google_sheet_webhook_url') || ''
  );
  const [webhookInput, setWebhookInput] = useState<string>(
    localStorage.getItem('google_sheet_webhook_url') || ''
  );
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncSuccessMessage, setSheetsSyncSuccessMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    getWebhookUrlFromCloud().then((url) => {
      if (url) {
        if (url !== googleSheetWebhookUrl) {
          setGoogleSheetWebhookUrl(url);
        }
        if (url !== webhookInput) {
          setWebhookInput(url);
        }
      }
    });
  }, []);

  // Save webhook URL to cloud & local storage
  const handleSaveWebhookUrl = async (url: string) => {
    const cleanUrl = url.trim();
    setGoogleSheetWebhookUrl(cleanUrl);
    setWebhookInput(cleanUrl);
    await saveWebhookUrl(cleanUrl);
    setSheetsSyncSuccessMessage('Google Sheet Webhook URL saved and synced successfully!');
    setTimeout(() => setSheetsSyncSuccessMessage(null), 4000);
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesCategory =
      selectedCategory === 'ALL' || lead.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      lead.contact.fullName.toLowerCase().includes(q) ||
      lead.contact.instituteName.toLowerCase().includes(q) ||
      lead.contact.city.toLowerCase().includes(q) ||
      lead.contact.email.toLowerCase().includes(q) ||
      (lead.answers.biggestChallenge && lead.answers.biggestChallenge.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Calculate metrics
  const totalLeads = leads.length;
  const hotCount = leads.filter((l) => l.category === 'HOT OPPORTUNITY').length;
  const qualifiedCount = leads.filter((l) => l.category === 'QUALIFIED').length;
  const whatsappClickedCount = leads.filter(
    (l) => l.hasClickedWhatsapp || l.stage === 'WHATSAPP CLICKED'
  ).length;

  // Category badge colors
  const getCategoryBadgeClass = (category: CrmCategory) => {
    switch (category) {
      case 'HOT OPPORTUNITY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'QUALIFIED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'WARM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'NURTURE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const formatWatchTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Export CSV for Google Sheets
  const handleExportCsv = () => {
    const headers = [
      'Lead ID',
      'Full Name',
      'Academy / Institute Name',
      'WhatsApp Number',
      'Email',
      'City',
      'Category',
      'Lead Score',
      'Pipeline Stage',
      'Video Watch %',
      'Watch Time (Sec)',
      'Visits Count',
      'WhatsApp Clicked',
      'Role',
      'Course Price',
      'Monthly Revenue',
      'Marketing Spend',
      'Biggest Challenge',
      'Next Step Timeline',
      'Created At',
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${l.contact.fullName}"`,
      `"${l.contact.instituteName}"`,
      `"${l.contact.whatsappNumber}"`,
      `"${l.contact.email}"`,
      `"${l.contact.city}"`,
      l.category,
      l.leadScore,
      l.stage,
      `${l.watchPercentage || 0}%`,
      l.watchTimeSeconds || 0,
      l.visitCount || 1,
      l.hasClickedWhatsapp ? 'YES' : 'NO',
      `"${l.answers.businessRole || ''}"`,
      `"${l.answers.coursePrice || ''}"`,
      `"${l.answers.monthlyRevenue || ''}"`,
      `"${l.answers.marketingSpend || ''}"`,
      `"${l.answers.biggestChallenge || ''}"`,
      `"${l.answers.nextStepTimeline || ''}"`,
      `"${new Date(l.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google_sheets_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Sheets Sync Handler
  const handleSyncToGoogleSheets = async () => {
    setIsSyncingSheets(true);
    setSheetsSyncSuccessMessage(null);

    let count = 0;
    for (const lead of leads) {
      try {
        await submitLeadToGoogleSheets(lead);
        count++;
        if (onUpdateLeadMetrics) {
          onUpdateLeadMetrics(lead.id, {
            isSyncedToGoogleSheets: true,
            syncedToGoogleSheetsAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('Error syncing lead:', lead.id, e);
      }
    }

    setIsSyncingSheets(false);
    setSheetsSyncSuccessMessage(
      `Pushed ${count} lead(s) to your Google Sheets webhook!`
    );
  };

  const googleAppsScriptSnippet = `// Google Apps Script for "Training Institute Root System" Sheet
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Lead ID", "Full Name", "Institute Name", "WhatsApp Number", 
      "Email", "City", "Business Type", "Course Price", "Monthly Students",
      "Monthly Revenue", "Marketing Spend", "Biggest Challenge", "Role",
      "Lead Score", "Category", "Pipeline Stage", "Visit Count", "Watch %", 
      "Watch Time (Sec)", "WhatsApp Clicked", "Last Visited At"
    ]);
    sheet.getRange(1, 1, 1, 22).setFontWeight("bold").setBackground("#10B981").setFontColor("#ffffff");
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date().toLocaleString(),
    data.id,
    data.fullName,
    data.instituteName,
    "'" + data.whatsappNumber,
    data.email,
    data.city,
    data.businessType,
    data.coursePrice,
    data.monthlyStudents,
    data.monthlyRevenue,
    data.marketingSpend,
    data.biggestChallenge,
    data.businessRole,
    data.leadScore,
    data.category,
    data.stage,
    data.visitCount || 1,
    (data.watchPercentage || 0) + "%",
    data.watchTimeSeconds || 0,
    data.hasClickedWhatsapp || "NO",
    data.lastVisitedAt || new Date().toLocaleString()
  ]);
  return ContentService.createTextOutput("SUCCESS");
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(googleAppsScriptSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Subnav */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-black tracking-tight text-white">
                Institute & Academy Lead CRM
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Live lead capture, qualification scoring, video watch duration tracking & Google Sheets auto-sync
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab switcher: Leads vs Google Sheets */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('leads')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'leads'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lead Database ({leads.length})
              </button>
              <button
                onClick={() => setActiveTab('sheets')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'sheets'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Sheets Sync</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (onRefreshLeads) onRefreshLeads();
                setRefreshMessage('Lead Database re-synced from storage!');
                setTimeout(() => setRefreshMessage(null), 2500);
              }}
              title="Reload latest leads from local storage"
              className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>Refresh DB</span>
            </button>

            {onClearDemoLeads && (
              <button
                onClick={onClearDemoLeads}
                title="Clear all leads from database"
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Clear Database
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {refreshMessage && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{refreshMessage}</span>
          </div>
        )}

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{totalLeads}</div>
              <div className="text-xs text-slate-400 font-medium">Total Academy Leads</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">{hotCount}</div>
              <div className="text-xs text-slate-400 font-medium">Hot Opportunities (75+)</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-400">
                {leads.filter((l) => (l.watchPercentage || 0) >= 50).length}
              </div>
              <div className="text-xs text-slate-400 font-medium">Watched 50%+ Video</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{whatsappClickedCount}</div>
              <div className="text-xs text-slate-400 font-medium">WhatsApp Engaged</div>
            </div>
          </div>
        </div>

        {/* TAB 1: LEADS DATABASE */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {['ALL', 'HOT OPPORTUNITY', 'QUALIFIED', 'WARM', 'NURTURE', 'TOFU'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, academy, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Lead Table / Cards */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="py-3.5 px-4">Lead / Institute</th>
                      <th className="py-3.5 px-4">Video Engagement</th>
                      <th className="py-3.5 px-4">Role & Metrics</th>
                      <th className="py-3.5 px-4">Lead Score</th>
                      <th className="py-3.5 px-4">Pipeline Stage</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No matching leads found. Try clearing filters or submit a test registration.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        const waMessage = generateWhatsAppMessage(lead);
                        const waUrl = generateWhatsAppUrl(lead.contact.whatsappNumber, waMessage);
                        const watchPct = lead.watchPercentage || 0;

                        return (
                          <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Lead / Institute */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-white text-sm flex items-center flex-wrap gap-1.5">
                                <span>{lead.contact.fullName}</span>
                                {lead.id.startsWith('lead-') ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black tracking-wider uppercase">
                                    LIVE ENTRY
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-medium">
                                    DEMO
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 text-xs flex items-center space-x-1 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                <span>{lead.contact.instituteName}</span>
                              </div>
                              <div className="text-slate-500 text-[11px] flex items-center space-x-2 mt-1">
                                <span className="flex items-center space-x-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span>{lead.contact.city}</span>
                                </span>
                                <span>•</span>
                                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>

                            {/* Video Engagement Tracking */}
                            <td className="py-4 px-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-300">
                                    Watch Pct: {watchPct}%
                                  </span>
                                  <span className="text-slate-400 font-mono">
                                    {formatWatchTime(lead.watchTimeSeconds)}
                                  </span>
                                </div>
                                <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      watchPct >= 75
                                        ? 'bg-emerald-400'
                                        : watchPct >= 50
                                        ? 'bg-amber-400'
                                        : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${Math.max(5, watchPct)}%` }}
                                  ></div>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                                  <span>Visits: {lead.visitCount || 1}</span>
                                  {lead.hasClickedWhatsapp && (
                                    <span className="text-emerald-400 font-bold">
                                      • WhatsApp Clicked ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Role & Business Metrics */}
                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-200">
                                {lead.answers.businessRole || 'Owner'}
                              </div>
                              <div className="text-slate-400 text-xs">
                                {lead.answers.coursePrice ? `Fee: ${lead.answers.coursePrice}` : 'Price unset'}
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5">
                                Rev: {lead.answers.monthlyRevenue || 'N/A'}
                              </div>
                            </td>

                            {/* Score & Category */}
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-black text-white">{lead.leadScore}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryBadgeClass(
                                    lead.category
                                  )}`}
                                >
                                  {lead.category}
                                </span>
                              </div>
                            </td>

                            {/* Pipeline Stage */}
                            <td className="py-4 px-4">
                              <select
                                value={lead.stage}
                                onChange={(e) =>
                                  onUpdateLeadStage(lead.id, e.target.value as PipelineStage)
                                }
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                              >
                                <option value="NEW REGISTRATION">NEW REGISTRATION</option>
                                <option value="WEBINAR ACCESS SENT">WEBINAR ACCESS SENT</option>
                                <option value="WEBINAR VIEWED">WEBINAR VIEWED</option>
                                <option value="ENGAGED">ENGAGED</option>
                                <option value="WHATSAPP CLICKED">WHATSAPP CLICKED</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="QUALIFIED OPPORTUNITY">QUALIFIED OPPORTUNITY</option>
                                <option value="DISCOVERY CALL">DISCOVERY CALL</option>
                                <option value="PROPOSAL">PROPOSAL</option>
                                <option value="WON">WON</option>
                                <option value="LOST">LOST</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right space-x-2">
                              <button
                                onClick={() => setActiveLead(lead)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center space-x-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>Details</span>
                              </button>
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center space-x-1 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                              {onDeleteLead && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete lead "${lead.contact.fullName}"? This will also remove them from Google Sheets.`)) {
                                      onDeleteLead(lead.id);
                                    }
                                  }}
                                  title="Delete lead from CRM & Google Sheets"
                                  className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold inline-flex items-center transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE SHEETS INTEGRATION PANEL */}
        {activeTab === 'sheets' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sync Action Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-extrabold text-white">
                      Google Sheets Integration & Sync Engine
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Sync lead profiles, video completion percentage & WhatsApp status directly to your Google Sheets spreadsheet.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSyncToGoogleSheets}
                    disabled={isSyncingSheets}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSheets ? 'Syncing...' : 'Sync All Leads Now'}</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Download CSV
                  </button>
                </div>
              </div>

              {sheetsSyncSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sheetsSyncSuccessMessage}</span>
                </div>
              )}

              {/* Webhook Configuration Input */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Google Apps Script Webhook Endpoint (Deployed Web App URL):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={webhookInput}
                    onChange={(e) => setWebhookInput(e.target.value)}
                    onBlur={() => handleSaveWebhookUrl(webhookInput)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    onClick={() => handleSaveWebhookUrl(webhookInput)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Save URL
                  </button>
                  <button
                    onClick={handleSyncToGoogleSheets}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                  >
                    Test Send Lead
                  </button>
                </div>

                {googleSheetWebhookUrl && (googleSheetWebhookUrl.includes('/edit') || googleSheetWebhookUrl.includes('/projects/') || googleSheetWebhookUrl.includes('/library/') || !googleSheetWebhookUrl.includes('/exec')) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-amber-200">Attention: Invalid Webhook URL Type Detected</strong>
                      <p className="mt-1">
                        You pasted a Script Editor or Library URL (<code>{googleSheetWebhookUrl.slice(0, 55)}...</code>). This type of URL cannot accept form submissions or incoming leads.
                      </p>
                      <div className="mt-2 text-slate-200 font-semibold space-y-1">
                        <p>How to get the correct <strong>Web App Execution URL</strong> in 3 clicks:</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-100 font-normal">
                          <li>In your Google Apps Script editor, click the blue <strong>Deploy</strong> button (top right) &rarr; <strong>New deployment</strong>.</li>
                          <li>Select <strong>Web app</strong> as the type. Set <em>Execute as:</em> <strong>Me</strong> and <em>Who has access:</em> <strong>Anyone</strong>.</li>
                          <li>Click <strong>Deploy</strong>, then copy the <strong>Web App URL</strong> (it starts with <code>https://script.google.com/macros/s/AKfycb.../exec</code>).</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Google Sheets Spreadsheet Preview Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Spreadsheet Data Preview (Google Sheets Format)</span>
                </h4>
                <span className="text-xs text-slate-400">
                  {leads.length} Row(s) Ready
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-emerald-400 font-bold">
                      <th className="p-2.5 border-r border-slate-800">A: Lead ID</th>
                      <th className="p-2.5 border-r border-slate-800">B: Full Name</th>
                      <th className="p-2.5 border-r border-slate-800">C: Academy / Institute</th>
                      <th className="p-2.5 border-r border-slate-800">D: WhatsApp</th>
                      <th className="p-2.5 border-r border-slate-800">E: City</th>
                      <th className="p-2.5 border-r border-slate-800">F: Score</th>
                      <th className="p-2.5 border-r border-slate-800">G: Watch %</th>
                      <th className="p-2.5 border-r border-slate-800">H: Watch Time</th>
                      <th className="p-2.5">I: Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {leads.map((l, idx) => (
                      <tr key={l.id} className="hover:bg-slate-900/50">
                        <td className="p-2.5 border-r border-slate-800 text-slate-500">{l.id}</td>
                        <td className="p-2.5 border-r border-slate-800 text-white font-bold">{l.contact.fullName}</td>
                        <td className="p-2.5 border-r border-slate-800 text-blue-300">{l.contact.instituteName}</td>
                        <td className="p-2.5 border-r border-slate-800">{l.contact.whatsappNumber}</td>
                        <td className="p-2.5 border-r border-slate-800">{l.contact.city}</td>
                        <td className="p-2.5 border-r border-slate-800 text-amber-300">{l.leadScore}</td>
                        <td className="p-2.5 border-r border-slate-800 font-bold text-emerald-400">{l.watchPercentage || 0}%</td>
                        <td className="p-2.5 border-r border-slate-800">{formatWatchTime(l.watchTimeSeconds)}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">
                          {l.isSyncedToGoogleSheets ? 'Synced ✓' : 'Ready'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Google Apps Script Integration Instructions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span>Google Apps Script for Automatic Webhook Receiver</span>
                </h4>
                <button
                  onClick={copyAppsScript}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{copiedCode ? 'Copied Script!' : 'Copy Script'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Create a free Google Sheet → Extensions → Apps Script → paste this code → Deploy as Web App (Execute as Me, Who has access: Anyone) → copy the Web App URL into the box above.
              </p>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto">
                {googleAppsScriptSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-white">{activeLead.contact.fullName}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getCategoryBadgeClass(
                      activeLead.category
                    )}`}
                  >
                    {activeLead.category} (Score: {activeLead.leadScore})
                  </span>
                </div>
                <p className="text-sm text-blue-400 font-semibold mt-1">
                  {activeLead.contact.instituteName} • {activeLead.contact.city}
                </p>
              </div>

              <button
                onClick={() => setActiveLead(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Contact Info</div>
                <div>Phone: <strong className="text-white">{activeLead.contact.whatsappNumber}</strong></div>
                <div>Email: <strong className="text-white">{activeLead.contact.email}</strong></div>
                <div>City: <strong className="text-white">{activeLead.contact.city}</strong></div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Video Analytics</div>
                <div>Watch Duration: <strong className="text-emerald-400">{formatWatchTime(activeLead.watchTimeSeconds)}</strong></div>
                <div>Watch Percentage: <strong className="text-emerald-400">{activeLead.watchPercentage || 0}%</strong></div>
                <div>Visits Count: <strong className="text-blue-400">{activeLead.visitCount || 1}</strong></div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Qualification Answers</div>
              <div>Role: <strong className="text-white">{activeLead.answers.businessRole}</strong></div>
              <div>Academy Type: <strong className="text-white">{activeLead.answers.businessType}</strong></div>
              <div>Course Price: <strong className="text-white">{activeLead.answers.coursePrice}</strong></div>
              <div>Monthly Revenue: <strong className="text-white">{activeLead.answers.monthlyRevenue}</strong></div>
              <div>Marketing Spend: <strong className="text-white">{activeLead.answers.marketingSpend}</strong></div>
              <div>Biggest Challenge: <strong className="text-amber-300">{activeLead.answers.biggestChallenge}</strong></div>
            </div>

            <div className="flex justify-between items-center space-x-3 pt-2">
              {onDeleteLead && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete lead "${activeLead.contact.fullName}"?`)) {
                      onDeleteLead(activeLead.id);
                      setActiveLead(null);
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Lead</span>
                </button>
              )}
              <button
                onClick={() => setActiveLead(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
