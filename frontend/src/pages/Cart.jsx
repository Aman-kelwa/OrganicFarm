import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  Tag,
  MapPin,
  ShieldCheck,
  Truck,
  Leaf,
  Loader2,
  AlertTriangle,
  X,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import api from "../services/api";

/* ════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   (same names as in Listings.jsx / ListingCard.jsx — move
   them into one shared file, e.g. src/styles/ui.js)
   ════════════════════════════════════════════════════ */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2";
const CONTAINER = "max-w-7xl mx-auto px-5 sm:px-8";
const CARD = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const BTN = `inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-[#2E7D32] text-white hover:bg-[#256628] disabled:opacity-60 disabled:cursor-not-allowed`;
const BTN_OUTLINE = `${BTN} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const ICON_BTN = `grid place-items-center h-10 w-10 shrink-0 rounded-xl text-[#7A8576] hover:bg-[#F6F8F4] transition-colors duration-200 ${FOCUS}`;
const TAG_BASE =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

/* ── reveal: 600ms fade + 16px slide, once (`hero` = gentler 12px) ── */
function useReveal(threshold = 0.06) {
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
      { threshold },
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

/* ── skeleton ── */
function CartSkeleton() {
  return (
    <div
      className={`${CARD} flex gap-5 p-5 animate-pulse motion-reduce:animate-none`}
    >
      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-[#E4E8E1] shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-[#E4E8E1] rounded-full w-3/4" />
        <div className="h-3 bg-[#E4E8E1] rounded-full w-1/3" />
        <div className="flex gap-2 pt-4">
          <div className="h-10 w-28 bg-[#E4E8E1] rounded-xl" />
          <div className="h-10 w-20 bg-[#E4E8E1] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── delete confirm modal ── */
function RemoveModal({ title, onConfirm, onCancel }) {
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
        aria-labelledby="remove-modal-title"
        className="relative w-full max-w-sm rounded-2xl border border-[#E4E8E1] bg-white p-6 shadow-xl animate-[modalIn_0.2s_ease-out] motion-reduce:animate-none"
      >
        <div className="flex items-center gap-4 mb-5">
          <span className="grid place-items-center h-12 w-12 rounded-xl border border-red-200 bg-red-50 shrink-0">
            <Trash2 size={20} aria-hidden="true" className="text-red-800" />
          </span>
          <div>
            <h3
              id="remove-modal-title"
              className="text-lg font-semibold text-[#1F2A1C]"
            >
              Remove item?
            </h3>
            <p className="text-sm text-[#5B6559] mt-0.5">
              This will be removed from your cart.
            </p>
          </div>
        </div>
        <p className="text-sm text-[#5B6559] bg-[#F6F8F4] border border-[#E4E8E1] rounded-xl px-4 py-3 mb-6 line-clamp-1">
          “{title}”
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
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── quantity stepper ── */
function QuantityStepper({ quantity, listingId, stock, onUpdate, updating }) {
  const stepBtn = `grid place-items-center h-8 w-8 rounded-lg text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200 ${FOCUS}`;
  return (
    <div
      role="group"
      aria-label="Quantity"
      className="flex h-10 items-center gap-0.5 rounded-xl border border-[#D5DBD0] bg-white p-1"
    >
      <button
        type="button"
        disabled={quantity <= 1 || updating}
        onClick={() => onUpdate(listingId, quantity - 1)}
        aria-label="Decrease quantity"
        className={stepBtn}
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="w-9 text-center text-sm font-semibold text-[#1F2A1C]"
      >
        {updating ? (
          <Loader2
            size={14}
            aria-label="Updating"
            className="animate-spin motion-reduce:animate-none mx-auto text-[#2E7D32]"
          />
        ) : (
          quantity
        )}
      </span>
      <button
        type="button"
        disabled={quantity >= (stock ?? 99) || updating}
        onClick={() => onUpdate(listingId, quantity + 1)}
        aria-label="Increase quantity"
        className={stepBtn}
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null); // { id, title }
  const [updating, setUpdating] = useState(null); // listingId being updated
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState(null);

  /* ── derived ── */
  const totalAmount = cart.items.reduce(
    (acc, item) => acc + (item.listing?.price ?? 0) * item.quantity,
    0,
  );
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const isEmpty = cart.items.length === 0;

  /* ── fetch ── */
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.cart || { items: [] });
    } catch (err) {
      showToast("Failed to load cart.", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ── remove ── */
  const confirmRemove = async () => {
    if (!removing) return;
    const id = removing.id;
    setRemoving(null);
    // optimistic
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.listing?._id !== id),
    }));
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Item removed from cart.", true);
    } catch {
      fetchCart();
      showToast("Could not remove item.", false);
    }
  };

  /* ── update qty ── */
  const updateQuantity = async (listingId, quantity) => {
    setUpdating(listingId);
    // optimistic
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.listing?._id === listingId ? { ...i, quantity } : i,
      ),
    }));
    try {
      const token = localStorage.getItem("token");
      await api.put(
        "/cart/update",
        { listingId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch {
      fetchCart();
      showToast("Could not update quantity.", false);
    } finally {
      setUpdating(null);
    }
  };

  /* ── checkout ── */
  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/payment/create-order",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = res.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "OrganicFarm",
        description: "Order Payment",
        order_id: data.order.id,
        theme: { color: "#2E7D32" },
        handler: async (response) => {
          await verifyPayment(response);
        },
      };
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Checkout failed. Try again.",
        false,
      );
    } finally {
      setCheckingOut(false);
    }
  };

  /* ── verify ── */
  const verifyPayment = async (response) => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/payment/verify", response, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
      navigate("/payment-success");
    } catch (err) {
      showToast("Payment verification failed. Contact support.", false);
    }
  };

  /* ── toast ── */
  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
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
          {toast.ok ? (
            <CheckCircle2
              size={16}
              aria-hidden="true"
              className="shrink-0 text-[#2E7D32]"
            />
          ) : (
            <AlertTriangle
              size={16}
              aria-hidden="true"
              className="shrink-0 text-red-800"
            />
          )}
          {toast.msg}
        </div>
      )}

      {/* remove modal */}
      {removing && (
        <RemoveModal
          title={removing.title}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}

      {/* ── PAGE HEADER ── */}
      <header className="bg-[#F6F8F4] border-b border-[#E4E8E1] pt-28 pb-10 sm:pb-12">
        <div className={CONTAINER}>
          <Reveal hero>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2E7D32] mb-2">
                  Buyer
                </p>
                <h1 className="flex flex-wrap items-baseline gap-x-3 text-3xl sm:text-4xl font-bold tracking-tight">
                  My cart
                  {!loading && !isEmpty && (
                    <span className="text-base font-normal text-[#5B6559]">
                      ({totalItems} item{totalItems > 1 ? "s" : ""})
                    </span>
                  )}
                </h1>
              </div>
              <Link
                to="/listings"
                className={`group inline-flex items-center gap-2 rounded text-sm font-semibold text-[#2E7D32] hover:text-[#256628] transition-colors duration-200 ${FOCUS}`}
              >
                <ArrowLeft
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
                Continue shopping
              </Link>
            </div>
          </Reveal>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main>
        <div className={`${CONTAINER} py-10 sm:py-12`}>
          {/* ── LOADING ── */}
          {loading && (
            <div aria-busy="true" className="grid lg:grid-cols-3 gap-6">
              <span className="sr-only">Loading your cart</span>
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <CartSkeleton key={i} />
                ))}
              </div>
              <div
                className={`${CARD} h-72 animate-pulse motion-reduce:animate-none bg-[#F6F8F4]`}
              />
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && isEmpty && (
            <Reveal>
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                <span className="grid place-items-center h-16 w-16 rounded-2xl bg-[#EAF4E6] mb-6">
                  <ShoppingCart
                    size={28}
                    aria-hidden="true"
                    className="text-[#2E7D32]"
                  />
                </span>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  Your cart is empty
                </h2>
                <p className="text-sm text-[#5B6559] max-w-xs leading-relaxed mb-8">
                  Looks like you haven’t added anything yet. Head to the
                  marketplace to find fresh produce and farm equipment.
                </p>
                <Link to="/listings" className={BTN_PRIMARY}>
                  Browse marketplace <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          )}

          {/* ── CART CONTENT ── */}
          {!loading && !isEmpty && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* ── LEFT: CART ITEMS ── */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <Reveal key={item._id}>
                    <div
                      className={`group flex gap-4 sm:gap-5 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 ${CARD}`}
                    >
                      {/* image */}
                      <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl border border-[#E4E8E1] bg-[#F6F8F4]">
                        <img
                          src={item.listing?.image}
                          alt={item.listing?.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>

                      {/* info */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          {/* category + remove */}
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`${TAG_BASE} bg-emerald-50 text-emerald-800 border-emerald-200`}
                            >
                              {item.listing?.category}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRemoving({
                                  id: item.listing?._id,
                                  title: item.listing?.title,
                                })
                              }
                              aria-label={`Remove ${item.listing?.title ?? "item"} from cart`}
                              className={`${ICON_BTN} -mr-2 -mt-2 hover:text-red-800`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>

                          <h2 className="mt-1 line-clamp-1 text-lg font-semibold leading-snug">
                            {item.listing?.title}
                          </h2>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5B6559]">
                            <MapPin
                              size={14}
                              aria-hidden="true"
                              className="shrink-0"
                            />
                            <span className="truncate">
                              {item.listing?.location}
                            </span>
                          </p>
                        </div>

                        {/* quantity + price row */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <QuantityStepper
                            quantity={item.quantity}
                            listingId={item.listing?._id}
                            stock={item.listing?.quantity}
                            onUpdate={updateQuantity}
                            updating={updating === item.listing?._id}
                          />

                          <div className="text-right">
                            <p className="text-sm text-[#5B6559]">
                              ₹{item.listing?.price} × {item.quantity}
                            </p>
                            <p className="text-xl font-bold">
                              ₹
                              {(
                                item.listing?.price * item.quantity
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}

                {/* trust badges */}
                <Reveal>
                  <ul className="grid sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { icon: ShieldCheck, text: "Secure Razorpay checkout" },
                      { icon: Truck, text: "Local-first delivery" },
                      { icon: Leaf, text: "Verified farm sellers" },
                    ].map(({ icon: Icon, text }) => (
                      <li
                        key={text}
                        className="flex items-center gap-2.5 rounded-xl border border-[#E4E8E1] bg-[#F6F8F4] px-4 py-3 text-sm text-[#5B6559]"
                      >
                        <Icon
                          size={16}
                          aria-hidden="true"
                          className="shrink-0 text-[#2E7D32]"
                        />
                        {text}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              {/* ── RIGHT: ORDER SUMMARY ── */}
              <Reveal className="lg:sticky lg:top-24 lg:self-start">
                <div className={`${CARD} overflow-hidden`}>
                  {/* header */}
                  <div className="flex items-center gap-2 border-b border-[#E4E8E1] px-6 py-5">
                    <Tag
                      size={17}
                      aria-hidden="true"
                      className="text-[#2E7D32]"
                    />
                    <h2 className="text-lg font-semibold">Order summary</h2>
                  </div>

                  <div className="p-6">
                    {/* line items */}
                    <div className="mb-5 space-y-3">
                      {cart.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-start justify-between gap-3"
                        >
                          <span className="line-clamp-1 flex-1 text-sm leading-snug text-[#5B6559]">
                            {item.listing?.title} × {item.quantity}
                          </span>
                          <span className="shrink-0 text-sm font-semibold">
                            ₹
                            {(
                              item.listing?.price * item.quantity
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-[#E4E8E1] pt-4 text-sm text-[#5B6559]">
                      <div className="flex justify-between">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5">
                          <Truck size={14} aria-hidden="true" /> Delivery
                        </span>
                        <span className="font-semibold text-[#2E7D32]">
                          Free
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform fee</span>
                        <span className="font-semibold text-[#2E7D32]">₹0</span>
                      </div>
                    </div>

                    {/* total */}
                    <div className="mt-5 flex items-center justify-between rounded-xl bg-[#EAF4E6] px-5 py-4">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* checkout button */}
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className={`${BTN_PRIMARY} mt-5 w-full`}
                    >
                      {checkingOut ? (
                        <>
                          <Loader2
                            size={18}
                            aria-hidden="true"
                            className="animate-spin motion-reduce:animate-none"
                          />{" "}
                          Processing…
                        </>
                      ) : (
                        <>
                          <IndianRupee size={18} aria-hidden="true" /> Proceed
                          to checkout
                        </>
                      )}
                    </button>

                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[#7A8576]">
                      <ShieldCheck size={12} aria-hidden="true" /> Secured by
                      Razorpay
                    </p>
                  </div>
                </div>
              </Reveal>
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
      `}</style>
    </div>
  );
}
