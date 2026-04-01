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
  fullWidthChildren?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  title,
  subtitle,
  children,
  publicMode = false,
  onAuthOpen,
  fullWidthChildren = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isDriver = user?.role?.some((r) => r.toUpperCase().includes("DRIVER"));

  const navItems = [
    { label: "Explore Trips", path: "/trips" },
    // { label: "Dashboard", path: "/dashboard" },
    // { label: "Profile", path: "/profile" },
    { label: "My Bookings", path: "/bookings" },
    ...(isDriver ? [{ label: "Driver Trips", path: "/driver/trips" }] : []),
    ...(isDriver
      ? [{ label: "Booking Requests", path: "/driver/bookings/requests" }]
      : []),
    ...(!isDriver ? [{ label: "Become Driver", path: "/become-driver" }] : []),
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-inter">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/trips")}
            className="flex items-center gap-2 text-2xl font-black text-[#00ab42] font-outfit tracking-tight"
          >
            <img
              src={soksabayLogo}
              alt="Soksabay Go"
              className="w-10 h-10 rounded-xl"
            />
            <span>Soksabay Go</span>
          </button>

          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-700"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
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
              <button
                onClick={onAuthOpen}
                className="px-4 py-2 rounded-full border border-[#00ab42]/40 text-[#00ab42] text-sm font-semibold hover:bg-[#00eb5b]/10 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onAuthOpen}
                className="px-4 py-2 rounded-full bg-[#00eb5b] text-slate-900 text-sm font-semibold hover:bg-[#00ab42] hover:text-white transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
                title="View / edit profile"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#00eb5b]/15 border border-[#00eb5b]/20 overflow-hidden flex items-center justify-center">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#00ab42] font-black text-xs">
                      {(user?.fullName || user?.email || "U").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {user?.fullName || user?.email}
                  </p>
                  {/* <p className="text-[11px] text-slate-500">
                    {user?.role?.[0] || "Member"}
                  </p> */}
                </div>
              </button>
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

      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl p-5 transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <img
              src={soksabayLogo}
              alt="Soksabay Go"
              className="w-8 h-8 rounded-lg"
            />
            <h3 className="text-lg font-black text-[#00ab42]">Soksabay Go</h3>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600"
          >
            ✕
          </button>
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
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                  isActive(item.path)
                    ? "bg-[#00eb5b] text-slate-900"
                    : "text-slate-700 hover:bg-[#00eb5b]/10"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => {
                  navigate("/profile");
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#00eb5b]/15 border border-[#00eb5b]/20 overflow-hidden flex items-center justify-center">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#00ab42] font-black text-sm">
                      {(user?.fullName || user?.email || "U").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user?.fullName || user?.email}
                  </p>
                  {/* <p className="text-xs text-slate-500">
                    {user?.role?.[0] || "Member"}
                  </p> */}
                </div>
              </button>

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

      <main
        className={`w-full ${
          fullWidthChildren ? "" : "max-w-7xl mx-auto px-4 md:px-8 py-6"
        }`}
      >
        {!publicMode && (
          <div className="mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4">
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
      <footer className="bg-white text-[#222] border-t border-gray-200 footer-font">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 text-[15px]">
            {/* Logo + Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={soksabayLogo}
                  alt="Soksabay Go"
                  className="w-10 h-10 rounded-2xl"
                />
                <h4 className="text-[22px] font-semibold tracking-tight">
                  Soksabay Go
                </h4>
              </div>
              <p className="text-[14px] text-[#555] leading-relaxed max-w-xs">
                Cambodia's trusted platform for tours, local rides, and
                unforgettable travel experiences.
              </p>
            </div>

            {/* About / Company */}
            <div>
              <h5 className="font-semibold text-[15px] mb-4 text-[#222]">
                About Soksabay Go
              </h5>
              <ul className="space-y-2.5 text-[14.5px] text-[#444]">
                <li>
                  <a
                    href="/about"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="/trust"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Trust &amp; Safety
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Travel Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h5 className="font-semibold text-[15px] mb-4 text-[#222]">
                Explore
              </h5>
              <ul className="space-y-2.5 text-[14.5px] text-[#444]">
                <li>
                  <a
                    href="/tours"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Browse Tours
                  </a>
                </li>
                <li>
                  <a
                    href="/rides"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Book a Ride
                  </a>
                </li>
                <li>
                  <a
                    href="/destinations"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Popular Destinations
                  </a>
                </li>
                <li>
                  <a
                    href="/write-review"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Write a Review
                  </a>
                </li>
                <li>
                  <a
                    href="/help"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Do Business With Us */}
            <div>
              <h5 className="font-semibold text-[15px] mb-4 text-[#222]">
                Do Business With Us
              </h5>
              <ul className="space-y-2.5 text-[14.5px] text-[#444]">
                <li>
                  <a
                    href="/for-operators"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    For Tour Operators
                  </a>
                </li>
                <li>
                  <a
                    href="/partners"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Become a Partner
                  </a>
                </li>
                <li>
                  <a
                    href="/advertise"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Advertise With Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Get The App + Tripadvisor-style Sites */}
            <div>
              <h5 className="font-semibold text-[15px] mb-4 text-[#222]">
                Get The App
              </h5>
              <ul className="space-y-2.5 text-[14.5px] text-[#444] mb-8">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    iPhone App
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#00ab42] transition-colors"
                  >
                    Android App
                  </a>
                </li>
              </ul>

              <h5 className="font-semibold text-[15px] mb-4 text-[#222]">
                Our Partners
              </h5>
              <ul className="space-y-1 text-[14.5px] text-[#444]">
                <li>Trusted local drivers &amp; tour guides in Cambodia</li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal Bar */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[#555]">
                <span>
                  © {new Date().getFullYear()} Soksabay Go. All rights reserved.
                </span>
                <a
                  href="/terms"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  Terms of Use
                </a>
                <a
                  href="/privacy"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  Privacy &amp; Cookies Statement
                </a>
                <a
                  href="/accessibility"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  Accessibility Statement
                </a>
                <a
                  href="/how-it-works"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  How the site works
                </a>
                <a
                  href="/contact"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  Contact Us
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex gap-5 text-[#555]">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  f
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  📷
                </a>
                <a
                  href="#"
                  aria-label="Telegram"
                  className="hover:text-[#00ab42] transition-colors"
                >
                  ✈️
                </a>
              </div>
            </div>

            {/* Disclaimer (like Tripadvisor) */}
            <div className="mt-8 text-[13px] text-[#666] max-w-3xl leading-relaxed">
              Soksabay Go connects travelers with local tour operators and
              drivers in Cambodia. We are not a tour operator. When you book
              with our partners, please check their site for full details and
              fees.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
