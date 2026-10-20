/*
  OrganicFarm – My Listings (Design System v2: light & simple)
  Same tokens and patterns as the other app pages:
  page #F6F8F4 · card #FFFFFF · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
  Fonts (index.html): Inter only
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

/* ─── shared style primitives (same as other pages) ─── */
const container = "max-w-7xl mx-auto px-5 sm:px-8";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F8F4]";
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const btnOutline = `${btn} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const card = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
/* small card action buttons */
const actionBtn = `inline-flex items-center justify-center gap-1.5 h-10 rounded-xl border border-[#D5DBD0] bg-white text-sm font-semibold text-[#1F2A1C] transition-colors duration-200 active:scale-[0.98] ${focusRing}`;

/* ─── intersection reveal hook ─── */
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
      ? "-translate-x-4"
      : from === "right"
        ? "translate-x-4"
        : "translate-y-4";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0
        ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${translate}`}
        ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── tag colour map (light tints, readable text) ─── */
const TAG_COLOR = {
  Crop: "bg-amber-50 text-amber-800 border-amber-200",
  Dairy: "bg-sky-50 text-sky-800 border-sky-200",
  Seeds: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Rental: "bg-slate-100 text-slate-700 border-slate-200",
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
    <div
      className={`${card} overflow-hidden animate-pulse motion-reduce:animate-none`}
      aria-hidden="true"
    >
      <div className="h-48 bg-[#E9EDE6]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#E9EDE6] rounded-lg w-3/4" />
        <div className="h-3 bg-[#EEF1EB] rounded-lg w-1/2" />
        <div className="h-6 bg-[#E9EDE6] rounded-lg w-1/3 mt-4" />
        <div className="flex gap-3 mt-5">
          <div className="flex-1 h-10 bg-[#EEF1EB] rounded-xl" />
          <div className="flex-1 h-10 bg-[#EEF1EB] rounded-xl" />
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
      role={type === "success" ? "status" : "alert"}
      className={`fixed bottom-6 right-5 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border bg-white shadow-lg text-sm font-semibold animate-[slideUp_0.3s_ease-out] motion-reduce:animate-none
      ${
        type === "success"
          ? "border-[#2E7D32]/40 text-[#256628]"
          : "border-red-200 text-red-700"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={18} aria-hidden="true" />
      ) : (
        <AlertTriangle size={18} aria-hidden="true" />
      )}
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className={`ml-1 text-[#7A8576] hover:text-[#1F2A1C] transition-colors duration-200 rounded ${focusRing}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ─── Confirm dialog ─── */
function ConfirmDialog({ title, body, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative bg-white border border-[#E4E8E1] rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-xl animate-[popIn_0.2s_ease-out] motion-reduce:animate-none"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-red-50 border border-red-200">
            <Trash2 size={18} className="text-red-600" aria-hidden="true" />
          </span>
          <h3 id="confirm-title" className="text-lg font-semibold">
            {title}
          </h3>
        </div>
        <p className="text-sm text-[#5B6559] leading-relaxed mb-6">{body}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`${btnOutline} flex-1`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${btn} flex-1 bg-red-600 text-white hover:bg-red-700`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── price display ─── */
function Price({ item, size = "lg" }) {
  const cls = size === "lg" ? "text-2xl" : "text-xl";
  return item.type === "sale" ? (
    <p className={`${cls} font-bold text-[#1F2A1C]`}>₹{item.price}</p>
  ) : (
    <p className={`${cls} font-bold text-[#1F2A1C]`}>
      ₹{item.rentPerDay}
      <span className="text-sm font-normal text-[#5B6559]">/day</span>
    </p>
  );
}

/* ─── Listing Card ─── */
function ListingCard({ item, onDelete, view }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const imgProps = {
    src: item.image,
    alt: item.title,
    loading: "lazy",
    onLoad: () => setImgLoaded(true),
    onError: (e) => {
      e.currentTarget.style.display = "none";
      setImgLoaded(true);
    },
  };

  const deleteBtnHover =
    "hover:bg-red-50 hover:border-red-200 hover:text-red-700";

  if (view === "list") {
    return (
      <div
        className={`group flex flex-col sm:flex-row gap-4 sm:gap-5 ${card} hover:shadow-md transition-shadow duration-200 overflow-hidden p-4`}
      >
        <div className="relative w-full h-40 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[#EAF4E6]">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse motion-reduce:animate-none bg-[#E9EDE6]" />
          )}
          <img
            {...imgProps}
            className={`w-full h-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border mb-1.5 ${tagColor(item.category)}`}
                >
                  {item.category}
                </span>
                <h3 className="font-semibold text-lg leading-snug truncate">
                  {item.title}
                </h3>
              </div>
              <div className="shrink-0">
                <Price item={item} size="md" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-[13px] text-[#5B6559]">
              <span className="flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" />
                {item.location}
              </span>
              <span className="flex items-center gap-1">
                <Package size={12} aria-hidden="true" />
                {item.quantity} {item.quantityType}
              </span>
            </div>
          </div>
          <div className="flex gap-2.5 mt-3">
            <Link
              to={`/edit-listing/${item._id}`}
              className={`${actionBtn} px-4 hover:bg-[#EAF4E6] hover:border-[#2E7D32]/40 hover:text-[#256628]`}
            >
              <Pencil size={13} /> Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(item._id, item.title)}
              className={`${actionBtn} px-4 ${deleteBtnHover}`}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group h-full ${card} overflow-hidden hover:shadow-md transition-shadow duration-200`}
    >
      {/* image */}
      <div className="relative h-48 overflow-hidden bg-[#EAF4E6]">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse motion-reduce:animate-none bg-[#E9EDE6]" />
        )}
        <img
          {...imgProps}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 motion-reduce:transition-none
            ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
        {/* tag */}
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border ${tagColor(item.category)}`}
        >
          {item.category}
        </span>
        {/* type badge */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            item.type === "sale"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-sky-50 text-sky-800 border-sky-200"
          }`}
        >
          {item.type === "sale" ? "Sale" : "Rent"}
        </span>
      </div>

      {/* body */}
      <div className="p-5">
        <h2 className="text-lg font-semibold leading-snug truncate mb-1">
          {item.title}
        </h2>
        <div className="flex items-center gap-3 text-[13px] text-[#5B6559] mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={12} aria-hidden="true" />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Package size={12} aria-hidden="true" />
            {item.quantity} {item.quantityType}
          </span>
        </div>

        <Price item={item} />

        <div className="flex gap-3 mt-5">
          <Link
            to={`/edit-listing/${item._id}`}
            className={`${actionBtn} flex-1 hover:bg-[#EAF4E6] hover:border-[#2E7D32]/40 hover:text-[#256628]`}
          >
            <Pencil size={14} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(item._id, item.title)}
            className={`${actionBtn} flex-1 ${deleteBtnHover}`}
          >
            <Trash2 size={14} /> Delete
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
    <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif] overflow-x-hidden">
      {/* ══════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════ */}
      <section className={`${container} pt-28 pb-8`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <Reveal>
            <p className="text-sm font-semibold text-[#2E7D32] mb-1">
              Seller dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Your Harvest Hub
            </h1>
            <p className="text-[#5B6559] text-sm mt-2">
              Manage everything you've listed for sale or rent.
            </p>
          </Reveal>

          <Reveal delay={100} from="right">
            <Link to="/add-listing" className={`${btnPrimary} w-fit`}>
              <Plus size={16} />
              Add New Listing
            </Link>
          </Reveal>
        </div>

        {/* ── stat chips ── */}
        <Reveal delay={150}>
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { label: "Total", value: stats.total },
              { label: "For sale", value: stats.sale },
              { label: "For rent", value: stats.rent },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-5 h-11 rounded-full border border-[#E4E8E1] bg-white shadow-sm"
              >
                <span className="font-bold text-lg">{value}</span>
                <span className="text-sm text-[#5B6559]">{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════
          FILTER + VIEW TOGGLE BAR
          (sticks just below the 64px navbar)
      ══════════════════════════════════════════ */}
      <div className="sticky top-16 z-30 bg-white border-y border-[#E4E8E1]">
        <div
          className={`${container} py-3 flex items-center justify-between gap-4`}
        >
          {/* filter tabs */}
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Filter listings"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`px-4 h-10 rounded-full text-sm font-medium transition-colors duration-200 ${focusRing} ${
                  filter === f
                    ? "bg-[#2E7D32] text-white"
                    : "bg-white text-[#5B6559] border border-[#D5DBD0] hover:border-[#2E7D32] hover:text-[#2E7D32]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* view toggle */}
          <div
            className="flex items-center gap-1 bg-[#F6F8F4] border border-[#E4E8E1] rounded-xl p-1"
            role="group"
            aria-label="Layout"
          >
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={`grid place-items-center w-9 h-9 rounded-lg transition-colors duration-200 ${focusRing} ${view === "grid" ? "bg-white text-[#2E7D32] shadow-sm" : "text-[#7A8576] hover:text-[#1F2A1C]"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={`grid place-items-center w-9 h-9 rounded-lg transition-colors duration-200 ${focusRing} ${view === "list" ? "bg-white text-[#2E7D32] shadow-sm" : "text-[#7A8576] hover:text-[#1F2A1C]"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <section className={`${container} py-10 pb-20`}>
        {/* SKELETON loading */}
        {loading && (
          <div
            role="status"
            aria-label="Loading listings"
            className={
              view === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
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
            <div
              className={`${card} flex flex-col items-center justify-center py-20 px-6 text-center`}
            >
              <span className="grid place-items-center w-16 h-16 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mb-5">
                <ShoppingCart size={28} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold mb-2">
                {filter === "All"
                  ? "No listings yet"
                  : `No ${filter.toLowerCase()} listings`}
              </h2>
              <p className="text-sm text-[#5B6559] max-w-sm leading-relaxed mb-6">
                {filter === "All"
                  ? "You haven't listed anything yet. Start by adding your first crop, dairy product, or tool."
                  : `You have no ${filter.toLowerCase()} listings. Try switching to a different filter.`}
              </p>
              {filter === "All" && (
                <Link to="/add-listing" className={btnPrimary}>
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
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {visible.map((item, i) => (
              <Reveal key={item._id} delay={(i % 3) * 70}>
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
        @keyframes popIn {
          from { transform:scale(0.95); opacity:0; }
          to   { transform:scale(1);    opacity:1; }
        }
        @keyframes slideUp {
          from { transform:translateY(12px); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
      `}</style>
    </div>
  );
}
