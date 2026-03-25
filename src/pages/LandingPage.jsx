import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy, Heart, Zap, ArrowRight, Check,
  Users, DollarSign, Award, ChevronDown
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-forest">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-16">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-3xl" />
          <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-gold/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-brand-800/15 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Monthly draw now live — £4,200 jackpot pool
          </div>

          <h1 className="section-title text-5xl md:text-7xl mb-6 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            Golf that gives<br />
            <span className="gradient-text">back to the world</span>
          </h1>

          <p className="text-cream/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            Track your Stableford scores, enter monthly prize draws, and automatically support
            a charity you believe in — all with one subscription.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link to="/draws" className="btn-outline text-base px-8 py-4">
              See this month's draw
            </Link>
          </div>

          {/* Micro proof */}
          <div className="flex items-center justify-center gap-6 mt-12 text-cream/40 text-sm animate-fade-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-brand-400" /> No golf experience needed</span>
            <span className="hidden sm:flex items-center gap-1.5"><Check size={14} className="text-brand-400" /> Cancel anytime</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-brand-400" /> Real charity impact</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-cream/20">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/10 bg-forest-light">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: "2,400+", label: "Active golfers" },
            { icon: DollarSign, value: "£38,000+", label: "Prizes awarded" },
            { icon: Heart, value: "£12,400+", label: "Donated to charity" },
            { icon: Award, value: "8", label: "Charity partners" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1">
              <Icon size={20} className="text-gold mb-1" />
              <span className="font-display text-2xl text-cream">{value}</span>
              <span className="text-cream/40 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-widest mb-3">How it works</p>
            <h2 className="section-title text-4xl md:text-5xl">Three steps to play</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Subscribe",
                desc: "Choose a monthly or yearly plan. A portion of every payment goes directly to your chosen charity.",
                color: "text-brand-400",
                bg: "bg-brand-500/10",
              },
              {
                step: "02",
                icon: Trophy,
                title: "Enter your scores",
                desc: "Log your last 5 Stableford scores. Your 5 scores become your 5 monthly draw numbers.",
                color: "text-gold",
                bg: "bg-gold/10",
              },
              {
                step: "03",
                icon: Heart,
                title: "Win & give",
                desc: "Match 3, 4, or all 5 numbers to win your share of the prize pool. Charity receives its cut automatically.",
                color: "text-red-400",
                bg: "bg-red-500/10",
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                <span className="absolute top-6 right-6 font-mono text-6xl font-bold text-white/5 select-none">
                  {item.step}
                </span>
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                  <item.icon size={22} className={item.color} />
                </div>
                <h3 className="font-display text-2xl text-cream mb-3">{item.title}</h3>
                <p className="text-cream/55 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize pool visual */}
      <section className="py-24 px-4 bg-forest-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold text-sm uppercase tracking-widest mb-3">Prize pools</p>
              <h2 className="section-title text-4xl mb-5">Three ways to win every month</h2>
              <p className="text-cream/55 text-base leading-relaxed mb-8">
                Your subscription contributes to the prize pool. Match more numbers, win a bigger share.
                The jackpot rolls over if unclaimed — so it keeps growing.
              </p>

              <div className="space-y-4">
                {[
                  { tier: "5 Numbers", share: "40%", label: "Jackpot", rollover: true, color: "text-gold", bar: "bg-gold" },
                  { tier: "4 Numbers", share: "35%", label: "Major prize", rollover: false, color: "text-brand-400", bar: "bg-brand-400" },
                  { tier: "3 Numbers", share: "25%", label: "Standard prize", rollover: false, color: "text-blue-400", bar: "bg-blue-400" },
                ].map((p) => (
                  <div key={p.tier} className="card p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-mono font-semibold ${p.color}`}>{p.tier}</span>
                        <div className="flex items-center gap-2">
                          {p.rollover && <span className="badge-gold text-xs">Rolls over</span>}
                          <span className="text-cream/50 text-sm">{p.label}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${p.bar} rounded-full`} style={{ width: p.share }} />
                      </div>
                    </div>
                    <span className={`font-display text-2xl ${p.color} w-14 text-right`}>{p.share}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual prize card */}
            <div className="relative">
              <div className="card p-8 border-gold/20 bg-gradient-to-br from-forest-mid to-forest-light relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-cream/50 text-sm">This month's jackpot</span>
                    <span className="badge-gold">Live</span>
                  </div>
                  <p className="font-display text-6xl text-gold mb-1">£4,200</p>
                  <p className="text-cream/40 text-sm mb-8">rolls over if no 5-match winner</p>

                  <div className="flex gap-3 mb-6">
                    {[12, 18, 24, 31, 7].map((n) => (
                      <div key={n} className="w-12 h-12 rounded-full bg-forest border-2 border-gold/40 flex items-center justify-center font-mono font-bold text-gold">
                        {n}
                      </div>
                    ))}
                  </div>
                  <p className="text-cream/30 text-xs">Last month's winning numbers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity focus */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gold text-sm uppercase tracking-widest mb-3">For good</p>
          <h2 className="section-title text-4xl md:text-5xl mb-5">
            Every subscription<br />funds a cause
          </h2>
          <p className="text-cream/55 max-w-xl mx-auto text-base mb-12">
            Choose from our curated list of charities at signup. At least 10% of your subscription
            goes directly to them — and you can always give more.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {["Cancer Research UK", "Mind", "British Heart Foundation", "Macmillan Support"].map((c) => (
              <div key={c} className="card p-5 text-center hover:border-white/20 transition-all">
                <div className="w-10 h-10 rounded-full bg-brand-500/15 flex items-center justify-center mx-auto mb-3">
                  <Heart size={18} className="text-brand-400" />
                </div>
                <p className="text-cream/80 text-sm font-medium">{c}</p>
              </div>
            ))}
          </div>

          <Link to="/charities" className="btn-outline">
            View all charities
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 bg-forest-light" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="section-title text-4xl">Simple, transparent plans</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <PricingCard
              name="Monthly"
              price="£19.99"
              period="/ month"
              features={["Full draw participation", "Score tracking (5 scores)", "Charity contribution", "Cancel anytime"]}
              cta="Start monthly"
              highlight={false}
            />
            <PricingCard
              name="Yearly"
              price="£199.99"
              period="/ year"
              badge="Save 17%"
              features={["Everything in monthly", "Priority draw entry", "Bonus charity contribution", "Annual winners certificate"]}
              cta="Start yearly"
              highlight={true}
            />
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 border-gold/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-brand-500/5" />
            <div className="relative z-10">
              <h2 className="section-title text-4xl md:text-5xl mb-5">
                Ready to tee off<br />for a good cause?
              </h2>
              <p className="text-cream/55 mb-8 max-w-md mx-auto">
                Join thousands of golfers turning their game into a force for good.
              </p>
              <Link to="/register" className="btn-primary text-base px-10 py-4">
                Create free account
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PricingCard({ name, price, period, badge, features, cta, highlight }) {
  return (
    <div className={`card p-8 relative ${highlight ? "border-gold/40 bg-gradient-to-b from-gold/5 to-transparent" : ""}`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge-gold text-xs px-3 py-1">{badge}</span>
        </div>
      )}
      <p className="text-cream/50 text-sm mb-2">{name}</p>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="font-display text-4xl text-cream">{price}</span>
        <span className="text-cream/40 text-sm">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-cream/65">
            <Check size={14} className="text-brand-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`w-full justify-center ${highlight ? "btn-primary" : "btn-outline"}`}
        style={{ display: "flex" }}
      >
        {cta}
      </Link>
    </div>
  );
}
