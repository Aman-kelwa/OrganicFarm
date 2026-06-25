import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Sprout,
  Tractor,
  Wheat,
  ShoppingBasket,
  Search,
  MapPin,
  Star,
  ArrowUpRight,
  ShieldCheck,
  HandCoins,
  Truck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Fonts: add these once in your index.html <head>                   */
/*  <link rel="preconnect" href="https://fonts.googleapis.com">       */
/*  <link href="https://fonts.googleapis.com/css2?family=Fraunces:    */
/*  opsz,wght@9..144,300..900&family=DM+Sans:wght@400;500;600;700&    */
/*  family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">    */
/* ------------------------------------------------------------------ */

/** Reveals children with a soft rise-and-fade when they enter the viewport. */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const categories = [
  { name: "Crops & Grains", icon: Wheat, count: "1,240+ listings" },
  { name: "Dairy & Livestock", icon: Sprout, count: "860+ listings" },
  { name: "Seeds & Saplings", icon: Leaf, count: "2,010+ listings" },
  { name: "Tools & Rentals", icon: Tractor, count: "430+ machines" },
];

const steps = [
  {
    n: "Sow",
    title: "Farmers list the harvest",
    body: "Sellers add crops, dairy, livestock or tools straight from the field, with real photos and fair prices they set themselves.",
    icon: Sprout,
  },
  {
    n: "Browse",
    title: "Buyers shop direct",
    body: "No mandi queues, no middlemen markup. Search by crop, location or season and see exactly who grew it.",
    icon: Search,
  },
  {
    n: "Reap",
    title: "Everyone keeps more",
    body: "Secure payments, instant payouts and order tracking — farmers earn more, buyers pay less.",
    icon: HandCoins,
  },
];

const listings = [
  {
    title: "Organic Basmati Rice",
    seller: "Harpreet Singh · Punjab",
    price: "₹68/kg",
    tag: "Crop",
    rating: 4.8,
    image: "https://picsum.photos/seed/basmati-rice/600/450",
  },
  {
    title: "A2 Desi Cow Milk",
    seller: "Lakshmi Dairy · Mysuru",
    price: "₹72/L",
    tag: "Dairy",
    rating: 4.9,
    image: "https://picsum.photos/seed/desi-cow-milk/600/450",
  },
  {
    title: "Hybrid Tomato Seeds",
    seller: "GreenRoot Agro · Nashik",
    price: "₹140/pkt",
    tag: "Seeds",
    rating: 4.6,
    image: "https://picsum.photos/seed/tomato-seeds/600/450",
  },
  {
    title: "Mini Power Tiller",
    seller: "Rana Farm Equipment",
    price: "₹650/day",
    tag: "Rental",
    rating: 4.7,
    image: "https://picsum.photos/seed/power-tiller/600/450",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-[#F7F2E7] text-[#2B2620] font-[DM_Sans,sans-serif] overflow-x-hidden selection:bg-[#C97B3D] selection:text-white">
      {/* ---------------------------------------------------------------- */}
      {/* NAVBAR                                                            */}
      {/* ---------------------------------------------------------------- */}

      {/* ---------------------------------------------------------------- */}
      {/* HERO                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-5 sm:px-8">
        {/* organic blob backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] w-[640px] h-[640px] rounded-full bg-[#9BBF7E]/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 left-[-8%] w-[380px] h-[380px] rounded-full bg-[#D9A441]/25 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase font-[JetBrains_Mono,monospace] text-[#4A7C3F] bg-[#4A7C3F]/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C3F] animate-pulse" />
                Farm to door, no middlemen
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mt-6 font-[Fraunces,serif] text-[2.75rem] leading-[1.05] sm:text-6xl sm:leading-[1.02] tracking-tight">
                The harvest,
                <br />
                <span className="italic text-[#C97B3D]">sold direct</span>
                <span className="text-[#1F2E1A]">.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-lg text-[#2B2620]/70 max-w-md leading-relaxed">
                OrganicFarm connects growers straight to your basket — crops,
                dairy, livestock, seeds and farm equipment, priced fair on both
                sides.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const params = searchTerm.trim()
                    ? `?keyword=${encodeURIComponent(searchTerm.trim())}`
                    : "";
                  navigate(`/listings${params}`);
                }}
                className="mt-9 flex flex-col sm:flex-row gap-3 max-w-lg"
              >
                <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-5 py-3.5 shadow-[0_2px_20px_rgba(43,38,32,0.08)] ring-1 ring-[#2B2620]/5 focus-within:ring-2 focus-within:ring-[#4A7C3F] transition-all">
                  <Search size={18} className="text-[#2B2620]/40 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search rice, milk, tractors…"
                    className="w-full bg-transparent outline-none text-[15px] placeholder:text-[#2B2620]/40"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-[#C97B3D] text-white font-semibold text-center hover:bg-[#B56A30] active:scale-95 transition-all duration-200 shadow-[0_8px_20px_rgba(201,123,61,0.35)]"
                >
                  Browse Market
                </button>
              </form>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-12 flex items-center gap-8">
                {[
                  ["12K+", "Verified farmers"],
                  ["4,500+", "Live listings"],
                  ["0%", "Hidden commission*"],
                ].map(([num, label]) => (
                  <div key={label}>
                    <div className="font-[Fraunces,serif] text-2xl sm:text-3xl text-[#1F2E1A]">
                      {num}
                    </div>
                    <div className="text-xs text-[#2B2620]/55 mt-0.5">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* hero visual: stacked crate cards */}
          <Reveal delay={200} className="relative h-[420px] sm:h-[480px]">
            <div className="absolute inset-0 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(31,46,26,0.4)] overflow-hidden">
              <img
                src="https://picsum.photos/seed/organicfarm-hero-field/900/960"
                alt="Fresh harvest in the field"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {/* brand-toned wash so the photo reads as part of the palette, not a stock photo */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A7C3F]/55 via-[#2C4423]/45 to-[#1F2E1A]/80" />
              <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_2px_2px,#fff_1px,transparent_0)] bg-[length:22px_22px]" />
            </div>

            <div className="absolute -bottom-6 -left-4 sm:left-2 w-[78%] bg-white rounded-2xl p-4 shadow-[0_20px_40px_rgba(43,38,32,0.18)] animate-[float_6s_ease-in-out_infinite]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold font-[JetBrains_Mono,monospace] text-[#4A7C3F] bg-[#4A7C3F]/10 px-2 py-1 rounded-full">
                  Crop
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Star size={12} className="fill-[#D9A441] text-[#D9A441]" />
                  4.9
                </span>
              </div>
              <p className="mt-3 font-[Fraunces,serif] text-lg">
                Organic Basmati Rice
              </p>
              <p className="text-xs text-[#2B2620]/55 mt-1">
                Harpreet Singh · Punjab
              </p>
              <p className="mt-3 font-semibold text-[#C97B3D]">₹68/kg</p>
            </div>

            <div className="absolute -top-6 right-2 sm:-right-4 w-44 bg-white rounded-2xl p-3.5 shadow-[0_20px_40px_rgba(43,38,32,0.18)] animate-[float_7s_ease-in-out_infinite_0.5s]">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-[#D9A441]/15 text-[#D9A441]">
                  <Tractor size={16} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold leading-tight">
                    Tiller Rental
                  </p>
                  <p className="text-[11px] text-[#2B2620]/50">₹650/day</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* MARQUEE TRUST STRIP                                               */}
      {/* ---------------------------------------------------------------- */}
      <div className="border-y border-[#2B2620]/10 bg-[#1F2E1A] py-3.5 overflow-hidden">
        <div className="flex animate-[marquee_24s_linear_infinite] whitespace-nowrap gap-12">
          {Array(2)
            .fill([
              "Secure Razorpay payments",
              "Verified farmer profiles",
              "Same-week local delivery",
              "Real-time order tracking",
              "Fair-price guarantee",
            ])
            .flat()
            .map((t, i) => (
              <span
                key={i}
                className="text-[#F7F2E7]/70 text-sm font-medium font-[JetBrains_Mono,monospace] flex items-center gap-3"
              >
                <Leaf size={13} className="text-[#D9A441]" /> {t}
              </span>
            ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* CATEGORIES                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 px-5 sm:px-8 max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold tracking-wide uppercase font-[JetBrains_Mono,monospace] text-[#C97B3D]">
                What's growing
              </span>
              <h2 className="mt-3 font-[Fraunces,serif] text-3xl sm:text-4xl">
                Shop the marketplace
              </h2>
            </div>
            <Link
              to="/listings"
              className="flex items-center gap-1 text-sm font-semibold text-[#1F2E1A] hover:gap-2 transition-all"
            >
              View all categories <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map(({ name, icon: Icon, count }, i) => (
            <Reveal key={name} delay={i * 100}>
              <div className="group relative h-56 rounded-3xl bg-white p-6 flex flex-col justify-between overflow-hidden shadow-[0_2px_20px_rgba(43,38,32,0.06)] hover:shadow-[0_20px_40px_rgba(43,38,32,0.14)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer">
                <div
                  aria-hidden
                  className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#4A7C3F]/0 group-hover:bg-[#4A7C3F]/10 transition-colors duration-300"
                />
                <span className="relative grid place-items-center w-12 h-12 rounded-2xl bg-[#1F2E1A] text-[#D9A441] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Icon size={22} />
                </span>
                <div className="relative">
                  <p className="font-[Fraunces,serif] text-xl leading-snug">
                    {name}
                  </p>
                  <p className="text-xs text-[#2B2620]/50 mt-1">{count}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* HOW IT WORKS                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 px-5 sm:px-8 bg-[#1F2E1A] text-[#F7F2E7] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_2px_2px,#fff_1px,transparent_0)] bg-[length:26px_26px]"
        />
        <div className="relative max-w-7xl mx-auto">
          <Reveal>
            <span className="text-xs font-semibold tracking-wide uppercase font-[JetBrains_Mono,monospace] text-[#D9A441]">
              The cycle
            </span>
            <h2 className="mt-3 font-[Fraunces,serif] text-3xl sm:text-4xl max-w-lg">
              Three steps replace the entire mandi chain
            </h2>
          </Reveal>

          <div className="mt-16 grid md:grid-cols-3 gap-10 relative">
            <div
              aria-hidden
              className="hidden md:block absolute top-7 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-[#D9A441]/0 via-[#D9A441]/40 to-[#D9A441]/0"
            />
            {steps.map(({ n, title, body, icon: Icon }, i) => (
              <Reveal key={n} delay={i * 150}>
                <div>
                  <div className="flex items-center gap-4">
                    <span className="grid place-items-center w-14 h-14 rounded-full bg-[#F7F2E7] text-[#1F2E1A]">
                      <Icon size={22} />
                    </span>
                    <span className="font-[Fraunces,serif] italic text-2xl text-[#D9A441]">
                      {n}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-[#F7F2E7]/65 leading-relaxed text-[15px]">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FEATURED LISTINGS                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 px-5 sm:px-8 max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold tracking-wide uppercase font-[JetBrains_Mono,monospace] text-[#4A7C3F]">
                Fresh this week
              </span>
              <h2 className="mt-3 font-[Fraunces,serif] text-3xl sm:text-4xl">
                Featured listings
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {listings.map(({ title, seller, price, tag, rating, image }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="group rounded-3xl bg-white overflow-hidden shadow-[0_2px_20px_rgba(43,38,32,0.06)] hover:shadow-[0_20px_40px_rgba(43,38,32,0.14)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer">
                <div className="h-44 relative overflow-hidden bg-gradient-to-br from-[#9BBF7E] to-[#4A7C3F]">
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-[11px] font-semibold font-[JetBrains_Mono,monospace] bg-white/90 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-[Fraunces,serif] text-lg leading-snug">
                      {title}
                    </p>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-[#2B2620]/50 mt-1.5">
                    <MapPin size={11} /> {seller}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold text-[#C97B3D]">
                      {price}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold">
                      <Star
                        size={12}
                        className="fill-[#D9A441] text-[#D9A441]"
                      />
                      {rating}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* VALUE STRIP                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-5 sm:px-8 max-w-7xl mx-auto pb-24">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            [
              ShieldCheck,
              "Verified sellers",
              "Every farmer and seller is identity-checked before they list.",
            ],
            [
              Truck,
              "Local-first delivery",
              "Orders route to nearby buyers first, cutting transit and spoilage.",
            ],
            [
              HandCoins,
              "Fair-price payouts",
              "Sellers see earnings instantly, with zero hidden commission.",
            ],
          ].map(([Icon, title, body], i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="rounded-3xl border border-[#2B2620]/10 p-7 hover:border-[#4A7C3F]/40 hover:bg-white transition-all duration-300">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#4A7C3F]/10 text-[#4A7C3F]">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-sm text-[#2B2620]/60 leading-relaxed">
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA                                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-5 sm:px-8 max-w-7xl mx-auto pb-24">
        <Reveal>
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#C97B3D] to-[#A85F2A] px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_2px_2px,#fff_1px,transparent_0)] bg-[length:24px_24px]"
            />
            <ShoppingBasket
              className="relative mx-auto text-white/90"
              size={36}
            />
            <h2 className="relative mt-6 font-[Fraunces,serif] text-3xl sm:text-5xl text-white max-w-2xl mx-auto leading-tight">
              Got a harvest ready to sell?
            </h2>
            <p className="relative mt-4 text-white/80 max-w-md mx-auto">
              List in under five minutes and reach buyers in your district by
              tomorrow morning.
            </p>
            <Link
              to="/register"
              className="relative inline-block mt-9 px-8 py-4 rounded-full bg-[#1F2E1A] text-[#F7F2E7] font-semibold hover:bg-[#16210F] active:scale-95 transition-all duration-200"
            >
              Start Selling Today
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FOOTER                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer className="bg-[#1F2E1A] text-[#F7F2E7] px-5 sm:px-8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-[#D9A441] text-[#1F2E1A]">
                <Leaf size={18} strokeWidth={2.4} />
              </span>
              <span className="font-[Fraunces,serif] text-xl">
                Organic<span className="text-[#D9A441]">Farm</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-[#F7F2E7]/55 leading-relaxed max-w-xs">
              The marketplace where growers and buyers trade directly — fair
              prices, fresher harvest.
            </p>
          </div>

          {[
            [
              "Marketplace",
              [
                "Crops & Grains",
                "Dairy & Livestock",
                "Seeds & Saplings",
                "Tools & Rentals",
              ],
            ],
            ["Company", ["About us", "Careers", "Sell with us", "Contact"]],
            [
              "Support",
              ["Help center", "Order tracking", "Payments", "Returns"],
            ],
          ].map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-sm tracking-wide uppercase text-[#D9A441]/90 font-[JetBrains_Mono,monospace] text-xs">
                {heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[#F7F2E7]/60 hover:text-[#F7F2E7] transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-[#F7F2E7]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#F7F2E7]/45">
            © {new Date().getFullYear()} OrganicFarm. All rights reserved.
          </p>
          <p className="text-xs text-[#F7F2E7]/45">
            Made for the people who grow our food.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
