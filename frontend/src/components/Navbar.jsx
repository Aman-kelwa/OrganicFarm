/*
  OrganicFarm – Navbar (Design System v2: light & simple)
  Uses the same tokens as Home.jsx:
  white #FFFFFF · soft #F6F8F4 · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · primary #2E7D32 (hover #256628)
*/

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Leaf,
  Bell,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Package,
  ListChecks,
  Store,
  Home,
  Search,
  User,
  Settings,
  TrendingUp,
  Tractor,
} from "lucide-react";

/* ─── shared style primitives (same as Home.jsx) ─── */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const iconBtn = `relative grid place-items-center w-10 h-10 rounded-xl border border-[#E4E8E1] bg-white text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C] transition-colors duration-200 ${focusRing}`;
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-10 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const btnOutline = `${btn} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const btnSoft = `${btn} bg-[#EAF4E6] text-[#256628] hover:bg-[#DCEED6]`;

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function NotifBell({ to, count = 0 }) {
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!count) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 700);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <Link
      to={to}
      aria-label={count > 0 ? `Notifications, ${count} new` : "Notifications"}
      className={iconBtn}
    >
      <Bell
        size={17}
        className={
          shake
            ? "animate-[bellRing_0.6s_ease-in-out] motion-reduce:animate-none"
            : ""
        }
      />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#2E7D32] border-2 border-white text-[10px] font-bold text-white animate-[popIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 h-10 pl-2 pr-3 rounded-xl border border-[#E4E8E1] bg-white text-[14px] font-medium text-[#1F2A1C] hover:bg-[#F6F8F4] transition-colors duration-200 ${focusRing}`}
      >
        {trigger}
        <ChevronDown
          size={14}
          className={`text-[#5B6559] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        role="menu"
        className={`absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[#E4E8E1] shadow-lg overflow-hidden transition-all duration-200 origin-top-right z-50 motion-reduce:transition-none ${open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}
      >
        <div className="p-1.5" onClick={() => setOpen(false)}>
          {children}
        </div>
      </div>
    </div>
  );
}

function DropItem({ to, icon: Icon, label, danger = false }) {
  return (
    <Link
      to={to}
      role="menuitem"
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-200 ${focusRing} ${danger ? "text-red-600 hover:bg-red-50" : "text-[#5B6559] hover:text-[#1F2A1C] hover:bg-[#F6F8F4]"}`}
    >
      <Icon size={15} className="shrink-0" />
      {label}
    </Link>
  );
}

function NavItem({ to, label, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-[14px] font-medium transition-colors duration-200 ${focusRing} ${isActive ? "bg-[#EAF4E6] text-[#256628]" : "text-[#5B6559] hover:text-[#1F2A1C] hover:bg-[#F6F8F4]"}`
      }
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {label}
    </NavLink>
  );
}

function MobileLink({
  to,
  icon: Icon,
  label,
  badge = 0,
  highlight = false,
  end = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium transition-colors duration-200 ${focusRing} ${
          isActive
            ? "bg-[#EAF4E6] text-[#256628]"
            : highlight
              ? "border border-[#2E7D32]/30 bg-[#EAF4E6]/60 text-[#256628] hover:bg-[#EAF4E6]"
              : "text-[#5B6559] hover:text-[#1F2A1C] hover:bg-[#F6F8F4]"
        }`
      }
    >
      <span className="flex items-center gap-3">
        <Icon size={16} className="shrink-0" aria-hidden="true" />
        {label}
      </span>
      {badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-[#2E7D32] text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Navbar({ notifCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobile] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, [location.pathname]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    setMobile(false);
  }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobile(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")[0] ?? "";
  const avatar = firstName[0]?.toUpperCase() ?? "?";
  const isHome = location.pathname === "/";

  const avatarCls =
    "w-7 h-7 rounded-full bg-[#EAF4E6] text-[#256628] grid place-items-center text-xs font-bold";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-white border-b border-[#E4E8E1] transition-shadow duration-200 ${scrolled ? "shadow-sm" : ""}`}
      >
        <nav
          aria-label="Main"
          className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4"
        >
          {/* LOGO */}
          <Link
            to="/"
            className={`flex items-center gap-2.5 shrink-0 rounded-lg ${focusRing}`}
          >
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#2E7D32] text-white">
              <Leaf size={18} strokeWidth={2.5} />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#1F2A1C] hidden sm:block">
              Organic<span className="text-[#2E7D32]">Farm</span>
            </span>
          </Link>

          {/* AI ASSISTANT — only shown on the home page, for guests, buyers, and sellers alike */}
          {isHome && (
            <NavLink
              to="/ai-chat"
              aria-label="AI Assistant"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 h-10 rounded-full text-sm font-semibold border transition-colors duration-200 ${focusRing} ${
                  isActive
                    ? "bg-[#EAF4E6] text-[#256628] border-[#2E7D32]/40"
                    : "bg-white text-[#1F2A1C] border-[#D5DBD0] hover:border-[#2E7D32] hover:text-[#256628]"
                }`
              }
            >
              <span aria-hidden="true">🤖</span>
              <span className="hidden sm:inline">AI Assistant</span>
            </NavLink>
          )}

          {/* DESKTOP CENTER */}
          <div className="hidden lg:flex items-center gap-1">
            {!user && (
              <>
                <NavItem to="/" label="Home" icon={Home} end />
                <NavItem to="/listings" label="Marketplace" icon={Search} />
              </>
            )}
            {user?.role === "buyer" && (
              <>
                <NavItem to="/" label="Home" icon={Home} end />
                <NavItem to="/listings" label="Shop" icon={Search} />
                <NavItem to="/buyer-orders" label="My Orders" icon={Package} />
                <NavItem to="/my-rentals" label="My Rentals" icon={Tractor} />
                <NavItem
                  to="/buyer-dashboard"
                  label="Dashboard"
                  icon={TrendingUp}
                />
              </>
            )}
            {user?.role === "seller" && (
              <>
                <NavItem to="/" label="Home" icon={Home} end />
                <NavItem
                  to="/my-listings"
                  label="My Listings"
                  icon={ListChecks}
                />
                <NavItem to="/seller-orders" label="Orders" icon={Package} />
                <NavItem to="/seller-rentals" label="Rentals" icon={Tractor} />
                <NavItem
                  to="/seller-dashboard"
                  label="Dashboard"
                  icon={TrendingUp}
                />
              </>
            )}
          </div>

          {/* DESKTOP RIGHT */}
          <div className="hidden lg:flex items-center gap-2">
            {!user && (
              <>
                <Link to="/login" className={btnOutline}>
                  Log in
                </Link>
                <Link to="/register" className={btnPrimary}>
                  Join Free
                </Link>
              </>
            )}

            {user?.role === "buyer" && (
              <>
                <Link to="/cart" aria-label="Cart" className={iconBtn}>
                  <ShoppingCart size={17} />
                </Link>
                <NotifBell to="/notifications" count={notifCount} />
                <Dropdown
                  trigger={
                    <span className="flex items-center gap-2">
                      <span className={avatarCls}>{avatar}</span>
                      <span>{firstName}</span>
                    </span>
                  }
                >
                  <DropItem
                    to="/buyer-dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                  />
                  <DropItem
                    to="/buyer-orders"
                    icon={Package}
                    label="My Orders"
                  />
                  <DropItem
                    to="/my-rentals"
                    icon={Tractor}
                    label="My Rentals"
                  />
                  <DropItem to="/profile" icon={Settings} label="Profile" />
                  <div className="h-px bg-[#E4E8E1] my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 ${focusRing}`}
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </Dropdown>
              </>
            )}

            {user?.role === "seller" && (
              <>
                <Link to="/add-listing" className={btnSoft}>
                  + New Listing
                </Link>
                <NotifBell to="/notifications" count={notifCount} />
                <Dropdown
                  trigger={
                    <span className="flex items-center gap-2">
                      <span className={avatarCls}>{avatar}</span>
                      <span>{firstName}</span>
                    </span>
                  }
                >
                  <DropItem
                    to="/seller-dashboard"
                    icon={TrendingUp}
                    label="Dashboard"
                  />
                  <DropItem
                    to="/my-listings"
                    icon={ListChecks}
                    label="My Listings"
                  />
                  <DropItem to="/seller-orders" icon={Package} label="Orders" />
                  <DropItem
                    to="/seller-rentals"
                    icon={Tractor}
                    label="Rentals"
                  />
                  <DropItem to="/profile" icon={Settings} label="Profile" />
                  <div className="h-px bg-[#E4E8E1] my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 ${focusRing}`}
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </Dropdown>
              </>
            )}
          </div>

          {/* MOBILE ICONS + HAMBURGER */}
          <div className="lg:hidden flex items-center gap-2">
            {user && <NotifBell to="/notifications" count={notifCount} />}
            <button
              type="button"
              onClick={() => setMobile((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className={iconBtn}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* MOBILE BACKDROP */}
      <div
        onClick={() => setMobile(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300 motion-reduce:transition-none ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* MOBILE DRAWER */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed top-0 right-0 bottom-0 z-50 w-[80vw] max-w-sm bg-white border-l border-[#E4E8E1] shadow-xl lg:hidden transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none ${mobileOpen ? "translate-x-0 visible" : "translate-x-full invisible"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#E4E8E1]">
          <span className="text-lg font-bold text-[#1F2A1C]">
            Organic<span className="text-[#2E7D32]">Farm</span>
          </span>
          <button
            type="button"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
            className={iconBtn}
          >
            <X size={18} />
          </button>
        </div>

        {user && (
          <div className="mx-5 mt-5 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F6F8F4] border border-[#E4E8E1]">
            <span className="w-10 h-10 rounded-xl bg-[#EAF4E6] text-[#256628] grid place-items-center font-bold text-sm">
              {avatar}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1F2A1C]">
                {user.name}
              </p>
              <p className="text-xs text-[#5B6559] capitalize">{user.role}</p>
            </div>
          </div>
        )}

        <div className="px-4 mt-5 flex flex-col gap-1 overflow-y-auto pb-28 max-h-[calc(100vh-14rem)]">
          <MobileLink to="/" icon={Home} label="Home" end />

          {!user && (
            <>
              <MobileLink to="/listings" icon={Search} label="Marketplace" />
              <MobileLink to="/login" icon={User} label="Log in" />
            </>
          )}

          {user?.role === "buyer" && (
            <>
              <MobileLink to="/listings" icon={Search} label="Shop" />
              <MobileLink to="/cart" icon={ShoppingCart} label="Cart" />
              <MobileLink to="/buyer-orders" icon={Package} label="My Orders" />
              <MobileLink to="/my-rentals" icon={Tractor} label="My Rentals" />
              <MobileLink
                to="/buyer-dashboard"
                icon={TrendingUp}
                label="Dashboard"
              />
              <MobileLink
                to="/notifications"
                icon={Bell}
                label="Notifications"
                badge={notifCount}
              />
              <MobileLink to="/profile" icon={Settings} label="Profile" />
            </>
          )}

          {user?.role === "seller" && (
            <>
              <MobileLink
                to="/my-listings"
                icon={ListChecks}
                label="My Listings"
              />
              <MobileLink
                to="/my-listings/new"
                icon={Store}
                label="Add New Listing"
                highlight
              />
              <MobileLink to="/seller-orders" icon={Package} label="Orders" />
              <MobileLink to="/seller-rentals" icon={Tractor} label="Rentals" />
              <MobileLink
                to="/seller-dashboard"
                icon={TrendingUp}
                label="Dashboard"
              />
              <MobileLink
                to="/notifications"
                icon={Bell}
                label="Notifications"
                badge={notifCount}
              />
              <MobileLink to="/profile" icon={Settings} label="Profile" />
            </>
          )}
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 border-t border-[#E4E8E1] bg-white">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors duration-200 active:scale-[0.98] ${focusRing}`}
            >
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <Link to="/register" className={`${btnPrimary} w-full h-12`}>
              Join as Farmer or Buyer
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bellRing {
          0%,100% { transform:rotate(0deg); }
          15%     { transform:rotate(18deg); }
          30%     { transform:rotate(-16deg); }
          45%     { transform:rotate(12deg); }
          60%     { transform:rotate(-8deg); }
          75%     { transform:rotate(4deg); }
        }
        @keyframes popIn {
          from { transform:scale(0); opacity:0; }
          to   { transform:scale(1); opacity:1; }
        }
      `}</style>
    </>
  );
}
