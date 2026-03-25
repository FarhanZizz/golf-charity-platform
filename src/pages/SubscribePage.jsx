import React, { useState } from "react";
import { Check, CreditCard, ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { PLAN_PRICES } from "../lib/utils";
import toast from "react-hot-toast";

export default function SubscribePage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("monthly");
  const [loading, setLoading] = useState(false);

  // NOTE: In production, this integrates with Stripe.
  // Here we simulate activating the plan in Supabase directly.
  const handleSubscribe = async () => {
    setLoading(true);
    const now = new Date();
    const end = new Date(now);
    if (selected === "yearly") {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        plan: selected,
        plan_status: "active",
        plan_start: now.toISOString(),
        plan_end: end.toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Subscription failed. Please try again.");
    } else {
      // Log subscription record
      await supabase.from("subscriptions").insert({
        user_id: profile.id,
        plan: selected,
        amount: PLAN_PRICES[selected],
        status: "active",
        started_at: now.toISOString(),
        ends_at: end.toISOString(),
      });
      toast.success("Subscription activated!");
      refreshProfile();
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const alreadyActive = profile?.plan_status === "active";

  return (
    <div className="min-h-screen bg-forest">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-10 page-enter">
          <h1 className="section-title text-4xl md:text-5xl mb-4">
            Choose your plan
          </h1>
          <p className="text-cream/55">
            One subscription. Golf scores, monthly draws, and charitable giving — all in one.
          </p>
        </div>

        {alreadyActive ? (
          <div className="card p-8 text-center">
            <Check size={32} className="text-brand-400 mx-auto mb-3" />
            <h2 className="font-display text-2xl text-cream mb-2">You're already subscribed</h2>
            <p className="text-cream/50 text-sm mb-5">
              Your <strong className="text-cream">{profile.plan}</strong> plan is active.
            </p>
            <button onClick={() => navigate("/dashboard")} className="btn-primary">
              Go to dashboard <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <PlanCard
                name="Monthly"
                price="£19.99"
                period="/ month"
                selected={selected === "monthly"}
                onSelect={() => setSelected("monthly")}
                features={[
                  "Full draw entry every month",
                  "Stableford score tracking",
                  "Charity contribution (min 10%)",
                  "Cancel anytime",
                ]}
              />
              <PlanCard
                name="Yearly"
                price="£199.99"
                period="/ year"
                badge="Save 17%"
                selected={selected === "yearly"}
                onSelect={() => setSelected("yearly")}
                features={[
                  "Everything in monthly",
                  "Equivalent to 10 months",
                  "Priority draw entry",
                  "Annual winners certificate",
                ]}
              />
            </div>

            {/* Simulated payment note */}
            <div className="card p-4 mb-6 flex items-start gap-3 border-gold/15">
              <Shield size={16} className="text-gold shrink-0 mt-0.5" />
              <p className="text-cream/50 text-xs leading-relaxed">
                <strong className="text-cream">Demo mode:</strong> This simulates subscription activation directly in the database.
                In production, this integrates with Stripe for secure PCI-compliant payment processing.
                No real payment is taken.
              </p>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-forest/40 border-t-forest rounded-full animate-spin" />
                  Activating…
                </span>
              ) : (
                <>
                  <CreditCard size={18} />
                  Activate {selected} plan — {selected === "yearly" ? "£199.99/yr" : "£19.99/mo"}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function PlanCard({ name, price, period, badge, selected, onSelect, features }) {
  return (
    <button
      onClick={onSelect}
      className={`card p-6 text-left transition-all duration-200 relative ${
        selected
          ? "border-gold/50 bg-gradient-to-b from-gold/8 to-transparent ring-1 ring-gold/30"
          : "hover:border-white/20"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 right-4">
          <span className="badge-gold text-xs px-3 py-1">{badge}</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <p className="text-cream/60 text-sm">{name}</p>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? "border-gold bg-gold" : "border-white/20"
          }`}
        >
          {selected && <Check size={12} className="text-forest" strokeWidth={3} />}
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-5">
        <span className="font-display text-3xl text-cream">{price}</span>
        <span className="text-cream/40 text-sm">{period}</span>
      </div>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-cream/60">
            <Check size={13} className="text-brand-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}
