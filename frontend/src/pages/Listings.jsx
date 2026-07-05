import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Wheat,
  Tractor,
  Leaf,
  Sprout,
  Milk,
  Apple,
  FlaskConical,
  Package,
  ShoppingBag,
  Filter,
} from "lucide-react";
import api from "../services/api";
import ListingCard from "../components/ListingCard";

/* ── reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, v] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── skeleton card ── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/4 border border-white/8 overflow-hidden animate-pulse">
      <div className="h-52 bg-white/8" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
        <div className="h-3 bg-white/7 rounded-full w-1/2" />
        <div className="h-3 bg-white/7 rounded-full w-2/3" />
        <div className="flex gap-2 pt-3">
          <div className="h-10 flex-1 bg-white/8 rounded-xl" />
          <div className="h-10 flex-1 bg-white/8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── category filter config ── */
const CATEGORIES = [
  { label: "All", value: "", icon: LayoutGrid },
  { label: "Crops", value: "Crops", icon: Wheat },
  { label: "Vegetables", value: "Vegetables", icon: Leaf },
  { label: "Fruits", value: "Fruits", icon: Apple },
  { label: "Seeds", value: "Seeds", icon: Sprout },
  { label: "Dairy", value: "Dairy", icon: Milk },
  { label: "Pulses", value: "Pulses", icon: Package },
  { label: "Spices", value: "Spices", icon: FlaskConical },
  { label: "Fertilizers", value: "Fertilizers", icon: FlaskConical },
  { label: "Machinery", value: "Tractor", icon: Tractor },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: Low→High", value: "price_asc" },
  { label: "Price: High→Low", value: "price_desc" },
];

const TYPE_OPTIONS = ["All Types", "sale", "rent"];

/* ════════════════════════════════════════════════════ */
export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [typeFilter, setType] = useState("All Types");
  const [sortBy, setSort] = useState("newest");
  const [viewMode, setView] = useState("grid");
  const [sidebarOpen, setSidebar] = useState(false);

  /* ── fetch ── */
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/listings");
      setListings(res.data.listings ?? []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── filter + sort ── */
  useEffect(() => {
    let data = [...listings];

    if (search.trim())
      data = data.filter(
        (l) =>
          l.title?.toLowerCase().includes(search.toLowerCase()) ||
          l.location?.toLowerCase().includes(search.toLowerCase()) ||
          l.description?.toLowerCase().includes(search.toLowerCase()),
      );

    if (category) data = data.filter((l) => l.category === category);

    if (typeFilter !== "All Types")
      data = data.filter((l) => l.type === typeFilter);

    if (sortBy === "newest")
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "price_asc")
      data.sort(
        (a, b) =>
          (a.price || a.rentPerDay || 0) - (b.price || b.rentPerDay || 0),
      );
    if (sortBy === "price_desc")
      data.sort(
        (a, b) =>
          (b.price || b.rentPerDay || 0) - (a.price || a.rentPerDay || 0),
      );

    setFiltered(data);
  }, [listings, search, category, typeFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setType("All Types");
    setSort("newest");
  };

  const activeFilterCount = [
    search.trim() ? 1 : 0,
    category ? 1 : 0,
    typeFilter !== "All Types" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-['Inter',sans-serif]">
      {/* ── HERO HEADER ── */}
      <div className="relative pt-28 pb-12 px-5 sm:px-8 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 right-[-8%] w-[500px] h-[500px] rounded-full bg-[#5C9E31]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-20 left-[-5%]  w-[300px] h-[300px] rounded-full bg-[#D9A441]/8  blur-3xl pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto">
          <Reveal>
            <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-3">
              The marketplace
            </p>
            <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-6xl font-bold mb-4">
              Fresh from the field.
            </h1>
            <p className="text-white/45 text-lg max-w-xl mb-8">
              Browse {listings.length > 0 ? listings.length + "+" : ""} listings
              — crops, dairy, seeds and equipment, all priced direct from
              farmers.
            </p>
          </Reveal>

          {/* search bar */}
          <Reveal delay={100}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-3 max-w-2xl"
            >
              <div
                className="flex-1 flex items-center gap-3 bg-white/6 border border-white/10 rounded-2xl px-5 py-4
                focus-within:border-[#5C9E31]/50 focus-within:bg-white/9 transition-all"
              >
                <Search size={18} className="text-white/30 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search crops, equipment, location…"
                  className="w-full bg-transparent outline-none text-[15px] text-white placeholder:text-white/25"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-white/25 hover:text-white/60 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSidebar((v) => !v)}
                className={`flex items-center gap-2 px-5 py-4 rounded-2xl border font-semibold text-sm transition-all ${
                  activeFilterCount > 0
                    ? "bg-[#5C9E31]/20 border-[#5C9E31]/45 text-[#A8E063]"
                    : "bg-white/6 border-white/10 text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                <SlidersHorizontal size={17} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#5C9E31] text-white text-[10px] font-bold grid place-items-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </div>

      {/* ── CATEGORY PILL STRIP ── */}
      <div className="sticky top-20 z-30 bg-[#0B0F0A]/95 backdrop-blur-xl border-b border-white/6 px-5 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {CATEGORIES.map(({ label, value, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setCategory(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === value
                  ? "bg-[#5C9E31] text-white shadow-[0_0_16px_rgba(92,158,49,0.45)]"
                  : "bg-white/5 text-white/50 border border-white/8 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* ── TOP BAR ── */}
        <Reveal>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
            <p className="text-sm text-white/40">
              {loading ? (
                "Loading…"
              ) : (
                <span>
                  <span className="text-white font-semibold">
                    {filtered.length}
                  </span>{" "}
                  listing{filtered.length !== 1 ? "s" : ""} found
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="ml-3 text-[#A8E063] hover:text-white text-xs underline underline-offset-2 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </span>
              )}
            </p>

            <div className="flex items-center gap-2.5">
              {/* type toggle */}
              <div className="flex rounded-xl bg-white/5 border border-white/8 p-1">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      typeFilter === t
                        ? "bg-white/12 text-white"
                        : "text-white/35 hover:text-white"
                    }`}
                  >
                    {t === "All Types" ? "All" : t}
                  </button>
                ))}
              </div>

              {/* sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/8 rounded-xl pl-3 pr-8 py-2 text-xs text-white/65 outline-none hover:border-white/18 focus:border-[#5C9E31]/45 transition-all cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option
                      key={s.value}
                      value={s.value}
                      className="bg-[#0E140D]"
                    >
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                />
              </div>

              {/* view toggle */}
              <div className="flex rounded-xl bg-white/5 border border-white/8 p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`grid place-items-center w-8 h-8 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#5C9E31] text-white" : "text-white/30 hover:text-white"}`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`grid place-items-center w-8 h-8 rounded-lg transition-all ${viewMode === "list" ? "bg-[#5C9E31] text-white" : "text-white/30 hover:text-white"}`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── LOADING ── */}
        {loading && (
          <div
            className={`grid gap-5 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
          >
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        )}

        {/* ── EMPTY ── */}
        {!loading && filtered.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="grid place-items-center w-20 h-20 rounded-3xl bg-white/4 border border-white/8 mb-6">
                <ShoppingBag size={36} className="text-white/15" />
              </span>
              <h2 className="font-['Playfair_Display',serif] text-2xl font-bold mb-2">
                {listings.length === 0 ? "No listings yet" : "No matches found"}
              </h2>
              <p className="text-white/35 text-sm mb-6 max-w-xs">
                {listings.length === 0
                  ? "Farmers haven't listed anything yet. Check back soon."
                  : "Try adjusting your search or removing some filters."}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 text-sm rounded-xl border border-white/12 hover:bg-white/6 transition-all"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </Reveal>
        )}

        {/* ── GRID VIEW ── */}
        {!loading && filtered.length > 0 && viewMode === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, i) => (
              <Reveal key={item._id} delay={i * 50}>
                <ListingCard item={item} viewMode="grid" />
              </Reveal>
            ))}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!loading && filtered.length > 0 && viewMode === "list" && (
          <div className="flex flex-col gap-4">
            {filtered.map((item, i) => (
              <Reveal key={item._id} delay={i * 40}>
                <ListingCard item={item} viewMode="list" />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* ── FILTER SIDEBAR ── */}
      <div
        onClick={() => setSidebar(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 bg-[#0E140D] border-l border-white/8 shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h3 className="font-['Playfair_Display',serif] font-bold text-lg">
            Filters
          </h3>
          <button
            onClick={() => setSidebar(false)}
            className="grid place-items-center w-8 h-8 rounded-xl bg-white/6 text-white/55 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-7 overflow-y-auto h-full pb-24">
          {/* type */}
          <div>
            <p className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-white/35 mb-3">
              Listing Type
            </p>
            <div className="flex flex-col gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    typeFilter === t
                      ? "bg-[#5C9E31]/15 border-[#5C9E31]/40 text-[#A8E063]"
                      : "bg-white/4 border-white/8 text-white/55 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {t === "sale"
                    ? "For Sale"
                    : t === "rent"
                      ? "For Rent"
                      : "All Types"}
                  {typeFilter === t && (
                    <span className="w-2 h-2 rounded-full bg-[#A8E063]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* category */}
          <div>
            <p className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-white/35 mb-3">
              Category
            </p>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(({ label, value, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => {
                    setCategory(value);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    category === value
                      ? "bg-[#5C9E31]/15 border-[#5C9E31]/40 text-[#A8E063]"
                      : "bg-white/4 border-white/8 text-white/55 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon size={14} /> {label}
                  {category === value && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#A8E063]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* sort */}
          <div>
            <p className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-white/35 mb-3">
              Sort By
            </p>
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    sortBy === s.value
                      ? "bg-[#5C9E31]/15 border-[#5C9E31]/40 text-[#A8E063]"
                      : "bg-white/4 border-white/8 text-white/55 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {s.label}
                  {sortBy === s.value && (
                    <span className="w-2 h-2 rounded-full bg-[#A8E063]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 border-t border-white/8 bg-[#0E140D]">
          <button
            onClick={() => {
              clearFilters();
              setSidebar(false);
            }}
            className="w-full py-3 rounded-xl border border-white/12 text-white/60 hover:bg-white/6 text-sm font-semibold transition-all"
          >
            Clear all filters
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
