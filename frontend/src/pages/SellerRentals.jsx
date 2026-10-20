/*
  OrganicFarm – SellerRentals
  Light design system (same as Listings / Cart / Orders / MyRentals):
  header #F6F8F4 · sticky white filter bar · results on #F6F8F4 · white cards
*/

import { useEffect, useState, useRef } from "react";
import {
  Tractor,
  User,
  Mail,
  Calendar,
  Clock,
  IndianRupee,
  CreditCard,
  ChevronDown,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  Filter,
  X,
  XCircle,
  Package,
  RefreshCw,
  TrendingUp,
  Timer,
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
const STATUS = {
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

const PAYMENT_COLOR = {
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  failed: "bg-red-50 text-red-800 border-red-200",
};

/* ── skeleton ── */
function Skeleton() {
  return (
    <div
      aria-hidden="true"
      className={`${CARD} overflow-hidden animate-pulse motion-reduce:animate-none`}
    >
      <div className="h-48 bg-[#E4E8E1]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#E4E8E1] rounded-full w-3/4" />
        <div className="h-3 bg-[#E4E8E1] rounded-full w-1/2" />
        <div className="h-24 bg-[#E4E8E1] rounded-xl mt-4" />
        <div className="h-12 bg-[#E4E8E1] rounded-xl" />
      </div>
    </div>
  );
}

/* ── delete confirm modal ── */
function DeleteModal({ title, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#1F2A1C]/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-rental-title"
        className="relative w-full max-w-md rounded-2xl border border-[#E4E8E1] bg-white p-6 shadow-xl animate-[modalIn_0.2s_ease-out] motion-reduce:animate-none"
      >
        <div className="flex items-center gap-4 mb-5">
          <span className="grid place-items-center h-12 w-12 rounded-xl border border-red-200 bg-red-50 shrink-0">
            <AlertTriangle
              size={22}
              aria-hidden="true"
              className="text-red-800"
            />
          </span>
          <div>
            <h3
              id="delete-rental-title"
              className="text-lg font-semibold text-[#1F2A1C]"
            >
              Delete rental record?
            </h3>
            <p className="text-sm text-[#5B6559] mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-sm text-[#5B6559] bg-[#F6F8F4] border border-[#E4E8E1] rounded-xl px-4 py-3 mb-6 line-clamp-2">
          <span className="font-semibold text-[#1F2A1C]">“{title}”</span> will
          be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={`${BTN_OUTLINE} flex-1 px-4`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${BTN} flex-1 px-4 bg-red-700 text-white hover:bg-red-800`}
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── info row helper ── */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-[#E4E8E1] last:border-0">
      <span className="flex items-center gap-2 text-sm text-[#5B6559]">
        <Icon size={14} className="shrink-0" aria-hidden="true" /> {label}
      </span>
      <span className="text-sm font-semibold text-[#1F2A1C]">{value}</span>
    </div>
  );
}

const STATUS_OPTIONS = [
  "pending",
  "approved",
  "active",
  "completed",
  "cancelled",
];
const FILTER_OPTIONS = [
  "All",
  ...STATUS_OPTIONS.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
];

/* ══════════════════════════════════════════════ */
export default function SellerRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDelete] = useState(null); // { id, title }
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/rentals/seller-rentals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(res.data.rentals ?? []);
    } catch {
      showToast("Failed to load rentals.", false);
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    setDelete(null);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/rentals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals((prev) => prev.filter((r) => r._id !== id));
      showToast("Rental deleted successfully.", true);
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed.", false);
      fetchRentals();
    }
  };

  /* ── update status ── */
  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/rentals/${id}/status`,
        { rentalStatus: status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRentals((prev) =>
        prev.map((r) => (r._id === id ? { ...r, rentalStatus: status } : r)),
      );
      showToast("Status updated successfully.", true);
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", false);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── toast ── */
  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── derived ── */
  const filtered = rentals.filter((r) => {
    const matchFilter =
      filter === "All" || r.rentalStatus === filter.toLowerCase();
    const matchSearch =
      !search.trim() ||
      r.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.renter?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  /* stats */
  const totalRevenue = rentals
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + (r.totalRent || 0), 0);
  const activeCount = rentals.filter((r) => r.rentalStatus === "active").length;
  const pendingCount = rentals.filter(
    (r) => r.rentalStatus === "pending",
  ).length;

  const activeFilters = [
    search.trim() ? 1 : 0,
    filter !== "All" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setFilter("All");
    setSearch("");
  };

  /* ════════════════ RENDER ════════════════ */
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

      {/* delete modal */}
      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          onConfirm={confirmDelete}
          onCancel={() => setDelete(null)}
        />
      )}

      {/* ── PAGE HEADER ── */}
      <header className="bg-[#F6F8F4] border-b border-[#E4E8E1] pt-28 pb-10 sm:pb-12">
        <div className={CONTAINER}>
          <Reveal hero>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2E7D32] mb-2">
                  Seller dashboard
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Rental requests
                </h1>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 sm:mt-10">
                {[
                  {
                    icon: Tractor,
                    label: "Total rentals",
                    value: rentals.length,
                  },
                  { icon: Timer, label: "Active now", value: activeCount },
                  {
                    icon: Clock,
                    label: "Pending review",
                    value: pendingCount,
                  },
                  {
                    icon: TrendingUp,
                    label: "Revenue earned",
                    value: `₹${totalRevenue.toLocaleString("en-IN")}`,
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
            {FILTER_OPTIONS.map((f) => {
              const st = STATUS[f.toLowerCase()];
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f)}
                  className={`${PILL} ${active ? PILL_ACTIVE : PILL_IDLE}`}
                >
                  {st && (
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full bg-current ${active ? "text-white" : st.color}`}
                    />
                  )}
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <main className="bg-[#F6F8F4]">
        <div className={`${CONTAINER} py-10 sm:py-12`}>
          {/* search */}
          <Reveal>
            <label className="flex items-center gap-3 h-12 pl-4 pr-1 mb-4 max-w-2xl rounded-xl border border-[#D5DBD0] bg-white focus-within:ring-2 focus-within:ring-[#2E7D32] focus-within:ring-offset-2 transition-shadow duration-200">
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
                placeholder="Search by equipment or buyer name…"
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

            <div className="flex items-center justify-between gap-3 mb-6 min-h-[28px]">
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-[#5B6559]"
              >
                {loading
                  ? "Loading…"
                  : `Showing ${filtered.length} of ${rentals.length} rentals`}
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
                  No rental requests yet
                </h2>
                <p className="text-sm text-[#5B6559] max-w-xs leading-relaxed">
                  When buyers rent your equipment, their requests will appear
                  here for you to manage.
                </p>
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
                const st = STATUS[rental.rentalStatus] ?? STATUS.pending;
                const StatusIcon = st.icon;
                const payColor =
                  PAYMENT_COLOR[rental.paymentStatus] ?? PAYMENT_COLOR.pending;
                const canDelete =
                  rental.rentalStatus === "completed" ||
                  rental.rentalStatus === "cancelled";
                const isUpdating = updatingId === rental._id;

                return (
                  <Reveal key={rental._id} className="h-full">
                    <div
                      className={`group flex h-full flex-col overflow-hidden ${CARD} hover:shadow-md transition-shadow duration-200`}
                    >
                      {/* image */}
                      <div className="relative h-48 shrink-0 overflow-hidden bg-[#F6F8F4]">
                        <img
                          src={rental.listing?.image}
                          alt={rental.listing?.title}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />

                        {/* status badge */}
                        <span
                          className={`absolute top-3 left-3 ${TAG_BASE} ${st.tag}`}
                        >
                          <StatusIcon size={12} aria-hidden="true" />
                          {st.label}
                        </span>

                        {/* payment badge */}
                        <span
                          className={`absolute top-3 right-3 ${TAG_BASE} capitalize ${payColor}`}
                        >
                          <CreditCard size={12} aria-hidden="true" />
                          <span className="sr-only">Payment:</span>
                          {rental.paymentStatus}
                        </span>
                      </div>

                      {/* body */}
                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="mb-4 truncate text-lg font-semibold leading-snug">
                          {rental.listing?.title}
                        </h2>

                        {/* renter info */}
                        <div className="flex items-center gap-3 mb-4 p-3.5 rounded-xl bg-[#F6F8F4] border border-[#E4E8E1]">
                          <span className="grid place-items-center h-10 w-10 rounded-xl bg-[#EAF4E6] text-[#2E7D32] shrink-0">
                            <User size={16} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {rental.renter?.name}
                            </p>
                            <p className="flex items-center gap-1.5 text-sm text-[#5B6559] mt-0.5">
                              <Mail
                                size={12}
                                aria-hidden="true"
                                className="shrink-0"
                              />
                              <span className="truncate">
                                {rental.renter?.email}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* details */}
                        <div className="px-1 mb-4">
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
                        </div>

                        {/* total */}
                        <div className="flex items-center justify-between mb-5 px-4 py-3.5 rounded-xl bg-[#EAF4E6]">
                          <span className="text-sm font-semibold">
                            Total earnings
                          </span>
                          <span className="text-2xl font-bold">
                            ₹{rental.totalRent?.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* status selector + delete */}
                        <div className="mt-auto">
                          <label
                            htmlFor={`rental-status-${rental._id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            Update status
                          </label>
                          <div className="relative">
                            <select
                              id={`rental-status-${rental._id}`}
                              value={rental.rentalStatus}
                              onChange={(e) =>
                                updateStatus(rental._id, e.target.value)
                              }
                              disabled={isUpdating}
                              className={`w-full appearance-none h-12 rounded-xl border border-[#D5DBD0] bg-white pl-4 pr-10 text-sm font-semibold text-[#1F2A1C] cursor-pointer hover:bg-[#F6F8F4] transition-colors duration-200 disabled:cursor-wait disabled:opacity-60 ${FOCUS}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              {isUpdating ? (
                                <Loader2
                                  size={15}
                                  aria-label="Updating status"
                                  className="text-[#2E7D32] animate-spin motion-reduce:animate-none"
                                />
                              ) : (
                                <ChevronDown
                                  size={15}
                                  aria-hidden="true"
                                  className="text-[#7A8576]"
                                />
                              )}
                            </div>
                          </div>

                          {/* delete button — only for completed/cancelled */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                setDelete({
                                  id: rental._id,
                                  title: rental.listing?.title,
                                })
                              }
                              className={`${BTN} mt-3 w-full border border-red-200 bg-white text-red-800 hover:bg-red-50`}
                            >
                              <Trash2 size={15} aria-hidden="true" /> Delete
                              rental record
                            </button>
                          )}
                        </div>
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
        @keyframes modalIn {
          from { transform:translateY(8px); opacity:0; }
          to   { transform:translateY(0);   opacity:1; }
        }
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
