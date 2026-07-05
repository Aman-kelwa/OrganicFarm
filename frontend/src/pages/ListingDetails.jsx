import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

/* ---------------------------------------------------------
   Small UI-only helper hook: animates a displayed number
   toward a target value. Purely cosmetic — the real value
   (totalRent) is still the single source of truth used for
   the actual payment call in rentNow().
--------------------------------------------------------- */
const useCountUp = (target) => {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;
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
  const [mounted, setMounted] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const animatedRent = useCountUp(totalRent);

  useEffect(() => {
    fetchListing();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
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
          color: "#34d399",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message);
    }
  };

  /* ------------------------- Loading skeleton ------------------------- */
  if (!listing) {
    return (
      <div className="ld-root min-h-screen">
        <style>{THEME_CSS}</style>
        <div className="max-w-6xl mx-auto p-8 ld-page-offset">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="ld-skeleton h-[450px] rounded-2xl" />
            <div className="space-y-4 pt-2">
              <div className="ld-skeleton h-10 w-3/4 rounded-lg" />
              <div className="ld-skeleton h-5 w-1/3 rounded-lg" />
              <div className="ld-skeleton h-24 w-full rounded-lg" />
              <div className="ld-skeleton h-12 w-1/2 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-root min-h-screen">
      <style>{THEME_CSS}</style>

      <div className="max-w-6xl mx-auto p-8 ld-page-offset">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left — Image */}
          <div className={`ld-reveal ${mounted ? "ld-reveal-in" : ""}`}>
            <div className="ld-image-frame group">
              {!imgLoaded && (
                <div className="ld-skeleton absolute inset-0 rounded-2xl" />
              )}
              <img
                src={listing.image}
                alt={listing.title}
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-[450px] object-cover rounded-2xl transition-all duration-700 ease-out group-hover:scale-[1.04] ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="ld-image-glow" />
              <span
                className={`ld-badge ${listing.type === "sale" ? "ld-badge-gold" : "ld-badge-mint"}`}
              >
                {listing.type === "sale" ? "For Sale" : "For Rent"}
              </span>
            </div>
          </div>

          {/* Right — Details */}
          <div
            className={`ld-reveal ld-reveal-delay-1 ${mounted ? "ld-reveal-in" : ""}`}
          >
            <h1 className="ld-title text-4xl">{listing.title}</h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="ld-rating-pill">
                ⭐ {listing.averageRating?.toFixed(1)}
              </span>
              <span className="ld-muted text-sm">
                ({listing.numReviews} reviews)
              </span>
            </div>

            <p className="ld-muted mt-4 leading-relaxed">
              {listing.description}
            </p>

            <p className="ld-price mt-5">
              {listing.type === "sale"
                ? `₹${listing.price}`
                : `₹${listing.rentPerDay}`}
              {listing.type !== "sale" && (
                <span className="ld-price-suffix"> /day</span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <InfoChip label="Category" value={listing.category} icon="🌾" />
              <InfoChip
                label="Stock"
                value={`${listing.quantity} ${listing.quantityType}`}
                icon="📦"
              />
              <InfoChip label="Location" value={listing.location} icon="📍" />
              <InfoChip label="Owner" value={listing.owner?.name} icon="👤" />
            </div>

            {/* RENT SECTION */}
            {listing.type === "rent" && (
              <div className="ld-panel mt-8">
                <h2 className="ld-panel-title">Rent this Machine</h2>

                <div className="mb-4">
                  <label className="ld-label">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="ld-input mt-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="ld-label">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="ld-input mt-2"
                  />
                </div>

                <div
                  className={`ld-summary mt-5 ${
                    totalDays > 0 ? "ld-summary-active" : ""
                  }`}
                >
                  <p className="flex justify-between">
                    <span className="ld-muted">Rent Per Day</span>
                    <strong className="ld-summary-text">
                      ₹{listing.rentPerDay}
                    </strong>
                  </p>
                  <p className="flex justify-between mt-2">
                    <span className="ld-muted">Total Days</span>
                    <strong className="ld-summary-text">{totalDays}</strong>
                  </p>
                  <div className="ld-divider my-3" />
                  <p className="flex justify-between items-center">
                    <span className="ld-muted">Total Rent</span>
                    <strong className="ld-total">₹{animatedRent}</strong>
                  </p>
                </div>

                <button
                  onClick={rentNow}
                  disabled={!startDate || !endDate}
                  className="ld-btn-primary w-full mt-6"
                >
                  <span>Rent Now</span>
                </button>
              </div>
            )}

            {/* SALE SECTION */}
            {listing.type === "sale" && (
              <div className="ld-panel ld-panel-gold mt-8">
                <h2 className="ld-panel-title">
                  Product Available for Purchase
                </h2>
                <p className="ld-muted mt-2">
                  Click &ldquo;Add To Cart&rdquo; from the listings page to
                  purchase this product.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review form */}
        <div
          className={`ld-panel ld-reveal ld-reveal-delay-2 mt-12 ${
            mounted ? "ld-reveal-in" : ""
          }`}
        >
          <h2 className="ld-panel-title">Write a Review</h2>

          <div className="mb-5">
            <label className="ld-label">Rating</label>
            <div
              className="flex gap-1 mt-2"
              onMouseLeave={() => setHoverStar(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onMouseEnter={() => setHoverStar(n)}
                  onClick={() => setRating(n)}
                  className="ld-star-btn"
                  aria-label={`Rate ${n} star`}
                >
                  <span
                    className={
                      n <= (hoverStar || rating)
                        ? "ld-star-filled"
                        : "ld-star-empty"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your experience..."
            className="ld-input ld-textarea"
          />

          <button
            onClick={submitReview}
            disabled={submitting}
            className="ld-btn-primary mt-5 px-8 w-auto"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>

        {/* Reviews list */}
        <div className="mt-12">
          <h2 className="ld-title text-3xl mb-6">Customer Reviews</h2>

          {listing.reviews.length === 0 ? (
            <p className="ld-muted">
              No reviews yet — be the first to share yours.
            </p>
          ) : (
            listing.reviews.map((review, i) => (
              <div
                key={review._id}
                className={`ld-review-card ld-reveal ${mounted ? "ld-reveal-in" : ""}`}
                style={{ transitionDelay: `${Math.min(i, 6) * 70 + 200}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="ld-avatar">
                    {review.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="ld-review-name">{review.name}</h3>
                    <p className="ld-star-line">
                      {"★".repeat(review.rating)}
                      <span className="ld-star-empty-line">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="ld-muted mt-3 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const InfoChip = ({ label, value, icon }) => (
  <div className="ld-chip">
    <span className="ld-chip-icon">{icon}</span>
    <div>
      <p className="ld-chip-label">{label}</p>
      <p className="ld-chip-value">{value}</p>
    </div>
  </div>
);

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap');

.ld-root {
  background: radial-gradient(circle at 15% 0%, #0f2a1c 0%, #071510 55%, #05100b 100%);
  color: #eaf5ee;
  font-family: 'Work Sans', sans-serif;
}

/* Reserves space so page content clears a fixed/sticky navbar.
   Adjust this value to match your navbar's actual height. */
.ld-page-offset {
  padding-top: 6rem;
}
@media (max-width: 768px) {
  .ld-page-offset { padding-top: 5rem; }
}

.ld-title {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  color: #eefaf1;
  letter-spacing: -0.01em;
}

.ld-muted { color: #8ba99a; }

.ld-price {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 2.25rem;
  background: linear-gradient(90deg, #6ee7b7, #34d399 60%, #a7f3d0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ld-price-suffix { font-size: 1rem; color: #8ba99a; -webkit-text-fill-color: #8ba99a; }

.ld-image-frame {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,231,183,0.08);
}
.ld-image-glow {
  position: absolute; inset: 0; pointer-events: none; border-radius: 1rem;
  box-shadow: inset 0 0 60px rgba(52,211,153,0.08);
}
.ld-badge {
  position: absolute; top: 14px; left: 14px;
  padding: 6px 14px; border-radius: 999px;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em;
  backdrop-filter: blur(6px);
  animation: floatBadge 3.2s ease-in-out infinite;
}
.ld-badge-mint { background: rgba(52,211,153,0.18); color: #a7f3d0; border: 1px solid rgba(167,243,208,0.35); }
.ld-badge-gold { background: rgba(251,191,36,0.15); color: #fcd34d; border: 1px solid rgba(252,211,77,0.35); }
@keyframes floatBadge { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.ld-rating-pill {
  background: rgba(251,191,36,0.12);
  color: #fcd34d;
  border: 1px solid rgba(252,211,77,0.25);
  padding: 4px 12px; border-radius: 999px; font-size: 0.95rem; font-weight: 600;
}

.ld-chip {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(110,231,183,0.1);
  border-radius: 0.85rem; padding: 12px 14px;
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}
.ld-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(110,231,183,0.3);
  background: rgba(52,211,153,0.05);
}
.ld-chip-icon { font-size: 1.2rem; }
.ld-chip-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6f8f7d; }
.ld-chip-value { font-weight: 600; color: #eefaf1; font-size: 0.92rem; }

.ld-panel {
  background: linear-gradient(180deg, rgba(21,48,31,0.65), rgba(15,35,24,0.55));
  border: 1px solid rgba(110,231,183,0.14);
  border-radius: 1.1rem;
  padding: 1.75rem;
  backdrop-filter: blur(10px);
}
.ld-panel-gold { border-color: rgba(252,211,77,0.18); }
.ld-panel-title {
  font-family: 'Fraunces', serif;
  font-size: 1.4rem; font-weight: 600; color: #eefaf1; margin-bottom: 1.1rem;
}

.ld-label { font-size: 0.85rem; font-weight: 600; color: #a7f3d0; }

.ld-input {
  width: 100%;
  background: rgba(4,20,13,0.6);
  border: 1px solid rgba(110,231,183,0.18);
  color: #eaf5ee;
  border-radius: 0.7rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ld-input:focus {
  outline: none;
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52,211,153,0.15);
}
.ld-textarea { resize: vertical; margin-top: 0.5rem; }

.ld-summary {
  background: rgba(4,20,13,0.55);
  border: 1px solid rgba(110,231,183,0.12);
  border-radius: 0.9rem;
  padding: 1.1rem 1.3rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.ld-summary-active {
  border-color: rgba(52,211,153,0.4);
  box-shadow: 0 0 24px -6px rgba(52,211,153,0.25);
}
.ld-summary-text { color: #eefaf1; }
.ld-divider { height: 1px; background: rgba(110,231,183,0.14); }
.ld-total {
  font-family: 'Fraunces', serif;
  font-size: 1.6rem;
  color: #6ee7b7;
}

.ld-btn-primary {
  background: linear-gradient(90deg, #16a34a, #34d399);
  color: #04140d;
  font-weight: 700;
  padding: 0.85rem 1.5rem;
  border-radius: 0.8rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  box-shadow: 0 8px 24px -8px rgba(52,211,153,0.5);
}
.ld-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -8px rgba(52,211,153,0.65);
}
.ld-btn-primary:disabled {
  background: #2a3a32; color: #6f8f7d; cursor: not-allowed; box-shadow: none;
}

.ld-star-btn { background: none; border: none; cursor: pointer; font-size: 1.6rem; line-height: 1; padding: 2px; transition: transform 0.15s ease; }
.ld-star-btn:hover { transform: scale(1.15); }
.ld-star-filled { color: #fbbf24; text-shadow: 0 0 10px rgba(251,191,36,0.5); }
.ld-star-empty { color: #2f4438; }

.ld-review-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(110,231,183,0.1);
  border-radius: 1rem;
  padding: 1.4rem;
  margin-bottom: 1rem;
  transition: transform 0.25s ease, border-color 0.25s ease;
}
.ld-review-card:hover { transform: translateY(-2px); border-color: rgba(110,231,183,0.25); }
.ld-review-name { font-weight: 600; color: #eefaf1; }
.ld-star-line { color: #fbbf24; margin-top: 2px; font-size: 0.9rem; }
.ld-star-empty-line { color: #2f4438; }
.ld-avatar {
  width: 40px; height: 40px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: #04140d; font-weight: 700; flex-shrink: 0;
}

.ld-skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(110,231,183,0.08) 37%, rgba(255,255,255,0.03) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

.ld-reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.ld-reveal-in { opacity: 1; transform: translateY(0); }
.ld-reveal-delay-1 { transition-delay: 0.08s; }
.ld-reveal-delay-2 { transition-delay: 0.16s; }
`;

export default ListingDetails;
