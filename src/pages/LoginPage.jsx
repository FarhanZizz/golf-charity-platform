import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    if (error) {
      toast.error(error.message || "Sign in failed");
    } else {
      toast.success("Welcome back!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-brand-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gold/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm page-enter">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
              <Trophy size={18} className="text-forest" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl text-cream">
              Green<span className="text-gold">Pot</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl text-cream">Welcome back</h1>
          <p className="text-cream/50 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Password</label>
              <button type="button" className="text-xs text-gold hover:text-gold-light transition-colors">Forgot password?</button>
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/60 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-forest/40 border-t-forest rounded-full animate-spin" />
                Signing in…
              </span>
            ) : "Sign in"}
          </button>
        </form>

        <p className="text-center text-cream/40 text-sm mt-5">
          No account?{" "}
          <Link to="/register" className="text-gold hover:text-gold-light transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
