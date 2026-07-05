/*
  OrganicFarm – Buyer Orders
  Theme  : Light lime-green (#0E1A0C base, lime-300/400 accents)
  Status : 3 animated pill buttons (Pending / Confirmed / Cancelled)
           — same onChange logic as original, 100% functional
  Removed: "Total Spent" stat card
*/

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import {
  ShoppingBag,
  User,
  Mail,
  CreditCard,
  IndianRupee,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  X,
  ClipboardList,
  Trash2,
  Package,
  Leaf,
  CalendarDays,
  Filter,
} from "lucide-react";

/* ── Lime-green theme ── */
const T = {
  bg: "#0E1A0C",
  bgCard: "#121f0f",
  border: "rgba(163,230,53,0.12)" /* lime-400 */,
  borderHov: "rgba(163,230,53,0.30)",
  accent: "#bef264" /* lime-300 */,
  accentMid: "#84cc16" /* lime-500 */,
  accentDim: "#4d7c0f" /* lime-700 */,
  gold: "#fbbf24",
  red: "#f87171",
};

/* ─── status pill config ─── */
const STATUS_CFG = {
  pending: {
    label: "Pending",
    Icon: Clock,
    text: "#fbbf24",
    border: "rgba(251,191,36,0.35)",
    bg: "rgba(251,191,36,0.10)",
    glow: "rgba(251,191,36,0.25)",
    dot: "#fbbf24",
  },
  confirmed: {
    label: "Confirmed",
    Icon: CheckCircle2,
    text: "#a3e635",
    border: "rgba(163,230,53,0.35)",
    bg: "rgba(163,230,53,0.10)",
    glow: "rgba(163,230,53,0.25)",
    dot: "#a3e635",
  },
  cancelled: {
    label: "Cancelled",
    Icon: XCircle,
    text: "#f87171",
    border: "rgba(248,113,113,0.35)",
    bg: "rgba(248,113,113,0.10)",
    glow: "rgba(248,113,113,0.25)",
    dot: "#f87171",
  },
};

/* ─── reveal hook ─── */
function useReveal(threshold = 0.1) {
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

function Reveal({ children, delay = 0, from = "bottom", className = "" }) {
  const [ref, visible] = useReveal();
  const t =
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
        ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${t}`} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── count-up ─── */
function useCountUp(target, duration = 1300, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

/* ─── Stat Card (3 only — no Total Spent) ─── */
function StatCard({ icon: Icon, label, value, color, delay }) {
  const [ref, visible] = useReveal();
  const count = useCountUp(
    typeof value === "number" ? value : 0,
    1300,
    visible,
  );
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className="relative rounded-2xl p-5 overflow-hidden transition-all duration-300"
        style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.border = `1px solid ${T.borderHov}`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.border = `1px solid ${T.border}`)
        }
      >
        <div
          className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none"
          style={{ background: color + "18", transform: "translate(40%,-40%)" }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg,transparent,${color}60,transparent)`,
          }}
        />
        <span
          className="inline-grid place-items-center w-11 h-11 rounded-xl mb-4"
          style={{ background: color + "18", color }}
        >
          <Icon size={20} />
        </span>
        <p className="font-['Space_Mono',monospace] text-[10px] text-white/30 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p
          className="font-['Playfair_Display',serif] text-4xl font-black"
          style={{ color }}
        >
          {count.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
    >
      <div className="h-52" style={{ background: "rgba(163,230,53,0.05)" }} />
      <div className="p-5 space-y-3">
        <div
          className="h-5 rounded-lg w-3/4"
          style={{ background: "rgba(163,230,53,0.09)" }}
        />
        <div
          className="h-3 rounded-lg w-1/2"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <div className="flex gap-3 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 h-16 rounded-xl"
              style={{ background: "rgba(163,230,53,0.05)" }}
            />
          ))}
        </div>
        {/* 3 status pill skeletons */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-10 rounded-xl"
              style={{ background: "rgba(163,230,53,0.06)" }}
            />
          ))}
        </div>
        <div
          className="h-10 rounded-xl mt-2"
          style={{ background: "rgba(248,113,113,0.05)" }}
        />
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-5 py-4 rounded-2xl
      shadow-2xl border backdrop-blur-md animate-[fadeUp_0.3s_ease]
      ${
        type === "success"
          ? "bg-[#0e1f08] border-lime-500/30 text-lime-300"
          : "bg-[#1f0f0f] border-red-500/25 text-red-400"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={17} />
      ) : (
        <AlertTriangle size={17} />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={13} />
      </button>
    </div>
  );
}

/* ─── Confirm Delete Dialog ─── */
function ConfirmDialog({ title, body, onConfirm, onCancel }) {
  return createPortal(
    <div className="fixed inset-0 z-[99998] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/72 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-[fadeDown_0.2s_ease]"
        style={{
          background: "#0d1f08",
          border: "1px solid rgba(248,113,113,0.22)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(248,113,113,0.5),transparent)",
          }}
        />
        <div className="flex items-center gap-3 mb-4">
          <span
            className="grid place-items-center w-11 h-11 rounded-2xl flex-shrink-0"
            style={{
              background: "rgba(248,113,113,0.10)",
              border: "1px solid rgba(248,113,113,0.22)",
            }}
          >
            <Trash2 size={18} style={{ color: T.red }} />
          </span>
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold">
            {title}
          </h3>
        </div>
        <p className="text-sm text-white/45 leading-relaxed mb-8">{body}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/50 font-medium hover:text-white/80 transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: "#dc2626" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
          >
            Delete Order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════
   ANIMATED STATUS PILLS
   — 3 clickable buttons, active one glows + pulses
   — onChange fires exactly like original <select>
   — disabled during API call
═══════════════════════════════════════════════════ */
function StatusPills({ value, onChange, disabled }) {
  const options = ["pending", "confirmed", "cancelled"];

  return (
    <div className="space-y-2">
      <p className="font-['Space_Mono',monospace] text-[10px] text-white/28 uppercase tracking-widest">
        Order Status
      </p>

      <div className="grid grid-cols-3 gap-2">
        {options.map((key) => {
          const cfg = STATUS_CFG[key];
          const { Icon } = cfg;
          const isActive = value === key;

          return (
            <button
              key={key}
              disabled={disabled}
              onClick={() => {
                if (!isActive && !disabled) onChange(key);
              }}
              className="relative flex flex-col items-center justify-center gap-1.5 py-3 px-2
                rounded-xl text-center transition-all duration-300 overflow-hidden
                active:scale-95 disabled:cursor-not-allowed"
              style={{
                background: isActive ? cfg.bg : "rgba(255,255,255,0.03)",
                border: isActive
                  ? `1.5px solid ${cfg.border}`
                  : "1.5px solid rgba(255,255,255,0.07)",
                color: isActive ? cfg.text : "rgba(255,255,255,0.35)",
                boxShadow: isActive ? `0 0 16px ${cfg.glow}` : "none",
                transform: isActive ? "translateY(-1px)" : "translateY(0)",
                opacity: disabled && !isActive ? 0.45 : 1,
              }}
            >
              {/* active shimmer sweep */}
              {isActive && (
                <div
                  className="absolute inset-0 pointer-events-none animate-[shimmer_2s_ease-in-out_infinite]"
                  style={{
                    background: `linear-gradient(105deg,transparent 40%,${cfg.glow} 50%,transparent 60%)`,
                  }}
                />
              )}

              {/* glow dot */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: cfg.dot,
                  boxShadow: isActive ? `0 0 8px ${cfg.dot}` : "none",
                  opacity: isActive ? 1 : 0.35,
                  animation: isActive
                    ? "pulse 1.5s ease-in-out infinite"
                    : "none",
                }}
              />

              <Icon size={14} />

              <span className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-wider leading-none">
                {cfg.label}
              </span>

              {/* active underline bar */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{
                    background: cfg.dot,
                    boxShadow: `0 0 6px ${cfg.dot}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* saving indicator */}
      {disabled && (
        <p
          className="text-center text-[10px] font-['Space_Mono',monospace] animate-pulse"
          style={{ color: T.accentMid }}
        >
          Saving status…
        </p>
      )}
    </div>
  );
}

/* ─── Order Card ─── */
function OrderCard({ order, onUpdateStatus, onDeleteRequest, index }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const s = STATUS_CFG[order.orderStatus] || STATUS_CFG.pending;
  const canDelete =
    order.orderStatus === "confirmed" || order.orderStatus === "cancelled";

  /* same as original updateStatus — fires on pill click */
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onUpdateStatus(order._id, newStatus);
    setUpdating(false);
  };

  return (
    <Reveal delay={index * 70}>
      <div
        className="group relative rounded-2xl transition-all duration-300"
        style={{
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          boxShadow: "0 4px 28px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.border = `1px solid ${T.borderHov}`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.border = `1px solid ${T.border}`)
        }
      >
        {/* top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl pointer-events-none"
          style={{
            background: `linear-gradient(90deg,transparent,${T.accentMid}80,transparent)`,
          }}
        />

        {/* image */}
        <div
          className="relative h-52 overflow-hidden rounded-t-2xl"
          style={{ background: "rgba(163,230,53,0.03)" }}
        >
          {!imgLoaded && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: "rgba(163,230,53,0.06)" }}
            />
          )}
          <img
            src={order.listing?.image}
            alt={order.listing?.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700
              group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top,rgba(14,26,12,0.94) 0%,rgba(14,26,12,0.08) 55%,transparent 100%)",
            }}
          />

          {/* status badge */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full
            text-[10px] font-['Space_Mono',monospace] tracking-wider uppercase backdrop-blur-sm"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              color: s.text,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: s.dot }}
            />
            {s.label}
          </div>

          {/* type badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full
            text-[10px] font-['Space_Mono',monospace] tracking-wider uppercase backdrop-blur-sm"
            style={{
              background: "rgba(163,230,53,0.10)",
              border: "1px solid rgba(163,230,53,0.25)",
              color: T.accent,
            }}
          >
            <Leaf size={10} />
            {order.listing?.type === "rent" ? "Rental" : "Purchase"}
          </div>

          {/* date */}
          <p
            className="absolute bottom-3 left-4 font-['Space_Mono',monospace] text-[10px]
            text-white/35 tracking-widest flex items-center gap-1.5"
          >
            <CalendarDays size={10} />
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* body */}
        <div className="p-5">
          <h2 className="font-['Playfair_Display',serif] text-xl font-bold leading-snug line-clamp-1 mb-4">
            {order.listing?.title}
          </h2>

          {/* buyer info */}
          <div
            className="rounded-xl p-3.5 mb-4 space-y-2"
            style={{
              background: "rgba(163,230,53,0.04)",
              border: "1px solid rgba(163,230,53,0.10)",
            }}
          >
            <div className="flex items-center gap-2.5 text-sm">
              <User
                size={13}
                style={{ color: T.accentMid }}
                className="flex-shrink-0"
              />
              <span className="font-['Space_Mono',monospace] text-[10px] text-white/28 uppercase tracking-wider w-10">
                Buyer
              </span>
              <span className="text-white/85 font-medium truncate">
                {order.buyer?.name}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Mail
                size={13}
                style={{ color: T.accentMid }}
                className="flex-shrink-0"
              />
              <span className="font-['Space_Mono',monospace] text-[10px] text-white/28 uppercase tracking-wider w-10">
                Email
              </span>
              <span className="text-white/55 truncate">
                {order.buyer?.email}
              </span>
            </div>
          </div>

          {/* meta chips */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              {
                icon: Layers,
                label: "Qty",
                value: order.quantity,
                color: T.accent,
              },
              {
                icon: IndianRupee,
                label: "Total",
                value: `₹${order.totalPrice}`,
                color: T.accent,
              },
              {
                icon: CreditCard,
                label: "Payment",
                value: order.paymentStatus,
                color: "#a3e635",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-xl text-center"
                style={{
                  background: "rgba(163,230,53,0.04)",
                  border: "1px solid rgba(163,230,53,0.09)",
                }}
              >
                <Icon size={13} className="mb-1" style={{ color }} />
                <p className="font-['Space_Mono',monospace] text-[9px] text-white/28 uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── ANIMATED STATUS PILLS ── */}
          <div className="mb-4">
            <StatusPills
              value={order.orderStatus}
              onChange={handleStatusChange}
              disabled={updating}
            />
          </div>

          {/* Delete button */}
          {canDelete ? (
            <button
              onClick={() => onDeleteRequest(order._id, order.listing?.title)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-200 active:scale-95"
              style={{
                background: "rgba(248,113,113,0.07)",
                border: "1px solid rgba(248,113,113,0.18)",
                color: "rgba(248,113,113,0.70)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(220,38,38,0.16)";
                e.currentTarget.style.borderColor = "rgba(248,113,113,0.42)";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(248,113,113,0.07)";
                e.currentTarget.style.borderColor = "rgba(248,113,113,0.18)";
                e.currentTarget.style.color = "rgba(248,113,113,0.70)";
              }}
            >
              <Trash2 size={14} />
              Delete Order
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-[11px] font-['Space_Mono',monospace] tracking-wider"
              style={{
                background: "rgba(251,191,36,0.05)",
                border: "1px solid rgba(251,191,36,0.12)",
                color: "rgba(251,191,36,0.42)",
              }}
            >
              <Clock size={12} />
              Can delete after confirm / cancel
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════ */
export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/orders/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load orders.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* ── identical to original updateStatus ── */
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/orders/${id}/status`,
        { orderStatus: status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, orderStatus: status } : order,
        ),
      );
      setToast({ message: "Order status updated!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message: err.response?.data?.message || "Failed to update status.",
        type: "error",
      });
    }
  };

  /* ── identical to original deleteOrder ── */
  const requestDelete = (id, title) => setDeleteTarget({ id, title });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/orders/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) =>
        prev.filter((order) => order._id !== deleteTarget.id),
      );
      setToast({ message: "Order deleted successfully.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message: err.response?.data?.message || "Delete failed.",
        type: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ── 3 filters only — no "Total Spent" ── */
  const FILTERS = ["all", "pending", "confirmed", "cancelled"];
  const visible =
    filter === "all" ? orders : orders.filter((o) => o.orderStatus === filter);
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "pending").length,
    confirmed: orders.filter((o) => o.orderStatus === "confirmed").length,
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: T.bg }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl grid place-items-center animate-pulse"
            style={{ background: "rgba(163,230,53,0.12)" }}
          >
            <Package size={22} style={{ color: T.accentMid }} />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: T.accentMid,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
          <p className="font-['Space_Mono',monospace] text-[11px] text-white/25 tracking-widest">
            Loading orders…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white font-['Inter',sans-serif] overflow-x-hidden"
      style={{ background: T.bg }}
    >
      {/* lime radial washes */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(132,204,22,0.08) 0%, transparent 65%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(163,230,53,0.04) 0%, transparent 60%)",
        }}
      />
      {/* noise */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]"
      />

      {/* HEADER */}
      <section className="relative pt-28 pb-10 px-5 sm:px-8 max-w-7xl mx-auto">
        <div
          className="absolute top-10 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(132,204,22,0.07)" }}
        />
        <div
          className="absolute top-24 right-1/4 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(163,230,53,0.04)" }}
        />

        <Reveal>
          <p
            className="font-['Space_Mono',monospace] text-[11px] tracking-[0.22em] uppercase mb-4"
            style={{ color: T.accent }}
          >
            My Account · Orders
          </p>
        </Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <Reveal delay={80}>
            <h1 className="font-['Playfair_Display',serif] text-5xl sm:text-6xl font-black leading-[1.05]">
              My <span style={{ color: T.accent }}>Orders</span>
            </h1>
          </Reveal>
          <Reveal delay={140} from="right">
            <p className="text-sm text-white/28 max-w-xs leading-relaxed">
              Track every purchase and rental. Update statuses, manage your
              order history.
            </p>
          </Reveal>
        </div>

        {/* 3 stat cards — no Total Spent */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.total}
            color={T.accent}
            delay={0}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color={T.gold}
            delay={80}
          />
          <StatCard
            icon={CheckCircle2}
            label="Confirmed"
            value={stats.confirmed}
            color="#a3e635"
            delay={160}
          />
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl px-5 sm:px-8 py-3"
        style={{
          background: `${T.bg}CC`,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter
            size={13}
            className="flex-shrink-0 mr-1"
            style={{ color: "rgba(163,230,53,0.35)" }}
          />
          {FILTERS.map((f) => {
            const sty = f === "all" ? null : STATUS_CFG[f];
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium
                  transition-all duration-200 whitespace-nowrap flex-shrink-0"
                style={
                  active
                    ? {
                        background: "rgba(163,230,53,0.10)",
                        border: "1px solid rgba(163,230,53,0.32)",
                        color: T.accent,
                      }
                    : {
                        color: "rgba(255,255,255,0.35)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                }}
              >
                {sty && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: sty.dot }}
                  />
                )}
                {f === "all" ? "All Orders" : sty.label}
                <span
                  className="font-['Space_Mono',monospace] text-[10px] px-1.5 py-0.5 rounded-md"
                  style={{
                    background: "rgba(163,230,53,0.07)",
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  {f === "all"
                    ? orders.length
                    : orders.filter((o) => o.orderStatus === f).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        {loading && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && visible.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div
                className="w-20 h-20 rounded-3xl grid place-items-center mb-6"
                style={{
                  background: "rgba(163,230,53,0.07)",
                  border: `1px solid ${T.border}`,
                }}
              >
                <ClipboardList
                  size={32}
                  style={{ color: "rgba(163,230,53,0.45)" }}
                />
              </div>
              <h2 className="font-['Playfair_Display',serif] text-3xl font-bold mb-3">
                {filter === "all" ? "No orders yet" : `No ${filter} orders`}
              </h2>
              <p className="text-sm text-white/28 max-w-sm leading-relaxed">
                {filter === "all"
                  ? "You haven't placed any orders yet. Browse the marketplace to get started."
                  : `You have no ${filter} orders right now.`}
              </p>
            </div>
          </Reveal>
        )}

        {!loading && visible.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visible.map((order, i) => (
              <OrderCard
                key={order._id}
                order={order}
                onUpdateStatus={updateStatus}
                onDeleteRequest={requestDelete}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this order?"
          body={`"${deleteTarget.title || "This order"}" will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes fadeDown  { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .scrollbar-hide::-webkit-scrollbar { display:none }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none }
      `}</style>
    </div>
  );
}
