/*
  OrganicFarm – Home (Design System v2: light & simple)

  TOKENS (use these exact values on every page)
  ─ Page background ... #FFFFFF
  ─ Soft background ... #F6F8F4   (alternate sections, footer, stats bar)
  ─ Soft green ........ #EAF4E6   (icon chips, quote band)
  ─ Border ............ #E4E8E1   (strong: #D5DBD0)
  ─ Text .............. #1F2A1C   · muted #5B6559 · subtle #7A8576
  ─ Primary ........... #2E7D32   (hover #256628, text on it: white)
  ─ Rating star ....... #F59E0B   (ratings only)
  RADII: cards rounded-2xl · buttons/inputs rounded-xl · pills rounded-full
  TYPE: Inter only. Headings bold, body regular.
  SHADOW: shadow-sm at rest, shadow-md on hover (cards only).
  MOTION: 200ms hover/press, 600ms scroll reveal. Disabled under reduced motion.

  Font (index.html):
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
*/

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Search,
  Star,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  HandCoins,
  Truck,
  ChevronRight,
  MapPin,
  TrendingUp,
  Wheat,
  Milk,
  Sprout,
  Tractor,
  ShoppingCart,
} from "lucide-react";

/* ─── real Unsplash images (free to embed, no key needed) ─── */
const IMGS = {
  hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&auto=format&fit=crop&q=80",
  rice: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=80",
  wheat:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
  tractor:
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80",
  tomatoes:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
  dairy:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80",
  seeds:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80",
  farmer:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop&q=80",
  market:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
};

/* ─── shared style primitives (candidates to move into shared components) ─── */
const container = "max-w-7xl mx-auto px-5 sm:px-8";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-6 h-12 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const btnOutline = `${btn} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;

const card = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const sectionLabel = "text-sm font-semibold text-[#2E7D32] mb-2";
const sectionTitle =
  "text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-[#1F2A1C]";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── auth-aware destinations ─── */
const SELLER_HOME = "/seller-dashboard"; // ← change to your seller landing route

const getAuth = () => {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }
  return { loggedIn: !!token, role: user?.role ?? null };
};

/* ─── animated count-up hook ─── */
function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setVal(target);
      return;
    }
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

/* ─── intersection reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "", from = "bottom" }) {
  const [ref, visible] = useReveal();
  const translate =
    from === "left"
      ? "-translate-x-4"
      : from === "right"
        ? "translate-x-4"
        : "translate-y-4";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${translate}`} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── stat with count-up ─── */
function StatCard({ num, suffix = "", label }) {
  const [ref, visible] = useReveal();
  const count = useCountUp(num, 1600, visible);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-[#1F2A1C]">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-[#5B6559]">{label}</p>
    </div>
  );
}

/* ─── listings ─── */
const LISTINGS = [
  {
    title: "Organic Basmati Rice",
    seller: "Harpreet Singh",
    location: "Punjab",
    price: "₹68",
    unit: "/kg",
    tag: "Crop",
    rating: 4.8,
    image: IMGS.rice,
    color: "from-amber-900/60",
  },
  {
    title: "A2 Desi Cow Milk",
    seller: "Lakshmi Dairy",
    location: "Mysuru",
    price: "₹72",
    unit: "/L",
    tag: "Dairy",
    rating: 4.9,
    image: IMGS.dairy,
    color: "from-sky-900/60",
  },
  {
    title: "Hybrid Tomato Seeds",
    seller: "GreenRoot Agro",
    location: "Nashik",
    price: "₹140",
    unit: "/pkt",
    tag: "Seeds",
    rating: 4.6,
    image: IMGS.seeds,
    color: "from-rose-900/60",
  },
  {
    title: "Mini Power Tiller",
    seller: "Rana Equipment",
    location: "Haryana",
    price: "₹650",
    unit: "/day",
    tag: "Rental",
    rating: 4.7,
    image: IMGS.tractor,
    color: "from-slate-900/60",
  },
  {
    title: "Fresh Wheat Grain",
    seller: "Suresh Farms",
    location: "MP",
    price: "₹32",
    unit: "/kg",
    tag: "Crop",
    rating: 4.5,
    image: IMGS.wheat,
    color: "from-yellow-900/60",
  },
  {
    title: "Farm Fresh Tomatoes",
    seller: "Priya Organics",
    location: "Pune",
    price: "₹45",
    unit: "/kg",
    tag: "Crop",
    rating: 4.7,
    image: IMGS.tomatoes,
    color: "from-red-900/60",
  },
];

const CATEGORIES = [
  { label: "All", icon: null },
  { label: "Crops", icon: Wheat },
  { label: "Dairy", icon: Milk },
  { label: "Seeds", icon: Sprout },
  { label: "Rentals", icon: Tractor },
];

/* tag badges: light tints with readable dark text */
const TAG_COLOR = {
  Crop: "bg-amber-50 text-amber-800 border-amber-200",
  Dairy: "bg-sky-50 text-sky-800 border-sky-200",
  Seeds: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Rental: "bg-slate-100 text-slate-700 border-slate-200",
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

  /* where "Start Selling" / "Sell Now" go:
     logged out → register · seller → seller home · other roles → listings */
  const { loggedIn, role } = getAuth();
  const sellPath = !loggedIn
    ? "/register"
    : role === "seller"
      ? SELLER_HOME
      : "/listings";

  const [search, setSearch] = useState("");
  const [activeCategory, setActive] = useState("All");

  const filtered =
    activeCategory === "All"
      ? LISTINGS
      : LISTINGS.filter(
          (l) =>
            l.tag
              .toLowerCase()
              .startsWith(activeCategory.slice(0, -1).toLowerCase()) ||
            l.tag === activeCategory.replace("s", ""),
        );

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      search.trim()
        ? `/listings?keyword=${encodeURIComponent(search.trim())}`
        : "/listings",
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#1F2A1C] font-['Inter',sans-serif] overflow-x-hidden">
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="bg-[#F6F8F4] pt-28 pb-16 sm:pb-20">
        <div
          className={`${container} grid lg:grid-cols-2 items-center gap-10 lg:gap-14`}
        >
          <div className="animate-[heroIn_0.6s_ease-out_both] motion-reduce:animate-none">
            <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF4E6] text-sm font-medium text-[#256628] mb-6">
              <Leaf size={14} aria-hidden="true" />
              India’s farm-direct marketplace
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
              From the field
              <br />
              to your table.
            </h1>

            <p className="mt-5 text-lg text-[#5B6559] max-w-xl leading-relaxed">
              Buy and sell crops, dairy, seeds and farm equipment directly — no
              agents, no markup. Fair prices on both sides of the harvest.
            </p>

            {/* search bar */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <label className="flex-1 flex items-center gap-3 h-12 bg-white rounded-xl px-4 border border-[#D5DBD0] focus-within:border-[#2E7D32] focus-within:ring-2 focus-within:ring-[#2E7D32]/20 transition-colors duration-200">
                <span className="sr-only">Search listings</span>
                <Search size={18} className="text-[#7A8576] shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Try 'basmati rice', 'tractor rental'…"
                  className="w-full bg-transparent outline-none text-[15px] text-[#1F2A1C] placeholder:text-[#7A8576]"
                />
              </label>
              <button type="submit" className={btnPrimary}>
                Search <ArrowRight size={16} />
              </button>
            </form>

            {/* quick pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Organic Rice",
                "Desi Cow Milk",
                "Tractor Rental",
                "Wheat Seeds",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() =>
                    navigate(`/listings?keyword=${encodeURIComponent(q)}`)
                  }
                  className={`px-3.5 py-1.5 text-[13px] text-[#5B6559] bg-white border border-[#E4E8E1] rounded-full hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors duration-200 ${focusRing}`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/listings" className={btnPrimary}>
                Browse Market <ArrowUpRight size={16} />
              </Link>
              <Link to={sellPath} className={btnOutline}>
                Start Selling
              </Link>
            </div>
          </div>

          {/* hero image */}
          <div className="relative animate-[heroIn_0.8s_ease-out_both] motion-reduce:animate-none">
            <div className="h-64 sm:h-80 lg:h-[440px] rounded-2xl overflow-hidden border border-[#E4E8E1] bg-[#EAF4E6]">
              <img
                src={IMGS.hero}
                alt="Farm field at golden hour"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <div className="absolute left-4 bottom-4 sm:left-5 sm:bottom-5 flex items-center gap-3 bg-white rounded-xl border border-[#E4E8E1] shadow-md px-4 py-3">
              <span className="grid place-items-center w-10 h-10 rounded-lg bg-[#EAF4E6] text-[#2E7D32]">
                <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Verified farmers</p>
                <p className="text-xs text-[#5B6559]">
                  4.8 average seller rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <div className="border-b border-[#E4E8E1] bg-white">
        <div
          className={`${container} py-10 grid grid-cols-2 sm:grid-cols-4 gap-8`}
        >
          <StatCard num={12000} suffix="+" label="Verified Farmers" />
          <StatCard num={4500} suffix="+" label="Live Listings" />
          <StatCard num={98} suffix="%" label="On-Time Orders" />
          <StatCard num={50} suffix="+" label="Cities Covered" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHY ORGANICFARM
      ══════════════════════════════════════════ */}
      <section className={`${container} py-16 sm:py-20`}>
        <Reveal>
          <div className="mb-10 max-w-xl">
            <p className={sectionLabel}>Why OrganicFarm</p>
            <h2 className={sectionTitle}>
              The field, closer than ever before.
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: ShieldCheck,
              title: "100% verified sellers",
              body: "Every seller profile is checked, so you know who grew your food.",
            },
            {
              icon: HandCoins,
              title: "Zero hidden commissions",
              body: "Sellers receive full payment instantly. Buyers see exactly what farmers charge.",
            },
            {
              icon: Truck,
              title: "Fresh produce, delivered local",
              body: "Direct from the farm to your door, with fewer stops along the way.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className={`h-full ${card} p-6`}>
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#EAF4E6] text-[#2E7D32] mb-5">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[#5B6559] leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED LISTINGS
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-[#F6F8F4] border-y border-[#E4E8E1]">
        <div className={container}>
          <Reveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className={sectionLabel}>Fresh this week</p>
                <h2 className={sectionTitle}>Featured listings</h2>
              </div>
              <Link
                to="/listings"
                className={`hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2E7D32] hover:text-[#256628] transition-colors duration-200 rounded ${focusRing}`}
              >
                View all <ChevronRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* category filter pills */}
          <Reveal delay={100}>
            <div
              className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
              role="group"
              aria-label="Filter listings by category"
            >
              {CATEGORIES.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={activeCategory === label}
                  onClick={() => setActive(label)}
                  className={`flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${focusRing} ${
                    activeCategory === label
                      ? "bg-[#2E7D32] text-white"
                      : "bg-white text-[#5B6559] border border-[#D5DBD0] hover:border-[#2E7D32] hover:text-[#2E7D32]"
                  }`}
                >
                  {Icon && <Icon size={14} aria-hidden="true" />} {label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(
              (
                { title, seller, location, price, unit, tag, rating, image },
                i,
              ) => (
                <Reveal key={title} delay={(i % 3) * 80}>
                  <div
                    className={`group h-full overflow-hidden ${card} hover:shadow-md transition-shadow duration-200`}
                  >
                    {/* image */}
                    <div className="relative h-48 overflow-hidden bg-[#EAF4E6]">
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span
                        className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border ${TAG_COLOR[tag]}`}
                      >
                        {tag}
                      </span>
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold bg-white text-[#1F2A1C] px-2.5 py-1 rounded-full shadow-sm">
                        <Star
                          size={12}
                          className="fill-[#F59E0B] text-[#F59E0B]"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Rated</span> {rating}
                      </span>
                    </div>

                    {/* info */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold leading-snug">
                        {title}
                      </h3>
                      <p className="flex items-center gap-1 text-[13px] text-[#5B6559] mt-1.5">
                        <MapPin size={12} aria-hidden="true" /> {seller} ·{" "}
                        {location}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-bold text-xl text-[#1F2A1C]">
                          {price}
                          <span className="text-sm text-[#5B6559] font-normal">
                            {unit}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            aria-label={`Add ${title} to cart`}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl bg-[#EAF4E6] hover:bg-[#DCEED6] text-[#2E7D32] transition-colors duration-200 ${focusRing}`}
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button
                            type="button"
                            className={`flex items-center gap-1 px-3.5 h-10 rounded-xl border border-[#D5DBD0] hover:bg-[#F6F8F4] text-sm font-semibold transition-colors duration-200 ${focusRing}`}
                          >
                            Details <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ),
            )}
          </div>

          <Reveal>
            <div className="mt-10 text-center">
              <Link to="/listings" className={btnOutline}>
                View all listings <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className={`${container} py-16 sm:py-20`}>
        <Reveal>
          <p className={sectionLabel}>How it works</p>
          <h2 className={`${sectionTitle} mb-10 max-w-lg`}>
            No mandi. No agents. Just farmers and buyers.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              step: "1",
              title: "Farmers list the harvest",
              body: "Sellers upload their crop, dairy or tool with real photos and set their own fair price — in under 5 minutes.",
              icon: Sprout,
            },
            {
              step: "2",
              title: "Buyers shop direct",
              body: "Search by crop, location or season. See who grew it, where it came from, and buy directly with Razorpay.",
              icon: Search,
            },
            {
              step: "3",
              title: "Everyone earns more",
              body: "Farmers receive instant payouts. Buyers get fresher produce at lower prices. Zero middleman in between.",
              icon: TrendingUp,
            },
          ].map(({ step, title, body, icon: Icon }, i) => (
            <Reveal key={step} delay={i * 100}>
              <div className={`h-full ${card} p-6`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-[#2E7D32] text-white text-sm font-bold">
                    {step}
                  </span>
                  <Icon
                    size={20}
                    className="text-[#2E7D32]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[#5B6559] leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUOTE BAND
      ══════════════════════════════════════════ */}
      <div className="bg-[#EAF4E6] py-14 sm:py-16">
        <Reveal>
          <p className="text-xl sm:text-3xl font-semibold text-center text-[#1F2A1C] px-5 leading-snug max-w-3xl mx-auto">
            “The harvest begins the moment someone takes the first step.”
          </p>
        </Reveal>
      </div>

      {/* ══════════════════════════════════════════
          CTA — dual column
      ══════════════════════════════════════════ */}
      <section className={`${container} py-16 sm:py-20`}>
        <div className="grid sm:grid-cols-2 gap-5">
          {/* buyer CTA */}
          <Reveal from="left">
            <div className={`h-full overflow-hidden ${card}`}>
              <div className="h-44 bg-[#EAF4E6]">
                <img
                  src={IMGS.market}
                  alt="Fresh produce market"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-[#2E7D32] mb-1">
                  For buyers
                </p>
                <h3 className="text-2xl font-bold mb-5">
                  Shop fresh, pay fair.
                </h3>
                <Link to="/listings" className={btnPrimary}>
                  Start Shopping <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* seller CTA */}
          <Reveal from="right">
            <div className={`h-full overflow-hidden ${card}`}>
              <div className="h-44 bg-[#EAF4E6]">
                <img
                  src={IMGS.farmer}
                  alt="A farmer in a field"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-[#2E7D32] mb-1">
                  For farmers
                </p>
                <h3 className="text-2xl font-bold mb-5">
                  List your harvest in 5 minutes.
                </h3>
                <Link to={sellPath} className={btnPrimary}>
                  Sell Now <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#F6F8F4] border-t border-[#E4E8E1] pt-14 pb-8 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2">
              <Link
                to="/"
                className={`flex items-center gap-2.5 w-fit rounded-lg ${focusRing}`}
              >
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#2E7D32] text-white">
                  <Leaf size={18} strokeWidth={2.5} />
                </span>
                <span className="text-xl font-bold">
                  Organic<span className="text-[#2E7D32]">Farm</span>
                </span>
              </Link>
              <p className="mt-4 text-sm text-[#5B6559] leading-relaxed max-w-xs">
                India’s farm-direct marketplace. Cutting the middleman between
                growers and everyday buyers since day one.
              </p>
              <div className="mt-6 flex gap-3">
                {["Twitter/X", "Instagram", "LinkedIn"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    aria-label={s}
                    className={`w-10 h-10 rounded-xl bg-white border border-[#E4E8E1] hover:border-[#2E7D32] grid place-items-center text-sm font-medium text-[#5B6559] hover:text-[#2E7D32] transition-colors duration-200 ${focusRing}`}
                  >
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>

            {[
              [
                "Marketplace",
                [
                  "Browse all",
                  "Crops & Grains",
                  "Dairy",
                  "Seeds",
                  "Tool Rentals",
                ],
              ],
              ["Company", ["About us", "Careers", "Blog", "Contact"]],
              [
                "Support",
                ["Help center", "Track order", "Payments", "Returns"],
              ],
            ].map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold text-[#1F2A1C] mb-4">
                  {heading}
                </h4>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className={`text-sm text-[#5B6559] hover:text-[#2E7D32] transition-colors duration-200 rounded ${focusRing}`}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[#E4E8E1] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#7A8576]">
              © {new Date().getFullYear()} OrganicFarm Technologies Pvt. Ltd.
            </p>
            <p className="text-xs text-[#7A8576]">
              Made with purpose — for the people who feed us.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes heroIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
