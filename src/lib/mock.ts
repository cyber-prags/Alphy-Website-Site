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

// Pipeline / lifecycle stage. Customers progress through onboarding → adoption → ...
// Prospects progress through prospecting → qualification → ... → negotiation → closed.
export type LifecycleStage =
  | "Prospecting" | "Qualified" | "Discovery" | "Demo" | "Proposal" | "Negotiation" | "Closing"
  | "Onboarding" | "Adopting"  | "Expanding" | "Renewing" | "At Risk" | "Stable"
  | "Churned";

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
  /** Where this account sits in its lifecycle. Optional — derived if missing. */
  dealStage?: LifecycleStage;
  /** Pipeline-heat score (0-100): how active / promising the deal is *right now*.
   *  For prospects this replaces the customer "expansion / fit" score in the
   *  book-of-business UI. Optional — derived if missing. */
  pipelineHeat?: number;
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
  { id: "ac1",  name: "Stripe, Inc.", domain: "stripe.com", segment: "Enterprise", industry: "Financial Services · Payments", employees: 8400, arr: 0, status: "Prospect", owner: "Sarah Chen",   ownerInitials: "SC", openDeals: 1, pipelineValue: 200000, lastTouch: "2026-04-29", health: "medium", hq: "South San Francisco, CA" },
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
  // ── Additional accounts — diverse industries / stages ─────────────
  { id: "ac26", name: "Notion Labs",               domain: "notion.so",          segment: "Mid-Market", industry: "Productivity SaaS",   employees:  610, arr:      0, status: "Prospect", owner: "Sarah Chen",   ownerInitials: "SC", openDeals: 1, pipelineValue: 165000, lastTouch: "2026-05-04", health: "high",   hq: "San Francisco, CA" },
  { id: "ac27", name: "Figma, Inc.",               domain: "figma.com",          segment: "Mid-Market", industry: "Design Software",     employees:  900, arr:      0, status: "Prospect", owner: "Rachel Kim",   ownerInitials: "RK", openDeals: 1, pipelineValue: 220000, lastTouch: "2026-05-02", health: "high",   hq: "San Francisco, CA" },
  { id: "ac28", name: "Atlassian Corporation",     domain: "atlassian.com",      segment: "Enterprise", industry: "Collaboration",       employees: 9500, arr: 410000, status: "Customer", owner: "Mike Torres",  ownerInitials: "MT", openDeals: 0, pipelineValue:      0, lastTouch: "2026-04-30", health: "high",   hq: "Sydney, AU" },
  { id: "ac29", name: "ServiceNow Inc.",           domain: "servicenow.com",     segment: "Enterprise", industry: "Workflow Automation", employees: 21500,arr:      0, status: "Prospect", owner: "Tom Walker",   ownerInitials: "TW", openDeals: 1, pipelineValue: 480000, lastTouch: "2026-05-03", health: "high",   hq: "Santa Clara, CA" },
  { id: "ac30", name: "Walmart Inc.",              domain: "walmart.com",        segment: "Enterprise", industry: "Retail",              employees:21000, arr:      0, status: "Prospect", owner: "Lisa Park",    ownerInitials: "LP", openDeals: 1, pipelineValue: 540000, lastTouch: "2026-04-29", health: "medium", hq: "Bentonville, AR" },
  { id: "ac31", name: "Pfizer Inc.",               domain: "pfizer.com",         segment: "Enterprise", industry: "Pharmaceuticals",     employees:14000, arr:      0, status: "Prospect", owner: "Paul Acker",   ownerInitials: "PA", openDeals: 1, pipelineValue: 290000, lastTouch: "2026-04-27", health: "medium", hq: "New York, NY" },
  { id: "ac32", name: "Toyota Motor Corp.",        domain: "toyota.com",         segment: "Enterprise", industry: "Automotive",          employees:18500, arr:      0, status: "Prospect", owner: "Brad Allen",   ownerInitials: "BA", openDeals: 1, pipelineValue: 320000, lastTouch: "2026-04-25", health: "high",   hq: "Toyota City, JP" },
  { id: "ac33", name: "Twilio Inc.",               domain: "twilio.com",         segment: "Enterprise", industry: "Cloud Communications",employees: 8100, arr: 380000, status: "Customer", owner: "Sarah Chen",   ownerInitials: "SC", openDeals: 1, pipelineValue: 150000, lastTouch: "2026-05-05", health: "high",   hq: "San Francisco, CA" },
  { id: "ac34", name: "Anthropic, PBC",            domain: "anthropic.com",      segment: "Mid-Market", industry: "AI · Foundation Models",employees: 1100,arr:      0, status: "Prospect", owner: "Rachel Kim",   ownerInitials: "RK", openDeals: 1, pipelineValue: 280000, lastTouch: "2026-05-06", health: "high",   hq: "San Francisco, CA" },
  { id: "ac35", name: "Dropbox, Inc.",             domain: "dropbox.com",        segment: "Enterprise", industry: "Cloud Storage",       employees: 2400, arr: 220000, status: "Customer", owner: "Paul Acker",   ownerInitials: "PA", openDeals: 0, pipelineValue:      0, lastTouch: "2026-04-21", health: "medium", hq: "San Francisco, CA" },
];

const tierFor = (s: AccountSeed): Tier =>
  s.segment === "Enterprise" ? "Enterprise" : s.segment === "Mid-Market" ? "Growth" : "Growth";

// Per-account stage + heat. Coupled to id so the table is deterministic but
// each account still has a coherent "where in the funnel/lifecycle am I" story.
const STAGE_BY_ID: Record<string, { stage: LifecycleStage; heat: number }> = {
  ac1:  { stage: "Discovery",   heat: 62 },   // Stripe — prospect, mid-funnel
  ac2:  { stage: "At Risk",     heat: 30 },   // Snowflake — sponsor silent
  ac3:  { stage: "Demo",        heat: 78 },   // Datadog — prospect
  ac4:  { stage: "Negotiation", heat: 84 },   // Shopify — late stage
  ac5:  { stage: "Qualified",   heat: 55 },   // Rivian
  ac6:  { stage: "Discovery",   heat: 60 },   // NextEra
  ac7:  { stage: "Proposal",    heat: 72 },   // Siemens
  ac8:  { stage: "Negotiation", heat: 88 },   // Lockheed Martin
  ac9:  { stage: "Qualified",   heat: 48 },   // Telstra
  ac10: { stage: "Demo",        heat: 70 },   // MongoDB
  ac11: { stage: "Expanding",   heat: 92 },   // Cloudflare — VP promoted
  ac12: { stage: "Demo",        heat: 66 },   // Vercel
  ac13: { stage: "Discovery",   heat: 58 },   // Linear
  ac14: { stage: "Churned",     heat: 12 },   // Patagonia
  ac15: { stage: "Churned",     heat: 10 },   // Comcast
  ac16: { stage: "Proposal",    heat: 65 },   // Raytheon
  ac17: { stage: "Expanding",   heat: 86 },   // Tableau
  ac18: { stage: "Renewing",    heat: 81 },   // Akamai
  ac19: { stage: "Prospecting", heat: 42 },   // International Paper
  ac20: { stage: "Qualified",   heat: 60 },   // Sephora
  ac21: { stage: "Discovery",   heat: 58 },   // Latham & Watkins
  ac22: { stage: "Proposal",    heat: 79 },   // HSBC
  ac23: { stage: "At Risk",     heat: 50 },   // GitLab — usage drop
  ac24: { stage: "Qualified",   heat: 64 },   // Boston Dynamics
  ac25: { stage: "Demo",        heat: 56 },   // Asana
  ac26: { stage: "Demo",        heat: 71 },   // Notion
  ac27: { stage: "Proposal",    heat: 80 },   // Figma
  ac28: { stage: "Stable",      heat: 78 },   // Atlassian
  ac29: { stage: "Discovery",   heat: 68 },   // ServiceNow
  ac30: { stage: "Negotiation", heat: 75 },   // Walmart
  ac31: { stage: "Qualified",   heat: 52 },   // Pfizer
  ac32: { stage: "Demo",        heat: 70 },   // Toyota
  ac33: { stage: "Stable",      heat: 76 },   // Twilio
  ac34: { stage: "Discovery",   heat: 82 },   // Anthropic
  ac35: { stage: "Adopting",    heat: 64 },   // Dropbox
};

export const accounts: Account[] = accountSeeds.map((s) => {
  const d = ACCOUNT_DECORATIONS[s.id] ?? {};
  const sh = STAGE_BY_ID[s.id];
  // Default stage when id-specific seed is missing
  const fallbackStage: LifecycleStage =
    s.status === "Customer" ? "Stable" :
    s.status === "Churned"  ? "Churned" : "Discovery";
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
    dealStage:     sh?.stage       ?? fallbackStage,
    pipelineHeat:  sh?.heat        ?? (s.health === "high" ? 70 : s.health === "medium" ? 50 : 25),
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
export type AgentKind =
  | "multithread" | "revive" | "prep" | "enrich" | "followup" | "objection"
  | "proposal" | "exec" | "battlecard" | "hygiene" | "forecast" | "content"
  | "renewal" | "adoption" | "outcomes" | "qbr" | "signals"
  | "coaching" | "capacity" | "stakeholder" | "expansion" | "champion"
  | "tickets" | "advocacy" | "onboarding";

export type AgentPersona = "ae" | "am" | "csm" | "manager";

export type Agent = {
  id: string;
  name: string;
  role: "Sales" | "Revenue Operations" | "Customer Success";
  installed: boolean;
  ours: boolean;
  description: string;
  /** Use case category — drives icon + colour in the marketplace card */
  kind: AgentKind;
  /** Which personas typically install this agent */
  personas: AgentPersona[];
  /** One-line use case shown beneath the description */
  useCase?: string;
};

export const agents: Agent[] = [
  // ── Sales (AE primary) ──
  { id: "a1",  name: "Dylan, the Multithreader",        role: "Sales",                installed: true,  ours: true,  kind: "multithread", personas: ["ae", "am"],            description: "Helps AEs multithread into active opportunities at Proposal to keep momentum.", useCase: "When a deal stalls past Proposal, surfaces 3 net-new contacts." },
  { id: "a2",  name: "Max, the Momentum Reviver",       role: "Sales",                installed: true,  ours: true,  kind: "revive",      personas: ["ae"],                  description: "Revives stalled opportunities the moment fresh budget hits your accounts.", useCase: "Cross-references funding announcements with stuck deals." },
  { id: "a3",  name: "Jackie, the Pre-Meeting Prepper", role: "Sales",                installed: true,  ours: true,  kind: "prep",        personas: ["ae", "am", "csm"],     description: "Builds sharp call briefs from calendar, CRM, and LinkedIn so you walk in with angles.", useCase: "Auto-fires 30 min before any external meeting." },
  { id: "a5",  name: "Nova, the Follow-Up Finisher",    role: "Sales",                installed: false, ours: false, kind: "followup",    personas: ["ae", "am"],            description: "Drafts personalized post-call emails, logs next steps, and schedules tasks in CRM.", useCase: "Listens to Gong recordings and drafts within 5 minutes of call end." },
  { id: "a6",  name: "Aria, the Objection Handler",     role: "Sales",                installed: false, ours: false, kind: "objection",   personas: ["ae"],                  description: "Spots objections in calls/emails and drafts tailored responses with proof points.", useCase: "Pattern-matches against your library of won-lost objections." },
  { id: "a7",  name: "Bruno, the Proposal Polisher",    role: "Sales",                installed: false, ours: false, kind: "proposal",    personas: ["ae", "am"],            description: "Generates proposal value recaps and exec cover notes; flags gaps before you hit send.", useCase: "Reviews every proposal pre-send for missing ROI math." },
  { id: "a8",  name: "Soren, the Exec Door-Opener",     role: "Sales",                installed: false, ours: false, kind: "exec",        personas: ["ae", "am", "manager"], description: "Finds the Economic Buyer and crafts executive-level outreach to secure the next meeting.", useCase: "Maps the buying committee from LinkedIn + email signals." },
  { id: "a12", name: "Content Curator",                  role: "Sales",                installed: false, ours: false, kind: "content",     personas: ["ae", "am"],            description: "Recommends the right asset for the right deal moment.", useCase: "Surfaces the case study that matches the prospect's industry + stage." },

  // ── Revenue Operations (AE & Manager) ──
  { id: "a4",  name: "Eli, the Enrichment Agent",       role: "Revenue Operations",   installed: true,  ours: false, kind: "enrich",      personas: ["ae", "am", "manager"], description: "Auto-enriches new leads/contacts with firmographics and roles, de-dupes, and fills CRM fields.", useCase: "Triggers when any new contact lands in Salesforce." },
  { id: "a9",  name: "Lena, the Battlecard Builder",    role: "Revenue Operations",   installed: false, ours: false, kind: "battlecard",  personas: ["ae", "manager"],       description: "Maintains live competitive battlecards from won/lost-call signals.", useCase: "Updates battlecards weekly from the latest call transcripts." },
  { id: "a10", name: "Quinn, the Hygiene Hawk",         role: "Revenue Operations",   installed: false, ours: false, kind: "hygiene",     personas: ["manager"],             description: "Continuous CRM data hygiene — missing fields, stale records, ownership rot.", useCase: "Daily sweep flagging records below your data-quality bar." },
  { id: "a11", name: "Veda, the Forecast Whisperer",    role: "Revenue Operations",   installed: false, ours: false, kind: "forecast",    personas: ["ae", "manager"],       description: "Surfaces deals that should move forecast categories before the manager review.", useCase: "Pre-Monday digest of deals to recategorise." },

  // ── Customer Success (CSM primary) ──
  { id: "cs1", name: "Renewal Risk Monitor",            role: "Customer Success",     installed: true,  ours: true,  kind: "renewal",     personas: ["csm", "manager", "am"], description: "Tracks renewal health across your book — flags accounts where score drops >8pts or renewal is <60 days away.", useCase: "Daily scan that lands on the CSM home as save plays." },
  { id: "cs2", name: "Adoption Watchdog",               role: "Customer Success",     installed: true,  ours: true,  kind: "adoption",    personas: ["csm", "am"],           description: "Monitors WAU/MAU, feature engagement, and seat utilization. Fires when adoption diverges from trajectory.", useCase: "Compares your account to the typical adoption curve at this stage." },
  { id: "cs3", name: "Outcomes Tracker",                role: "Customer Success",     installed: true,  ours: true,  kind: "outcomes",    personas: ["csm", "am", "manager"], description: "Correlates product usage with committed customer outcomes. Surfaces gaps before your next QBR.", useCase: "Weekly pre-QBR sweep flagging outcomes <50% with 14d to QBR." },
  { id: "cs4", name: "QBR Composer",                    role: "Customer Success",     installed: false, ours: true,  kind: "qbr",         personas: ["csm", "am"],           description: "Assembles QBR decks from Mixpanel, Zendesk, and outcomes data — export-ready, branded per account.", useCase: "On-demand: generates a 10-slide deck before any QBR." },
  { id: "cs5", name: "Signals Scout",                   role: "Customer Success",     installed: false, ours: true,  kind: "signals",     personas: ["csm", "am", "manager"], description: "Scans LinkedIn, job boards, and call transcripts for org changes, hiring signals, and exec moves.", useCase: "Real-time: pushes champion changes into the activity feed." },
  { id: "cs6", name: "Champion Tracker",                role: "Customer Success",     installed: false, ours: true,  kind: "champion",    personas: ["csm", "am"],           description: "Watches sponsor activity across calls, email, and LinkedIn — alerts when a champion goes quiet.", useCase: "Triggers a save play when sponsor silent ≥10 days within 90d of renewal." },
  { id: "cs7", name: "Ticket Spike Sentry",             role: "Customer Success",     installed: false, ours: true,  kind: "tickets",     personas: ["csm"],                 description: "Detects abnormal sev-2/sev-1 ticket clusters and flags accounts before SLA breach.", useCase: "Watches Zendesk/Intercom for thematic spikes by account." },
  { id: "cs8", name: "Advocacy Spotter",                role: "Customer Success",     installed: false, ours: true,  kind: "advocacy",    personas: ["csm", "manager"],      description: "Finds your happiest customers and queues case-study + reference candidates with one click.", useCase: "Promoter NPS + high WAU/MAU + recent win = candidate." },
  { id: "cs9", name: "Onboarding Pacer",                role: "Customer Success",     installed: false, ours: true,  kind: "onboarding",  personas: ["csm"],                 description: "Tracks new customer onboarding milestones vs. plan and nudges when steps slip.", useCase: "Activated on signature — auto-checks SSO, kickoff, training dates." },

  // ── Account Manager primary ──
  { id: "am1", name: "Stakeholder Mapper",              role: "Sales",                installed: false, ours: true,  kind: "stakeholder", personas: ["am", "ae"],            description: "Maintains a living buying-committee map per account — champion / EB / technical / end-user / procurement.", useCase: "Re-runs weekly using calendar + email + LinkedIn." },
  { id: "am2", name: "Expansion Case Builder",          role: "Sales",                installed: false, ours: true,  kind: "expansion",   personas: ["am"],                  description: "Drafts the business case for any expansion play — ROI math, comparable wins, exec cover note.", useCase: "On-demand from any account workspace." },

  // ── Manager primary ──
  { id: "mgr1", name: "Coaching Co-Pilot",              role: "Revenue Operations",   installed: false, ours: true,  kind: "coaching",    personas: ["manager"],             description: "Pre-1:1 brief on every rep — what changed, deals stuck, talk-track patterns from Gong.", useCase: "Generates a 1-page brief 30 min before each scheduled 1:1." },
  { id: "mgr2", name: "Capacity Watchdog",              role: "Revenue Operations",   installed: false, ours: true,  kind: "capacity",    personas: ["manager"],             description: "Watches account-to-rep workload across the team and recommends rebalances.", useCase: "Alerts when a rep crosses 75 workload score with at-risk renewals." },
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

export type Subtask = { id: string; label: string; done: boolean };
export type TaskComment = { id: string; author: string; authorInitials: string; text: string; at: string };
export type TaskTemplate = { id: string; name: string; kinds: QueueKind[]; subtasks: string[] };

export const taskTemplates: TaskTemplate[] = [
  { id: "tpl-renewal", name: "Renewal Outreach", kinds: ["renewal", "risk"], subtasks: [
    "Review health score & usage trends", "Check contract terms & pricing history", "Draft re-engagement email",
    "Identify backup champion", "Schedule internal sync with AE",
  ]},
  { id: "tpl-qbr", name: "QBR Prep", kinds: ["prep"], subtasks: [
    "Pull usage metrics for last 90 days", "Prepare success highlights deck", "Draft proposed success plan for next quarter",
    "Collect internal feedback from support team", "Schedule dry-run with manager",
  ]},
  { id: "tpl-expansion", name: "Expansion Play", kinds: ["expansion", "deal"], subtasks: [
    "Validate expansion signal with champion", "Build ROI model with comparables", "Draft business case one-pager",
    "Identify procurement stakeholders", "Loop in AE for joint proposal",
  ]},
  { id: "tpl-risk", name: "At-Risk Recovery", kinds: ["risk", "adoption"], subtasks: [
    "Diagnose root cause (usage, sentiment, competition)", "Draft recovery action plan", "Schedule executive sponsor call",
    "Prepare competitive displacement defence", "Set 14-day re-check milestone",
  ]},
];

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
  subtasks?: Subtask[];
  comments?: TaskComment[];
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
    why: "Champion hasn't replied to your last 3 emails. Health score 41. Re-engagement note drafted.", primary: "Send re-engage", secondary: "Snooze 1d", ago: "1h", due: "Today", overdue: true, personas: ["csm", "am", "manager"],
    subtasks: [
      { id: "st-r1", label: "Review health score & usage trends", done: true },
      { id: "st-r2", label: "Check contract terms & pricing history", done: true },
      { id: "st-r3", label: "Draft re-engagement email", done: true },
      { id: "st-r4", label: "Identify backup champion", done: false },
      { id: "st-r5", label: "Schedule internal sync with AE", done: false },
    ],
    comments: [
      { id: "tc-r1", author: "Sarah Chen", authorInitials: "SC", text: "Reached out to Brad Wallace on LinkedIn — no response yet. May need exec-to-exec outreach.", at: "2026-05-04T14:30:00Z" },
      { id: "tc-r2", author: "Walid Qayoumi", authorInitials: "WQ", text: "Escalating to VP Sales for sponsor call. Let's sync tomorrow AM.", at: "2026-05-05T09:15:00Z" },
    ],
  },
  { id: "q-gitlab",       kind: "adoption",  account: "GitLab Inc.",       target: { type: "account", slug: "gitlab-inc" },         headline: "GitLab: WAU/MAU dropped 0.62 → 0.48 in 14 days",
    why: "Three teams stopped using AI features last week. Renewal in 64 days. Health dropped 9 points.", primary: "Open usage drill-down", secondary: "Draft note", ago: "1h", personas: ["csm", "manager"] },
  { id: "q-edge-qbr",     kind: "prep",      account: "Akamai",        target: { type: "account", slug: "akamai-technologies" },      headline: "Akamai QBR is 14 days overdue",
    why: "No QBR since Jan. AI usage 'Concerning'. Risk of expansion slipping if Q2 narrative isn't reset before May.", primary: "Schedule QBR", secondary: "Snooze 3d", ago: "yesterday", due: "Apr 30", overdue: false, personas: ["csm", "am"] },

  // Pure expansion → AM only (with manager visibility)
  { id: "q-cloudflare",    kind: "expansion", account: "Cloudflare, Inc.",   target: { type: "account", slug: "cloudflare-inc" },     headline: "Cloudflare: VP Eng promoted — expansion door opens",
    why: "Maya Chen promoted to VP Eng. Budget now spans Networking + Security where adoption is 0%. Pattern matches 3 prior $180K avg expansions.", primary: "Build case", secondary: "Loop in AE", ago: "12m", personas: ["am", "manager"],
    subtasks: [
      { id: "st-c1", label: "Validate expansion signal with champion", done: true },
      { id: "st-c2", label: "Build ROI model with comparables", done: false },
      { id: "st-c3", label: "Draft business case one-pager", done: false },
      { id: "st-c4", label: "Identify procurement stakeholders", done: false },
    ],
    comments: [
      { id: "tc-c1", author: "Brad Allen", authorInitials: "BA", text: "Maya confirmed interest in Revenue Intel for the Security org. Let's prioritise the ROI model this week.", at: "2026-05-05T11:00:00Z" },
    ],
  },
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
  category: "Hiring & Org" | "Usage" | "Renewal" | "Expansion" | "Competitive" | "Champion Change";
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
    lastQbrDays: 0, hq: "South San Francisco, CA", industry: "Financial Services · Payments", employees: 8400,
    stakeholders: [
      { name: "Patrick Mendez",    title: "Co-CEO",                       role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",   daysSilent:  9, department: "Executive" },
      { name: "Lila Ortega",       title: "CTO",                          role: "Decision Maker", sentiment: "supportive", lastTouch: "3d ago",   daysSilent:  3, department: "Engineering", reportsTo: "Patrick Mendez" },
      { name: "Daniel Reeves",     title: "VP Payments Engineering",      role: "Champion",       sentiment: "supportive", lastTouch: "today",    daysSilent:  0, department: "Engineering", reportsTo: "Lila Ortega" },
      { name: "Caleb Brown",       title: "VP Risk & Fraud",              role: "Decision Maker", sentiment: "neutral",    lastTouch: "5d ago",   daysSilent:  5, department: "Operations",  reportsTo: "Patrick Mendez" },
      { name: "Anita Iyer",        title: "Director of Compliance",       role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",   daysSilent:  2, department: "Operations",  reportsTo: "Caleb Brown" },
      { name: "Felipe Castro",     title: "Head of Treasury Operations",  role: "Influencer",     sentiment: "neutral",    lastTouch: "8d ago",   daysSilent:  8, department: "Finance",     reportsTo: "Patrick Mendez" },
      { name: "Ben Ito",           title: "Director of FP&A",             role: "Decision Maker", sentiment: "neutral",    lastTouch: "12d ago",  daysSilent: 12, department: "Finance",     reportsTo: "Felipe Castro" },
      { name: "Mei Chen",          title: "Senior PM · Payments",         role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",   daysSilent:  1, department: "Product",     reportsTo: "Daniel Reeves" },
      { name: "Henry Kwon",        title: "Lead Engineer · Platform",     role: "User",           sentiment: "supportive", lastTouch: "today",    daysSilent:  0, department: "Engineering", reportsTo: "Daniel Reeves" },
      { name: "Yuki Tanaka",       title: "Staff Engineer · Issuing",     role: "User",           sentiment: "supportive", lastTouch: "2d ago",   daysSilent:  2, department: "Engineering", reportsTo: "Daniel Reeves" },
      { name: "Sarah Liu",         title: "Director of Procurement",      role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago",  daysSilent: 11, department: "Finance",     reportsTo: "Ben Ito" },
      { name: "Roger Jain",        title: "Head of Information Security", role: "Decision Maker", sentiment: "neutral",    lastTouch: "16d ago",  daysSilent: 16, department: "Operations",  reportsTo: "Caleb Brown" },
      { name: "Lara Schultz",      title: "Senior Compliance Analyst",    role: "User",           sentiment: "supportive", lastTouch: "4d ago",   daysSilent:  4, department: "Operations",  reportsTo: "Anita Iyer" },
      { name: "Tom Bryant",        title: "VP Sales · Enterprise",        role: "Detractor",      sentiment: "negative",   lastTouch: "26d ago",  daysSilent: 26, department: "Sales",       reportsTo: "Patrick Mendez" },
    ],
    signals: [
      { id: "s1", category: "Renewal",     tone: "neg",  body: "Economic buyer Ben Ito (FP&A) dark for 12 days — last 2 follow-ups on the security addendum unanswered.",
        ago: "1h", evidence: [
          { kind: "email", title: "Re: Security addendum — finalising",     meta: "sent Apr 16, no reply" },
          { kind: "email", title: "Re: Q1 implementation timeline",          meta: "sent Apr 22, no reply" },
        ] },
      { id: "s2", category: "Expansion",   tone: "pos",  body: "Daniel confirmed budget for Issuing + Connect bundle once SOC 2 Type II evidence lands.",
        ago: "2d", evidence: [
          { kind: "call",       title: "Discovery — Daniel + Mei",   meta: "Apr 28, 00:08:42" },
          { kind: "transcript", title: "Mention: 'we'd close fast if InfoSec was clean'", meta: "00:12:31" },
        ] },
      { id: "s3", category: "Hiring & Org", tone: "info", body: "Stripe announced 1,200+ engineering hires across Issuing and Embedded Finance — usage-based product fit strengthens.",
        ago: "5d", evidence: [
          { kind: "linkedin", title: "Stripe careers — 312 active reqs in Payments", meta: "May 3" },
        ] },
      { id: "s4", category: "Competitive", tone: "warn", body: "Adyen referenced in Tom Bryant's procurement note — competitive overlap on Issuing.",
        ago: "8d", evidence: [
          { kind: "internal", title: "Procurement memo — \"evaluate alternatives\"", meta: "Apr 28" },
        ] },
    ],
  }),
  [slugify("Snowflake Inc.")]: baseAccountDetail({
    name: "Snowflake", domain: "snowflake.com", segment: "Enterprise", arr: 480_000, status: "Customer",
    owner: "Brad Allen", ownerInitials: "BA", health: "low", healthScore: 41, renewalDays: 47, nrr: 92,
    lastQbrDays: 95, hq: "Bozeman, MT", industry: "Data Cloud · Warehousing", employees: 7300,
    stakeholders: [
      { name: "Hari Shankar",      title: "CEO",                                role: "Decision Maker", sentiment: "neutral",    lastTouch: "20d ago", daysSilent: 20, department: "Executive" },
      { name: "Ben Albrecht",      title: "CTO",                                role: "Decision Maker", sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Engineering", reportsTo: "Hari Shankar" },
      { name: "Tom Reilly",        title: "VP Engineering · Data Cloud",        role: "Champion",       sentiment: "neutral",    lastTouch: "24d ago", daysSilent: 24, department: "Engineering", reportsTo: "Ben Albrecht" },
      { name: "Logan Reeves",      title: "VP Customer Success",                role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Operations",  reportsTo: "Hari Shankar" },
      { name: "Anna Park",         title: "Head of Data Cloud Operations",      role: "Decision Maker", sentiment: "negative",   lastTouch: "9d ago",  daysSilent:  9, department: "Operations",  reportsTo: "Tom Reilly" },
      { name: "Natalie Singh",     title: "Director of Solutions Architecture", role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Tom Reilly" },
      { name: "Marcus Webb",       title: "Head of Data Governance",            role: "Decision Maker", sentiment: "neutral",    lastTouch: "31d ago", daysSilent: 31, department: "Operations",  reportsTo: "Anna Park" },
      { name: "Ana Velasco",       title: "Principal Architect · Snowpark",     role: "User",           sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Tom Reilly" },
      { name: "Lukas Becker",      title: "Senior Data Engineer",               role: "User",           sentiment: "neutral",    lastTouch: "7d ago",  daysSilent:  7, department: "Engineering", reportsTo: "Natalie Singh" },
      { name: "Jin Park",          title: "Director of FP&A",                   role: "Influencer",     sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Finance" },
      { name: "Adrian Cole",       title: "VP Sales · Enterprise",              role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Sales",       reportsTo: "Hari Shankar" },
      { name: "Ellen Wright",      title: "Head of Procurement",                role: "Detractor",      sentiment: "negative",   lastTouch: "27d ago", daysSilent: 27, department: "Finance",     reportsTo: "Jin Park" },
      { name: "Nathan Cole",       title: "Senior Data Engineer · Streaming",   role: "User",           sentiment: "neutral",    lastTouch: "13d ago", daysSilent: 13, department: "Engineering", reportsTo: "Ana Velasco" },
    ],
    signals: [
      { id: "s1", category: "Renewal", tone: "neg", body: "Champion Tom Reilly silent 24 days; renewal in 47 days — sponsor recovery is the renewal blocker.", ago: "1h",
        evidence: [{ kind: "email", title: "Re: Q2 health check", meta: "no reply 24d" }] },
      { id: "s2", category: "Usage",   tone: "warn", body: "Active warehouses down 18% MoM — Snowpark adoption stalling in Anna Park's org.", ago: "1d",
        evidence: [{ kind: "internal", title: "usage dashboard", meta: "Apr 29 snapshot" }] },
      { id: "s3", category: "Champion Change", tone: "neg", body: "James Whitfield (VP Sales Ops) left company — succession recovery needed before renewal.", ago: "2d",
        evidence: [
          { kind: "linkedin", title: "LinkedIn: James Whitfield changed to 'Open to work'", meta: "May 3" },
          { kind: "internal", title: "CRM: contact marked as departed", meta: "May 4" },
        ] },
      { id: "s4", category: "Competitive", tone: "warn", body: "Databricks listed in last QBR slide as a comparison vendor — needs displacement narrative.", ago: "9d",
        evidence: [{ kind: "internal", title: "QBR Q1 deck — slide 14", meta: "competitive landscape" }] },
    ],
  }),
  [slugify("Cloudflare, Inc.")]: baseAccountDetail({
    name: "Cloudflare", domain: "cloudflare.com", segment: "Enterprise", arr: 720_000, status: "Customer",
    owner: "Brad Allen", ownerInitials: "BA", health: "high", healthScore: 88, renewalDays: 178, nrr: 124,
    lastQbrDays: 14, hq: "Denver, CO", industry: "Cloud Infrastructure", employees: 3400,
    stakeholders: [
      { name: "Maya Chen",        title: "VP Eng (just promoted)",      role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering" },
      { name: "Ricardo Diaz",     title: "Head of Security",            role: "Influencer",     sentiment: "supportive", lastTouch: "5d ago",  daysSilent:  5, department: "Operations",  reportsTo: "Maya Chen" },
      { name: "Sandra Lewis",     title: "Director of Networking",      role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Maya Chen" },
      { name: "Eric Cartman",     title: "Senior Engineer",             role: "User",           sentiment: "neutral",    lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Sandra Lewis" },
      { name: "Naomi Walker",     title: "CFO",                         role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Finance" },
      { name: "Priya Sharma",     title: "Director of Procurement",     role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Finance",      reportsTo: "Naomi Walker" },
      { name: "Jordan Reed",      title: "Senior Procurement Analyst",  role: "Influencer",     sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Finance",      reportsTo: "Priya Sharma" },
      { name: "Anders Holm",      title: "VP Product",                  role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Product",     reportsTo: "Maya Chen" },
      { name: "Lin Park",         title: "Principal SRE",               role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Sandra Lewis" },
      { name: "Travis Bell",      title: "Staff Software Engineer",     role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Anders Holm" },
      { name: "Jasmine Okafor",   title: "Senior Marketing Ops",        role: "Influencer",     sentiment: "supportive", lastTouch: "6d ago",  daysSilent:  6, department: "Operations" },
      { name: "Marcus Vela",      title: "Director of Data Engineering",role: "User",           sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Engineering", reportsTo: "Anders Holm" },
      { name: "Rebecca Chu",      title: "VP Sales",                    role: "Detractor",      sentiment: "negative",   lastTouch: "23d ago", daysSilent: 23, department: "Sales",        reportsTo: "Naomi Walker" },
      { name: "Owen Mitchell",    title: "Head of InfoSec",             role: "Decision Maker", sentiment: "neutral",    lastTouch: "16d ago", daysSilent: 16, department: "Operations",  reportsTo: "Ricardo Diaz" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos",  body: "Maya Chen promoted to VP Eng — budget authority expanded into Networking + Security.",
        ago: "12m", evidence: [
          { kind: "linkedin",   title: "LinkedIn: 'Excited to share I'm now VP Eng…'", meta: "Apr 30" },
          { kind: "transcript", title: "Last QBR mention: 'we'll own security too'", meta: "00:14:12" },
        ] },
      { id: "s2", category: "Expansion",   tone: "info", body: "Pattern matches 3 prior expansions where champion got VP-promoted: avg $180K.",
        ago: "12m", evidence: [{ kind: "internal", title: "Expansion playbook · pattern 4b", meta: "internal note" }] },
      { id: "s3", category: "Champion Change", tone: "pos", body: "Maya Chen promoted to VP Engineering — budget authority now spans Networking + Security.", ago: "12h",
        evidence: [
          { kind: "linkedin", title: "LinkedIn: 'Excited to share I'm now VP Eng…'", meta: "May 4" },
          { kind: "transcript", title: "Last QBR mention: 'we'll own security too'", meta: "00:14:12" },
        ] },
    ],
  }),
  [slugify("GitLab Inc.")]: baseAccountDetail({
    name: "GitLab Inc.", domain: "gitlab.com", segment: "Enterprise", arr: 280_000, status: "Customer",
    owner: "Sarah Chen", ownerInitials: "SC", health: "medium", healthScore: 64, renewalDays: 64, nrr: 98,
    lastQbrDays: 92, hq: "All-remote · HQ San Francisco, CA", industry: "DevOps · Source Control", employees: 2100,
    stakeholders: [
      { name: "Sid Whitman",      title: "CEO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "26d ago", daysSilent: 26, department: "Executive" },
      { name: "Eva Lindgren",     title: "CTO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Engineering", reportsTo: "Sid Whitman" },
      { name: "Stefan Becker",    title: "CFO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "21d ago", daysSilent: 21, department: "Finance",     reportsTo: "Sid Whitman" },
      { name: "Molly Müller",     title: "Head of DevOps",                   role: "Champion",       sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Engineering", reportsTo: "Eva Lindgren" },
      { name: "Alex Rivera",      title: "Director of Sales Enablement",     role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Sales",       reportsTo: "Sid Whitman" },
      { name: "Naomi Chen",       title: "VP Customer Success",              role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Operations",  reportsTo: "Sid Whitman" },
      { name: "Alex Petrov",      title: "Director of Application Security", role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Operations",  reportsTo: "Eva Lindgren" },
      { name: "Mandy Moore",      title: "Senior PM · CI/CD",                role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Product",     reportsTo: "Molly Müller" },
      { name: "Liam Keane",       title: "Senior DevOps Engineer",           role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Molly Müller" },
      { name: "Yusuf Adebayo",    title: "Staff Engineer · Runner",          role: "User",           sentiment: "supportive", lastTouch: "4d ago",  daysSilent:  4, department: "Engineering", reportsTo: "Molly Müller" },
      { name: "Clara Mendoza",    title: "Head of FinOps",                   role: "Influencer",     sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Finance",     reportsTo: "Stefan Becker" },
      { name: "Riku Tanaka",      title: "Director of Procurement",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Finance",     reportsTo: "Stefan Becker" },
      { name: "Markus Roth",      title: "Head of IT Operations",            role: "Detractor",      sentiment: "negative",   lastTouch: "33d ago", daysSilent: 33, department: "Operations",  reportsTo: "Eva Lindgren" },
    ],
    signals: [
      { id: "s1", category: "Usage", tone: "warn", body: "WAU/MAU dropped 0.62 → 0.48 in 14 days. Three teams stopped using AI Copilot features.", ago: "1h",
        evidence: [{ kind: "internal", title: "usage dashboard", meta: "Apr 29" }] },
      { id: "s2", category: "Champion Change", tone: "pos", body: "Alex Rivera promoted from Sales Manager to Director of Sales Enablement — AI Copilot aligns with new mandate.", ago: "5d",
        evidence: [
          { kind: "linkedin", title: "LinkedIn: Alex Rivera updated title to Director of Sales Enablement", meta: "Apr 30" },
        ] },
      { id: "s3", category: "Renewal", tone: "neg", body: "Stefan Becker (CFO) silent 21d — renewal procurement gate in 64 days. Multi-thread Naomi Chen now.", ago: "3d",
        evidence: [{ kind: "email", title: "Re: 3-year ELA renewal terms", meta: "no reply 21d" }] },
      { id: "s4", category: "Hiring & Org", tone: "info", body: "GitLab announced layoffs in IT Ops — Markus Roth's mandate may shrink. Reassess detractor status.", ago: "6d",
        evidence: [{ kind: "linkedin", title: "Press: GitLab restructures IT Ops", meta: "Apr 27" }] },
    ],
  }),
  [slugify("Akamai Technologies")]: baseAccountDetail({
    name: "Akamai", domain: "akamai.com", segment: "Enterprise", arr: 540_000, status: "Customer",
    owner: "Mike Torres", ownerInitials: "MT", health: "high", healthScore: 86, renewalDays: 210, nrr: 118,
    lastQbrDays: 105, hq: "Cambridge, MA", industry: "CDN · Edge Security", employees: 9800,
    stakeholders: [
      { name: "Tom Leighton",        title: "CEO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "30d ago", daysSilent: 30, department: "Executive" },
      { name: "Wendy Tao",           title: "CFO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "16d ago", daysSilent: 16, department: "Finance",     reportsTo: "Tom Leighton" },
      { name: "Jane Foster",         title: "VP Engineering · Edge Platform",   role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Engineering", reportsTo: "Tom Leighton" },
      { name: "Ravi Iyer",           title: "Director of Platform Engineering", role: "Champion",       sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Jane Foster" },
      { name: "Connor Wells",        title: "VP Security Products",             role: "Decision Maker", sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Tom Leighton" },
      { name: "Hana Kim",            title: "Head of CDN Operations",           role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Operations",  reportsTo: "Jane Foster" },
      { name: "Theo Marchetti",      title: "Director of Site Reliability",     role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Hana Kim" },
      { name: "Selma Adler",         title: "Director of Cloud Architecture",   role: "Influencer",     sentiment: "neutral",    lastTouch: "7d ago",  daysSilent:  7, department: "Engineering", reportsTo: "Jane Foster" },
      { name: "Brendan O'Sullivan",  title: "VP Customer Success",              role: "Influencer",     sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Operations",  reportsTo: "Tom Leighton" },
      { name: "Priya Shah",          title: "Senior Security Engineer",         role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Connor Wells" },
      { name: "Mateo Reyes",         title: "Senior Network Engineer",          role: "User",           sentiment: "supportive", lastTouch: "4d ago",  daysSilent:  4, department: "Engineering", reportsTo: "Theo Marchetti" },
      { name: "Linnea Sjogren",      title: "Director of Procurement",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "13d ago", daysSilent: 13, department: "Finance",     reportsTo: "Wendy Tao" },
      { name: "Owen Hayes",          title: "VP Marketing",                     role: "Detractor",      sentiment: "negative",   lastTouch: "29d ago", daysSilent: 29, department: "Sales",       reportsTo: "Tom Leighton" },
    ],
    signals: [
      { id: "s1", category: "Renewal", tone: "warn", body: "QBR 14 days overdue — Q2 narrative not yet reset.", ago: "yesterday",
        evidence: [{ kind: "internal", title: "QBR cadence tracker", meta: "Last QBR: Jan 14" }] },
      { id: "s2", category: "Expansion", tone: "pos", body: "Connor Wells (VP Security Products) requested a Bot Manager + Page Shield bundle review — 30-min walkthrough scheduled.",
        ago: "today", evidence: [
          { kind: "email", title: "Re: Bundle proposal — Bot Manager + Page Shield", meta: "Apr 30" },
          { kind: "transcript", title: "Connor: 'we want to consolidate the security stack'", meta: "00:21:14" },
        ] },
      { id: "s3", category: "Hiring & Org", tone: "info", body: "Akamai posted 24 reqs across Edge Security — Connor's org expanding. Reference-call timing is ideal.",
        ago: "4d", evidence: [
          { kind: "linkedin", title: "Akamai careers — Edge Security org +24 reqs", meta: "Apr 28" },
        ] },
    ],
  }),
  [slugify("Tableau Software")]: baseAccountDetail({
    name: "Tableau Software", domain: "tableau.com", segment: "Enterprise", arr: 360_000, status: "Customer",
    owner: "Paul Acker", ownerInitials: "PA", health: "high", healthScore: 90, renewalDays: 220, nrr: 134,
    lastQbrDays: 21, hq: "Seattle, WA", industry: "BI · Data Visualisation", employees: 4400,
    stakeholders: [
      { name: "Greta Bauer",          title: "CFO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "12d ago", daysSilent: 12, department: "Finance" },
      { name: "Owen Patel",           title: "VP Engineering · Analytics Cloud", role: "Decision Maker", sentiment: "neutral",    lastTouch: "6d ago",  daysSilent:  6, department: "Engineering" },
      { name: "Aria Montgomery",      title: "Head of ML & AI",                  role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Owen Patel" },
      { name: "Carlos Mendes",        title: "ML Lead",                          role: "User",           sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Aria Montgomery" },
      { name: "Hannah Liu",           title: "Senior ML Engineer",               role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Aria Montgomery" },
      { name: "Lana Petrov",          title: "Head of Customer Insights",        role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Operations" },
      { name: "Adam Foreman",         title: "Director of BI Solutions",         role: "Influencer",     sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Owen Patel" },
      { name: "Sienna Walsh",         title: "VP Analytics Cloud",               role: "Decision Maker", sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Owen Patel" },
      { name: "Ravi Krishnan",        title: "Senior Data Scientist",            role: "User",           sentiment: "supportive", lastTouch: "5d ago",  daysSilent:  5, department: "Engineering", reportsTo: "Carlos Mendes" },
      { name: "Priya Sharma",         title: "Head of Revenue Operations",       role: "Influencer",     sentiment: "supportive", lastTouch: "8d ago",  daysSilent:  8, department: "Operations" },
      { name: "Lila Sokolov",         title: "Director of Procurement",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "10d ago", daysSilent: 10, department: "Finance",     reportsTo: "Greta Bauer" },
      { name: "Antonio Rivera",       title: "VP Marketing",                     role: "Influencer",     sentiment: "supportive", lastTouch: "4d ago",  daysSilent:  4, department: "Sales" },
      { name: "Eli Chen",             title: "VP Sales · Enterprise",            role: "Detractor",      sentiment: "negative",   lastTouch: "24d ago", daysSilent: 24, department: "Sales" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos",  body: "Hiring 4 ML engineers — governance gap flagged in last call.", ago: "yesterday",
        evidence: [
          { kind: "linkedin",   title: "Job post: Senior ML Engineer (×4)", meta: "Apr 28" },
          { kind: "transcript", title: "Aria: 'we don't have governance for these new agents'", meta: "00:18:21" },
        ] },
      { id: "s2", category: "Champion Change", tone: "info", body: "New hire: Priya Sharma joined as Head of Revenue Operations — likely evaluating tooling.", ago: "3d",
        evidence: [
          { kind: "linkedin", title: "LinkedIn: Priya Sharma started as Head of Revenue Operations at Tableau", meta: "May 2" },
        ] },
      { id: "s3", category: "Expansion", tone: "pos", body: "Aria expressed interest in adding Pulse + Einstein Discovery to the AI/ML governance bundle. Estimated $90K ARR.",
        ago: "yesterday", evidence: [
          { kind: "transcript", title: "Aria: 'we'd want Pulse on top of this'", meta: "00:31:08" },
        ] },
      { id: "s4", category: "Usage", tone: "info", body: "Tableau Cloud query volume up 32% MoM — consumption-based pricing tier is approaching its next break-point.",
        ago: "5d", evidence: [{ kind: "internal", title: "consumption tier dashboard", meta: "Apr 30" }] },
    ],
  }),

  // ── DATADOG · Demo stage prospect ─────────────────────────────────
  [slugify("Datadog, Inc.")]: baseAccountDetail({
    name: "Datadog", domain: "datadoghq.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Paul Acker", ownerInitials: "PA", health: "high", healthScore: 84, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "New York, NY", industry: "Observability · APM", employees: 5400,
    stakeholders: [
      { name: "Olivia Kerr",     title: "CEO",                                 role: "Decision Maker", sentiment: "neutral",    lastTouch: "12d ago", daysSilent: 12, department: "Executive" },
      { name: "Kavi Subramanian",title: "CTO",                                 role: "Decision Maker", sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Engineering", reportsTo: "Olivia Kerr" },
      { name: "Reza Ahmadi",     title: "VP Engineering · Observability",     role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Kavi Subramanian" },
      { name: "Beth Saunders",   title: "Director of SRE",                    role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Reza Ahmadi" },
      { name: "Diego Vargas",    title: "Senior PM · APM",                    role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Product",     reportsTo: "Reza Ahmadi" },
      { name: "Hannah Kim",      title: "Staff Engineer · Telemetry",         role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Beth Saunders" },
      { name: "Tariq Bashir",    title: "Director of Platform Reliability",   role: "Influencer",     sentiment: "neutral",    lastTouch: "5d ago",  daysSilent:  5, department: "Engineering", reportsTo: "Reza Ahmadi" },
      { name: "Sabrina Cho",     title: "VP Customer Engineering",            role: "Influencer",     sentiment: "supportive", lastTouch: "6d ago",  daysSilent:  6, department: "Operations",  reportsTo: "Olivia Kerr" },
      { name: "Marcus Whittle",  title: "CFO",                                role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Finance" },
      { name: "Lena Adler",      title: "Head of Procurement",                role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Finance",     reportsTo: "Marcus Whittle" },
      { name: "Patrick Boateng", title: "Head of Information Security",       role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Operations" },
      { name: "Dana Ortiz",      title: "VP Sales · Strategic",               role: "Detractor",      sentiment: "negative",   lastTouch: "22d ago", daysSilent: 22, department: "Sales" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos", body: "Reza Ahmadi requested a live demo of the cross-funnel attribution module — buying-team review scheduled.", ago: "today",
        evidence: [{ kind: "email", title: "Re: Demo agenda — APM + attribution", meta: "May 6" }] },
      { id: "s2", category: "Competitive", tone: "warn", body: "New Relic referenced in last call as the incumbent monitoring stack — displacement story required.", ago: "3d",
        evidence: [{ kind: "transcript", title: "Reza: 'we already use New Relic for APM'", meta: "00:09:14" }] },
      { id: "s3", category: "Expansion", tone: "info", body: "Hannah Kim downloaded the ROI calculator — likely modeling spend internally.", ago: "yesterday",
        evidence: [{ kind: "internal", title: "Marketing automation event log", meta: "May 5, 14:02" }] },
    ],
  }),

  // ── SHOPIFY · Negotiation stage prospect ─────────────────────────
  [slugify("Shopify Inc.")]: baseAccountDetail({
    name: "Shopify", domain: "shopify.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Mike Torres", ownerInitials: "MT", health: "high", healthScore: 88, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "Ottawa, CA", industry: "E-commerce Platform", employees: 11600,
    stakeholders: [
      { name: "Tobias Lutkowski", title: "CEO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Executive" },
      { name: "Mira Patel",       title: "President · Merchant Services",    role: "Decision Maker", sentiment: "supportive", lastTouch: "6d ago",  daysSilent:  6, department: "Executive", reportsTo: "Tobias Lutkowski" },
      { name: "Devon Haight",     title: "VP Engineering · Storefront",      role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Mira Patel" },
      { name: "Aria Thompson",    title: "Director of Commerce Platform",    role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Devon Haight" },
      { name: "Henry Sutton",     title: "VP Revenue Operations",            role: "Champion",       sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Operations" },
      { name: "Liesl Voss",       title: "Director of Sales Operations",     role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Sales",       reportsTo: "Henry Sutton" },
      { name: "Rohan Mehta",      title: "VP Finance · Commerce",            role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Finance" },
      { name: "Cassie Zheng",     title: "Director of Procurement",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "5d ago",  daysSilent:  5, department: "Finance",     reportsTo: "Rohan Mehta" },
      { name: "Yusuf Ali",        title: "Senior Counsel · Commercial",      role: "Influencer",     sentiment: "neutral",    lastTouch: "4d ago",  daysSilent:  4, department: "Operations" },
      { name: "Leah Connor",      title: "Head of InfoSec",                  role: "Decision Maker", sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Operations" },
      { name: "Marco Inverno",    title: "Lead Engineer · Checkout",         role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Aria Thompson" },
      { name: "Priya Iyengar",    title: "VP Customer Experience",           role: "Detractor",      sentiment: "negative",   lastTouch: "21d ago", daysSilent: 21, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Renewal", tone: "pos", body: "Yusuf Ali (Counsel) returned MSA redlines yesterday — 3 minor changes, no commercial blockers.",
        ago: "1d", evidence: [{ kind: "email", title: "Re: MSA · counter-redlines", meta: "May 5" }] },
      { id: "s2", category: "Renewal", tone: "warn", body: "Cassie Zheng (Procurement) requested final pricing in writing for Steering committee on Monday.",
        ago: "today", evidence: [{ kind: "email", title: "Re: Final pricing for SteerCo", meta: "May 6" }] },
      { id: "s3", category: "Expansion", tone: "pos", body: "Henry Sutton confirmed Q3 budget for the Commerce Pro tier — 3-year ELA shape preferred.",
        ago: "2d", evidence: [{ kind: "call", title: "Commercial alignment — Henry + Mira", meta: "May 4, 00:18:42" }] },
      { id: "s4", category: "Champion Change", tone: "info", body: "Devon Haight cited \"we'd want this live before BFCM\" — strong implementation-window urgency.",
        ago: "3d", evidence: [{ kind: "transcript", title: "Devon: 'live before Black Friday'", meta: "00:24:11" }] },
    ],
  }),

  // ── LOCKHEED MARTIN · Negotiation stage prospect ──────────────────
  [slugify("Lockheed Martin")]: baseAccountDetail({
    name: "Lockheed Martin", domain: "lockheedmartin.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Brad Allen", ownerInitials: "BA", health: "high", healthScore: 86, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "Bethesda, MD", industry: "Aerospace · Defense", employees: 122000,
    stakeholders: [
      { name: "James Calhoun",   title: "CIO",                                role: "Decision Maker", sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Executive" },
      { name: "Brigit Sandoval", title: "VP Digital Transformation",          role: "Champion",       sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Operations",  reportsTo: "James Calhoun" },
      { name: "Eric Vasquez",    title: "Director of Mission Systems IT",     role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Engineering", reportsTo: "Brigit Sandoval" },
      { name: "Tanya Brookings", title: "Head of Cybersecurity Operations",   role: "Decision Maker", sentiment: "neutral",    lastTouch: "today",   daysSilent:  0, department: "Operations",  reportsTo: "James Calhoun" },
      { name: "Frank Linder",    title: "Director of Procurement · Federal",  role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Finance" },
      { name: "Samira Faroughi", title: "VP Finance · Aeronautics",           role: "Decision Maker", sentiment: "neutral",    lastTouch: "12d ago", daysSilent: 12, department: "Finance" },
      { name: "Dan Roselli",     title: "Senior Counsel · Government Sales",  role: "Influencer",     sentiment: "neutral",    lastTouch: "5d ago",  daysSilent:  5, department: "Operations" },
      { name: "Helena Brooks",   title: "Director of Software Engineering",   role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Eric Vasquez" },
      { name: "Mark Beaumont",   title: "Senior Programs Architect",          role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Helena Brooks" },
      { name: "Lin Garcia",      title: "Compliance Lead · CMMC",             role: "Decision Maker", sentiment: "neutral",    lastTouch: "6d ago",  daysSilent:  6, department: "Operations",  reportsTo: "Tanya Brookings" },
      { name: "Adrian Cole",     title: "Director of Financial Planning",     role: "Influencer",     sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Finance",     reportsTo: "Samira Faroughi" },
      { name: "Roger Klein",     title: "VP Strategic Sourcing",              role: "Detractor",      sentiment: "negative",   lastTouch: "27d ago", daysSilent: 27, department: "Sales" },
    ],
    signals: [
      { id: "s1", category: "Renewal", tone: "pos", body: "FedRAMP High evidence package accepted — Lin Garcia (Compliance) signed off on the final attestation.",
        ago: "today", evidence: [{ kind: "internal", title: "FedRAMP attestation v3", meta: "May 6" }] },
      { id: "s2", category: "Renewal", tone: "warn", body: "Frank Linder (Procurement) is in the SteerCo Friday — final commercials must be on the table.",
        ago: "1d", evidence: [{ kind: "email", title: "Re: SteerCo agenda — May 9", meta: "May 5" }] },
      { id: "s3", category: "Hiring & Org", tone: "info", body: "Lockheed Martin announced two new defense contracts ($340M) — accelerates digital-transformation budget for Brigit's team.",
        ago: "4d", evidence: [{ kind: "linkedin", title: "Press: $340M Air Force contract awarded", meta: "May 2" }] },
    ],
  }),

  // ── HSBC · Proposal stage prospect ────────────────────────────────
  [slugify("HSBC Holdings")]: baseAccountDetail({
    name: "HSBC", domain: "hsbc.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Lisa Park", ownerInitials: "LP", health: "high", healthScore: 84, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "London, UK", industry: "Banking · Financial Services", employees: 220000,
    stakeholders: [
      { name: "Noel Quigley",    title: "Group COO",                          role: "Decision Maker", sentiment: "neutral",    lastTouch: "16d ago", daysSilent: 16, department: "Executive" },
      { name: "Adetola Bankole", title: "Group CTO",                          role: "Decision Maker", sentiment: "supportive", lastTouch: "5d ago",  daysSilent:  5, department: "Engineering", reportsTo: "Noel Quigley" },
      { name: "Rashid Al-Sabah", title: "Head of Wholesale Banking Tech",     role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Adetola Bankole" },
      { name: "Kerry Donovan",   title: "Head of Group Risk Tech",            role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Operations",  reportsTo: "Adetola Bankole" },
      { name: "Mira Sharma",     title: "Director of Capital Markets Tech",   role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Rashid Al-Sabah" },
      { name: "Ben Zhang",       title: "Senior Engineer · Trading Platform", role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Mira Sharma" },
      { name: "Olivier Renaud",  title: "Group Head of Procurement",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Finance" },
      { name: "Camille Faraj",   title: "VP Sourcing · Technology",           role: "Decision Maker", sentiment: "neutral",    lastTouch: "13d ago", daysSilent: 13, department: "Finance",     reportsTo: "Olivier Renaud" },
      { name: "Aisha Greaves",   title: "Director of Information Security",   role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Operations" },
      { name: "Jonathan Park",   title: "Senior Counsel · Tech & Outsourcing",role: "Influencer",     sentiment: "neutral",    lastTouch: "7d ago",  daysSilent:  7, department: "Operations" },
      { name: "Pramod Iyer",     title: "VP Data Engineering · Risk",         role: "Influencer",     sentiment: "supportive", lastTouch: "4d ago",  daysSilent:  4, department: "Engineering", reportsTo: "Kerry Donovan" },
      { name: "Greta Lindholm",  title: "VP of Operational Resilience",       role: "Detractor",      sentiment: "negative",   lastTouch: "29d ago", daysSilent: 29, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Expansion", tone: "pos", body: "Rashid requested commercial proposal with multi-region (EMEA + APAC) Issuing rollout — TAM doubles to $820K.",
        ago: "yesterday", evidence: [{ kind: "email", title: "Re: Commercial proposal — multi-region", meta: "May 5" }] },
      { id: "s2", category: "Renewal", tone: "warn", body: "Greta Lindholm raised operational-resilience concerns in last steering — needs proactive mitigation paper before final.",
        ago: "3d", evidence: [{ kind: "transcript", title: "Greta: 'we need a clearer DR story'", meta: "00:38:21" }] },
      { id: "s3", category: "Hiring & Org", tone: "info", body: "HSBC announced a £6B technology modernisation programme — bundles the buying motion under one budget.",
        ago: "8d", evidence: [{ kind: "linkedin", title: "Press: HSBC £6B tech modernisation", meta: "Apr 28" }] },
      { id: "s4", category: "Competitive", tone: "warn", body: "Stripe and Marqeta listed as alternatives in Olivier's vendor matrix.",
        ago: "11d", evidence: [{ kind: "internal", title: "Procurement vendor matrix v2", meta: "Apr 25" }] },
    ],
  }),

  // ── ATLASSIAN · Stable customer ──────────────────────────────────
  [slugify("Atlassian Corporation")]: baseAccountDetail({
    name: "Atlassian", domain: "atlassian.com", segment: "Enterprise", arr: 410_000, status: "Customer",
    owner: "Mike Torres", ownerInitials: "MT", health: "high", healthScore: 91, renewalDays: 142, nrr: 121,
    lastQbrDays: 31, hq: "Sydney, AU", industry: "Collaboration · DevOps", employees: 9500,
    stakeholders: [
      { name: "Mike Cannon",       title: "CEO",                                  role: "Decision Maker", sentiment: "neutral",    lastTouch: "21d ago", daysSilent: 21, department: "Executive" },
      { name: "Sven Grünewald",    title: "CTO",                                  role: "Decision Maker", sentiment: "supportive", lastTouch: "9d ago",  daysSilent:  9, department: "Engineering", reportsTo: "Mike Cannon" },
      { name: "Tariq Sharif",      title: "VP Engineering · Cloud Platform",     role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Sven Grünewald" },
      { name: "Hannah Mortimer",   title: "Head of Customer Success",            role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Operations" },
      { name: "Jin Ko",            title: "Senior PM · Confluence",              role: "Influencer",     sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Product",     reportsTo: "Tariq Sharif" },
      { name: "Lara Vinopalová",   title: "Director of Reliability",             role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Tariq Sharif" },
      { name: "Akira Shimada",     title: "VP Sales Operations",                 role: "Influencer",     sentiment: "neutral",    lastTouch: "6d ago",  daysSilent:  6, department: "Sales" },
      { name: "Olivia Hertzberg",  title: "Senior Engineer · Jira Platform",     role: "User",           sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Engineering", reportsTo: "Lara Vinopalová" },
      { name: "Ben Gallagher",     title: "Director of Procurement",             role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Finance" },
      { name: "Noor Ahmed",        title: "VP Finance · Cloud",                  role: "Decision Maker", sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Finance" },
      { name: "Maxim Sokolov",     title: "Head of Information Security",        role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Usage", tone: "pos", body: "Confluence-Cloud query volume up 22% MoM — heavier sustained adoption since Jin Ko's team rolled out Smart Links.",
        ago: "today", evidence: [{ kind: "internal", title: "consumption dashboard", meta: "May 6 snapshot" }] },
      { id: "s2", category: "Expansion", tone: "info", body: "Hannah Mortimer flagged interest in Atlas + Compass bundle for the platform team — pre-renewal expansion runway.",
        ago: "5d", evidence: [{ kind: "transcript", title: "Hannah: 'we'd want one contract for both'", meta: "00:14:27" }] },
      { id: "s3", category: "Renewal", tone: "pos", body: "Renewal in 142 days — sponsor coverage healthy across CTO, VP Eng, and CS leadership.",
        ago: "yesterday", evidence: [{ kind: "internal", title: "Sponsor coverage map", meta: "May 5" }] },
    ],
  }),

  // ── TWILIO · Stable customer ─────────────────────────────────────
  [slugify("Twilio Inc.")]: baseAccountDetail({
    name: "Twilio", domain: "twilio.com", segment: "Enterprise", arr: 380_000, status: "Customer",
    owner: "Sarah Chen", ownerInitials: "SC", health: "high", healthScore: 87, renewalDays: 96, nrr: 116,
    lastQbrDays: 23, hq: "San Francisco, CA", industry: "Cloud Communications · CPaaS", employees: 8100,
    stakeholders: [
      { name: "Jeff Calderon",    title: "CEO",                                role: "Decision Maker", sentiment: "neutral",    lastTouch: "18d ago", daysSilent: 18, department: "Executive" },
      { name: "Mira Pflüger",     title: "CTO",                                role: "Decision Maker", sentiment: "supportive", lastTouch: "9d ago",  daysSilent:  9, department: "Engineering", reportsTo: "Jeff Calderon" },
      { name: "Andre Carvalho",   title: "VP Engineering · Messaging",         role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Mira Pflüger" },
      { name: "Kim Peralta",      title: "Director of Engagement Cloud",       role: "Champion",       sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Andre Carvalho" },
      { name: "Rohan Banerjee",   title: "Senior PM · Voice",                  role: "Influencer",     sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Product",     reportsTo: "Andre Carvalho" },
      { name: "Selena Park",      title: "Director of Customer Success",       role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Operations" },
      { name: "Liam O'Connell",   title: "Staff Engineer · SDK Platform",      role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Kim Peralta" },
      { name: "Zoe Brennan",      title: "VP Customer Engineering",            role: "Influencer",     sentiment: "supportive", lastTouch: "4d ago",  daysSilent:  4, department: "Operations" },
      { name: "Julia Fischer",    title: "VP Finance · CPaaS",                 role: "Decision Maker", sentiment: "neutral",    lastTouch: "12d ago", daysSilent: 12, department: "Finance" },
      { name: "Richard Calderón", title: "Head of Procurement",                role: "Decision Maker", sentiment: "neutral",    lastTouch: "10d ago", daysSilent: 10, department: "Finance" },
      { name: "Laila Hassan",     title: "Head of Information Security",       role: "Decision Maker", sentiment: "neutral",    lastTouch: "7d ago",  daysSilent:  7, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Expansion", tone: "pos", body: "Andre Carvalho confirmed Q3 expansion budget for the Engagement Cloud bundle (Verify + Studio).",
        ago: "today", evidence: [{ kind: "transcript", title: "Andre: 'we want one contract'", meta: "00:18:21" }] },
      { id: "s2", category: "Usage", tone: "pos", body: "Messaging API throughput up 28% MoM — running near tier-2 ceiling, expansion conversation timely.",
        ago: "yesterday", evidence: [{ kind: "internal", title: "API consumption dashboard", meta: "May 5" }] },
      { id: "s3", category: "Renewal", tone: "info", body: "96 days to renewal — Selena Park requested a pre-renewal value review next sprint.",
        ago: "3d", evidence: [{ kind: "email", title: "Re: Pre-renewal value review", meta: "May 3" }] },
    ],
  }),

  // ── DROPBOX · Adopting customer ──────────────────────────────────
  [slugify("Dropbox, Inc.")]: baseAccountDetail({
    name: "Dropbox", domain: "dropbox.com", segment: "Enterprise", arr: 220_000, status: "Customer",
    owner: "Paul Acker", ownerInitials: "PA", health: "medium", healthScore: 71, renewalDays: 240, nrr: 104,
    lastQbrDays: 41, hq: "San Francisco, CA", industry: "Cloud Storage · Collaboration", employees: 2400,
    stakeholders: [
      { name: "Aaron Schulz",     title: "CEO",                                role: "Decision Maker", sentiment: "neutral",    lastTouch: "30d ago", daysSilent: 30, department: "Executive" },
      { name: "Hannah Levin",     title: "CTO",                                role: "Decision Maker", sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Engineering", reportsTo: "Aaron Schulz" },
      { name: "Devon Cho",        title: "VP Engineering · Sync",              role: "Champion",       sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Hannah Levin" },
      { name: "Ramon Cabrera",    title: "Director of Customer Success",       role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Operations" },
      { name: "Beatrice Sanford", title: "Senior PM · Sync Engine",            role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Product",     reportsTo: "Devon Cho" },
      { name: "Lucas Bertillon",  title: "Director of Platform Reliability",   role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Engineering", reportsTo: "Devon Cho" },
      { name: "Hilde Møller",     title: "Senior Engineer · API Platform",     role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Lucas Bertillon" },
      { name: "Avi Goldstein",    title: "VP Finance · Cloud",                 role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Finance" },
      { name: "Sarah Briggs",     title: "Head of Procurement",                role: "Decision Maker", sentiment: "neutral",    lastTouch: "13d ago", daysSilent: 13, department: "Finance",     reportsTo: "Avi Goldstein" },
      { name: "Dan Whitfield",    title: "Director of IT Operations",          role: "Detractor",      sentiment: "negative",   lastTouch: "26d ago", daysSilent: 26, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Usage", tone: "warn", body: "WAU drop 0.71 → 0.62 in 14 days. Two power-user teams paused workflows — onboarding gap surfaced.",
        ago: "today", evidence: [{ kind: "internal", title: "usage dashboard", meta: "May 6" }] },
      { id: "s2", category: "Hiring & Org", tone: "info", body: "Ramon Cabrera (CS) escalated for an outcomes re-baseline — onboarding programme behind plan.",
        ago: "1d", evidence: [{ kind: "email", title: "Re: Onboarding outcomes review", meta: "May 5" }] },
      { id: "s3", category: "Renewal", tone: "info", body: "240 days to renewal — runway to recover the adoption curve before commercial conversation.",
        ago: "today", evidence: [{ kind: "internal", title: "Renewal calendar", meta: "May 6" }] },
    ],
  }),

  // ── NOTION · Demo stage prospect ─────────────────────────────────
  [slugify("Notion Labs")]: baseAccountDetail({
    name: "Notion Labs", domain: "notion.so", segment: "Mid-Market", arr: 0, status: "Prospect",
    owner: "Sarah Chen", ownerInitials: "SC", health: "high", healthScore: 82, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "San Francisco, CA", industry: "Productivity SaaS", employees: 610,
    stakeholders: [
      { name: "Ivan Liaw",         title: "CEO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "13d ago", daysSilent: 13, department: "Executive" },
      { name: "Maya Torres",       title: "CTO",                              role: "Decision Maker", sentiment: "supportive", lastTouch: "6d ago",  daysSilent:  6, department: "Engineering", reportsTo: "Ivan Liaw" },
      { name: "Akhil Saraswat",    title: "VP Engineering · Workspace",       role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Maya Torres" },
      { name: "Naomi Thomson",     title: "Head of Revenue Operations",       role: "Champion",       sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Operations" },
      { name: "Lance Hughes",      title: "Senior PM · Workspace Search",     role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Product",     reportsTo: "Akhil Saraswat" },
      { name: "Sara Bekele",       title: "VP Finance",                       role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Finance" },
      { name: "Theo Bordeaux",     title: "Senior Engineer · Realtime",       role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Akhil Saraswat" },
      { name: "Eliana Park",       title: "Head of People Tech",              role: "Influencer",     sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Operations" },
      { name: "Mateo Rivas",       title: "Procurement Lead",                 role: "Decision Maker", sentiment: "neutral",    lastTouch: "5d ago",  daysSilent:  5, department: "Finance",     reportsTo: "Sara Bekele" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos", body: "Live demo scheduled this Thursday with Akhil + Naomi — agenda includes attribution + revops integration.",
        ago: "today", evidence: [{ kind: "email", title: "Demo confirmed for May 8", meta: "May 6" }] },
      { id: "s2", category: "Expansion", tone: "info", body: "Notion Labs raised a $750M Series E — validation that platform spend will accelerate.",
        ago: "5d", evidence: [{ kind: "linkedin", title: "Press: Notion $750M Series E", meta: "May 1" }] },
      { id: "s3", category: "Competitive", tone: "warn", body: "Naomi name-checked Glean and HubSpot Operations Hub — multi-vendor evaluation in flight.",
        ago: "3d", evidence: [{ kind: "transcript", title: "Naomi: 'we're also looking at Glean'", meta: "00:11:42" }] },
    ],
  }),

  // ── FIGMA · Proposal stage prospect ──────────────────────────────
  [slugify("Figma, Inc.")]: baseAccountDetail({
    name: "Figma", domain: "figma.com", segment: "Mid-Market", arr: 0, status: "Prospect",
    owner: "Rachel Kim", ownerInitials: "RK", health: "high", healthScore: 89, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "San Francisco, CA", industry: "Design Software", employees: 900,
    stakeholders: [
      { name: "Dylan Ogata",    title: "CEO",                                role: "Decision Maker", sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Executive" },
      { name: "Petra Dorn",     title: "CTO",                                role: "Decision Maker", sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Dylan Ogata" },
      { name: "Adriano Costa",  title: "VP Engineering · FigJam",            role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Petra Dorn" },
      { name: "Naomi Carter",   title: "VP Revenue Operations",              role: "Champion",       sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Operations" },
      { name: "Aiden Brooks",   title: "Senior PM · Multiplayer",            role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Product",     reportsTo: "Adriano Costa" },
      { name: "Hugo Lemaire",   title: "Director of Customer Engineering",   role: "Influencer",     sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Operations" },
      { name: "Sara Linden",    title: "VP Finance",                         role: "Decision Maker", sentiment: "neutral",    lastTouch: "6d ago",  daysSilent:  6, department: "Finance" },
      { name: "Ryo Tanaka",     title: "Director of Procurement",            role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Finance",     reportsTo: "Sara Linden" },
      { name: "Mira Saw",       title: "Head of Information Security",       role: "Decision Maker", sentiment: "neutral",    lastTouch: "5d ago",  daysSilent:  5, department: "Operations" },
      { name: "Cole Patterson", title: "Senior Engineer · Realtime",         role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Aiden Brooks" },
    ],
    signals: [
      { id: "s1", category: "Expansion", tone: "pos", body: "Naomi countersigned the proposal terms — only the security addendum + redlines remain.",
        ago: "yesterday", evidence: [{ kind: "email", title: "Re: Counter-signed proposal", meta: "May 5" }] },
      { id: "s2", category: "Renewal", tone: "warn", body: "Mira Saw (InfoSec) requested a SOC 2 Type II evidence walk-through before the Wednesday committee.",
        ago: "today", evidence: [{ kind: "email", title: "Re: SOC 2 Type II walk-through", meta: "May 6" }] },
      { id: "s3", category: "Hiring & Org", tone: "info", body: "Adriano confirmed Q3 ARR scope expanded to include FigJam Templates — adds $90K to the deal.",
        ago: "2d", evidence: [{ kind: "transcript", title: "Adriano: 'add FigJam Templates'", meta: "00:14:51" }] },
    ],
  }),

  // ── SERVICENOW · Discovery prospect ──────────────────────────────
  [slugify("ServiceNow Inc.")]: baseAccountDetail({
    name: "ServiceNow", domain: "servicenow.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Tom Walker", ownerInitials: "TW", health: "high", healthScore: 81, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "Santa Clara, CA", industry: "Workflow Automation", employees: 21500,
    stakeholders: [
      { name: "Bill McDermott",   title: "CEO",                                  role: "Decision Maker", sentiment: "neutral",    lastTouch: "20d ago", daysSilent: 20, department: "Executive" },
      { name: "Rosa Vega",        title: "CTO",                                  role: "Decision Maker", sentiment: "supportive", lastTouch: "9d ago",  daysSilent:  9, department: "Engineering", reportsTo: "Bill McDermott" },
      { name: "Mateusz Jankowski",title: "VP Engineering · Now Platform",       role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Rosa Vega" },
      { name: "Helena Grossman",  title: "Head of Customer Workflows",          role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Mateusz Jankowski" },
      { name: "Reem Hassoun",     title: "Director of Platform PMM",            role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Sales",       reportsTo: "Bill McDermott" },
      { name: "Liam Galloway",    title: "Senior Engineer · App Engine",        role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Helena Grossman" },
      { name: "Talia Berger",     title: "VP Sales Operations · Enterprise",    role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Sales" },
      { name: "Soren Fischer",    title: "VP Finance",                          role: "Decision Maker", sentiment: "neutral",    lastTouch: "12d ago", daysSilent: 12, department: "Finance" },
      { name: "Aanya Bhattacharya",title: "Head of Procurement",                role: "Decision Maker", sentiment: "neutral",    lastTouch: "10d ago", daysSilent: 10, department: "Finance",     reportsTo: "Soren Fischer" },
      { name: "Abdul Rahman",     title: "VP Customer Success",                 role: "Influencer",     sentiment: "neutral",    lastTouch: "7d ago",  daysSilent:  7, department: "Operations" },
      { name: "Cole Greenwood",   title: "VP IT Operations",                    role: "Detractor",      sentiment: "negative",   lastTouch: "25d ago", daysSilent: 25, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos", body: "First discovery call with Mateusz produced a clear pain map: revops + sales-ops fragmented across 6 systems.",
        ago: "today", evidence: [{ kind: "transcript", title: "Mateusz: 'we have 6 systems for one job'", meta: "00:08:12" }] },
      { id: "s2", category: "Champion Change", tone: "info", body: "Helena Grossman started 4 weeks ago — coming from Salesforce CPQ. ICP-textbook champion-promotion fit.",
        ago: "5d", evidence: [{ kind: "linkedin", title: "Helena Grossman started Head of Customer Workflows", meta: "Apr 30" }] },
      { id: "s3", category: "Competitive", tone: "warn", body: "Salesforce listed in the technology stack — multi-product overlap evaluation likely.",
        ago: "8d", evidence: [{ kind: "internal", title: "Stack discovery survey", meta: "Apr 28" }] },
    ],
  }),

  // ── WALMART · Negotiation prospect ───────────────────────────────
  [slugify("Walmart Inc.")]: baseAccountDetail({
    name: "Walmart", domain: "walmart.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Lisa Park", ownerInitials: "LP", health: "medium", healthScore: 78, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "Bentonville, AR", industry: "Retail · E-commerce", employees: 21000,
    stakeholders: [
      { name: "Doug Tilbury",    title: "EVP Walmart US Tech",              role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Executive" },
      { name: "Hema Krishnan",   title: "VP Customer Tech Platform",        role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Doug Tilbury" },
      { name: "Roberta Schulz",  title: "Director of Marketplace Engineering",role: "Influencer",   sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Hema Krishnan" },
      { name: "Jamal Greene",    title: "Director of Procurement · Tech",   role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Finance" },
      { name: "Shilpa Iyer",     title: "VP Finance · Walmart US",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "13d ago", daysSilent: 13, department: "Finance" },
      { name: "Adam Frey",       title: "Director of Cyber Risk",           role: "Decision Maker", sentiment: "neutral",    lastTouch: "today",   daysSilent:  0, department: "Operations" },
      { name: "Camila Reyes",    title: "Senior Counsel · Tech",            role: "Influencer",     sentiment: "neutral",    lastTouch: "5d ago",  daysSilent:  5, department: "Operations" },
      { name: "Pedro Olazabal",  title: "Senior Engineer · Search",         role: "User",           sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Roberta Schulz" },
      { name: "Liang Xu",        title: "VP Sourcing · Indirect",           role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Finance",     reportsTo: "Shilpa Iyer" },
      { name: "Theresa Hall",    title: "VP IT · Stores Platform",          role: "Detractor",      sentiment: "negative",   lastTouch: "32d ago", daysSilent: 32, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Renewal", tone: "warn", body: "Jamal Greene (Procurement) requires three competitive bids on file before any final award — vendor matrix in motion.",
        ago: "1d", evidence: [{ kind: "email", title: "Re: Three-bid policy", meta: "May 5" }] },
      { id: "s2", category: "Renewal", tone: "pos", body: "Adam Frey signed off on the security questionnaire today — no remaining InfoSec blockers.",
        ago: "today", evidence: [{ kind: "internal", title: "Security questionnaire v3 — Approved", meta: "May 6" }] },
      { id: "s3", category: "Expansion", tone: "info", body: "Hema Krishnan asked for incremental scope to cover the marketplace + first-party domains — uplift from $300K → $540K.",
        ago: "3d", evidence: [{ kind: "transcript", title: "Hema: 'one contract for both worlds'", meta: "00:21:08" }] },
    ],
  }),

  // ── ANTHROPIC · Discovery prospect ────────────────────────────────
  [slugify("Anthropic, PBC")]: baseAccountDetail({
    name: "Anthropic", domain: "anthropic.com", segment: "Mid-Market", arr: 0, status: "Prospect",
    owner: "Rachel Kim", ownerInitials: "RK", health: "high", healthScore: 88, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "San Francisco, CA", industry: "AI · Foundation Models", employees: 1100,
    stakeholders: [
      { name: "Daria Amodei",     title: "CEO",                              role: "Decision Maker", sentiment: "neutral",    lastTouch: "10d ago", daysSilent: 10, department: "Executive" },
      { name: "Tom Schuyler",     title: "CTO",                              role: "Decision Maker", sentiment: "supportive", lastTouch: "4d ago",  daysSilent:  4, department: "Engineering", reportsTo: "Daria Amodei" },
      { name: "Selina Pereira",   title: "VP Go-To-Market Operations",       role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Operations" },
      { name: "Hiroki Watanabe",  title: "Head of Sales Engineering",        role: "Champion",       sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Sales" },
      { name: "Alana Greaves",    title: "VP Engineering · Production",      role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Engineering", reportsTo: "Tom Schuyler" },
      { name: "Pierre Boucher",   title: "Director of Trust & Safety Tech",  role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Operations" },
      { name: "Mei Lin",          title: "Senior PM · API Platform",         role: "Influencer",     sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Product",     reportsTo: "Alana Greaves" },
      { name: "Sundeep Kapoor",   title: "Head of Finance",                  role: "Decision Maker", sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Finance" },
      { name: "Ife Adebayo",      title: "Senior Counsel · Commercial",      role: "Influencer",     sentiment: "neutral",    lastTouch: "6d ago",  daysSilent:  6, department: "Operations" },
      { name: "Tom Becker",       title: "Director of Procurement",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Finance",     reportsTo: "Sundeep Kapoor" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos", body: "Selina hosted the discovery call today — flagged need for a unified attribution + RevOps source of truth before next quarter.",
        ago: "today", evidence: [{ kind: "transcript", title: "Selina: 'one source of truth before Q3'", meta: "00:24:03" }] },
      { id: "s2", category: "Hiring & Org", tone: "info", body: "Anthropic announced a $4B funding round — accelerates team and tooling spend.",
        ago: "9d", evidence: [{ kind: "linkedin", title: "Press: Anthropic $4B Series F", meta: "Apr 27" }] },
      { id: "s3", category: "Competitive", tone: "warn", body: "Hiroki referenced an internal data warehouse exploration before evaluating us — competitive against \"build it ourselves\".",
        ago: "4d", evidence: [{ kind: "transcript", title: "Hiroki: 'we considered building this internally'", meta: "00:31:22" }] },
    ],
  }),

  // ── PFIZER · Qualified prospect ──────────────────────────────────
  [slugify("Pfizer Inc.")]: baseAccountDetail({
    name: "Pfizer", domain: "pfizer.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Paul Acker", ownerInitials: "PA", health: "medium", healthScore: 72, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "New York, NY", industry: "Pharmaceuticals", employees: 14000,
    stakeholders: [
      { name: "Albert Boorla",      title: "CEO",                                role: "Decision Maker", sentiment: "neutral",    lastTouch: "24d ago", daysSilent: 24, department: "Executive" },
      { name: "Lidia Andriesc",     title: "Chief Digital Officer",              role: "Decision Maker", sentiment: "neutral",    lastTouch: "12d ago", daysSilent: 12, department: "Executive", reportsTo: "Albert Boorla" },
      { name: "Hari Krishnan",      title: "VP Commercial Tech",                 role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Lidia Andriesc" },
      { name: "Beatriz Vega",       title: "Director of HCP Engagement Tech",    role: "Influencer",     sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Engineering", reportsTo: "Hari Krishnan" },
      { name: "Frank Whitfield",    title: "Director of Regulatory Affairs IT",  role: "Decision Maker", sentiment: "neutral",    lastTouch: "9d ago",  daysSilent:  9, department: "Operations" },
      { name: "Sahar Karimi",       title: "Senior PM · Patient Access",         role: "Influencer",     sentiment: "supportive", lastTouch: "5d ago",  daysSilent:  5, department: "Product" },
      { name: "Renee Falkner",      title: "VP Procurement · Indirect",          role: "Decision Maker", sentiment: "neutral",    lastTouch: "14d ago", daysSilent: 14, department: "Finance" },
      { name: "Joaquim Almeida",    title: "Head of Information Security",       role: "Decision Maker", sentiment: "neutral",    lastTouch: "11d ago", daysSilent: 11, department: "Operations" },
      { name: "Connor Mulligan",    title: "Senior Engineer · Salesforce Health Cloud", role: "User",   sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Beatriz Vega" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "info", body: "Hari Krishnan asked for a discovery deep-dive on HCP-engagement attribution — first qualified opportunity.",
        ago: "today", evidence: [{ kind: "email", title: "Re: HCP-engagement deep-dive", meta: "May 6" }] },
      { id: "s2", category: "Renewal", tone: "warn", body: "Frank Whitfield flagged FDA 21 CFR Part 11 evidence as a hard requirement — adds 2-3 weeks to the cycle.",
        ago: "4d", evidence: [{ kind: "transcript", title: "Frank: 'we'll need 21 CFR Part 11 evidence'", meta: "00:28:18" }] },
      { id: "s3", category: "Hiring & Org", tone: "info", body: "Pfizer published a $1.2B commercial-tech overhaul plan — opens budget windows across Lidia's org.",
        ago: "10d", evidence: [{ kind: "linkedin", title: "Press: Pfizer commercial-tech overhaul", meta: "Apr 26" }] },
    ],
  }),

  // ── TOYOTA · Demo prospect ───────────────────────────────────────
  [slugify("Toyota Motor Corp.")]: baseAccountDetail({
    name: "Toyota", domain: "toyota.com", segment: "Enterprise", arr: 0, status: "Prospect",
    owner: "Brad Allen", ownerInitials: "BA", health: "high", healthScore: 84, renewalDays: 0, nrr: 0,
    lastQbrDays: 0, hq: "Toyota City, JP", industry: "Automotive · Mobility", employees: 18500,
    stakeholders: [
      { name: "Akio Sasaki",       title: "Chief Digital Officer",              role: "Decision Maker", sentiment: "neutral",    lastTouch: "16d ago", daysSilent: 16, department: "Executive" },
      { name: "Hideaki Watanabe",  title: "VP Connected Vehicle Platform",      role: "Champion",       sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Akio Sasaki" },
      { name: "Yuko Mishima",      title: "Director of Dealer Tech",            role: "Influencer",     sentiment: "supportive", lastTouch: "1d ago",  daysSilent:  1, department: "Engineering", reportsTo: "Hideaki Watanabe" },
      { name: "Kenji Otsuka",      title: "Senior Engineer · Telematics",       role: "User",           sentiment: "supportive", lastTouch: "today",   daysSilent:  0, department: "Engineering", reportsTo: "Yuko Mishima" },
      { name: "Stephen Park",      title: "VP Digital Marketing · NA",          role: "Champion",       sentiment: "supportive", lastTouch: "3d ago",  daysSilent:  3, department: "Sales" },
      { name: "Mariko Saito",      title: "Director of Commercial Strategy",    role: "Influencer",     sentiment: "supportive", lastTouch: "2d ago",  daysSilent:  2, department: "Sales",       reportsTo: "Stephen Park" },
      { name: "Hiroto Tanaka",     title: "Head of Information Security",       role: "Decision Maker", sentiment: "neutral",    lastTouch: "6d ago",  daysSilent:  6, department: "Operations" },
      { name: "Nobu Sato",         title: "VP Procurement · Tech",              role: "Decision Maker", sentiment: "neutral",    lastTouch: "10d ago", daysSilent: 10, department: "Finance" },
      { name: "Linda Mascarenhas", title: "Senior Counsel · Commercial Tech",   role: "Influencer",     sentiment: "neutral",    lastTouch: "8d ago",  daysSilent:  8, department: "Operations" },
    ],
    signals: [
      { id: "s1", category: "Hiring & Org", tone: "pos", body: "Live demo this Wednesday with Hideaki + Stephen — bridging connected-vehicle telemetry with NA marketing attribution.",
        ago: "today", evidence: [{ kind: "email", title: "Re: Demo agenda — connected + NA marketing", meta: "May 6" }] },
      { id: "s2", category: "Expansion", tone: "info", body: "Toyota announced a $13B EV platform roadmap — Hideaki's budget grows alongside the platform investment.",
        ago: "9d", evidence: [{ kind: "linkedin", title: "Press: Toyota $13B EV roadmap", meta: "Apr 27" }] },
      { id: "s3", category: "Competitive", tone: "warn", body: "Adobe Marketo Engage referenced as the incumbent in NA — displacement story required for Stephen.",
        ago: "5d", evidence: [{ kind: "internal", title: "NA marketing tech stack survey", meta: "May 1" }] },
    ],
  }),
};

// =====================================================================
// Customer Outcomes — measurable customer-facing goals (not stage exit criteria)
// =====================================================================
export type OutcomeStatus = "ahead" | "on-track" | "watch" | "at-risk";
export type OutcomePriority = "high" | "medium" | "low";
export type OutcomeAction = { id: string; label: string; done: boolean; assignee: string; assigneeInitials: string; dueDate?: string };

export type CustomerOutcome = {
  id: string;
  account: string;
  title: string;
  current: string;
  target: string;
  progress: number;
  status: OutcomeStatus;
  due: string;
  metric: string;
  owner: string;
  ownerInitials: string;
  priority: OutcomePriority;
  actions: OutcomeAction[];
};

export const outcomes: CustomerOutcome[] = [
  { id: "o1", account: "Cloudflare", title: "Reduce time-to-first-value to under 14 days", current: "11 days", target: "14 days", progress: 100, status: "ahead", due: "Q2", metric: "Days to first activated user",
    owner: "Sarah Chen", ownerInitials: "SC", priority: "high",
    actions: [
      { id: "a1-1", label: "Define activation criteria with product team", done: true, assignee: "Sarah Chen", assigneeInitials: "SC" },
      { id: "a1-2", label: "Set up Mixpanel funnel for activation tracking", done: true, assignee: "Brad Allen", assigneeInitials: "BA", dueDate: "Apr 15" },
      { id: "a1-3", label: "Run first cohort analysis", done: true, assignee: "Sarah Chen", assigneeInitials: "SC", dueDate: "Apr 22" },
    ] },
  { id: "o2", account: "Cloudflare", title: "Land Connect rollout across 3 BUs by Q3", current: "1 of 3", target: "3 of 3", progress: 33, status: "on-track", due: "Sep 30", metric: "BUs live on Connect",
    owner: "Sarah Chen", ownerInitials: "SC", priority: "high",
    actions: [
      { id: "a2-1", label: "Schedule kickoff with Networking BU lead", done: true, assignee: "Sarah Chen", assigneeInitials: "SC" },
      { id: "a2-2", label: "Draft BU-specific onboarding plan", done: false, assignee: "Brad Allen", assigneeInitials: "BA", dueDate: "May 20" },
      { id: "a2-3", label: "Technical integration review for Security BU", done: false, assignee: "Mike Torres", assigneeInitials: "MT", dueDate: "Jun 10" },
      { id: "a2-4", label: "Executive alignment meeting with VP Eng", done: false, assignee: "Sarah Chen", assigneeInitials: "SC", dueDate: "Jun 30" },
    ] },
  { id: "o3", account: "Tableau Software", title: "Convert agent governance pilot into production", current: "Pilot", target: "GA", progress: 70, status: "on-track", due: "Jun 30", metric: "Phase",
    owner: "Paul Acker", ownerInitials: "PA", priority: "medium",
    actions: [
      { id: "a3-1", label: "Complete pilot success metrics review", done: true, assignee: "Paul Acker", assigneeInitials: "PA" },
      { id: "a3-2", label: "Get sign-off from compliance team", done: true, assignee: "Paul Acker", assigneeInitials: "PA" },
      { id: "a3-3", label: "Migrate pilot config to production environment", done: false, assignee: "Mike Torres", assigneeInitials: "MT", dueDate: "May 25" },
      { id: "a3-4", label: "Run load test on production cluster", done: false, assignee: "Brad Allen", assigneeInitials: "BA", dueDate: "Jun 15" },
      { id: "a3-5", label: "Publish GA rollout comms to stakeholders", done: false, assignee: "Paul Acker", assigneeInitials: "PA", dueDate: "Jun 28" },
    ] },
  { id: "o4", account: "Tableau Software", title: "Onboard 4 incoming ML engineers within 21 days", current: "2 of 4", target: "4 of 4", progress: 50, status: "on-track", due: "May 15", metric: "Activated seats",
    owner: "Paul Acker", ownerInitials: "PA", priority: "medium",
    actions: [
      { id: "a4-1", label: "Send onboarding invitations to all 4 engineers", done: true, assignee: "Paul Acker", assigneeInitials: "PA" },
      { id: "a4-2", label: "Conduct live walkthrough session #1", done: true, assignee: "Mike Torres", assigneeInitials: "MT" },
      { id: "a4-3", label: "Conduct live walkthrough session #2", done: false, assignee: "Mike Torres", assigneeInitials: "MT", dueDate: "May 10" },
      { id: "a4-4", label: "Verify all seats activated in admin portal", done: false, assignee: "Paul Acker", assigneeInitials: "PA", dueDate: "May 14" },
    ] },
  { id: "o5", account: "GitLab Inc.", title: "Reverse WAU/MAU decline (0.62 → 0.65)", current: "0.48", target: "0.65", progress: 25, status: "at-risk", due: "Jun 15", metric: "WAU/MAU rolling 4w",
    owner: "Sarah Chen", ownerInitials: "SC", priority: "high",
    actions: [
      { id: "a5-1", label: "Identify top 3 drop-off points in user funnel", done: true, assignee: "Sarah Chen", assigneeInitials: "SC" },
      { id: "a5-2", label: "Run targeted re-engagement campaign for dormant users", done: false, assignee: "Brad Allen", assigneeInitials: "BA", dueDate: "May 12" },
      { id: "a5-3", label: "Ship in-app nudge for underused features", done: false, assignee: "Mike Torres", assigneeInitials: "MT", dueDate: "May 20" },
      { id: "a5-4", label: "Review 2-week WAU/MAU trend after interventions", done: false, assignee: "Sarah Chen", assigneeInitials: "SC", dueDate: "Jun 5" },
    ] },
  { id: "o6", account: "Snowflake", title: "Recover sponsor engagement after 24-day gap", current: "24d", target: "0d", progress: 5, status: "at-risk", due: "Apr 30", metric: "Days since last touch",
    owner: "Brad Allen", ownerInitials: "BA", priority: "high",
    actions: [
      { id: "a6-1", label: "Send personalized check-in email to sponsor", done: true, assignee: "Brad Allen", assigneeInitials: "BA" },
      { id: "a6-2", label: "Escalate to VP with context brief", done: false, assignee: "Brad Allen", assigneeInitials: "BA", dueDate: "Apr 28" },
      { id: "a6-3", label: "Schedule 1:1 recovery call", done: false, assignee: "Sarah Chen", assigneeInitials: "SC", dueDate: "Apr 30" },
    ] },
  { id: "o7", account: "Akamai", title: "Open a second BU within 90 days", current: "Lead", target: "Won", progress: 45, status: "on-track", due: "Q3", metric: "Stage",
    owner: "Mike Torres", ownerInitials: "MT", priority: "medium",
    actions: [
      { id: "a7-1", label: "Map org chart for target BU", done: true, assignee: "Mike Torres", assigneeInitials: "MT" },
      { id: "a7-2", label: "Get warm intro from existing champion", done: true, assignee: "Mike Torres", assigneeInitials: "MT" },
      { id: "a7-3", label: "Deliver tailored value prop deck", done: false, assignee: "Paul Acker", assigneeInitials: "PA", dueDate: "May 30" },
      { id: "a7-4", label: "Schedule technical discovery with BU stakeholders", done: false, assignee: "Mike Torres", assigneeInitials: "MT", dueDate: "Jun 15" },
    ] },
  { id: "o8", account: "Snowflake", title: "Deliver health recovery plan after sponsor re-engagement", current: "Draft", target: "Signed off", progress: 20, status: "watch", due: "May 15", metric: "Recovery plan status",
    owner: "Brad Allen", ownerInitials: "BA", priority: "low",
    actions: [
      { id: "a8-1", label: "Draft recovery plan document", done: true, assignee: "Brad Allen", assigneeInitials: "BA" },
      { id: "a8-2", label: "Review plan with internal leadership", done: false, assignee: "Sarah Chen", assigneeInitials: "SC", dueDate: "May 8" },
      { id: "a8-3", label: "Present plan to customer sponsor for sign-off", done: false, assignee: "Brad Allen", assigneeInitials: "BA", dueDate: "May 13" },
    ] },
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

// =====================================================================
// White Space / Product Penetration — Phase 1 Expansion Engine
// =====================================================================

export type ProductLine = {
  id: string;
  name: string;
  description: string;
  category: "Core" | "Analytics" | "AI" | "Platform" | "Add-on";
};

export const productCatalog: ProductLine[] = [
  { id: "sales",        name: "Alphard · Sales Cloud",     description: "Pipeline, forecast, deal hygiene",                 category: "Core" },
  { id: "cs",           name: "Alphard · CS Cloud",        description: "Health, outcomes, adoption tracking",              category: "Core" },
  { id: "insights",     name: "Alphard · Insights",        description: "Cross-tenant benchmarks & analytics",             category: "Analytics" },
  { id: "ai-copilot",   name: "Alphard · AI Copilot",      description: "Autonomous meeting prep, follow-ups, coaching",   category: "AI" },
  { id: "workflows",    name: "Alphard · Workflows",       description: "Automated playbooks & orchestration",             category: "Platform" },
  { id: "data-hub",     name: "Alphard · Data Hub",        description: "Integrations, enrichment, CRM sync",              category: "Platform" },
  { id: "rev-intel",    name: "Alphard · Revenue Intel",   description: "Call recording, conversation analytics",          category: "Analytics" },
  { id: "forecasting",  name: "Alphard · Forecasting",     description: "AI-driven forecast modeling & scenarios",          category: "AI" },
];

export type WhiteSpaceCellStatus = "active" | "trial" | "expansion-target" | "not-sold";

export type WhiteSpaceCell = {
  productId: string;
  department: string;
  status: WhiteSpaceCellStatus;
  seats?: number;
  arr?: number;
  confidence?: number;     // 0-100, how confident we are expansion would land
  estimatedArr?: number;   // potential ARR from expanding into this cell
  patternMatches?: number; // how many similar accounts converted this cell
};

export type WhiteSpaceAnalysis = {
  accountSlug: string;
  cells: WhiteSpaceCell[];
  totalWhiteSpace: number;    // sum of estimatedArr for not-sold + expansion-target
  adoptionPct: number;        // % of catalog adopted
  topOpportunity: string;     // product name of biggest gap
};

const departments = ["Sales", "Engineering", "Product", "Finance", "Operations", "Executive"];

export const whiteSpaceData: Record<string, WhiteSpaceAnalysis> = {
  [slugify("Cloudflare, Inc.")]: {
    accountSlug: slugify("Cloudflare, Inc."),
    cells: [
      { productId: "sales",       department: "Sales",       status: "active",           seats: 120, arr: 396_000 },
      { productId: "sales",       department: "Engineering", status: "not-sold",          estimatedArr: 80_000, confidence: 45, patternMatches: 2 },
      { productId: "cs",          department: "Sales",       status: "active",           seats: 18,  arr: 216_000 },
      { productId: "cs",          department: "Product",     status: "expansion-target",  estimatedArr: 60_000, confidence: 72, patternMatches: 3 },
      { productId: "insights",    department: "Executive",   status: "active",           seats: 6,   arr: 108_000 },
      { productId: "ai-copilot",  department: "Sales",       status: "trial",            seats: 10 },
      { productId: "ai-copilot",  department: "Engineering", status: "not-sold",          estimatedArr: 95_000, confidence: 60, patternMatches: 2 },
      { productId: "workflows",   department: "Operations",  status: "active",           seats: 8,   arr: 0 },
      { productId: "data-hub",    department: "Engineering", status: "not-sold",          estimatedArr: 55_000, confidence: 38, patternMatches: 1 },
      { productId: "rev-intel",   department: "Sales",       status: "expansion-target",  estimatedArr: 120_000, confidence: 82, patternMatches: 4 },
      { productId: "forecasting", department: "Finance",     status: "not-sold",          estimatedArr: 70_000, confidence: 55, patternMatches: 2 },
    ],
    totalWhiteSpace: 480_000,
    adoptionPct: 50,
    topOpportunity: "Alphard · Revenue Intel",
  },
  [slugify("Tableau Software")]: {
    accountSlug: slugify("Tableau Software"),
    cells: [
      { productId: "sales",       department: "Sales",       status: "active",           seats: 40,  arr: 198_000 },
      { productId: "cs",          department: "Sales",       status: "expansion-target",  estimatedArr: 72_000, confidence: 68, patternMatches: 3 },
      { productId: "insights",    department: "Executive",   status: "not-sold",          estimatedArr: 54_000, confidence: 42, patternMatches: 1 },
      { productId: "ai-copilot",  department: "Sales",       status: "not-sold",          estimatedArr: 85_000, confidence: 75, patternMatches: 3 },
      { productId: "ai-copilot",  department: "Engineering", status: "not-sold",          estimatedArr: 65_000, confidence: 50, patternMatches: 2 },
      { productId: "workflows",   department: "Operations",  status: "trial",            seats: 5 },
      { productId: "rev-intel",   department: "Sales",       status: "expansion-target",  estimatedArr: 90_000, confidence: 80, patternMatches: 4 },
      { productId: "forecasting", department: "Finance",     status: "not-sold",          estimatedArr: 48_000, confidence: 35, patternMatches: 1 },
    ],
    totalWhiteSpace: 414_000,
    adoptionPct: 25,
    topOpportunity: "Alphard · Revenue Intel",
  },
  [slugify("Snowflake Inc.")]: {
    accountSlug: slugify("Snowflake Inc."),
    cells: [
      { productId: "sales",       department: "Sales",       status: "active",           seats: 85,  arr: 264_000 },
      { productId: "cs",          department: "Sales",       status: "active",           seats: 14,  arr: 144_000 },
      { productId: "insights",    department: "Executive",   status: "expansion-target",  estimatedArr: 72_000, confidence: 58, patternMatches: 2 },
      { productId: "ai-copilot",  department: "Sales",       status: "not-sold",          estimatedArr: 90_000, confidence: 40, patternMatches: 1 },
      { productId: "workflows",   department: "Operations",  status: "not-sold",          estimatedArr: 45_000, confidence: 30, patternMatches: 1 },
      { productId: "data-hub",    department: "Engineering", status: "active",           seats: 3,   arr: 72_000 },
      { productId: "rev-intel",   department: "Sales",       status: "not-sold",          estimatedArr: 80_000, confidence: 55, patternMatches: 2 },
      { productId: "forecasting", department: "Finance",     status: "not-sold",          estimatedArr: 60_000, confidence: 45, patternMatches: 1 },
    ],
    totalWhiteSpace: 347_000,
    adoptionPct: 38,
    topOpportunity: "Alphard · AI Copilot",
  },
  [slugify("GitLab Inc.")]: {
    accountSlug: slugify("GitLab Inc."),
    cells: [
      { productId: "sales",       department: "Sales",       status: "active",           seats: 35,  arr: 154_000 },
      { productId: "cs",          department: "Sales",       status: "active",           seats: 8,   arr: 84_000 },
      { productId: "insights",    department: "Executive",   status: "not-sold",          estimatedArr: 42_000, confidence: 35, patternMatches: 1 },
      { productId: "ai-copilot",  department: "Sales",       status: "expansion-target",  estimatedArr: 60_000, confidence: 65, patternMatches: 2 },
      { productId: "workflows",   department: "Operations",  status: "active",           seats: 6,   arr: 42_000 },
      { productId: "rev-intel",   department: "Sales",       status: "not-sold",          estimatedArr: 55_000, confidence: 48, patternMatches: 1 },
      { productId: "forecasting", department: "Finance",     status: "not-sold",          estimatedArr: 38_000, confidence: 30, patternMatches: 0 },
    ],
    totalWhiteSpace: 195_000,
    adoptionPct: 38,
    topOpportunity: "Alphard · AI Copilot",
  },
  [slugify("Akamai Technologies")]: {
    accountSlug: slugify("Akamai Technologies"),
    cells: [
      { productId: "sales",       department: "Sales",       status: "active",           seats: 95,  arr: 297_000 },
      { productId: "cs",          department: "Sales",       status: "active",           seats: 16,  arr: 162_000 },
      { productId: "insights",    department: "Executive",   status: "active",           seats: 5,   arr: 81_000 },
      { productId: "ai-copilot",  department: "Sales",       status: "trial",            seats: 8 },
      { productId: "ai-copilot",  department: "Product",     status: "not-sold",          estimatedArr: 70_000, confidence: 58, patternMatches: 2 },
      { productId: "workflows",   department: "Operations",  status: "not-sold",          estimatedArr: 50_000, confidence: 42, patternMatches: 1 },
      { productId: "data-hub",    department: "Engineering", status: "expansion-target",  estimatedArr: 65_000, confidence: 70, patternMatches: 3 },
      { productId: "rev-intel",   department: "Sales",       status: "active",           seats: 12,  arr: 0 },
      { productId: "forecasting", department: "Finance",     status: "expansion-target",  estimatedArr: 55_000, confidence: 62, patternMatches: 2 },
    ],
    totalWhiteSpace: 240_000,
    adoptionPct: 63,
    topOpportunity: "Alphard · AI Copilot",
  },
};

// =====================================================================
// Expansion Opportunity Scoring — ranked by composite score
// =====================================================================

export type ExpansionFactor = {
  label: string;
  score: number;  // 0-100
  weight: number; // 0-1
};

export type ExpansionStage = "identified" | "qualified" | "proposal" | "negotiation" | "closed";
export const EXPANSION_STAGES: ExpansionStage[] = ["identified", "qualified", "proposal", "negotiation", "closed"];

export type ExpansionComparable = { account: string; arr: number; daysToClose: number };
export type ExpansionMilestone = { label: string; date: string; done: boolean };

export type ExpansionOpportunity = {
  id: string;
  accountSlug: string;
  accountName: string;
  productId: string;
  productName: string;
  estimatedArr: number;
  score: number;          // composite 0-100
  factors: ExpansionFactor[];
  play: string;           // recommended next action
  evidence: string;       // supporting signal
  stage: ExpansionStage;
  daysInStage: number;
  owner: string;
  ownerInitials: string;
  ownerBg: string;
  closeDate: string;
  champion: string;
  championTitle: string;
  risks: string[];
  nextSteps: string[];
  comparables: ExpansionComparable[];
  milestones: ExpansionMilestone[];
  currentArr: number;
  usageTrend: number;     // % change last 30d
};

export const expansionOpportunities: ExpansionOpportunity[] = [
  {
    id: "eo1", accountSlug: slugify("Cloudflare, Inc."), accountName: "Cloudflare", productId: "rev-intel",
    productName: "Revenue Intel", estimatedArr: 120_000, score: 88,
    factors: [
      { label: "Usage signals",     score: 92, weight: 0.3 },
      { label: "Champion strength", score: 95, weight: 0.25 },
      { label: "Budget signals",    score: 80, weight: 0.2 },
      { label: "Timing",            score: 85, weight: 0.15 },
      { label: "Comparables",       score: 90, weight: 0.1 },
    ],
    play: "Schedule Revenue Intel demo with VP Sales",
    evidence: "4 similar accounts converted at avg $110K. Champion Maya Chen just promoted to VP Eng.",
    stage: "proposal", daysInStage: 5, owner: "Walid Qayoumi", ownerInitials: "WQ", ownerBg: "#374151", closeDate: "2025-06-15",
    champion: "Maya Chen", championTitle: "VP, Engineering",
    currentArr: 720_000, usageTrend: 12,
    risks: ["Procurement cycle may extend past Q2 cutoff", "Security review pending for Revenue Intel data access"],
    nextSteps: ["Schedule Revenue Intel demo with VP Sales", "Send ROI calculator with Cloudflare-specific data", "Loop in Jason Park (Security Ops) for compliance sign-off"],
    comparables: [{ account: "Databricks", arr: 135_000, daysToClose: 28 }, { account: "HashiCorp", arr: 110_000, daysToClose: 35 }, { account: "Elastic", arr: 95_000, daysToClose: 42 }],
    milestones: [{ label: "Discovery call completed", date: "2025-04-18", done: true }, { label: "Use case validated", date: "2025-04-28", done: true }, { label: "Proposal sent", date: "2025-05-10", done: true }, { label: "Security review", date: "2025-05-25", done: false }, { label: "Contract signed", date: "2025-06-15", done: false }],
  },
  {
    id: "eo2", accountSlug: slugify("Tableau Software"), accountName: "Tableau", productId: "rev-intel",
    productName: "Revenue Intel", estimatedArr: 90_000, score: 82,
    factors: [
      { label: "Usage signals",     score: 78, weight: 0.3 },
      { label: "Champion strength", score: 85, weight: 0.25 },
      { label: "Budget signals",    score: 88, weight: 0.2 },
      { label: "Timing",            score: 80, weight: 0.15 },
      { label: "Comparables",       score: 82, weight: 0.1 },
    ],
    play: "Share governance gap analysis with ML team lead",
    evidence: "Hiring 4 ML engineers — governance gap flagged in last call. 3 pattern matches.",
    stage: "qualified", daysInStage: 12, owner: "Marcus Webb", ownerInitials: "MW", ownerBg: "#1E40AF", closeDate: "2025-07-01",
    champion: "Priya Sharma", championTitle: "Head of Revenue Operations",
    currentArr: 540_000, usageTrend: 8,
    risks: ["New Head of RevOps still ramping — may delay decisions", "Competing priority: Tableau is evaluating vendor consolidation"],
    nextSteps: ["Share governance gap analysis with ML team lead", "Schedule joint call with Priya Sharma + Sales Director", "Prepare competitive positioning vs. incumbent"],
    comparables: [{ account: "Snowflake", arr: 95_000, daysToClose: 38 }, { account: "Datadog", arr: 88_000, daysToClose: 45 }],
    milestones: [{ label: "Intro call with RevOps", date: "2025-04-22", done: true }, { label: "Gap analysis shared", date: "2025-05-14", done: false }, { label: "Proposal delivered", date: "2025-06-01", done: false }, { label: "Contract signed", date: "2025-07-01", done: false }],
  },
  {
    id: "eo3", accountSlug: slugify("Tableau Software"), accountName: "Tableau", productId: "ai-copilot",
    productName: "AI Copilot", estimatedArr: 85_000, score: 78,
    factors: [
      { label: "Usage signals",     score: 72, weight: 0.3 },
      { label: "Champion strength", score: 80, weight: 0.25 },
      { label: "Budget signals",    score: 82, weight: 0.2 },
      { label: "Timing",            score: 78, weight: 0.15 },
      { label: "Comparables",       score: 75, weight: 0.1 },
    ],
    play: "Propose AI Copilot pilot to Sales Director",
    evidence: "High engagement with manual meeting prep. 3 comparable conversions at avg $80K.",
    stage: "identified", daysInStage: 8, owner: "Walid Qayoumi", ownerInitials: "WQ", ownerBg: "#374151", closeDate: "2025-08-01",
    champion: "Priya Sharma", championTitle: "Head of Revenue Operations",
    currentArr: 540_000, usageTrend: 5,
    risks: ["No executive sponsor identified yet", "Budget cycle starts in Q4 — may defer to next fiscal year"],
    nextSteps: ["Propose AI Copilot pilot to Sales Director", "Quantify time saved on manual meeting prep", "Identify exec sponsor for budget approval"],
    comparables: [{ account: "HubSpot", arr: 92_000, daysToClose: 55 }, { account: "Outreach", arr: 78_000, daysToClose: 40 }],
    milestones: [{ label: "Need identified", date: "2025-04-27", done: true }, { label: "Pilot proposed", date: "2025-05-20", done: false }, { label: "Pilot completed", date: "2025-06-20", done: false }, { label: "Contract signed", date: "2025-08-01", done: false }],
  },
  {
    id: "eo4", accountSlug: slugify("Cloudflare, Inc."), accountName: "Cloudflare", productId: "ai-copilot",
    productName: "AI Copilot", estimatedArr: 95_000, score: 75,
    factors: [
      { label: "Usage signals",     score: 70, weight: 0.3 },
      { label: "Champion strength", score: 85, weight: 0.25 },
      { label: "Budget signals",    score: 68, weight: 0.2 },
      { label: "Timing",            score: 78, weight: 0.15 },
      { label: "Comparables",       score: 72, weight: 0.1 },
    ],
    play: "Convert AI Copilot trial to paid — 10 seats active",
    evidence: "Trial active with 10 seats in Sales. 60% weekly engagement rate.",
    stage: "negotiation", daysInStage: 3, owner: "Walid Qayoumi", ownerInitials: "WQ", ownerBg: "#374151", closeDate: "2025-05-30",
    champion: "Maya Chen", championTitle: "VP, Engineering",
    currentArr: 720_000, usageTrend: 18,
    risks: ["Trial ends May 28 — tight window to convert", "Procurement requires 3 quotes for >$50K spend"],
    nextSteps: ["Send trial usage report to Maya Chen", "Draft conversion proposal with volume discount", "Get verbal commit before trial expiry"],
    comparables: [{ account: "Stripe", arr: 105_000, daysToClose: 18 }, { account: "Figma", arr: 88_000, daysToClose: 22 }],
    milestones: [{ label: "Trial launched", date: "2025-04-15", done: true }, { label: "10 seats activated", date: "2025-04-28", done: true }, { label: "Usage review", date: "2025-05-12", done: true }, { label: "Proposal sent", date: "2025-05-20", done: true }, { label: "Contract signed", date: "2025-05-30", done: false }],
  },
  {
    id: "eo5", accountSlug: slugify("Akamai Technologies"), accountName: "Akamai", productId: "data-hub",
    productName: "Data Hub", estimatedArr: 65_000, score: 72,
    factors: [
      { label: "Usage signals",     score: 65, weight: 0.3 },
      { label: "Champion strength", score: 78, weight: 0.25 },
      { label: "Budget signals",    score: 75, weight: 0.2 },
      { label: "Timing",            score: 70, weight: 0.15 },
      { label: "Comparables",       score: 68, weight: 0.1 },
    ],
    play: "Present Data Hub integration roadmap to Engineering lead",
    evidence: "3 comparable accounts adopted Data Hub post-Insights. Eng team evaluating enrichment tools.",
    stage: "identified", daysInStage: 18, owner: "Marcus Webb", ownerInitials: "MW", ownerBg: "#1E40AF", closeDate: "2025-08-15",
    champion: "Tom Nakamura", championTitle: "Engineering Lead",
    currentArr: 380_000, usageTrend: -3,
    risks: ["Deal stale — 18 days without progression", "Eng team evaluating 2 competing enrichment tools", "Usage trending down — may weaken expansion case"],
    nextSteps: ["Present Data Hub integration roadmap to Engineering lead", "Run competitive tear-down vs. enrichment alternatives", "Schedule exec sponsor meeting to unblock"],
    comparables: [{ account: "Twilio", arr: 72_000, daysToClose: 52 }, { account: "MongoDB", arr: 68_000, daysToClose: 48 }],
    milestones: [{ label: "Interest flagged", date: "2025-04-17", done: true }, { label: "Roadmap presented", date: "2025-05-15", done: false }, { label: "Pilot approved", date: "2025-06-15", done: false }, { label: "Contract signed", date: "2025-08-15", done: false }],
  },
  {
    id: "eo6", accountSlug: slugify("Snowflake Inc."), accountName: "Snowflake", productId: "insights",
    productName: "Insights", estimatedArr: 72_000, score: 65,
    factors: [
      { label: "Usage signals",     score: 60, weight: 0.3 },
      { label: "Champion strength", score: 50, weight: 0.25 },
      { label: "Budget signals",    score: 70, weight: 0.2 },
      { label: "Timing",            score: 72, weight: 0.15 },
      { label: "Comparables",       score: 68, weight: 0.1 },
    ],
    play: "Include Insights demo in next QBR deck",
    evidence: "Renewal in 47 days — positioning as value-add to strengthen retention.",
    stage: "qualified", daysInStage: 6, owner: "Walid Qayoumi", ownerInitials: "WQ", ownerBg: "#374151", closeDate: "2025-06-20",
    champion: "Brad Wallace", championTitle: "VP Sales Ops",
    currentArr: 480_000, usageTrend: -11,
    risks: ["Champion silent 14 days", "Renewal at risk — expansion may be premature"],
    nextSteps: ["Include Insights demo in next QBR deck", "Re-engage Brad Wallace with value update"],
    comparables: [{ account: "Databricks", arr: 78_000, daysToClose: 35 }],
    milestones: [{ label: "Opportunity identified", date: "2025-04-28", done: true }, { label: "QBR scheduled", date: "2025-05-20", done: false }, { label: "Contract signed", date: "2025-06-20", done: false }],
  },
  {
    id: "eo7", accountSlug: slugify("GitLab Inc."), accountName: "GitLab", productId: "ai-copilot",
    productName: "AI Copilot", estimatedArr: 60_000, score: 62,
    factors: [
      { label: "Usage signals",     score: 55, weight: 0.3 },
      { label: "Champion strength", score: 68, weight: 0.25 },
      { label: "Budget signals",    score: 60, weight: 0.2 },
      { label: "Timing",            score: 65, weight: 0.15 },
      { label: "Comparables",       score: 62, weight: 0.1 },
    ],
    play: "Propose AI Copilot to reduce meeting prep overhead",
    evidence: "WAU/MAU dropping — AI Copilot could boost engagement. 2 comparables at avg $55K.",
    stage: "identified", daysInStage: 22, owner: "Rachel Kim", ownerInitials: "RK", ownerBg: "#7C3AED", closeDate: "2025-09-01",
    champion: "Derek Olsen", championTitle: "Sales Manager",
    currentArr: 290_000, usageTrend: -8,
    risks: ["WAU/MAU declining — account health at risk", "No budget allocated for new tools this quarter"],
    nextSteps: ["Propose AI Copilot to reduce meeting prep overhead", "Show ROI from comparable accounts"],
    comparables: [{ account: "HubSpot", arr: 58_000, daysToClose: 60 }],
    milestones: [{ label: "Need identified", date: "2025-04-13", done: true }, { label: "Proposal sent", date: "2025-06-01", done: false }, { label: "Contract signed", date: "2025-09-01", done: false }],
  },
  {
    id: "eo8", accountSlug: slugify("Akamai Technologies"), accountName: "Akamai", productId: "forecasting",
    productName: "Forecasting", estimatedArr: 55_000, score: 58,
    factors: [
      { label: "Usage signals",     score: 52, weight: 0.3 },
      { label: "Champion strength", score: 65, weight: 0.25 },
      { label: "Budget signals",    score: 58, weight: 0.2 },
      { label: "Timing",            score: 55, weight: 0.15 },
      { label: "Comparables",       score: 60, weight: 0.1 },
    ],
    play: "Bundle Forecasting add-on into renewal proposal",
    evidence: "Finance team manually pulling reports from Insights. Natural upsell path.",
    stage: "identified", daysInStage: 10, owner: "Marcus Webb", ownerInitials: "MW", ownerBg: "#1E40AF", closeDate: "2025-09-15",
    champion: "Tom Nakamura", championTitle: "Engineering Lead",
    currentArr: 380_000, usageTrend: -3,
    risks: ["Low urgency — may slip to next quarter", "Finance team not yet engaged"],
    nextSteps: ["Bundle Forecasting add-on into renewal proposal", "Demo Forecasting to Finance team"],
    comparables: [{ account: "Twilio", arr: 60_000, daysToClose: 45 }],
    milestones: [{ label: "Need identified", date: "2025-04-25", done: true }, { label: "Demo scheduled", date: "2025-05-25", done: false }, { label: "Contract signed", date: "2025-09-15", done: false }],
  },
];

// =====================================================================
// Champion Change Detection
// =====================================================================

export type ChampionChange = {
  id: string;
  accountSlug: string;
  accountName: string;
  personName: string;
  changeType: "promotion" | "departure" | "role-change" | "new-hire";
  oldTitle: string;
  newTitle: string;
  detectedAgo: string;
  tone: "pos" | "warn" | "neg" | "info";
  recommendedPlay: string;
  impact: "high" | "medium" | "low";
};

export const championChanges: ChampionChange[] = [
  {
    id: "cc1", accountSlug: slugify("Cloudflare, Inc."), accountName: "Cloudflare",
    personName: "Maya Chen", changeType: "promotion",
    oldTitle: "Sr. Director Engineering", newTitle: "VP Engineering",
    detectedAgo: "12h", tone: "pos",
    recommendedPlay: "Expansion outreach — budget scope now spans Networking + Security",
    impact: "high",
  },
  {
    id: "cc2", accountSlug: slugify("Snowflake Inc."), accountName: "Snowflake",
    personName: "James Whitfield", changeType: "departure",
    oldTitle: "VP Sales Operations", newTitle: "Left company",
    detectedAgo: "2d", tone: "neg",
    recommendedPlay: "Succession recovery — identify new sponsor before renewal in 47 days",
    impact: "high",
  },
  {
    id: "cc3", accountSlug: slugify("Tableau Software"), accountName: "Tableau",
    personName: "Priya Sharma", changeType: "new-hire",
    oldTitle: "N/A", newTitle: "Head of Revenue Operations",
    detectedAgo: "3d", tone: "info",
    recommendedPlay: "Introductory outreach — new RevOps leader likely evaluating tooling",
    impact: "medium",
  },
  {
    id: "cc4", accountSlug: slugify("GitLab Inc."), accountName: "GitLab",
    personName: "Alex Rivera", changeType: "role-change",
    oldTitle: "Sales Manager", newTitle: "Director of Sales Enablement",
    detectedAgo: "5d", tone: "pos",
    recommendedPlay: "Re-engage with enablement pitch — AI Copilot aligns with new mandate",
    impact: "medium",
  },
];

// =====================================================================
// Cross-sell / Upsell Recommendations
// =====================================================================

export type CrossSellRecommendation = {
  id: string;
  accountSlug: string;
  accountName: string;
  productId: string;
  productName: string;
  estimatedArr: number;
  confidence: number;     // 0-100
  evidence: string[];
  suggestedPlay: string;
};

// =====================================================================
// Customer Portal / Success Plans
// =====================================================================

export type SuccessMilestone = {
  id: string;
  title: string;
  dueDate: string;
  status: "completed" | "in-progress" | "upcoming" | "at-risk";
  owner: string;
  ownerName: string;
};

export type SuccessPlan = {
  id: string;
  accountSlug: string;
  accountName: string;
  goals: string[];
  milestones: SuccessMilestone[];
  sharedWithCustomer: boolean;
  lastUpdated: string;
};

export const successPlans: SuccessPlan[] = [
  {
    id: "sp1", accountSlug: "cloudflare-inc", accountName: "Cloudflare",
    goals: ["Achieve 80% team adoption by end of Q2", "Expand to Security org by Q3", "Reduce meeting prep time by 50%"],
    sharedWithCustomer: true, lastUpdated: "2026-05-01",
    milestones: [
      { id: "m1", title: "Complete onboarding for Sales team", dueDate: "2026-03-15", status: "completed", owner: "WQ", ownerName: "Walid Qayoumi" },
      { id: "m2", title: "Deliver first QBR with usage metrics", dueDate: "2026-04-01", status: "completed", owner: "WQ", ownerName: "Walid Qayoumi" },
      { id: "m3", title: "Pilot AI Copilot with 10 users", dueDate: "2026-04-15", status: "completed", owner: "BA", ownerName: "Brad Allen" },
      { id: "m4", title: "Present expansion business case", dueDate: "2026-05-15", status: "in-progress", owner: "BA", ownerName: "Brad Allen" },
      { id: "m5", title: "Security org kickoff meeting", dueDate: "2026-06-01", status: "upcoming", owner: "WQ", ownerName: "Walid Qayoumi" },
      { id: "m6", title: "Full rollout to 50 seats", dueDate: "2026-06-30", status: "upcoming", owner: "WQ", ownerName: "Walid Qayoumi" },
    ],
  },
  {
    id: "sp2", accountSlug: slugify("Snowflake Inc."), accountName: "Snowflake",
    goals: ["Stabilise health score above 60", "Identify new champion before renewal", "Re-engage dormant teams"],
    sharedWithCustomer: false, lastUpdated: "2026-04-28",
    milestones: [
      { id: "m7", title: "Root cause analysis on usage drop", dueDate: "2026-05-05", status: "completed", owner: "WQ", ownerName: "Walid Qayoumi" },
      { id: "m8", title: "Executive sponsor outreach", dueDate: "2026-05-10", status: "at-risk", owner: "DE", ownerName: "Derek Evans" },
      { id: "m9", title: "Re-engagement campaign launch", dueDate: "2026-05-20", status: "upcoming", owner: "WQ", ownerName: "Walid Qayoumi" },
      { id: "m10", title: "Renewal decision meeting", dueDate: "2026-06-15", status: "upcoming", owner: "WQ", ownerName: "Walid Qayoumi" },
    ],
  },
];

// =====================================================================
// CSM Capacity Planning
// =====================================================================

export type CSMWorkload = {
  id: string;
  name: string;
  initials: string;
  accounts: number;
  totalArr: number;
  healthMix: { healthy: number; watch: number; atRisk: number };
  renewalsNext90: number;
  workloadScore: number;
  weeklyHeatmap: number[];
};

export const csmWorkloads: CSMWorkload[] = [
  { id: "csm1", name: "Brad Allen", initials: "BA", accounts: 12, totalArr: 2_400_000, healthMix: { healthy: 7, watch: 3, atRisk: 2 }, renewalsNext90: 5, workloadScore: 82, weeklyHeatmap: [75, 82, 78, 85, 80, 82] },
  { id: "csm2", name: "Sarah Chen", initials: "SC", accounts: 10, totalArr: 1_800_000, healthMix: { healthy: 6, watch: 3, atRisk: 1 }, renewalsNext90: 3, workloadScore: 68, weeklyHeatmap: [60, 65, 70, 68, 72, 68] },
  { id: "csm3", name: "Paul Acker", initials: "PA", accounts: 8, totalArr: 1_500_000, healthMix: { healthy: 5, watch: 2, atRisk: 1 }, renewalsNext90: 4, workloadScore: 72, weeklyHeatmap: [68, 72, 75, 70, 74, 72] },
  { id: "csm4", name: "Lisa Park", initials: "LP", accounts: 9, totalArr: 1_600_000, healthMix: { healthy: 6, watch: 2, atRisk: 1 }, renewalsNext90: 2, workloadScore: 55, weeklyHeatmap: [50, 55, 52, 58, 54, 55] },
  { id: "csm5", name: "Rachel Kim", initials: "RK", accounts: 7, totalArr: 1_200_000, healthMix: { healthy: 5, watch: 1, atRisk: 1 }, renewalsNext90: 2, workloadScore: 45, weeklyHeatmap: [42, 45, 48, 44, 46, 45] },
  { id: "csm6", name: "Derek Evans", initials: "DE", accounts: 5, totalArr: 900_000, healthMix: { healthy: 4, watch: 1, atRisk: 0 }, renewalsNext90: 1, workloadScore: 35, weeklyHeatmap: [30, 35, 32, 38, 34, 35] },
];

// =====================================================================
// Email Campaigns / Journey Orchestration
// =====================================================================

export type JourneyStepKind = "email" | "wait" | "condition" | "goal";

export type JourneyStep = {
  id: string;
  kind: JourneyStepKind;
  label: string;
  metrics?: { sent?: number; opened?: number; clicked?: number; replied?: number };
};

export type Campaign = {
  id: string;
  name: string;
  kind: "nurture" | "onboarding" | "re-engagement" | "expansion";
  status: "active" | "paused" | "draft";
  steps: JourneyStep[];
  enrolled: number;
  completed: number;
  metrics: { openRate: number; replyRate: number };
};

export const campaigns: Campaign[] = [
  {
    id: "camp1", name: "Adoption Re-engagement", kind: "re-engagement", status: "active",
    enrolled: 42, completed: 18,
    metrics: { openRate: 64, replyRate: 22 },
    steps: [
      { id: "s1", kind: "email", label: "Usage drop alert", metrics: { sent: 42, opened: 28, clicked: 12, replied: 6 } },
      { id: "s2", kind: "wait", label: "Wait 3 days" },
      { id: "s3", kind: "condition", label: "If no login" },
      { id: "s4", kind: "email", label: "Value reminder", metrics: { sent: 30, opened: 18, clicked: 8, replied: 4 } },
      { id: "s5", kind: "wait", label: "Wait 5 days" },
      { id: "s6", kind: "email", label: "CSM outreach", metrics: { sent: 22, opened: 14, clicked: 6, replied: 3 } },
      { id: "s7", kind: "goal", label: "Re-activated" },
    ],
  },
  {
    id: "camp2", name: "Onboarding Journey", kind: "onboarding", status: "active",
    enrolled: 28, completed: 12,
    metrics: { openRate: 72, replyRate: 31 },
    steps: [
      { id: "s8", kind: "email", label: "Welcome", metrics: { sent: 28, opened: 24, clicked: 18, replied: 8 } },
      { id: "s9", kind: "wait", label: "Wait 1 day" },
      { id: "s10", kind: "email", label: "Setup guide", metrics: { sent: 28, opened: 20, clicked: 14, replied: 5 } },
      { id: "s11", kind: "wait", label: "Wait 3 days" },
      { id: "s12", kind: "condition", label: "If setup complete" },
      { id: "s13", kind: "email", label: "Advanced features", metrics: { sent: 18, opened: 12, clicked: 8, replied: 4 } },
      { id: "s14", kind: "goal", label: "Fully onboarded" },
    ],
  },
  {
    id: "camp3", name: "Expansion Nurture", kind: "expansion", status: "draft",
    enrolled: 0, completed: 0,
    metrics: { openRate: 0, replyRate: 0 },
    steps: [
      { id: "s15", kind: "email", label: "ROI summary" },
      { id: "s16", kind: "wait", label: "Wait 7 days" },
      { id: "s17", kind: "email", label: "Case study" },
      { id: "s18", kind: "condition", label: "If engaged" },
      { id: "s19", kind: "email", label: "Proposal intro" },
      { id: "s20", kind: "goal", label: "Meeting booked" },
    ],
  },
];

// =====================================================================
// @Mentions & Internal Comments
// =====================================================================

export type ActivityComment = {
  id: string;
  accountSlug: string;
  author: string;
  authorInitials: string;
  text: string;
  at: string;
  mentions: string[];
};

export const activityComments: Record<string, ActivityComment[]> = {
  "cloudflare-inc": [
    { id: "ac1", accountSlug: "cloudflare-inc", author: "Brad Allen", authorInitials: "BA", text: "Just spoke with @Maya Chen — she's interested in Revenue Intel for the Security org. Let's get @Sarah Chen on the next call.", at: "2026-05-04T10:30:00Z", mentions: ["Maya Chen", "Sarah Chen"] },
    { id: "ac2", accountSlug: "cloudflare-inc", author: "Sarah Chen", authorInitials: "SC", text: "Thanks @Brad Allen — I'll prep the demo deck and send calendar invite for Thursday.", at: "2026-05-04T14:15:00Z", mentions: ["Brad Allen"] },
    { id: "ac3", accountSlug: "cloudflare-inc", author: "Walid Qayoumi", authorInitials: "WQ", text: "Great momentum here. @Brad Allen can you also loop in the VP Sales from their side?", at: "2026-05-05T09:00:00Z", mentions: ["Brad Allen"] },
  ],
  [slugify("Snowflake Inc.")]: [
    { id: "ac4", accountSlug: slugify("Snowflake Inc."), author: "Walid Qayoumi", authorInitials: "WQ", text: "Champion gone silent — @Derek Evans please try the exec-to-exec approach we discussed.", at: "2026-05-03T16:00:00Z", mentions: ["Derek Evans"] },
    { id: "ac5", accountSlug: slugify("Snowflake Inc."), author: "Derek Evans", authorInitials: "DE", text: "On it. Will have VP reach out to their CRO by EOD tomorrow.", at: "2026-05-04T08:30:00Z", mentions: [] },
  ],
};

export const teamMembers = [
  { name: "Walid Qayoumi", initials: "WQ" },
  { name: "Sarah Chen", initials: "SC" },
  { name: "Brad Allen", initials: "BA" },
  { name: "Paul Acker", initials: "PA" },
  { name: "Mike Torres", initials: "MT" },
  { name: "Lisa Park", initials: "LP" },
  { name: "Derek Evans", initials: "DE" },
  { name: "Rachel Kim", initials: "RK" },
  { name: "Tom Walker", initials: "TW" },
];

// =====================================================================
// NPS/CSAT Survey Engine
// =====================================================================

export type SurveyResponse = {
  id: string;
  accountSlug: string;
  accountName: string;
  respondent: string;
  score: number;
  comment?: string;
  at: string;
};

export type Survey = {
  id: string;
  kind: "nps" | "csat" | "ces";
  title: string;
  status: "active" | "closed" | "draft";
  sentCount: number;
  responseCount: number;
  responses: SurveyResponse[];
  createdAt: string;
};

export const surveys: Survey[] = [
  {
    id: "sv1", kind: "nps", title: "Q2 NPS Pulse", status: "active",
    sentCount: 42, responseCount: 28, createdAt: "2026-04-15",
    responses: [
      { id: "sr1", accountSlug: "cloudflare-inc", accountName: "Cloudflare", respondent: "Maya Chen", score: 9, comment: "Excellent product — team loves the AI features.", at: "2026-04-20" },
      { id: "sr2", accountSlug: slugify("Snowflake Inc."), accountName: "Snowflake", respondent: "Brad Wallace", score: 5, comment: "Support response time has been slow.", at: "2026-04-21" },
      { id: "sr3", accountSlug: "akamai-technologies", accountName: "Akamai", respondent: "Lin Park", score: 8, at: "2026-04-22" },
      { id: "sr4", accountSlug: "tableau-software", accountName: "Tableau", respondent: "Jordan Lee", score: 9, comment: "Great onboarding experience.", at: "2026-04-23" },
      { id: "sr5", accountSlug: "gitlab-inc", accountName: "GitLab", respondent: "Priya Anand", score: 6, comment: "Feature gaps compared to previous tool.", at: "2026-04-24" },
    ],
  },
  {
    id: "sv2", kind: "csat", title: "Onboarding CSAT", status: "closed",
    sentCount: 18, responseCount: 15, createdAt: "2026-03-01",
    responses: [
      { id: "sr6", accountSlug: "cloudflare-inc", accountName: "Cloudflare", respondent: "Maya Chen", score: 5, at: "2026-03-10" },
      { id: "sr7", accountSlug: "tableau-software", accountName: "Tableau", respondent: "Jordan Lee", score: 4, comment: "Documentation could be better.", at: "2026-03-12" },
    ],
  },
  {
    id: "sv3", kind: "nps", title: "Q3 NPS Pulse", status: "draft",
    sentCount: 0, responseCount: 0, createdAt: "2026-05-01", responses: [],
  },
];

// =====================================================================
// Revenue Waterfall / Movement
// =====================================================================

export type WaterfallPeriod = {
  period: string;
  startArr: number;
  newBusiness: number;
  expansion: number;
  contraction: number;
  churn: number;
  endArr: number;
};

export const waterfallData: WaterfallPeriod[] = [
  { period: "Q1 '26", startArr: 2_100_000, newBusiness: 340_000, expansion: 180_000, contraction: -60_000, churn: -120_000, endArr: 2_440_000 },
  { period: "Q2 '26", startArr: 2_440_000, newBusiness: 280_000, expansion: 220_000, contraction: -45_000, churn: -85_000, endArr: 2_810_000 },
];

export type AccountMovement = {
  account: string;
  slug: string;
  months: ("expansion" | "contraction" | "churn" | "flat" | "new")[];
  arr: number;
};

export const accountMovements: AccountMovement[] = [
  { account: "Cloudflare", slug: "cloudflare-inc", months: ["flat", "expansion", "expansion", "flat", "expansion", "flat"], arr: 720_000 },
  { account: "Snowflake", slug: slugify("Snowflake Inc."), months: ["flat", "flat", "contraction", "flat", "contraction", "flat"], arr: 480_000 },
  { account: "Akamai", slug: "akamai-technologies", months: ["flat", "flat", "flat", "expansion", "flat", "expansion"], arr: 540_000 },
  { account: "Tableau", slug: "tableau-software", months: ["new", "flat", "flat", "expansion", "flat", "flat"], arr: 360_000 },
  { account: "GitLab", slug: "gitlab-inc", months: ["flat", "flat", "flat", "flat", "contraction", "flat"], arr: 280_000 },
];

// =====================================================================
// Report Builder
// =====================================================================

export type ChartType = "bar" | "line" | "donut" | "table";
export type DataSource = "Deals" | "Accounts" | "Calls" | "Outcomes" | "Usage";

export type ReportConfig = {
  id: string;
  title: string;
  dataSource: DataSource;
  dimensions: string[];
  metrics: string[];
  chartType: ChartType;
  filters: { field: string; op: string; value: string }[];
};

export const savedReportConfigs: ReportConfig[] = [
  {
    id: "rc1", title: "Pipeline by Stage", dataSource: "Deals",
    dimensions: ["Stage"], metrics: ["Count", "Total Amount"],
    chartType: "bar", filters: [],
  },
  {
    id: "rc2", title: "Health by Segment", dataSource: "Accounts",
    dimensions: ["Segment", "Health"], metrics: ["Count", "ARR"],
    chartType: "donut", filters: [],
  },
  {
    id: "rc3", title: "Win Rate Trend", dataSource: "Deals",
    dimensions: ["Month"], metrics: ["Win Rate"],
    chartType: "line", filters: [{ field: "Stage", op: "in", value: "Closed Won,Closed Lost" }],
  },
];

export const reportDimensions: Record<DataSource, string[]> = {
  Deals: ["Stage", "Owner", "Segment", "Pipeline", "Month", "Quarter"],
  Accounts: ["Segment", "Health", "Owner", "Industry", "Tier"],
  Calls: ["Type", "Outcome", "Week", "Rep"],
  Outcomes: ["Category", "Quarter", "Account", "Status"],
  Usage: ["Product", "Department", "Week", "Tier"],
};

export const reportMetrics: Record<DataSource, string[]> = {
  Deals: ["Count", "Total Amount", "Avg Amount", "Win Rate", "Cycle Time"],
  Accounts: ["Count", "ARR", "NRR", "Health Score", "Avg Engagement"],
  Calls: ["Count", "Duration", "Talk Ratio", "Sentiment"],
  Outcomes: ["Count", "Completion Rate", "Time to Complete"],
  Usage: ["MAU", "WAU", "DAU", "Adoption %", "Feature Usage"],
};

export const crossSellRecommendations: CrossSellRecommendation[] = [
  {
    id: "csr1", accountSlug: slugify("Cloudflare, Inc."), accountName: "Cloudflare",
    productId: "rev-intel", productName: "Revenue Intel", estimatedArr: 120_000, confidence: 88,
    evidence: [
      "4 comparable accounts converted at avg $110K ARR",
      "Sales team records 40+ calls/week — ideal Revenue Intel profile",
      "Champion (Maya Chen, VP Eng) verbally confirmed interest in call analytics",
    ],
    suggestedPlay: "Build ROI case showing call volume savings + deal velocity improvement",
  },
  {
    id: "csr2", accountSlug: slugify("Tableau Software"), accountName: "Tableau",
    productId: "ai-copilot", productName: "AI Copilot", estimatedArr: 85_000, confidence: 75,
    evidence: [
      "Sales team spends 4+ hrs/week on manual meeting prep",
      "3 comparable accounts reduced prep time by 62%",
      "New Head of RevOps (Priya Sharma) evaluating AI tooling",
    ],
    suggestedPlay: "Propose 30-day pilot with Sales team — measure prep time reduction",
  },
  {
    id: "csr3", accountSlug: slugify("Akamai Technologies"), accountName: "Akamai",
    productId: "data-hub", productName: "Data Hub", estimatedArr: 65_000, confidence: 70,
    evidence: [
      "Engineering team evaluating enrichment tools per LinkedIn activity",
      "3 comparable accounts adopted Data Hub post-Insights deployment",
      "Current CRM sync is manual — Data Hub automates 80% of enrichment",
    ],
    suggestedPlay: "Present integration roadmap showing CRM auto-sync capabilities",
  },
  {
    id: "csr4", accountSlug: slugify("Snowflake Inc."), accountName: "Snowflake",
    productId: "insights", productName: "Insights", estimatedArr: 72_000, confidence: 58,
    evidence: [
      "Executive team lacks cross-tenant visibility",
      "Renewal in 47 days — value-add could strengthen retention case",
      "2 comparable accounts bundled Insights into renewal at 15% premium",
    ],
    suggestedPlay: "Include Insights demo in QBR deck — position as renewal sweetener",
  },
  {
    id: "csr5", accountSlug: slugify("GitLab Inc."), accountName: "GitLab",
    productId: "ai-copilot", productName: "AI Copilot", estimatedArr: 60_000, confidence: 62,
    evidence: [
      "WAU/MAU dropped 0.62 → 0.48 — AI features could re-engage teams",
      "New Director of Sales Enablement (Alex Rivera) has enablement budget",
      "2 comparable accounts saw +18% engagement after AI Copilot rollout",
    ],
    suggestedPlay: "Position AI Copilot as engagement recovery tool in enablement pitch",
  },
];

// =====================================================================
// Account Plans — expansion / retention project plans with tasks
// =====================================================================

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type PlanTask = {
  id: string;
  title: string;
  assignee: string;
  assigneeInitials: string;
  assigneeBg: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  notes?: string;
};

export type PlanMilestone = {
  id: string;
  title: string;
  dueDate: string;
  status: "upcoming" | "in-progress" | "completed";
  tasks: PlanTask[];
};

export type AccountPlan = {
  id: string;
  accountSlug: string;
  accountName: string;
  title: string;
  goal: string;
  kind: "expansion" | "retention" | "onboarding" | "adoption";
  status: "active" | "completed" | "draft";
  createdAt: string;
  milestones: PlanMilestone[];
};

export const accountPlans: AccountPlan[] = [
  {
    id: "plan-cf-1",
    accountSlug: "cloudflare-inc",
    accountName: "Cloudflare",
    title: "Networking + Security Expansion",
    goal: "Expand Cloudflare into Networking and Security BUs — target $180K incremental ARR by end of Q3",
    kind: "expansion",
    status: "active",
    createdAt: "2025-04-10",
    milestones: [
      {
        id: "ms-cf-1",
        title: "Discovery & Validation",
        dueDate: "2025-05-16",
        status: "in-progress",
        tasks: [
          { id: "t-cf-1", title: "Map Networking BU stakeholders and budget owners", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-08", status: "done", priority: "high" },
          { id: "t-cf-2", title: "Schedule discovery call with VP Engineering (Maya Chen)", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-10", status: "done", priority: "high" },
          { id: "t-cf-3", title: "Validate use case fit with Security team lead", assignee: "Marcus Webb", assigneeInitials: "MW", assigneeBg: "#1E40AF", dueDate: "2025-05-14", status: "in-progress", priority: "medium" },
          { id: "t-cf-4", title: "Pull comparable account success stories for pitch", assignee: "Rachel Kim", assigneeInitials: "RK", assigneeBg: "#7C3AED", dueDate: "2025-05-16", status: "todo", priority: "medium" },
        ],
      },
      {
        id: "ms-cf-2",
        title: "Business Case & Proposal",
        dueDate: "2025-06-06",
        status: "upcoming",
        tasks: [
          { id: "t-cf-5", title: "Build ROI model with customer usage data", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-22", status: "todo", priority: "high" },
          { id: "t-cf-6", title: "Draft expansion proposal deck", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-28", status: "todo", priority: "high" },
          { id: "t-cf-7", title: "Internal review with Sales leadership", assignee: "Marcus Webb", assigneeInitials: "MW", assigneeBg: "#1E40AF", dueDate: "2025-06-02", status: "todo", priority: "medium" },
          { id: "t-cf-8", title: "Present proposal to Maya Chen + Finance Ops", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-06-06", status: "todo", priority: "high" },
        ],
      },
      {
        id: "ms-cf-3",
        title: "Negotiation & Close",
        dueDate: "2025-07-15",
        status: "upcoming",
        tasks: [
          { id: "t-cf-9", title: "Negotiate contract terms with procurement", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-06-20", status: "todo", priority: "high" },
          { id: "t-cf-10", title: "Legal review and redlines", assignee: "Rachel Kim", assigneeInitials: "RK", assigneeBg: "#7C3AED", dueDate: "2025-07-01", status: "todo", priority: "medium" },
          { id: "t-cf-11", title: "Executive sign-off and close", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-07-15", status: "todo", priority: "high" },
        ],
      },
    ],
  },
  {
    id: "plan-sf-1",
    accountSlug: "snowflake-inc",
    accountName: "Snowflake",
    title: "Renewal Risk Mitigation",
    goal: "Secure Snowflake renewal ($480K ARR) — re-engage champion, demonstrate value, close before day-47 deadline",
    kind: "retention",
    status: "active",
    createdAt: "2025-04-18",
    milestones: [
      {
        id: "ms-sf-1",
        title: "Re-engagement",
        dueDate: "2025-05-12",
        status: "in-progress",
        tasks: [
          { id: "t-sf-1", title: "Send personalized outreach to Brad Wallace", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-06", status: "done", priority: "high" },
          { id: "t-sf-2", title: "Identify backup champion if Brad remains silent", assignee: "Rachel Kim", assigneeInitials: "RK", assigneeBg: "#7C3AED", dueDate: "2025-05-09", status: "in-progress", priority: "high" },
          { id: "t-sf-3", title: "Schedule executive sponsor call", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-12", status: "todo", priority: "high" },
        ],
      },
      {
        id: "ms-sf-2",
        title: "Value Demonstration",
        dueDate: "2025-05-26",
        status: "upcoming",
        tasks: [
          { id: "t-sf-4", title: "Prepare health score recovery deck", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-16", status: "todo", priority: "medium" },
          { id: "t-sf-5", title: "Run QBR with updated ROI metrics", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-22", status: "todo", priority: "high" },
          { id: "t-sf-6", title: "Secure verbal renewal commitment", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-26", status: "todo", priority: "high" },
        ],
      },
    ],
  },
  {
    id: "plan-tb-1",
    accountSlug: "tableau-software",
    accountName: "Tableau",
    title: "ML Governance Expansion",
    goal: "Land AI Copilot + Revenue Intel cross-sell — target $175K incremental ARR",
    kind: "expansion",
    status: "active",
    createdAt: "2025-04-22",
    milestones: [
      {
        id: "ms-tb-1",
        title: "Stakeholder Alignment",
        dueDate: "2025-05-20",
        status: "in-progress",
        tasks: [
          { id: "t-tb-1", title: "Intro call with new Head of RevOps (Priya Sharma)", assignee: "Marcus Webb", assigneeInitials: "MW", assigneeBg: "#1E40AF", dueDate: "2025-05-09", status: "done", priority: "high" },
          { id: "t-tb-2", title: "Map governance gap analysis to product capabilities", assignee: "Marcus Webb", assigneeInitials: "MW", assigneeBg: "#1E40AF", dueDate: "2025-05-14", status: "in-progress", priority: "medium" },
          { id: "t-tb-3", title: "Get Sales Director buy-in for AI Copilot pilot", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-05-20", status: "todo", priority: "high" },
        ],
      },
      {
        id: "ms-tb-2",
        title: "Pilot & Proposal",
        dueDate: "2025-06-15",
        status: "upcoming",
        tasks: [
          { id: "t-tb-4", title: "Launch 30-day AI Copilot pilot with Sales team", assignee: "Marcus Webb", assigneeInitials: "MW", assigneeBg: "#1E40AF", dueDate: "2025-05-28", status: "todo", priority: "high" },
          { id: "t-tb-5", title: "Collect pilot metrics and build business case", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-06-10", status: "todo", priority: "medium" },
          { id: "t-tb-6", title: "Present expansion proposal to leadership", assignee: "Walid Qayoumi", assigneeInitials: "WQ", assigneeBg: "#374151", dueDate: "2025-06-15", status: "todo", priority: "high" },
        ],
      },
    ],
  },
];

// =====================================================================
// Account Documents — tree structure for notes, docs, files
// =====================================================================
export type DocNode = {
  id: string;
  title: string;
  kind: "folder" | "note" | "doc" | "template";
  updatedAt: string;
  updatedBy: string;
  content?: string;
  children?: DocNode[];
};

export const accountDocs: Record<string, DocNode[]> = {
  "cloudflare-inc": [
    {
      id: "d-cf-1", title: "Meeting Notes", kind: "folder", updatedAt: "2025-05-04", updatedBy: "Walid Qayoumi",
      children: [
        { id: "d-cf-1a", title: "Discovery Call — Maya Chen (May 10)", kind: "note", updatedAt: "2025-05-10", updatedBy: "Walid Qayoumi", content: "Met with Maya Chen (newly promoted VP Eng). She confirmed budget authority now spans Networking + Security BUs.\n\nKey takeaways:\n- Open to expansion into Security monitoring\n- Budget approval cycle is ~3 weeks\n- Wants ROI model before presenting to Finance Ops\n- Mentioned competitor evaluation is not active — we have first-mover advantage\n\nNext: Build ROI model with usage data by May 22." },
        { id: "d-cf-1b", title: "QBR Prep Notes (Q1)", kind: "note", updatedAt: "2025-04-15", updatedBy: "Marcus Webb", content: "QBR scheduled for April 20. Agenda:\n1. Usage metrics review (WAU/MAU at 0.74)\n2. ROI narrative — 284 MAU across 12 teams\n3. Expansion opportunity: Networking + Security BUs\n4. Customer reference request for case study\n\nChampion prep: Maya aligned on expansion narrative. Rachel pulling success stories." },
        { id: "d-cf-1c", title: "Executive Sponsor Check-in", kind: "note", updatedAt: "2025-03-28", updatedBy: "Walid Qayoumi", content: "Brief sync with CTO office. No blockers. They see us as strategic, not just tactical.\n\nAction: Invite to annual customer summit in June." },
      ],
    },
    {
      id: "d-cf-2", title: "Strategy Documents", kind: "folder", updatedAt: "2025-05-02", updatedBy: "Walid Qayoumi",
      children: [
        { id: "d-cf-2a", title: "Expansion Business Case — Draft", kind: "doc", updatedAt: "2025-05-02", updatedBy: "Walid Qayoumi", content: "# Cloudflare Expansion Business Case\n\nClosed April 18, 2026 following two discovery calls and a signed Statement of Work. Scope covers 14 additional seats across two BUs, full CRM integration, and migration of existing pipeline data.\n\n## Key stakeholders\n\n|Name|Title|Role|\n|Maya Chen|VP, Engineering|Executive Sponsor|\n|Jason Park|Director, Security Ops|Contract Signatory|\n|Li Wei|Lead, Network Analytics|Primary POC|\n|Sarah Okafor|IT & Data Governance|Technical Approver|\n|Tom Reilly|Trust & Safety Ops|Reviewer Owner|\n\n## What we're expanding\n\nCloudflare currently runs two BUs with no coverage in Security and Networking. Expansion order:\n\n- Revenue Intel for Security team (8 reps across 3 regions)\n- AI Copilot for Networking team (6 reps)\n- 1 SOC-2-validated workflow that must round-trip through V7 with no audit drift\n\n## Sales commitments\n\nThese were explicitly promised during the sales cycle. Account team aware before kickoff:\n\n|Commitment|Owner|Deadline|Status|\n|Full CRM bidirectional sync operational|Li Wei|May 15|On track|\n|Security team onboarded with custom playbooks|Sarah Okafor|Jun 1|Pending|\n|ROI report delivered to Finance Ops|Walid Qayoumi|Jun 15|Draft|\n|Executive business review with VP Eng|Maya Chen|Jul 1|Scheduled|\n\n## ROI Projection\n- Based on comparable accounts: 2.1x pipeline lift in first 90 days\n- Projected close rate improvement: 12% → 18%\n\n## Timeline\n- Discovery & Validation: Apr–May\n- Business Case & Proposal: May–Jun\n- Negotiation & Close: Jun–Jul" },
        { id: "d-cf-2b", title: "Competitive Positioning Notes", kind: "note", updatedAt: "2025-04-20", updatedBy: "Marcus Webb", content: "No active competitive evaluation. Gong was mentioned in passing but no RFP. Our advantages:\n- Deeper CRM integration (bidirectional Salesforce sync)\n- Autonomous action capabilities\n- Better pricing for multi-BU deals\n\nRisk: If they evaluate, Gong's brand recognition could slow our expansion timeline." },
      ],
    },
    { id: "d-cf-3", title: "Account Overview Template", kind: "template", updatedAt: "2025-04-01", updatedBy: "System", content: "# Account Overview\n\n## Company Profile\n[Company name, industry, size]\n\n## Relationship Summary\n[Key stakeholders, champion, executive sponsor]\n\n## Current Usage\n[Products, seats, adoption metrics]\n\n## Opportunities\n[Expansion, cross-sell, upsell]\n\n## Risks\n[Churn risk, competitive threats, stakeholder changes]\n\n## Action Items\n[Next steps, owners, due dates]" },
  ],
  "snowflake-inc": [
    {
      id: "d-sf-1", title: "Meeting Notes", kind: "folder", updatedAt: "2025-05-01", updatedBy: "Walid Qayoumi",
      children: [
        { id: "d-sf-1a", title: "Re-engagement Outreach Plan", kind: "note", updatedAt: "2025-05-06", updatedBy: "Walid Qayoumi", content: "Brad Wallace silent 14 days. Sent personalized outreach May 6.\n\nBackup plan:\n- Rachel identifying alternate champion\n- If no response by May 12, escalate to exec sponsor\n- Prepare health score recovery deck as value demonstration" },
        { id: "d-sf-1b", title: "Renewal Risk Assessment", kind: "doc", updatedAt: "2025-04-28", updatedBy: "Walid Qayoumi", content: "# Snowflake Renewal Risk Assessment\n\n## Status: HIGH RISK\n- Renewal: 47 days out ($480K ARR)\n- Health score: 41/100\n- Champion: Brad Wallace — silent 24 days\n\n## Risk Factors\n1. No exec engagement in 95 days\n2. Support tickets up 40%\n3. Usage declining in 2 of 4 teams\n\n## Mitigation Plan\n1. Re-engage Brad with personalized value narrative\n2. Identify backup champion via Rachel\n3. Schedule exec sponsor call by May 12\n4. Deliver QBR with updated ROI metrics by May 22" },
      ],
    },
  ],
  "tableau-software": [
    {
      id: "d-tb-1", title: "Meeting Notes", kind: "folder", updatedAt: "2025-05-09", updatedBy: "Marcus Webb",
      children: [
        { id: "d-tb-1a", title: "Intro Call — Priya Sharma", kind: "note", updatedAt: "2025-05-09", updatedBy: "Marcus Webb", content: "First call with Priya Sharma (new Head of RevOps, joined 3 weeks ago).\n\nShe's evaluating their entire revenue tooling stack. Key interests:\n- AI-powered coaching for the sales team\n- Revenue intelligence / forecasting\n- Governance and compliance for ML models\n\nShe wants a pilot proposal for AI Copilot within 2 weeks. Very engaged — this is a strong signal." },
      ],
    },
    { id: "d-tb-2", title: "Pilot Proposal — AI Copilot", kind: "doc", updatedAt: "2025-05-14", updatedBy: "Marcus Webb", content: "# AI Copilot Pilot Proposal — Tableau\n\n## Objective\n30-day pilot with Sales team (12 reps) to demonstrate AI Copilot value.\n\n## Success Metrics\n- Rep productivity lift (target: 2x)\n- Pipeline accuracy improvement\n- Time saved on admin tasks\n\n## Timeline\n- Week 1: Setup & onboarding\n- Week 2-3: Active pilot\n- Week 4: Results collection & business case\n\n## Investment\nPilot: $0 (proof of value)\nFull rollout: $175K ARR (AI Copilot + Revenue Intel)" },
  ],
};
