import React, { useState, useEffect } from "react";
import {
  Users, Trophy, Heart, Award, BarChart2,
  Play, Eye, CheckCircle, XCircle, Plus, Trash2,
  RefreshCw, Settings, DollarSign
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";
import { useAllDraws } from "../hooks/useDraws";
import {
  formatCurrency, formatDate, generateRandomDraw,
  generateAlgorithmicDraw, calculateMatches, getPrizeTier,
  calculatePools, PLAN_PRICES
} from "../lib/utils";
import toast from "react-hot-toast";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "users", label: "Users", icon: Users },
  { id: "draws", label: "Draws", icon: Trophy },
  { id: "charities", label: "Charities", icon: Heart },
  { id: "winners", label: "Winners", icon: Award },
];

export default function AdminPage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-forest">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-cream">Admin Panel</h1>
            <p className="text-cream/40 text-sm mt-1">Platform management &amp; controls</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
            <Settings size={13} className="text-red-400" />
            <span className="text-red-400 text-xs font-medium">Admin access</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-8 border-b border-white/10 pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
                tab === id
                  ? "border-gold text-gold"
                  : "border-transparent text-cream/50 hover:text-cream"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab />}
        {tab === "users" && <UsersTab />}
        {tab === "draws" && <DrawsTab />}
        {tab === "charities" && <CharitiesTab />}
        {tab === "winners" && <WinnersTab />}
      </div>
    </div>
  );
}

/* =================== OVERVIEW =================== */
function OverviewTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const [users, subs, draws, charities] = await Promise.all([
        supabase.from("profiles").select("id, plan_status").then((r) => r.data || []),
        supabase.from("subscriptions").select("amount, status").then((r) => r.data || []),
        supabase.from("draws").select("id, jackpot_amount").eq("status", "published").then((r) => r.data || []),
        supabase.from("charities").select("id").eq("is_active", true).then((r) => r.data || []),
      ]);
      setStats({
        totalUsers: users.length,
        activeSubscribers: users.filter((u) => u.plan_status === "active").length,
        totalRevenue: subs.filter((s) => s.status === "active").reduce((a, s) => a + Number(s.amount), 0),
        publishedDraws: draws.length,
        charityCount: charities.length,
        totalPrizePaid: draws.reduce((a, d) => a + Number(d.jackpot_amount || 0), 0),
      });
    };
    fetch();
  }, []);

  if (!stats) return <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card p-6 h-28 animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total users", value: stats.totalUsers, icon: Users, color: "text-brand-400" },
          { label: "Active subscribers", value: stats.activeSubscribers, icon: CheckCircle, color: "text-brand-400" },
          { label: "Total revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-gold" },
          { label: "Draws published", value: stats.publishedDraws, icon: Trophy, color: "text-gold" },
          { label: "Charity partners", value: stats.charityCount, icon: Heart, color: "text-red-400" },
          { label: "Prize pool total", value: formatCurrency(stats.totalPrizePaid), icon: Award, color: "text-gold" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={s.color} />
            <p className="text-cream/40 text-xs">{s.label}</p>
            <p className={`font-display text-3xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== USERS =================== */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*, charities(name)")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleAdmin = async (id, current) => {
    await supabase.from("profiles").update({ is_admin: !current }).eq("id", id);
    toast.success("Admin status updated");
    fetch();
  };

  const cancelSub = async (id) => {
    await supabase.from("profiles").update({ plan_status: "cancelled" }).eq("id", id);
    toast.success("Subscription cancelled");
    fetch();
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h3 className="font-display text-xl text-cream">All Users ({users.length})</h3>
        <button onClick={fetch} className="btn-ghost text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-cream/30">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Name", "Email", "Plan", "Status", "Charity", "Admin", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-cream/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-cream font-medium">{u.full_name || "—"}</td>
                  <td className="px-4 py-3 text-cream/50 text-xs">{u.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <span className={u.plan !== "free" ? "badge-green" : "badge-gray"}>{u.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={
                      u.plan_status === "active" ? "badge-green" :
                      u.plan_status === "cancelled" ? "badge-red" : "badge-gray"
                    }>{u.plan_status}</span>
                  </td>
                  <td className="px-4 py-3 text-cream/50 text-xs">{u.charities?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={u.is_admin ? "badge-gold" : "badge-gray"}>{u.is_admin ? "Yes" : "No"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cream/60 hover:text-cream transition-all"
                      >
                        {u.is_admin ? "Revoke admin" : "Make admin"}
                      </button>
                      {u.plan_status === "active" && (
                        <button
                          onClick={() => cancelSub(u.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                        >
                          Cancel sub
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* =================== DRAWS =================== */
function DrawsTab() {
  const { draws, loading, refetch } = useAllDraws();
  const [drawType, setDrawType] = useState("random");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [simResult, setSimResult] = useState(null);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(null);

  const runSimulation = async () => {
    let numbers;
    if (drawType === "algorithmic") {
      const { data: scoreData } = await supabase.from("scores").select("score");
      numbers = generateAlgorithmicDraw(scoreData?.map((s) => s.score) || []);
    } else {
      numbers = generateRandomDraw();
    }
    setSimResult(numbers);
    toast.success("Simulation complete — review numbers below");
  };

  const createAndPublish = async (status) => {
    if (!simResult) { toast.error("Run a simulation first"); return; }
    setCreating(true);

    // Calculate pool based on active subscribers
    const { data: subs } = await supabase.from("profiles").select("id, plan").eq("plan_status", "active");
    const totalPool = (subs || []).reduce((sum, s) => sum + (s.plan === "yearly" ? PLAN_PRICES.yearly / 12 : PLAN_PRICES.monthly), 0);
    const pools = calculatePools(totalPool);

    // Check for jackpot rollover from last draw
    const lastDraw = draws.find((d) => d.status === "published");
    const rolledJackpot = lastDraw?.jackpot_rolled ? lastDraw.jackpot_amount : 0;

    const { data: draw, error } = await supabase.from("draws").insert({
      month,
      status,
      draw_type: drawType,
      winning_numbers: simResult,
      jackpot_amount: pools.jackpot + rolledJackpot,
      pool_4match: pools["4match"],
      pool_3match: pools["3match"],
      total_entries: (subs || []).length,
      published_at: status === "published" ? new Date().toISOString() : null,
    }).select().single();

    if (error) { toast.error(error.message); setCreating(false); return; }

    if (status === "published") {
      // Snapshot entries for all active subscribers with scores
      const { data: scores } = await supabase.from("scores").select("user_id, score");
      const byUser = {};
      (scores || []).forEach((s) => {
        if (!byUser[s.user_id]) byUser[s.user_id] = [];
        byUser[s.user_id].push(s.score);
      });

      const entries = Object.entries(byUser).map(([userId, userScores]) => {
        const matches = calculateMatches(userScores, simResult);
        const tier = getPrizeTier(matches);
        return { draw_id: draw.id, user_id: userId, scores: userScores, match_count: matches, prize_tier: tier };
      });

      if (entries.length > 0) await supabase.from("draw_entries").insert(entries);
      toast.success("Draw published and entries processed!");
    } else {
      toast.success("Draw saved as simulation");
    }

    setSimResult(null);
    setCreating(false);
    refetch();
  };

  const publishExisting = async (drawId) => {
    setPublishing(drawId);
    await supabase.from("draws").update({ status: "published", published_at: new Date().toISOString() }).eq("id", drawId);
    toast.success("Draw published!");
    setPublishing(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Create draw */}
      <div className="card p-6">
        <h3 className="font-display text-xl text-cream mb-5">Create New Draw</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Draw type</label>
            <select value={drawType} onChange={(e) => setDrawType(e.target.value)} className="input">
              <option value="random">Random (lottery)</option>
              <option value="algorithmic">Algorithmic (weighted)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={runSimulation} className="btn-outline w-full justify-center">
              <Play size={15} /> Run simulation
            </button>
          </div>
        </div>

        {simResult && (
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 mb-4">
            <p className="text-brand-400 text-sm font-medium mb-3">Simulated winning numbers:</p>
            <div className="flex gap-3 mb-4">
              {simResult.map((n) => (
                <div key={n} className="w-12 h-12 rounded-full border-2 border-brand-400 text-brand-400 flex items-center justify-center font-mono font-bold">
                  {n}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => createAndPublish("simulated")} disabled={creating} className="btn-outline text-sm">
                <Eye size={14} /> Save as simulation
              </button>
              <button onClick={() => createAndPublish("published")} disabled={creating} className="btn-primary text-sm">
                {creating ? "Publishing…" : <><CheckCircle size={14} /> Publish now</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Draws list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-display text-xl text-cream">All Draws</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-cream/30">Loading…</div>
        ) : draws.length === 0 ? (
          <div className="p-8 text-center text-cream/30">No draws yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {draws.map((draw) => (
              <div key={draw.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-cream font-medium">{draw.month}</p>
                  <p className="text-cream/40 text-xs mt-0.5">
                    {draw.draw_type} · Jackpot: {formatCurrency(draw.jackpot_amount)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {(draw.winning_numbers || []).map((n) => (
                      <span key={n} className="font-mono text-xs text-cream/60 bg-white/5 px-1.5 py-0.5 rounded">{n}</span>
                    ))}
                  </div>
                  <span className={
                    draw.status === "published" ? "badge-green" :
                    draw.status === "simulated" ? "badge-gold" : "badge-gray"
                  }>{draw.status}</span>
                  {draw.status === "simulated" && (
                    <button
                      onClick={() => publishExisting(draw.id)}
                      disabled={publishing === draw.id}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {publishing === draw.id ? "…" : "Publish"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =================== CHARITIES =================== */
function CharitiesTab() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", category: "", website: "", is_featured: false });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("charities").select("*").order("name");
    setCharities(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("charities").insert({ ...form, slug });
    if (error) { toast.error(error.message); } else { toast.success("Charity added!"); setShowForm(false); setForm({ name: "", description: "", category: "", website: "", is_featured: false }); fetch(); }
    setSaving(false);
  };

  const toggleActive = async (id, current) => {
    await supabase.from("charities").update({ is_active: !current }).eq("id", id);
    fetch();
  };

  const toggleFeatured = async (id, current) => {
    await supabase.from("charities").update({ is_featured: !current }).eq("id", id);
    fetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((o) => !o)} className="btn-primary text-sm">
          <Plus size={15} /> Add charity
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-6 space-y-4">
          <h3 className="font-display text-xl text-cream">New Charity</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" /></div>
            <div><label className="label">Category</label><input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input" placeholder="Health, Children…" /></div>
            <div className="md:col-span-2"><label className="label">Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input h-20 resize-none" /></div>
            <div><label className="label">Website</label><input type="url" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="input" placeholder="https://…" /></div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-gold" />
              <label htmlFor="featured" className="text-cream/60 text-sm">Mark as featured</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Add charity"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Name", "Category", "Featured", "Active", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-cream/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-cream/30">Loading…</td></tr>
              ) : charities.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-cream font-medium">{c.name}</td>
                  <td className="px-4 py-3"><span className="badge-gray">{c.category || "—"}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFeatured(c.id, c.is_featured)} className={c.is_featured ? "badge-gold cursor-pointer" : "badge-gray cursor-pointer"}>
                      {c.is_featured ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, c.is_active)} className={c.is_active ? "badge-green cursor-pointer" : "badge-red cursor-pointer"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { supabase.from("charities").delete().eq("id", c.id).then(fetch); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-cream/30 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =================== WINNERS =================== */
function WinnersTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("draw_entries")
      .select("*, draws(month), profiles(full_name)")
      .not("prize_tier", "is", null)
      .order("created_at", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const markPaid = async (id) => {
    await supabase.from("draw_entries").update({ paid: true, verified: true }).eq("id", id);
    toast.success("Marked as paid");
    fetch();
  };

  const tierColors = { jackpot: "badge-gold", "4match": "badge-green", "3match": "badge-gray" };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h3 className="font-display text-xl text-cream">Winners ({entries.length})</h3>
        <button onClick={fetch} className="btn-ghost text-sm"><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Player", "Draw", "Tier", "Prize", "Matches", "Status", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-cream/40 text-xs uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-cream/30">Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-cream/30">No winners yet.</td></tr>
            ) : entries.map((e) => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-cream font-medium">{e.profiles?.full_name || "Unknown"}</td>
                <td className="px-4 py-3 text-cream/60">{e.draws?.month || "—"}</td>
                <td className="px-4 py-3"><span className={tierColors[e.prize_tier] || "badge-gray"}>{e.prize_tier}</span></td>
                <td className="px-4 py-3 text-gold font-semibold">{formatCurrency(e.prize_amount)}</td>
                <td className="px-4 py-3 font-mono text-cream/60">{e.match_count}</td>
                <td className="px-4 py-3">
                  <span className={e.paid ? "badge-green" : "badge-gold"}>{e.paid ? "Paid" : "Pending"}</span>
                </td>
                <td className="px-4 py-3">
                  {!e.paid && (
                    <button onClick={() => markPaid(e.id)} className="btn-primary text-xs py-1.5 px-3">
                      <CheckCircle size={12} /> Mark paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
