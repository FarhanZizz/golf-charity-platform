import React, { useState } from "react";
import { Heart, Check, ChevronDown, Minus, Plus } from "lucide-react";
import { useCharities } from "../../hooks/useCharities";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function CharitySelector() {
  const { profile, refreshProfile } = useAuth();
  const { charities, loading } = useCharities();
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState(profile?.charity_pct || 10);
  const [saving, setSaving] = useState(false);

  const selectedCharity = charities.find((c) => c.id === profile?.charity_id);

  const selectCharity = async (id) => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ charity_id: id })
      .eq("id", profile.id);
    if (error) {
      toast.error("Failed to update charity");
    } else {
      toast.success("Charity updated!");
      refreshProfile();
    }
    setOpen(false);
    setSaving(false);
  };

  const savePct = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ charity_pct: pct })
      .eq("id", profile.id);
    if (error) {
      toast.error("Failed to update contribution");
    } else {
      toast.success("Contribution updated!");
      refreshProfile();
    }
    setSaving(false);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
          <Heart size={18} className="text-red-400" />
        </div>
        <div>
          <h3 className="font-display text-xl text-cream">Your Charity</h3>
          <p className="text-cream/40 text-xs">Select who benefits from your subscription</p>
        </div>
      </div>

      {/* Current selection */}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 transition-all mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
            <Heart size={14} className="text-brand-400" />
          </div>
          <span className="text-cream text-sm">
            {loading ? "Loading…" : selectedCharity?.name || "Choose a charity"}
          </span>
        </div>
        <ChevronDown size={16} className={`text-cream/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="mb-4 max-h-60 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5 scrollbar-hide">
          {charities.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCharity(c.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <div>
                <p className="text-cream text-sm">{c.name}</p>
                <p className="text-cream/40 text-xs">{c.category}</p>
              </div>
              {c.id === profile?.charity_id && (
                <Check size={15} className="text-brand-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Contribution % */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-cream/60 text-sm">Contribution</p>
          <span className="font-mono text-gold text-lg font-semibold">{pct}%</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPct((p) => Math.max(10, p - 5))}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream/60 hover:text-cream transition-all"
          >
            <Minus size={14} />
          </button>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-gold rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={() => setPct((p) => Math.min(100, p + 5))}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream/60 hover:text-cream transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="text-cream/30 text-xs mt-1.5">Minimum 10% · Drag to adjust</p>

        {pct !== (profile?.charity_pct || 10) && (
          <button onClick={savePct} disabled={saving} className="btn-primary text-sm py-2 px-4 mt-3">
            {saving ? "Saving…" : "Save contribution"}
          </button>
        )}
      </div>
    </div>
  );
}
