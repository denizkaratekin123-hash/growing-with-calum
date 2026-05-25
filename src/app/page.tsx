"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Task data grouped by phase
const taskGroups = [
  {
    id: "vsl",
    title: "VSL Production",
    image: "/vsl.png",
    tasks: [
      { id: "vsl-1", text: "Write VSL script focused on problem-aware targeting" },
      { id: "vsl-2", text: "Produce and finalize VSL assets" },
      { id: "vsl-3", text: "Build VSL landing page" },
      { id: "vsl-4", text: "Create 2 page variations for A/B split testing" },
      { id: "vsl-5", text: "Optimize CTA placement and conversion flow" },
    ],
  },
  {
    id: "funnel",
    title: "Funnel Optimization",
    image: "/headshot.png",
    tasks: [
      { id: "funnel-1", text: "Map customer journey from first touch to booked call" },
      { id: "funnel-2", text: "Identify funnel drop-off points and conversion friction" },
    ],
  },
  {
    id: "automation",
    title: "Automation & Nurture",
    image: "/headshot.png",
    tasks: [
      { id: "auto-1", text: "Create automated booked-call nurture sequence" },
      { id: "auto-2", text: "Add reminder touchpoints before scheduled calls" },
      { id: "auto-3", text: "Build automated no-show follow-up flow" },
      { id: "auto-4", text: "Add rebooking reminders and value reinforcement" },
      { id: "auto-5", text: "Create post-call nurture sequence" },
      { id: "auto-6", text: "Implement objection-handling follow-ups" },
      { id: "auto-7", text: "Add delayed conversion touchpoints" },
    ],
  },
  {
    id: "ai",
    title: "AI-Powered Systems",
    image: "/ai.png",
    tasks: [
      { id: "ai-1", text: "Implement AI-based follow-up system" },
      { id: "ai-2", text: "Trigger instant outreach after booked calls" },
      { id: "ai-3", text: "Automate lead qualification and reminders" },
    ],
  },
  {
    id: "campaigns",
    title: "Campaign Launch",
    image: "/headshot.png",
    tasks: [
      { id: "camp-1", text: "Launch new conversion-optimized campaigns" },
      { id: "camp-2", text: "Test creatives, hooks, and audience segments" },
      { id: "camp-3", text: "Monitor CPA and booked-call conversion rates" },
    ],
  },
  {
    id: "tracking",
    title: "Event Tracking",
    image: "/headshot.png",
    tasks: [
      { id: "track-1", text: "Appointment Booked event tracking" },
      { id: "track-2", text: "Payment/Purchase event tracking" },
    ],
  },
];

const tabs = [
  { id: "roadmap", label: "Execution Roadmap" },
  { id: "current", label: "Current Funnel" },
  { id: "new", label: "New Campaign" },
];

interface MetaMetrics {
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  reach: string;
  frequency: string;
  leads: string;
  purchases: string;
  conversions: string;
  costPerLead: string;
  costPerPurchase: string;
}

interface Campaign {
  id: string;
  name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
}

interface MetaData {
  success: boolean;
  metrics: MetaMetrics;
  campaigns: Campaign[];
  totalCampaigns: number;
  dateRange: string;
  error?: string;
}

function MetricCard({ label, value, prefix = "", suffix = "", highlight = false }: {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`gradient-border p-4 sm:p-5 ${highlight ? 'glow-accent-soft' : ''}`}>
      <div className="text-xs sm:text-sm text-muted mb-1">{label}</div>
      <div className={`text-xl sm:text-2xl font-semibold ${highlight ? 'text-accent glow-text' : 'text-foreground'}`}>
        {prefix}{value}{suffix}
      </div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border/30 last:border-b-0 hover:bg-accent/5 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground/90 truncate">{campaign.name}</div>
        <div className="text-xs text-muted mt-0.5">${campaign.spend} spent</div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 text-right">
        <div>
          <div className="text-sm font-medium text-foreground/80">{campaign.clicks}</div>
          <div className="text-xs text-muted">clicks</div>
        </div>
        <div>
          <div className="text-sm font-medium text-accent">{campaign.ctr}%</div>
          <div className="text-xs text-muted">CTR</div>
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-medium text-foreground/80">${campaign.cpc}</div>
          <div className="text-xs text-muted">CPC</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("roadmap");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load completed tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("completedTasks");
    if (saved) {
      setCompletedTasks(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save completed tasks to localStorage
  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify([...completedTasks]));
  }, [completedTasks]);

  // Fetch Meta data when switching to current or new tab
  useEffect(() => {
    if ((activeTab === "current" || activeTab === "new") && !metaData && !loading) {
      fetchMetaData();
    }
  }, [activeTab]);

  const fetchMetaData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meta");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMetaData(data);
      }
    } catch (err) {
      setError("Failed to fetch campaign data");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const totalTasks = taskGroups.reduce((sum, group) => sum + group.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="min-h-screen dot-grid">
      {/* Ambient glow effect at top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Lockup - smaller on mobile */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <img
                src="https://www.denizfunnels.online/Assets/logo.png"
                alt="Deniz Funnels"
                className="h-6 sm:h-10 w-auto object-contain"
              />
              <span className="logo-x text-lg sm:text-2xl">x</span>
              <img
                src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/8knWA7pLLz8unPbydWg6/media/6a05935982125b9874eab25b.png"
                alt="Calum"
                className="h-6 sm:h-10 w-auto object-contain"
              />
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right">
                <div className="text-xs sm:text-sm text-muted">Progress</div>
                <div className="text-base sm:text-lg font-semibold">
                  <span className="text-accent">{completedCount}</span>
                  <span className="text-muted">/{totalTasks}</span>
                </div>
              </div>
              <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="mt-4 sm:mt-6 flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted hover:text-foreground/80"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-surface-elevated rounded-lg -z-10" />
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-gradient-to-r from-accent to-accent-secondary rounded-full glow-accent" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activeTab === "roadmap" && (
          <div className="space-y-8">
            {/* Page Title with Calum's image on right */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Growing with Calum
                </h1>
                <p className="text-muted text-sm mt-0.5">
                  Execution Roadmap
                </p>
              </div>
              <img
                src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/8knWA7pLLz8unPbydWg6/media/6a12934f6cc0eead5cbdd122.png"
                alt="Calum"
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl ring-2 ring-accent/30"
              />
            </div>

            <div className="glow-divider" />

            {/* Task Groups */}
            <div className="space-y-10">
              {taskGroups.map((group, groupIndex) => (
                <section key={group.id}>
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={group.image}
                      alt={group.title}
                      width={32}
                      height={32}
                      className="rounded-full ring-1 ring-accent/20 object-cover"
                    />
                    <h2 className="text-lg font-medium text-foreground/90">
                      {group.title}
                    </h2>
                    <span className="text-xs text-muted bg-surface-elevated px-2 py-0.5 rounded-full">
                      {group.tasks.filter((t) => completedTasks.has(t.id)).length}/{group.tasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="gradient-border p-1">
                    <div className="bg-surface rounded-[10px] overflow-hidden">
                      {group.tasks.map((task, taskIndex) => {
                        const isCompleted = completedTasks.has(task.id);
                        return (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`task-item flex items-center gap-4 px-4 sm:px-5 py-3 sm:py-4 cursor-pointer ${
                              isCompleted ? "completed" : ""
                            } ${taskIndex !== group.tasks.length - 1 ? "border-b border-border/30" : ""}`}
                          >
                            {/* Custom Checkbox */}
                            <div
                              className={`checkbox-custom w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                                isCompleted
                                  ? "checked border-accent"
                                  : "border-border hover:border-accent/50"
                              }`}
                            >
                              {isCompleted && (
                                <svg
                                  className="w-3 h-3 text-background"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Task Text */}
                            <span className="task-text text-sm text-foreground/90">
                              {task.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Glow divider between groups */}
                  {groupIndex !== taskGroups.length - 1 && (
                    <div className="glow-divider mt-10" />
                  )}
                </section>
              ))}
            </div>
          </div>
        )}

        {activeTab === "current" && (
          <div className="space-y-8">
            {/* Quote Section */}
            <div className="flex items-start gap-4 max-w-2xl">
              <Image
                src="/headshot.png"
                alt="Deniz"
                width={48}
                height={48}
                className="rounded-full ring-2 ring-accent/30 flex-shrink-0"
              />
              <div className="gradient-border p-4 sm:p-5">
                <p className="text-foreground/90 text-sm sm:text-base leading-relaxed">
                  &ldquo;Here&apos;s how your current funnel is performing. These metrics show the last 30 days of your existing campaigns.&rdquo;
                </p>
              </div>
            </div>

            <div className="glow-divider" />

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted">Loading campaign data...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="gradient-border p-6 text-center max-w-md mx-auto">
                <div className="text-red-400 mb-2">Error loading data</div>
                <p className="text-muted text-sm">{error}</p>
                <button
                  onClick={fetchMetaData}
                  className="mt-4 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {metaData && !loading && !error && (
              <>
                {/* Date Range Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted bg-surface-elevated px-3 py-1 rounded-full">
                    {metaData.dateRange}
                  </span>
                  <span className="text-xs text-muted">
                    {metaData.totalCampaigns} campaign{metaData.totalCampaigns !== 1 ? 's' : ''} active
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  <MetricCard label="Total Spend" value={metaData.metrics.spend} prefix="$" highlight />
                  <MetricCard label="Impressions" value={metaData.metrics.impressions} />
                  <MetricCard label="Clicks" value={metaData.metrics.clicks} />
                  <MetricCard label="CTR" value={metaData.metrics.ctr} suffix="%" />
                  <MetricCard label="CPC" value={metaData.metrics.cpc} prefix="$" />
                  <MetricCard label="Reach" value={metaData.metrics.reach} />
                  <MetricCard label="Leads" value={metaData.metrics.leads} highlight />
                  <MetricCard label="Cost per Lead" value={metaData.metrics.costPerLead} prefix="$" />
                </div>

                {/* Campaigns List */}
                {metaData.campaigns.length > 0 && (
                  <>
                    <div className="glow-divider" />
                    <div>
                      <h3 className="text-lg font-medium mb-4">Campaign Breakdown</h3>
                      <div className="gradient-border p-1">
                        <div className="bg-surface rounded-[10px] overflow-hidden">
                          {metaData.campaigns.map((campaign) => (
                            <CampaignRow key={campaign.id} campaign={campaign} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "new" && (
          <div className="space-y-8">
            {/* Quote Section */}
            <div className="flex items-start gap-4 max-w-2xl">
              <Image
                src="/headshot.png"
                alt="Deniz"
                width={48}
                height={48}
                className="rounded-full ring-2 ring-accent/30 flex-shrink-0"
              />
              <div className="gradient-border p-4 sm:p-5">
                <p className="text-foreground/90 text-sm sm:text-base leading-relaxed">
                  &ldquo;This is where the new conversion-optimized campaign metrics will live. Once we launch, you&apos;ll see all the performance data here.&rdquo;
                </p>
              </div>
            </div>

            <div className="glow-divider" />

            {/* Placeholder for new campaign - can be updated later to filter by campaign */}
            <div className="flex flex-col items-center justify-center py-12">
              <div className="gradient-border p-6 sm:p-8 text-center max-w-sm">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">New Campaign Pending</h2>
                <p className="text-muted text-sm">
                  The new conversion-optimized campaign is being prepared. Metrics will appear here once it goes live.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer ambient glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/3 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
