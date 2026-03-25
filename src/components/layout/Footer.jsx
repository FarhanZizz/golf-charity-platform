import React from "react";
import { Link } from "react-router-dom";
import { Trophy, Heart, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <Trophy size={16} className="text-forest" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl text-cream">
                Green<span className="text-gold">Pot</span>
              </span>
            </Link>
            <p className="text-cream/50 text-sm leading-relaxed max-w-xs">
              Every swing matters. Play golf, win prizes, and support the causes you care about — all in one place.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Instagram, Mail].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream/40 hover:text-cream transition-all">
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-cream/40 text-xs uppercase tracking-widest mb-4">Platform</p>
            <ul className="space-y-2.5">
              {[
                { to: "/charities", label: "Charities" },
                { to: "/draws", label: "Monthly Draws" },
                { to: "/subscribe", label: "Pricing" },
                { to: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-cream/50 hover:text-cream text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-cream/40 text-xs uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Responsible Play"].map((l) => (
                <li key={l}>
                  <span className="text-cream/50 text-sm cursor-default">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream/30 text-xs">
            © {new Date().getFullYear()} GreenPot. All rights reserved.
          </p>
          <p className="text-cream/30 text-xs flex items-center gap-1">
            Made with <Heart size={11} className="text-red-400 fill-red-400" /> for golf &amp; good causes
          </p>
        </div>
      </div>
    </footer>
  );
}
