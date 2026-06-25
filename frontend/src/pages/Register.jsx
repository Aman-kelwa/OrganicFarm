import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Leaf,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sprout,
  ShoppingBasket,
  Loader2,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Register = () => {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

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

  const handleGoogle = async (credentialResponse) => {
    setError("");
    try {
      const res = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google sign-up failed. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2E7] text-[#2B2620] font-[DM_Sans,sans-serif] grid lg:grid-cols-2">
      {/* ---------------------------------------------------------------- */}
      {/* LEFT — brand / atmosphere panel                                  */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative hidden lg:flex flex-col justify-between bg-[#1F2E1A] text-[#F7F2E7] px-12 py-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_2px_2px,#fff_1px,transparent_0)] bg-[length:26px_26px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 w-[420px] h-[420px] rounded-full bg-[#4A7C3F]/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-[-10%] w-[320px] h-[320px] rounded-full bg-[#D9A441]/20 blur-3xl"
        />

        <Link to="/" className="relative flex items-center gap-2 group w-fit">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-[#D9A441] text-[#1F2E1A] group-hover:rotate-12 transition-transform duration-300">
            <Leaf size={18} strokeWidth={2.4} />
          </span>
          <span className="font-[Fraunces,serif] text-xl tracking-tight">
            Organic<span className="text-[#D9A441]">Farm</span>
          </span>
        </Link>

        <div className="relative">
          <span className="text-xs font-semibold tracking-wide uppercase font-[JetBrains_Mono,monospace] text-[#D9A441]">
            Join the field
          </span>
          <h1 className="mt-4 font-[Fraunces,serif] text-4xl leading-[1.1] max-w-sm">
            Where farmers and buyers meet,{" "}
            <span className="italic text-[#D9A441]">no middlemen.</span>
          </h1>
          <p className="mt-5 text-[#F7F2E7]/65 max-w-sm leading-relaxed">
            Create an account to list your harvest or start sourcing fresh,
            fairly-priced produce straight from the source.
          </p>
        </div>

        <div className="relative flex items-center gap-8">
          {[
            ["12K+", "Verified farmers"],
            ["4,500+", "Live listings"],
            ["0%", "Hidden fees"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="font-[Fraunces,serif] text-2xl text-[#D9A441]">
                {num}
              </div>
              <div className="text-xs text-[#F7F2E7]/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* RIGHT — form panel                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center justify-center px-5 sm:px-8 py-16">
        <div className="w-full max-w-md animate-[riseIn_0.6s_ease-out]">
          {/* mobile-only brand mark */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-2 justify-center mb-8 group"
          >
            <span className="grid place-items-center w-9 h-9 rounded-full bg-[#1F2E1A] text-[#D9A441] group-hover:rotate-12 transition-transform duration-300">
              <Leaf size={18} strokeWidth={2.4} />
            </span>
            <span className="font-[Fraunces,serif] text-xl tracking-tight">
              Organic<span className="text-[#C97B3D]">Farm</span>
            </span>
          </Link>

          <h2 className="font-[Fraunces,serif] text-3xl sm:text-[2.25rem] leading-tight">
            Create your account
          </h2>
          <p className="mt-2 text-[#2B2620]/60">
            Already growing with us?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#1F2E1A] hover:text-[#C97B3D] transition-colors"
            >
              Log in
            </Link>
          </p>

          {error && (
            <div className="mt-6 text-sm text-[#9A3324] bg-[#9A3324]/10 border border-[#9A3324]/20 rounded-xl px-4 py-3 animate-[shake_0.4s_ease-in-out]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* name */}
            <div className="group relative flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3.5 ring-1 ring-[#2B2620]/10 focus-within:ring-2 focus-within:ring-[#4A7C3F] transition-all">
              <User size={18} className="text-[#2B2620]/35 shrink-0" />
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-transparent outline-none text-[15px] placeholder:text-[#2B2620]/40"
              />
            </div>

            {/* email */}
            <div className="group relative flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3.5 ring-1 ring-[#2B2620]/10 focus-within:ring-2 focus-within:ring-[#4A7C3F] transition-all">
              <Mail size={18} className="text-[#2B2620]/35 shrink-0" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent outline-none text-[15px] placeholder:text-[#2B2620]/40"
              />
            </div>

            {/* password */}
            <div className="group relative flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3.5 ring-1 ring-[#2B2620]/10 focus-within:ring-2 focus-within:ring-[#4A7C3F] transition-all">
              <Lock size={18} className="text-[#2B2620]/35 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-transparent outline-none text-[15px] placeholder:text-[#2B2620]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#2B2620]/35 hover:text-[#2B2620]/70 transition-colors shrink-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* role selector */}
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase font-[JetBrains_Mono,monospace] text-[#2B2620]/45 mb-2.5">
                I'm joining as
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("buyer")}
                  className={`flex flex-col items-start gap-2 rounded-2xl px-4 py-3.5 text-left ring-1 transition-all duration-200 ${
                    formData.role === "buyer"
                      ? "bg-[#1F2E1A] text-[#F7F2E7] ring-[#1F2E1A]"
                      : "bg-white text-[#2B2620] ring-[#2B2620]/10 hover:ring-[#4A7C3F]/40"
                  }`}
                >
                  <ShoppingBasket
                    size={18}
                    className={
                      formData.role === "buyer"
                        ? "text-[#D9A441]"
                        : "text-[#4A7C3F]"
                    }
                  />
                  <span className="text-sm font-semibold">Buyer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("seller")}
                  className={`flex flex-col items-start gap-2 rounded-2xl px-4 py-3.5 text-left ring-1 transition-all duration-200 ${
                    formData.role === "seller"
                      ? "bg-[#1F2E1A] text-[#F7F2E7] ring-[#1F2E1A]"
                      : "bg-white text-[#2B2620] ring-[#2B2620]/10 hover:ring-[#4A7C3F]/40"
                  }`}
                >
                  <Sprout
                    size={18}
                    className={
                      formData.role === "seller"
                        ? "text-[#D9A441]"
                        : "text-[#4A7C3F]"
                    }
                  />
                  <span className="text-sm font-semibold">Seller</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-2 px-6 py-3.5 rounded-full bg-[#C97B3D] text-white font-semibold hover:bg-[#B56A30] active:scale-[0.98] transition-all duration-200 shadow-[0_8px_20px_rgba(201,123,61,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-7">
            <span className="h-px flex-1 bg-[#2B2620]/10" />
            <span className="text-xs text-[#2B2620]/40 font-[JetBrains_Mono,monospace]">
              OR
            </span>
            <span className="h-px flex-1 bg-[#2B2620]/10" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() =>
                setError("Google sign-up failed. Please try again.")
              }
            />
          </div>

          <p className="mt-8 text-center text-xs text-[#2B2620]/40 leading-relaxed">
            By creating an account, you agree to OrganicFarm's Terms of Service
            and Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default Register;
