import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    if (error) {
      toast.error(error.message || "Registration failed");
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center px-4">
        <div className="text-center max-w-sm page-enter">
          <div className="w-16 h-16 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto mb-5">
            <Check size={28} className="text-brand-400" />
          </div>
          <h2 className="font-display text-3xl text-cream mb-3">Check your email</h2>
          <p className="text-cream/50 text-sm leading-relaxed mb-6">
            We sent a confirmation link to <strong className="text-cream">{form.email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="btn-primary justify-center w-full">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-600/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm page-enter">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
              <Trophy size={18} className="text-forest" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl text-cream">
              Green<span className="text-gold">Pot</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl text-cream">Create account</h1>
          <p className="text-cream/50 text-sm mt-1">Start playing for good today</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Smith"
              required
              className="input"
            />
          </div>
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
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
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
          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat password"
              required
              className="input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-forest/40 border-t-forest rounded-full animate-spin" />
                Creating account…
              </span>
            ) : "Create account"}
          </button>

          <p className="text-cream/30 text-xs text-center leading-relaxed">
            By creating an account you agree to our{" "}
            <span className="text-cream/50 underline cursor-default">Terms</span> and{" "}
            <span className="text-cream/50 underline cursor-default">Privacy Policy</span>.
          </p>
        </form>

        <p className="text-center text-cream/40 text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-gold hover:text-gold-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
