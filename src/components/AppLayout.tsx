import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import soksabayLogo from "../assets/soksabay-logo.svg";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  publicMode?: boolean;
  onAuthOpen?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ title, subtitle, children, publicMode = false, onAuthOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isDriver = user?.role?.some((r) => r.toUpperCase().includes("DRIVER"));

  const navItems = [
    { label: "Explore Trips", path: "/trips" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "My Bookings", path: "/bookings" },
    ...(isDriver ? [{ label: "Driver Trips", path: "/driver/trips" }] : []),
    ...(isDriver ? [{ label: "Booking Requests", path: "/driver/bookings/requests" }] : []),
    ...(!isDriver ? [{ label: "Become Driver", path: "/become-driver" }] : []),
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    navigate("/trips", { replace: true });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-inter">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/trips")} className="flex items-center gap-2 text-2xl font-black text-[#00ab42] font-outfit tracking-tight">
            <img src={soksabayLogo} alt="Soksabay Go" className="w-10 h-10 rounded-xl" />
            <span>Soksabay Go</span>
          </button>

          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-700"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {!publicMode && (
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-out transform hover:-translate-y-0.5 ${
                    isActive(item.path)
                      ? "bg-[#00eb5b] text-slate-900 shadow-md shadow-[#00eb5b]/30"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {publicMode ? (
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={onAuthOpen} className="px-4 py-2 rounded-full border border-[#00ab42]/40 text-[#00ab42] text-sm font-semibold hover:bg-[#00eb5b]/10 transition-colors">
                Sign In
              </button>
              <button onClick={onAuthOpen} className="px-4 py-2 rounded-full bg-[#00eb5b] text-slate-900 text-sm font-semibold hover:bg-[#00ab42] hover:text-white transition-colors">
                Get Started
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <NotificationBell />
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName || user?.email}</p>
                <p className="text-[11px] text-slate-500">{user?.role?.[0] || "Member"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setMobileOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 z-[70] w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl p-5 transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <img src={soksabayLogo} alt="Soksabay Go" className="w-8 h-8 rounded-lg" />
                <h3 className="text-lg font-black text-[#00ab42]">Soksabay Go</h3>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600">✕</button>
            </div>

            {publicMode ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onAuthOpen?.();
                  }}
                  className="w-full px-4 py-3 rounded-full border border-[#00ab42]/40 text-[#00ab42] font-semibold hover:bg-[#00eb5b]/10 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onAuthOpen?.();
                  }}
                  className="w-full px-4 py-3 rounded-full bg-[#00eb5b] text-slate-900 font-semibold hover:bg-[#00ab42] hover:text-white transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${isActive(item.path) ? "bg-[#00eb5b] text-slate-900" : "text-slate-700 hover:bg-[#00eb5b]/10"}`}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="mt-6 border-t pt-4">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || user?.email}</p>
                  <p className="text-xs text-slate-500 mb-3">{user?.role?.[0] || "Member"}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </aside>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6">
        {!publicMode && (
          <div className="mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4">
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      <footer className="mt-10 border-t border-[#00ab42]/20 bg-gradient-to-br from-[#00ab42] via-[#00c74d] to-[#00eb5b] text-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <img src={soksabayLogo} alt="Soksabay Go" className="w-8 h-8 rounded-lg" />
              <h4 className="text-xl font-black text-slate-900">Soksabay Go</h4>
            </div>
            <p className="text-sm text-slate-900/85 mt-2">Tripadvisor-inspired booking experience for Cambodia tours and trusted local rides.</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-2">Popular Destinations</p>
            <ul className="text-sm text-slate-900/85 space-y-1">
              <li>Siem Reap</li>
              <li>Sihanoukville</li>
              <li>Kampot</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-2">Contact</p>
            <p className="text-sm text-slate-900/85">support@soksabaygo.com</p>
            <p className="text-sm text-slate-900/85">+855 12 345 678</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-3">Follow Us</p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/80 hover:bg-[#00ab42] hover:text-white text-slate-800 flex items-center justify-center transition-colors shadow">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v6.99A10 10 0 0022 12z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/80 hover:bg-[#00ab42] hover:text-white text-slate-800 flex items-center justify-center transition-colors shadow">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.8A3.95 3.95 0 003.8 7.75v8.5a3.95 3.95 0 003.95 3.95h8.5a3.95 3.95 0 003.95-3.95v-8.5a3.95 3.95 0 00-3.95-3.95h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.8a3.2 3.2 0 100 6.4 3.2 3.2 0 000-6.4zm5.4-2.2a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
              </a>
              <a href="#" aria-label="Telegram" className="w-10 h-10 rounded-full bg-white/80 hover:bg-[#00ab42] hover:text-white text-slate-800 flex items-center justify-center transition-colors shadow">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 15.44l-.38 3.4c.54 0 .78-.23 1.06-.5l2.55-2.43 5.29 3.87c.97.54 1.66.25 1.92-.9l3.48-16.3h.01c.31-1.45-.52-2.01-1.46-1.66L1.93 8.4c-1.4.54-1.38 1.32-.24 1.67l5 1.56L18.3 4.2c.55-.36 1.06-.16.65.2"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-slate-900/85 pb-8 font-medium">© {new Date().getFullYear()} Soksabay Go. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default AppLayout;
