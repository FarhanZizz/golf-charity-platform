import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Trophy, ChevronDown, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const navLinks = [
    { to: "/charities", label: "Charities" },
    { to: "/draws", label: "Monthly Draws" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-forest/95 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center group-hover:scale-105 transition-transform">
              <Trophy size={16} className="text-forest" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl text-cream">
              Green<span className="text-gold">Pot</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? "text-cream" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-semibold">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm text-cream/80 max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                  <ChevronDown size={14} className={`text-cream/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 card shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs text-cream/40">Signed in as</p>
                      <p className="text-sm text-cream truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <DropItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setDropdownOpen(false)} />
                      {isAdmin && (
                        <DropItem to="/admin" icon={Settings} label="Admin Panel" onClick={() => setDropdownOpen(false)} />
                      )}
                      <button
                        onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-cream/70"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-forest-light border-t border-white/10 px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2.5 rounded-xl text-cream/70 hover:text-cream hover:bg-white/5 transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
          <div className="divider my-3" />
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2.5 rounded-xl text-cream/70 hover:text-cream hover:bg-white/5 transition-colors text-sm">
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block px-3 py-2.5 rounded-xl text-cream/70 hover:text-cream hover:bg-white/5 transition-colors text-sm">
                  Admin Panel
                </Link>
              )}
              <button onClick={handleSignOut} className="w-full text-left px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/login" className="btn-outline justify-center text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary justify-center text-sm">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function DropItem({ to, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-cream/70 hover:text-cream hover:bg-white/5 transition-colors"
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}
