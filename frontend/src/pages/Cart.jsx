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

/* ── reveal ── */
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
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, v] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-600 ease-out
        ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── skeleton ── */
function CartSkeleton() {
  return (
    <div className="flex gap-5 rounded-2xl bg-[#0a140a] border border-[#182e14] p-5 animate-pulse">
      <div className="w-28 h-28 rounded-xl bg-white/8 shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
        <div className="h-3 bg-white/7  rounded-full w-1/3" />
        <div className="flex gap-2 mt-4">
          <div className="h-9 w-24 bg-white/8 rounded-xl" />
          <div className="h-9 w-20 bg-white/8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── delete confirm modal ── */
function RemoveModal({ title, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative w-full max-w-sm bg-[#0a140a] border border-[#1e3a18] rounded-3xl p-7
        shadow-[0_30px_80px_rgba(0,0,0,0.8)] animate-[popIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]"
      >
        <div className="flex items-center gap-4 mb-5">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-red-500/12 border border-red-500/25 shrink-0">
            <Trash2 size={20} className="text-red-400" />
          </span>
          <div>
            <h3 className="font-['Playfair_Display',serif] text-lg font-bold">
              Remove item?
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              This will be removed from your cart.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/55 bg-white/4 border border-white/8 rounded-xl px-4 py-3 mb-6 line-clamp-1">
          "{title}"
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/12 text-white/60
              hover:bg-white/6 font-semibold text-sm transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white
              font-semibold text-sm transition-all active:scale-95 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
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
  return (
    <div className="flex items-center gap-0.5 bg-[#0f1f0d] border border-[#1e3a18] rounded-xl p-1">
      <button
        disabled={quantity <= 1 || updating}
        onClick={() => onUpdate(listingId, quantity - 1)}
        className="w-8 h-8 rounded-lg grid place-items-center text-white/50
          hover:bg-white/8 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed
          transition-all active:scale-90"
      >
        <Minus size={14} />
      </button>
      <span className="w-9 text-center text-sm font-bold text-white">
        {updating ? (
          <Loader2 size={14} className="animate-spin mx-auto text-[#A8E063]" />
        ) : (
          quantity
        )}
      </span>
      <button
        disabled={quantity >= (stock ?? 99) || updating}
        onClick={() => onUpdate(listingId, quantity + 1)}
        className="w-8 h-8 rounded-lg grid place-items-center text-white/50
          hover:bg-white/8 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed
          transition-all active:scale-90"
      >
        <Plus size={14} />
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
        theme: { color: "#5C9E31" },
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
    <div className="min-h-screen bg-[#060A06] text-white font-['Inter',sans-serif] relative">
      {/* ambient blobs */}
      <div
        aria-hidden
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#0d2208]/60 blur-[130px] pointer-events-none -translate-x-1/3 -translate-y-1/3"
      />
      <div
        aria-hidden
        className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#071a04]/50 blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4"
      />

      {/* toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
          rounded-2xl border text-sm font-semibold shadow-2xl animate-[slideRight_0.3s_ease-out] ${
            toast.ok
              ? "bg-[#0a140a] border-[#5C9E31]/40 text-[#A8E063]"
              : "bg-[#140a0a] border-red-500/40   text-red-400"
          }`}
        >
          {toast.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
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

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-24">
        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-2">
                Buyer
              </p>
              <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold flex items-center gap-4">
                My Cart
                {!loading && !isEmpty && (
                  <span className="text-xl font-normal text-white/30 font-['Inter',sans-serif]">
                    ({totalItems} item{totalItems > 1 ? "s" : ""})
                  </span>
                )}
              </h1>
            </div>
            <Link
              to="/listings"
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white
                transition-colors group"
            >
              <ArrowLeft
                size={15}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Continue shopping
            </Link>
          </div>
        </Reveal>

        {/* ── LOADING ── */}
        {loading && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <CartSkeleton key={i} />
              ))}
            </div>
            <div className="h-72 rounded-2xl bg-[#0a140a] border border-[#182e14] animate-pulse" />
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && isEmpty && (
          <Reveal>
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="relative mb-8">
                <span className="grid place-items-center w-28 h-28 rounded-3xl bg-[#0a140a] border border-[#1e3a18]">
                  <ShoppingCart size={46} className="text-white/12" />
                </span>
                <span
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#5C9E31]/20
                  border border-[#5C9E31]/40 grid place-items-center"
                >
                  <X size={12} className="text-[#A8E063]" />
                </span>
              </div>
              <h2 className="font-['Playfair_Display',serif] text-3xl font-bold mb-3">
                Your cart is empty
              </h2>
              <p className="text-white/35 max-w-xs text-sm leading-relaxed mb-8">
                Looks like you haven't added anything yet. Head to the
                marketplace to find fresh produce and farm equipment.
              </p>
              <Link
                to="/listings"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#5C9E31]
                  hover:bg-[#4e8a28] font-semibold text-sm transition-all active:scale-95
                  shadow-[0_0_24px_rgba(92,158,49,0.4)]"
              >
                Browse Marketplace <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        )}

        {/* ── CART CONTENT ── */}
        {!loading && !isEmpty && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ── LEFT: CART ITEMS ── */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, i) => (
                <Reveal key={item._id} delay={i * 60}>
                  <div
                    className="group relative flex gap-5 rounded-2xl bg-[#0a140a] border border-[#182e14]
                    hover:border-[#2d5c1e] p-5 transition-all duration-300
                    hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
                  >
                    {/* image */}
                    <div
                      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden
                      bg-[#0f1f0d] border border-[#1e3a18] shrink-0"
                    >
                      <img
                        src={item.listing?.image}
                        alt={item.listing?.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {/* category + remove */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className="text-[10px] font-['Space_Mono',monospace] uppercase tracking-wider
                            text-[#A8E063] bg-[#5C9E31]/12 border border-[#5C9E31]/25 px-2 py-0.5 rounded-full"
                          >
                            {item.listing?.category}
                          </span>
                          <button
                            onClick={() =>
                              setRemoving({
                                id: item.listing?._id,
                                title: item.listing?.title,
                              })
                            }
                            className="grid place-items-center w-7 h-7 rounded-lg text-white/20
                              hover:text-red-400 hover:bg-red-500/10 border border-transparent
                              hover:border-red-500/20 transition-all active:scale-90 shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h2
                          className="font-['Playfair_Display',serif] text-lg font-bold
                          leading-snug line-clamp-1 mb-1"
                        >
                          {item.listing?.title}
                        </h2>
                        <p className="flex items-center gap-1 text-xs text-white/35 mb-3">
                          <MapPin size={11} /> {item.listing?.location}
                        </p>
                      </div>

                      {/* quantity + price row */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <QuantityStepper
                          quantity={item.quantity}
                          listingId={item.listing?._id}
                          stock={item.listing?.quantity}
                          onUpdate={updateQuantity}
                          updating={updating === item.listing?._id}
                        />

                        <div className="text-right">
                          <p className="text-xs text-white/35">
                            ₹{item.listing?.price} × {item.quantity}
                          </p>
                          <p className="font-['Playfair_Display',serif] text-xl font-bold text-[#A8E063]">
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
              <Reveal delay={cart.items.length * 60 + 60}>
                <div className="grid sm:grid-cols-3 gap-3 mt-2">
                  {[
                    { icon: ShieldCheck, text: "Secure Razorpay checkout" },
                    { icon: Truck, text: "Local-first delivery" },
                    { icon: Leaf, text: "Verified farm sellers" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl
                        bg-[#0a140a] border border-[#182e14] text-xs text-white/40"
                    >
                      <Icon size={14} className="text-[#5C9E31] shrink-0" />{" "}
                      {text}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* ── RIGHT: ORDER SUMMARY ── */}
            <Reveal delay={80} className="lg:col-span-1">
              <div
                className="sticky top-24 rounded-2xl bg-[#0a140a] border border-[#1e3a18]
                overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                {/* header */}
                <div className="px-6 py-5 border-b border-[#182e14] bg-gradient-to-r from-[#0f2a0a] to-[#0a140a]">
                  <h2 className="font-['Playfair_Display',serif] text-xl font-bold flex items-center gap-2">
                    <Tag size={17} className="text-[#A8E063]" /> Order Summary
                  </h2>
                </div>

                <div className="p-6">
                  {/* line items */}
                  <div className="space-y-3 mb-5">
                    {cart.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-start gap-2"
                      >
                        <span className="text-sm text-white/50 leading-snug line-clamp-1 flex-1">
                          {item.listing?.title} × {item.quantity}
                        </span>
                        <span className="text-sm font-semibold text-white/80 shrink-0">
                          ₹
                          {(item.listing?.price * item.quantity).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#182e14] pt-4 space-y-3">
                    <div className="flex justify-between text-sm text-white/50">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Truck size={12} /> Delivery
                      </span>
                      <span className="text-[#A8E063] font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/50">
                      <span>Platform fee</span>
                      <span className="text-[#A8E063] font-semibold">₹0</span>
                    </div>
                  </div>

                  {/* total */}
                  <div
                    className="mt-5 rounded-xl bg-[#5C9E31]/10 border border-[#5C9E31]/25 px-5 py-4
                    flex items-center justify-between"
                  >
                    <span className="font-semibold text-white/70">Total</span>
                    <span className="font-['Playfair_Display',serif] text-2xl font-black text-[#A8E063]">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* checkout button */}
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full mt-5 flex items-center justify-center gap-3 py-4 rounded-2xl
                      bg-[#5C9E31] hover:bg-[#4e8a28] font-bold text-[16px] text-white
                      transition-all active:scale-[0.98] disabled:opacity-60
                      shadow-[0_0_28px_rgba(92,158,49,0.4)] hover:shadow-[0_0_40px_rgba(92,158,49,0.6)]"
                  >
                    {checkingOut ? (
                      <>
                        <Loader2 size={19} className="animate-spin" />{" "}
                        Processing…
                      </>
                    ) : (
                      <>
                        <IndianRupee size={19} /> Proceed to Checkout
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-white/25 mt-3 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={11} /> Secured by Razorpay
                  </p>
                </div>
              </div>
            </Reveal>
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
