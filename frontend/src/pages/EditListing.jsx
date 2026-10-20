/*
  OrganicFarm – Edit Listing (Design System v2: light & simple)
  Mirrors AddListing.jsx so both forms look and behave the same:
  page #F6F8F4 · card #FFFFFF · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
  Fonts (index.html): Inter only
*/

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  X,
  ImagePlus,
  MapPin,
  Package,
  ChevronDown,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Sprout,
  Tractor,
  FileText,
  Info,
  Tag,
  ShoppingBag,
  Wrench,
  Save,
} from "lucide-react";
import api from "../services/api";

/* ───────────────── shared style primitives ───────────────── */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F8F4]";
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-12 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const fieldBase =
  "w-full bg-white border border-[#D5DBD0] rounded-xl text-[15px] text-[#1F2A1C] placeholder:text-[#7A8576] outline-none transition-colors duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20";

/* ───────────────── category data ───────────────── */
const SALE_CATEGORIES = [
  { value: "Crops", emoji: "🌾" },
  { value: "Vegetables", emoji: "🥦" },
  { value: "Fruits", emoji: "🍎" },
  { value: "Seeds", emoji: "🌱" },
  { value: "Fertilizers", emoji: "🧪" },
  { value: "Pesticides", emoji: "💊" },
  { value: "Dairy", emoji: "🥛" },
  { value: "Pulses", emoji: "🫘" },
  { value: "Spices", emoji: "🌶️" },
];

const RENT_CATEGORIES = [
  { value: "Tractor", emoji: "🚜" },
  { value: "Rotavator", emoji: "⚙️" },
  { value: "Harvester", emoji: "🌽" },
  { value: "Seed Drill", emoji: "🔩" },
  { value: "Cultivator", emoji: "🔧" },
  { value: "Power Sprayer", emoji: "💦" },
  { value: "Water Tanker", emoji: "🚰" },
  { value: "Thresher", emoji: "🏗️" },
];

const QUANTITY_TYPES = [
  "kg",
  "quintal",
  "unit",
  "litre",
  "dozen",
  "tonne",
  "hour",
  "day",
];

/* ───────────────── small reusables ───────────────── */
function Label({ children, required, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[#1F2A1C] mb-2"
    >
      {children}
      {required && (
        <span className="text-red-600 ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function Input({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8576] pointer-events-none"
        />
      )}
      <input
        id={props.name}
        {...props}
        className={`${fieldBase} h-12 ${Icon ? "pl-10 pr-4" : "px-4"} ${className}`}
      />
    </div>
  );
}

function Card({ title, icon: Icon, children, delay = 0, accent = false }) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-6 sm:p-7 animate-[riseIn_0.5s_ease-out_both] motion-reduce:animate-none
        ${
          accent
            ? "bg-[#EAF4E6] border-[#2E7D32]/20"
            : "bg-white border-[#E4E8E1]"
        }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`grid place-items-center w-9 h-9 rounded-xl ${accent ? "bg-white text-[#2E7D32]" : "bg-[#EAF4E6] text-[#2E7D32]"}`}
        >
          <Icon size={17} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`rounded-xl bg-[#E9EDE6] relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] motion-reduce:animate-none bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

/* ════════════════════════════════════════════════ */
const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    type: "sale",
    category: "",
    title: "",
    description: "",
    price: "",
    rentPerDay: "",
    quantity: "",
    quantityType: "",
    location: "",
  });

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchListing = async () => {
    try {
      setPageLoading(true);

      const res = await api.get(`/listings/${id}`);

      const listing = res.data;

      setFormData({
        type: listing.type,
        category: listing.category,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        rentPerDay: listing.rentPerDay,
        quantity: listing.quantity,
        quantityType: listing.quantityType,
        location: listing.location,
      });

      setPreview(listing.image);
    } catch (error) {
      console.log(error);
      showToast("Failed to load listing.", false);
    } finally {
      setPageLoading(false);
    }
  };

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category: "",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImage(e.dataTransfer.files[0]);
  };

  /* ── toast ── */
  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      data.append("type", formData.type);
      data.append("category", formData.category);
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.type === "sale") {
        data.append("price", formData.price);
      } else {
        data.append("rentPerDay", formData.rentPerDay);
      }
      data.append("quantity", formData.quantity);
      data.append("quantityType", formData.quantityType);
      data.append("location", formData.location);

      if (image) {
        data.append("image", image);
      }

      await api.put(`/listings/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("Listing updated successfully!", true);
      setTimeout(() => navigate("/my-listings"), 1400);
    } catch (error) {
      console.log(error);
      showToast(
        error.response?.data?.message || "Failed to update listing.",
        false,
      );
    } finally {
      setLoading(false);
    }
  };

  const isSale = formData.type === "sale";
  const categories = isSale ? SALE_CATEGORIES : RENT_CATEGORIES;
  const titleHint = isSale
    ? "e.g. Organic Basmati Rice, Fresh Tomatoes…"
    : "e.g. Mahindra Arjun 555 DI Tractor";

  const typeCard = (active) =>
    `relative flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-colors duration-200 ${focusRing} ${
      active
        ? "bg-[#EAF4E6] border-[#2E7D32]"
        : "bg-white border-[#D5DBD0] hover:border-[#2E7D32]/50 hover:bg-[#F6F8F4]"
    }`;

  /* ════════════════ SKELETON ════════════════ */
  if (pageLoading) {
    return (
      <div
        className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif]"
        role="status"
        aria-label="Loading listing"
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-28 pb-24 space-y-4">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-12 w-72" />
          <SkeletonBlock className="h-60 w-full mt-6" />
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
        <span className="sr-only">Loading listing…</span>
        <style>{`
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif]">
      {/* ── toast ── */}
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          className={`fixed top-20 right-5 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border bg-white text-sm font-semibold shadow-lg animate-[slideRight_0.3s_ease-out] motion-reduce:animate-none ${
            toast.ok
              ? "border-[#2E7D32]/40 text-[#256628]"
              : "border-red-200 text-red-700"
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 size={16} aria-hidden="true" />
          ) : (
            <Info size={16} aria-hidden="true" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-28 pb-24">
        {/* ── back + heading ── */}
        <div className="animate-[riseIn_0.4s_ease-out] motion-reduce:animate-none">
          <button
            type="button"
            onClick={() => navigate("/my-listings")}
            className={`flex items-center gap-2 text-sm font-medium text-[#5B6559] hover:text-[#1F2A1C] transition-colors duration-200 mb-6 rounded group ${focusRing}`}
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform duration-200 motion-reduce:transition-none"
            />
            Back to My Listings
          </button>
          <p className="text-sm font-semibold text-[#2E7D32] mb-1">
            Seller tools
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Edit Listing
          </h1>
          <p className="text-[#5B6559] text-sm mb-8">
            Update the details below — changes go live as soon as you save.
          </p>
        </div>

        <div className="space-y-4">
          {/* ══ 1. LISTING TYPE ══ */}
          <Card title="Listing type" icon={Tag} delay={60}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SALE card */}
              <button
                type="button"
                aria-pressed={isSale}
                onClick={() =>
                  handleChange({ target: { name: "type", value: "sale" } })
                }
                className={typeCard(isSale)}
              >
                <span
                  className={`grid place-items-center w-10 h-10 rounded-xl transition-colors duration-200 ${isSale ? "bg-white text-[#2E7D32]" : "bg-[#EAF4E6] text-[#2E7D32]"}`}
                >
                  <ShoppingBag size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">For Sale</p>
                  <p className="text-[13px] text-[#5B6559] mt-0.5 leading-relaxed">
                    Sell crops, produce or farm goods directly to buyers.
                  </p>
                </div>
                {isSale && (
                  <CheckCircle2
                    size={20}
                    aria-hidden="true"
                    className="absolute top-4 right-4 text-[#2E7D32]"
                  />
                )}
              </button>

              {/* RENT card */}
              <button
                type="button"
                aria-pressed={!isSale}
                onClick={() =>
                  handleChange({ target: { name: "type", value: "rent" } })
                }
                className={typeCard(!isSale)}
              >
                <span
                  className={`grid place-items-center w-10 h-10 rounded-xl transition-colors duration-200 ${!isSale ? "bg-white text-[#2E7D32]" : "bg-[#EAF4E6] text-[#2E7D32]"}`}
                >
                  <Tractor size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">For Rent</p>
                  <p className="text-[13px] text-[#5B6559] mt-0.5 leading-relaxed">
                    Rent out machinery, equipment or tools per day.
                  </p>
                </div>
                {!isSale && (
                  <CheckCircle2
                    size={20}
                    aria-hidden="true"
                    className="absolute top-4 right-4 text-[#2E7D32]"
                  />
                )}
              </button>
            </div>
          </Card>

          {/* ══ 2. CATEGORY ══ */}
          <Card
            title={isSale ? "Product category" : "Equipment category"}
            icon={isSale ? Sprout : Wrench}
            delay={120}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {categories.map(({ value, emoji }) => {
                const active = formData.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setFormData((p) => ({ ...p, category: value }))
                    }
                    className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border text-center transition-colors duration-200 ${focusRing} ${
                      active
                        ? "bg-[#EAF4E6] border-[#2E7D32] text-[#256628]"
                        : "bg-white border-[#D5DBD0] text-[#5B6559] hover:border-[#2E7D32]/50 hover:text-[#1F2A1C] hover:bg-[#F6F8F4]"
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden="true">
                      {emoji}
                    </span>
                    <span className="text-xs font-medium leading-tight">
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
            {formData.category && (
              <p
                className="mt-4 text-[13px] flex items-center gap-1.5 text-[#5B6559]"
                aria-live="polite"
              >
                <CheckCircle2
                  size={13}
                  className="text-[#2E7D32]"
                  aria-hidden="true"
                />
                Selected:{" "}
                <span className="font-semibold text-[#256628]">
                  {formData.category}
                </span>
              </p>
            )}
          </Card>

          {/* ══ 3. IMAGE ══ */}
          <Card title="Product image" icon={ImagePlus} delay={180}>
            {/* one file input, always mounted, used by upload / replace / remove */}
            <input
              ref={fileRef}
              id="listing-image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files[0])}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
            {!preview ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload product image"
                onDrop={onDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileRef.current?.click();
                  }
                }}
                className={`flex flex-col items-center justify-center gap-4 h-52 rounded-2xl border-2 border-dashed cursor-pointer transition-colors duration-200 ${focusRing} ${
                  dragOver
                    ? "border-[#2E7D32] bg-[#EAF4E6]"
                    : "border-[#D5DBD0] bg-[#F6F8F4] hover:border-[#2E7D32]/60 hover:bg-[#EAF4E6]/60"
                }`}
              >
                <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white border border-[#E4E8E1] text-[#2E7D32]">
                  <Upload size={22} aria-hidden="true" />
                </span>
                <div className="text-center px-4">
                  <p className="text-sm font-medium">
                    Drop image here or{" "}
                    <span className="text-[#2E7D32] font-semibold">
                      click to upload
                    </span>
                  </p>
                  <p className="text-xs text-[#5B6559] mt-1">
                    JPG, PNG, WEBP — max 10 MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-[#E4E8E1]">
                <img
                  src={preview}
                  alt="Listing preview"
                  className="w-full h-60 object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`flex items-center gap-1.5 px-3.5 h-10 bg-white text-[#1F2A1C] border border-[#D5DBD0] hover:bg-[#F6F8F4] text-sm font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-colors duration-200 ${focusRing}`}
                  >
                    <Upload size={14} /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className={`flex items-center gap-1.5 px-3.5 h-10 bg-white text-red-700 border border-red-200 hover:bg-red-50 text-sm font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-colors duration-200 ${focusRing}`}
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-medium text-[#1F2A1C] shadow-sm">
                  <CheckCircle2
                    size={12}
                    className="text-[#2E7D32] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {image?.name || "Current image"}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* ══ 4. DETAILS ══ */}
          <Card title="Listing details" icon={FileText} delay={240}>
            <div className="space-y-5">
              <div>
                <Label required htmlFor="title">
                  Title
                </Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={titleHint}
                />
              </div>
              <div>
                <Label required htmlFor="description">
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder={
                    isSale
                      ? "Describe the produce — variety, quality, freshness, how it was grown…"
                      : "Describe the equipment — model, age, capacity, condition, service history…"
                  }
                  className={`${fieldBase} px-4 py-3.5 resize-none`}
                />
              </div>
            </div>
          </Card>

          {/* ══ 5. PRICING ══ */}
          <Card title="Pricing" icon={Tag} delay={300} accent={true}>
            {isSale ? (
              <div>
                <Label required htmlFor="price">
                  Sale price (₹)
                </Label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6559] text-sm pointer-events-none z-10"
                  >
                    ₹
                  </span>
                  <Input
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#5B6559]">
                  <Info size={12} aria-hidden="true" /> Set a fair,
                  market-competitive price per unit.
                </p>
              </div>
            ) : (
              <div>
                <Label required htmlFor="rentPerDay">
                  Rent per day (₹)
                </Label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6559] text-sm pointer-events-none z-10"
                  >
                    ₹
                  </span>
                  <Input
                    name="rentPerDay"
                    type="number"
                    min="0"
                    value={formData.rentPerDay}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#5B6559]">
                  <Info size={12} aria-hidden="true" /> Daily rental rate —
                  buyers can book for multiple days.
                </p>
              </div>
            )}
          </Card>

          {/* ══ 6. QUANTITY ══ */}
          <Card title="Stock & quantity" icon={Package} delay={360}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required htmlFor="quantity">
                  Quantity
                </Label>
                <Input
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="100"
                />
              </div>
              <div>
                <Label required htmlFor="quantityType">
                  Unit
                </Label>
                <div className="relative">
                  <select
                    id="quantityType"
                    name="quantityType"
                    value={formData.quantityType}
                    onChange={handleChange}
                    className={`${fieldBase} h-12 appearance-none px-4 pr-9 cursor-pointer`}
                  >
                    {QUANTITY_TYPES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8576] pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* ══ 7. LOCATION ══ */}
          <Card title="Location" icon={MapPin} delay={420}>
            <Label required htmlFor="location">
              City / District / State
            </Label>
            <Input
              icon={MapPin}
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Ludhiana, Punjab"
            />
          </Card>

          {/* ══ SUBMIT ══ */}
          <div className="animate-[riseIn_0.5s_ease-out_0.5s_both] motion-reduce:animate-none pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`${btnPrimary} w-full h-14 text-base disabled:opacity-60`}
            >
              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin motion-reduce:animate-none"
                  />{" "}
                  Saving changes…
                </>
              ) : (
                <>
                  <Save size={20} aria-hidden="true" /> Save Changes
                </>
              )}
            </button>
            <p className="text-center text-[13px] text-[#5B6559] mt-4">
              Updates go live on the marketplace immediately after saving.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideRight {
          from { transform:translateX(24px); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default EditListing;
