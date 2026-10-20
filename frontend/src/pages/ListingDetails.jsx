import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Leaf,
  Package,
  MapPin,
  User,
  Tractor,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import api from "../services/api";

/* ════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   (same names as the other pages — move them into one
   shared file, e.g. src/styles/ui.js, and import them)
   ════════════════════════════════════════════════════ */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2";
const CONTAINER = "max-w-7xl mx-auto px-5 sm:px-8";
const CARD = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const BTN = `inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-[#2E7D32] text-white hover:bg-[#256628] disabled:cursor-not-allowed disabled:bg-[#E4E8E1] disabled:text-[#7A8576]`;
const INPUT = `w-full h-12 rounded-xl border border-[#D5DBD0] bg-white px-4 text-sm text-[#1F2A1C] placeholder:text-[#7A8576] transition-colors duration-200 ${FOCUS}`;
const TAG_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold";

/* ── reveal: 600ms fade + 16px slide, once (`hero` = gentler 12px) ── */
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

/* ---------------------------------------------------------
   Small UI-only helper hook: animates a displayed number
   toward a target value. Purely cosmetic — the real value
   (totalRent) is still the single source of truth used for
   the actual payment call in rentNow().
   Skipped when the user prefers reduced motion.
--------------------------------------------------------- */
const useCountUp = (target) => {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }

    const duration = 450;
    const start = performance.now();

    cancelAnimationFrame(frameRef.current);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      setDisplay(value);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);

  // Rental States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [totalRent, setTotalRent] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // UI-only states (no effect on API logic)
  const [hoverStar, setHoverStar] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const animatedRent = useCountUp(totalRent);

  useEffect(() => {
    fetchListing();
  }, []);

  // Calculate Rent Automatically
  useEffect(() => {
    if (startDate && endDate && listing?.rentPerDay) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setTotalDays(days);
        setTotalRent(days * listing.rentPerDay);
      } else {
        setTotalDays(0);
        setTotalRent(0);
      }
    }
  }, [startDate, endDate, listing]);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);

      setListing(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const submitReview = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }
      await api.post(
        `/listings/${listing._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Review Added Successfully");

      setRating(5);
      setComment("");

      fetchListing();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const rentNow = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (!startDate || !endDate) {
        alert("Please select rental dates");
        return;
      }

      // Step 1: Create Razorpay Order
      const orderRes = await api.post(
        "/rentals/create-payment-order",
        {
          listingId: listing._id,
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const order = orderRes.data.order;

      // Step 2: Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "OrganicFarm",

        description: "Rental Payment",

        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await api.post(
              "/rentals/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,

                razorpay_payment_id: response.razorpay_payment_id,

                razorpay_signature: response.razorpay_signature,

                listingId: listing._id,

                startDate,

                endDate,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            alert(verifyRes.data.message);

            navigate("/my-rentals");
          } catch (error) {
            console.log(error);

            alert(
              error.response?.data?.message || "Payment Verification Failed",
            );
          }
        },

        theme: {
          color: "#2E7D32",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  /* ------------------------- Loading skeleton ------------------------- */
  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F6F8F4] font-['Inter',sans-serif]">
        <div aria-busy="true" className={`${CONTAINER} pt-28 pb-16 sm:pb-20`}>
          <span className="sr-only">Loading listing</span>
          <div className="grid lg:grid-cols-2 gap-10 animate-pulse motion-reduce:animate-none">
            <div className="aspect-[4/3] rounded-2xl bg-[#E4E8E1]" />
            <div className="space-y-4 pt-2">
              <div className="h-4 w-24 rounded-full bg-[#E4E8E1]" />
              <div className="h-10 w-3/4 rounded-xl bg-[#E4E8E1]" />
              <div className="h-5 w-1/3 rounded-full bg-[#E4E8E1]" />
              <div className="h-24 w-full rounded-xl bg-[#E4E8E1]" />
              <div className="h-12 w-1/2 rounded-xl bg-[#E4E8E1]" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-[#E4E8E1]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const reviews = listing.reviews ?? [];

  return (
    <div className="min-h-screen bg-white text-[#1F2A1C] font-['Inter',sans-serif]">
      {/* ── PRODUCT ── */}
      <section className="bg-[#F6F8F4] border-b border-[#E4E8E1] pt-28 pb-16 sm:pb-20">
        <div className={CONTAINER}>
          <Reveal hero>
            <button
              type="button"
              onClick={() => navigate("/listings")}
              className={`group mb-6 inline-flex items-center gap-2 rounded text-sm font-semibold text-[#2E7D32] hover:text-[#256628] transition-colors duration-200 ${FOCUS}`}
            >
              <ArrowLeft
                size={15}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
              Back to listings
            </button>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            {/* Left — Image */}
            <Reveal hero>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#E4E8E1] bg-white shadow-sm">
                {!imgLoaded && (
                  <div className="absolute inset-0 bg-[#E4E8E1] animate-pulse motion-reduce:animate-none" />
                )}
                <img
                  src={listing.image}
                  alt={listing.title}
                  onLoad={() => setImgLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    setImgLoaded(true);
                  }}
                  className={`h-full w-full object-cover transition-[transform,opacity] duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  className={`absolute left-4 top-4 ${TAG_BASE} ${
                    listing.type === "sale"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-sky-50 text-sky-800 border-sky-200"
                  }`}
                >
                  {listing.type === "sale" ? "For Sale" : "For Rent"}
                </span>
              </div>
            </Reveal>

            {/* Right — Details */}
            <Reveal hero>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {listing.title}
                </h1>

                <div className="mt-3 flex items-center gap-2">
                  <Star
                    size={18}
                    aria-hidden="true"
                    className="fill-[#F59E0B] text-[#F59E0B]"
                  />
                  <span className="text-sm font-semibold">
                    {listing.averageRating?.toFixed(1)}
                  </span>
                  <span className="text-sm text-[#5B6559]">
                    ({listing.numReviews} reviews)
                  </span>
                </div>

                <p className="mt-4 text-base leading-relaxed text-[#5B6559]">
                  {listing.description}
                </p>

                <p className="mt-5 text-3xl font-bold">
                  {listing.type === "sale"
                    ? `₹${listing.price}`
                    : `₹${listing.rentPerDay}`}
                  {listing.type !== "sale" && (
                    <span className="text-base font-normal text-[#5B6559]">
                      {" "}
                      /day
                    </span>
                  )}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoChip
                    label="Category"
                    value={listing.category}
                    icon={Leaf}
                  />
                  <InfoChip
                    label="Stock"
                    value={`${listing.quantity} ${listing.quantityType}`}
                    icon={Package}
                  />
                  <InfoChip
                    label="Location"
                    value={listing.location}
                    icon={MapPin}
                  />
                  <InfoChip
                    label="Owner"
                    value={listing.owner?.name}
                    icon={User}
                  />
                </div>

                {/* RENT SECTION */}
                {listing.type === "rent" && (
                  <div className={`${CARD} mt-8 p-6`}>
                    <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
                      <Tractor
                        size={20}
                        aria-hidden="true"
                        className="text-[#2E7D32]"
                      />
                      Rent this machine
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="rent-start"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Start date
                        </label>
                        <input
                          id="rent-start"
                          type="date"
                          value={startDate}
                          min={today}
                          onChange={(e) => setStartDate(e.target.value)}
                          className={INPUT}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="rent-end"
                          className="mb-2 block text-sm font-semibold"
                        >
                          End date
                        </label>
                        <input
                          id="rent-end"
                          type="date"
                          value={endDate}
                          min={startDate || today}
                          onChange={(e) => setEndDate(e.target.value)}
                          className={INPUT}
                        />
                      </div>
                    </div>

                    <div
                      aria-live="polite"
                      className="mt-5 rounded-xl border border-[#E4E8E1] bg-[#F6F8F4] p-4 text-sm"
                    >
                      <p className="flex justify-between">
                        <span className="text-[#5B6559]">Rent per day</span>
                        <strong>₹{listing.rentPerDay}</strong>
                      </p>
                      <p className="mt-2 flex justify-between">
                        <span className="text-[#5B6559]">Total days</span>
                        <strong>{totalDays}</strong>
                      </p>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-[#EAF4E6] px-4 py-3">
                        <span className="font-semibold">Total rent</span>
                        <strong className="text-2xl font-bold">
                          ₹{animatedRent.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={rentNow}
                      disabled={!startDate || !endDate}
                      className={`${BTN_PRIMARY} mt-5 w-full`}
                    >
                      <IndianRupee size={16} aria-hidden="true" />
                      Rent now
                    </button>
                  </div>
                )}

                {/* SALE SECTION */}
                {listing.type === "sale" && (
                  <div className={`${CARD} mt-8 flex items-start gap-4 p-6`}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
                      <ShoppingBag size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold">
                        Product available for purchase
                      </h2>
                      <p className="mt-1 text-sm text-[#5B6559]">
                        Click &ldquo;Add To Cart&rdquo; from the listings page
                        to purchase this product.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-16 sm:py-20">
        <div className={CONTAINER}>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
            {/* Review form */}
            <Reveal className="lg:sticky lg:top-24">
              <div className={`${CARD} p-6`}>
                <h2 className="mb-5 text-xl font-semibold">Write a review</h2>

                <div className="mb-5">
                  <p id="rating-label" className="mb-1 text-sm font-semibold">
                    Rating
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby="rating-label"
                    className="flex gap-1"
                    onMouseLeave={() => setHoverStar(0)}
                  >
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = n <= (hoverStar || rating);
                      return (
                        <button
                          type="button"
                          key={n}
                          role="radio"
                          aria-checked={rating === n}
                          onMouseEnter={() => setHoverStar(n)}
                          onClick={() => setRating(n)}
                          className={`grid h-10 w-10 place-items-center rounded-lg transition-transform duration-200 hover:scale-110 motion-reduce:hover:scale-100 ${FOCUS}`}
                          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                        >
                          <Star
                            size={26}
                            aria-hidden="true"
                            className={
                              filled
                                ? "fill-[#F59E0B] text-[#F59E0B]"
                                : "text-[#D5DBD0]"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label
                  htmlFor="review-comment"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your review
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your experience..."
                  className={`${INPUT} h-auto resize-y py-3`}
                />

                <button
                  type="button"
                  onClick={submitReview}
                  disabled={submitting}
                  className={`${BTN_PRIMARY} mt-5 w-full`}
                >
                  {submitting ? "Submitting…" : "Submit review"}
                </button>
              </div>
            </Reveal>

            {/* Reviews list */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 text-2xl sm:text-3xl font-bold tracking-tight">
                Customer reviews
              </h2>

              {reviews.length === 0 ? (
                <div
                  className={`${CARD} flex flex-col items-center px-6 py-14 text-center`}
                >
                  <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF4E6] text-[#2E7D32]">
                    <Star size={24} aria-hidden="true" />
                  </span>
                  <p className="max-w-xs text-sm leading-relaxed text-[#5B6559]">
                    No reviews yet — be the first to share yours.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Reveal key={review._id}>
                      <article
                        className={`${CARD} p-5 transition-shadow duration-200 hover:shadow-md`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            aria-hidden="true"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EAF4E6] font-semibold text-[#2E7D32]"
                          >
                            {review.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {review.name}
                            </h3>
                            <div
                              role="img"
                              aria-label={`${review.rating} out of 5 stars`}
                              className="mt-0.5 flex gap-0.5"
                            >
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                  key={n}
                                  size={14}
                                  aria-hidden="true"
                                  className={
                                    n <= review.rating
                                      ? "fill-[#F59E0B] text-[#F59E0B]"
                                      : "text-[#D5DBD0]"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-[#5B6559]">
                          {review.comment}
                        </p>
                      </article>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const InfoChip = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 rounded-xl border border-[#E4E8E1] bg-white px-4 py-3">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
      <Icon size={18} aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-[#7A8576]">{label}</p>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  </div>
);

export default ListingDetails;
