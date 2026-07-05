import { useEffect, useState, useRef } from "react";
import {
  Tractor, User, Mail, Calendar, Clock, IndianRupee,
  CreditCard, Search, X, ChevronDown, RefreshCw,
  Filter, TrendingUp, Timer, CheckCircle2, XCircle,
  Truck, Package, ArrowRight,
} from "lucide-react";
import api from "../services/api";

/* ── reveal ── */
function useReveal() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.unobserve(el); }
    }, { threshold: 0.07 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out
        ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}>
      {children}
    </div>
  );
}

/* ── status config ── */
const RENTAL_STATUS = {
  pending:   { label: "Pending",   color: "text-amber-400",   bg: "bg-amber-400/12  border-amber-400/30",  dot: "bg-amber-400",   icon: Clock        },
  approved:  { label: "Approved",  color: "text-emerald-400", bg: "bg-emerald-500/12 border-emerald-500/30",dot: "bg-emerald-400", icon: CheckCircle2 },
  active:    { label: "Active",    color: "text-sky-400",     bg: "bg-sky-400/12     border-sky-400/30",    dot: "bg-sky-400",     icon: Timer        },
  completed: { label: "Completed", color: "text-[#A8E063]",   bg: "bg-[#5C9E31]/13  border-[#5C9E31]/32",  dot: "bg-[#A8E063]",   icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-400",     bg: "bg-red-400/12     border-red-400/30",    dot: "bg-red-400",     icon: XCircle      },
};
const getStatus = (s) => RENTAL_STATUS[s] ?? RENTAL_STATUS.pending;

const PAYMENT_COLOR = {
  paid:    "text-[#A8E063] bg-[#5C9E31]/12 border-[#5C9E31]/30",
  pending: "text-amber-400 bg-amber-400/12 border-amber-400/30",
  failed:  "text-red-400   bg-red-400/12   border-red-400/30",
};

/* ── skeleton ── */
function Skeleton() {
  return (
    <div className="rounded-2xl bg-white/4 border border-white/8 overflow-hidden animate-pulse">
      <div className="h-52 bg-white/8" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
        <div className="h-3 bg-white/7  rounded-full w-1/2" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-white/6 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

/* ── info row ── */
function InfoRow({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="flex items-center gap-2 text-xs text-white/40">
        <Icon size={12} className="shrink-0" />{label}
      </span>
      <span className={`text-sm font-semibold ${accent ? "text-[#A8E063]" : "text-white/80"}`}>
        {value}
      </span>
    </div>
  );
}

/* ── duration progress bar ── */
function RentalProgress({ startDate, endDate }) {
  const now   = Date.now();
  const start = new Date(startDate).getTime();
  const end   = new Date(endDate).getTime();
  const total = end - start;
  const elapsed = now - start;
  const pct = Math.min(Math.max((elapsed / total) * 100, 0), 100);
  const notStarted = now < start;
  const finished   = now > end;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-white/35 mb-1.5">
        <span>{notStarted ? "Starts soon" : finished ? "Ended" : `${Math.round(pct)}% complete`}</span>
        <span>{finished ? "Done" : notStarted ? "Not started" : "In progress"}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#5C9E31] to-[#A8E063] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* filter options */
const STATUS_FILTERS = ["All", "pending", "approved", "active", "completed", "cancelled"];
const SORT_OPTIONS   = [
  { label: "Newest first",    value: "newest"    },
  { label: "Oldest first",    value: "oldest"    },
  { label: "Price: High→Low", value: "price_desc"},
  { label: "Price: Low→High", value: "price_asc" },
];

/* ══════════════════════════════════════════════════════ */
export default function MyRentals() {
  const [rentals,  setRentals]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState("All");
  const [sortBy,   setSort]     = useState("newest");
  const [toast,    setToast]    = useState(null);

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

  useEffect(() => { fetchRentals(); }, []);

  /* ── filter + sort ── */
  useEffect(() => {
    let data = [...rentals];
    if (search.trim())
      data = data.filter(r =>
        r.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.owner?.name?.toLowerCase().includes(search.toLowerCase())
      );
    if (statusF !== "All")
      data = data.filter(r => r.rentalStatus === statusF);
    if (sortBy === "newest")    data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")    data.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "price_desc")data.sort((a,b) => b.totalRent - a.totalRent);
    if (sortBy === "price_asc") data.sort((a,b) => a.totalRent - b.totalRent);
    setFiltered(data);
  }, [rentals, search, statusF, sortBy]);

  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── stats ── */
  const totalSpent  = rentals.filter(r => r.paymentStatus === "paid").reduce((s,r)=>s+(r.totalRent||0),0);
  const activeCount = rentals.filter(r => r.rentalStatus === "active").length;
  const totalDaysAll= rentals.reduce((s,r)=>s+(r.totalDays||0),0);

  const activeFilters = [search.trim()?1:0, statusF!=="All"?1:0].reduce((a,b)=>a+b,0);

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-[#060A06] text-white font-['Inter',sans-serif]">

      {/* ── decorative blobs ── */}
      <div aria-hidden className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#1a3a12]/40 blur-[120px] pointer-events-none" />
      <div aria-hidden className="fixed bottom-0 left-0  w-[400px] h-[400px] rounded-full bg-[#0d2208]/60 blur-[100px] pointer-events-none" />

      {/* toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
          rounded-2xl border text-sm font-semibold shadow-2xl animate-[slideRight_0.3s_ease-out] ${
          toast.ok ? "bg-[#0a130a] border-[#5C9E31]/40 text-[#A8E063]"
                   : "bg-[#130a0a] border-red-500/40   text-red-400"}`}>
          <span className={`w-2 h-2 rounded-full ${toast.ok ? "bg-[#A8E063]" : "bg-red-400"}`} />
          {toast.msg}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20">

        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <p className="font-['Space_Mono',monospace] text-xs text-[#6abf3e] tracking-widest uppercase mb-2">
                Buyer Dashboard
              </p>
              <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold">
                My Rentals
              </h1>
              <p className="text-white/35 text-sm mt-2">
                Track all your rented equipment in one place.
              </p>
            </div>
            <button onClick={fetchRentals}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10
                text-white/50 hover:text-white hover:bg-white/9 text-sm font-medium transition-all w-fit">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </Reveal>

        {/* ── STATS ── */}
        {!loading && rentals.length > 0 && (
          <Reveal delay={60}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Tractor,     label: "Total Rentals",  value: rentals.length,   color: "text-white"     },
                { icon: Timer,       label: "Active Now",     value: activeCount,      color: "text-sky-400"   },
                { icon: Calendar,    label: "Total Days",     value: totalDaysAll,     color: "text-amber-400" },
                { icon: TrendingUp,  label: "Total Spent",    value: `₹${totalSpent.toLocaleString("en-IN")}`, color: "text-[#A8E063]" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label}
                  className="flex items-center gap-4 rounded-2xl bg-[#0f1f0d] border border-[#1e3a18] px-5 py-4">
                  <Icon size={20} className={`shrink-0 ${color}`} />
                  <div>
                    <p className={`font-['Playfair_Display',serif] text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-white/35 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── FILTERS ── */}
        <Reveal delay={100}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* search */}
            <div className="flex-1 flex items-center gap-2.5 bg-[#0f1a0e] border border-[#1c3318]
              rounded-xl px-4 py-3 focus-within:border-[#5C9E31]/55 transition-all">
              <Search size={15} className="text-white/30 shrink-0" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by equipment or owner name…"
                className="w-full bg-transparent outline-none text-[14px] text-white placeholder:text-white/25" />
              {search && (
                <button onClick={() => setSearch("")} className="text-white/25 hover:text-white/60 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* sort */}
            <div className="relative">
              <select value={sortBy} onChange={e => setSort(e.target.value)}
                className="appearance-none bg-[#0f1a0e] border border-[#1c3318] rounded-xl pl-4 pr-9 py-3
                  text-[14px] text-white/65 outline-none hover:border-[#2a4d22] focus:border-[#5C9E31]/55
                  transition-all cursor-pointer">
                {SORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value} className="bg-[#0a130a]">{s.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* status pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            {STATUS_FILTERS.map(f => {
              const st = RENTAL_STATUS[f];
              return (
                <button key={f} onClick={() => setStatusF(f)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                    whitespace-nowrap transition-all border ${
                    statusF === f
                      ? "bg-[#2d5c1e] border-[#5C9E31]/60 text-[#A8E063] shadow-[0_0_16px_rgba(92,158,49,0.35)]"
                      : "bg-[#0f1a0e] border-[#1c3318] text-white/45 hover:border-[#2d5c1e] hover:text-white"
                  }`}>
                  {st && <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />}
                  {f === "All" ? "All Rentals" : st?.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-white/30">
              {loading ? "Loading…" : `${filtered.length} of ${rentals.length} rentals`}
            </p>
            {activeFilters > 0 && (
              <button onClick={() => { setSearch(""); setStatusF("All"); }}
                className="flex items-center gap-1.5 text-xs text-[#A8E063] hover:text-white
                  border border-[#5C9E31]/30 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
                <X size={11} /> Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </Reveal>

        {/* ── LOADING ── */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-5">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && rentals.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="grid place-items-center w-20 h-20 rounded-3xl bg-[#0f1f0d] border border-[#1e3a18] mb-6">
                <Tractor size={36} className="text-white/15" />
              </span>
              <h2 className="font-['Playfair_Display',serif] text-2xl font-bold mb-2">No rentals yet</h2>
              <p className="text-white/35 text-sm max-w-xs leading-relaxed mb-7">
                Equipment you rent will appear here. Browse available tools and machinery in the marketplace.
              </p>
              <a href="/listings?category=Tractor"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2d5c1e] border border-[#5C9E31]/50
                  hover:bg-[#3a7525] font-semibold text-sm text-[#A8E063] transition-all active:scale-95
                  shadow-[0_0_20px_rgba(92,158,49,0.25)]">
                Browse Equipment <ArrowRight size={15} />
              </a>
            </div>
          </Reveal>
        )}

        {/* ── NO FILTER RESULTS ── */}
        {!loading && rentals.length > 0 && filtered.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center py-20 text-center">
              <Filter size={36} className="text-white/15 mb-4" />
              <p className="font-semibold mb-1">No rentals match your filters</p>
              <button onClick={() => { setSearch(""); setStatusF("All"); }}
                className="mt-4 px-5 py-2 text-sm rounded-xl border border-[#1c3318] hover:bg-[#0f1a0e] transition-all">
                Clear filters
              </button>
            </div>
          </Reveal>
        )}

        {/* ── RENTAL CARDS ── */}
        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((rental, i) => {
              const st       = getStatus(rental.rentalStatus);
              const StatusIcon = st.icon;
              const payColor = PAYMENT_COLOR[rental.paymentStatus] ?? PAYMENT_COLOR.pending;

              return (
                <Reveal key={rental._id} delay={i * 65}>
                  <div className="group rounded-2xl bg-[#0a140a] border border-[#182e14]
                    hover:border-[#2d5c1e] overflow-hidden
                    hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(92,158,49,0.1)]
                    transition-all duration-300">

                    {/* image */}
                    <div className="relative h-52 overflow-hidden bg-[#0f1a0e]">
                      <img src={rental.listing?.image} alt={rental.listing?.title}
                        onError={e => { e.currentTarget.style.display = "none"; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060A06]/90 via-[#060A06]/15 to-transparent" />

                      {/* rental status */}
                      <div className={`absolute top-3 left-3 flex items-center gap-1.5 text-[11px]
                        font-['Space_Mono',monospace] uppercase tracking-wider px-3 py-1.5
                        rounded-full border backdrop-blur-sm ${st.bg} ${st.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${rental.rentalStatus === "active" ? "animate-pulse" : ""}`} />
                        {st.label}
                      </div>

                      {/* payment status */}
                      <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-[11px]
                        font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm ${payColor}`}>
                        <CreditCard size={11} /> {rental.paymentStatus}
                      </div>

                      {/* title overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h2 className="font-['Playfair_Display',serif] text-lg font-bold leading-snug drop-shadow-lg line-clamp-1">
                          {rental.listing?.title}
                        </h2>
                        <p className="text-[#A8E063] font-bold text-xl mt-0.5 drop-shadow-lg">
                          ₹{rental.totalRent?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* body */}
                    <div className="p-6">

                      {/* owner info */}
                      <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl bg-[#0f1f0d] border border-[#1e3a18]">
                        <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#2d5c1e]/60 text-[#A8E063] shrink-0">
                          <User size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{rental.owner?.name}</p>
                          <p className="flex items-center gap-1 text-xs text-white/40 mt-0.5 truncate">
                            <Mail size={10} /> {rental.owner?.email}
                          </p>
                        </div>
                      </div>

                      {/* details */}
                      <div className="rounded-xl bg-[#0c180c] border border-[#182e14] px-4 py-1 mb-4">
                        <InfoRow icon={Calendar}    label="Start Date"
                          value={new Date(rental.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} />
                        <InfoRow icon={Calendar}    label="End Date"
                          value={new Date(rental.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} />
                        <InfoRow icon={Clock}       label="Total Days"   value={`${rental.totalDays} day${rental.totalDays>1?"s":""}`} />
                        <InfoRow icon={IndianRupee} label="Rent / Day"   value={`₹${rental.rentPerDay}`} />
                        <InfoRow icon={IndianRupee} label="Total Rent"   value={`₹${rental.totalRent?.toLocaleString("en-IN")}`} accent />
                      </div>

                      {/* duration progress bar */}
                      <RentalProgress startDate={rental.startDate} endDate={rental.endDate} />

                      {/* status + payment footer */}
                      <div className="flex items-center gap-2.5 mt-5">
                        <div className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5
                          rounded-xl border flex-1 justify-center ${st.bg} ${st.color}`}>
                          <StatusIcon size={13} /> {st.label}
                        </div>
                        <div className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5
                          rounded-xl border flex-1 justify-center ${payColor}`}>
                          <CreditCard size={13} />
                          {rental.paymentStatus?.charAt(0).toUpperCase() + rental.paymentStatus?.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideRight {
          from { transform:translateX(40px); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}