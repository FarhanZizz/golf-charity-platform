import React, { useState } from "react";
import { Trophy, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useDraws } from "../hooks/useDraws";
import { formatCurrency, formatDate, calculateMatches } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useScores } from "../hooks/useScores";

export default function DrawPage() {
  const { draws, loading } = useDraws();
  const { user } = useAuth();
  const { scores } = useScores();
  const [expanded, setExpanded] = useState(null);

  const latest = draws[0];
  const userScoreNums = scores.map((s) => s.score);

  return (
    <div className="min-h-screen bg-forest">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full bg-gold/6 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-600/8 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Monthly draws
          </div>
          <h1 className="section-title text-5xl mb-4 page-enter">
            Match your scores,<br />
            <span className="gradient-text">win the pot</span>
          </h1>
          <p className="text-cream/55 text-lg max-w-xl mx-auto">
            Your 5 Stableford scores are your draw numbers each month.
            Match 3, 4, or all 5 to win a share of the prize pool.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        {/* Prize tiers explainer */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { match: "5 Numbers", pct: "40%", label: "Jackpot", note: "Rolls over if unclaimed", color: "border-gold/30 text-gold", bg: "bg-gold/5" },
            { match: "4 Numbers", pct: "35%", label: "Major prize", note: "Split among winners", color: "border-brand-500/30 text-brand-400", bg: "bg-brand-500/5" },
            { match: "3 Numbers", pct: "25%", label: "Standard prize", note: "Split among winners", color: "border-blue-500/30 text-blue-400", bg: "bg-blue-500/5" },
          ].map((t) => (
            <div key={t.match} className={`card p-5 ${t.bg} border ${t.color} border-opacity-30`}>
              <p className={`font-mono font-bold text-lg ${t.color.split(" ")[1]}`}>{t.match}</p>
              <p className="text-cream/70 text-sm mt-1">{t.label}</p>
              <p className="font-display text-3xl text-cream mt-2">{t.pct}</p>
              <p className="text-cream/40 text-xs mt-1">of prize pool · {t.note}</p>
            </div>
          ))}
        </div>

        {/* Latest draw */}
        {loading ? (
          <div className="card p-8 animate-pulse h-64" />
        ) : latest ? (
          <div className="card p-8 border-gold/20 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/4 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-gold">Latest draw</span>
                  </div>
                  <h2 className="font-display text-3xl text-cream">{latest.month}</h2>
                  <p className="text-cream/40 text-sm mt-0.5">
                    Published {formatDate(latest.published_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-cream/40 text-sm">Jackpot pool</p>
                  <p className="font-display text-4xl text-gold">{formatCurrency(latest.jackpot_amount)}</p>
                  {latest.jackpot_rolled && (
                    <p className="text-gold/60 text-xs">Rolled over from previous month</p>
                  )}
                </div>
              </div>

              {/* Winning numbers */}
              <div className="mb-6">
                <p className="text-cream/40 text-xs uppercase tracking-widest mb-3">Winning numbers</p>
                <div className="flex gap-3 flex-wrap">
                  {(latest.winning_numbers || []).map((n) => {
                    const isMatch = userScoreNums.includes(n);
                    return (
                      <div
                        key={n}
                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono font-bold text-lg transition-all ${
                          isMatch
                            ? "border-gold bg-gold/20 text-gold scale-110"
                            : "border-white/20 text-cream/60"
                        }`}
                      >
                        {n}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User match status */}
              {user && userScoreNums.length > 0 && (
                <UserMatchBanner
                  userScores={userScoreNums}
                  winningNumbers={latest.winning_numbers || []}
                />
              )}

              {/* Pool breakdown */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                {[
                  { label: "Jackpot pool", value: formatCurrency(latest.jackpot_amount) },
                  { label: "4-match pool", value: formatCurrency(latest.pool_4match) },
                  { label: "3-match pool", value: formatCurrency(latest.pool_3match) },
                ].map((p) => (
                  <div key={p.label} className="text-center">
                    <p className="text-cream/40 text-xs">{p.label}</p>
                    <p className="text-cream font-semibold mt-1">{p.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center mb-8">
            <Trophy size={40} className="text-cream/20 mx-auto mb-4" />
            <p className="text-cream/50">No draws published yet.</p>
          </div>
        )}

        {/* Draw archive */}
        {draws.length > 1 && (
          <div>
            <h2 className="font-display text-2xl text-cream mb-4">Draw Archive</h2>
            <div className="space-y-3">
              {draws.slice(1).map((draw) => (
                <DrawArchiveItem
                  key={draw.id}
                  draw={draw}
                  expanded={expanded === draw.id}
                  onToggle={() => setExpanded(expanded === draw.id ? null : draw.id)}
                  userScores={userScoreNums}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function UserMatchBanner({ userScores, winningNumbers }) {
  const matches = calculateMatches(userScores, winningNumbers);
  if (matches === 0) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-cream/50 text-sm">Your scores matched <strong className="text-cream">0</strong> winning numbers this draw.</p>
      </div>
    );
  }
  const tierLabel = matches >= 5 ? "Jackpot winner!" : matches === 4 ? "4-number match!" : "3-number match!";
  return (
    <div className="p-4 rounded-xl bg-gold/10 border border-gold/30">
      <p className="text-gold font-semibold text-sm">
        🎉 {tierLabel} You matched <strong>{matches}</strong> numbers.
      </p>
    </div>
  );
}

function DrawArchiveItem({ draw, expanded, onToggle, userScores }) {
  const matches = calculateMatches(userScores, draw.winning_numbers || []);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-4">
          <Calendar size={16} className="text-cream/30" />
          <div className="text-left">
            <p className="text-cream text-sm font-medium">{draw.month}</p>
            <p className="text-cream/40 text-xs">Jackpot: {formatCurrency(draw.jackpot_amount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userScores.length > 0 && matches > 0 && (
            <span className="badge-gold text-xs">{matches} match{matches !== 1 ? "es" : ""}</span>
          )}
          {expanded ? <ChevronUp size={16} className="text-cream/30" /> : <ChevronDown size={16} className="text-cream/30" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/10 pt-4">
          <p className="text-cream/40 text-xs uppercase tracking-widest mb-3">Winning numbers</p>
          <div className="flex gap-2 flex-wrap">
            {(draw.winning_numbers || []).map((n) => (
              <div
                key={n}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold ${
                  userScores.includes(n)
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-white/15 text-cream/50"
                }`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
