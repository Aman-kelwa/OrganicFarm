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
  Package,
  RefreshCw,
  TrendingUp,
  Timer,
} from "lucide-react";
import api from "../services/api";

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
      { threshold: 0.07 },
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
      className={`transition-all duration-500 ease-out ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── status config ── */
const STATUS = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/12  border-amber-400/30",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approved",
    color: "text-[#A8E063]",
    bg: "bg-[#5C9E31]/14  border-[#5C9E31]/35",
    dot: "bg-[#A8E063]",
  },
  active: {
    label: "Active",
    color: "text-sky-400",
    bg: "bg-sky-400/12     border-sky-400/30",
    dot: "bg-sky-400",
  },
  completed: {
    label: "Completed",
    color: "text-purple-400",
    bg: "bg-purple-400/12  border-purple-400/30",
    dot: "bg-purple-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/12     border-red-400/30",
    dot: "bg-red-400",
  },
};

const PAYMENT_COLOR = {
  paid: "text-[#A8E063] bg-[#5C9E31]/12 border-[#5C9E31]/30",
  pending: "text-amber-400 bg-amber-400/12 border-amber-400/30",
  failed: "text-red-400   bg-red-400/12   border-red-400/30",
};

/* ── skeleton ── */
function Skeleton() {
  return (
    <div className="rounded-2xl bg-white/4 border border-white/8 overflow-hidden animate-pulse">
      <div className="h-52 bg-white/8" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
        <div className="h-3 bg-white/7 rounded-full w-1/2" />
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-white/6 rounded-xl" />
          ))}
        </div>
        <div className="h-10 bg-white/8 rounded-xl mt-2" />
      </div>
    </div>
  );
}

/* ── delete confirm modal ── */
function DeleteModal({ title, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-[#0E140D] border border-white/10 rounded-3xl p-7 shadow-[0_30px_80px_rgba(0,0,0,0.8)] animate-[popIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="flex items-center gap-4 mb-5">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-red-500/12 border border-red-500/25 shrink-0">
            <AlertTriangle size={22} className="text-red-400" />
          </span>
          <div>
            <h3 className="font-['Playfair_Display',serif] text-lg font-bold">
              Delete rental record?
            </h3>
            <p className="text-sm text-white/40 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/55 bg-white/4 border border-white/8 rounded-xl px-4 py-3 mb-6 line-clamp-2">
          <span className="font-semibold text-white/80">"{title}"</span> will be
          permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/12 text-white/60 hover:bg-white/6 font-semibold text-sm transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-semibold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── info row helper ── */
function InfoRow({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="flex items-center gap-2 text-xs text-white/40">
        <Icon size={13} className="shrink-0" /> {label}
      </span>
      <span
        className={`text-sm font-semibold ${accent ? "text-[#A8E063]" : "text-white/80"}`}
      >
        {value}
      </span>
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

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-['Inter',sans-serif]">
      {/* toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-semibold shadow-2xl animate-[slideRight_0.3s_ease-out] ${
            toast.ok
              ? "bg-[#0E140D] border-[#5C9E31]/40 text-[#A8E063]"
              : "bg-[#140e0e] border-red-500/40 text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${toast.ok ? "bg-[#A8E063]" : "bg-red-400"}`}
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

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-2">
                Seller Dashboard
              </p>
              <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold">
                Rental Requests
              </h1>
            </div>
            <button
              onClick={fetchRentals}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium transition-all w-fit"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </Reveal>

        {/* ── STATS ── */}
        {!loading && rentals.length > 0 && (
          <Reveal delay={60}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                {
                  icon: Tractor,
                  label: "Total Rentals",
                  value: rentals.length,
                  color: "text-white",
                },
                {
                  icon: Timer,
                  label: "Active Now",
                  value: activeCount,
                  color: "text-sky-400",
                },
                {
                  icon: Clock,
                  label: "Pending Review",
                  value: pendingCount,
                  color: "text-amber-400",
                },
                {
                  icon: TrendingUp,
                  label: "Revenue Earned",
                  value: `₹${totalRevenue.toLocaleString("en-IN")}`,
                  color: "text-[#A8E063]",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl bg-white/4 border border-white/8 px-5 py-4"
                >
                  <Icon size={20} className={`shrink-0 ${color}`} />
                  <div>
                    <p
                      className={`font-['Playfair_Display',serif] text-xl font-bold ${color}`}
                    >
                      {value}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── FILTERS ── */}
        <Reveal delay={100}>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* search */}
            <div className="flex-1 flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#5C9E31]/45 transition-all">
              <Search size={15} className="text-white/30 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by equipment or buyer name…"
                className="w-full bg-transparent outline-none text-[14px] text-white placeholder:text-white/25"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-white/25 hover:text-white/60 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* status filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 shrink-0">
              {FILTER_OPTIONS.map((f) => {
                const st = STATUS[f.toLowerCase()];
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      filter === f
                        ? "bg-[#5C9E31] text-white shadow-[0_0_16px_rgba(92,158,49,0.4)]"
                        : "bg-white/5 text-white/50 border border-white/8 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {st && (
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    )}
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-white/35 mb-6">
            {loading
              ? "Loading…"
              : `Showing ${filtered.length} of ${rentals.length} rentals`}
          </p>
        </Reveal>

        {/* ── LOADING ── */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-5">
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
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="grid place-items-center w-20 h-20 rounded-3xl bg-white/4 border border-white/8 mb-6">
                <Tractor size={36} className="text-white/15" />
              </span>
              <h2 className="font-['Playfair_Display',serif] text-2xl font-bold mb-2">
                No rental requests yet
              </h2>
              <p className="text-white/35 text-sm max-w-xs leading-relaxed">
                When buyers rent your equipment, their requests will appear here
                for you to manage.
              </p>
            </div>
          </Reveal>
        )}

        {/* ── NO FILTER RESULTS ── */}
        {!loading && rentals.length > 0 && filtered.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center py-20 text-center">
              <Filter size={36} className="text-white/15 mb-4" />
              <p className="font-semibold mb-1">
                No rentals match your filters
              </p>
              <button
                onClick={() => {
                  setFilter("All");
                  setSearch("");
                }}
                className="mt-4 px-5 py-2 text-sm rounded-xl border border-white/12 hover:bg-white/6 transition-all"
              >
                Clear filters
              </button>
            </div>
          </Reveal>
        )}

        {/* ── RENTAL CARDS ── */}
        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((rental, i) => {
              const st = STATUS[rental.rentalStatus] ?? STATUS.pending;
              const payColor =
                PAYMENT_COLOR[rental.paymentStatus] ?? PAYMENT_COLOR.pending;
              const canDelete =
                rental.rentalStatus === "completed" ||
                rental.rentalStatus === "cancelled";
              const isUpdating = updatingId === rental._id;

              return (
                <Reveal key={rental._id} delay={i * 60}>
                  <div className="group rounded-2xl bg-white/4 border border-white/8 hover:border-white/16 overflow-hidden hover:shadow-[0_16px_50px_rgba(0,0,0,0.45)] transition-all duration-300">
                    {/* image */}
                    <div className="relative h-52 overflow-hidden bg-white/6">
                      <img
                        src={rental.listing?.image}
                        alt={rental.listing?.title}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* status badge */}
                      <div
                        className={`absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-['Space_Mono',monospace] uppercase tracking-wider px-3 py-1.5 rounded-full border backdrop-blur-sm ${st.bg} ${st.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${st.dot} ${rental.rentalStatus === "active" ? "animate-pulse" : ""}`}
                        />
                        {st.label}
                      </div>

                      {/* payment badge */}
                      <div
                        className={`absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm ${payColor}`}
                      >
                        <CreditCard size={11} />
                        {rental.paymentStatus}
                      </div>

                      {/* title overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h2 className="font-['Playfair_Display',serif] text-lg font-bold text-white leading-snug drop-shadow-lg line-clamp-1">
                          {rental.listing?.title}
                        </h2>
                      </div>
                    </div>

                    {/* body */}
                    <div className="p-6">
                      {/* renter info */}
                      <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl bg-white/4 border border-white/7">
                        <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31]/15 text-[#A8E063] shrink-0">
                          <User size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {rental.renter?.name}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-white/40 mt-0.5 truncate">
                            <Mail size={10} /> {rental.renter?.email}
                          </p>
                        </div>
                      </div>

                      {/* details grid */}
                      <div className="rounded-xl bg-white/3 border border-white/6 px-4 py-1 mb-5">
                        <InfoRow
                          icon={Calendar}
                          label="Start Date"
                          value={new Date(rental.startDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        />
                        <InfoRow
                          icon={Calendar}
                          label="End Date"
                          value={new Date(rental.endDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        />
                        <InfoRow
                          icon={Clock}
                          label="Total Days"
                          value={`${rental.totalDays} day${rental.totalDays > 1 ? "s" : ""}`}
                        />
                        <InfoRow
                          icon={IndianRupee}
                          label="Rent / Day"
                          value={`₹${rental.rentPerDay}`}
                        />
                      </div>

                      {/* total */}
                      <div className="flex items-center justify-between mb-5 px-4 py-3.5 rounded-xl bg-[#5C9E31]/10 border border-[#5C9E31]/25">
                        <span className="text-sm text-white/55 font-medium">
                          Total Earnings
                        </span>
                        <span className="font-['Playfair_Display',serif] text-2xl font-bold text-[#A8E063]">
                          ₹{rental.totalRent?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* status selector */}
                      <div>
                        <label className="block text-[11px] font-['Space_Mono',monospace] uppercase tracking-widest text-white/35 mb-2">
                          Update Status
                        </label>
                        <div className="relative">
                          <select
                            value={rental.rentalStatus}
                            onChange={(e) =>
                              updateStatus(rental._id, e.target.value)
                            }
                            disabled={isUpdating}
                            className="w-full appearance-none bg-white/6 border border-white/12 rounded-xl pl-4 pr-10 py-3 text-[14px] text-white outline-none cursor-pointer hover:border-white/22 focus:border-[#5C9E31]/50 transition-all disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="bg-[#0E140D] capitalize"
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {isUpdating ? (
                              <Loader2
                                size={15}
                                className="text-[#A8E063] animate-spin"
                              />
                            ) : (
                              <ChevronDown
                                size={15}
                                className="text-white/30"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* delete button — only for completed/cancelled */}
                      {canDelete && (
                        <button
                          onClick={() =>
                            setDelete({
                              id: rental._id,
                              title: rental.listing?.title,
                            })
                          }
                          className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl
                            bg-red-500/8 hover:bg-red-500/18 border border-red-500/20 hover:border-red-500/40
                            text-red-400 text-sm font-semibold transition-all active:scale-[0.98]"
                        >
                          <Trash2 size={15} /> Delete Rental Record
                        </button>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { transform:scale(0.85); opacity:0; }
          to   { transform:scale(1);    opacity:1; }
        }
        @keyframes slideRight {
          from { transform:translateX(40px); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
      `}</style>
    </div>
  );
}
