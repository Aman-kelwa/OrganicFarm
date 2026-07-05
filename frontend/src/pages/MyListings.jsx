/*
  OrganicFarm – My Listings Page
  Matches Home V2: dark editorial, Playfair + Inter + Space Mono
  Fonts (add to index.html):
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
*/

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Package,
  LayoutGrid,
  List,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import api from "../services/api";

/* ─── intersection reveal hook (same as Home) ─── */
function useReveal(threshold = 0.12) {
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
        : "translate-y-6";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${translate}`}
        ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── tag colour map ─── */
const TAG_COLOR = {
  Crop: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  Dairy: "bg-sky-400/15   text-sky-300   border-sky-400/30",
  Seeds: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  Rental: "bg-slate-400/15 text-slate-300  border-slate-400/30",
};
function tagColor(category = "") {
  const c = category.toLowerCase();
  if (c.includes("dairy")) return TAG_COLOR.Dairy;
  if (c.includes("seed")) return TAG_COLOR.Seeds;
  if (c.includes("rent") || c.includes("tool") || c.includes("tractor"))
    return TAG_COLOR.Rental;
  return TAG_COLOR.Crop;
}

/* ─── Skeleton card ─── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#5C9E31]/12 overflow-hidden animate-pulse bg-[#5C9E31]/[0.03]">
      <div className="h-52 bg-[#5C9E31]/8" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#5C9E31]/10 rounded-lg w-3/4" />
        <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        <div className="h-3 bg-white/5 rounded-lg w-1/3" />
        <div className="h-6 bg-[#5C9E31]/10 rounded-lg w-1/2 mt-4" />
        <div className="flex gap-3 mt-5">
          <div className="flex-1 h-9 bg-[#5C9E31]/8 rounded-xl" />
          <div className="flex-1 h-9 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Toast notification ─── */
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border
      backdrop-blur-sm transition-all duration-300
      ${
        type === "success"
          ? "bg-[#1a2e10] border-[#5C9E31]/40 text-[#A8E063]"
          : "bg-[#2e1010] border-red-500/30 text-red-400"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={18} />
      ) : (
        <AlertTriangle size={18} />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ─── Confirm dialog ─── */
function ConfirmDialog({ title, body, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#0e1a0f] border border-[#5C9E31]/15 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-red-500/10">
            <Trash2 size={18} className="text-red-400" />
          </span>
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold">
            {title}
          </h3>
        </div>
        <p className="text-sm text-white/50 leading-relaxed mb-8">{body}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/6 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Listing Card ─── */
function ListingCard({ item, onDelete, view }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (view === "list") {
    return (
      <div
        className="group flex gap-5 rounded-2xl border border-[#5C9E31]/12 bg-[#5C9E31]/[0.03]
        hover:border-[#5C9E31]/25 hover:bg-[#5C9E31]/[0.06] transition-all duration-300 overflow-hidden p-4"
      >
        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-white/6">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-white/8 rounded-xl" />
          )}
          <img
            src={item.image}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-block text-[10px] font-['Space_Mono',monospace] tracking-widest uppercase
                  px-2 py-0.5 rounded-full border mb-1.5 ${tagColor(item.category)}`}
                >
                  {item.category}
                </span>
                <h3 className="font-['Playfair_Display',serif] font-bold text-lg leading-snug line-clamp-1">
                  {item.title}
                </h3>
              </div>
              {item.type === "sale" ? (
                <p className="text-[#A8E063] font-['Space_Mono',monospace] font-bold text-xl flex-shrink-0">
                  ₹{item.price}
                </p>
              ) : (
                <p className="text-sky-400 font-['Space_Mono',monospace] font-bold text-xl flex-shrink-0">
                  ₹{item.rentPerDay}
                  <span className="text-sm text-white/40">/day</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {item.location}
              </span>
              <span className="flex items-center gap-1">
                <Package size={11} />
                {item.quantity} {item.quantityType}
              </span>
            </div>
          </div>
          <div className="flex gap-2.5 mt-3">
            <Link
              to={`/edit-listing/${item._id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/6 border border-white/10
                hover:bg-[#5C9E31]/20 hover:border-[#5C9E31]/40 text-xs font-semibold text-white/70 hover:text-[#A8E063]
                transition-all duration-200 active:scale-95"
            >
              <Pencil size={12} /> Edit
            </Link>
            <button
              onClick={() => onDelete(item._id, item.title)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/6 border border-white/10
                hover:bg-red-500/10 hover:border-red-500/30 text-xs font-semibold text-white/70 hover:text-red-400
                transition-all duration-200 active:scale-95"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-2xl border border-[#5C9E31]/12 bg-[#5C9E31]/[0.03] overflow-hidden
      hover:border-[#5C9E31]/28 hover:bg-[#5C9E31]/[0.06] transition-all duration-300"
    >
      {/* image */}
      <div className="relative h-52 overflow-hidden bg-white/6">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-white/8" />
        )}
        <img
          src={item.image}
          alt={item.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700
            ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* tag */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-['Space_Mono',monospace] tracking-widest uppercase
          px-2.5 py-1 rounded-full border backdrop-blur-sm ${tagColor(item.category)}`}
        >
          {item.category}
        </span>
        {/* type badge */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-['Space_Mono',monospace] tracking-wider uppercase
          px-2.5 py-1 rounded-full ${
            item.type === "sale"
              ? "bg-[#A8E063]/20 text-[#A8E063] border border-[#A8E063]/30"
              : "bg-sky-400/20 text-sky-300 border border-sky-400/30"
          }`}
        >
          {item.type === "sale" ? "Sale" : "Rent"}
        </span>
      </div>

      {/* body */}
      <div className="p-5">
        <h2 className="font-['Playfair_Display',serif] text-xl font-bold leading-snug line-clamp-1 mb-1">
          {item.title}
        </h2>
        <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Package size={11} />
            {item.quantity} {item.quantityType}
          </span>
        </div>

        {item.type === "sale" ? (
          <p className="font-['Space_Mono',monospace] text-2xl font-bold text-[#A8E063]">
            ₹{item.price}
          </p>
        ) : (
          <p className="font-['Space_Mono',monospace] text-2xl font-bold text-sky-400">
            ₹{item.rentPerDay}
            <span className="text-sm text-white/40">/day</span>
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <Link
            to={`/edit-listing/${item._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
              bg-white/6 border border-white/10 hover:bg-[#5C9E31]/20 hover:border-[#5C9E31]/40
              text-sm font-semibold text-white/70 hover:text-[#A8E063] transition-all duration-200 active:scale-95"
          >
            <Pencil size={13} /> Edit
          </Link>
          <button
            onClick={() => onDelete(item._id, item.title)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
              bg-white/6 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30
              text-sm font-semibold text-white/70 hover:text-red-400 transition-all duration-200 active:scale-95"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [filter, setFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/listings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data.listings);
    } catch (err) {
      console.error(err);
      showToast("Failed to load listings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeToast = () => setToast(null);

  /* request delete → open confirm dialog */
  const requestDelete = (id, title) => setDeleteTarget({ id, title });

  /* confirmed delete */
  const confirmDelete = async () => {
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Listing deleted successfully.");
      fetchListings();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Delete failed.", "error");
    }
  };

  /* filter tabs */
  const FILTERS = ["All", "Sale", "Rent"];
  const visible = listings.filter((l) => {
    if (filter === "All") return true;
    if (filter === "Sale") return l.type === "sale";
    if (filter === "Rent") return l.type !== "sale";
    return true;
  });

  const stats = {
    total: listings.length,
    sale: listings.filter((l) => l.type === "sale").length,
    rent: listings.filter((l) => l.type !== "sale").length,
  };

  return (
    <div className="min-h-screen bg-[#0C110D] text-white font-['Inter',sans-serif] overflow-x-hidden">
      {/* ── subtle green radial wash ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(92,158,49,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Noise texture ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]"
      />

      {/* ══════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════ */}
      <section className="relative pt-28 pb-14 px-5 sm:px-8 max-w-7xl mx-auto">
        {/* decorative glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5C9E31]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-[#5C9E31]/6 rounded-full blur-3xl pointer-events-none" />

        <Reveal>
          <p className="font-['Space_Mono',monospace] text-[11px] text-[#A8E063] tracking-[0.2em] uppercase mb-4">
            Dashboard · My Listings
          </p>
        </Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <Reveal delay={80}>
            <h1 className="font-['Playfair_Display',serif] text-5xl sm:text-6xl font-black leading-[1.05]">
              Your
              <br />
              <span className="text-[#A8E063]">Harvest</span> Hub
            </h1>
          </Reveal>

          <Reveal delay={160} from="right">
            <Link
              to="/add-listing"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl
                bg-[#5C9E31] hover:bg-[#4E8A28] font-bold text-sm transition-all duration-200
                active:scale-95 shadow-[0_0_30px_rgba(92,158,49,0.35)]"
            >
              <Plus
                size={17}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              Add New Listing
            </Link>
          </Reveal>
        </div>

        {/* ── stat chips ── */}
        <Reveal delay={200}>
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              {
                label: "Total",
                value: stats.total,
                color: "border-white/10 text-white/70",
              },
              {
                label: "For Sale",
                value: stats.sale,
                color: "border-[#A8E063]/30 text-[#A8E063]",
              },
              {
                label: "For Rent",
                value: stats.rent,
                color: "border-sky-400/30 text-sky-400",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full border
                  bg-[#5C9E31]/[0.05] backdrop-blur-sm ${color}`}
              >
                <span className="font-['Space_Mono',monospace] font-bold text-lg">
                  {value}
                </span>
                <span className="text-xs text-white/40 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════
          FILTER + VIEW TOGGLE BAR
      ══════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-[#0C110D]/85 backdrop-blur-xl border-b border-[#5C9E31]/12 px-5 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* filter tabs */}
          <div className="flex items-center gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    filter === f
                      ? "bg-[#5C9E31]/20 text-[#A8E063] border border-[#5C9E31]/40"
                      : "text-white/40 hover:text-white/70 hover:bg-white/6"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* view toggle */}
          <div className="flex items-center gap-1 bg-white/6 rounded-xl p-1">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-white/12 text-white" : "text-white/30 hover:text-white/60"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-white/12 text-white" : "text-white/30 hover:text-white/60"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        {/* SKELETON loading */}
        {loading && (
          <div
            className={
              view === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && visible.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#5C9E31]/8 border border-[#5C9E31]/20 grid place-items-center mb-6">
                <ShoppingCart size={32} className="text-[#5C9E31]/50" />
              </div>
              <h2 className="font-['Playfair_Display',serif] text-3xl font-bold mb-3">
                {filter === "All"
                  ? "No listings yet"
                  : `No ${filter.toLowerCase()} listings`}
              </h2>
              <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-8">
                {filter === "All"
                  ? "You haven't listed anything yet. Start by adding your first crop, dairy product, or tool."
                  : `You have no ${filter.toLowerCase()} listings. Try switching to a different filter.`}
              </p>
              {filter === "All" && (
                <Link
                  to="/add-listing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                    bg-[#5C9E31] hover:bg-[#4E8A28] font-bold text-sm transition-all active:scale-95
                    shadow-[0_0_20px_rgba(92,158,49,0.3)]"
                >
                  <Plus size={15} /> Add Your First Listing
                </Link>
              )}
            </div>
          </Reveal>
        )}

        {/* LISTING GRID / LIST */}
        {!loading && visible.length > 0 && (
          <div
            className={
              view === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {visible.map((item, i) => (
              <Reveal key={item._id} delay={i * 60}>
                <ListingCard item={item} onDelete={requestDelete} view={view} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── Confirm Delete dialog ── */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete listing?"
          body={`"${deleteTarget.title}" will be permanently removed. This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
