/*
  OrganicFarm – Orders
  Light design system (white / soft-green, Inter, green #2E7D32)
  Status : 3 toggle buttons (Pending / Confirmed / Cancelled) — same
           onChange logic as before, disabled while the API call runs
  Stats  : Total / Pending / Confirmed (no "Total Spent")
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

/* ════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   (same names as the other pages — move them into one
   shared file, e.g. src/styles/ui.js, and import them)
   ════════════════════════════════════════════════════ */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2";
const CONTAINER = "max-w-7xl mx-auto px-5 sm:px-8";
const CARD = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const BTN = `inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold transition-colors duration-200 ${FOCUS}`;
const BTN_OUTLINE = `${BTN} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const BTN_SM = `inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 ${FOCUS}`;
const PILL = `inline-flex items-center gap-2 h-10 px-4 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${FOCUS}`;
const PILL_ACTIVE = "bg-[#2E7D32] border-[#2E7D32] text-white";
const PILL_IDLE =
  "bg-white border-[#D5DBD0] text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C]";
const TAG_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold";

/* ─── status config (design-system tag colors only) ─── */
const STATUS_CFG = {
  pending: {
    label: "Pending",
    Icon: Clock,
    tag: "bg-amber-50 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    Icon: CheckCircle2,
    tag: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    Icon: XCircle,
    tag: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

/* ─── reveal: 600ms fade + 16px slide, once (`hero` = gentler 12px) ─── */
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

function Reveal({ children, className = "", hero = false }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        visible
          ? "opacity-100 translate-y-0"
          : `opacity-0 motion-reduce:opacity-100 ${hero ? "translate-y-3" : "translate-y-4"}`
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── count-up (skipped when the user prefers reduced motion) ─── */
function useCountUp(target, duration = 1300, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (!target) {
      setVal(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    let t0 = null;
    let raf;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return val;
}

/* ─── Stat Card (3 only — no Total Spent) ─── */
function StatCard({ icon: Icon, label, value, loading }) {
  const [ref, visible] = useReveal();
  const count = useCountUp(
    typeof value === "number" ? value : 0,
    1300,
    visible,
  );
  return (
    <div
      ref={ref}
      className={`${CARD} p-4 sm:p-5 transition-[opacity,transform] duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 motion-reduce:opacity-100"
      }`}
    >
      <span className="grid place-items-center h-10 w-10 rounded-xl bg-[#EAF4E6] text-[#2E7D32] mb-3 sm:mb-4">
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="text-xs sm:text-sm text-[#5B6559] mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight">
        {loading ? "—" : count.toLocaleString()}
      </p>
    </div>
  );
}

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div
      className={`${CARD} overflow-hidden animate-pulse motion-reduce:animate-none`}
    >
      <div className="h-48 bg-[#E4E8E1]" />
      <div className="p-5 space-y-3">
        <div className="h-5 rounded-full w-3/4 bg-[#E4E8E1]" />
        <div className="h-3 rounded-full w-1/2 bg-[#E4E8E1]" />
        <div className="grid grid-cols-3 gap-2 pt-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#E4E8E1]" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-[#E4E8E1]" />
          ))}
        </div>
        <div className="h-10 rounded-xl bg-[#E4E8E1]" />
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
  const ok = type === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`fixed bottom-6 right-5 sm:right-8 z-[99999] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-[fadeUp_0.2s_ease-out] motion-reduce:animate-none ${
        ok
          ? "border-[#E4E8E1] bg-white text-[#1F2A1C]"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {ok ? (
        <CheckCircle2
          size={16}
          aria-hidden="true"
          className="shrink-0 text-[#2E7D32]"
        />
      ) : (
        <AlertTriangle size={16} aria-hidden="true" className="shrink-0" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className={`ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg opacity-60 hover:opacity-100 transition-opacity duration-200 ${FOCUS}`}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ─── Confirm Delete Dialog ─── */
function ConfirmDialog({ title, body, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return createPortal(
    <div className="fixed inset-0 z-[99998] flex items-center justify-center px-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#1F2A1C]/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm rounded-2xl border border-[#E4E8E1] bg-white p-6 shadow-xl animate-[fadeDown_0.2s_ease-out] motion-reduce:animate-none"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="grid place-items-center h-11 w-11 rounded-xl border border-red-200 bg-red-50 shrink-0">
            <Trash2 size={18} aria-hidden="true" className="text-red-800" />
          </span>
          <h3
            id="confirm-dialog-title"
            className="text-lg font-semibold text-[#1F2A1C]"
          >
            {title}
          </h3>
        </div>
        <p className="text-sm text-[#5B6559] leading-relaxed mb-6">{body}</p>
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
            Delete order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════
   STATUS TOGGLE BUTTONS
   — 3 buttons, active one is tinted with its status color
   — onChange fires exactly like the original <select>
   — disabled during the API call
═══════════════════════════════════════════════════ */
function StatusPills({ value, onChange, disabled }) {
  const options = ["pending", "confirmed", "cancelled"];

  return (
    <div role="group" aria-label="Order status" className="space-y-2">
      <p className="text-sm font-semibold">Order status</p>

      <div className="grid grid-cols-3 gap-2">
        {options.map((key) => {
          const cfg = STATUS_CFG[key];
          const { Icon } = cfg;
          const isActive = value === key;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-pressed={isActive}
              onClick={() => {
                if (!isActive && !disabled) onChange(key);
              }}
              className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-xs font-semibold transition-colors duration-200 disabled:cursor-not-allowed ${FOCUS} ${
                isActive
                  ? cfg.tag
                  : "border-[#D5DBD0] bg-white text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C]"
              } ${disabled && !isActive ? "opacity-50" : ""}`}
            >
              <Icon size={16} aria-hidden="true" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* saving indicator */}
      <p role="status" className="min-h-[1rem] text-xs text-[#7A8576]">
        {disabled ? "Saving status…" : ""}
      </p>
    </div>
  );
}

/* ─── Order Card ─── */
function OrderCard({ order, onUpdateStatus, onDeleteRequest }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const s = STATUS_CFG[order.orderStatus] || STATUS_CFG.pending;
  const StatusIcon = s.Icon;
  const canDelete =
    order.orderStatus === "confirmed" || order.orderStatus === "cancelled";
  const isRent = order.listing?.type === "rent";

  /* same as original updateStatus — fires on button click */
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onUpdateStatus(order._id, newStatus);
    setUpdating(false);
  };

  return (
    <Reveal className="h-full">
      <div
        className={`group flex h-full flex-col overflow-hidden hover:shadow-md transition-shadow duration-200 ${CARD}`}
      >
        {/* image */}
        <div className="relative h-48 shrink-0 overflow-hidden bg-[#F6F8F4]">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#E4E8E1] animate-pulse motion-reduce:animate-none" />
          )}
          <img
            src={order.listing?.image}
            alt={order.listing?.title}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              setImgLoaded(true);
            }}
            className={`h-full w-full object-cover transition-[transform,opacity] duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* type badge */}
          <span
            className={`absolute left-3 top-3 ${TAG_BASE} ${
              isRent
                ? "bg-sky-50 text-sky-800 border-sky-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <Leaf size={12} aria-hidden="true" />
            {isRent ? "Rental" : "Purchase"}
          </span>

          {/* status badge */}
          <span className={`absolute right-3 top-3 ${TAG_BASE} ${s.tag}`}>
            <StatusIcon size={12} aria-hidden="true" />
            {s.label}
          </span>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-5">
          <p className="flex items-center gap-1.5 text-sm text-[#5B6559]">
            <CalendarDays size={14} aria-hidden="true" />
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <h2 className="mt-1 mb-4 line-clamp-1 text-lg font-semibold leading-snug">
            {order.listing?.title}
          </h2>

          {/* buyer info */}
          <div className="mb-4 space-y-2 rounded-xl border border-[#E4E8E1] bg-[#F6F8F4] p-3.5">
            <div className="flex items-center gap-2.5 text-sm">
              <User
                size={14}
                aria-hidden="true"
                className="shrink-0 text-[#2E7D32]"
              />
              <span className="w-12 shrink-0 text-[#7A8576]">Buyer</span>
              <span className="truncate font-medium">{order.buyer?.name}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Mail
                size={14}
                aria-hidden="true"
                className="shrink-0 text-[#2E7D32]"
              />
              <span className="w-12 shrink-0 text-[#7A8576]">Email</span>
              <span className="truncate text-[#5B6559]">
                {order.buyer?.email}
              </span>
            </div>
          </div>

          {/* meta chips */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            {[
              { icon: Layers, label: "Qty", value: order.quantity },
              {
                icon: IndianRupee,
                label: "Total",
                value: `₹${order.totalPrice}`,
              },
              {
                icon: CreditCard,
                label: "Payment",
                value: order.paymentStatus,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-xl border border-[#E4E8E1] bg-white px-2 py-3 text-center"
              >
                <Icon
                  size={14}
                  aria-hidden="true"
                  className="mb-1 text-[#2E7D32]"
                />
                <p className="text-xs text-[#7A8576]">{label}</p>
                <p className="mt-0.5 break-words text-sm font-semibold capitalize">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* status buttons */}
          <div className="mb-4">
            <StatusPills
              value={order.orderStatus}
              onChange={handleStatusChange}
              disabled={updating}
            />
          </div>

          {/* delete */}
          <div className="mt-auto">
            {canDelete ? (
              <button
                type="button"
                onClick={() => onDeleteRequest(order._id, order.listing?.title)}
                className={`${BTN_SM} w-full border border-red-200 bg-white text-red-800 hover:bg-red-50`}
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete order
              </button>
            ) : (
              <div className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-[#E4E8E1] bg-[#F6F8F4] px-3 py-2 text-sm text-[#7A8576]">
                <Clock size={14} aria-hidden="true" />
                Can delete after confirm / cancel
              </div>
            )}
          </div>
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#1F2A1C] font-['Inter',sans-serif]">
      {/* ── PAGE HEADER ── */}
      <header className="bg-[#F6F8F4] border-b border-[#E4E8E1] pt-28 pb-10 sm:pb-12">
        <div className={CONTAINER}>
          <Reveal hero>
            <p className="text-sm font-semibold text-[#2E7D32] mb-2">
              My account · Orders
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                My orders
              </h1>
              <p className="text-base text-[#5B6559] max-w-md">
                Track every purchase and rental. Update statuses, manage your
                order history.
              </p>
            </div>
          </Reveal>

          {/* 3 stat cards — no Total Spent */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-10">
            <StatCard
              icon={ShoppingBag}
              label="Total orders"
              value={stats.total}
              loading={loading}
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={stats.pending}
              loading={loading}
            />
            <StatCard
              icon={CheckCircle2}
              label="Confirmed"
              value={stats.confirmed}
              loading={loading}
            />
          </div>
        </div>
      </header>

      {/* ── STICKY FILTER BAR ── */}
      <div className="sticky top-20 z-30 bg-white border-b border-[#E4E8E1]">
        <div className={`${CONTAINER} py-3`}>
          <div
            role="group"
            aria-label="Filter orders by status"
            className="-mx-1 flex items-center gap-2.5 overflow-x-auto px-1 py-1 scrollbar-hide"
          >
            <Filter
              size={14}
              aria-hidden="true"
              className="shrink-0 text-[#7A8576]"
            />
            {FILTERS.map((f) => {
              const sty = f === "all" ? null : STATUS_CFG[f];
              const active = filter === f;
              const count =
                f === "all"
                  ? orders.length
                  : orders.filter((o) => o.orderStatus === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={active}
                  className={`${PILL} ${active ? PILL_ACTIVE : PILL_IDLE}`}
                >
                  {sty && <sty.Icon size={14} aria-hidden="true" />}
                  {f === "all" ? "All orders" : sty.label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[#F6F8F4] text-[#5B6559]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <main className="bg-[#F6F8F4]">
        <div className={`${CONTAINER} py-10 sm:py-12`}>
          {loading && (
            <div
              aria-busy="true"
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <span className="sr-only">Loading orders</span>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && visible.length === 0 && (
            <Reveal>
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                <span className="grid place-items-center h-16 w-16 rounded-2xl bg-[#EAF4E6] mb-6">
                  <ClipboardList
                    size={28}
                    aria-hidden="true"
                    className="text-[#2E7D32]"
                  />
                </span>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  {filter === "all" ? "No orders yet" : `No ${filter} orders`}
                </h2>
                <p className="text-sm text-[#5B6559] max-w-sm leading-relaxed">
                  {filter === "all"
                    ? "You haven’t placed any orders yet. Browse the marketplace to get started."
                    : `You have no ${filter} orders right now.`}
                </p>
              </div>
            </Reveal>
          )}

          {!loading && visible.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visible.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={updateStatus}
                  onDeleteRequest={requestDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this order?"
          body={`“${deleteTarget.title || "This order"}” will be permanently removed.`}
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
        @keyframes fadeDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        .scrollbar-hide::-webkit-scrollbar { display:none }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none }
      `}</style>
    </div>
  );
}
