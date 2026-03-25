import React from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4">
      <div className="text-center max-w-sm page-enter">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
          <Trophy size={36} className="text-cream/20" />
        </div>
        <p className="font-mono text-gold text-5xl font-bold mb-3">404</p>
        <h1 className="font-display text-3xl text-cream mb-3">Out of bounds</h1>
        <p className="text-cream/50 text-sm mb-8">
          This page doesn't exist. Maybe it rolled into the rough.
        </p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}
