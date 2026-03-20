import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Tab = "login" | "register";

const GENDERS = ["Male", "Female", "Other"];

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
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
      navigate("/dashboard");
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
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Soksabay Go</h1>
            <p className="text-white/50 text-sm mt-1">Your premium touring experience</p>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 mb-6 p-1 bg-white/5 rounded-2xl border border-white/10">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all duration-300 ${tab === t
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-white/40 hover:text-white/70"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="px-8 pb-10">
            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* LOGIN FORM */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  placeholder="you@example.com"
                  icon={<EmailIcon />}
                />
                <InputField
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="••••••••"
                  icon={<LockIcon />}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner text="Signing in..." /> : "Sign In"}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3">
                <InputField
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Sue Chan"
                  icon={<UserIcon />}
                />
                <InputField
                  label="Email"
                  type="email"
                  value={regEmail}
                  onChange={setRegEmail}
                  placeholder="you@example.com"
                  icon={<EmailIcon />}
                />
                <InputField
                  label="Contact Number"
                  type="tel"
                  value={contactNumber}
                  onChange={setContactNumber}
                  placeholder="098XXXXXXX"
                  icon={<PhoneIcon />}
                />
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    style={{ colorScheme: "dark" }}
                  >
                    {GENDERS.map((g) => <option key={g} value={g} className="bg-slate-800">{g}</option>)}
                  </select>
                </div>
                <InputField
                  label="Password"
                  type="password"
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="Min. 6 characters"
                  icon={<LockIcon />}
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat password"
                  icon={<LockIcon />}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner text="Creating account..." /> : "Create Account"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google OAuth2 */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <p className="text-center text-white/30 text-xs mt-6">
              By continuing, you agree to our{" "}
              <span className="text-purple-400 cursor-pointer hover:text-purple-300">Terms</span> &{" "}
              <span className="text-purple-400 cursor-pointer hover:text-purple-300">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reusable Input ───────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, placeholder, icon }) => (
  <div>
    <label className="block text-xs font-medium text-white/60 mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
      />
    </div>
  </div>
);

const Spinner = ({ text }: { text: string }) => (
  <span className="flex items-center justify-center gap-2">
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    {text}
  </span>
);

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
  </svg>
);

export default Login;
