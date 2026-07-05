import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Wheat,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ── floating particle ── */
function Particle({ style }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-[#5C9E31]/40 animate-[floatUp_var(--dur)_linear_infinite]"
      style={style}
    />
  );
}

/* ── animated field background ── */
function FieldBG() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 5.8 + 3) % 100}%`,
    "--dur": `${4 + (i % 5)}s`,
    animationDelay: `${(i * 0.4) % 4}s`,
    bottom: "-10px",
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#061008] via-[#040c06] to-[#020804]" />
      {/* radial glow top-left */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#1a4a0d]/50 blur-[100px]" />
      {/* radial glow bottom-right */}
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#0d2e06]/60 blur-[80px]" />
      {/* mid accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#5C9E31]/5 blur-[60px]" />
      {/* dot grid */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1.5px_1.5px,#6abf3e_1px,transparent_0)] bg-[length:28px_28px]" />
      {/* particles */}
      {particles.map((s, i) => (
        <Particle key={i} style={s} />
      ))}
    </div>
  );
}

/* ── input field ── */
function InputField({ icon: Icon, rightEl, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl px-4 py-3.5 border
      transition-all duration-300 bg-white/[0.04]
      ${
        focused
          ? "border-[#5C9E31]/60 shadow-[0_0_0_3px_rgba(92,158,49,0.12)] bg-white/[0.07]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <Icon
        size={17}
        className={`shrink-0 transition-colors ${focused ? "text-[#A8E063]" : "text-white/30"}`}
      />
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent outline-none text-[15px] text-white placeholder:text-white/25"
      />
      {rightEl}
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const successMessage = location.state?.message;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.user, res.data.token);
      navigate(
        res.data.user.role === "buyer"
          ? "/buyer-dashboard"
          : "/seller-dashboard",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ════════ RENDER ════════ */
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-['Inter',sans-serif]">
      {/* ══════════════════════════════════════
          LEFT PANEL — dark green cinematic
      ══════════════════════════════════════ */}
      <div className="relative hidden lg:flex flex-col justify-between px-14 py-12 pt-28 overflow-hidden">
        <FieldBG />

        {/* center text */}
        <div className="relative">
          {/* large decorative wheat */}
          <Wheat
            size={120}
            strokeWidth={0.5}
            className="text-[#5C9E31]/10 mb-6 -ml-2"
          />

          <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-4">
            Welcome back
          </p>
          <h1 className="font-['Playfair_Display',serif] text-5xl font-black leading-[1.05] text-white mb-6">
            Good to see
            <br />
            you in the
            <br />
            <span className="italic text-[#A8E063]">field again.</span>
          </h1>
          <p className="text-white/40 max-w-sm leading-relaxed text-[15px]">
            Track your orders, manage listings and keep the harvest moving —
            straight from grower to buyer.
          </p>

          {/* divider */}
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-[#5C9E31]/40 to-transparent" />
          </div>
        </div>

        {/* bottom stats */}
        <div className="relative grid grid-cols-3 gap-0 rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden">
          {[
            { n: "12K+", l: "Verified Farmers" },
            { n: "4,500+", l: "Live Listings" },
            { n: "₹0", l: "Hidden Fees" },
          ].map(({ n, l }, i) => (
            <div
              key={l}
              className={`px-5 py-4 text-center ${i < 2 ? "border-r border-white/6" : ""}`}
            >
              <p className="font-['Playfair_Display',serif] text-2xl font-bold text-[#A8E063]">
                {n}
              </p>
              <p className="text-[11px] text-white/35 mt-1 font-['Space_Mono',monospace]">
                {l}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — form
      ══════════════════════════════════════ */}
      <div
        className="relative flex items-center justify-center px-5 sm:px-10 py-12 pt-28
        bg-[#060A06] overflow-hidden"
      >
        {/* subtle right-panel glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#5C9E31]/6 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0  w-60 h-60 rounded-full bg-[#5C9E31]/4 blur-[60px] pointer-events-none" />

        <div className="relative w-full max-w-md animate-[riseIn_0.6s_ease-out]">
          {/* heading */}
          <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-3">
            Login
          </p>
          <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
            Welcome back
          </h2>
          <p className="text-white/40 text-sm mb-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#A8E063] font-semibold hover:text-white transition-colors"
            >
              Create one free
            </Link>
          </p>

          {/* success banner */}
          {successMessage && (
            <div
              className="flex items-center gap-2.5 text-sm text-[#A8E063] bg-[#5C9E31]/10
              border border-[#5C9E31]/25 rounded-xl px-4 py-3 mb-5 animate-[riseIn_0.4s_ease-out]"
            >
              <CheckCircle2 size={15} className="shrink-0" />
              {successMessage}
            </div>
          )}

          {/* error banner */}
          {error && (
            <div
              className="text-sm text-red-400 bg-red-500/8 border border-red-500/20
              rounded-xl px-4 py-3 mb-5 animate-[shake_0.4s_ease-in-out]"
            >
              {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={Mail}
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <InputField
              icon={Lock}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-white/35 hover:text-[#A8E063] transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                bg-[#5C9E31] hover:bg-[#4e8a28] text-white font-bold text-[15px]
                transition-all active:scale-[0.98] disabled:opacity-50
                shadow-[0_0_28px_rgba(92,158,49,0.4)] hover:shadow-[0_0_40px_rgba(92,158,49,0.6)]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Logging in…
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </>
              )}
            </button>
          </form>

          {/* footer */}
          <p className="text-center text-xs text-white/20 mt-8 leading-relaxed">
            By logging in you agree to OrganicFarm's{" "}
            <span className="text-white/35 hover:text-white/60 cursor-pointer transition-colors">
              Terms
            </span>
            {" & "}
            <span className="text-white/35 hover:text-white/60 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          25%      { transform:translateX(-5px); }
          75%      { transform:translateX(5px); }
        }
        @keyframes floatUp {
          0%   { transform:translateY(0)    scale(1);   opacity:0; }
          10%  { opacity:0.6; }
          90%  { opacity:0.2; }
          100% { transform:translateY(-100vh) scale(0.5); opacity:0; }
        }
      `}</style>
    </div>
  );
}
