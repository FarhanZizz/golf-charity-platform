import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy, CreditCard, Calendar, TrendingUp,
  AlertCircle, ArrowRight, Award
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import ScoreEntry from "../components/dashboard/ScoreEntry";
import CharitySelector from "../components/dashboard/CharitySelector";
import { useAuth } from "../context/AuthContext";
import { useMyDrawEntries } from "../hooks/useDraws";
import { formatDate, formatCurrency, calculateMatches } from "../lib/utils";

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { entries } = useMyDrawEntries();

  const isActive = profile?.plan_status === "active";
  const totalWon = entries
    .filter((e) => e.prize_amount)
    .reduce((sum, e) => sum + Number(e.prize_amount), 0);

  return (
    <div className="min-h-screen bg-forest">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 page-enter">
          <div>
            <h1 className="font-display text-4xl text-cream">
              Hello, {profile?.full_name?.split(" ")[0] || "Golfer"} 👋
            </h1>
            <p className="text-cream/50 text-sm mt-1">{user?.email}</p>
          </div>
          {!isActive && (
            <Link to="/subscribe" className="btn-primary text-sm">
              Activate subscription <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {/* Subscription alert */}
        {!isActive && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-gold/10 border border-gold/20">
            <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-cream text-sm font-medium">Subscription inactive</p>
              <p className="text-cream/60 text-xs mt-0.5">
                Subscribe to participate in monthly draws and support your charity.
              </p>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={CreditCard}
            label="Plan"
            value={isActive ? (profile?.plan === "yearly" ? "Yearly" : "Monthly") : "Inactive"}
            sub={isActive && profile?.plan_end ? `Renews ${formatDate(profile.plan_end)}` : "Not subscribed"}
            accent={isActive ? "text-brand-400" : "text-cream/40"}
          />
          <StatCard
            icon={Trophy}
            label="Draw entries"
            value={entries.length}
            sub="All time"
            accent="text-gold"
          />
          <StatCard
            icon={Award}
            label="Total won"
            value={formatCurrency(totalWon)}
            sub={`${entries.filter((e) => e.prize_amount).length} winning entries`}
            accent="text-gold"
          />
          <StatCard
            icon={TrendingUp}
            label="Charity %"
            value={`${profile?.charity_pct || 10}%`}
            sub={profile?.charities?.name || "No charity selected"}
            accent="text-red-400"
          />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: scores + charity */}
          <div className="lg:col-span-2 space-y-6">
            <ScoreEntry />
            <CharitySelector />
          </div>

          {/* Right: draw history */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl text-cream">Draw History</h3>
                <Link to="/draws" className="text-gold hover:text-gold-light text-xs transition-colors">
                  View all
                </Link>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={28} className="text-cream/20 mx-auto mb-3" />
                  <p className="text-cream/30 text-sm">No draw entries yet</p>
                  <p className="text-cream/20 text-xs mt-1">Add scores to enter draws</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.slice(0, 6).map((entry) => {
                    const matches = calculateMatches(
                      entry.scores,
                      entry.draws?.winning_numbers || []
                    );
                    return (
                      <DrawHistoryItem key={entry.id} entry={entry} matches={matches} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subscription detail */}
            {isActive && (
              <div className="card p-6 border-brand-500/20">
                <h3 className="font-display text-lg text-cream mb-4">Subscription</h3>
                <div className="space-y-3">
                  <Row label="Plan" value={profile?.plan === "yearly" ? "Yearly" : "Monthly"} />
                  <Row label="Status" value={<span className="badge-green">Active</span>} />
                  {profile?.plan_end && (
                    <Row label="Next renewal" value={formatDate(profile.plan_end)} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <Icon size={18} className={accent} />
      <p className="text-cream/40 text-xs">{label}</p>
      <p className={`font-display text-2xl ${accent}`}>{value}</p>
      <p className="text-cream/30 text-xs truncate">{sub}</p>
    </div>
  );
}

function DrawHistoryItem({ entry, matches }) {
  const tierColors = {
    jackpot: "text-gold",
    "4match": "text-brand-400",
    "3match": "text-blue-400",
  };
  const won = entry.prize_tier !== null && entry.prize_tier !== undefined;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
      <div>
        <p className="text-cream text-sm font-medium">{entry.draws?.month || "Draw"}</p>
        <p className="text-cream/40 text-xs">{matches} number{matches !== 1 ? "s" : ""} matched</p>
      </div>
      <div className="text-right">
        {won ? (
          <>
            <p className={`text-sm font-semibold ${tierColors[entry.prize_tier]}`}>
              {formatCurrency(entry.prize_amount)}
            </p>
            <p className={`text-xs ${tierColors[entry.prize_tier]} opacity-70`}>
              {entry.paid ? "Paid" : "Pending"}
            </p>
          </>
        ) : (
          <p className="text-cream/30 text-xs">No prize</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-cream/40">{label}</span>
      <span className="text-cream">{value}</span>
    </div>
  );
}
