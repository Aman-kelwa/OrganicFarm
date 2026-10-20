/*
  OrganicFarm – Login (Design System v2: light & simple)
  Same tokens and patterns as the other pages:
  white #FFFFFF · soft #F6F8F4 · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
  Fonts (index.html): Inter only
*/

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

/* ─── shared style primitives ─── */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-12 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;

const HERO_IMG =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=80";

/* ── input field ── */
function InputField({ icon: Icon, rightEl, label, ...props }) {
  return (
    <label
      className="flex items-center gap-3 h-12 rounded-xl px-4 border border-[#D5DBD0] bg-white
        transition-colors duration-200
        focus-within:border-[#2E7D32] focus-within:ring-2 focus-within:ring-[#2E7D32]/20
        hover:border-[#2E7D32]/50"
    >
      <span className="sr-only">{label}</span>
      <Icon size={17} aria-hidden="true" className="shrink-0 text-[#7A8576]" />
      <input
        {...props}
        className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-[#1F2A1C] placeholder:text-[#7A8576]"
      />
      {rightEl}
    </label>
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
    <div className="min-h-screen grid lg:grid-cols-2 font-['Inter',sans-serif] text-[#1F2A1C]">
      {/* ══════════════════════════════════════
          LEFT PANEL — soft green welcome
      ══════════════════════════════════════ */}
      <div className="relative hidden lg:flex flex-col justify-between gap-8 px-14 pb-12 pt-28 bg-[#EAF4E6] border-r border-[#E4E8E1]">
        <div>
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-white text-[#2E7D32] border border-[#E4E8E1] mb-6">
            <Wheat size={22} aria-hidden="true" />
          </span>

          <p className="text-sm font-semibold text-[#2E7D32] mb-3">
            Welcome back
          </p>
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight mb-5">
            Good to see you
            <br />
            in the field again.
          </h1>
          <p className="text-[#5B6559] max-w-sm leading-relaxed text-[15px]">
            Track your orders, manage listings and keep the harvest moving —
            straight from grower to buyer.
          </p>
        </div>

        {/* farm photo */}
        <div className="h-56 xl:h-64 rounded-2xl overflow-hidden border border-[#D5DBD0] bg-white/60">
          <img
            src={HERO_IMG}
            alt="Farm field at golden hour"
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>

        {/* bottom stats */}
        <div className="grid grid-cols-3 rounded-2xl bg-white border border-[#E4E8E1] shadow-sm overflow-hidden">
          {[
            { n: "12K+", l: "Verified Farmers" },
            { n: "4,500+", l: "Live Listings" },
            { n: "₹0", l: "Hidden Fees" },
          ].map(({ n, l }, i) => (
            <div
              key={l}
              className={`px-5 py-4 text-center ${i < 2 ? "border-r border-[#E4E8E1]" : ""}`}
            >
              <p className="text-2xl font-bold text-[#1F2A1C]">{n}</p>
              <p className="text-xs text-[#5B6559] mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — form
      ══════════════════════════════════════ */}
      <div className="flex items-center justify-center px-5 sm:px-10 py-12 pt-28 bg-white">
        <div className="w-full max-w-md animate-[riseIn_0.5s_ease-out] motion-reduce:animate-none">
          {/* heading */}
          <p className="text-sm font-semibold text-[#2E7D32] mb-2">Login</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-2">
            Welcome back
          </h2>
          <p className="text-[#5B6559] text-sm mb-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className={`text-[#2E7D32] font-semibold hover:text-[#256628] transition-colors duration-200 rounded ${focusRing}`}
            >
              Create one free
            </Link>
          </p>

          {/* success banner */}
          {successMessage && (
            <div
              role="status"
              className="flex items-center gap-2.5 text-sm font-medium text-[#256628] bg-[#EAF4E6]
              border border-[#2E7D32]/25 rounded-xl px-4 py-3 mb-5 animate-[riseIn_0.4s_ease-out] motion-reduce:animate-none"
            >
              <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
              {successMessage}
            </div>
          )}

          {/* error banner */}
          {error && (
            <div
              role="alert"
              className="text-sm font-medium text-red-700 bg-red-50 border border-red-200
              rounded-xl px-4 py-3 mb-5 animate-[shake_0.4s_ease-in-out] motion-reduce:animate-none"
            >
              {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={Mail}
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <InputField
              icon={Lock}
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className={`shrink-0 text-[#7A8576] hover:text-[#1F2A1C] transition-colors duration-200 rounded ${focusRing}`}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link
                to="/register"
                className={`text-[13px] text-[#5B6559] hover:text-[#2E7D32] transition-colors duration-200 font-medium rounded ${focusRing}`}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} group w-full disabled:opacity-60`}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin motion-reduce:animate-none"
                  />{" "}
                  Logging in…
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition-transform duration-200 motion-reduce:transition-none"
                  />
                </>
              )}
            </button>
          </form>

          {/* footer */}
          <p className="text-center text-xs text-[#5B6559] mt-8 leading-relaxed">
            By logging in you agree to OrganicFarm's Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          25%      { transform:translateX(-5px); }
          75%      { transform:translateX(5px); }
        }
      `}</style>
    </div>
  );
}
