// =====================================================================
// Mock data for the Alphard prototype
// =====================================================================

export type Stage =
  | "Qualification" | "Discovery" | "Demo" | "Proposal" | "Negotiation"
  | "Closed Won" | "Closed Lost";

export type ForecastCategory = "Pipeline" | "Best Case" | "Commit" | "Won" | "Lost" | "Omitted";

export type Pipeline = "Enterprise sales" | "Mid-Market sales" | "Customer Success";

export type Health = "high" | "medium" | "low";

export type DealRow = {
  id: string;
  name: string;
  account: string;
  owner: string;
  ownerInitials: string;
  pipeline: Pipeline;
  segment: "Enterprise" | "Mid-Market" | "SMB";
  stage: Stage;
  stageProgress: { done: number; total: number };
  amount: number;
  forecast: ForecastCategory;
  forecastProb: number; // 0-100
  closeDate: string; // ISO
  closeAtRisk: boolean;
  meddpicc: number[]; // 8 booleans 0/1
  nextStep: string;
  priority: "High" | "Medium" | "Low";
  health: Health;
};

const owners = [
  "Sarah Chen", "Brad Allen", "Paul Acker", "Mike Torres", "Lisa Park",
  "Derek Evans", "Rachel Kim", "Tom Walker"
];
const initialsOf = (n: string) => n.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();

// 8-bit MEDDPICC patterns — index by ones-density
const m = (...bits: (0 | 1)[]) => bits;

export const deals: DealRow[] = [
  {
    id: "d1", name: "Stripe", account: "Stripe, Inc.", owner: "Sarah Chen", ownerInitials: "SC",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Proposal", stageProgress: { done: 1, total: 4 },
    amount: 200000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-04-28", closeAtRisk: true,
    meddpicc: m(1,1,1,1,1,1,0,0), nextStep: "Send revised proposal with requested terms", priority: "High", health: "medium"
  },
  {
    id: "d2", name: "Snowflake", account: "Snowflake Inc.", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Proposal", stageProgress: { done: 3, total: 5 },
    amount: 120000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-06-11", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Next meeting with CFO", priority: "Medium", health: "high"
  },
  {
    id: "d3", name: "Datadog, Inc.", account: "Datadog, Inc.", owner: "Paul Acker", ownerInitials: "PA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Negotiation", stageProgress: { done: 4, total: 5 },
    amount: 110000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-06-18", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Deliver ROI deck & phased-payment plan", priority: "High", health: "high"
  },
  {
    id: "d4", name: "Shopify", account: "Shopify Inc.", owner: "Mike Torres", ownerInitials: "MT",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Negotiation", stageProgress: { done: 4, total: 5 },
    amount: 350000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-06-21", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Next meeting: Technical Q&A with security team", priority: "High", health: "high"
  },
  {
    id: "d5", name: "Rivian Automotive", account: "Rivian Automotive", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Proposal", stageProgress: { done: 3, total: 5 },
    amount: 130000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-06-26", closeAtRisk: false,
    meddpicc: m(1,1,0,1,1,1,1,1), nextStep: "Blocked: CFO unavailable until next week", priority: "Medium", health: "medium"
  },
  {
    id: "d6", name: "NextEra", account: "NextEra Energy", owner: "Paul Acker", ownerInitials: "PA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Demo", stageProgress: { done: 2, total: 5 },
    amount: 90000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-07-11", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Email exec demo recording & ROI summary", priority: "Medium", health: "high"
  },
  {
    id: "d7", name: "Siemens", account: "Siemens AG", owner: "Lisa Park", ownerInitials: "LP",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Negotiation", stageProgress: { done: 4, total: 5 },
    amount: 250000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-07-06", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Next meeting: Legal alignment", priority: "High", health: "high"
  },
  {
    id: "d8", name: "Lockheed", account: "Lockheed Martin", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Proposal", stageProgress: { done: 3, total: 5 },
    amount: 140000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-07-09", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Send red-lined MSA to customer counsel", priority: "Medium", health: "high"
  },
  {
    id: "d9", name: "Telstra", account: "Telstra Group Ltd.", owner: "Paul Acker", ownerInitials: "PA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Proposal", stageProgress: { done: 3, total: 5 },
    amount: 85000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-07-13", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Blocked: Security team reviewing", priority: "Medium", health: "medium"
  },
  {
    id: "d10", name: "MongoDB", account: "MongoDB, Inc.", owner: "Sarah Chen", ownerInitials: "SC",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Demo", stageProgress: { done: 2, total: 5 },
    amount: 200000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-07-19", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Provide sandbox credentials & training", priority: "High", health: "high"
  },
  {
    id: "d11", name: "Cloudflare", account: "Cloudflare, Inc.", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Proposal", stageProgress: { done: 3, total: 5 },
    amount: 125000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-07-02", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Next meeting: Integration workshop", priority: "Medium", health: "high"
  },
  {
    id: "d12", name: "Vercel", account: "Vercel Inc.", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Mid-Market sales", segment: "Mid-Market", stage: "Demo", stageProgress: { done: 2, total: 5 },
    amount: 95000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-08-16", closeAtRisk: false,
    meddpicc: m(1,1,0,1,1,1,1,1), nextStep: "Next meeting: Follow-up demo", priority: "Medium", health: "high"
  },
  {
    id: "d13", name: "Linear", account: "Linear Software Inc.", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Mid-Market sales", segment: "Mid-Market", stage: "Proposal", stageProgress: { done: 3, total: 5 },
    amount: 100000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-07-01", closeAtRisk: false,
    meddpicc: m(0,1,1,1,1,1,1,1), nextStep: "Next meeting: Pricing alignment", priority: "Medium", health: "medium"
  },
  {
    id: "d14", name: "Patagonia", account: "Patagonia", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Closed Lost", stageProgress: { done: 1, total: 5 },
    amount: 60000, forecast: "Lost", forecastProb: 0, closeDate: "2026-04-21", closeAtRisk: true,
    meddpicc: m(1,0,0,0,0,0,1,0), nextStep: "Blocked: Internal post-mortem", priority: "Low", health: "low"
  },
  {
    id: "d15", name: "Comcast Corporation", account: "Comcast Corporation", owner: "Brad Allen", ownerInitials: "BA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Closed Lost", stageProgress: { done: 1, total: 5 },
    amount: 70000, forecast: "Lost", forecastProb: 0, closeDate: "2026-04-11", closeAtRisk: true,
    meddpicc: m(0,0,1,0,0,0,1,0), nextStep: "Blocked: Internal re-organisation", priority: "Low", health: "low"
  },
  {
    id: "d16", name: "Raytheon Technologies", account: "Raytheon Technologies", owner: "Derek Evans", ownerInitials: "DE",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Qualification", stageProgress: { done: 1, total: 5 },
    amount: 300000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-09-06", closeAtRisk: false,
    meddpicc: m(1,0,0,0,0,1,0,1), nextStep: "Blocked: Awaiting intro to economic buyer", priority: "High", health: "medium"
  },
  {
    id: "d17", name: "Tableau Software", account: "Tableau Software", owner: "Paul Acker", ownerInitials: "PA",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Closed Won", stageProgress: { done: 5, total: 5 },
    amount: 300000, forecast: "Won", forecastProb: 100, closeDate: "2026-04-26", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Share project kickoff agenda & SOW", priority: "High", health: "high"
  },
  {
    id: "d18", name: "Akamai", account: "Akamai Technologies", owner: "Mike Torres", ownerInitials: "MT",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Closed Won", stageProgress: { done: 5, total: 5 },
    amount: 450000, forecast: "Won", forecastProb: 100, closeDate: "2026-04-25", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Blocked: Awaiting countersignature", priority: "High", health: "high"
  },
  {
    id: "d19", name: "International Paper", account: "International Paper", owner: "Paul Acker", ownerInitials: "PA",
    pipeline: "Mid-Market sales", segment: "Mid-Market", stage: "Demo", stageProgress: { done: 2, total: 5 },
    amount: 80000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-08-02", closeAtRisk: false,
    meddpicc: m(1,1,0,1,1,1,1,1), nextStep: "Blocked: IT lead on leave; SSO demo deferred", priority: "Medium", health: "medium"
  },
  {
    id: "d20", name: "Sephora", account: "Sephora", owner: "Rachel Kim", ownerInitials: "RK",
    pipeline: "Mid-Market sales", segment: "Mid-Market", stage: "Discovery", stageProgress: { done: 3, total: 3 },
    amount: 65000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-08-22", closeAtRisk: false,
    meddpicc: m(1,1,0,1,1,0,1,1), nextStep: "Email detailed action plan & timeline", priority: "Medium", health: "high"
  },
  {
    id: "d21", name: "Latham & Watkins", account: "Latham & Watkins", owner: "Tom Walker", ownerInitials: "TW",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Discovery", stageProgress: { done: 2, total: 3 },
    amount: 220000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-09-14", closeAtRisk: false,
    meddpicc: m(1,1,1,1,0,1,1,0), nextStep: "Share detailed MEDDPICC qualification template", priority: "High", health: "medium"
  },
  {
    id: "d22", name: "HSBC", account: "HSBC Holdings", owner: "Lisa Park", ownerInitials: "LP",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Discovery", stageProgress: { done: 3, total: 3 },
    amount: 410000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-09-26", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,0), nextStep: "Deliver integration readiness questionnaire", priority: "High", health: "high"
  },
  {
    id: "d23", name: "GitLab Inc.", account: "GitLab Inc.", owner: "Sarah Chen", ownerInitials: "SC",
    pipeline: "Customer Success", segment: "Enterprise", stage: "Negotiation", stageProgress: { done: 3, total: 4 },
    amount: 180000, forecast: "Commit", forecastProb: 80, closeDate: "2026-05-22", closeAtRisk: false,
    meddpicc: m(1,1,1,1,1,1,1,1), nextStep: "Implement updated tracking tags", priority: "High", health: "high"
  },
  {
    id: "d24", name: "Boston Dynamics", account: "Boston Dynamics", owner: "Tom Walker", ownerInitials: "TW",
    pipeline: "Enterprise sales", segment: "Enterprise", stage: "Qualification", stageProgress: { done: 2, total: 2 },
    amount: 175000, forecast: "Pipeline", forecastProb: 25, closeDate: "2026-10-14", closeAtRisk: false,
    meddpicc: m(1,1,0,0,0,1,0,1), nextStep: "Schedule technical discovery call", priority: "Medium", health: "high"
  },
  {
    id: "d25", name: "Asana", account: "Asana", owner: "Rachel Kim", ownerInitials: "RK",
    pipeline: "Mid-Market sales", segment: "Mid-Market", stage: "Demo", stageProgress: { done: 4, total: 5 },
    amount: 75000, forecast: "Best Case", forecastProb: 50, closeDate: "2026-08-30", closeAtRisk: false,
    meddpicc: m(1,1,1,1,0,1,1,1), nextStep: "Provide data-loader demo with sample CSV", priority: "Medium", health: "high"
  },
];

// =====================================================================
// Pipelines / Stages config
// =====================================================================
export type StageConfig = {
  name: Stage;
  description: string;
  type: "Open" | "Closed/Won" | "Closed/Lost";
  probability: number;
  forecastCategory: ForecastCategory;
  outcomes: number;
  entryCriteria: number;
  exitCriteria: number;
};

export const stageConfig: StageConfig[] = [
  { name: "Qualification", description: "Assess if the lead meets criteria to enter the sales pipeline.", type: "Open", probability: 10, forecastCategory: "Pipeline", outcomes: 2, entryCriteria: 0, exitCriteria: 4 },
  { name: "Discovery",     description: "Uncover the prospect's needs, goals, and challenges.",            type: "Open", probability: 25, forecastCategory: "Pipeline", outcomes: 3, entryCriteria: 0, exitCriteria: 5 },
  { name: "Demo",          description: "Showcase how the product or service solves the prospect's problems.", type: "Open", probability: 40, forecastCategory: "Pipeline", outcomes: 6, entryCriteria: 0, exitCriteria: 8 },
  { name: "Proposal",      description: "Present a tailored solution with pricing and terms.",             type: "Open", probability: 60, forecastCategory: "Best Case", outcomes: 4, entryCriteria: 0, exitCriteria: 6 },
  { name: "Negotiation",   description: "Align on details, address objections, and finalize terms.",       type: "Open", probability: 80, forecastCategory: "Commit",    outcomes: 4, entryCriteria: 0, exitCriteria: 5 },
  { name: "Closed Won",    description: "Deal successfully completed with a signed agreement.",            type: "Closed/Won",  probability: 100, forecastCategory: "Won",  outcomes: 5, entryCriteria: 0, exitCriteria: 6 },
  { name: "Closed Lost",   description: "Opportunity did not convert and is no longer pursued.",           type: "Closed/Lost", probability: 0,   forecastCategory: "Omitted", outcomes: 5, entryCriteria: 0, exitCriteria: 5 },
];

// Customer Success lifecycle stages — separate from sales pipeline
export type CSStageConfig = {
  name: string;
  description: string;
  type: "Active" | "At Risk" | "Renewed";
  healthTarget: number;   // minimum health score to exit
  outcomes: number;
  exitCriteria: number;
  playbookActions: string[];
};

export const csStageConfig: CSStageConfig[] = [
  { name: "Onboarding",        description: "Customer signed; delivering initial setup, SSO, training, and first-value milestone.",   type: "Active",   healthTarget: 60,  outcomes: 4, exitCriteria: 5, playbookActions: ["SSO + provisioning", "Champion intro call", "Kickoff deck delivered", "First 1:1 scheduled", "Success plan signed off"] },
  { name: "Adoption",          description: "Core features deployed; tracking WAU/MAU trajectory toward contracted outcomes.",       type: "Active",   healthTarget: 70,  outcomes: 5, exitCriteria: 6, playbookActions: ["WAU/MAU baseline set", "Feature breadth review", "Training sessions completed", "QBR #1 delivered", "Outcome gaps logged", "Champion logins tracked"] },
  { name: "Value Realization",  description: "Customer is hitting or exceeding committed outcomes; ROI story is documentable.",       type: "Active",   healthTarget: 80,  outcomes: 4, exitCriteria: 4, playbookActions: ["ROI report drafted", "Success story captured", "Exec sponsor briefed", "Expansion signal assessed"] },
  { name: "Renewal Risk",      description: "Health score dropped, champion silent, or usage declining — renewal is in question.",   type: "At Risk",  healthTarget: 0,   outcomes: 5, exitCriteria: 5, playbookActions: ["Root-cause analysis", "Exec escalation email", "Remediation plan agreed", "Re-engagement cadence started", "Risk logged in Salesforce"] },
  { name: "Renewed",           description: "Contract renewed or multi-year signed. Transition back to Adoption or Value phase.",    type: "Renewed",  healthTarget: 0,   outcomes: 3, exitCriteria: 3, playbookActions: ["Renewal order in CRM", "Updated success plan", "Expansion conversation opened"] },
];

// =====================================================================
// Accounts
// =====================================================================
export type Tier      = "Strategic" | "Enterprise" | "Growth";
export type AIHealth  = "Healthy" | "Concerning" | "Cold" | "—";
export type Watchlist = "Renewal Likely" | "Upsell Likely" | "Watchlist";

export type Account = {
  id: string;
  name: string;
  domain: string;
  segment: "Enterprise" | "Mid-Market" | "SMB";
  tier: Tier;
  industry: string;
  employees: number;
  arr: number; // current ARR if customer; 0 if prospect
  status: "Customer" | "Prospect" | "Churned";
  owner: string;
  ownerInitials: string;
  openDeals: number;
  pipelineValue: number;
  lastTouch: string; // ISO
  health: Health;
  healthScore: number;        // 0-100
  nrr: number;                // % net revenue retention
  renewalDays: number;
  signal: string;             // one-line current signal
  qbrInDays: number;          // negative = overdue
  agendas1to1: number;        // count of agendas
  aiChat14d: number;          // count of AI assistant chats in last 14d
  aiHealth: AIHealth;
  watchlist?: Watchlist;
  eventTimeline: number[][];  // 5 rows × 8 cells (D/W/M/Q/H × time), 0-4 intensity
  hq: string;
};

// Reusable event-timeline patterns (5 rows × 8 cells)
const T = (...rows: number[][]) => rows;
const TL_HEALTHY: number[][] = T([2,2,3,3,3,3,3,3], [1,2,2,3,3,3,3,3], [0,1,1,2,3,3,3,3], [0,0,0,1,2,2,3,3], [0,0,0,0,0,1,2,2]);
const TL_WATCH:   number[][] = T([1,2,2,2,1,1,1,0], [0,1,2,2,2,1,1,1], [0,1,1,2,2,2,1,1], [0,0,1,1,2,2,2,1], [0,0,0,0,1,1,2,2]);
const TL_RISK:    number[][] = T([2,2,1,1,0,0,0,0], [1,1,1,0,0,0,0,0], [0,1,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0]);
const TL_ONBOARD: number[][] = T([0,0,0,1,1,2,2,3], [0,0,0,0,1,1,2,2], [0,0,0,0,0,0,1,2], [0,0,0,0,0,0,0,1], [0,0,0,0,0,0,0,0]);
const TL_GROWING: number[][] = T([3,3,3,3,3,3,4,4], [2,3,3,3,3,3,4,4], [1,2,2,3,3,3,4,4], [0,1,2,2,3,3,3,3], [0,0,0,1,1,2,3,3]);

// Alphard-style decorations applied per-account on top of the base data.
type Decoration = {
  tier?: Tier;
  healthScore?: number;
  nrr?: number;
  renewalDays?: number;
  signal?: string;
  qbrInDays?: number;
  agendas1to1?: number;
  aiChat14d?: number;
  aiHealth?: AIHealth;
  watchlist?: Watchlist;
  eventTimeline?: number[][];
};

const ACCOUNT_DECORATIONS: Record<string, Decoration> = {
  ac1:  { tier: "Strategic",  healthScore: 78, nrr:   0, renewalDays:  -1, signal: "Champion silent 14 days",          qbrInDays:   0, agendas1to1:  3, aiChat14d:  9, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac2:  { tier: "Strategic",  healthScore: 41, nrr:  92, renewalDays:  47, signal: "Stalled — sponsor silent 24 days",  qbrInDays:  -7, agendas1to1:  2, aiChat14d:  9, aiHealth: "Cold",       watchlist: "Watchlist",      eventTimeline: TL_RISK },
  ac3:  { tier: "Enterprise", healthScore: 84, nrr:   0, renewalDays:   0, signal: "ROI deck delivered, awaiting reply", qbrInDays:  21, agendas1to1:  6, aiChat14d: 28, aiHealth: "Healthy",    watchlist: "Renewal Likely", eventTimeline: TL_HEALTHY },
  ac4:  { tier: "Strategic",  healthScore: 88, nrr:   0, renewalDays:   0, signal: "Tech Q&A scheduled with security",   qbrInDays:  14, agendas1to1:  9, aiChat14d: 47, aiHealth: "Healthy",    watchlist: "Upsell Likely",  eventTimeline: TL_GROWING },
  ac5:  { tier: "Enterprise", healthScore: 64, nrr:   0, renewalDays:   0, signal: "CFO unavailable — twice deferred",   qbrInDays:  -3, agendas1to1:  3, aiChat14d: 12, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac6:  { tier: "Enterprise", healthScore: 87, nrr:   0, renewalDays:   0, signal: "Pilot extension confirmed",          qbrInDays:  18, agendas1to1:  8, aiChat14d: 44, aiHealth: "Healthy",    watchlist: "Upsell Likely",  eventTimeline: TL_HEALTHY },
  ac7:  { tier: "Strategic",  healthScore: 86, nrr:   0, renewalDays:   0, signal: "Legal redlines returned",            qbrInDays:  28, agendas1to1: 10, aiChat14d: 38, aiHealth: "Healthy",    watchlist: "Upsell Likely",  eventTimeline: TL_HEALTHY },
  ac8:  { tier: "Enterprise", healthScore: 84, nrr:   0, renewalDays:   0, signal: "MSA in customer counsel review",     qbrInDays:  35, agendas1to1:  6, aiChat14d: 22, aiHealth: "Healthy",    watchlist: "Renewal Likely", eventTimeline: TL_HEALTHY },
  ac9:  { tier: "Enterprise", healthScore: 62, nrr:   0, renewalDays:   0, signal: "Security team blocking",             qbrInDays:  -2, agendas1to1:  4, aiChat14d:  8, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac10: { tier: "Enterprise", healthScore: 90, nrr:   0, renewalDays:   0, signal: "Sandbox set, training booked",       qbrInDays:  21, agendas1to1: 11, aiChat14d: 41, aiHealth: "Healthy",    watchlist: "Upsell Likely",  eventTimeline: TL_HEALTHY },
  ac11: { tier: "Strategic",  healthScore: 88, nrr: 124, renewalDays: 178, signal: "Champion promoted — expansion door", qbrInDays:  14, agendas1to1: 12, aiChat14d: 71, aiHealth: "Healthy",    watchlist: "Upsell Likely",  eventTimeline: TL_GROWING },
  ac12: { tier: "Growth",     healthScore: 80, nrr:   0, renewalDays:   0, signal: "Follow-up demo booked",              qbrInDays:  21, agendas1to1:  4, aiChat14d: 18, aiHealth: "Healthy",    watchlist: "Renewal Likely", eventTimeline: TL_HEALTHY },
  ac13: { tier: "Growth",     healthScore: 60, nrr:   0, renewalDays:   0, signal: "Pricing alignment pending",          qbrInDays:  14, agendas1to1:  3, aiChat14d:  9, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac14: { tier: "Enterprise", healthScore: 22, nrr:   0, renewalDays: -19, signal: "Closed Lost — internal post-mortem", qbrInDays: -19, agendas1to1:  0, aiChat14d:  0, aiHealth: "Cold",                                       eventTimeline: TL_RISK },
  ac15: { tier: "Strategic",  healthScore: 30, nrr:   0, renewalDays: -22, signal: "Closed Lost — re-organisation",      qbrInDays: -22, agendas1to1:  1, aiChat14d:  3, aiHealth: "Cold",       watchlist: "Watchlist",      eventTimeline: TL_RISK },
  ac16: { tier: "Strategic",  healthScore: 70, nrr:   0, renewalDays:   0, signal: "Awaiting EB intro",                  qbrInDays:   7, agendas1to1:  3, aiChat14d: 11, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac17: { tier: "Strategic",  healthScore: 90, nrr: 134, renewalDays: 220, signal: "Hiring 4 ML eng — gov gap flagged",  qbrInDays:  21, agendas1to1: 10, aiChat14d: 62, aiHealth: "Healthy",    watchlist: "Upsell Likely",  eventTimeline: TL_GROWING },
  ac18: { tier: "Strategic",  healthScore: 86, nrr: 118, renewalDays: 210, signal: "QBR overdue 14d",                    qbrInDays: -14, agendas1to1:  5, aiChat14d: 28, aiHealth: "Concerning", watchlist: "Renewal Likely", eventTimeline: TL_WATCH },
  ac19: { tier: "Growth",     healthScore: 65, nrr:   0, renewalDays:   0, signal: "IT lead on leave",                    qbrInDays:  -1, agendas1to1:  2, aiChat14d:  6, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac20: { tier: "Growth",     healthScore: 84, nrr:   0, renewalDays:   0, signal: "ABR campaign kickoff this week",     qbrInDays:  10, agendas1to1:  5, aiChat14d: 18, aiHealth: "Healthy",    watchlist: "Renewal Likely", eventTimeline: TL_HEALTHY },
  ac21: { tier: "Enterprise", healthScore: 70, nrr:   0, renewalDays:   0, signal: "MEDDPICC template trial agreed",     qbrInDays:  14, agendas1to1:  4, aiChat14d: 14, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac22: { tier: "Strategic",  healthScore: 91, nrr:   0, renewalDays:   0, signal: "Phase 1 buy-in secured",             qbrInDays:  35, agendas1to1: 11, aiChat14d: 56, aiHealth: "Healthy",    watchlist: "Upsell Likely",  eventTimeline: TL_HEALTHY },
  ac23: { tier: "Enterprise", healthScore: 64, nrr:  98, renewalDays:  64, signal: "WAU/MAU dropped 0.62 → 0.48",        qbrInDays:  -3, agendas1to1:  4, aiChat14d: 14, aiHealth: "Concerning", watchlist: "Watchlist",      eventTimeline: TL_WATCH },
  ac24: { tier: "Enterprise", healthScore: 82, nrr:   0, renewalDays:   0, signal: "Tech discovery scheduled",           qbrInDays:  21, agendas1to1:  6, aiChat14d: 22, aiHealth: "Healthy",    watchlist: "Renewal Likely", eventTimeline: TL_HEALTHY },
  ac25: { tier: "Growth",     healthScore: 80, nrr:   0, renewalDays:   0, signal: "Sample CSV demo requested",          qbrInDays:  14, agendas1to1:  3, aiChat14d: 12, aiHealth: "Healthy",    watchlist: "Renewal Likely", eventTimeline: TL_HEALTHY },
};

const TL_FOR_HEALTH: Record<Health, number[][]> = {
  high: TL_HEALTHY,
  medium: TL_WATCH,
  low: TL_RISK,
};

type AccountSeed = Omit<Account, "tier" | "healthScore" | "nrr" | "renewalDays" | "signal" | "qbrInDays" | "agendas1to1" | "aiChat14d" | "aiHealth" | "watchlist" | "eventTimeline">;

const accountSeeds: AccountSeed[] = [
  { id: "ac1",  name: "Stripe, Inc.", domain: "stripe.com", segment: "Enterprise", industry: "Manufacturing",       employees: 1200, arr: 0,      status: "Prospect", owner: "Sarah Chen",   ownerInitials: "SC", openDeals: 1, pipelineValue: 200000, lastTouch: "2026-04-29", health: "medium", hq: "Scranton, PA" },
  { id: "ac2",  name: "Snowflake Inc.",  domain: "snowflake.com",    segment: "Enterprise", industry: "Software",            employees:  900, arr: 480000, status: "Customer", owner: "Brad Allen",   ownerInitials: "BA", openDeals: 1, pipelineValue: 120000, lastTouch: "2026-04-28", health: "low",    hq: "San Francisco, CA" },
  { id: "ac3",  name: "Datadog, Inc.",           domain: "datadoghq.com",          segment: "Enterprise", industry: "Data & Analytics",    employees:  340, arr:  0,     status: "Prospect", owner: "Paul Acker",   ownerInitials: "PA", openDeals: 1, pipelineValue: 110000, lastTouch: "2026-04-27", health: "high",   hq: "London, UK" },
  { id: "ac4",  name: "Shopify Inc.", domain: "shopify.com",      segment: "Enterprise", industry: "Logistics",           employees: 4200, arr:  0,     status: "Prospect", owner: "Mike Torres",  ownerInitials: "MT", openDeals: 1, pipelineValue: 350000, lastTouch: "2026-04-26", health: "high",   hq: "Chicago, IL" },
  { id: "ac5",  name: "Rivian Automotive",                domain: "rivian.com",         segment: "Enterprise", industry: "Automotive",          employees: 2100, arr:  0,     status: "Prospect", owner: "Brad Allen",   ownerInitials: "BA", openDeals: 1, pipelineValue: 130000, lastTouch: "2026-04-22", health: "medium", hq: "Austin, TX" },
  { id: "ac6",  name: "NextEra Energy",          domain: "nexteraenergy.com",     segment: "Enterprise", industry: "Energy",              employees: 5600, arr:  0,     status: "Prospect", owner: "Paul Acker",   ownerInitials: "PA", openDeals: 1, pipelineValue:  90000, lastTouch: "2026-04-25", health: "high",   hq: "Seattle, WA" },
  { id: "ac7",  name: "Siemens AG",         domain: "siemens.com",      segment: "Enterprise", industry: "Industrial",          employees: 1800, arr:  0,     status: "Prospect", owner: "Lisa Park",    ownerInitials: "LP", openDeals: 1, pipelineValue: 250000, lastTouch: "2026-04-24", health: "high",   hq: "Munich, DE" },
  { id: "ac8",  name: "Lockheed Martin",             domain: "lockheedmartin.com",      segment: "Enterprise", industry: "Aerospace",           employees: 8200, arr:  0,     status: "Prospect", owner: "Brad Allen",   ownerInitials: "BA", openDeals: 1, pipelineValue: 140000, lastTouch: "2026-04-23", health: "high",   hq: "Boston, MA" },
  { id: "ac9",  name: "Telstra Group Ltd.",      domain: "telstra.com.au",      segment: "Enterprise", industry: "Telecom",             employees: 1500, arr:  0,     status: "Prospect", owner: "Paul Acker",   ownerInitials: "PA", openDeals: 1, pipelineValue:  85000, lastTouch: "2026-04-22", health: "medium", hq: "Sydney, AU" },
  { id: "ac10", name: "MongoDB, Inc.",             domain: "mongodb.com",     segment: "Enterprise", industry: "Data & Analytics",    employees: 2700, arr:  0,     status: "Prospect", owner: "Sarah Chen",   ownerInitials: "SC", openDeals: 1, pipelineValue: 200000, lastTouch: "2026-04-21", health: "high",   hq: "New York, NY" },
  { id: "ac11", name: "Cloudflare, Inc.",        domain: "cloudflare.com",      segment: "Enterprise", industry: "Cloud Infrastructure",employees: 3400, arr: 720000, status: "Customer", owner: "Brad Allen",   ownerInitials: "BA", openDeals: 1, pipelineValue: 125000, lastTouch: "2026-04-20", health: "high",   hq: "Denver, CO" },
  { id: "ac12", name: "Vercel Inc.",   domain: "vercel.com",     segment: "Mid-Market", industry: "Software",            employees:  120, arr:  0,     status: "Prospect", owner: "Brad Allen",   ownerInitials: "BA", openDeals: 1, pipelineValue:  95000, lastTouch: "2026-04-19", health: "high",   hq: "Palo Alto, CA" },
  { id: "ac13", name: "Linear Software Inc.",        domain: "linear.app",      segment: "Mid-Market", industry: "Software",            employees:  240, arr:  0,     status: "Prospect", owner: "Brad Allen",   ownerInitials: "BA", openDeals: 1, pipelineValue: 100000, lastTouch: "2026-04-18", health: "medium", hq: "Toronto, CA" },
  { id: "ac14", name: "Patagonia",           domain: "patagonia.com",    segment: "Enterprise", industry: "Sustainability",      employees:  600, arr:  0,     status: "Churned",  owner: "Brad Allen",   ownerInitials: "BA", openDeals: 0, pipelineValue:      0, lastTouch: "2026-04-12", health: "low",    hq: "Portland, OR" },
  { id: "ac15", name: "Comcast Corporation",             domain: "comcast.com",  segment: "Enterprise", industry: "Media",               employees: 9800, arr:  0,     status: "Churned",  owner: "Brad Allen",   ownerInitials: "BA", openDeals: 0, pipelineValue:      0, lastTouch: "2026-04-08", health: "low",    hq: "New York, NY" },
  { id: "ac16", name: "Raytheon Technologies",          domain: "rtx.com",segment: "Enterprise",industry: "Defense",             employees: 12500,arr:  0,     status: "Prospect", owner: "Derek Evans",  ownerInitials: "DE", openDeals: 1, pipelineValue: 300000, lastTouch: "2026-04-15", health: "medium", hq: "Malibu, CA" },
  { id: "ac17", name: "Tableau Software",         domain: "tableau.com",        segment: "Enterprise", industry: "Data & Analytics",    employees: 1200, arr: 360000, status: "Customer", owner: "Paul Acker",   ownerInitials: "PA", openDeals: 0, pipelineValue:      0, lastTouch: "2026-04-26", health: "high",   hq: "Austin, TX" },
  { id: "ac18", name: "Akamai Technologies",         domain: "akamai.com",        segment: "Enterprise", industry: "Networking",          employees:  870, arr: 540000, status: "Customer", owner: "Mike Torres",  ownerInitials: "MT", openDeals: 0, pipelineValue:      0, lastTouch: "2026-04-25", health: "high",   hq: "Atlanta, GA" },
  { id: "ac19", name: "International Paper",              domain: "internationalpaper.com",   segment: "Mid-Market", industry: "Manufacturing",       employees:  140, arr:  0,     status: "Prospect", owner: "Paul Acker",   ownerInitials: "PA", openDeals: 1, pipelineValue:  80000, lastTouch: "2026-04-17", health: "medium", hq: "Buffalo, NY" },
  { id: "ac20", name: "Sephora",             domain: "sephora.com",        segment: "Mid-Market", industry: "Retail",              employees:  380, arr:  0,     status: "Prospect", owner: "Rachel Kim",   ownerInitials: "RK", openDeals: 1, pipelineValue:  65000, lastTouch: "2026-04-16", health: "high",   hq: "Los Angeles, CA" },
  { id: "ac21", name: "Latham & Watkins",           domain: "lw.com",segment: "Enterprise", industry: "Legal",               employees:  640, arr:  0,     status: "Prospect", owner: "Tom Walker",   ownerInitials: "TW", openDeals: 1, pipelineValue: 220000, lastTouch: "2026-04-14", health: "medium", hq: "New York, NY" },
  { id: "ac22", name: "HSBC Holdings",            domain: "hsbc.com",      segment: "Enterprise", industry: "Financial Services",  employees: 6700, arr:  0,     status: "Prospect", owner: "Lisa Park",    ownerInitials: "LP", openDeals: 1, pipelineValue: 410000, lastTouch: "2026-04-13", health: "high",   hq: "London, UK" },
  { id: "ac23", name: "GitLab Inc.",            domain: "gitlab.com",         segment: "Enterprise", industry: "Software",            employees: 1100, arr: 280000, status: "Customer", owner: "Sarah Chen",   ownerInitials: "SC", openDeals: 1, pipelineValue: 180000, lastTouch: "2026-04-22", health: "medium", hq: "Berlin, DE" },
  { id: "ac24", name: "Boston Dynamics",             domain: "bostondynamics.com",  segment: "Enterprise", industry: "Robotics",            employees: 1900, arr:  0,     status: "Prospect", owner: "Tom Walker",   ownerInitials: "TW", openDeals: 1, pipelineValue: 175000, lastTouch: "2026-04-11", health: "high",   hq: "Pittsburgh, PA" },
  { id: "ac25", name: "Asana",                   domain: "asana.com",       segment: "Mid-Market", industry: "Software",            employees:  220, arr:  0,     status: "Prospect", owner: "Rachel Kim",   ownerInitials: "RK", openDeals: 1, pipelineValue:  75000, lastTouch: "2026-04-10", health: "high",   hq: "Houston, TX" },
];

const tierFor = (s: AccountSeed): Tier =>
  s.segment === "Enterprise" ? "Enterprise" : s.segment === "Mid-Market" ? "Growth" : "Growth";

export const accounts: Account[] = accountSeeds.map((s) => {
  const d = ACCOUNT_DECORATIONS[s.id] ?? {};
  return {
    ...s,
    tier:          d.tier          ?? tierFor(s),
    healthScore:   d.healthScore   ?? (s.health === "high" ? 85 : s.health === "medium" ? 65 : 35),
    nrr:           d.nrr           ?? (s.status === "Customer" ? 110 : 0),
    renewalDays:   d.renewalDays   ?? 0,
    signal:        d.signal        ?? "—",
    qbrInDays:     d.qbrInDays     ?? 30,
    agendas1to1:   d.agendas1to1   ?? 5,
    aiChat14d:     d.aiChat14d     ?? 20,
    aiHealth:      d.aiHealth      ?? "Healthy",
    watchlist:     d.watchlist,
    eventTimeline: d.eventTimeline ?? TL_FOR_HEALTH[s.health],
  };
});

// =====================================================================
// Calls
// =====================================================================
export type Call = {
  id: string;
  contact: string;
  account: string;
  rep: string;
  repInitials: string;
  direction: "inbound" | "outbound";
  outcome: "Connected" | "Voicemail" | "No answer";
  date: string;
  time: string;
  duration: number; // seconds
  topic: string;
  sentiment: "positive" | "neutral" | "negative";
};

export const calls: Call[] = [
  { id: "c1",  contact: "Christine Pettett", account: "Stripe",       rep: "Sarah Chen",  repInitials: "SC", direction: "outbound", outcome: "Connected",   date: "2026-04-29", time: "10:14 AM", duration: 1840, topic: "Pricing alignment for Phase 1", sentiment: "neutral"  },
  { id: "c2",  contact: "Tom Walker",        account: "Raytheon Technologies",     rep: "Derek Evans", repInitials: "DE", direction: "inbound",  outcome: "Connected",   date: "2026-04-28", time: "03:42 PM", duration:  920, topic: "Discovery: integration scope",  sentiment: "positive" },
  { id: "c3",  contact: "Mandy Moore",        account: "GitLab Inc.",       rep: "Sarah Chen",  repInitials: "SC", direction: "outbound", outcome: "Connected",   date: "2026-04-28", time: "01:00 PM", duration: 2210, topic: "Renewal expansion check",      sentiment: "positive" },
  { id: "c4",  contact: "Louis Litt",         account: "Latham & Watkins",      rep: "Tom Walker",  repInitials: "TW", direction: "outbound", outcome: "Voicemail",   date: "2026-04-27", time: "11:25 AM", duration:   45, topic: "Follow-up on legal redlines",   sentiment: "neutral"  },
  { id: "c5",  contact: "Greg Griphook",      account: "HSBC Holdings",       rep: "Lisa Park",   repInitials: "LP", direction: "outbound", outcome: "Connected",   date: "2026-04-26", time: "04:30 PM", duration: 1610, topic: "Integration readiness review", sentiment: "neutral"  },
  { id: "c6",  contact: "Eric Cartman",       account: "Shopify",  rep: "Mike Torres", repInitials: "MT", direction: "inbound",  outcome: "Connected",   date: "2026-04-26", time: "09:05 AM", duration:  730, topic: "Security questionnaire walkthrough", sentiment: "negative" },
  { id: "c7",  contact: "Sandra Lewis",       account: "Stripe",       rep: "Sarah Chen",  repInitials: "SC", direction: "outbound", outcome: "Connected",   date: "2026-04-25", time: "02:48 PM", duration: 1320, topic: "Onboarding metrics dashboard",  sentiment: "positive" },
  { id: "c8",  contact: "David Wallace",      account: "Stripe",       rep: "Sarah Chen",  repInitials: "SC", direction: "outbound", outcome: "No answer",   date: "2026-04-24", time: "11:10 AM", duration:   12, topic: "Re-engage Economic Buyer",      sentiment: "neutral"  },
  { id: "c9",  contact: "Pam Beasley",         account: "Stripe",       rep: "Sarah Chen",  repInitials: "SC", direction: "outbound", outcome: "Connected",   date: "2026-04-24", time: "10:00 AM", duration:  870, topic: "Q1 budget timeline",            sentiment: "positive" },
  { id: "c10", contact: "Aria Montgomery",    account: "Stripe",       rep: "Sarah Chen",  repInitials: "SC", direction: "outbound", outcome: "Connected",   date: "2026-04-23", time: "03:00 PM", duration: 1995, topic: "Technical architecture review", sentiment: "positive" },
  { id: "c11", contact: "Lukas Becker",       account: "NextEra",            rep: "Paul Acker",  repInitials: "PA", direction: "outbound", outcome: "Connected",   date: "2026-04-23", time: "01:30 PM", duration: 1410, topic: "Pilot extension check-in",      sentiment: "positive" },
  { id: "c12", contact: "Jim Halpert",        account: "Stripe",       rep: "Sarah Chen",  repInitials: "SC", direction: "outbound", outcome: "Voicemail",   date: "2026-04-22", time: "09:45 AM", duration:   38, topic: "Trial extension follow-up",     sentiment: "neutral"  },
];

// =====================================================================
// Saved Reports / Library
// =====================================================================
export type SavedReport = {
  id: string;
  title: string;
  type: "Forecast" | "Pipeline" | "Coaching" | "Risk" | "Custom";
  owner: string;
  lastRun: string;
  schedule: "Manual" | "Daily" | "Weekly" | "Monthly";
  shared: boolean;
};

export const reports: SavedReport[] = [
  { id: "r1", title: "Quarterly forecast accuracy",  type: "Forecast", owner: "Adriana Smith", lastRun: "2026-04-28", schedule: "Weekly",  shared: true  },
  { id: "r2", title: "At-risk deals · Enterprise",   type: "Risk",     owner: "Ishan Chhabra", lastRun: "2026-04-29", schedule: "Daily",   shared: true  },
  { id: "r3", title: "Win rate by segment",           type: "Pipeline", owner: "Adriana Smith", lastRun: "2026-04-25", schedule: "Weekly",  shared: false },
  { id: "r4", title: "Champion-silent deals (>7d)",   type: "Risk",     owner: "Ishan Chhabra", lastRun: "2026-04-29", schedule: "Daily",   shared: true  },
  { id: "r5", title: "Coaching focus · Brad Allen",   type: "Coaching", owner: "Adriana Smith", lastRun: "2026-04-27", schedule: "Weekly",  shared: false },
  { id: "r6", title: "Pipeline coverage by manager",  type: "Pipeline", owner: "Adriana Smith", lastRun: "2026-04-29", schedule: "Daily",   shared: true  },
  { id: "r7", title: "Stage aging > SLA",             type: "Custom",   owner: "Ishan Chhabra", lastRun: "2026-04-29", schedule: "Daily",   shared: true  },
  { id: "r8", title: "MEDDPICC completeness trend",   type: "Coaching", owner: "Ishan Chhabra", lastRun: "2026-04-26", schedule: "Weekly",  shared: false },
];

export type SavedConversation = {
  id: string;
  title: string;
  preview: string;
  when: string;
  pinned: boolean;
};

export const savedConversations: SavedConversation[] = [
  { id: "lib1", title: "Why is Stripe slipping?",        preview: "Three blockers — economic buyer disengaged, legal redlines pending, references not yet conducted.", when: "Today",     pinned: true  },
  { id: "lib2", title: "Top 5 deals by Most Likely forecast",   preview: "Akamai $450K, Shopify $350K, Tableau $300K, Raytheon $300K, Siemens $250K.",                  when: "Yesterday", pinned: true  },
  { id: "lib3", title: "Coaching focus for Brad Allen",         preview: "Pricing & ROI 2/5 across last 4 calls. Pair with Lisa Park's discovery deck.",                       when: "2 days ago", pinned: false },
  { id: "lib4", title: "Champion-silent deals this week",        preview: "Latham & Watkins, Shopify, Rivian — all 7+ days since champion contact.",                            when: "3 days ago", pinned: false },
  { id: "lib5", title: "Compare Gong and Clari positioning",     preview: "Gong wins on incumbency; Alphard wins on autonomous action and CRM writeback.",                       when: "1 wk ago",   pinned: false },
];

// =====================================================================
// Activities (Meetings) — mock list
// =====================================================================
export type Meeting = {
  id: string;
  title: string;
  date: string; // ISO
  time: string;
  duration: number;
  with: "Prospect" | "Customer" | "Candidate" | "Colleague";
  nextStep: string;
  summary: string;
};

export const meetings: Meeting[] = [
  { id: "m1", title: "Alphard <> Stripe: Proposal Review", date: "2026-04-12", time: "10:30 AM", duration: 30, with: "Prospect", nextStep: "Send revised proposal to Jim Halpert", summary: "First proposal reviewed by executive team and Phase 1 defined." },
  { id: "m2", title: "Sephora <> Alphard: ABR Campaign Kickoff", date: "2026-04-11", time: "01:00 PM", duration: 40, with: "Customer", nextStep: "Email detailed action plan & timeline to Molly and team.", summary: "Molly wants to fix CRM integration issues and kick off the ABR campaign." },
  { id: "m3", title: "Interview <> Customer Success Manager",  date: "2026-04-12", time: "03:00 PM", duration: 30, with: "Candidate", nextStep: "Confirm Greg's availability and send calendar invite to Robert.", summary: "Robert is a strong candidate and has been moved to next stage for an interview with Greg." },
  { id: "m4", title: "Derek & William: Pricing Strategy",       date: "2026-04-11", time: "02:00 PM", duration: 20, with: "Colleague", nextStep: "Create a new pricing matrix with discounts.", summary: "Three-tier pricing system needs to be created to incentivize annual commitment." },
  { id: "m5", title: "Alphard <> Raytheon Technologies: Introduction",  date: "2026-04-16", time: "02:00 PM", duration: 45, with: "Prospect", nextStep: "Schedule demo of Meeting Assistant for VP Procurement", summary: "Initial scoping call to map integration points and validate pilot timeline." },
  { id: "m6", title: "Alphard <> Latham & Watkins: Discovery",      date: "2026-04-18", time: "11:00 AM", duration: 30, with: "Prospect", nextStep: "Share detailed MEDDPICC qualification template with Louis Litt", summary: "Confirmed priority fields and pain drivers; agreed to trial auto-capture of MEDDPICC data." },
  { id: "m7", title: "Alphard <> HSBC: Alignment Call",       date: "2026-04-20", time: "04:00 PM", duration: 35, with: "Prospect", nextStep: "Deliver integration readiness questionnaire to Greg Griphook", summary: "Discussed connectivity with Salesforce and Gong, and secured buy-in for Phase 1 rollout." },
  { id: "m8", title: "GitLab Inc. <> Oliv Campaign",          date: "2026-04-22", time: "10:00 AM", duration: 40, with: "Customer", nextStep: "Implement updated tracking tags and share performance dashboard.", summary: "Reviewed early recovery metrics and identified two key segments to optimize next." },
  { id: "m9", title: "Derek & William: Revenue Ops Sync",       date: "2026-04-19", time: "09:30 AM", duration: 25, with: "Colleague", nextStep: "Finalize consumption-based pricing proposal for exec review", summary: "Agreed on usage metrics definitions and next steps for billing system updates." },
  { id: "m10", title: "Go-to-Market Strategy Workshop",          date: "2026-04-21", time: "03:00 PM", duration: 60, with: "Colleague", nextStep: "Draft GTM playbook outline and circulate to marketing team", summary: "Identified key verticals and channel partners to target in Q3 launch plans." },
];

// =====================================================================
// Agents library
// =====================================================================
export type Agent = {
  id: string;
  name: string;
  role: "Sales" | "Revenue Operations" | "Customer Success";
  installed: boolean;
  ours: boolean;
  description: string;
};

export const agents: Agent[] = [
  { id: "a1", name: "Dylan, the Multithreader",       role: "Sales", installed: true,  ours: true,  description: "Helps AEs multithread into active opportunities at Proposal to keep momentum." },
  { id: "a2", name: "Max, the Momentum Reviver",      role: "Sales", installed: true,  ours: true,  description: "Your sidekick that revives stalled opportunities the moment fresh budget hits your accounts." },
  { id: "a3", name: "Jackie, the Pre-Meeting Prepper",role: "Sales", installed: true,  ours: true,  description: "Builds sharp call briefs from calendar, CRM, and LinkedIn so you walk in with angles and questions." },
  { id: "a4", name: "Eli, the Enrichment Agent",      role: "Revenue Operations", installed: true,  ours: false, description: "Auto-enriches new leads/contacts with firmographics and roles, de-dupes, and fills CRM fields." },
  { id: "a5", name: "Nova, the Follow-Up Finisher",   role: "Sales", installed: false, ours: false, description: "Drafts personalized post-call emails, logs next steps, and schedules tasks in CRM." },
  { id: "a6", name: "Aria, the Objection Handler",    role: "Sales", installed: false, ours: false, description: "Spots objections in calls/emails and drafts tailored responses with proof points and assets." },
  { id: "a7", name: "Bruno, the Proposal Polisher",   role: "Sales", installed: false, ours: false, description: "Generates proposal value recaps and exec cover notes; flags gaps before you hit send." },
  { id: "a8", name: "Soren, the Exec Door-Opener",    role: "Sales", installed: false, ours: false, description: "Finds the Economic Buyer and crafts executive-level outreach to secure the next meeting." },
  { id: "a9", name: "Lena, the Battlecard Builder",   role: "Revenue Operations", installed: false, ours: false, description: "Maintains live competitive battlecards from won/lost-call signals." },
  { id: "a10", name: "Quinn, the Hygiene Hawk",       role: "Revenue Operations", installed: false, ours: false, description: "Continuous CRM data hygiene — missing fields, stale records, ownership rot." },
  { id: "a11", name: "Veda, the Forecast Whisperer",  role: "Revenue Operations", installed: false, ours: false, description: "Surfaces deals that should move forecast categories before the manager review." },
  { id: "a12", name: "Content Curator",                role: "Sales", installed: false, ours: false, description: "Recommends the right asset for the right deal moment." },
  // Customer Success agents
  { id: "cs1", name: "Renewal Risk Monitor",   role: "Customer Success", installed: true,  ours: true,  description: "Tracks renewal health across your book — flags accounts where score drops >8pts, champion goes silent, or renewal is <60 days away." },
  { id: "cs2", name: "Adoption Watchdog",      role: "Customer Success", installed: true,  ours: true,  description: "Monitors WAU/MAU, feature engagement, and seat utilization. Fires when adoption signals diverge from expected trajectory." },
  { id: "cs3", name: "Outcomes Tracker",       role: "Customer Success", installed: true,  ours: true,  description: "Correlates product usage with committed customer outcomes. Surfaces gaps before your next QBR so nothing is a surprise." },
  { id: "cs4", name: "QBR Composer",           role: "Customer Success", installed: false, ours: true,  description: "Assembles QBR decks from Mixpanel, Zendesk, and outcomes data — export-ready in one click, branded to each account." },
  { id: "cs5", name: "Signals Scout",          role: "Customer Success", installed: false, ours: true,  description: "Scans LinkedIn, job boards, and call transcripts for org changes, hiring signals, and exec moves across your customer book." },
];

// =====================================================================
// People (team performance)
// =====================================================================
export type Rep = {
  id: string;
  name: string;
  initials: string;
  achieved: number;
  target: number;
  openDeals: number;
  pipeline: number;
  forecast: number;
};

export const team: Rep[] = [
  { id: "r1", name: "Cassandra Rivers", initials: "CR", achieved: 301000, target: 650000, openDeals: 45, pipeline: 1350000, forecast: 540000 },
  { id: "r2", name: "James Smith",      initials: "JS", achieved: 249000, target: 460000, openDeals: 32, pipeline:  960000, forecast: 384000 },
  { id: "r3", name: "Laura Thompson",   initials: "LT", achieved: 271000, target: 410000, openDeals: 28, pipeline:  840000, forecast: 336000 },
  { id: "r4", name: "Ryan Miller",      initials: "RM", achieved: 412000, target: 690000, openDeals: 48, pipeline: 1440000, forecast: 576000 },
  { id: "r5", name: "Grace Simmons",    initials: "GS", achieved: 313000, target: 580000, openDeals: 40, pipeline: 1200000, forecast: 480000 },
  { id: "r6", name: "Avery Brooks",     initials: "AB", achieved: 220000, target: 480000, openDeals: 33, pipeline:  990000, forecast: 396000 },
];

// =====================================================================
// Forecast roll-up (per-manager)
// =====================================================================
export type ManagerForecast = {
  id: string;
  name: string;
  initials: string;
  region: string;
  attainment: number;
  target: number;
  coverage: number;
  coverageDelta: number;
  commit: number;
  commitDeals: number;
  commitDelta: number;
  mostLikely: number;
  mostLikelyDelta: number;
  bestCase: number;
  bestCaseDelta: number;
};

export const managers: ManagerForecast[] = [
  { id: "f1", name: "Brian Davis",   initials: "BD", region: "Sales Manager, North America", attainment: 900000, target: 1500000, coverage: 3.57, coverageDelta:  2,   commit: 1500000, commitDeals: 5, commitDelta:  1, mostLikely: 2000000, mostLikelyDelta:  2, bestCase: 2000000, bestCaseDelta:  4 },
  { id: "f2", name: "Maya Chen",     initials: "MC", region: "Sales Manager, EMEA",          attainment: 850000, target: 1400000, coverage: 3.25, coverageDelta: -3,   commit: 1500000, commitDeals: 5, commitDelta: -1, mostLikely: 1500000, mostLikelyDelta:  1, bestCase: 2000000, bestCaseDelta:  2 },
  { id: "f3", name: "Carlos Mendoza",initials: "CM", region: "Sales Manager, LATAM",         attainment: 550000, target: 1100000, coverage: 3.9,  coverageDelta:  5,   commit: 1500000, commitDeals: 5, commitDelta:  2, mostLikely: 1500000, mostLikelyDelta:  3, bestCase: 1500000, bestCaseDelta:  4 },
  { id: "f4", name: "Aisha Khan",    initials: "AK", region: "Sales Manager, APAC",          attainment: 950000, target: 1600000, coverage: 3.1,  coverageDelta:  1,   commit: 1500000, commitDeals: 5, commitDelta:  2, mostLikely: 2000000, mostLikelyDelta:  3, bestCase: 2000000, bestCaseDelta:  5 },
  { id: "f5", name: "Liam O'Connor", initials: "LO", region: "Sales Manager, UK & Ireland",  attainment: 500000, target:  950000, coverage: 3.65, coverageDelta: -2,   commit:  900000, commitDeals: 5, commitDelta: -3, mostLikely: 1000000, mostLikelyDelta: -1, bestCase: 1500000, bestCaseDelta:  1 },
  { id: "f6", name: "Sophie Becker", initials: "SB", region: "Sales Manager, DACH",          attainment: 850000, target: 1300000, coverage: 3.45, coverageDelta:  2,   commit: 1500000, commitDeals: 5, commitDelta:  1, mostLikely: 1500000, mostLikelyDelta:  2, bestCase: 1500000, bestCaseDelta:  3 },
];

// =====================================================================
// Persona — drives home routing & defaults
// =====================================================================
export type Persona = "ae" | "am" | "csm" | "manager";

// =====================================================================
// Today Queue — single canonical "what needs my attention"
// =====================================================================
export type QueueKind = "risk" | "renewal" | "expansion" | "adoption" | "prep" | "deal";

export type QueueItem = {
  id: string;
  kind: QueueKind;
  account: string;
  /** "deal" or "account" — which surface to open */
  target: { type: "deal"; id: string } | { type: "account"; slug: string };
  headline: string;
  why: string;
  primary: string;
  secondary?: string;
  ago: string;
  due?: string;
  overdue?: boolean;
  /** which personas should see this item */
  personas: Persona[];
};

export const slugify = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const queueItems: QueueItem[] = [
  // AE-facing (deal-shaped)
  { id: "q-dunder",       kind: "risk",      account: "Stripe",     target: { type: "deal", id: "d1" },                          headline: "Stripe slipping — economic buyer dark 14 days",
    why: "David Wallace hasn't replied to your last 2 threads. Probability dropped 85% → 78%. Procurement still blocked.", primary: "Open deal", secondary: "Snooze 1d", ago: "1h", due: "Today", overdue: true, personas: ["ae", "manager"] },
  { id: "q-skybridge",    kind: "deal",      account: "Shopify",target: { type: "deal", id: "d4" },                          headline: "Shopify: technical Q&A scheduled but no security questionnaire sent",
    why: "Stage exit criterion 4/5 missing. Win rate drops 22% when this isn't completed before tech Q&A.", primary: "Send questionnaire", secondary: "Snooze 3d", ago: "3h", due: "Friday", personas: ["ae"] },
  { id: "q-stark",        kind: "deal",      account: "Raytheon Technologies",    target: { type: "deal", id: "d16" },                         headline: "Raytheon Technologies qualified — schedule discovery",
    why: "MEDDPICC: Champion + Pain identified, missing Metrics + Economic Buyer + Decision Process.", primary: "Schedule discovery", ago: "yesterday", personas: ["ae"] },
  // AM-facing (account-shaped)
  // Retention / health / risk → CSM-primary, AM secondary, manager visibility
  { id: "q-redwood",      kind: "renewal",   account: "Snowflake",        target: { type: "account", slug: slugify("Snowflake Inc.") }, headline: "Snowflake renewal in 47 days — sponsor silent",
    why: "Champion hasn't replied to your last 3 emails. Health score 41. Re-engagement note drafted.", primary: "Send re-engage", secondary: "Snooze 1d", ago: "1h", due: "Today", overdue: true, personas: ["csm", "am", "manager"] },
  { id: "q-gitlab",       kind: "adoption",  account: "GitLab Inc.",       target: { type: "account", slug: "gitlab-inc" },         headline: "GitLab: WAU/MAU dropped 0.62 → 0.48 in 14 days",
    why: "Three teams stopped using AI features last week. Renewal in 64 days. Health dropped 9 points.", primary: "Open usage drill-down", secondary: "Draft note", ago: "1h", personas: ["csm", "manager"] },
  { id: "q-edge-qbr",     kind: "prep",      account: "Akamai",        target: { type: "account", slug: "akamai-technologies" },      headline: "Akamai QBR is 14 days overdue",
    why: "No QBR since Jan. AI usage 'Concerning'. Risk of expansion slipping if Q2 narrative isn't reset before May.", primary: "Schedule QBR", secondary: "Snooze 3d", ago: "yesterday", due: "Apr 30", overdue: false, personas: ["csm", "am"] },

  // Pure expansion → AM only (with manager visibility)
  { id: "q-cloudflare",    kind: "expansion", account: "Cloudflare, Inc.",   target: { type: "account", slug: "cloudflare-inc" },     headline: "Cloudflare: VP Eng promoted — expansion door opens",
    why: "Maya Chen promoted to VP Eng. Budget now spans Networking + Security where adoption is 0%. Pattern matches 3 prior $180K avg expansions.", primary: "Build case", secondary: "Loop in AE", ago: "12m", personas: ["am", "manager"] },
  { id: "q-synergy",      kind: "expansion", account: "Tableau Software",    target: { type: "account", slug: "tableau-software" },      headline: "Tableau hiring 4 ML engineers — governance gap flagged",
    why: "Last call surfaced a governance need. Pattern matches 3 prior conversions. Drafted business case ready for review.", primary: "Validate case", secondary: "Loop in AE", ago: "yesterday", personas: ["am", "manager"] },
];

// =====================================================================
// My Number — per-persona personal scoreboard
// =====================================================================
export const myNumber = {
  ae: {
    quarter: "Q2 '26",
    quota:    1_200_000,
    closed:    540_000,
    commit:    820_000,
    bestCase:  980_000,
    pipeline: 1_460_000,
    deltaPct: 12, // vs last quarter pacing
    thisWeek:     { meetings: 8, callsConnected: 14, emailsSent: 32, dealsAdvanced: 3 },
    lastWeek:     { meetings: 6, callsConnected: 11, emailsSent: 28, dealsAdvanced: 2 },
  },
  // AM = Account Manager. Expansion-primary; expansion comes off customer book ($2.38M total ARR).
  // Cloudflare ($720K) and Tableau ($360K) drive most of the open expansion pipeline.
  am: {
    quarter: "Q2 '26",
    expansion: { target: 600_000, drafted: 180_000, inMotion: 360_000, closed: 120_000 },
    thisWeek:  { expansionPlaysOpened: 4, casesBuilt: 3, championsAdvocated: 2, dealsAdvanced: 5 },
    lastWeek:  { expansionPlaysOpened: 2, casesBuilt: 1, championsAdvocated: 1, dealsAdvanced: 3 },
  },
  // CSM = Customer Success Manager. Retention-primary; numbers track the live customer book.
  // Total customer ARR = $2.38M (Snowflake $480K + Cloudflare $720K + Tableau $360K + Akamai $540K + GitLab $280K).
  csm: {
    quarter: "Q2 '26",
    retention: { target: 2_380_000, secured: 1_540_000, atRisk: 480_000, committed: 1_900_000 },
    health:    { healthy: 3, watch: 1, atRisk: 1, avg: 74 }, // Cloudflare 88, Akamai 86, Tableau 90 = healthy; GitLab 64 = watch; Snowflake 42 = at-risk
    thisWeek:  { qbrsDelivered: 3, renewalsSaved: 2, ticketsResolved: 11, healthBumps: 5, playbooksFired: 4 },
    lastWeek:  { qbrsDelivered: 1, renewalsSaved: 1, ticketsResolved:  9, healthBumps: 3, playbooksFired: 2 },
  },
  manager: {
    quarter: "Q2 '26",
    teamQuota: 9_600_000,
    teamCommit: 5_300_000,
    teamForecast: 10_300_000,
    coverage: 2.1,
    thisWeek: { dealsReviewed: 47, coachingFlags: 3, forecastSubmissions: 6, oneOnOnes: 4 },
    lastWeek: { dealsReviewed: 41, coachingFlags: 5, forecastSubmissions: 5, oneOnOnes: 3 },
  },
};

// =====================================================================
// Account detail — for /accounts/[slug] workspace
// =====================================================================
export type Stakeholder = {
  name: string;
  title: string;
  role: "Champion" | "Decision Maker" | "Detractor" | "Influencer" | "User";
  sentiment: "supportive" | "neutral" | "negative";
  lastTouch: string;
  daysSilent: number;
  reportsTo?: string;       // name of manager (root nodes have no reportsTo)
  department?: "Executive" | "Engineering" | "Finance" | "Operations" | "Product" | "Sales" | "Other";
};

export type AccountSignal = {
  id: string;
  category: "Hiring & Org" | "Usage" | "Renewal" | "Expansion" | "Competitive";
  tone: "pos" | "warn" | "neg" | "info";
  body: string;
  ago: string;
  evidence: { kind: "email" | "call" | "linkedin" | "transcript" | "internal"; title: string; meta: string }[];
};

export type AccountDetail = {
  name: string;
  domain: string;
  segment: "Enterprise" | "Mid-Market" | "SMB";
  arr: number;          // current ARR
  status: "Customer" | "Prospect" | "Churned";
  owner: string;
  ownerInitials: string;
  health: Health;       // reuse from DealRow
  healthScore: number;
  renewalDays: number;  // days to renewal (negative = lapsed)
  nrr: number;
  lastQbrDays: number;
  hq: string;
  industry: string;
  employees: number;
  stakeholders: Stakeholder[];
  signals: AccountSignal[];
};

const baseAccountDetail = (override: Partial<AccountDetail> & Pick<AccountDetail, "name" | "domain">): AccountDetail => ({
  segment: "Enterprise",
  arr: 0,
  status: "Prospect",
  owner: "Sarah Chen",
  ownerInitials: "SC",
  health: "high",
  healthScore: 80,
  renewalDays: 180,
  nrr: 110,
  lastQbrDays: 30,
  hq: "—",
  industry: "—",
  employees: 0,
  stakeholders: [],
  signals: [],
  ...override,
});

export const accountDetails: Record<string, AccountDetail> = {
  [slugify("Stripe, Inc.")]: baseAccountDetail({
    name: "Stripe", domain: "stripe.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Sarah Chen", ownerInitials: "SC", health: "medium", healthScore: 78, renewalDays: -1, nrr: 0,
    lastQbrDays: 0, hq: "Scranton, PA", industry: "Manufacturing", employees: 1200,
    stakeholders: [
      { name: "Michael Scott",     title: "CEO",       role: "Champion",       sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Executive" },
      { name: "David Wallace",     title: "CFO",       role: "Decision Maker", sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Finance",    reportsTo: "Michael Scott" },
      { name: "Pam Beasley",       title: "CRO",       role: "Decision Maker", sentiment: "neutral",    lastTouch: "1d ago",  daysSilent:  1, department: "Sales",      reportsTo: "Michael Scott" },
      { name: "Christine Pettett", title: "VP Ops",    role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Operations", reportsTo: "Michael Scott" },
      { name: "Jim Halpert",       title: "Head of Sales Ops", role: "Influencer", sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Sales",      reportsTo: "Pam Beasley" },
      { name: "Stanley Hudson",    title: "Director of Procurement", role: "Influencer", sentiment: "neutral", lastTouch: "5d ago", daysSilent:  5, department: "Finance", reportsTo: "David Wallace" },
      { name: "Dwight Schrute",    title: "Technical Validator", role: "User", sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Operations", reportsTo: "Christine Pettett" },
    ],
    signals: [
      { id: "s1", category: "Renewal",     tone: "neg",  body: "Economic Buyer dark for 14 days — last 2 threads unanswered.",
        ago: "1h", evidence: [
          { kind: "email", title: "Re: Phase 1 proposal — followup", meta: "sent Apr 16, no reply" },
          { kind: "email", title: "Re: Q1 budget alignment",          meta: "sent Apr 22, no reply" },
        ] },
      { id: "s2", category: "Expansion",   tone: "pos",  body: "Christine confirmed Q1 budget exists for Phase 2 (Scranton + 2 branches).",
        ago: "2d", evidence: [
          { kind: "call",       title: "Discovery — Christine + Pam",   meta: "Apr 28, 00:08:42" },
          { kind: "transcript", title: "Mention: 'budget exists for two more branches'", meta: "00:12:31" },
        ] },
    ],
  }),
  [slugify("Snowflake Inc.")]: baseAccountDetail({
    name: "Snowflake", domain: "snowflake.com", segment: "Enterprise", arr: 480_000, status: "Customer",
    owner: "Brad Allen", ownerInitials: "BA", health: "low", healthScore: 41, renewalDays: 47, nrr: 92,
    lastQbrDays: 95, hq: "San Francisco, CA", industry: "Software", employees: 900,
    stakeholders: [
      { name: "Tom Reilly",  title: "VP Eng",          role: "Champion",       sentiment: "neutral",  lastTouch: "24d ago", daysSilent: 24, department: "Engineering" },
      { name: "Anna Park",   title: "Head of CX",      role: "Decision Maker", sentiment: "negative", lastTouch: "9d ago",  daysSilent:  9, department: "Operations", reportsTo: "Tom Reilly" },
      { name: "Lukas Becker",title: "Eng Manager",     role: "Influencer",     sentiment: "neutral",  lastTouch: "7d ago",  daysSilent:  7, department: "Engineering", reportsTo: "Tom Reilly" },
    ],
    signals: [
      { id: "s1", category: "Renewal", tone: "neg", body: "Champion silent 24 days, renewal in 47 days — high-risk.", ago: "1h",
        evidence: [{ kind: "email", title: "Re: Q2 health check", meta: "no reply 24d" }] },
      { id: "s2", category: "Usage",   tone: "warn", body: "Active seat count down 18% MoM.", ago: "1d",
        evidence: [{ kind: "internal", title: "usage dashboard", meta: "Apr 29 snapshot" }] },
    ],
  }),
  [slugify("Cloudflare, Inc.")]: baseAccountDetail({
    name: "Cloudflare", domain: "cloudflare.com", segment: "Enterprise", arr: 720_000, status: "Customer",
    owner: "Brad Allen", ownerInitials: "BA", health: "high", healthScore: 88, renewalDays: 178, nrr: 124,
    lastQbrDays: 14, hq: "Denver, CO", industry: "Cloud Infrastructure", employees: 3400,
    stakeholders: [
      { name: "Maya Chen",      title: "VP Eng (just promoted)", role: "Champion",       sentiment: "supportive", lastTouch: "today",  daysSilent: 0, department: "Engineering" },
      { name: "Ricardo Diaz",   title: "Head of Security",       role: "Influencer",     sentiment: "supportive", lastTouch: "5d ago", daysSilent: 5, department: "Operations", reportsTo: "Maya Chen" },
      { name: "Sandra Lewis",   title: "Director of Networking", role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago", daysSilent: 2, department: "Engineering", reportsTo: "Maya Chen" },
      { name: "Eric Cartman",   title: "Senior Engineer",        role: "User",           sentiment: "neutral",    lastTouch: "1d ago", daysSilent: 1, department: "Engineering", reportsTo: "Sandra Lewis" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos",  body: "Maya Chen promoted to VP Eng — budget authority expanded into Networking + Security.",
        ago: "12m", evidence: [
          { kind: "linkedin",   title: "LinkedIn: 'Excited to share I'm now VP Eng…'", meta: "Apr 30" },
          { kind: "transcript", title: "Last QBR mention: 'we'll own security too'", meta: "00:14:12" },
        ] },
      { id: "s2", category: "Expansion",   tone: "info", body: "Pattern matches 3 prior expansions where champion got VP-promoted: avg $180K.",
        ago: "12m", evidence: [{ kind: "internal", title: "Expansion playbook · pattern 4b", meta: "internal note" }] },
    ],
  }),
  [slugify("GitLab Inc.")]: baseAccountDetail({
    name: "GitLab Inc.", domain: "gitlab.com", segment: "Enterprise", arr: 280_000, status: "Customer",
    owner: "Sarah Chen", ownerInitials: "SC", health: "medium", healthScore: 64, renewalDays: 64, nrr: 98,
    lastQbrDays: 92, hq: "Berlin, DE", industry: "Software", employees: 1100,
    stakeholders: [
      { name: "Stefan Becker", title: "CFO",               role: "Decision Maker", sentiment: "neutral",    lastTouch: "21d ago", daysSilent: 21, department: "Executive" },
      { name: "Molly Müller",  title: "Head of Marketing", role: "Champion",       sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Operations", reportsTo: "Stefan Becker" },
      { name: "Mandy Moore",   title: "Marketing Lead",    role: "User",           sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Operations", reportsTo: "Molly Müller" },
    ],
    signals: [
      { id: "s1", category: "Usage", tone: "warn", body: "WAU/MAU dropped 0.62 → 0.48 in 14 days. Three teams stopped using AI features.", ago: "1h",
        evidence: [{ kind: "internal", title: "usage dashboard", meta: "Apr 29" }] },
    ],
  }),
  [slugify("Akamai Technologies")]: baseAccountDetail({
    name: "Akamai", domain: "akamai.com", segment: "Enterprise", arr: 540_000, status: "Customer",
    owner: "Mike Torres", ownerInitials: "MT", health: "high", healthScore: 86, renewalDays: 210, nrr: 118,
    lastQbrDays: 105, hq: "Atlanta, GA", industry: "Networking", employees: 870,
    stakeholders: [
      { name: "Jane Foster", title: "VP Eng",                role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Engineering" },
      { name: "Ravi Iyer",   title: "Director of Platform",  role: "Champion",       sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Jane Foster" },
      { name: "Priya Shah",  title: "Platform Engineer",     role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Ravi Iyer" },
    ],
    signals: [
      { id: "s1", category: "Renewal", tone: "warn", body: "QBR 14 days overdue — Q2 narrative not yet reset.", ago: "yesterday",
        evidence: [{ kind: "internal", title: "QBR cadence tracker", meta: "Last QBR: Jan 14" }] },
    ],
  }),
  [slugify("Tableau Software")]: baseAccountDetail({
    name: "Tableau Software", domain: "tableau.com", segment: "Enterprise", arr: 360_000, status: "Customer",
    owner: "Paul Acker", ownerInitials: "PA", health: "high", healthScore: 90, renewalDays: 220, nrr: 134,
    lastQbrDays: 21, hq: "Austin, TX", industry: "Data & Analytics", employees: 1200,
    stakeholders: [
      { name: "Owen Patel",      title: "VP Engineering",        role: "Decision Maker", sentiment: "neutral",    lastTouch: "6d ago", daysSilent: 6, department: "Engineering" },
      { name: "Aria Montgomery", title: "Head of ML",            role: "Champion",       sentiment: "supportive", lastTouch: "today",  daysSilent: 0, department: "Engineering", reportsTo: "Owen Patel" },
      { name: "Carlos Mendes",   title: "ML Lead",               role: "User",           sentiment: "supportive", lastTouch: "2d ago", daysSilent: 2, department: "Engineering", reportsTo: "Aria Montgomery" },
      { name: "Hannah Liu",      title: "Senior ML Engineer",    role: "User",           sentiment: "supportive", lastTouch: "1d ago", daysSilent: 1, department: "Engineering", reportsTo: "Aria Montgomery" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos",  body: "Hiring 4 ML engineers — governance gap flagged in last call.", ago: "yesterday",
        evidence: [
          { kind: "linkedin",   title: "Job post: Senior ML Engineer (×4)", meta: "Apr 28" },
          { kind: "transcript", title: "Aria: 'we don't have governance for these new agents'", meta: "00:18:21" },
        ] },
    ],
  }),
};

// =====================================================================
// Customer Outcomes — measurable customer-facing goals (not stage exit criteria)
// =====================================================================
export type OutcomeStatus = "ahead" | "on-track" | "watch" | "at-risk";

export type CustomerOutcome = {
  id: string;
  account: string;
  title: string;
  current: string;
  target: string;
  progress: number; // 0-100
  status: OutcomeStatus;
  due: string;
  metric: string;
};

export const outcomes: CustomerOutcome[] = [
  { id: "o1", account: "Cloudflare",     title: "Reduce time-to-first-value to under 14 days",       current: "11 days", target: "14 days", progress: 100, status: "ahead",    due: "Q2",      metric: "Days to first activated user" },
  { id: "o2", account: "Cloudflare",     title: "Land Connect rollout across 3 BUs by Q3",            current: "1 of 3",  target: "3 of 3",   progress: 33,  status: "on-track", due: "Sep 30",  metric: "BUs live on Connect" },
  { id: "o3", account: "Tableau Software", title: "Convert agent governance pilot into production", current: "Pilot",   target: "GA",       progress: 70,  status: "on-track", due: "Jun 30",  metric: "Phase" },
  { id: "o4", account: "Tableau Software", title: "Onboard 4 incoming ML engineers within 21 days", current: "2 of 4",  target: "4 of 4",   progress: 50,  status: "on-track", due: "May 15",  metric: "Activated seats" },
  { id: "o5", account: "GitLab Inc.",   title: "Reverse WAU/MAU decline (0.62 → 0.65)",          current: "0.48",    target: "0.65",     progress: 25,  status: "at-risk",  due: "Jun 15",  metric: "WAU/MAU rolling 4w" },
  { id: "o6", account: "Snowflake",     title: "Recover sponsor engagement after 24-day gap",     current: "24d",     target: "0d",       progress: 5,   status: "at-risk",  due: "Apr 30",  metric: "Days since last touch" },
  { id: "o7", account: "Akamai",    title: "Open a second BU within 90 days",                 current: "Lead",    target: "Won",      progress: 45,  status: "on-track", due: "Q3",      metric: "Stage" },
  { id: "o8", account: "Snowflake", title: "Deliver health recovery plan after sponsor re-engagement", current: "Draft", target: "Signed off", progress: 20, status: "watch", due: "May 15", metric: "Recovery plan status" },
];

// =====================================================================
// Data sources / integrations — the "where does this come from" layer
// =====================================================================
export type IntegrationCategory =
  | "CRM" | "Calendar & Email" | "Conversations" | "Product Analytics"
  | "Hiring & Org" | "Messaging" | "Support" | "Warehouse" | "SSO";

export type IntegrationStatus = "connected" | "syncing" | "error" | "disabled";

export type Integration = {
  id: string;
  name: string;
  vendor: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  lastSync: string;       // human relative
  lastSyncMinutesAgo: number;
  recordCount: number;
  description: string;
  /** Which downstream surfaces consume this integration's data. */
  feeds: string[];
};

export const integrations: Integration[] = [
  // CRM
  { id: "salesforce",  name: "Salesforce",      vendor: "Salesforce", category: "CRM",            status: "connected", lastSync: "12 min ago",  lastSyncMinutesAgo:  12, recordCount: 1842, description: "Deals, accounts, contacts, opportunities — bidirectional sync.", feeds: ["Deals", "Accounts", "Forecast", "CRM Updates"] },
  { id: "hubspot",     name: "HubSpot",         vendor: "HubSpot",    category: "CRM",            status: "disabled",  lastSync: "—",           lastSyncMinutesAgo:   0, recordCount: 0,    description: "Alternate CRM connector. Disabled while Salesforce is primary.",    feeds: [] },

  // Calendar / Email
  { id: "google",      name: "Google Workspace",vendor: "Google",     category: "Calendar & Email",status: "connected", lastSync: "3 min ago",   lastSyncMinutesAgo:   3, recordCount: 9784, description: "Calendar events and email threads scoped to deal/account participants.", feeds: ["Meetings", "Activity timeline", "Today queue"] },
  { id: "outlook",     name: "Microsoft 365",   vendor: "Microsoft",  category: "Calendar & Email",status: "disabled",  lastSync: "—",           lastSyncMinutesAgo:   0, recordCount: 0,    description: "Outlook calendar and Exchange mail.",                                feeds: [] },

  // Conversations / CI
  { id: "gong",        name: "Gong",            vendor: "Gong",       category: "Conversations",  status: "connected", lastSync: "9 min ago",   lastSyncMinutesAgo:   9, recordCount: 2156, description: "Recorded calls + transcripts. Powers the evidence chain on every signal.", feeds: ["Calls", "Signals", "Coaching", "Health"] },
  { id: "clari",       name: "Clari",           vendor: "Clari",      category: "Conversations",  status: "syncing",   lastSync: "syncing now…",lastSyncMinutesAgo:   0, recordCount: 412,  description: "Forecast snapshots and deal inspection signals.",                    feeds: ["Forecast"] },

  // Product analytics
  { id: "mixpanel",    name: "Mixpanel",        vendor: "Mixpanel",   category: "Product Analytics",status:"connected", lastSync: "1 min ago",   lastSyncMinutesAgo:   1, recordCount: 84210,description: "Event-level usage data — drives WAU/MAU, adoption, feature engagement.", feeds: ["Adoption", "Customer health", "Outcomes"] },
  { id: "amplitude",   name: "Amplitude",       vendor: "Amplitude",  category: "Product Analytics",status:"disabled",  lastSync: "—",           lastSyncMinutesAgo:   0, recordCount: 0,    description: "Alternative product analytics source.",                              feeds: [] },

  // Hiring / Org
  { id: "linkedin",    name: "LinkedIn Sales Navigator", vendor: "LinkedIn", category: "Hiring & Org", status: "connected", lastSync: "23 min ago", lastSyncMinutesAgo: 23, recordCount: 488, description: "Champion job changes, hiring signals, org-chart hints.", feeds: ["Signals", "Today queue", "Org Chart"] },

  // Messaging
  { id: "slack",       name: "Slack",           vendor: "Slack",      category: "Messaging",      status: "connected", lastSync: "just now",    lastSyncMinutesAgo:   0, recordCount: 1283, description: "Notifications + Ask Alphy in channel + share-deal cards.",          feeds: ["Notifications", "Ask Alphy"] },

  // Support
  { id: "zendesk",     name: "Zendesk",         vendor: "Zendesk",    category: "Support",        status: "connected", lastSync: "6 min ago",   lastSyncMinutesAgo:   6, recordCount: 5083, description: "Tickets, conversations, SLA breaches.",                              feeds: ["Inbox", "Customer health"] },
  { id: "intercom",    name: "Intercom",        vendor: "Intercom",   category: "Support",        status: "error",     lastSync: "2h ago",      lastSyncMinutesAgo: 120, recordCount: 0,    description: "OAuth token expired. Reconnect to resume.",                          feeds: [] },

  // Warehouse
  { id: "snowflake",   name: "Snowflake",       vendor: "Snowflake",  category: "Warehouse",      status: "connected", lastSync: "5 min ago",   lastSyncMinutesAgo:   5, recordCount: 0,    description: "Custom metrics, MEDDPICC fields, outcome telemetry.",                feeds: ["Outcomes", "Coaching", "Custom dashboards"] },

  // SSO
  { id: "okta",        name: "Okta",            vendor: "Okta",       category: "SSO",            status: "connected", lastSync: "today 09:00",lastSyncMinutesAgo:  60, recordCount:  47,  description: "SSO + SCIM provisioning.",                                            feeds: ["Identity"] },
];

// =====================================================================
// Adoption / customer health — Planhat-style
// =====================================================================
export type AdoptionMetric = {
  label: string;
  trend: number[];        // 5–8 weekly points, % change vs baseline
  current: number;        // latest value (signed %)
  color: string;
};

export type SequenceDelay = {
  step: string;
  blocked: number[];     // counts per recent day
};

export type FeatureAdoption = {
  name: string;
  adoptionPct: number;  // % of seats using this feature
  wauMau: number;       // WAU/MAU ratio for this feature (0–1)
  trend: "up" | "flat" | "down";
  trendPct: number;     // signed % change week-over-week
  tier: "core" | "advanced" | "new";
};

export type TeamAdoption = {
  team: string;
  seats: number;
  activeSeats: number;
  wauMau: number;
  healthColor: "pos" | "warn" | "neg";
};

export type AccountAdoption = {
  newCustomersOnboarded: number; // 0-100 %
  customersAtRisk:       number; // 0-100 %
  wauMauTrend: number[];         // 8-week WAU/MAU rolling values
  wauMauWeeks: string[];         // x-axis week labels
  wauMauCurrent: number;
  wauMauDelta: number;           // signed % change vs 4w ago
  monthlyActiveUsers: number;
  totalSeats: number;
  features: FeatureAdoption[];
  teams: TeamAdoption[];
  atRiskUsers: { name: string; team: string; lastSeen: string; daysInactive: number }[];
  metrics: AdoptionMetric[];
  weeks: string[];               // x-axis labels for trend chart
  sequenceDelays: SequenceDelay[];
  delayDays: string[];           // x-axis labels for the heatmap
  blockingSteps: { label: string; pct: number; color: string }[];
};

export const accountAdoption: Record<string, AccountAdoption> = {
  [slugify("Cloudflare, Inc.")]: {
    newCustomersOnboarded: 89, customersAtRisk: 13,
    wauMauTrend: [0.61, 0.64, 0.68, 0.71, 0.73, 0.74, 0.72, 0.74],
    wauMauWeeks: ["w30","w31","w32","w33","w34","w35","w36","w37"],
    wauMauCurrent: 0.74,
    wauMauDelta: +8,
    monthlyActiveUsers: 284,
    totalSeats: 320,
    features: [
      { name: "AI Assistant",       adoptionPct: 88, wauMau: 0.74, trend: "up",   trendPct: +6,  tier: "core" },
      { name: "CRM Writeback",      adoptionPct: 72, wauMau: 0.62, trend: "up",   trendPct: +4,  tier: "core" },
      { name: "Signal Feed",        adoptionPct: 65, wauMau: 0.58, trend: "up",   trendPct: +9,  tier: "core" },
      { name: "Deal Scoring",       adoptionPct: 48, wauMau: 0.41, trend: "flat", trendPct:  0,  tier: "advanced" },
      { name: "Playbook Runs",      adoptionPct: 41, wauMau: 0.38, trend: "up",   trendPct: +12, tier: "advanced" },
      { name: "Forecast Assist",    adoptionPct: 34, wauMau: 0.30, trend: "flat", trendPct:  -1, tier: "advanced" },
      { name: "Coaching Scorecard", adoptionPct: 22, wauMau: 0.18, trend: "down", trendPct: -8,  tier: "new" },
    ],
    teams: [
      { team: "Networking Engineering", seats: 82,  activeSeats: 74, wauMau: 0.81, healthColor: "pos" },
      { team: "Security Operations",    seats: 67,  activeSeats: 59, wauMau: 0.76, healthColor: "pos" },
      { team: "Cloud Platform",         seats: 91,  activeSeats: 78, wauMau: 0.72, healthColor: "pos" },
      { team: "Revenue Ops",            seats: 43,  activeSeats: 31, wauMau: 0.52, healthColor: "warn" },
      { team: "Finance & Procurement",  seats: 37,  activeSeats: 22, wauMau: 0.41, healthColor: "warn" },
    ],
    atRiskUsers: [
      { name: "Sandra Lewis",  team: "Revenue Ops",           lastSeen: "Apr 8",  daysInactive: 25 },
      { name: "Tom Reilly",    team: "Finance & Procurement",  lastSeen: "Apr 11", daysInactive: 22 },
      { name: "Anna Park",     team: "Finance & Procurement",  lastSeen: "Apr 15", daysInactive: 18 },
    ],
    weeks: ["w33", "w34", "w35", "w36", "w37"],
    metrics: [
      { label: "Daily active users",      trend: [  0,  20,  60,  90,  85], current:  85, color: "#E0A547" },
      { label: "Feature breadth",         trend: [  0,  40, 100,  78,  60], current:  60, color: "#FF6B6B" },
      { label: "Workspace setup",         trend: [  0,  10,  20,  30,  40], current:  40, color: "#9870D0" },
      { label: "API calls / week",        trend: [  0,  15,  10, -10, -20], current: -20, color: "#5BB25B" },
      { label: "Support tickets resolved",trend: [  0, -10, -50,-100,-105], current:-105, color: "#FFB347" },
      { label: "Onboarding tasks done",   trend: [  0, -30,-110,-180,-180], current:-180, color: "#FF8FAB" },
      { label: "Champion logins",         trend: [  0, -50,-180,-230,-220], current:-220, color: "#C84B4B" },
    ],
    sequenceDelays: [
      { step: "Coordinate Trainings",       blocked: [0, 0, 1, 0, 0, 0, 0, 0] },
      { step: "Coordinate Trainings agendas", blocked: [0, 0, 0, 0, 1, 0, 0, 0] },
      { step: "Create Account",             blocked: [0, 1, 0, 0, 0, 0, 0, 0] },
      { step: "Set Off Meeting",            blocked: [0, 0, 0, 0, 0, 1, 0, 0] },
      { step: "Run kickoff",                blocked: [0, 0, 0, 0, 0, 0, 1, 0] },
    ],
    delayDays: ["d1","d2","d3","d4","d5","d6","d7","d8"],
    blockingSteps: [
      { label: "Setup",         pct: 36, color: "#FFB347" },
      { label: "Training",      pct: 28, color: "#9870D0" },
      { label: "Certification", pct: 18, color: "#5BB25B" },
      { label: "Kickoff",       pct: 12, color: "#7BA4DC" },
      { label: "Other",         pct:  6, color: "#C8C6BD" },
    ],
  },
  [slugify("GitLab Inc.")]: {
    newCustomersOnboarded: 64, customersAtRisk: 41,
    wauMauTrend: [0.62, 0.60, 0.58, 0.56, 0.53, 0.50, 0.49, 0.48],
    wauMauWeeks: ["w30","w31","w32","w33","w34","w35","w36","w37"],
    wauMauCurrent: 0.48,
    wauMauDelta: -22,
    monthlyActiveUsers: 198,
    totalSeats: 260,
    features: [
      { name: "AI Assistant",       adoptionPct: 71, wauMau: 0.58, trend: "down", trendPct: -12, tier: "core" },
      { name: "CRM Writeback",      adoptionPct: 58, wauMau: 0.44, trend: "down", trendPct: -8,  tier: "core" },
      { name: "Signal Feed",        adoptionPct: 42, wauMau: 0.38, trend: "down", trendPct: -14, tier: "core" },
      { name: "Deal Scoring",       adoptionPct: 29, wauMau: 0.22, trend: "flat", trendPct: -2,  tier: "advanced" },
      { name: "Playbook Runs",      adoptionPct: 18, wauMau: 0.14, trend: "down", trendPct: -18, tier: "advanced" },
      { name: "Forecast Assist",    adoptionPct: 11, wauMau: 0.09, trend: "down", trendPct: -22, tier: "advanced" },
    ],
    teams: [
      { team: "Marketing Ops",      seats: 62,  activeSeats: 41, wauMau: 0.54, healthColor: "warn" },
      { team: "Revenue Operations", seats: 48,  activeSeats: 29, wauMau: 0.42, healthColor: "warn" },
      { team: "Engineering",        seats: 88,  activeSeats: 41, wauMau: 0.36, healthColor: "neg" },
      { team: "Finance",            seats: 34,  activeSeats: 11, wauMau: 0.22, healthColor: "neg" },
      { team: "Exec",               seats: 18,  activeSeats: 12, wauMau: 0.61, healthColor: "pos" },
    ],
    atRiskUsers: [
      { name: "Lukas Becker",   team: "Engineering",        lastSeen: "Apr 2",  daysInactive: 31 },
      { name: "Stefan Becker",  team: "Finance",            lastSeen: "Apr 8",  daysInactive: 25 },
      { name: "Ravi Iyer",      team: "Revenue Operations", lastSeen: "Apr 12", daysInactive: 21 },
      { name: "Anna Park",      team: "Engineering",        lastSeen: "Apr 14", daysInactive: 19 },
    ],
    weeks: ["w33", "w34", "w35", "w36", "w37"],
    metrics: [
      { label: "Daily active users",      trend: [  0, -10, -40, -70, -88], current: -88, color: "#C84B4B" },
      { label: "Feature breadth",         trend: [  0, -20, -55, -70, -65], current: -65, color: "#FF6B6B" },
      { label: "WAU / MAU",               trend: [  0,  -8, -22, -30, -34], current: -34, color: "#FFB347" },
      { label: "Workspace setup",         trend: [  0,  10,  20,  20,  18], current:  18, color: "#9870D0" },
      { label: "Support tickets",         trend: [  0,  20,  50,  90,  84], current:  84, color: "#5BB25B" },
      { label: "Champion logins",         trend: [  0,  -5, -15, -28, -45], current: -45, color: "#FF8FAB" },
    ],
    sequenceDelays: [
      { step: "Q2 Health Check",   blocked: [1, 0, 0, 0, 0, 0, 0, 0] },
      { step: "Adoption review",   blocked: [0, 1, 1, 0, 0, 0, 0, 0] },
      { step: "Re-engage email",   blocked: [0, 0, 0, 1, 0, 0, 0, 0] },
      { step: "Exec sponsor sync", blocked: [0, 0, 0, 0, 1, 1, 0, 0] },
    ],
    delayDays: ["d1","d2","d3","d4","d5","d6","d7","d8"],
    blockingSteps: [
      { label: "Sponsor silence", pct: 42, color: "#C84B4B" },
      { label: "Feature gap",      pct: 24, color: "#FFB347" },
      { label: "Org change",       pct: 18, color: "#9870D0" },
      { label: "Pricing",          pct: 10, color: "#5BB25B" },
      { label: "Other",            pct:  6, color: "#C8C6BD" },
    ],
  },
};

// =====================================================================
// Pinned accounts (left rail)
// =====================================================================
export const pinnedAccounts = [
  { name: "Cloudflare",       slug: slugify("Cloudflare, Inc."),       health: "high"   as Health },
  { name: "Tableau",         slug: slugify("Tableau Software"),        health: "high"   as Health },
  { name: "Snowflake",    slug: slugify("Snowflake Inc."),  health: "low"    as Health },
  { name: "GitLab Inc.",  slug: slugify("GitLab Inc."),           health: "medium" as Health },
];

// =====================================================================
// Helpers
// =====================================================================
export const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

export const fmtFullMoney = (n: number) => `$${n.toLocaleString("en-US")}`;

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

export const stageColor: Record<Stage, string> = {
  "Qualification": "var(--info)",
  "Discovery":     "#7B61FF",
  "Demo":          "var(--info)",
  "Proposal":      "var(--warn)",
  "Negotiation":   "#7B61FF",
  "Closed Won":    "var(--pos)",
  "Closed Lost":   "var(--neg)",
};

export const forecastColor: Record<ForecastCategory, { bg: string; ink: string }> = {
  Pipeline:    { bg: "var(--bg-deep)",   ink: "var(--muted)" },
  "Best Case": { bg: "var(--warn-soft)", ink: "var(--warn)"  },
  Commit:      { bg: "var(--pos-soft)",  ink: "var(--pos)"   },
  Won:         { bg: "var(--pos-soft)",  ink: "var(--pos)"   },
  Lost:        { bg: "var(--neg-soft)",  ink: "var(--neg)"   },
  Omitted:     { bg: "var(--bg-deep)",   ink: "var(--muted-2)" },
};

export const meddpiccLabels = ["M", "E", "D", "D", "P", "I", "C", "C"] as const;
export const meddpiccFullLabels = [
  "Metrics", "Economic Buyer", "Decision Criteria", "Decision Process",
  "Paper Process", "Identify Pain", "Champion", "Competition"
] as const;

// =====================================================================
// Deal-detail synthetic content (used by the drawer when a deal is opened)
// =====================================================================
export const dealDetail = {
  strengths: [
    { title: "Sponsor Engagement", body: "Champion is actively leading negotiations, with executive support from the VP." },
    { title: "Budget & Timeline",  body: "Flexible budget confirmed; implementation timeline and payment terms clearly established." },
    { title: "Competitive Edge",   body: "Oliv positioned favorably; aligns closely with key requirements including data integrations." },
  ],
  risks: [
    { title: "Stakeholder Gaps",    body: "Incomplete engagement of additional influencers; pending C-level and executive interactions." },
    { title: "Validation Issues",   body: "References and Solutionarium visits not yet conducted, leaving credibility partially unverified." },
    { title: "Competitive Threat",  body: "One competitor remains actively involved; potential risk if they offer superior terms or integrations." },
    { title: "Procedural Delays",   body: "Critical approvals (legal, finance, procurement) are pending, posing risk of delays or unforeseen obstacles." },
  ],
  forecastFactors: [
    { dir: "+", weight: 15, body: "Strong sponsor advocacy by Christine Pettett." },
    { dir: "+", weight: 10, body: "Confirmed budget flexibility and implementation timeline." },
    { dir: "+", weight: 10, body: "Favorable competitive positioning vs. Netsmart solution." },
    { dir: "−", weight: 15, body: "Competitor remains actively involved, presenting a credible threat." },
    { dir: "−", weight: 10, body: "Pending procedural steps (legal, finance, references) that could delay final approval." },
  ],
  recommendations: [
    { title: "Schedule integration deep-dive meeting", body: "Set up a call with Oliv product team to review the rollout plan.", action: "Schedule now" },
    { title: "Send ROI calculator",                      body: "Email David Wallace and Michael Scott a plug-and-play sheet to test payback scenarios.", action: "Draft email" },
    { title: "Create Digital Sales Room",                body: "Set up a digital room for Michael, Pam & David with all key deal documents.", action: "Configure now" },
    { title: "Share integration success brief",          body: "Send a customer case study on a comparable rollout.", action: "Draft email" },
  ],
  buyingCommittee: [
    { fn: "Business",  tag: "Executive Sponsor", customer: { name: "Michael Scott",  title: "Chief Executive Officer",   pills: ["Leader", "Neutral", "No meeting planned"], score: 4 }, internal: { name: "Aria Montgomery", title: "Chief Technology Officer", state: "Full Engagement", lastEngaged: "10 Dec" } },
    { fn: "Executive", tag: "Decision Maker",    customer: { name: "David Wallace",  title: "Chief Financial Officer",   pills: ["Leader", "Detractor", "No meeting planned"], score: 4 }, internal: { name: "Ishan Chhabra",    title: "Chief Executive Officer",   state: "No Engagement",   lastEngaged: "10 Dec" } },
    { fn: "Payee Mgmt",tag: "Decision Maker",    customer: { name: "Pam Beasley",   title: "Chief Revenue Officer",     pills: ["Leader", "Neutral", "Met once"], score: 4 }, internal: null },
  ],
  meddpiccScores: [
    { dim: "Metrics",          score: 4, summary: "Solid understanding of key metrics with partial baseline data" },
    { dim: "Economic Buyer",   score: 3, summary: "Identified but not engaged in last 14 days" },
    { dim: "Decision Criteria",score: 3, summary: "Top 3 criteria captured; weighting not validated" },
    { dim: "Decision Process", score: 3, summary: "Procurement timeline directionally agreed" },
    { dim: "Paper Process",    score: 2, summary: "Legal review in flight; redlines not yet returned" },
    { dim: "Identify Pain",    score: 4, summary: "Quantified pain on admin overhead and pipeline gaps" },
    { dim: "Champion",         score: 4, summary: "Active champion with multi-thread access" },
    { dim: "Competition",      score: 4, summary: "One competitor remains; differentiation drafted" },
  ],
  stages: [
    { name: "Qualification", done: 2, total: 2, status: "complete" as const },
    { name: "Discovery",     done: 3, total: 3, status: "complete" as const },
    { name: "Demo",          done: 5, total: 6, status: "current"  as const },
    { name: "Proposal",      done: 1, total: 4, status: "current"  as const },
    { name: "Negotiation",   done: 0, total: 4, status: "pending"  as const },
  ],
  outcomes: [
    { label: "Proposal shared with all key stakeholders", done: true },
    { label: "Prospect acknowledges proposal and agrees to negotiate terms", done: false },
    { label: "Scope alignment: pricing and solution scope match prospect's budget and needs", done: false },
    { label: "Competitive differentiation reaffirmed in writing", done: false },
  ],
  timeline: [
    { type: "meeting", title: "Last meeting · Pilot Extension Check-In", body: "Alex & Lukas agreed to present early pilot wins to Eric next week.", when: "Today" },
    { type: "meeting", title: "Upcoming · Pilot Success Prep — Tom W.", body: "Reviewed early trial metrics and pinpointed coaching topics for his reps.", when: "1 day ago" },
    { type: "email",   title: "Received from Email 7", body: "Sent to Lukas with recap of pilot metrics and Calendly link for rollout chat.", when: "1 day ago" },
    { type: "email",   title: "Sent · Intro Resources Shared", body: "Sent quick playbook PDF to Lukas — invited questions.", when: "8 days ago" },
    { type: "call",    title: "Call picked up · Sandra Lewis", body: "Discussed onboarding metrics dashboard; sent one-pager.", when: "10 days ago" },
    { type: "call",    title: "Call dialed · Follow-Up — Tom W.", body: "Requested Clari-vs-Oliv comparison deck.", when: "12 days ago" },
  ],
  actionPlan: {
    nextMeeting:   { status: "Accepted",   title: "Alphard <> Stripe: Integration Timeline", when: "May 14, 8 – 8:30 PM" },
    nextAction:    { status: "Apr 12",     title: "Send revised proposal and set up a meeting to get clarity on technical implementation" },
    nextFollowUp:  { status: "Overdue",    title: "Follow up with Jim on trial extension while proposal is in review" },
    milestones: [
      { stage: "Qualification", progress: 1.0,  items: [
        { label: "Initial discovery call completed",   assignee: "Sarah Chen", due: "2026-02-14", done: true },
        { label: "Pain points and metrics confirmed",  assignee: "Sarah Chen", due: "2026-02-18", done: true },
      ]},
      { stage: "Discovery", progress: 1.0,  items: [
        { label: "Stakeholder map drafted",            assignee: "Sarah Chen", due: "2026-02-28", done: true },
        { label: "Technical Q&A scheduled",            assignee: "Sarah Chen", due: "2026-03-04", done: true },
        { label: "Champion onboarded",                 assignee: "Sarah Chen", due: "2026-03-08", done: true },
      ]},
      { stage: "Demo", progress: 0.83, items: [
        { label: "Solution demo delivered",            assignee: "Sarah Chen", due: "2026-03-18", done: true },
        { label: "ROI deck shared with sponsor",       assignee: "Sarah Chen", due: "2026-03-22", done: true },
      ]},
      { stage: "Proposal", progress: 0.25, items: [
        { label: "First Draft Proposal Shared",        assignee: "Derek Evans", due: "2026-05-15", done: true },
        { label: "First draft of proposal shared with stakeholders", assignee: "Derek Evans", due: "2026-05-17", done: false },
        { label: "Pricing alignment confirmed",        assignee: "Derek Evans", due: "2026-05-22", done: false },
        { label: "Competitive differentiation reviewed", assignee: "Derek Evans", due: "2026-05-25", done: false },
      ]},
    ],
  },
  coaching: {
    overall: 71,
    summary: {
      improvement: "Make executive value-storytelling crisper and tighten follow-ups on privacy and integration deliverables.",
      strength:    "Maintained strong deal momentum through high-engagement with champions during the pilot phase.",
    },
    strengths: [
      { k: "Keeps Champions Highly Engaged", v: "Derek maintains weekly touchpoints with Jim, Stanley, and Dwight, using pilot insights to keep momentum steady from qualification through proposal." },
      { k: "Proves Short-Term Value with Real Data", v: "The two-week pilot auto-filled MEDDPICC and surfaced next-step insights; Jim called the pilot dashboard \"our first truly reliable pipeline view.\"" },
    ],
    focusAreas: [
      { k: "Executive Messaging Lacks Punch", v: "Derek struggles to translate admin-time savings into clear budget impact and growth upside." },
      { k: "Follow-Up on Compliance & Integrations Drags", v: "Privacy FAQ and integration roadmap are still pending, putting legal sign-off and timeline at risk." },
    ],
    framework: [
      { cat: "Information Discovery", score: 4, items: ["Current Challenges", "Business & Personal Impact", "Technical & Functional Requirements", "Economic Buyer", "Budget Confirmation"] },
      { cat: "Solution Positioning",  score: 4, items: ["Articulating Solution", "Gaining Agreement"] },
      { cat: "Building Consensus",    score: 3, items: ["Priority & Problem Size", "Pricing & ROI", "Consequences & Urgency"] },
      { cat: "Objection Handling",    score: 4, items: ["Competitive Landscape", "Addressing Objections"] },
      { cat: "Product Knowledge",     score: 3, items: ["Pitching", "Answering Questions"] },
    ],
  },
  crmSuggestions: [
    { id: "s1", field: "Use Case",         current: "Manual Ledger Entry & Regional Reporting", proposed: "Autonomous Inventory Management & Sales Productivity Reclaim" },
    { id: "s2", field: "Primary Contact",  current: "Michael Scott", proposed: "David Wallace" },
    { id: "s3", field: "Competitor Notes", current: "None",          proposed: "Michael Scott mentioned corporate is pushing for a Gong renewal; Oliv needs to emphasize 'Action-Oriented AI' vs. 'Analytics-only'." },
    { id: "s4", field: "Renewal Risk",     current: "Low",           proposed: "Medium — economic buyer not engaged in last 14 days." },
  ],
  assets: [
    { name: "Executive Summary",  type: "doc",  body: "High-level recap of problem, proposed solution, and impact." },
    { name: "CRO Brief",          type: "doc",  body: "Strategic focus on sales velocity, rep productivity, and hitting aggressive revenue targets." },
    { name: "CSM Handoff",        type: "ppt",  body: "Narrative-driven visual deck showcasing the \"before\" and \"after\" transformation of the branch." },
    { name: "ROI Calculator",     type: "xls",  body: "Data-backed financial model proving the payback period and long-term net savings." },
    { name: "Implementation Plan",type: "doc",  body: "Operational blueprint for seamless implementation and maintaining long-term account health." },
  ],
};

// =====================================================================
// Sales Blueprints
// =====================================================================
export type MotionType = "New Business" | "Strategic" | "Expansion" | "Renewal";
export type SignalCategory = "Timing" | "Win" | "Risk";

export type InsightSignal = {
  id: string;
  category: SignalCategory;
  title: string;
  dataPoint: string;
  outcomeMetric: string;
  isNew?: boolean;
  detail: string;
};

export const blueprintInsights: InsightSignal[] = [
  { id: "ti1", category: "Timing", title: "Demo within 5 days of discovery", dataPoint: "Avg 12 days currently", outcomeMetric: "50% faster close", detail: "Cycle time analysis across 6,800 deals shows that scheduling a demo within 5 business days of the initial discovery call reduces average cycle time by 50%. Currently, only 38% of deals meet this threshold." },
  { id: "ti2", category: "Timing", title: "Business case before month-end", dataPoint: "Only done in 29% of deals", outcomeMetric: "2.1× close rate", detail: "Deals where a business case is delivered before the buyer's month-end budget cycle close at 2.1× the rate. This pattern is especially strong in Enterprise segments where procurement aligns to fiscal periods." },
  { id: "ti3", category: "Timing", title: "Proposal within 48h of alignment", dataPoint: "Median delay is 6 days", outcomeMetric: "2.8× close rate", isNew: true, detail: "Momentum analysis shows that sending a proposal within 48 hours of stakeholder alignment maintains urgency. Deals exceeding 6 days between alignment and proposal see a 64% drop in close rate." },
  { id: "ti4", category: "Timing", title: "Follow-up within 4 hours", dataPoint: "Only 22% of reps achieve this", outcomeMetric: "37% faster close", detail: "Post-meeting follow-ups sent within 4 hours correlate with 37% faster close times. Response rates also increase 2.4× when the follow-up includes action items from the call." },
  { id: "ti5", category: "Timing", title: "QBR cycle alignment", dataPoint: "52% win rate when aligned", outcomeMetric: "1.9× close rate", detail: "Deals that align proposal timing with the buyer's QBR cycle show 1.9× higher close rates. This is because budget discussions and strategic priorities are top-of-mind during QBR windows." },

  { id: "wi1", category: "Win", title: "Previous customer at buyer org", dataPoint: "43% of closed-won deals", outcomeMetric: "vs 5% of lost", detail: "When a previous customer of your product exists at the buyer organization, win rates jump to 43%. These internal references provide credibility that external references cannot match." },
  { id: "wi2", category: "Win", title: "Inbound from content", dataPoint: "38% of closed-won", outcomeMetric: "2.3× win rate", detail: "Content-sourced inbound leads close at 2.3× the rate of outbound. These buyers arrive with pre-formed intent and typically require 40% fewer touchpoints before commitment." },
  { id: "wi3", category: "Win", title: "Multi-department interest", dataPoint: "51% of closed-won", outcomeMetric: "1.8× deal size", detail: "Deals involving 2+ departments close at higher rates and 1.8× larger deal sizes. Multi-department deals also show 34% lower churn in the first year." },
  { id: "wi4", category: "Win", title: "Unprompted exec involvement", dataPoint: "Present in 28% of deals", outcomeMetric: "81% win rate", isNew: true, detail: "When a C-level executive engages without being prompted by the sales team, win rate reaches 81%. This signals strong internal advocacy and organizational alignment." },
  { id: "wi5", category: "Win", title: "Integration discussed early", dataPoint: "Stage 1–2 discussion", outcomeMetric: "55% win rate", detail: "Deals where technical integration is discussed before Stage 3 win at 55% vs. 31% when deferred. Early integration conversations indicate serious buyer intent and reduce late-stage objections." },
  { id: "wi6", category: "Win", title: "Buyer-initiated scheduling", dataPoint: "Buyer books next meeting", outcomeMetric: "3.2× more in won deals", detail: "When the buyer proactively schedules the next meeting (vs. the rep), the deal is 3.2× more likely to close. This is the strongest single-event predictor of deal momentum." },

  { id: "ri1", category: "Risk", title: "Single-threaded past Stage 3", dataPoint: "67% of closed-lost deals", outcomeMetric: "67% loss rate", detail: "Deals with only one contact engaged beyond the proposal stage lose at 67%. Multi-threading into at least 3 stakeholders by Stage 3 reduces loss rate to 24%." },
  { id: "ri2", category: "Risk", title: "No exec engagement by Stage 4", dataPoint: "54% of closed-lost", outcomeMetric: "54% loss rate", detail: "When no executive-level stakeholder has been engaged by the negotiation stage, 54% of deals are lost. Executive engagement before Stage 4 correlates with 2.1× higher win rates." },
  { id: "ri3", category: "Risk", title: "No technical validation by S3", dataPoint: "Stall or loss in 61%", outcomeMetric: "61% stall rate", isNew: true, detail: "Deals without technical validation (POC, sandbox, or security review) by Stage 3 stall or lose at 61%. Technical validation de-risks the deal for both buyer and seller." },
  { id: "ri4", category: "Risk", title: "Declining email response rate", dataPoint: "72% prediction accuracy", outcomeMetric: "72% accurate", isNew: true, detail: "A declining email response rate over 3+ consecutive weeks predicts deal loss with 72% accuracy. This signal typically precedes champion silence by 10–14 days." },
  { id: "ri5", category: "Risk", title: "Competitor mentioned in calls", dataPoint: "Unaddressed = 2.1× loss", outcomeMetric: "2.1× loss rate", detail: "When a competitor is mentioned in call transcripts and not addressed within 48 hours with a competitive response, loss rate increases 2.1×. Proactive battlecard deployment reduces this to baseline." },
  { id: "ri6", category: "Risk", title: "Procurement delay past 14 days", dataPoint: "52% result in loss", outcomeMetric: "52% loss rate", detail: "Procurement processes exceeding 14 days beyond the expected timeline result in 52% deal loss. Early procurement engagement (before Stage 4) reduces average delay by 60%." },
];

export type FlowNodeType = "agent" | "email" | "meeting" | "decision" | "milestone" | "manual";

export type BlueprintNode = {
  id: string;
  type: FlowNodeType;
  actor?: string;
  label: string;
  description: string;
};

export type BlueprintStage = {
  name: string;
  conversionRate: number;
  winRate: number;
  criteriaCount: number;
  nodes: BlueprintNode[];
};

export const blueprintStages: BlueprintStage[] = [
  { name: "Qualification", conversionRate: 26, winRate: 15, criteriaCount: 2, nodes: [
    { id: "q1", type: "milestone", label: "Opportunity Created", description: "New opportunity enters the pipeline from inbound or outbound source." },
    { id: "q2", type: "agent", actor: "Agent", label: "Send Pre-Call Fit Check", description: "Researches ICP fit, firmographics, and recent signals before discovery." },
    { id: "q3", type: "decision", label: "Champion still in role?", description: "Verify the identified champion is still active at the org. Check LinkedIn and recent activity." },
    { id: "q4", type: "agent", actor: "Agent", label: "Run Champion Recovery Play", description: "If champion departed, detect successor and trigger recovery outreach sequence." },
    { id: "q5", type: "email", actor: "Email", label: "Send Agenda + Pre-Read", description: "Structured email 24–48h before meeting with agenda, mutual goals, and prep materials." },
    { id: "q6", type: "meeting", actor: "AE", label: "Run Intro Discovery Call", description: "AE runs a 45–60 min structured discovery call following the MEDDPICC framework." },
    { id: "q7", type: "milestone", label: "Move to Discovery", description: "Deal meets qualification criteria and advances to deep discovery." },
  ]},
  { name: "Discovery", conversionRate: 42, winRate: 25, criteriaCount: 5, nodes: [
    { id: "d1", type: "agent", actor: "Agent", label: "Run Pre-Meeting Intel", description: "Pull latest signals, org chart changes, and competitive intel before the deep discovery." },
    { id: "d2", type: "meeting", actor: "AE", label: "Deep Discovery Session", description: "90-min working session mapping pains to outcomes. Capture MEDDPICC dimensions." },
    { id: "d3", type: "decision", label: "Technical fit confirmed?", description: "Verify solution can meet key technical requirements. Check integration and security needs." },
    { id: "d4", type: "manual", actor: "AE", label: "Build Stakeholder Map", description: "Identify all stakeholders: champion, economic buyer, influencers, detractors." },
    { id: "d5", type: "email", actor: "Email", label: "Send Discovery Summary", description: "Recap pains, outcomes, and agreed next steps. Get buyer confirmation." },
    { id: "d6", type: "milestone", label: "Move to Demo", description: "All discovery criteria met. Schedule tailored demo." },
  ]},
  { name: "Demo", conversionRate: 55, winRate: 40, criteriaCount: 8, nodes: [
    { id: "de1", type: "agent", actor: "Agent", label: "Generate Demo Script", description: "AI creates a tailored demo script based on discovery findings and use case priorities." },
    { id: "de2", type: "meeting", actor: "AE", label: "Run Tailored Demo", description: "60-min demo focused on buyer's top 3 use cases with live product walkthrough." },
    { id: "de3", type: "decision", label: "Objections raised?", description: "If objections surface, route to objection handling play before proceeding." },
    { id: "de4", type: "agent", actor: "Agent", label: "Send No-Show Recovery", description: "If attendees no-show, trigger automated recovery sequence within 1 hour." },
    { id: "de5", type: "email", actor: "Email", label: "Send Demo Follow-Up", description: "ROI summary, recording link, and proposed next steps within 4 hours of demo." },
    { id: "de6", type: "manual", actor: "AE", label: "Request References", description: "Provide 2–3 relevant customer references matched to buyer's industry and use case." },
    { id: "de7", type: "milestone", label: "Move to Proposal", description: "Buyer confirms interest and requests proposal / pricing." },
  ]},
  { name: "Proposal", conversionRate: 68, winRate: 60, criteriaCount: 6, nodes: [
    { id: "p1", type: "agent", actor: "Agent", label: "Generate Proposal Draft", description: "AI drafts proposal from CRM data, discovery notes, and pricing model. AE reviews." },
    { id: "p2", type: "meeting", actor: "AE", label: "Proposal Walkthrough", description: "30-min call reviewing proposal terms, pricing, and implementation timeline." },
    { id: "p3", type: "decision", label: "Budget approved?", description: "Has the economic buyer confirmed budget allocation? If not, route to executive play." },
    { id: "p4", type: "email", actor: "Email", label: "Send Revised Proposal", description: "Updated terms reflecting negotiated changes. Include mutual action plan." },
    { id: "p5", type: "milestone", label: "Move to Negotiation", description: "Proposal accepted in principle. Move to final terms and legal review." },
  ]},
  { name: "Negotiation", conversionRate: 82, winRate: 80, criteriaCount: 5, nodes: [
    { id: "n1", type: "agent", actor: "Agent", label: "Run Competitive Intel Check", description: "Final competitive landscape scan. Surface any new threats or positioning changes." },
    { id: "n2", type: "meeting", actor: "AE", label: "Final Terms Meeting", description: "Align on contract terms, SLAs, payment schedule, and implementation dates." },
    { id: "n3", type: "decision", label: "Legal approval?", description: "Has legal reviewed and approved the MSA/SOW? Route to procurement if pending." },
    { id: "n4", type: "agent", actor: "Agent", label: "Procurement Unblock", description: "Trigger procurement acceleration play if contract review exceeds 7 days." },
    { id: "n5", type: "email", actor: "Email", label: "Send Final Agreement", description: "DocuSign or equivalent with final terms for countersignature." },
    { id: "n6", type: "milestone", label: "Closed Won", description: "Agreement signed. Trigger onboarding handoff sequence." },
  ]},
];

export type PlayCard = {
  id: string;
  title: string;
  trigger: string;
  recoveryRate: number;
  dealCount: number;
  stepCount: number;
};

export const blueprintPlays: PlayCard[] = [
  { id: "pl1",  title: "Pricing Concession Push",         trigger: "Buyer cites budget constraints after proposal delivery",       recoveryRate: 72, dealCount: 32, stepCount: 6 },
  { id: "pl2",  title: "Competitor Displacement",          trigger: "Competitor mentioned in 2+ consecutive calls",                 recoveryRate: 78, dealCount: 27, stepCount: 6 },
  { id: "pl3",  title: "Technical De-risking",             trigger: "Technical objection blocks advancement past demo stage",       recoveryRate: 55, dealCount: 40, stepCount: 4 },
  { id: "pl4",  title: "Closing The Loop Sequence",        trigger: "Deal stalled >14 days with no buyer response",                recoveryRate: 50, dealCount: 44, stepCount: 6 },
  { id: "pl5",  title: "Business Case Reset",              trigger: "Economic buyer questions ROI or value proposition",            recoveryRate: 50, dealCount: 38, stepCount: 4 },
  { id: "pl6",  title: "Customer Reference Drop",          trigger: "Buyer requests proof points or social validation",            recoveryRate: 61, dealCount: 35, stepCount: 1 },
  { id: "pl7",  title: "New Exec Bridge",                  trigger: "Executive sponsor changes mid-deal",                          recoveryRate: 79, dealCount: 22, stepCount: 4 },
  { id: "pl8",  title: "Reschedule Recovery",              trigger: "Key meeting cancelled or no-showed",                          recoveryRate: 50, dealCount: 51, stepCount: 4 },
  { id: "pl9",  title: "Internal Review Enablement",       trigger: "Champion needs help selling internally",                      recoveryRate: 44, dealCount: 33, stepCount: 6 },
  { id: "pl10", title: "Procurement / Security Unblock",   trigger: "Procurement or security review delays >7 days",               recoveryRate: 74, dealCount: 29, stepCount: 4 },
  { id: "pl11", title: "Multi-threading Push",             trigger: "Single-threaded deal detected past Stage 2",                  recoveryRate: 50, dealCount: 46, stepCount: 6 },
  { id: "pl12", title: "Use-case Reposition",              trigger: "Initial use case loses priority in buyer's roadmap",          recoveryRate: 68, dealCount: 25, stepCount: 4 },
  { id: "pl13", title: "Urgency Create",                   trigger: "No urgency driver or compelling event identified",            recoveryRate: 44, dealCount: 36, stepCount: 4 },
  { id: "pl14", title: "Build-vs-buy Rebuttal",            trigger: "Buyer suggests building in-house instead of purchasing",      recoveryRate: 56, dealCount: 30, stepCount: 6 },
  { id: "pl15", title: "Champion Succession",              trigger: "Champion leaves company or changes role",                     recoveryRate: 56, dealCount: 24, stepCount: 6 },
  { id: "pl16", title: "Executive Approval Push",          trigger: "Deal requires C-suite sign-off not yet secured",              recoveryRate: 53, dealCount: 31, stepCount: 4 },
  { id: "pl17", title: "Feature Update Re-engagement",     trigger: "Lost deal re-engageable due to new product capability",       recoveryRate: 50, dealCount: 28, stepCount: 4 },
  { id: "pl18", title: "Gift Re-engagement",               trigger: "Cold deal with no response in 30+ days",                     recoveryRate: 44, dealCount: 42, stepCount: 1 },
];

// =====================================================================
// Workflows
// =====================================================================
export type WorkflowStatus = "Completed" | "Stalled" | "Failed";

export type WorkflowRow = {
  id: string;
  name: string;
  apps: string[];
  schedule: "Daily" | "Weekly" | "Monthly";
  lastRunAt: string;
  lastRunStatus: WorkflowStatus;
  nextScheduledAt: string;
  enabled: boolean;
  description: string;
  accountSlug?: string;
};

export const workflows: WorkflowRow[] = [
  { id: "wf1", name: "Intent Score LinkedIn Audience Distribution", apps: ["LinkedIn"], schedule: "Daily", lastRunAt: "2026-05-04T08:00:00Z", lastRunStatus: "Completed", nextScheduledAt: "2026-05-05T08:00:00Z", enabled: true, description: "Segments high-intent accounts into separate LinkedIn ad audiences by tier, refreshed daily." },
  { id: "wf2", name: "Hot & On Fire Accounts to Outreach", apps: ["HubSpot", "Outreach"], schedule: "Weekly", lastRunAt: "2026-05-01T09:00:00Z", lastRunStatus: "Completed", nextScheduledAt: "2026-05-08T09:00:00Z", enabled: true, description: "Pulls hot accounts weekly, discovers and enriches contacts, syncs to Salesforce, then enrolls them in a targeted Outreach sequence." },
  { id: "wf3", name: "Signal Discovery + Multi-Routing", apps: ["LinkedIn", "Slack", "Outreach"], schedule: "Monthly", lastRunAt: "2026-04-15T06:00:00Z", lastRunStatus: "Stalled", nextScheduledAt: "2026-05-15T06:00:00Z", enabled: true, description: "Monthly deep signal discovery using AI to research accounts, then fan-routing them to different channels based on filter conditions." },
  { id: "wf4", name: "Cloudflare Expansion Signal Alerts", apps: ["Slack", "Salesforce"], schedule: "Daily", lastRunAt: "2026-05-04T07:30:00Z", lastRunStatus: "Completed", nextScheduledAt: "2026-05-05T07:30:00Z", enabled: false, description: "Monitors Cloudflare account for expansion signals and pushes alerts to the CSM Slack channel.", accountSlug: "cloudflare-inc" },
  { id: "wf5", name: "Snowflake Renewal Health Tracker", apps: ["Salesforce", "Slack"], schedule: "Weekly", lastRunAt: "2026-04-28T10:00:00Z", lastRunStatus: "Failed", nextScheduledAt: "2026-05-05T10:00:00Z", enabled: true, description: "Tracks Snowflake health metrics weekly and alerts on score drops. Syncs to CRM.", accountSlug: "snowflake-inc" },
  { id: "wf6", name: "GitLab Adoption Drip Campaign", apps: ["Outreach", "Salesforce"], schedule: "Weekly", lastRunAt: "2026-04-30T11:00:00Z", lastRunStatus: "Completed", nextScheduledAt: "2026-05-07T11:00:00Z", enabled: true, description: "Sends adoption nurture emails to low-usage GitLab teams and syncs engagement back to CRM.", accountSlug: "gitlab-inc" },
];

export type WfNodeCategory = "source" | "destination" | "transformation" | "logic";

export type WfCanvasNode = {
  id: string;
  type: string;
  category: WfNodeCategory;
  label: string;
  x: number;
  y: number;
  description: string;
};

export type WfCanvasEdge = {
  from: string;
  to: string;
  label?: string;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  nodes: WfCanvasNode[];
  edges: WfCanvasEdge[];
};

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: "wf1",
    name: "Intent Score LinkedIn Audience Distribution",
    nodes: [
      { id: "n1", type: "source", category: "source", label: "Source: Accounts", x: 60, y: 200, description: "Filter accounts by Intent Score: Hot, On Fire, Warm" },
      { id: "n2", type: "contact-discovery", category: "transformation", label: "Contact Discovery", x: 300, y: 200, description: "Find contacts based on personas" },
      { id: "n3", type: "branching", category: "logic", label: "Branching", x: 540, y: 200, description: "Fan out into all matching branches simultaneously" },
      { id: "n4", type: "filter", category: "logic", label: "Filter: Tier 1", x: 780, y: 80, description: "Strategic accounts only" },
      { id: "n5", type: "filter", category: "logic", label: "Filter: Tier 2", x: 780, y: 200, description: "Enterprise accounts only" },
      { id: "n6", type: "filter", category: "logic", label: "Filter: Tier 3", x: 780, y: 320, description: "Growth accounts only" },
      { id: "n7", type: "linkedin", category: "destination", label: "LinkedIn: Tier 1 Audience", x: 1020, y: 80, description: "Upload to LinkedIn ads audience" },
      { id: "n8", type: "linkedin", category: "destination", label: "LinkedIn: Tier 2 Audience", x: 1020, y: 200, description: "Upload to LinkedIn ads audience" },
      { id: "n9", type: "linkedin", category: "destination", label: "LinkedIn: Tier 3 Audience", x: 1020, y: 320, description: "Upload to LinkedIn ads audience" },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" },
      { from: "n3", to: "n4" }, { from: "n3", to: "n5" }, { from: "n3", to: "n6" },
      { from: "n4", to: "n7" }, { from: "n5", to: "n8" }, { from: "n6", to: "n9" },
    ],
  },
  {
    id: "wf2",
    name: "Hot & On Fire Accounts to Outreach",
    nodes: [
      { id: "n1", type: "source", category: "source", label: "Source: Custom Filter", x: 60, y: 160, description: "1 custom filter: Intent = Hot, On Fire" },
      { id: "n2", type: "contact-discovery", category: "transformation", label: "Contact Discovery", x: 300, y: 160, description: "Find decision-makers and champions" },
      { id: "n3", type: "contact-enrichment", category: "transformation", label: "Contact Enrichment", x: 540, y: 160, description: "Enrich with emails, phones, titles" },
      { id: "n4", type: "salesforce", category: "destination", label: "Salesforce: Sync", x: 780, y: 160, description: "Create or update contact records in CRM" },
      { id: "n5", type: "outreach", category: "destination", label: "Outreach: Sequence", x: 1020, y: 160, description: "Enroll in targeted outreach sequence" },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" }, { from: "n4", to: "n5" },
    ],
  },
  {
    id: "wf3",
    name: "Signal Discovery + Multi-Routing",
    nodes: [
      { id: "n1", type: "source", category: "source", label: "Source: Saved View", x: 60, y: 200, description: "From a saved account view with signal criteria" },
      { id: "n2", type: "ai-research", category: "transformation", label: "AI: Research Companies", x: 300, y: 200, description: "Use AI to research companies, extract signals and insights" },
      { id: "n3", type: "branching", category: "logic", label: "Branching", x: 540, y: 200, description: "Fan out into all matching branches" },
      { id: "n4", type: "filter", category: "logic", label: "Filter: Ad-ready", x: 780, y: 80, description: "Accounts matching ad targeting criteria" },
      { id: "n5", type: "filter", category: "logic", label: "Filter: Alert-worthy", x: 780, y: 200, description: "High-urgency signals needing team attention" },
      { id: "n6", type: "filter", category: "logic", label: "Filter: Sequence-ready", x: 780, y: 320, description: "Accounts ready for outbound sequence" },
      { id: "n7", type: "linkedin", category: "destination", label: "LinkedIn: Ad Audience", x: 1020, y: 80, description: "Upload to LinkedIn ads audience" },
      { id: "n8", type: "slack", category: "destination", label: "Slack: Alert Channel", x: 1020, y: 200, description: "Send signal alert to #revenue-signals" },
      { id: "n9", type: "contact-discovery", category: "transformation", label: "Contact Discovery", x: 1020, y: 320, description: "Find contacts for outreach" },
      { id: "n10", type: "contact-enrichment", category: "transformation", label: "Contact Enrichment", x: 1260, y: 320, description: "Enrich with contact data" },
      { id: "n11", type: "outreach", category: "destination", label: "Outreach: Enroll", x: 1500, y: 320, description: "Enroll in targeted sequence" },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" },
      { from: "n3", to: "n4" }, { from: "n3", to: "n5" }, { from: "n3", to: "n6" },
      { from: "n4", to: "n7" }, { from: "n5", to: "n8" },
      { from: "n6", to: "n9" }, { from: "n9", to: "n10" }, { from: "n10", to: "n11" },
    ],
  },
  {
    id: "wf4",
    name: "Cloudflare Expansion Signal Alerts",
    nodes: [
      { id: "n1", type: "source", category: "source", label: "Source: Cloudflare Account", x: 60, y: 160, description: "Monitor Cloudflare account for expansion signals" },
      { id: "n2", type: "ai-research", category: "transformation", label: "AI: Signal Analysis", x: 300, y: 160, description: "Analyze usage patterns and expansion indicators" },
      { id: "n3", type: "filter", category: "logic", label: "Filter: High Priority", x: 540, y: 160, description: "Only pass signals scoring above threshold" },
      { id: "n4", type: "salesforce", category: "destination", label: "Salesforce: Update Opp", x: 780, y: 100, description: "Update opportunity record with expansion signals" },
      { id: "n5", type: "slack", category: "destination", label: "Slack: CSM Alert", x: 780, y: 220, description: "Alert CSM team channel with signal summary" },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" },
      { from: "n3", to: "n4" }, { from: "n3", to: "n5" },
    ],
  },
  {
    id: "wf5",
    name: "Snowflake Renewal Health Tracker",
    nodes: [
      { id: "n1", type: "source", category: "source", label: "Source: Snowflake Account", x: 60, y: 160, description: "Pull Snowflake health metrics weekly" },
      { id: "n2", type: "ai-research", category: "transformation", label: "AI: Health Scoring", x: 300, y: 160, description: "Calculate composite health score from usage, NPS, and engagement" },
      { id: "n3", type: "branching", category: "logic", label: "Branching", x: 540, y: 160, description: "Route based on health score change" },
      { id: "n4", type: "filter", category: "logic", label: "Filter: Score Drop", x: 780, y: 80, description: "Health score decreased >5 points" },
      { id: "n5", type: "filter", category: "logic", label: "Filter: Stable/Up", x: 780, y: 240, description: "Health score stable or improved" },
      { id: "n6", type: "slack", category: "destination", label: "Slack: Urgent Alert", x: 1020, y: 80, description: "Alert #renewal-risk channel immediately" },
      { id: "n7", type: "salesforce", category: "destination", label: "Salesforce: Log", x: 1020, y: 240, description: "Log health metrics to CRM" },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" },
      { from: "n3", to: "n4" }, { from: "n3", to: "n5" },
      { from: "n4", to: "n6" }, { from: "n5", to: "n7" },
    ],
  },
  {
    id: "wf6",
    name: "GitLab Adoption Drip Campaign",
    nodes: [
      { id: "n1", type: "source", category: "source", label: "Source: GitLab Teams", x: 60, y: 160, description: "Identify low-usage GitLab teams from adoption data" },
      { id: "n2", type: "contact-discovery", category: "transformation", label: "Contact Discovery", x: 300, y: 160, description: "Find team leads and admins for low-usage teams" },
      { id: "n3", type: "contact-enrichment", category: "transformation", label: "Contact Enrichment", x: 540, y: 160, description: "Enrich with emails, titles, and engagement history" },
      { id: "n4", type: "outreach", category: "destination", label: "Outreach: Nurture Seq", x: 780, y: 100, description: "Enroll in adoption nurture email sequence" },
      { id: "n5", type: "salesforce", category: "destination", label: "Salesforce: Sync", x: 780, y: 220, description: "Sync engagement data back to CRM records" },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" },
      { from: "n3", to: "n4" }, { from: "n3", to: "n5" },
    ],
  },
];

export type WorkflowRun = {
  id: string;
  workflowId: string;
  status: "Completed" | "Stalled" | "Failed";
  startedAt: string;
  duration: number;
  recordsProcessed: number;
};

export const workflowRuns: WorkflowRun[] = [
  { id: "wr1",  workflowId: "wf1", status: "Completed", startedAt: "2026-05-04T08:00:00Z", duration: 42,  recordsProcessed: 184 },
  { id: "wr2",  workflowId: "wf1", status: "Completed", startedAt: "2026-05-03T08:00:00Z", duration: 38,  recordsProcessed: 179 },
  { id: "wr3",  workflowId: "wf1", status: "Completed", startedAt: "2026-05-02T08:00:00Z", duration: 45,  recordsProcessed: 192 },
  { id: "wr4",  workflowId: "wf2", status: "Completed", startedAt: "2026-05-01T09:00:00Z", duration: 128, recordsProcessed: 47  },
  { id: "wr5",  workflowId: "wf2", status: "Completed", startedAt: "2026-04-24T09:00:00Z", duration: 115, recordsProcessed: 52  },
  { id: "wr6",  workflowId: "wf3", status: "Stalled",   startedAt: "2026-04-15T06:00:00Z", duration: 340, recordsProcessed: 89  },
  { id: "wr7",  workflowId: "wf3", status: "Completed", startedAt: "2026-03-15T06:00:00Z", duration: 290, recordsProcessed: 124 },
  { id: "wr8",  workflowId: "wf5", status: "Failed",    startedAt: "2026-04-28T10:00:00Z", duration: 12,  recordsProcessed: 0   },
  { id: "wr9",  workflowId: "wf4", status: "Completed", startedAt: "2026-05-04T07:30:00Z", duration: 18,  recordsProcessed: 12  },
  { id: "wr10", workflowId: "wf6", status: "Completed", startedAt: "2026-04-30T11:00:00Z", duration: 65,  recordsProcessed: 34  },
];
