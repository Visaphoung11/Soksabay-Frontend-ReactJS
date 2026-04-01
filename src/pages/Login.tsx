import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/hero_angkor.png";

type Tab = "login" | "register";

const GENDERS = ["Male", "Female", "Other"];

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("Male");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(fullName, regEmail, contactNumber, gender, regPassword);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroImg} alt="Cambodia Travel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-xl font-outfit">Soksabay Go</h2>
          <p className="text-xl text-white/90 max-w-md font-light leading-relaxed drop-shadow-lg">
            Experience the majesty of Cambodia with our premium touring and transport services.
          </p>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden text-center">
            <h1 className="text-3xl font-extrabold text-blue-600 font-outfit">Soksabay Go</h1>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 p-8 border border-white">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 font-outfit text-center">
                {tab === "login" ? "Welcome Back" : "Join the Journey"}
              </h2>
              <p className="text-slate-500 text-sm mt-2 text-center">
                {tab === "login" ? "Enter your details to access your dashboard" : "Create an account to start booking trips"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-8">
              <button
                onClick={() => { setTab("login"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${tab === "login" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setTab("register"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${tab === "register" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <ModernInputField label="Email Address" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="name@example.com" icon={<EmailIcon />} />
                <ModernInputField label="Password" type="password" value={loginPassword} onChange={setLoginPassword} placeholder="••••••••" icon={<LockIcon />} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ModernInputField label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="Sue Chan" />
                  <ModernInputField label="Phone" type="tel" value={contactNumber} onChange={setContactNumber} placeholder="098..." />
                </div>
                <ModernInputField label="Email" type="email" value={regEmail} onChange={setRegEmail} placeholder="name@example.com" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none appearance-none"
                  >
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ModernInputField label="Password" type="password" value={regPassword} onChange={setRegPassword} placeholder="••••" />
                  <ModernInputField label="Confirm" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <span className="relative bg-white px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">or</span>
            </div>

            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 text-slate-700 font-bold rounded-2xl shadow-sm transition-all"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Need help? <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Contact Support</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const ModernInputField = ({ label, type, value, onChange, placeholder, icon }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group">
      {icon && <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className={`w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none`}
      />
    </div>
  </div>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default Login;
