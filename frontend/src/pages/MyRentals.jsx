/*
  OrganicFarm – MyRentals
  Light design system (same as Listings / Cart / Orders):
  header #F6F8F4 · sticky white filter bar · results on #F6F8F4 · white cards
  soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0) · text #1F2A1C
  muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
*/

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Tractor,
  User,
  Mail,
  Calendar,
  Clock,
  IndianRupee,
  CreditCard,
  Search,
  X,
  ChevronDown,
  RefreshCw,
  Filter,
  TrendingUp,
  Timer,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

/* ════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   (same names as the other pages — move them into one
   shared file, e.g. src/styles/ui.js, and import them)
   ════════════════════════════════════════════════════ */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2";
const CONTAINER = "max-w-7xl mx-auto px-5 sm:px-8";
const CARD = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const BTN = `inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const BTN_OUTLINE = `${BTN} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const PILL = `inline-flex items-center gap-2 h-10 px-4 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${FOCUS}`;
const PILL_ACTIVE = "bg-[#2E7D32] border-[#2E7D32] text-white";
const PILL_IDLE =
  "bg-white border-[#D5DBD0] text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C]";
const TAG_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* ── reveal: 600ms fade + 16px slide, once (`hero` = gentler 12px) ── */
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
      { threshold: 0.07 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}
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

/* ── status config (design-system tag colors only) ── */
const RENTAL_STATUS = {
  pending: {
    label: "Pending",
    color: "text-amber-800",
    tag: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "text-sky-800",
    tag: "bg-sky-50 text-sky-800 border-sky-200",
    icon: CheckCircle2,
  },
  active: {
    label: "Active",
    color: "text-emerald-800",
    tag: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: Timer,
  },
  completed: {
    label: "Completed",
    color: "text-slate-700",
    tag: "bg-slate-100 text-slate-700 border-slate-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-slate-700",
    tag: "bg-slate-100 text-slate-700 border-slate-200",
    icon: XCircle,
  },
};
const getStatus = (s) => RENTAL_STATUS[s] ?? RENTAL_STATUS.pending;

const PAYMENT_COLOR = {
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  failed: "bg-red-50 text-red-800 border-red-200",
};

/* ── skeleton ── */
function Skeleton() {
  return (
    <div
      className={`${CARD} overflow-hidden animate-pulse motion-reduce:animate-none`}
      aria-hidden="true"
    >
      <div className="h-48 bg-[#E4E8E1]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#E4E8E1] rounded-full w-3/4" />
        <div className="h-3 bg-[#E4E8E1] rounded-full w-1/2" />
        <div className="h-24 bg-[#E4E8E1] rounded-xl mt-4" />
        <div className="h-2 bg-[#E4E8E1] rounded-full" />
      </div>
    </div>
  );
}

/* ── info row ── */
function InfoRow({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-[#E4E8E1] last:border-0">
      <span className="flex items-center gap-2 text-sm text-[#5B6559]">
        <Icon size={14} className="shrink-0" aria-hidden="true" />
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${accent ? "text-[#2E7D32]" : "text-[#1F2A1C]"}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── duration progress bar ── */
function RentalProgress({ startDate, endDate }) {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const total = end - start;
  const elapsed = now - start;
  const pct =
    total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0;
  const notStarted = now < start;
  const finished = now > end;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-[#5B6559] mb-1.5">
        <span>
          {notStarted
            ? "Starts soon"
            : finished
              ? "Ended"
              : `${Math.round(pct)}% complete`}
        </span>
        <span>
          {finished ? "Done" : notStarted ? "Not started" : "In progress"}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-[#E4E8E1] overflow-hidden"
        role="progressbar"
        aria-label="Rental progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className="h-full rounded-full bg-[#2E7D32] transition-[width] duration-700 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* filter options */
const STATUS_FILTERS = [
  "All",
  "pending",
  "approved",
  "active",
  "completed",
  "cancelled",
];
const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: High→Low", value: "price_desc" },
  { label: "Price: Low→High", value: "price_asc" },
];

/* ══════════════════════════════════════════════════════ */
export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [sortBy, setSort] = useState("newest");
  const [toast, setToast] = useState(null);

  /* ── fetch ── */
  const fetchRentals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/rentals/my-rentals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(res.data.rentals ?? []);
    } catch (err) {
      showToast("Failed to load rentals.", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  /* ── filter + sort ── */
  useEffect(() => {
    let data = [...rentals];
    if (search.trim())
      data = data.filter(
        (r) =>
          r.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
          r.owner?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    if (statusF !== "All")
      data = data.filter((r) => r.rentalStatus === statusF);
    if (sortBy === "newest")
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "price_desc") data.sort((a, b) => b.totalRent - a.totalRent);
    if (sortBy === "price_asc") data.sort((a, b) => a.totalRent - b.totalRent);
    setFiltered(data);
  }, [rentals, search, statusF, sortBy]);

  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── stats ── */
  const totalSpent = rentals
    .filter((r) => r.paymentStatus === "paid")
    .reduce((s, r) => s + (r.totalRent || 0), 0);
  const activeCount = rentals.filter((r) => r.rentalStatus === "active").length;
  const totalDaysAll = rentals.reduce((s, r) => s + (r.totalDays || 0), 0);

  const activeFilters = [
    search.trim() ? 1 : 0,
    statusF !== "All" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setSearch("");
    setStatusF("All");
  };

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-white text-[#1F2A1C] font-['Inter',sans-serif]">
      {/* toast */}
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          className={`fixed top-24 right-5 sm:right-8 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg animate-[toastIn_0.2s_ease-out] motion-reduce:animate-none ${
            toast.ok
              ? "border-[#E4E8E1] bg-white text-[#1F2A1C]"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${toast.ok ? "bg-[#2E7D32]" : "bg-red-700"}`}
          />
          {toast.msg}
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <header className="bg-[#F6F8F4] border-b border-[#E4E8E1] pt-28 pb-10 sm:pb-12">
        <div className={CONTAINER}>
          <Reveal hero>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2E7D32] mb-2">
                  Buyer dashboard
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  My rentals
                </h1>
                <p className="text-base text-[#5B6559] mt-2">
                  Track all your rented equipment in one place.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchRentals}
                className={`${BTN_OUTLINE} w-fit`}
              >
                <RefreshCw
                  size={14}
                  aria-hidden="true"
                  className={
                    loading ? "animate-spin motion-reduce:animate-none" : ""
                  }
                />{" "}
                Refresh
              </button>
            </div>
          </Reveal>

          {/* ── STATS ── */}
          {!loading && rentals.length > 0 && (
            <Reveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 sm:mt-10">
                {[
                  {
                    icon: Tractor,
                    label: "Total rentals",
                    value: rentals.length,
                  },
                  { icon: Timer, label: "Active now", value: activeCount },
                  { icon: Calendar, label: "Total days", value: totalDaysAll },
                  {
                    icon: TrendingUp,
                    label: "Total spent",
                    value: `₹${totalSpent.toLocaleString("en-IN")}`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className={`${CARD} flex items-center gap-4 px-4 sm:px-5 py-4`}
                  >
                    <span className="grid place-items-center h-10 w-10 rounded-xl bg-[#EAF4E6] text-[#2E7D32] shrink-0">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xl font-bold truncate">{value}</p>
                      <p className="text-sm text-[#5B6559] mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </header>

      {/* ── STICKY STATUS FILTER BAR ── */}
      <div className="sticky top-20 z-30 bg-white border-b border-[#E4E8E1]">
        <div className={`${CONTAINER} py-3`}>
          <div
            role="group"
            aria-label="Filter rentals by status"
            className="-mx-1 flex gap-2.5 overflow-x-auto px-1 py-1 scrollbar-hide"
          >
            {STATUS_FILTERS.map((f) => {
              const st = RENTAL_STATUS[f];
              const active = statusF === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatusF(f)}
                  className={`${PILL} ${active ? PILL_ACTIVE : PILL_IDLE}`}
                >
                  {st && (
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full bg-current ${active ? "text-white" : st.color}`}
                    />
                  )}
                  {f === "All" ? "All rentals" : st?.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <main className="bg-[#F6F8F4]">
        <div className={`${CONTAINER} py-10 sm:py-12`}>
          {/* search + sort */}
          <Reveal>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* search */}
              <label className="flex-1 flex items-center gap-3 h-12 pl-4 pr-1 rounded-xl border border-[#D5DBD0] bg-white focus-within:ring-2 focus-within:ring-[#2E7D32] focus-within:ring-offset-2 transition-shadow duration-200">
                <span className="sr-only">Search rentals</span>
                <Search
                  size={16}
                  aria-hidden="true"
                  className="text-[#7A8576] shrink-0"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by equipment or owner name…"
                  className="w-full min-w-0 bg-transparent outline-none text-sm text-[#1F2A1C] placeholder:text-[#7A8576]"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className={`grid place-items-center h-10 w-10 shrink-0 rounded-xl text-[#7A8576] hover:bg-[#F6F8F4] hover:text-[#1F2A1C] transition-colors duration-200 ${FOCUS}`}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </label>

              {/* sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort rentals"
                  className={`appearance-none h-12 w-full sm:w-auto rounded-xl border border-[#D5DBD0] bg-white pl-4 pr-10 text-sm font-semibold text-[#1F2A1C] hover:bg-[#F6F8F4] transition-colors duration-200 cursor-pointer ${FOCUS}`}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A8576] pointer-events-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-6 min-h-[28px]">
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-[#5B6559]"
              >
                {loading
                  ? "Loading…"
                  : `${filtered.length} of ${rentals.length} rentals`}
              </p>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`inline-flex items-center gap-1.5 rounded text-sm font-semibold text-[#2E7D32] hover:text-[#256628] underline underline-offset-2 transition-colors duration-200 ${FOCUS}`}
                >
                  <X size={13} aria-hidden="true" /> Clear {activeFilters}{" "}
                  filter
                  {activeFilters > 1 ? "s" : ""}
                </button>
              )}
            </div>
          </Reveal>

          {/* ── LOADING ── */}
          {loading && (
            <div aria-busy="true" className="grid md:grid-cols-2 gap-6">
              <span className="sr-only">Loading rentals</span>
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} />
                ))}
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && rentals.length === 0 && (
            <Reveal>
              <div
                className={`${CARD} flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center`}
              >
                <span className="grid place-items-center h-16 w-16 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mb-6">
                  <Tractor size={28} aria-hidden="true" />
                </span>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  No rentals yet
                </h2>
                <p className="text-sm text-[#5B6559] max-w-xs leading-relaxed">
                  Equipment you rent will appear here. Browse available tools
                  and machinery in the marketplace.
                </p>
                <Link
                  to="/listings?category=Tractor"
                  className={`${BTN_PRIMARY} mt-6`}
                >
                  Browse equipment <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          )}

          {/* ── NO FILTER RESULTS ── */}
          {!loading && rentals.length > 0 && filtered.length === 0 && (
            <Reveal>
              <div
                className={`${CARD} flex flex-col items-center py-16 px-6 text-center`}
              >
                <span className="grid place-items-center h-14 w-14 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mb-4">
                  <Filter size={24} aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold mb-1">
                  No rentals match your filters
                </h2>
                <p className="text-sm text-[#5B6559]">
                  Try a different search or status.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`${BTN_OUTLINE} mt-5`}
                >
                  Clear filters
                </button>
              </div>
            </Reveal>
          )}

          {/* ── RENTAL CARDS ── */}
          {!loading && filtered.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((rental) => {
                const st = getStatus(rental.rentalStatus);
                const StatusIcon = st.icon;
                const payColor =
                  PAYMENT_COLOR[rental.paymentStatus] ?? PAYMENT_COLOR.pending;

                return (
                  <Reveal key={rental._id} className="h-full">
                    <div
                      className={`group h-full overflow-hidden ${CARD} hover:shadow-md transition-shadow duration-200`}
                    >
                      {/* image */}
                      <div className="relative h-48 overflow-hidden bg-[#F6F8F4]">
                        <img
                          src={rental.listing?.image}
                          alt={rental.listing?.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />

                        {/* rental status */}
                        <span
                          className={`absolute top-3 left-3 ${TAG_BASE} ${st.tag}`}
                        >
                          <StatusIcon size={12} aria-hidden="true" />
                          {st.label}
                        </span>

                        {/* payment status */}
                        <span
                          className={`absolute top-3 right-3 ${TAG_BASE} capitalize ${payColor}`}
                        >
                          <CreditCard size={12} aria-hidden="true" />
                          <span className="sr-only">Payment:</span>
                          {rental.paymentStatus}
                        </span>
                      </div>

                      {/* body */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <h2 className="text-lg font-semibold leading-snug min-w-0 truncate">
                            {rental.listing?.title}
                          </h2>
                          <p className="text-xl font-bold shrink-0">
                            ₹{rental.totalRent?.toLocaleString("en-IN")}
                          </p>
                        </div>

                        {/* owner info */}
                        <div className="flex items-center gap-3 mb-4 p-3.5 rounded-xl bg-[#F6F8F4] border border-[#E4E8E1]">
                          <span className="grid place-items-center h-10 w-10 rounded-xl bg-[#EAF4E6] text-[#2E7D32] shrink-0">
                            <User size={16} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {rental.owner?.name}
                            </p>
                            <p className="flex items-center gap-1.5 text-sm text-[#5B6559] mt-0.5 truncate">
                              <Mail
                                size={12}
                                aria-hidden="true"
                                className="shrink-0"
                              />
                              <span className="truncate">
                                {rental.owner?.email}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* details */}
                        <div className="px-1">
                          <InfoRow
                            icon={Calendar}
                            label="Start date"
                            value={fmtDate(rental.startDate)}
                          />
                          <InfoRow
                            icon={Calendar}
                            label="End date"
                            value={fmtDate(rental.endDate)}
                          />
                          <InfoRow
                            icon={Clock}
                            label="Total days"
                            value={`${rental.totalDays} day${rental.totalDays > 1 ? "s" : ""}`}
                          />
                          <InfoRow
                            icon={IndianRupee}
                            label="Rent / day"
                            value={`₹${rental.rentPerDay}`}
                          />
                          <InfoRow
                            icon={IndianRupee}
                            label="Total rent"
                            value={`₹${rental.totalRent?.toLocaleString("en-IN")}`}
                            accent
                          />
                        </div>

                        {/* duration progress bar */}
                        <RentalProgress
                          startDate={rental.startDate}
                          endDate={rental.endDate}
                        />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes toastIn {
          from { transform:translateY(-8px); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
