import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Package,
  ShoppingCart,
  ArrowRight,
  Tractor,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../services/api";

/* ════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   (same names as in Listings.jsx — move both copies into
   one shared file, e.g. src/styles/ui.js, and import them)
   ════════════════════════════════════════════════════ */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2";
const CARD =
  "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm hover:shadow-md transition-shadow duration-200";
const BTN_SM = `inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 ${FOCUS}`;
const BTN_OUTLINE_SM = `${BTN_SM} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const ICON_CHIP = `grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-[#EAF4E6] text-[#2E7D32] transition-colors duration-200 hover:bg-[#2E7D32] hover:text-white disabled:cursor-not-allowed ${FOCUS}`;
const TAG_BASE =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

/* ── category tag colors (design-system tag badges only) ── */
const CAT_COLOR = {
  Crops: "bg-amber-50 text-amber-800 border-amber-200",
  Vegetables: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Fruits: "bg-amber-50 text-amber-800 border-amber-200",
  Seeds: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Dairy: "bg-sky-50 text-sky-800 border-sky-200",
  Pulses: "bg-amber-50 text-amber-800 border-amber-200",
  Spices: "bg-amber-50 text-amber-800 border-amber-200",
  Fertilizers: "bg-slate-100 text-slate-700 border-slate-200",
  Tractor: "bg-slate-100 text-slate-700 border-slate-200",
};
const getCatColor = (cat) =>
  CAT_COLOR[cat] ?? "bg-slate-100 text-slate-700 border-slate-200";

export default function ListingCard({ item, viewMode = "grid" }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const handleAddToCart = async (e) => {
    e.preventDefault(); // don't navigate if card is wrapped in a Link //
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setAdding(true);
    setErrMsg("");
    try {
      await api.post(
        "/cart/add",
        { listingId: item._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Failed to add to cart");
      setTimeout(() => setErrMsg(""), 2500);
    } finally {
      setAdding(false);
    }
  };

  const isSale = item.type === "sale";
  const catColor = getCatColor(item.category);
  const priceText = isSale ? `₹${item.price}` : `₹${item.rentPerDay}`;
  const unitText = isSale ? `/${item.quantityType}` : "/day";

  /* soft-green cart button, shared by both views */
  const cartButton = (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={adding || added}
      aria-label={
        added
          ? "Added to cart"
          : adding
            ? "Adding to cart"
            : `Add ${item.title} to cart`
      }
      className={`${ICON_CHIP} ${
        added ? "bg-[#2E7D32] text-white" : ""
      } ${adding ? "cursor-wait opacity-70" : ""}`}
    >
      {added ? (
        <CheckCircle2 size={18} aria-hidden="true" />
      ) : adding ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border-2 border-[#2E7D32]/30 border-t-[#2E7D32] animate-spin motion-reduce:animate-none"
        />
      ) : (
        <ShoppingCart size={18} aria-hidden="true" />
      )}
    </button>
  );

  const showCart = user?.role === "buyer" && isSale && item.available;

  /* ── LIST VIEW ── */
  if (viewMode === "list") {
    return (
      <div className={`group flex items-center gap-4 sm:gap-5 p-4 ${CARD}`}>
        {/* thumb */}
        <div className="relative h-24 w-24 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-[#F6F8F4]">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {!item.available && (
            <div className="absolute inset-0 grid place-items-center bg-white/75">
              <span className="text-xs font-semibold text-[#5B6559]">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${TAG_BASE} ${catColor}`}>{item.category}</span>
            {item.available ? (
              <span
                className={`${TAG_BASE} bg-emerald-50 text-emerald-800 border-emerald-200`}
              >
                Available
              </span>
            ) : (
              <span
                className={`${TAG_BASE} bg-slate-100 text-slate-700 border-slate-200`}
              >
                Unavailable
              </span>
            )}
          </div>
          <h3 className="mt-2 truncate text-lg font-semibold text-[#1F2A1C]">
            {item.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5B6559]">
            <MapPin size={14} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{item.location}</span>
          </p>
          {/* price on small screens */}
          <p className="mt-1.5 text-base font-bold text-[#1F2A1C] sm:hidden">
            {priceText}
            <span className="text-sm font-normal text-[#5B6559]">
              {unitText}
            </span>
          </p>
        </div>

        {/* price + stock */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-xl font-bold text-[#1F2A1C]">
            {priceText}
            <span className="text-sm font-normal text-[#5B6559]">
              {unitText}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-[#5B6559]">
            Stock: {item.quantity} {item.quantityType}
          </p>
        </div>

        {/* actions */}
        <div className="flex shrink-0 items-center gap-2">
          {showCart && cartButton}
          <Link
            to={`/listings/${item._id}`}
            aria-label={`View details for ${item.title}`}
            className={BTN_OUTLINE_SM}
          >
            <span className="hidden sm:inline">Details</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <span role="status" className="sr-only">
          {added ? "Added to cart" : ""}
        </span>
      </div>
    );
  }

  /* ── GRID VIEW (default) ── */
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden ${CARD}`}
    >
      {/* image */}
      <div className="relative h-48 shrink-0 overflow-hidden bg-[#F6F8F4]">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {/* unavailable overlay */}
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="rounded-full border border-[#D5DBD0] bg-white px-4 py-2 text-sm font-semibold text-[#5B6559]">
              Currently unavailable
            </span>
          </div>
        )}

        {/* top left: category */}
        <span className={`absolute left-3 top-3 ${TAG_BASE} ${catColor}`}>
          {item.category}
        </span>

        {/* top right: type */}
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full border border-[#E4E8E1] bg-white px-2.5 py-1 text-xs font-semibold text-[#1F2A1C] shadow-sm">
          {isSale ? "Sale" : "Rent"}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-1 text-lg font-semibold leading-snug text-[#1F2A1C]">
          {item.title}
        </h2>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-[#5B6559]">
          <MapPin size={14} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{item.location}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5B6559]">
          <Package size={14} aria-hidden="true" className="shrink-0" />
          {item.quantity} {item.quantityType}
        </p>

        {/* availability */}
        <p
          className={`mt-3 flex items-center gap-1.5 text-sm font-semibold ${
            item.available ? "text-[#2E7D32]" : "text-[#7A8576]"
          }`}
        >
          {item.available ? (
            <>
              <CheckCircle2 size={14} aria-hidden="true" /> Available
            </>
          ) : (
            <>
              <XCircle size={14} aria-hidden="true" /> Unavailable
            </>
          )}
        </p>

        {/* error message */}
        {errMsg && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {errMsg}
          </p>
        )}

        {/* price + actions */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-xl font-bold text-[#1F2A1C]">
            {priceText}
            <span className="text-sm font-normal text-[#5B6559]">
              {unitText}
            </span>
          </p>

          <div className="flex items-center gap-2">
            {user?.role === "buyer" && (
              <>
                {isSale && item.available && cartButton}

                {!isSale && item.available && (
                  <Link
                    to={`/listings/${item._id}`}
                    aria-label={`Rent ${item.title}`}
                    className={ICON_CHIP}
                  >
                    <Tractor size={18} aria-hidden="true" />
                  </Link>
                )}

                {!item.available && (
                  <button
                    type="button"
                    disabled
                    aria-label="Currently unavailable"
                    className={`${ICON_CHIP} opacity-50 hover:bg-[#EAF4E6] hover:text-[#2E7D32]`}
                  >
                    <ShoppingCart size={18} aria-hidden="true" />
                  </button>
                )}
              </>
            )}

            <Link
              to={`/listings/${item._id}`}
              aria-label={`View details for ${item.title}`}
              className={BTN_OUTLINE_SM}
            >
              Details <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <span role="status" className="sr-only">
        {added ? "Added to cart" : ""}
      </span>
    </div>
  );
}
