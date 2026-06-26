import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-green-700 text-white px-8 py-5 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <Link to="/" className="text-3xl font-bold">
        🌱 OrganicFarm
      </Link>

      <div className="flex items-center gap-8 text-lg">
        {/* Home visible to everyone */}
        <Link to="/" className="hover:text-yellow-300">
          Home
        </Link>

        {/* Guest */}
        {!user && (
          <>
            <Link to="/listings" className="hover:text-yellow-300">
              Listings
            </Link>

            <Link to="/login" className="hover:text-yellow-300">
              Login
            </Link>

            <Link to="/register" className="hover:text-yellow-300">
              Register
            </Link>
          </>
        )}

        {/* Buyer */}
        {user?.role === "buyer" && (
          <>
            <Link to="/listings" className="hover:text-yellow-300">
              Listings
            </Link>

            <Link to="/cart" className="hover:text-yellow-300">
              Cart
            </Link>
            <Link to="/buyer-orders" className="hover:text-yellow-300">
              My Orders
            </Link>

            <Link to="/notifications" className="hover:text-yellow-300">
              🔔
            </Link>

            <Link to="/buyer-dashboard" className="hover:text-yellow-300">
              Dashboard
            </Link>
          </>
        )}

        {/* Seller */}
        {user?.role === "seller" && (
          <>
            <Link to="/my-listings" className="hover:text-yellow-300">
              My Listings
            </Link>

            <Link to="/seller-orders" className="hover:text-yellow-300">
              Orders
            </Link>

            <Link to="/notifications" className="hover:text-yellow-300">
              🔔
            </Link>

            <Link to="/seller-dashboard" className="hover:text-yellow-300">
              Dashboard
            </Link>
          </>
        )}

        {/* Logged In User */}
        {user && (
          <>
            <span className="font-semibold">Hi, {user.name}</span>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
