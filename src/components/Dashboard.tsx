import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isDriver = user?.role?.some((r) => r.toUpperCase().includes("DRIVER"));
  const displayName = user?.fullName || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar/Nav */}
      <nav className={`fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 flex flex-col z-[70] transition-transform duration-500 ease-soft-spring lg:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-2xl font-black text-blue-600 font-outfit tracking-tighter">Soksabay Go</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-4 space-y-1">
          <NavItem icon={<HomeIcon />} label="Dashboard" active onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={<MapIcon />} label="My Bookings" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={<SupportIcon />} label="Support" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={<SettingsIcon />} label="Settings" onClick={() => setIsSidebarOpen(false)} />
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-4 rounded-[2rem] bg-slate-50 border border-slate-100/50">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate font-outfit uppercase tracking-tighter">{displayName}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate tracking-widest uppercase">{user?.role?.[0] || "Member"}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-slate-100/50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all"
            >
              <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div className="lg:hidden">
              <h1 className="text-xl font-black text-blue-600 font-outfit tracking-tighter">SG</h1>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
            <div className="relative w-full max-w-md hidden md:block">
              <input
                type="text"
                placeholder="Search trips, drivers, locations..."
                className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:bg-white focus:border-blue-600/20 transition-all outline-none"
              />
              <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-11 h-11 bg-slate-100/50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-12 max-w-7xl w-full mx-auto">
          {/* Hero Welcome */}
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] mb-2 leading-none">Welcome Back Overview</p>
                <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter leading-tight">Good day, {displayName}! 👋</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {user?.role?.map((r: string) => (
                  <span key={r} className="px-4 py-2 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardCard label="Trips Completed" value="12" icon={<MapIcon />} color="text-blue-600" bg="bg-blue-50/50" />
              <DashboardCard label="Active Alerts" value="2" icon={<BellIcon />} color="text-amber-600" bg="bg-amber-50/50" />
              <DashboardCard label="Member Points" value="2,450" icon={<CheckIcon />} color="text-emerald-600" bg="bg-emerald-50/50" />
            </div>
          </section>

          {/* Special Banner */}
          <section className="mb-14">
            {!isDriver ? (
              <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-16 border border-slate-800 shadow-2xl shadow-blue-900/20">
                <div className="relative z-10 max-w-xl">
                  <span className="text-blue-400 font-black tracking-[0.2em] uppercase text-[10px]">Onboarding Program</span>
                  <h3 className="text-4xl font-black text-white mt-4 mb-8 font-outfit tracking-tight leading-tight">Empower your drive. Showcase Cambodia.</h3>
                  <p className="text-slate-400 mb-10 leading-relaxed font-medium">
                    Join our elite network of professional guides and drivers. Start earning by offering unforgettable journeys across the Kingdom of Wonder.
                  </p>
                  <button
                    onClick={() => navigate("/become-driver")}
                    className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 active:translate-y-0 text-sm uppercase tracking-tight"
                  >
                    Start Application Hub ➔
                  </button>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-50 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-dashed">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10">
                    <CheckIcon size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">Driver Verification Active</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Status: Operational & Ready for Bookings</p>
                  </div>
                </div>
                <button className="px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-700 font-black rounded-2xl hover:bg-emerald-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/5 uppercase text-xs tracking-widest">
                  Access Portal
                </button>
              </div>
            )}
          </section>

          {/* Quick Info Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Security & Profile</h4>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Edit Hub Settings</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProfileItem label="Direct Email" value={user?.email || "—"} icon={<EmailIcon />} />
              <ProfileItem label="Mobile Link" value={user?.contactNumber || "+855 (0) 99 887 766"} icon={<PhoneIcon />} />
              <ProfileItem label="Identity Gender" value={user?.gender || "Not Set"} icon={<UserIcon />} />
              <ProfileItem label="Base Region" value="Phnom Penh, KH" icon={<LocIcon />} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all group ${active ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
  >
    <span className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-slate-300"}`}>{icon}</span>
    <span className="text-[11px] uppercase tracking-[0.15em]">{label}</span>
  </button>
);

const DashboardCard = ({ label, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 font-outfit">{value}</p>
    </div>
  </div>
);

const ProfileItem = ({ label, value, icon }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="text-blue-500">{icon}</div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
  </div>
);

// Icons
const HomeIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const MapIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
);
const SupportIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const SettingsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const BellIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const CheckIcon = ({ size = 24 }: any) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" /></svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const LocIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export default Dashboard;
