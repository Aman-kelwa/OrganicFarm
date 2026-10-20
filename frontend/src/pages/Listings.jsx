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

/* ════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   (move these to e.g. src/styles/ui.js and import them
   on every page once you are happy with them)
   ════════════════════════════════════════════════════ */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2";
const CONTAINER = "max-w-7xl mx-auto px-5 sm:px-8";
const CARD = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const BTN = `inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const BTN_OUTLINE = `${BTN} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const ICON_BTN = `grid place-items-center h-10 w-10 rounded-xl border border-[#D5DBD0] bg-white text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C] transition-colors duration-200 ${FOCUS}`;
const PILL = `inline-flex items-center gap-2 h-10 px-4 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${FOCUS}`;
const PILL_ACTIVE = "bg-[#2E7D32] border-[#2E7D32] text-white";
const PILL_IDLE =
  "bg-white border-[#D5DBD0] text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C]";
const SEGMENT_BTN = `grid place-items-center h-8 rounded-lg text-sm font-semibold transition-colors duration-200 ${FOCUS}`;
const SEGMENT_ACTIVE = "bg-[#2E7D32] text-white";
const SEGMENT_IDLE = "text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C]";

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

/* Scroll reveal: 600ms fade + 16px slide, once.
   `hero` uses the gentler 12px entrance for the page header. */
function Reveal({ children, className = "", hero = false }) {
  const [ref, v] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        v
          ? "opacity-100 translate-y-0"
          : `opacity-0 motion-reduce:opacity-100 ${hero ? "translate-y-3" : "translate-y-4"}`
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ── skeleton card ── */
function SkeletonCard({ list = false }) {
  return (
    <div
      className={`${CARD} overflow-hidden animate-pulse motion-reduce:animate-none ${
        list ? "flex" : ""
      }`}
    >
      <div
        className={`bg-[#E4E8E1] ${list ? "w-40 sm:w-56 shrink-0" : "h-48"}`}
      />
      <div className="p-5 space-y-3 flex-1">
        <div className="h-4 bg-[#E4E8E1] rounded-full w-3/4" />
        <div className="h-3 bg-[#E4E8E1] rounded-full w-1/2" />
        <div className="h-3 bg-[#E4E8E1] rounded-full w-2/3" />
        <div className="flex gap-2 pt-3">
          <div className="h-10 flex-1 bg-[#E4E8E1] rounded-xl" />
          <div className="h-10 flex-1 bg-[#E4E8E1] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── option row used inside the filter drawer ── */
function OptionButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl border text-left text-sm font-medium transition-colors duration-200 ${FOCUS} ${
        selected
          ? "border-[#2E7D32] bg-[#EAF4E6] text-[#1F2A1C]"
          : "border-[#E4E8E1] bg-white text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C]"
      }`}
    >
      {children}
      {selected && (
        <span
          aria-hidden="true"
          className="ml-auto h-2 w-2 rounded-full bg-[#2E7D32]"
        />
      )}
    </button>
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

  /* ── close the filter drawer with Escape ── */
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSidebar(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

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

  const typeLabel = (t) =>
    t === "sale" ? "For Sale" : t === "rent" ? "For Rent" : "All Types";

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-white text-[#1F2A1C] font-['Inter',sans-serif]">
      {/* ── PAGE HEADER ── */}
      <header className="bg-[#F6F8F4] border-b border-[#E4E8E1] pt-28 pb-10 sm:pb-12">
        <div className={CONTAINER}>
          <Reveal hero>
            <p className="text-sm font-semibold text-[#2E7D32] mb-2">
              The marketplace
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Fresh from the field.
            </h1>
            <p className="text-base text-[#5B6559] max-w-xl mb-8">
              Browse {listings.length > 0 ? listings.length + "+" : ""} listings
              — crops, dairy, seeds and equipment, all priced direct from
              farmers.
            </p>
          </Reveal>

          {/* search bar */}
          <Reveal hero>
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-3 max-w-2xl"
            >
              <div className="flex-1 min-w-0 flex items-center gap-3 h-12 pl-4 pr-1 rounded-xl border border-[#D5DBD0] bg-white focus-within:ring-2 focus-within:ring-[#2E7D32] focus-within:ring-offset-2 transition-shadow duration-200">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="text-[#7A8576] shrink-0"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search crops, equipment, location…"
                  aria-label="Search listings"
                  className="w-full min-w-0 bg-transparent outline-none text-sm text-[#1F2A1C] placeholder:text-[#7A8576]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className={`grid place-items-center h-10 w-10 shrink-0 rounded-xl text-[#7A8576] hover:bg-[#F6F8F4] hover:text-[#1F2A1C] transition-colors duration-200 ${FOCUS}`}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSidebar((v) => !v)}
                aria-expanded={sidebarOpen}
                aria-controls="filters-panel"
                className={`${BTN} shrink-0 border px-4 sm:px-6 ${
                  activeFilterCount > 0
                    ? "border-[#2E7D32] bg-[#EAF4E6] text-[#1F2A1C] hover:bg-[#EAF4E6]"
                    : "border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]"
                }`}
              >
                <SlidersHorizontal size={17} aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="grid place-items-center h-5 w-5 rounded-full bg-[#2E7D32] text-white text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </header>

      {/* ── CATEGORY PILL STRIP ── */}
      <div className="sticky top-20 z-30 bg-white border-b border-[#E4E8E1]">
        <div className={`${CONTAINER} py-3`}>
          <div
            role="group"
            aria-label="Filter by category"
            className="-mx-1 flex gap-2.5 overflow-x-auto px-1 py-1 scrollbar-hide"
          >
            {CATEGORIES.map(({ label, value, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => setCategory(value)}
                aria-pressed={category === value}
                className={`${PILL} ${category === value ? PILL_ACTIVE : PILL_IDLE}`}
              >
                <Icon size={14} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <main className="bg-[#F6F8F4]">
        <div className={`${CONTAINER} py-10 sm:py-12`}>
          {/* top bar */}
          <Reveal>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-[#5B6559]"
              >
                {loading ? (
                  "Loading…"
                ) : (
                  <span>
                    <span className="font-semibold text-[#1F2A1C]">
                      {filtered.length}
                    </span>{" "}
                    listing{filtered.length !== 1 ? "s" : ""} found
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className={`ml-3 rounded text-sm font-semibold text-[#2E7D32] hover:text-[#256628] underline underline-offset-2 transition-colors duration-200 ${FOCUS}`}
                      >
                        Clear filters
                      </button>
                    )}
                  </span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* type toggle */}
                <div
                  role="group"
                  aria-label="Listing type"
                  className="flex h-10 items-center rounded-xl border border-[#D5DBD0] bg-white p-1"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      aria-pressed={typeFilter === t}
                      className={`${SEGMENT_BTN} px-3 capitalize ${
                        typeFilter === t ? SEGMENT_ACTIVE : SEGMENT_IDLE
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
                    aria-label="Sort listings"
                    className={`appearance-none h-10 rounded-xl border border-[#D5DBD0] bg-white pl-3 pr-9 text-sm font-medium text-[#1F2A1C] hover:bg-[#F6F8F4] transition-colors duration-200 cursor-pointer ${FOCUS}`}
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8576] pointer-events-none"
                  />
                </div>

                {/* view toggle */}
                <div
                  role="group"
                  aria-label="Layout"
                  className="flex h-10 items-center rounded-xl border border-[#D5DBD0] bg-white p-1"
                >
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    className={`${SEGMENT_BTN} w-8 ${viewMode === "grid" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
                  >
                    <LayoutGrid size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                    className={`${SEGMENT_BTN} w-8 ${viewMode === "list" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
                  >
                    <List size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── LOADING ── */}
          {loading && (
            <div
              aria-busy="true"
              className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              <span className="sr-only">Loading listings</span>
              {Array(viewMode === "grid" ? 9 : 5)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} list={viewMode === "list"} />
                ))}
            </div>
          )}

          {/* ── EMPTY ── */}
          {!loading && filtered.length === 0 && (
            <Reveal>
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                <span className="grid place-items-center h-16 w-16 rounded-2xl bg-[#EAF4E6] mb-6">
                  <ShoppingBag
                    size={28}
                    aria-hidden="true"
                    className="text-[#2E7D32]"
                  />
                </span>
                <h2 className="text-lg font-semibold mb-2">
                  {listings.length === 0
                    ? "No listings yet"
                    : "No matches found"}
                </h2>
                <p className="text-sm text-[#5B6559] mb-6 max-w-xs">
                  {listings.length === 0
                    ? "Farmers haven't listed anything yet. Check back soon."
                    : "Try adjusting your search or removing some filters."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={BTN_OUTLINE}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </Reveal>
          )}

          {/* ── GRID VIEW ── */}
          {!loading && filtered.length > 0 && viewMode === "grid" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <Reveal key={item._id} className="h-full">
                  <ListingCard item={item} viewMode="grid" />
                </Reveal>
              ))}
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {!loading && filtered.length > 0 && viewMode === "list" && (
            <div className="flex flex-col gap-4">
              {filtered.map((item) => (
                <Reveal key={item._id}>
                  <ListingCard item={item} viewMode="list" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── FILTER DRAWER ── */}
      <div
        aria-hidden="true"
        onClick={() => setSidebar(false)}
        className={`fixed inset-0 z-40 bg-[#1F2A1C]/40 transition-opacity duration-300 motion-reduce:transition-none ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        id="filters-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!sidebarOpen}
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-sm flex-col bg-white border-l border-[#E4E8E1] shadow-xl transition-[transform,visibility] duration-300 motion-reduce:transition-none ${
          sidebarOpen ? "translate-x-0 visible" : "translate-x-full invisible"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 shrink-0 border-b border-[#E4E8E1]">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            type="button"
            onClick={() => setSidebar(false)}
            aria-label="Close filters"
            className={ICON_BTN}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
          {/* type */}
          <div role="group" aria-label="Listing type">
            <p className="text-sm font-semibold mb-3">Listing type</p>
            <div className="flex flex-col gap-2">
              {TYPE_OPTIONS.map((t) => (
                <OptionButton
                  key={t}
                  selected={typeFilter === t}
                  onClick={() => setType(t)}
                >
                  {typeLabel(t)}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* category */}
          <div role="group" aria-label="Category">
            <p className="text-sm font-semibold mb-3">Category</p>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(({ label, value, icon: Icon }) => (
                <OptionButton
                  key={label}
                  selected={category === value}
                  onClick={() => setCategory(value)}
                >
                  <Icon size={14} aria-hidden="true" /> {label}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* sort */}
          <div role="group" aria-label="Sort by">
            <p className="text-sm font-semibold mb-3">Sort by</p>
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((s) => (
                <OptionButton
                  key={s.value}
                  selected={sortBy === s.value}
                  onClick={() => setSort(s.value)}
                >
                  {s.label}
                </OptionButton>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-3 p-5 border-t border-[#E4E8E1] bg-white">
          <button
            type="button"
            onClick={() => setSidebar(false)}
            className={`${BTN_PRIMARY} w-full`}
          >
            {loading
              ? "Show results"
              : `Show ${filtered.length} listing${filtered.length !== 1 ? "s" : ""}`}
          </button>
          <button
            type="button"
            onClick={() => {
              clearFilters();
              setSidebar(false);
            }}
            className={`${BTN_OUTLINE} w-full`}
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
