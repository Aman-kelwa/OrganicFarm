/*
  OrganicFarm – Home Page V2
  Design: Editorial dark-hero + bento grid + horizontal scroll categories
  Fonts (add to index.html):
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
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
  Play,
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

/* ─── animated count-up hook ─── */
function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
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
      ? "-translate-x-8"
      : from === "right"
        ? "translate-x-8"
        : "translate-y-8";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${translate}`} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── stat with count-up ─── */
function StatCard({ num, suffix = "", label, triggerRef }) {
  const [ref, visible] = useReveal();
  const count = useCountUp(num, 1600, visible);
  return (
    <div ref={ref} className="text-center">
      <p className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-black text-white">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1.5 text-sm text-white/50 font-['Space_Mono',monospace] tracking-wide">
        {label}
      </p>
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

const TAG_COLOR = {
  Crop: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  Dairy: "bg-sky-400/20 text-sky-300 border-sky-400/30",
  Seeds: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  Rental: "bg-slate-400/20 text-slate-300 border-slate-400/30",
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#0B0F0A] text-white font-['Inter',sans-serif] overflow-x-hidden">
      {/* ══════════════════════════════════════════
          HERO — full-bleed with left/right split
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16">
        {/* full-bleed background */}
        <div className="absolute inset-0">
          <img
            src={IMGS.hero}
            alt="Farm field at golden hour"
            className="w-full h-full object-cover object-center opacity-35"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F0A] via-[#0B0F0A]/85 to-[#0B0F0A]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0A] via-transparent to-transparent" />
        </div>

        {/* noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-3xl">
            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#5C9E31]/40 bg-[#5C9E31]/10 mb-8 animate-[fadeDown_0.6s_ease-out]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8E063] animate-pulse" />
              <span className="text-[12px] font-['Space_Mono',monospace] text-[#A8E063] tracking-widest uppercase">
                India's farm-direct marketplace
              </span>
            </div>

            <h1 className="font-['Playfair_Display',serif] text-5xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.0] tracking-tight animate-[fadeDown_0.7s_ease-out]">
              From the
              <span className="block italic text-[#A8E063]">field to your</span>
              <span className="block">table.</span>
            </h1>

            <p className="mt-7 text-lg sm:text-xl text-white/55 max-w-xl leading-relaxed animate-[fadeDown_0.8s_ease-out]">
              Buy and sell crops, dairy, seeds and farm equipment directly — no
              agents, no markup. Fair prices on both sides of the harvest.
            </p>

            {/* search bar */}
            <form
              onSubmit={handleSearch}
              className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl animate-[fadeDown_0.9s_ease-out]"
            >
              <div className="flex-1 flex items-center gap-3 bg-white/8 backdrop-blur rounded-2xl px-5 py-4 border border-white/10 focus-within:border-[#5C9E31]/60 focus-within:bg-white/10 transition-all">
                <Search size={18} className="text-white/35 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Try 'basmati rice', 'tractor rental'…"
                  className="w-full bg-transparent outline-none text-[15px] text-white placeholder:text-white/30"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-4 rounded-2xl bg-[#5C9E31] hover:bg-[#4E8A28] font-semibold transition-all active:scale-95 shadow-[0_0_30px_rgba(92,158,49,0.5)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Search <ArrowRight size={17} />
              </button>
            </form>

            {/* quick pills */}
            <div className="mt-5 flex flex-wrap gap-2 animate-[fadeDown_1s_ease-out]">
              {[
                "Organic Rice",
                "Desi Cow Milk",
                "Tractor Rental",
                "Wheat Seeds",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() =>
                    navigate(`/listings?keyword=${encodeURIComponent(q)}`)
                  }
                  className="px-3.5 py-1.5 text-[12px] text-white/50 border border-white/10 rounded-full hover:border-[#A8E063]/40 hover:text-[#A8E063] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* hero CTAs */}
            <div className="mt-10 flex items-center gap-5 animate-[fadeDown_1.1s_ease-out]">
              <Link
                to="/listings"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#0B0F0A] font-bold hover:bg-[#A8E063] transition-all active:scale-95"
              >
                Browse Market <ArrowUpRight size={17} />
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 text-[15px] text-white/60 hover:text-white transition-colors font-medium"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 hover:border-white/40 transition-colors">
                  <Play size={14} className="ml-0.5" />
                </span>
                Start Selling
              </Link>
            </div>
          </div>

          {/* floating trust badge */}
          <div className="absolute right-8 bottom-16 hidden xl:flex flex-col gap-3">
            {[
              { n: "12K+", l: "Verified Farmers" },
              { n: "4.8★", l: "Avg. Seller Rating" },
              { n: "₹0", l: "Hidden Fees" },
            ].map(({ n, l }) => (
              <div
                key={l}
                className="flex items-center gap-3 bg-white/6 backdrop-blur border border-white/8 rounded-2xl px-4 py-3"
              >
                <span className="font-['Playfair_Display',serif] text-xl font-bold text-[#A8E063]">
                  {n}
                </span>
                <span className="text-xs text-white/50">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <div className="border-y border-white/6 bg-white/3 backdrop-blur">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <StatCard num={12000} suffix="+" label="Verified Farmers" />
          <StatCard num={4500} suffix="+" label="Live Listings" />
          <StatCard num={98} suffix="%" label="On-Time Orders" />
          <StatCard num={50} suffix="+" label="Cities Covered" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BENTO SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <Reveal>
          <div className="mb-12">
            <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-3">
              Why OrganicFarm
            </p>
            <h2 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold leading-tight">
              The field, closer
              <br />
              than ever before.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[180px] gap-4">
          {/* large image tile */}
          <Reveal delay={0} className="col-span-2 row-span-2">
            <div className="relative h-full rounded-3xl overflow-hidden group cursor-pointer">
              <img
                src={IMGS.farmer}
                alt="Farmer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-['Space_Mono',monospace] text-[#A8E063] uppercase tracking-widest">
                  Direct from farm
                </span>
                <h3 className="mt-2 font-['Playfair_Display',serif] text-2xl font-bold">
                  Meet the people
                  <br />
                  who grow your food
                </h3>
                <Link
                  to="/listings"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#A8E063] hover:gap-3 transition-all"
                >
                  Explore listings <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* stat tile */}
          <Reveal delay={100} className="col-span-1">
            <div className="h-full rounded-3xl bg-[#5C9E31] flex flex-col justify-between p-6">
              <ShieldCheck size={28} className="text-white/80" />
              <div>
                <p className="font-['Playfair_Display',serif] text-3xl font-bold">
                  100%
                </p>
                <p className="text-[13px] text-white/70 mt-1">
                  Verified seller profiles
                </p>
              </div>
            </div>
          </Reveal>

          {/* market image */}
          <Reveal delay={150} className="col-span-1">
            <div className="relative h-full rounded-3xl overflow-hidden">
              <img
                src={IMGS.market}
                alt="Fresh produce market"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <p className="text-xs font-['Space_Mono',monospace] text-white/60">
                  Fresh produce
                </p>
                <p className="text-sm font-semibold">Delivered local</p>
              </div>
            </div>
          </Reveal>

          {/* dark feature tile */}
          <Reveal delay={200} className="col-span-2">
            <div className="h-full rounded-3xl bg-white/5 border border-white/8 flex items-center gap-6 p-6">
              <div className="shrink-0 grid place-items-center w-16 h-16 rounded-2xl bg-[#A8E063]/15">
                <HandCoins size={28} className="text-[#A8E063]" />
              </div>
              <div>
                <p className="font-semibold text-lg">Zero hidden commissions</p>
                <p className="text-sm text-white/45 mt-1 leading-relaxed">
                  Sellers receive full payment instantly. Buyers see exactly
                  what farmers charge.
                </p>
              </div>
              <Truck
                size={22}
                className="shrink-0 text-white/15 hidden sm:block"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED LISTINGS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-3">
                  Fresh this week
                </p>
                <h2 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold">
                  Featured listings
                </h2>
              </div>
              <Link
                to="/listings"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/50 hover:text-[#A8E063] transition-colors"
              >
                View all <ChevronRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* category filter pills */}
          <Reveal delay={100}>
            <div className="flex gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setActive(label)}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === label
                      ? "bg-[#5C9E31] text-white shadow-[0_0_20px_rgba(92,158,49,0.4)]"
                      : "bg-white/6 text-white/55 border border-white/8 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {Icon && <Icon size={14} />} {label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(
              (
                {
                  title,
                  seller,
                  location,
                  price,
                  unit,
                  tag,
                  rating,
                  image,
                  color,
                },
                i,
              ) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/8 hover:border-white/18 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer">
                    {/* image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent`}
                      />
                      {/* tag badge */}
                      <span
                        className={`absolute top-4 left-4 text-[11px] font-['Space_Mono',monospace] uppercase tracking-wider px-2.5 py-1 rounded-full border ${TAG_COLOR[tag]}`}
                      >
                        {tag}
                      </span>
                      {/* rating */}
                      <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
                        <Star
                          size={11}
                          className="fill-[#F5C842] text-[#F5C842]"
                        />{" "}
                        {rating}
                      </span>
                    </div>

                    {/* info */}
                    <div className="p-5">
                      <h3 className="font-['Playfair_Display',serif] text-lg font-bold leading-snug">
                        {title}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-white/40 mt-1.5">
                        <MapPin size={11} /> {seller} · {location}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-bold text-xl">
                          <span className="text-[#A8E063]">{price}</span>
                          <span className="text-sm text-white/40 font-normal">
                            {unit}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#5C9E31]/15 hover:bg-[#5C9E31]/30 text-[#A8E063] transition-all">
                            <ShoppingCart size={16} />
                          </button>
                          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/15 text-xs font-semibold transition-all">
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
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/15 hover:border-[#5C9E31]/60 hover:bg-[#5C9E31]/10 font-semibold transition-all text-white/70 hover:text-white"
              >
                View all listings <ArrowUpRight size={17} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal>
          <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-3">
            The process
          </p>
          <h2 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold mb-16 max-w-lg">
            No mandi. No agents.
            <br />
            Just farmers and buyers.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Farmers list the harvest",
              body: "Sellers upload their crop, dairy or tool with real photos and set their own fair price — in under 5 minutes.",
              icon: Sprout,
              color: "text-[#A8E063] bg-[#A8E063]/10",
            },
            {
              step: "02",
              title: "Buyers shop direct",
              body: "Search by crop, location or season. See who grew it, where it came from, and buy directly with Razorpay.",
              icon: Search,
              color: "text-amber-400 bg-amber-400/10",
            },
            {
              step: "03",
              title: "Everyone earns more",
              body: "Farmers receive instant payouts. Buyers get fresher produce at lower prices. Zero middleman in between.",
              icon: TrendingUp,
              color: "text-sky-400 bg-sky-400/10",
            },
          ].map(({ step, title, body, icon: Icon, color }, i) => (
            <Reveal key={step} delay={i * 120}>
              <div className="group rounded-3xl border border-white/8 p-8 hover:border-white/18 hover:bg-white/4 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-8">
                  <span
                    className={`grid place-items-center w-12 h-12 rounded-2xl ${color}`}
                  >
                    <Icon size={22} />
                  </span>
                  <span className="font-['Space_Mono',monospace] text-4xl font-bold text-white/8 group-hover:text-white/15 transition-colors">
                    {step}
                  </span>
                </div>
                <h3 className="font-['Playfair_Display',serif] text-xl font-bold mb-3">
                  {title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          IMAGE BREAK — wheat field
      ══════════════════════════════════════════ */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={IMGS.wheat}
          alt="Wheat field"
          className="w-full h-full object-cover object-bottom"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F0A] via-transparent to-[#0B0F0A]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Reveal>
            <p className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold italic text-center text-white/90 drop-shadow-2xl px-5">
              "The harvest begins the moment
              <br className="hidden sm:block" /> someone takes the first step."
            </p>
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CTA — dual column
      ══════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid sm:grid-cols-2 gap-5">
          {/* buyer CTA */}
          <Reveal from="left">
            <div className="relative rounded-3xl overflow-hidden h-80 group cursor-pointer">
              <img
                src={IMGS.market}
                alt="Marketplace"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-['Space_Mono',monospace] text-xs text-[#A8E063] tracking-widest uppercase mb-2">
                  For Buyers
                </p>
                <h3 className="font-['Playfair_Display',serif] text-3xl font-bold mb-4">
                  Shop fresh,
                  <br />
                  pay fair.
                </h3>
                <Link
                  to="/listings"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-[#A8E063] transition-all active:scale-95"
                >
                  Start Shopping <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* seller CTA */}
          <Reveal from="right">
            <div className="relative rounded-3xl overflow-hidden h-80 group cursor-pointer">
              <img
                src={IMGS.farmer}
                alt="Farmer selling"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-['Space_Mono',monospace] text-xs text-[#A8E063] tracking-widest uppercase mb-2">
                  For Farmers
                </p>
                <h3 className="font-['Playfair_Display',serif] text-3xl font-bold mb-4">
                  List your harvest
                  <br />
                  in 5 minutes.
                </h3>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#5C9E31] font-bold text-sm rounded-xl hover:bg-[#4E8A28] transition-all active:scale-95 shadow-[0_0_20px_rgba(92,158,49,0.4)]"
                >
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
      <footer className="border-t border-white/6 pt-16 pb-8 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 group w-fit">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31] text-white">
                  <Leaf size={18} strokeWidth={2.5} />
                </span>
                <span className="font-['Playfair_Display',serif] text-xl">
                  Organic<span className="text-[#A8E063]">Farm</span>
                </span>
              </Link>
              <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
                India's farm-direct marketplace. Cutting the middleman between
                growers and everyday buyers since day one.
              </p>
              <div className="mt-6 flex gap-3">
                {["Twitter/X", "Instagram", "LinkedIn"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-9 h-9 rounded-xl bg-white/6 border border-white/8 hover:bg-white/12 grid place-items-center text-[11px] text-white/40 hover:text-white transition-all"
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
                <h4 className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-white/30 mb-4">
                  {heading}
                </h4>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-white/55 hover:text-white transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/25">
              © {new Date().getFullYear()} OrganicFarm Technologies Pvt. Ltd.
            </p>
            <p className="text-xs text-white/25">
              Made with purpose — for the people who feed us.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
