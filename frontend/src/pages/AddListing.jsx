import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import api from "../services/api";

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

const QUANTITY_TYPES = ["kg", "quintal", "unit", "litre", "dozen", "tonne"];

/* ───────────────── small reusables ───────────────── */
function Label({ children, required }) {
  return (
    <label className="block text-[11px] font-['Space_Mono',monospace] uppercase tracking-widest text-white/40 mb-2.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function Input({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
        />
      )}
      <input
        {...props}
        className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-[15px] text-white
          placeholder:text-white/20 outline-none
          focus:border-[#5C9E31]/55 focus:bg-white/8 focus:ring-1 focus:ring-[#5C9E31]/20
          transition-all duration-200 ${Icon ? "pl-10 pr-4" : "px-4"} ${className}`}
      />
    </div>
  );
}

function Card({ title, icon: Icon, children, delay = 0, accent = false }) {
  return (
    <div
      className={`rounded-2xl border p-6 sm:p-7 animate-[riseIn_0.5s_ease-out_both]
        ${
          accent
            ? "bg-[#5C9E31]/6 border-[#5C9E31]/20"
            : "bg-white/[0.035] border-white/8"
        }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <span
          className={`grid place-items-center w-8 h-8 rounded-xl ${accent ? "bg-[#5C9E31]/25 text-[#A8E063]" : "bg-white/8 text-white/50"}`}
        >
          <Icon size={16} />
        </span>
        <h3 className="font-['Playfair_Display',serif] text-base font-bold">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
export default function AddListing() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    type: "sale",
    category: "",
    title: "",
    description: "",
    price: "",
    rentPerDay: "",
    quantity: "",
    quantityType: "kg",
    location: "",
  });

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category: "",
        price: "",
        rentPerDay: "",
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

  /* ── validation ── */
  const validate = () => {
    if (!image) return "Please upload a product image.";
    if (!formData.category) return "Please select a category.";
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (formData.type === "sale" && !formData.price)
      return "Enter a sale price.";
    if (formData.type === "rent" && !formData.rentPerDay)
      return "Enter rent per day.";
    if (!formData.quantity) return "Quantity is required.";
    if (!formData.location.trim()) return "Location is required.";
    return null;
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      showToast(err, false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("image", image);
      data.append("type", formData.type);
      data.append("category", formData.category);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("rentPerDay", formData.rentPerDay);
      data.append("quantity", formData.quantity);
      data.append("quantityType", formData.quantityType);
      data.append("location", formData.location);

      const res = await api.post("/listings", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showToast(res.data.message || "Listing published!", true);
      setTimeout(() => navigate("/my-listings"), 1400);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to create listing.",
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

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-['Inter',sans-serif]">
      {/* ── toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-semibold shadow-2xl animate-[slideRight_0.3s_ease-out] ${
            toast.ok
              ? "bg-[#0E140D] border-[#5C9E31]/40 text-[#A8E063]"
              : "bg-[#140e0e] border-red-500/40 text-red-400"
          }`}
        >
          {toast.ok ? <CheckCircle2 size={16} /> : <Info size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-28 pb-24">
        {/* ── back + heading ── */}
        <div className="animate-[riseIn_0.4s_ease-out]">
          <button
            onClick={() => navigate("/my-listings")}
            className="flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to My Listings
          </button>
          <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-2">
            Seller Tools
          </p>
          <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold mb-2">
            Add New Listing
          </h1>
          <p className="text-white/35 text-sm mb-10">
            Fill in the details below to publish your product on the
            marketplace.
          </p>
        </div>

        <div className="space-y-4">
          {/* ══ 1. LISTING TYPE ══ */}
          <Card title="Listing Type" icon={Tag} delay={60}>
            <div className="grid grid-cols-2 gap-3">
              {/* SALE card */}
              <button
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "type", value: "sale" } })
                }
                className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all duration-250 overflow-hidden ${
                  isSale
                    ? "bg-[#5C9E31]/15 border-[#5C9E31]/50 shadow-[0_0_24px_rgba(92,158,49,0.12)]"
                    : "bg-white/4 border-white/8 hover:border-white/18 hover:bg-white/6"
                }`}
              >
                <span
                  className={`grid place-items-center w-10 h-10 rounded-xl transition-colors ${isSale ? "bg-[#5C9E31]/30 text-[#A8E063]" : "bg-white/8 text-white/40"}`}
                >
                  <ShoppingBag size={19} />
                </span>
                <div>
                  <p
                    className={`font-semibold ${isSale ? "text-[#A8E063]" : "text-white/75"}`}
                  >
                    For Sale
                  </p>
                  <p className="text-xs text-white/35 mt-0.5 leading-relaxed">
                    Sell crops, produce or farm goods directly to buyers.
                  </p>
                </div>
                {isSale && (
                  <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-[#5C9E31] shadow-[0_0_10px_rgba(92,158,49,0.6)]">
                    <CheckCircle2 size={12} className="text-white" />
                  </span>
                )}
              </button>

              {/* RENT card */}
              <button
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "type", value: "rent" } })
                }
                className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all duration-250 overflow-hidden ${
                  !isSale
                    ? "bg-sky-500/12 border-sky-500/45 shadow-[0_0_24px_rgba(14,165,233,0.1)]"
                    : "bg-white/4 border-white/8 hover:border-white/18 hover:bg-white/6"
                }`}
              >
                <span
                  className={`grid place-items-center w-10 h-10 rounded-xl transition-colors ${!isSale ? "bg-sky-500/20 text-sky-400" : "bg-white/8 text-white/40"}`}
                >
                  <Tractor size={19} />
                </span>
                <div>
                  <p
                    className={`font-semibold ${!isSale ? "text-sky-400" : "text-white/75"}`}
                  >
                    For Rent
                  </p>
                  <p className="text-xs text-white/35 mt-0.5 leading-relaxed">
                    Rent out machinery, equipment or tools per day.
                  </p>
                </div>
                {!isSale && (
                  <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]">
                    <CheckCircle2 size={12} className="text-white" />
                  </span>
                )}
              </button>
            </div>
          </Card>

          {/* ══ 2. CATEGORY ══ */}
          <Card
            title={isSale ? "Product Category" : "Equipment Category"}
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
                    onClick={() =>
                      setFormData((p) => ({ ...p, category: value }))
                    }
                    className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border text-center transition-all duration-200 ${
                      active
                        ? isSale
                          ? "bg-[#5C9E31]/18 border-[#5C9E31]/50 text-[#A8E063]"
                          : "bg-sky-500/15 border-sky-500/45 text-sky-400"
                        : "bg-white/4 border-white/8 text-white/45 hover:border-white/18 hover:text-white hover:bg-white/7"
                    }`}
                  >
                    <span className="text-xl leading-none">{emoji}</span>
                    <span className="text-[11px] font-medium leading-tight">
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
            {formData.category && (
              <p className="mt-4 text-xs flex items-center gap-1.5 text-white/35">
                <CheckCircle2
                  size={11}
                  className={isSale ? "text-[#A8E063]" : "text-sky-400"}
                />
                Selected:{" "}
                <span
                  className={`font-semibold ${isSale ? "text-[#A8E063]" : "text-sky-400"}`}
                >
                  {formData.category}
                </span>
              </p>
            )}
          </Card>

          {/* ══ 3. IMAGE ══ */}
          <Card title="Product Image" icon={ImagePlus} delay={180}>
            {!preview ? (
              <div
                onDrop={onDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-4 h-52 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-[#5C9E31] bg-[#5C9E31]/10"
                    : "border-white/10 hover:border-[#5C9E31]/40 hover:bg-white/3"
                }`}
              >
                <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/6 border border-white/10">
                  <Upload size={22} className="text-white/30" />
                </span>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/55">
                    Drop image here or{" "}
                    <span
                      className={isSale ? "text-[#A8E063]" : "text-sky-400"}
                    >
                      click to upload
                    </span>
                  </p>
                  <p className="text-xs text-white/25 mt-1">
                    JPG, PNG, WEBP — max 10 MB
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden group">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-60 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={removeImage}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/65">
                  <CheckCircle2 size={11} className="text-[#A8E063]" />{" "}
                  {image?.name}
                </div>
              </div>
            )}
          </Card>

          {/* ══ 4. DETAILS ══ */}
          <Card title="Listing Details" icon={FileText} delay={240}>
            <div className="space-y-5">
              <div>
                <Label required>Title</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={titleHint}
                />
              </div>
              <div>
                <Label required>Description</Label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder={
                    isSale
                      ? "Describe the produce — variety, quality, freshness, how it was grown…"
                      : "Describe the equipment — model, age, capacity, condition, service history…"
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[15px] text-white
                    placeholder:text-white/20 outline-none resize-none
                    focus:border-[#5C9E31]/55 focus:bg-white/8 focus:ring-1 focus:ring-[#5C9E31]/20
                    transition-all duration-200"
                />
              </div>
            </div>
          </Card>

          {/* ══ 5. PRICING ══ */}
          <Card title="Pricing" icon={Tag} delay={300} accent={true}>
            {isSale ? (
              <div>
                <Label required>Sale Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-['Space_Mono',monospace] text-sm pointer-events-none">
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
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/30">
                  <Info size={11} /> Set a fair, market-competitive price per
                  unit.
                </p>
              </div>
            ) : (
              <div>
                <Label required>Rent Per Day (₹)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-['Space_Mono',monospace] text-sm pointer-events-none">
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
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/30">
                  <Info size={11} /> Daily rental rate — buyers can book for
                  multiple days.
                </p>
              </div>
            )}
          </Card>

          {/* ══ 6. QUANTITY ══ */}
          <Card title="Stock & Quantity" icon={Package} delay={360}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Quantity</Label>
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
                <Label required>Unit</Label>
                <div className="relative">
                  <select
                    name="quantityType"
                    value={formData.quantityType}
                    onChange={handleChange}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3.5
                      text-[15px] text-white outline-none cursor-pointer pr-9
                      focus:border-[#5C9E31]/55 focus:bg-white/8 transition-all duration-200"
                  >
                    {QUANTITY_TYPES.map((u) => (
                      <option key={u} value={u} className="bg-[#0E140D]">
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* ══ 7. LOCATION ══ */}
          <Card title="Location" icon={MapPin} delay={420}>
            <Label required>City / District / State</Label>
            <Input
              icon={MapPin}
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Ludhiana, Punjab"
            />
          </Card>

          {/* ══ SUBMIT ══ */}
          <div className="animate-[riseIn_0.5s_ease-out_0.5s_both]">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-[16px]
                transition-all duration-200 active:scale-[0.99] disabled:opacity-50
                ${
                  isSale
                    ? "bg-[#5C9E31] hover:bg-[#4E8A28] shadow-[0_0_30px_rgba(92,158,49,0.4)] hover:shadow-[0_0_45px_rgba(92,158,49,0.55)]"
                    : "bg-sky-600 hover:bg-sky-700 shadow-[0_0_30px_rgba(14,165,233,0.35)] hover:shadow-[0_0_45px_rgba(14,165,233,0.5)]"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Publishing
                  listing…
                </>
              ) : isSale ? (
                <>
                  <Sprout size={20} /> Publish Sale Listing
                </>
              ) : (
                <>
                  <Tractor size={20} /> Publish Rental Listing
                </>
              )}
            </button>
            <p className="text-center text-xs text-white/20 mt-4">
              Your listing goes live on the marketplace immediately after
              publishing.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideRight {
          from { transform:translateX(40px); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
      `}</style>
    </div>
  );
}
