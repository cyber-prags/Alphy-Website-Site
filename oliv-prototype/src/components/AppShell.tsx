"use client";

import { useState, useEffect } from "react";
import {
  Database, Activity, Telescope, Bot, TrendingUp, Users, LineChart, BookOpen,
  ChevronsLeft, ChevronsRight, ChevronRight, ChevronDown, Settings, Search, Sparkles,
  Bell, X, ArrowUp, LogOut, CircleUser, KeyRound, MessageSquare, Check, Briefcase,
  Building2, Phone, Library, FileBarChart2, Rocket, Home, Target, Radio, UserCog,
  Inbox as InboxIcon, Plug, RefreshCw, MessageSquarePlus, Sun, Moon, Workflow, Mail, Send, BarChart3, Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlphardLogo } from "./AlphardLogo";
import { ToastProvider, useToast } from "./Toast";
import { Popover, MenuItem, MenuLabel, MenuSeparator } from "./Popover";
import { CommandK } from "./CommandK";
import { usePersona, PERSONA_LABEL } from "./PersonaContext";
import { OnboardingTour } from "./OnboardingTour";
import { ClosureBadge, useClosure } from "./ClosureContext";
import { Logo } from "./Logo";
import { useTheme } from "./ThemeContext";
import { QuotaWidget } from "./QuotaWidget";

import type { Persona } from "@/lib/mock";

type NavLeaf = {
  icon: typeof Database;
  label: string;
  href: string;
  badge?: string;
  accent?: boolean;
  /** if omitted, the leaf is shown for every persona */
  personas?: Persona[];
};
type NavItem = NavLeaf & { children?: NavLeaf[] };

const sections: { label: string; items: NavItem[]; personas?: Persona[] }[] = [
  {
    label: "Workspace",
    items: [
      // Universal
      { icon: Home,              label: "Home",     href: "/home" },
      { icon: MessageSquare,     label: "Chat",     href: "/analyst" },
      { icon: Building2,         label: "Accounts", href: "/accounts" },
      { icon: Radio,             label: "Signals",  href: "/signals" },
      { icon: Telescope,         label: "Blueprints", href: "/blueprints", personas: ["ae", "am", "manager"] },

      // CSM-first — retention + adoption + ticket motion
      { icon: RefreshCw,         label: "Renewals", href: "/renewals", personas: ["csm", "manager"] },
      { icon: MessageSquarePlus, label: "Requests", href: "/requests", personas: ["csm"] },

      // Outcome owners — CSM owns adoption, AM monitors expansion outcomes
      { icon: Target,            label: "Outcomes", href: "/outcomes", personas: ["csm", "am", "manager"] },
      { icon: FileBarChart2,     label: "Surveys",  href: "/surveys", personas: ["csm", "manager"] },

      // Selling motion — AE primary, AM expansion deals, manager visibility
      { icon: Briefcase,         label: "Deals",    href: "/deals",    personas: ["ae", "am", "manager"] },

      // Inbox is universal but heaviest for AE/AM
      { icon: InboxIcon,         label: "Inbox",    href: "/inbox", badge: "10" },

      // Utility — universal
      { icon: Bot,               label: "Agents",   href: "/agents", accent: true },
      { icon: Mail,              label: "Campaigns", href: "/campaigns", personas: ["csm", "am", "manager"] },
    ],
  },
  {
    label: "Performance",
    items: [
      { icon: TrendingUp, label: "Revenue",  href: "/revenue",  personas: ["manager"] },
      { icon: Users,      label: "People",   href: "/people",   personas: ["manager"] },
      { icon: LineChart,  label: "Forecast", href: "/forecast", personas: ["ae", "am", "manager"] },
      { icon: UserCog,    label: "Capacity", href: "/capacity", personas: ["manager"] },
    ],
    personas: ["ae", "am", "manager"],
  },
  {
    label: "Configure",
    items: [
      { icon: BookOpen, label: "Playbook",     href: "/playbook"     },
      { icon: Workflow, label: "Workflows",    href: "/workflows"    },
      { icon: Plug,     label: "Integrations", href: "/integrations" },
    ],
  },
];

function visibleSections(persona: Persona) {
  return sections
    .filter((sec) => !sec.personas || sec.personas.includes(persona))
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => !it.personas || it.personas.includes(persona)),
    }))
    .filter((sec) => sec.items.length > 0);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShellInner>{children}</AppShellInner>
    </ToastProvider>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { persona } = usePersona();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [askAlphyOpen, setAskAlphyOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const searchParams = useSearchParams();

  // Auto-open the in-app tour when ?tour=1 lands (from onboarding "Take the tour")
  useEffect(() => {
    if (searchParams?.get("tour") === "1") {
      setOnboardingOpen(true);
      // Clean the URL so a refresh doesn't re-trigger.
      const url = new URL(window.location.href);
      url.searchParams.delete("tour");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // Track viewport width — auto-collapse rail under 1024px
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const expanded = !isNarrow && (pinned || hovered);
  const collapsed = !expanded;

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const isActiveAny = (item: NavItem) => isActive(item.href) || (item.children?.some((c) => isActive(c.href)) ?? false);

  // Track which parent items have their tree expanded.
  // Default-expanded for parents whose route is currently active.
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const s = new Set<string>();
    visibleSections(persona).flatMap((sec) => sec.items).forEach((it) => {
      if (it.children && it.children.some((c) => pathname.startsWith(c.href))) s.add(it.label);
    });
    return s;
  });

  // Re-evaluate expansion when route changes
  useEffect(() => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      visibleSections(persona).flatMap((sec) => sec.items).forEach((it) => {
        if (it.children && it.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))) {
          next.add(it.label);
        }
      });
      return next;
    });
  }, [pathname]);

  const toggleExpand = (label: string) =>
    setExpandedKeys((s) => {
      const n = new Set(s);
      n.has(label) ? n.delete(label) : n.add(label);
      return n;
    });

  const sidebarWidth = expanded ? 248 : 64;
  const layoutOffset = pinned ? 248 : 64;

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", `${layoutOffset}px`);
  }, [layoutOffset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdkOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="border-r border-line bg-surface fixed h-screen z-30 flex flex-col"
        style={{ width: sidebarWidth, transition: "width 220ms cubic-bezier(0.32, 0.72, 0, 1)" }}
      >
        {/* Workspace switcher */}
        {collapsed ? (
          <div className="flex items-center justify-center px-3 pt-4 pb-3">
            <Link href="/home" className="flex items-center" title="Alphard · Sandbox">
              <AlphardLogo variant="icon" size={26} />
            </Link>
          </div>
        ) : (
          <div className="px-3 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Link href="/home" className="ws-switcher flex-1 min-w-0">
                <AlphardLogo variant="full" size={14} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[10px] text-muted truncate leading-tight">Sandbox · CSM</div>
                </div>
                <ChevronDown size={12} strokeWidth={1.8} className="text-muted-2 shrink-0" />
              </Link>
              <button onClick={() => setPinned(!pinned)}
                className="btn-icon shrink-0"
                title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
                aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}>
                <ChevronsLeft strokeWidth={1.6} size={14}
                  style={{ transform: pinned ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 200ms" }} />
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        {!collapsed && (
          <div className="px-2.5 pt-1 pb-2.5">
            <button onClick={() => setCmdkOpen(true)}
              className="flex items-center gap-2 w-full h-8 px-2.5 rounded-lg border border-line bg-bg-deep/50 text-[12px] text-muted hover:bg-bg-deep hover:border-line-strong transition-colors">
              <Search size={12} strokeWidth={1.6} />
              <span className="flex-1 text-left">Search</span>
              <kbd className="text-[9px] text-muted-2 font-mono px-1.5 py-0.5 rounded bg-surface border border-line">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Tree nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-2">
          {visibleSections(persona).map((section, sIdx) => (
            <div key={section.label} className={sIdx > 0 ? "mt-4" : ""}>
              {!collapsed && <div className="section-label pb-1.5">{section.label}</div>}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavRow key={item.label}
                    item={item}
                    collapsed={collapsed}
                    isActive={isActive}
                    isActiveAny={isActiveAny}
                    expanded={expandedKeys.has(item.label)}
                    toggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </div>
          ))}

        </nav>

        {/* Footer */}
        <div className="border-t border-line p-2 flex flex-col gap-1">
          {collapsed ? (
            <>
              <button onClick={() => setPinned(true)} title="Pin sidebar open" aria-label="Pin sidebar open"
                className="w-9 h-9 mx-auto rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2">
                <ChevronsRight strokeWidth={1.6} size={15} />
              </button>
              <SettingsButton collapsed />
              <ProfileMenu collapsed />
            </>
          ) : (
            <>
              <SettingsButton />
              <ProfileMenu />
            </>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col"
        style={{ marginLeft: layoutOffset, transition: "margin-left 220ms cubic-bezier(0.32, 0.72, 0, 1)" }}>
        <header className="h-12 border-b border-line bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-1.5">
            <QuotaWidget persona={persona} compact />
            <span className="header-divider hidden md:block" />
            <button onClick={() => setCmdkOpen(true)}
              title="Search (⌘K)"
              className="btn-icon">
              <Search size={14} strokeWidth={1.7} />
            </button>
            <ThemeToggle />
            <button onClick={() => setOnboardingOpen(true)} title="Onboarding tour" aria-label="Open onboarding tour"
              className="btn-icon">
              <Rocket size={14} strokeWidth={1.7} />
            </button>
            <NotificationsBell />
            <span className="header-divider" />
            <button onClick={() => setAskAlphyOpen(true)}
              className="btn-accent h-8 px-3.5 text-[12px]">
              <Sparkles size={12} strokeWidth={2} />
              Ask Alphy
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-32">
          <div className="max-w-[1640px] mx-auto">{children}</div>
        </main>
      </div>

      <CommandK open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
      <AskAlphyPanel open={askAlphyOpen} onClose={() => setAskAlphyOpen(false)} />
      <OnboardingTour open={onboardingOpen} persona={persona} onClose={() => setOnboardingOpen(false)} />
    </div>
  );
}

// ---------------------------------------------------------------------
// Tree-style nav row
// ---------------------------------------------------------------------
function NavRow({
  item, collapsed, isActive, isActiveAny, expanded, toggleExpand,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  isActiveAny: (item: NavItem) => boolean;
  expanded: boolean;
  toggleExpand: (label: string) => void;
}) {
  const router = useRouter();
  const hasChildren = !!item.children?.length;
  const Icon = item.icon;
  const active = isActive(item.href);
  const activeAny = isActiveAny(item);

  // Collapsed sidebar — icon-only with subtle active state
  if (collapsed) {
    return (
      <Link href={item.href} title={item.label}
        className={`flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors relative ${
          activeAny ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"
        }`}>
        {activeAny && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r"
            style={{ background: "var(--accent)" }} />
        )}
        <Icon strokeWidth={1.7} size={17}
          style={{ color: item.accent ? "var(--accent-deep)" : undefined }} />
        {item.badge && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
        )}
      </Link>
    );
  }

  if (!hasChildren) {
    return (
      <Link href={item.href} className={`nav-row ${active ? "active" : ""}`}>
        <Icon strokeWidth={1.7} size={15}
          style={{ color: item.accent ? "var(--accent-deep)" : undefined }} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="text-[10px] font-mono tnum px-1.5 py-0.5 rounded-md bg-bg-deep text-muted">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      <div className={`nav-row pr-1 ${activeAny ? "active" : ""}`} style={{ paddingLeft: 4 }}>
        <button onClick={() => toggleExpand(item.label)}
          className="w-5 h-5 grid place-items-center rounded text-muted-2 hover:text-ink shrink-0"
          title={expanded ? "Collapse" : "Expand"}>
          {expanded
            ? <ChevronDown size={11} strokeWidth={2} />
            : <ChevronRight size={11} strokeWidth={2} />}
        </button>
        <Link href={item.href} className="flex-1 flex items-center gap-2.5 -ml-0.5 truncate">
          <Icon strokeWidth={1.7} size={15}
            style={{ color: item.accent ? "var(--accent-deep)" : undefined }} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] font-mono tnum px-1.5 py-0.5 rounded-md bg-bg-deep text-muted">
              {item.badge}
            </span>
          )}
        </Link>
      </div>

      {expanded && (
        <div className="accord-open ml-3 pl-3 mt-0.5 mb-1 flex flex-col gap-0.5"
          style={{ borderLeft: "1px solid var(--line)" }}>
          {item.children!.map((c) => {
            const childActive = isActive(c.href);
            return (
              <Link key={c.href} href={c.href}
                className={`nav-row h-7 ${childActive ? "active" : ""}`}>
                <c.icon strokeWidth={1.7} size={13} />
                <span className="text-[12px] flex-1 truncate">{c.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Breadcrumbs — smart label of current page based on path
// ---------------------------------------------------------------------
const PATH_LABELS: Record<string, string> = {
  home: "Home", chat: "Chat", analyst: "Chat", accounts: "Accounts", signals: "Signals",
  renewals: "Renewals", requests: "Requests", outcomes: "Outcomes", deals: "Deals",
  inbox: "Inbox", agents: "Agents", revenue: "Revenue", people: "People", forecast: "Forecast",
  playbook: "Playbook", blueprints: "Blueprints", workflows: "Workflows", integrations: "Integrations", settings: "Settings",
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const top = segments[0] || "home";
  const label = PATH_LABELS[top] ?? top.charAt(0).toUpperCase() + top.slice(1);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      {segments.length > 1 && (
        <>
          <ChevronRight size={11} strokeWidth={1.8} className="text-muted-2" />
          <span className="text-[13px] text-muted-2 truncate max-w-[200px]">
            {decodeURIComponent(segments[1].replace(/-/g, " "))}
          </span>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle theme"
      className="h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2">
      {theme === "dark"
        ? <Sun size={14} strokeWidth={1.6} />
        : <Moon size={14} strokeWidth={1.6} />}
    </button>
  );
}

// ---------------------------------------------------------------------
// Footer pieces
// ---------------------------------------------------------------------
function SettingsButton({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname === "/settings" || pathname.startsWith("/settings/");
  if (collapsed) {
    return (
      <button title="Settings" aria-label="Open settings" onClick={() => router.push("/settings")}
        className={`flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors relative ${
          active ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"
        }`}>
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r" style={{ background: "var(--accent)" }} />
        )}
        <Settings strokeWidth={1.7} size={16} />
      </button>
    );
  }
  return (
    <button onClick={() => router.push("/settings")} className={`nav-row w-full ${active ? "active" : ""}`}>
      <Settings strokeWidth={1.7} size={15} />
      <span className="flex-1 truncate text-left">Settings</span>
    </button>
  );
}

function ProfileMenu({ collapsed }: { collapsed?: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const { persona, setPersona } = usePersona();
  const subtitle = `${PERSONA_LABEL[persona]} · Alphard`;
  return (
    <Popover
      align="left" width={240}
      trigger={(_, toggle) => collapsed ? (
        <button onClick={toggle} title={`Walid Qayoumi · ${PERSONA_LABEL[persona]}`}
          className="w-9 h-9 mx-auto rounded-full grid place-items-center text-[11px] font-semibold ring-2 ring-line hover:ring-line-strong transition-all"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>WQ</button>
      ) : (
        <button onClick={toggle} className="flex items-center h-11 px-2 gap-2.5 rounded-lg hover:bg-surface-2 w-full transition-colors">
          <div className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-semibold shrink-0"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>WQ</div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12.5px] font-semibold text-ink truncate leading-tight">Walid Qayoumi</div>
            <div className="text-[10px] text-muted truncate leading-tight mt-0.5">{subtitle}</div>
          </div>
          <ChevronDown size={12} strokeWidth={1.8} className="text-muted-2 shrink-0" />
        </button>
      )}>
      {(close) => (
        <>
          <MenuLabel>View as</MenuLabel>
          {(["ae", "am", "manager"] as const).map((p) => (
            <MenuItem key={p} selected={persona === p}
              onClick={() => { setPersona(p); toast({ tone: "info", title: `Now viewing as ${PERSONA_LABEL[p]}`, body: "Home page reshuffled for this role." }); close(); }}>
              <span className="inline-flex items-center gap-2">
                <UserCog size={12} className="text-muted" />
                {PERSONA_LABEL[p]}
              </span>
            </MenuItem>
          ))}
          <MenuItem onClick={() => { close(); router.push("/onboarding"); }}>
            <span className="inline-flex items-center gap-2"><Rocket size={12} className="text-muted" />Re-run agentic setup</span>
          </MenuItem>
          <MenuSeparator />
          <MenuLabel>Account</MenuLabel>
          <MenuItem onClick={() => { toast({ tone: "info", title: "Profile" }); close(); }}>
            <span className="inline-flex items-center gap-2"><CircleUser size={12} className="text-muted" />Profile</span>
          </MenuItem>
          <MenuItem onClick={() => { toast({ tone: "info", title: "API keys" }); close(); }}>
            <span className="inline-flex items-center gap-2"><KeyRound size={12} className="text-muted" />API keys</span>
          </MenuItem>
          <MenuItem onClick={() => { toast({ tone: "info", title: "Send feedback" }); close(); }}>
            <span className="inline-flex items-center gap-2"><MessageSquare size={12} className="text-muted" />Send feedback</span>
          </MenuItem>
          <MenuSeparator />
          <MenuItem danger onClick={() => { close(); router.push("/"); }}>
            <span className="inline-flex items-center gap-2"><LogOut size={12} />Sign out</span>
          </MenuItem>
        </>
      )}
    </Popover>
  );
}

const NOTIFICATIONS = [
  { id: "n1", title: "Stripe: probability dropped to 78%",            when: "just now",  href: "/deals" },
  { id: "n2", title: "New AI suggestion on Shopify",                  when: "4m ago",    href: "/deals" },
  { id: "n3", title: "Brad Allen submitted his Q1 commit forecast",   when: "1h ago",    href: "/forecast" },
  { id: "n4", title: "Latham & Watkins: champion silent 7 days",      when: "Yesterday", href: "/signals" },
  { id: "n5", title: "Akamai: QBR overdue 14 days",                   when: "2d ago",    href: "/accounts/akamai-technologies" },
] as const;

function NotificationsBell() {
  const router = useRouter();
  const closure = useClosure();

  const items = NOTIFICATIONS.map((n) => {
    const status = closure.status(`notif:${n.id}`);
    return { ...n, status };
  });
  const unread = items.filter((n) => n.status === "new").length;

  const onOpen = (n: typeof items[number]) => {
    if (n.status === "new") closure.see(`notif:${n.id}`, "Walid");
  };

  return (
    <Popover align="right" width={360}
      trigger={(_, toggle) => (
        <button onClick={toggle} aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
          className="h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2 relative">
          <Bell size={14} strokeWidth={1.6} />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-deep)" }} />}
        </button>
      )}>
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-2.5 py-2 border-b border-line">
            <span className="text-[12px] font-semibold text-ink">Notifications</span>
            <button onClick={() => items.forEach((n) => { if (n.status === "new") closure.see(`notif:${n.id}`, "Walid"); })}
              className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-1">
              <Check size={10} strokeWidth={1.6} /> Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.map((n) => {
              const isUnread = n.status === "new";
              return (
                <button key={n.id}
                  onClick={() => { onOpen(n); router.push(n.href); close(); }}
                  className="w-full text-left px-2.5 py-2 hover:bg-bg-deep flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: isUnread ? "var(--accent-deep)" : "transparent" }} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] ${isUnread ? "text-ink-2 font-medium" : "text-muted"}`}>{n.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10.5px] text-muted-2">{n.when}</span>
                      {!isUnread && <ClosureBadge status={n.status} size="xs" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Popover>
  );
}

function AskAlphyPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string; typing?: boolean; sources?: { label: string; href: string }[] }[]>([]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  const ask = (text: string) => {
    if (!text.trim()) return;
    const { response, sources } = alphySynth(text);
    setMsgs(m => [...m, { role: "user", text }, { role: "ai", text: "", typing: true }]);
    setQ("");
    let ci = 0;
    const id = setInterval(() => {
      ci += 3 + Math.floor(Math.random() * 4);
      if (ci >= response.length) {
        clearInterval(id);
        setMsgs(m => { const c = [...m]; c[c.length - 1] = { role: "ai", text: response, typing: false, sources }; return c; });
      } else {
        setMsgs(m => { const c = [...m]; c[c.length - 1] = { role: "ai", text: response.slice(0, ci), typing: true }; return c; });
      }
    }, 14);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[90] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[420px] bg-surface z-[95] drawer-anim border-l border-line flex flex-col"
        style={{ boxShadow: "-8px 0 40px -12px rgba(28,40,64,0.15)" }}>
        <div className="px-4 h-12 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.6} style={{ color: "var(--ink)" }} />
            <span className="text-[13px] font-semibold text-ink">Alphy</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>ONLINE</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
            <X size={13} strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-16 pb-8">
              <Sparkles size={28} strokeWidth={1.3} style={{ color: "var(--ink)" }} />
              <h2 className="text-[18px] font-semibold text-ink mt-3" style={{ letterSpacing: "-0.02em" }}>How can I help?</h2>
              <p className="text-[11.5px] text-muted mt-1">Ask about your accounts, deals, or signals</p>
            </div>
          )}
          {msgs.map((m, i) => m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[12.5px] leading-relaxed"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg grid place-items-center shrink-0 mt-0.5"
                style={{ background: "var(--accent)" }}>
                <Sparkles size={11} strokeWidth={1.8} style={{ color: "var(--accent-ink)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-ink leading-relaxed whitespace-pre-line">
                  {m.text.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                    part.startsWith("**") && part.endsWith("**")
                      ? <strong key={pi} className="font-semibold">{part.slice(2, -2)}</strong>
                      : <span key={pi}>{part}</span>
                  )}
                  {m.typing && <span className="inline-block w-0.5 h-3.5 bg-accent-deep ml-0.5 animate-pulse align-text-bottom" />}
                </div>
                {!m.typing && m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.sources.map((s, j) => (
                      <a key={j} href={s.href}
                        className="inline-flex items-center gap-1 text-[9.5px] font-medium px-1.5 py-0.5 rounded-md border border-line bg-bg-deep hover:border-accent/30 transition-colors">
                        <Sparkles size={7} strokeWidth={2} style={{ color: "var(--accent-deep)" }} />
                        <span className="text-ink-2">{s.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-line">
          <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ask(q); }}
              placeholder="Ask a question about your accounts..."
              className="w-full bg-transparent text-[12.5px] px-3.5 pt-3 pb-1 outline-none placeholder:text-muted-2" />
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-muted px-1.5 py-0.5 rounded hover:bg-bg-deep cursor-pointer transition-colors">
                  <Building2 size={9} strokeWidth={1.6} /> Accounts
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted px-1.5 py-0.5 rounded hover:bg-bg-deep cursor-pointer transition-colors">
                  <BarChart3 size={9} strokeWidth={1.6} /> Deals
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted px-1.5 py-0.5 rounded hover:bg-bg-deep cursor-pointer transition-colors">
                  <Zap size={9} strokeWidth={1.6} /> Signals
                </span>
              </div>
              <button onClick={() => ask(q)}
                className={`w-7 h-7 rounded-full grid place-items-center transition-all ${q.trim() ? "bg-ink text-white" : "bg-bg-deep text-muted-2"}`}
                disabled={!q.trim()}>
                <Send size={11} strokeWidth={1.8} />
              </button>
            </div>
          </div>
          <p className="text-[9.5px] text-muted-2 text-center mt-2">Alphy can make mistakes. Verify important information.</p>
        </div>
      </aside>
    </>
  );
}

function alphySynth(q: string): { response: string; sources: { label: string; href: string }[] } {
  const lc = q.toLowerCase();
  if (lc.includes("risk")) return {
    response: "Three accounts slipping right now:\n\n• **Snowflake** — 47d to renewal, sponsor 24d silent, health 41\n• **GitLab** — WAU/MAU 0.62 → 0.48, renewal 64d\n• **Akamai** — QBR 14d overdue\n\nCombined exposure ~$1.3M ARR. Prioritize Snowflake exec touchpoint.",
    sources: [{ label: "Snowflake · Health", href: "/accounts/snowflake-inc" }, { label: "GitLab · Adoption", href: "/accounts/gitlab-inc" }],
  };
  if (lc.includes("brad")) return {
    response: "Brad's coaching focus: **Pricing & ROI** (2/5 across last 4 calls). He tends to concede on discount before exploring value.\n\nRecommend pairing him with Lisa Park's discovery deck for two weeks.",
    sources: [{ label: "Brad · Call Scores", href: "/home" }],
  };
  if (lc.includes("expansion") || lc.includes("signal")) return {
    response: "Top expansion signals:\n\n• **Cloudflare** — Maya Chen promoted to VP Eng, budget spans Networking + Security. $180K target.\n• **Tableau** — 4 ML engineers hired, governance gap. $175K target.\n\nCloudflare is higher confidence. Build the case before Q2 planning locks.",
    sources: [{ label: "Cloudflare · Plan", href: "/accounts/cloudflare-inc" }, { label: "Tableau · Signals", href: "/accounts/tableau-software" }],
  };
  if (lc.includes("change") || lc.includes("today")) return {
    response: "4 changes overnight:\n\n1. **Stripe** probability dropped 7pts — David Wallace silent\n2. **Cloudflare** Maya promoted to VP Eng — expansion door open\n3. **NextEra** pilot extension confirmed through Q3\n4. **GitLab** WAU/MAU dropped to 0.48\n\nNet impact: -$14K. Action needed on Stripe and GitLab.",
    sources: [{ label: "Pipeline Changes", href: "/deals" }, { label: "Signals Feed", href: "/signals" }],
  };
  return {
    response: "I'd pull evidence from your accounts, calls, and CRM to answer this. Try asking about specific accounts, pipeline risks, or expansion signals.",
    sources: [{ label: "Your Portfolio", href: "/accounts" }],
  };
}
