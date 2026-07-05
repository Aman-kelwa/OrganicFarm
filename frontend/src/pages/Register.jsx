import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  ShoppingBasket,
  Sprout,
  ArrowRight,
  CheckCircle2,
  Wheat,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ── floating particle (same as Login) ── */
function Particle({ style }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-[#5C9E31]/40 animate-[floatUp_var(--dur)_linear_infinite]"
      style={style}
    />
  );
}

/* ── left panel animated background ── */
function FieldBG() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 5.8 + 3) % 100}%`,
    "--dur": `${4 + (i % 5)}s`,
    animationDelay: `${(i * 0.4) % 4}s`,
    bottom: "-10px",
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#061008] via-[#040c06] to-[#020804]" />
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#1a4a0d]/50 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20  w-[400px] h-[400px] rounded-full bg-[#0d2e06]/60 blur-[80px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#5C9E31]/5 blur-[60px]" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1.5px_1.5px,#6abf3e_1px,transparent_0)] bg-[length:28px_28px]" />
      {particles.map((s, i) => (
        <Particle key={i} style={s} />
      ))}
    </div>
  );
}

/* ── custom input ── */
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
export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRoleSelect = (role) => setFormData((prev) => ({ ...prev, role }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      navigate("/login", {
        state: {
          message: res.data.message || "Account created. Please log in.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ════════ RENDER ════════ */
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-['Inter',sans-serif]">
      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="relative hidden lg:flex flex-col justify-between px-14 py-12 pt-28 overflow-hidden">
        <FieldBG />

        {/* center content */}
        <div className="relative">
          <Wheat
            size={120}
            strokeWidth={0.5}
            className="text-[#5C9E31]/10 mb-6 -ml-2"
          />

          <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-4">
            Join the field
          </p>
          <h1 className="font-['Playfair_Display',serif] text-5xl font-black leading-[1.05] text-white mb-6">
            Where farmers
            <br />
            and buyers
            <br />
            <span className="italic text-[#A8E063]">meet direct.</span>
          </h1>
          <p className="text-white/40 max-w-sm leading-relaxed text-[15px]">
            Create an account to list your harvest or start sourcing fresh,
            fairly-priced produce straight from the source. No middlemen, ever.
          </p>

          {/* feature list */}
          <div className="mt-10 space-y-3">
            {[
              "List crops, dairy, seeds and tools",
              "Secure Razorpay payments",
              "Real-time order tracking",
              "Zero hidden commissions",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full bg-[#5C9E31]/20 border border-[#5C9E31]/40
                  grid place-items-center shrink-0"
                >
                  <CheckCircle2 size={11} className="text-[#A8E063]" />
                </span>
                <span className="text-sm text-white/50">{f}</span>
              </div>
            ))}
          </div>

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
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#5C9E31]/6 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0  w-60 h-60 rounded-full bg-[#5C9E31]/4 blur-[60px] pointer-events-none" />

        <div className="relative w-full max-w-md animate-[riseIn_0.6s_ease-out]">
          {/* heading */}
          <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-3">
            Sign up
          </p>
          <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
            Create your account
          </h2>
          <p className="text-white/40 text-sm mb-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#A8E063] font-semibold hover:text-white transition-colors"
            >
              Log in
            </Link>
          </p>

          {/* error */}
          {error && (
            <div
              className="text-sm text-red-400 bg-red-500/8 border border-red-500/20
              rounded-xl px-4 py-3 mb-5 animate-[shake_0.4s_ease-in-out]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* name */}
            <InputField
              icon={User}
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* email */}
            <InputField
              icon={Mail}
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* password */}
            <InputField
              icon={Lock}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
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

            {/* role picker */}
            <div>
              <p
                className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest
                text-white/30 mb-3"
              >
                I'm joining as
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* BUYER */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("buyer")}
                  className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border
                    text-left transition-all duration-200 overflow-hidden
                    ${
                      formData.role === "buyer"
                        ? "bg-[#5C9E31]/15 border-[#5C9E31]/50 shadow-[0_0_20px_rgba(92,158,49,0.12)]"
                        : "bg-white/[0.04] border-white/10 hover:border-white/22 hover:bg-white/[0.07]"
                    }`}
                >
                  <span
                    className={`grid place-items-center w-9 h-9 rounded-xl transition-colors ${
                      formData.role === "buyer"
                        ? "bg-[#5C9E31]/25 text-[#A8E063]"
                        : "bg-white/8 text-white/40"
                    }`}
                  >
                    <ShoppingBasket size={18} />
                  </span>
                  <div>
                    <p
                      className={`font-semibold text-sm ${formData.role === "buyer" ? "text-[#A8E063]" : "text-white/75"}`}
                    >
                      Buyer
                    </p>
                    <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">
                      Browse and buy directly from farmers
                    </p>
                  </div>
                  {formData.role === "buyer" && (
                    <span
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#5C9E31]
                      grid place-items-center shadow-[0_0_10px_rgba(92,158,49,0.6)]"
                    >
                      <CheckCircle2 size={11} className="text-white" />
                    </span>
                  )}
                </button>

                {/* SELLER */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("seller")}
                  className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border
                    text-left transition-all duration-200 overflow-hidden
                    ${
                      formData.role === "seller"
                        ? "bg-amber-500/12 border-amber-500/45 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                        : "bg-white/[0.04] border-white/10 hover:border-white/22 hover:bg-white/[0.07]"
                    }`}
                >
                  <span
                    className={`grid place-items-center w-9 h-9 rounded-xl transition-colors ${
                      formData.role === "seller"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-white/8 text-white/40"
                    }`}
                  >
                    <Sprout size={18} />
                  </span>
                  <div>
                    <p
                      className={`font-semibold text-sm ${formData.role === "seller" ? "text-amber-400" : "text-white/75"}`}
                    >
                      Seller
                    </p>
                    <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">
                      List your harvest and earn more
                    </p>
                  </div>
                  {formData.role === "seller" && (
                    <span
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500
                      grid place-items-center shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    >
                      <CheckCircle2 size={11} className="text-white" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className={`group w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                font-bold text-[15px] text-white transition-all active:scale-[0.98]
                disabled:opacity-50
                ${
                  formData.role === "seller"
                    ? "bg-amber-500 hover:bg-amber-600 shadow-[0_0_28px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]"
                    : "bg-[#5C9E31] hover:bg-[#4e8a28] shadow-[0_0_28px_rgba(92,158,49,0.4)] hover:shadow-[0_0_40px_rgba(92,158,49,0.6)]"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Creating
                  account…
                </>
              ) : (
                <>
                  {formData.role === "seller"
                    ? "Join as Seller"
                    : "Join as Buyer"}
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/20 mt-8 leading-relaxed">
            By creating an account you agree to OrganicFarm's{" "}
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
          0%   { transform:translateY(0) scale(1);    opacity:0; }
          10%  { opacity:0.6; }
          90%  { opacity:0.2; }
          100% { transform:translateY(-100vh) scale(0.5); opacity:0; }
        }
      `}</style>
    </div>
  );
}
