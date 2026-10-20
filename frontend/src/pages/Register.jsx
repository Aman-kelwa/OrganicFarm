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

/* ════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   (same names as the other pages — move them into one
   shared file, e.g. src/styles/ui.js, and import them)
   ════════════════════════════════════════════════════ */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2";
const CARD = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const BTN = `inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-[#2E7D32] text-white hover:bg-[#256628] disabled:opacity-60 disabled:cursor-not-allowed`;

/* ── custom input ── */
function InputField({ icon: Icon, rightEl, ...props }) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-xl border border-[#D5DBD0] bg-white pl-4 pr-1 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[#2E7D32] focus-within:ring-offset-2">
      <Icon size={17} aria-hidden="true" className="shrink-0 text-[#7A8576]" />
      <input
        aria-label={props["aria-label"] ?? props.placeholder}
        {...props}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#1F2A1C] outline-none placeholder:text-[#7A8576]"
      />
      {rightEl ?? <span className="w-3 shrink-0" />}
    </div>
  );
}

/* ── role option card ── */
function RoleOption({ selected, onSelect, icon: Icon, title, description }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 ${FOCUS} ${
        selected
          ? "border-[#2E7D32] bg-[#EAF4E6]"
          : "border-[#E4E8E1] bg-white hover:bg-[#F6F8F4]"
      }`}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl text-[#2E7D32] ${
          selected ? "bg-white" : "bg-[#EAF4E6]"
        }`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-[#1F2A1C]">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#5B6559]">
          {description}
        </p>
      </div>
      {selected && (
        <CheckCircle2
          size={18}
          aria-hidden="true"
          className="absolute right-3 top-3 text-[#2E7D32]"
        />
      )}
    </button>
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
    <div className="grid min-h-screen bg-white font-['Inter',sans-serif] text-[#1F2A1C] lg:grid-cols-2">
      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="hidden flex-col justify-between border-r border-[#E4E8E1] bg-[#F6F8F4] px-14 pb-12 pt-28 lg:flex xl:px-20">
        <div className="animate-[riseIn_0.6s_ease-out_both] motion-reduce:animate-none">
          <span className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
            <Wheat size={24} aria-hidden="true" />
          </span>

          <p className="mb-2 text-sm font-semibold text-[#2E7D32]">
            Join the field
          </p>
          <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
            Where farmers and buyers meet direct.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-[#5B6559]">
            Create an account to list your harvest or start sourcing fresh,
            fairly-priced produce straight from the source. No middlemen, ever.
          </p>

          {/* feature list */}
          <ul className="mt-8 space-y-3">
            {[
              "List crops, dairy, seeds and tools",
              "Secure Razorpay payments",
              "Real-time order tracking",
              "Zero hidden commissions",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EAF4E6] text-[#2E7D32]">
                  <CheckCircle2 size={14} aria-hidden="true" />
                </span>
                <span className="text-sm text-[#5B6559]">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* bottom stats */}
        <div className={`${CARD} mt-10 grid grid-cols-3 overflow-hidden`}>
          {[
            { n: "12K+", l: "Verified farmers" },
            { n: "4,500+", l: "Live listings" },
            { n: "₹0", l: "Hidden fees" },
          ].map(({ n, l }, i) => (
            <div
              key={l}
              className={`px-4 py-5 text-center ${i < 2 ? "border-r border-[#E4E8E1]" : ""}`}
            >
              <p className="text-2xl font-bold">{n}</p>
              <p className="mt-1 text-sm text-[#5B6559]">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — form
      ══════════════════════════════════════ */}
      <div className="flex items-center justify-center bg-white px-5 pb-12 pt-28 sm:px-10">
        <div className="w-full max-w-md animate-[riseIn_0.6s_ease-out_both] motion-reduce:animate-none">
          {/* heading */}
          <p className="mb-2 text-sm font-semibold text-[#2E7D32]">Sign up</p>
          <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Create your account
          </h2>
          <p className="mb-8 text-sm text-[#5B6559]">
            Already have an account?{" "}
            <Link
              to="/login"
              className={`rounded font-semibold text-[#2E7D32] transition-colors duration-200 hover:text-[#256628] ${FOCUS}`}
            >
              Log in
            </Link>
          </p>

          {/* error */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
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
              autoComplete="name"
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
              autoComplete="email"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#7A8576] transition-colors duration-200 hover:bg-[#F6F8F4] hover:text-[#1F2A1C] ${FOCUS}`}
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              }
            />

            {/* role picker */}
            <div>
              <p id="role-label" className="mb-3 text-sm font-semibold">
                I’m joining as
              </p>
              <div
                role="radiogroup"
                aria-labelledby="role-label"
                className="grid grid-cols-2 gap-3"
              >
                <RoleOption
                  selected={formData.role === "buyer"}
                  onSelect={() => handleRoleSelect("buyer")}
                  icon={ShoppingBasket}
                  title="Buyer"
                  description="Browse and buy directly from farmers"
                />
                <RoleOption
                  selected={formData.role === "seller"}
                  onSelect={() => handleRoleSelect("seller")}
                  icon={Sprout}
                  title="Seller"
                  description="List your harvest and earn more"
                />
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className={`${BTN_PRIMARY} group w-full`}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />{" "}
                  Creating account…
                </>
              ) : (
                <>
                  {formData.role === "seller"
                    ? "Join as Seller"
                    : "Join as Buyer"}
                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-[#7A8576]">
            By creating an account you agree to OrganicFarm’s{" "}
            <span className="font-semibold text-[#5B6559]">Terms</span>
            {" & "}
            <span className="font-semibold text-[#5B6559]">Privacy Policy</span>
            .
          </p>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
