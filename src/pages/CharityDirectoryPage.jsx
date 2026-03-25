import React, { useState } from "react";
import { Heart, Search, ExternalLink, Star } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCharities } from "../hooks/useCharities";
import { truncate } from "../lib/utils";

const CATEGORIES = ["All", "Health", "Mental Health", "Children", "Animals", "International", "Social"];

export default function CharityDirectoryPage() {
  const { charities, loading } = useCharities();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = charities.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || c.category === category;
    return matchSearch && matchCat;
  });

  const featured = charities.filter((c) => c.is_featured);

  return (
    <div className="min-h-screen bg-forest">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-red-500/6 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-600/8 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-6">
            <Heart size={12} className="fill-red-400" />
            {charities.length} charity partners
          </div>
          <h1 className="section-title text-5xl md:text-6xl mb-4 page-enter">
            Play golf.<br />
            <span className="gradient-text">Fund what matters.</span>
          </h1>
          <p className="text-cream/55 text-lg max-w-xl mx-auto">
            Every subscription supports one of these incredible causes.
            You choose who benefits from your game.
          </p>
        </div>
      </section>

      {/* Featured spotlight */}
      {featured.length > 0 && (
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Star size={16} className="text-gold fill-gold" />
              <p className="text-cream/60 text-sm font-medium">Featured charities</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {featured.map((c) => (
                <CharityCard key={c.id} charity={c} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Directory */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
              <input
                type="text"
                placeholder="Search charities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    category === cat
                      ? "bg-gold text-forest"
                      : "bg-white/5 text-cream/60 hover:bg-white/10 hover:text-cream"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 h-48 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-cream/30">
              <Heart size={32} className="mx-auto mb-3 opacity-30" />
              <p>No charities found matching your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <CharityCard key={c.id} charity={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function CharityCard({ charity: c, featured }) {
  return (
    <div className={`card-hover p-6 group ${featured ? "border-gold/20" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/30 to-red-500/20 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-red-400" />
        </div>
        <div className="flex items-center gap-2">
          {featured && <Star size={12} className="text-gold fill-gold" />}
          {c.category && (
            <span className="badge-gray text-xs">{c.category}</span>
          )}
        </div>
      </div>

      <h3 className="font-display text-lg text-cream mb-2 group-hover:text-gold transition-colors">
        {c.name}
      </h3>
      <p className="text-cream/50 text-sm leading-relaxed mb-4">
        {truncate(c.description, 100)}
      </p>

      {c.website && (
        <a
          href={c.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-gold hover:text-gold-light text-xs transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Visit website <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}
