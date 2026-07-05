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
    const id = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 700);
    }, 8000);
    setShake(true);
    return () => clearInterval(id);
  }, [count]);

  return (
    <Link
      to={to}
      className="relative group grid place-items-center w-10 h-10 rounded-xl bg-white/6 border border-white/8 hover:bg-white/12 hover:border-white/18 transition-all"
    >
      <Bell
        size={17}
        className={`text-white/65 group-hover:text-white transition-colors ${shake ? "animate-[bellRing_0.6s_ease-in-out]" : ""}`}
      />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#5C9E31] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(92,158,49,0.8)] animate-[popIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
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
    const fn = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[14px] font-medium text-white/65 hover:text-white hover:bg-white/6 transition-all"
      >
        {trigger}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#111911] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-200 origin-top-right z-50 ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
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
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${danger ? "text-red-400 hover:bg-red-500/10" : "text-white/65 hover:text-white hover:bg-white/6"}`}
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
        `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[14px] font-medium transition-all ${isActive ? "bg-[#5C9E31]/20 text-[#A8E063] border border-[#5C9E31]/30" : "text-white/60 hover:text-white hover:bg-white/6"}`
      }
    >
      {Icon && <Icon size={14} />}
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
        `flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
          isActive
            ? "bg-[#5C9E31]/15 text-[#A8E063] border border-[#5C9E31]/25"
            : highlight
              ? "bg-[#5C9E31]/10 text-[#A8E063] border border-[#5C9E31]/20 hover:bg-[#5C9E31]/20"
              : "text-white/60 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <span className="flex items-center gap-3">
        <Icon size={16} className="shrink-0" />
        {label}
      </span>
      {badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-[#5C9E31] text-[10px] font-bold text-white">
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
    const fn = () => setScrolled(window.scrollY > 50);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")[0] ?? "";
  const avatar = firstName[0]?.toUpperCase() ?? "?";
  const isHome = location.pathname === "/";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0B0F0A]/95 backdrop-blur-xl border-b border-white/6 py-3" : "bg-transparent py-5"}`}
      >
        <nav className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31] text-white group-hover:scale-110 transition-transform duration-300">
              <Leaf size={18} strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-xl bg-[#5C9E31] animate-ping opacity-0 group-hover:opacity-25" />
            </span>
            <span className="font-['Playfair_Display',serif] text-[#75c611] text-[1.3rem] tracking-tight hidden sm:block">
              Organic<span className="text-[#75c611]">Farm</span>
            </span>
          </Link>

          {/* AI ASSISTANT — only shown on the home page, for guests, buyers, and sellers alike */}
          {isHome && (
            <NavLink
              to="/ai-chat"
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-400/30 shadow-[0_0_18px_-4px_rgba(52,211,153,0.45)]"
                    : "text-gray-300 border-emerald-400/20 hover:text-emerald-400 hover:bg-white/5 hover:border-emerald-400/40 hover:-translate-y-0.5 hover:shadow-[0_0_20px_-6px_rgba(52,211,153,0.5)] animate-pulse hover:animate-none"
                }`
              }
            >
              <span className="animate-bounce">🤖</span>
              AI Assistant
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </NavLink>
          )}

          {/* DESKTOP CENTER */}
          <div className="hidden md:flex items-center gap-1">
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
          <div className="hidden md:flex items-center gap-2">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-[14px] font-semibold rounded-xl bg-[#5C9E31] hover:bg-[#4E8A28] active:scale-95 transition-all shadow-[0_0_20px_rgba(92,158,49,0.35)]"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-[14px] font-semibold rounded-xl bg-[#5C9E31] hover:bg-[#4E8A28] active:scale-95 transition-all shadow-[0_0_20px_rgba(92,158,49,0.35)]"
                >
                  Join Free
                </Link>
              </>
            )}

            {user?.role === "buyer" && (
              <>
                <Link
                  to="/cart"
                  className="relative group grid place-items-center w-10 h-10 rounded-xl bg-white/6 border border-white/8 hover:bg-white/12 hover:border-white/18 transition-all"
                >
                  <ShoppingCart
                    size={17}
                    className="text-white/65 group-hover:text-white transition-colors"
                  />
                </Link>
                <NotifBell to="/notifications" count={notifCount} />
                <Dropdown
                  trigger={
                    <span className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#5C9E31]/30 border border-[#5C9E31]/40 grid place-items-center text-[#A8E063] text-xs font-bold">
                        {avatar}
                      </span>
                      <span className="text-[14px] text-white/80">
                        {firstName}
                      </span>
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
                  <div className="h-px bg-white/6 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </Dropdown>
              </>
            )}

            {user?.role === "seller" && (
              <>
                <Link
                  to="/add-listing"
                  className="px-4 py-2 text-[13px] font-semibold rounded-xl bg-[#5C9E31]/15 text-[#A8E063] border border-[#5C9E31]/30 hover:bg-[#5C9E31]/25 transition-all"
                >
                  + New Listing
                </Link>
                <NotifBell to="/notifications" count={notifCount} />
                <Dropdown
                  trigger={
                    <span className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 grid place-items-center text-amber-400 text-xs font-bold">
                        {avatar}
                      </span>
                      <span className="text-[14px] text-white/80">
                        {firstName}
                      </span>
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
                  <div className="h-px bg-white/6 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </Dropdown>
              </>
            )}
          </div>

          {/* MOBILE ICONS + HAMBURGER */}
          <div className="md:hidden flex items-center gap-2">
            {user && <NotifBell to="/notifications" count={notifCount} />}
            <button
              onClick={() => setMobile((v) => !v)}
              className="grid place-items-center w-10 h-10 rounded-xl bg-white/6 border border-white/8 text-white/75 hover:bg-white/12 transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* MOBILE BACKDROP */}
      <div
        onClick={() => setMobile(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* MOBILE DRAWER */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-[80vw] max-w-sm bg-[#0E140D] border-l border-white/8 shadow-2xl md:hidden transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/6">
          <span className="font-['Playfair_Display',serif] text-lg">
            Organic<span className="text-[#A8E063]">Farm</span>
          </span>
          <button
            onClick={() => setMobile(false)}
            className="grid place-items-center w-9 h-9 rounded-xl bg-white/6 text-white/60"
          >
            <X size={18} />
          </button>
        </div>

        {user && (
          <div className="mx-5 mt-5 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/8">
            <span
              className={`w-10 h-10 rounded-xl grid place-items-center font-bold text-sm ${user.role === "seller" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-[#5C9E31]/20 text-[#A8E063] border border-[#5C9E31]/30"}`}
            >
              {avatar}
            </span>
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-[11px] text-white/40 capitalize font-['Space_Mono',monospace]">
                {user.role}
              </p>
            </div>
          </div>
        )}

        <div className="px-4 mt-5 flex flex-col gap-1 overflow-y-auto pb-28">
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

        <div className="absolute bottom-0 inset-x-0 p-5 border-t border-white/6 bg-[#0E140D]">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all active:scale-95"
            >
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#5C9E31] font-semibold text-sm text-white shadow-[0_0_20px_rgba(92,158,49,0.4)] active:scale-95 transition-all"
            >
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
