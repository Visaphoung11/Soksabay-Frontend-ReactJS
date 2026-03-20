import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isDriver = user?.role?.some((r) =>
    r.toUpperCase().includes("DRIVER")
  );

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Soksabay Go</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white text-sm font-medium rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6 flex items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-purple-500/20">
              {initials}
            </div>
            {isDriver && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {displayName}! 👋</h1>
            <p className="text-white/50 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {user?.role?.map((r) => (
                <span
                  key={r}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${r.toUpperCase().includes("DRIVER")
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : r.toUpperCase().includes("ADMIN")
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      : "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                    }`}
                >
                  {r.toUpperCase().includes("DRIVER") ? "🚗" : r.toUpperCase().includes("ADMIN") ? "🛡" : "👤"}
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <InfoCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/15"
            label="Email"
            value={user?.email || "—"}
          />
          <InfoCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" /></svg>}
            iconColor="text-indigo-400"
            iconBg="bg-indigo-500/15"
            label="Contact"
            value={user?.contactNumber || "—"}
          />
          <InfoCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            iconColor="text-cyan-400"
            iconBg="bg-cyan-500/15"
            label="Gender"
            value={user?.gender || "—"}
          />
        </div>

        {/* Driver Section */}
        {isDriver ? (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-emerald-400 font-bold text-xl">You're a Verified Driver! 🎉</h2>
                <p className="text-white/50 text-sm mt-1">
                  Your driver application has been approved. You can now receive booking requests.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-amber-400 font-bold text-xl">Become a Driver</h2>
                  <p className="text-white/50 text-sm mt-1">
                    Earn money by offering tours with Soksabay Go.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/become-driver")}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Apply Now
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const InfoCard = ({
  icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
    <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-white/40 text-xs mb-1">{label}</p>
    <p className="text-white font-medium text-sm truncate">{value}</p>
  </div>
);

export default Dashboard;
