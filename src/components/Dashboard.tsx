import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "./AppLayout";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isDriver = user?.role?.some((r) => r.toUpperCase().includes("DRIVER"));
  const displayName = user?.fullName || user?.email?.split("@")[0] || "Guest";

  return (
    <AppLayout title={`Good day, ${displayName}! 👋`} subtitle="Welcome back overview">
      <section className="mb-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {user?.role?.map((r: string) => (
            <span key={r} className="px-4 py-2 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ab42] animate-pulse" />
              {r}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard label="Trips Completed" value="12" icon={<MapIcon />} color="text-[#00ab42]" bg="bg-[#00eb5b]/10" />
          <DashboardCard label="Active Alerts" value="2" icon={<BellIcon />} color="text-amber-600" bg="bg-amber-50/50" />
          <DashboardCard label="Member Points" value="2,450" icon={<CheckIcon />} color="text-[#00ab42]" bg="bg-[#00eb5b]/10" />
        </div>
      </section>

      <section className="mb-14">
        {!isDriver ? (
          <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-16 border border-slate-800 shadow-2xl shadow-[#00eb5b]/20">
            <div className="relative z-10 max-w-xl">
              <span className="text-[#00eb5b] font-black tracking-[0.2em] uppercase text-[10px]">Onboarding Program</span>
              <h3 className="text-4xl font-black text-white mt-4 mb-8 font-outfit tracking-tight leading-tight">Empower your drive. Showcase Cambodia.</h3>
              <p className="text-slate-400 mb-10 leading-relaxed font-medium">
                Join our elite network of professional guides and drivers. Start earning by offering unforgettable journeys across the Kingdom of Wonder.
              </p>
              <button
                onClick={() => navigate("/become-driver")}
                className="px-10 py-5 bg-[#00eb5b] hover:bg-[#00ab42] hover:text-white text-slate-900 font-black rounded-[2rem] shadow-xl shadow-[#00eb5b]/30 transition-all transform hover:-translate-y-1 active:translate-y-0 text-sm uppercase tracking-tight"
              >
                Start Application Hub ➔
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#00eb5b]/10 border-2 border-[#00eb5b]/30 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-dashed">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-[2.5rem] bg-[#00eb5b]/20 flex items-center justify-center text-[#00ab42] shadow-xl shadow-[#00eb5b]/15">
                <CheckIcon size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">Driver Verification Active</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Status: Operational & Ready for Bookings</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/driver/trips")}
              className="px-8 py-4 bg-white border-2 border-[#00eb5b]/40 text-[#00ab42] font-black rounded-2xl hover:bg-[#00eb5b]/20 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#00eb5b]/10 uppercase text-xs tracking-widest"
            >
              Access Driver Trips
            </button>
          </div>
        )}
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfileItem label="Direct Email" value={user?.email || "—"} icon={<EmailIcon />} />
          <ProfileItem label="Mobile Link" value={user?.contactNumber || "—"} icon={<PhoneIcon />} />
          <ProfileItem label="Identity Gender" value={user?.gender || "Not Set"} icon={<UserIcon />} />
          <ProfileItem label="Base Region" value="Phnom Penh, KH" icon={<LocIcon />} />
        </div>
      </section>
    </AppLayout>
  );
};

const DashboardCard = ({ label, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 font-outfit">{value}</p>
    </div>
  </div>
);

const ProfileItem = ({ label, value, icon }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="text-[#00ab42]">{icon}</div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
  </div>
);

const MapIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
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
