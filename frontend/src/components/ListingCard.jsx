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

/* ── category tag colors ── */
const CAT_COLOR = {
  Crops: "text-amber-400   bg-amber-400/12   border-amber-400/25",
  Vegetables: "text-emerald-400 bg-emerald-400/12 border-emerald-400/25",
  Fruits: "text-rose-400    bg-rose-400/12    border-rose-400/25",
  Seeds: "text-lime-400    bg-lime-400/12    border-lime-400/25",
  Dairy: "text-sky-400     bg-sky-400/12     border-sky-400/25",
  Pulses: "text-orange-400  bg-orange-400/12  border-orange-400/25",
  Spices: "text-red-400     bg-red-400/12     border-red-400/25",
  Fertilizers: "text-violet-400  bg-violet-400/12  border-violet-400/25",
  Tractor: "text-slate-400   bg-slate-400/12   border-slate-400/25",
};
const getCatColor = (cat) =>
  CAT_COLOR[cat] ?? "text-white/50 bg-white/8 border-white/12";

/* ════════════════════════════════════════════════ */
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
    e.preventDefault(); // don't navigate if card is wrapped in a Link
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

  /* ── LIST VIEW ── */
  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-5 rounded-2xl bg-white/4 border border-white/8 hover:border-white/16 hover:bg-white/6 p-4 transition-all duration-200">
        {/* thumb */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/6 shrink-0">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-['Space_Mono',monospace] uppercase tracking-wider px-2 py-0.5 rounded-full border ${catColor}`}
            >
              {item.category}
            </span>
            {item.available ? (
              <span className="text-[10px] text-[#A8E063] bg-[#5C9E31]/12 border border-[#5C9E31]/25 px-2 py-0.5 rounded-full">
                Available
              </span>
            ) : (
              <span className="text-[10px] text-red-400  bg-red-400/10    border border-red-400/25    px-2 py-0.5 rounded-full">
                Unavailable
              </span>
            )}
          </div>
          <h3 className="font-['Playfair_Display',serif] font-bold text-base mt-1.5 truncate">
            {item.title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-white/40 mt-1">
            <MapPin size={11} /> {item.location}
          </p>
        </div>

        {/* price + stock */}
        <div className="shrink-0 text-right hidden sm:block">
          <p
            className={`font-bold text-lg ${isSale ? "text-[#A8E063]" : "text-sky-400"}`}
          >
            {isSale ? `₹${item.price}` : `₹${item.rentPerDay}`}
            <span className="text-xs text-white/35 font-normal">
              {isSale ? `/${item.quantityType}` : "/day"}
            </span>
          </p>
          <p className="text-xs text-white/35 mt-0.5">
            Stock: {item.quantity} {item.quantityType}
          </p>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/listings/${item._id}`}
            className="grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31]/15 hover:bg-[#5C9E31]/30 text-[#A8E063] border border-[#5C9E31]/25 transition-all active:scale-95"
          >
            <ArrowRight size={16} />
          </Link>
          {user?.role === "buyer" && isSale && item.available && (
            <button
              onClick={handleAddToCart}
              disabled={adding || added}
              className={`grid place-items-center w-9 h-9 rounded-xl border transition-all active:scale-95 ${
                added
                  ? "bg-[#5C9E31]/25 border-[#5C9E31]/40 text-[#A8E063]"
                  : "bg-white/6 border-white/10 text-white/55 hover:bg-white/12 hover:text-white"
              }`}
            >
              {added ? <CheckCircle2 size={16} /> : <ShoppingCart size={16} />}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── GRID VIEW (default) ── */
  return (
    <div className="group relative rounded-2xl bg-white/4 border border-white/8 hover:border-white/18 overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
      {/* image */}
      <div className="relative h-52 overflow-hidden bg-white/6">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

        {/* top left: category */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-['Space_Mono',monospace] uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm ${catColor}`}
        >
          {item.category}
        </span>

        {/* top right: type tag */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
            isSale
              ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
              : "bg-sky-400/15   text-sky-300   border-sky-400/30"
          }`}
        >
          {isSale ? "Sale" : "Rent"}
        </span>

        {/* unavailable overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="font-semibold text-red-400 text-sm bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-red-400/30">
              Currently Unavailable
            </span>
          </div>
        )}

        {/* bottom: price */}
        <div className="absolute bottom-3 left-4">
          <p
            className={`font-['Playfair_Display',serif] text-2xl font-bold drop-shadow-lg ${isSale ? "text-[#A8E063]" : "text-sky-300"}`}
          >
            {isSale ? `₹${item.price}` : `₹${item.rentPerDay}`}
            <span className="text-sm font-normal text-white/60 ml-1">
              {isSale ? `/${item.quantityType}` : "/day"}
            </span>
          </p>
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        <h2 className="font-['Playfair_Display',serif] text-lg font-bold leading-snug line-clamp-1">
          {item.title}
        </h2>

        <div className="flex items-center justify-between mt-2">
          <p className="flex items-center gap-1 text-xs text-white/40">
            <MapPin size={11} /> {item.location}
          </p>
          <p className="flex items-center gap-1 text-xs text-white/35">
            <Package size={11} /> {item.quantity} {item.quantityType}
          </p>
        </div>

        {/* availability */}
        <div
          className={`flex items-center gap-1.5 mt-3 text-xs font-semibold ${item.available ? "text-[#A8E063]" : "text-red-400"}`}
        >
          {item.available ? (
            <>
              <CheckCircle2 size={13} /> Available
            </>
          ) : (
            <>
              <XCircle size={13} /> Unavailable
            </>
          )}
        </div>

        {/* toast-style error */}
        {errMsg && (
          <p className="mt-2 text-xs text-red-400 bg-red-400/8 border border-red-400/20 px-3 py-2 rounded-lg">
            {errMsg}
          </p>
        )}

        {/* actions */}
        <div className="flex gap-2.5 mt-5">
          <Link
            to={`/listings/${item._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#5C9E31]/15 hover:bg-[#5C9E31]/28 text-[#A8E063] border border-[#5C9E31]/30 hover:border-[#5C9E31]/55 text-sm font-semibold transition-all active:scale-95"
          >
            View Details <ArrowRight size={14} />
          </Link>

          {user?.role === "buyer" && (
            <>
              {isSale && item.available && (
                <button
                  onClick={handleAddToCart}
                  disabled={adding || added}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${
                    added
                      ? "bg-[#5C9E31]/25 border-[#5C9E31]/45 text-[#A8E063]"
                      : adding
                        ? "bg-white/6 border-white/10 text-white/40 cursor-wait"
                        : "bg-white/6 border-white/10 text-white/65 hover:bg-white/12 hover:text-white hover:border-white/22"
                  }`}
                >
                  {added ? (
                    <>
                      <CheckCircle2 size={14} /> Added!
                    </>
                  ) : adding ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />{" "}
                      Adding…
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} /> Add to Cart
                    </>
                  )}
                </button>
              )}

              {!isSale && item.available && (
                <Link
                  to={`/listings/${item._id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 hover:border-sky-500/50 text-sm font-semibold transition-all active:scale-95"
                >
                  <Tractor size={14} /> Rent Now
                </Link>
              )}

              {!item.available && (
                <button
                  disabled
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-white/4 border border-white/8 text-white/25 text-sm font-semibold cursor-not-allowed"
                >
                  Unavailable
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
