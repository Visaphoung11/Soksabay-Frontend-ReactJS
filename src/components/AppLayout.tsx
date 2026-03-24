import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isDriver = user?.role?.some((r) => r.toUpperCase().includes("DRIVER"));

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon /> },
    { label: "Explore Trips", path: "/trips", icon: <CompassIcon /> },
    { label: "My Bookings", path: "/bookings", icon: <TicketIcon /> },
    ...(isDriver ? [{ label: "Driver Trips", path: "/driver/trips", icon: <CarIcon /> }] : []),
    ...(isDriver ? [{ label: "Booking Requests", path: "/driver/bookings/requests", icon: <InboxIcon /> }] : []),
    ...(!isDriver ? [{ label: "Become Driver", path: "/become-driver", icon: <SparkIcon /> }] : []),
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    navigate("/trips", { replace: true });
  };

  if (publicMode) {
    return (
      <div className="min-h-screen bg-slate-50 font-inter">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-10 h-20 flex items-center justify-between">
          <button onClick={() => navigate("/trips")} className="text-2xl font-black text-blue-600 font-outfit tracking-tighter">
            Soksabay Go
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onAuthOpen}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={onAuthOpen}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            >
              Get Started
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <nav
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 flex flex-col z-[70] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-2xl font-black text-blue-600 font-outfit tracking-tighter">Soksabay Go</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all group ${
                isActive(item.path)
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className={`${isActive(item.path) ? "text-white" : "text-slate-400"} w-5 h-5`}>{item.icon}</span>
              <span className="text-[11px] uppercase tracking-[0.15em]">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-black text-slate-900 truncate">{user?.fullName || user?.email}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user?.role?.[0] || "Member"}</p>
          </div>
        </div>
      </nav>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-11 h-11 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-2xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

const HomeIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const CompassIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18zm2.121-11.121l-1.414 4.243-4.243 1.414 1.414-4.243 4.243-1.414z" /></svg>
);
const CarIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-5a2 2 0 011.9-1.37h10.2A2 2 0 0119 8l2 5m-1 0h1v5h-2v-1H5v1H3v-5h1m16 0H4m3 3h.01M17 16h.01" /></svg>
);
const SparkIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const TicketIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5V3H9v2H5v14h14V5h-4zM9 11h6m-6 4h6" /></svg>
);
const InboxIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0l-2.586 2.586A2 2 0 0116 16H8a2 2 0 01-1.414-.586L4 13m16 0H4" /></svg>
);

export default AppLayout;
