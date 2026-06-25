import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const ListingCard = ({ item }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/cart/add",
        {
          listingId: item._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Added to Cart");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-56 object-cover"
      />

      <div className="p-5">
        <h2 className="text-2xl font-bold">{item.title}</h2>

        <p className="text-gray-500 mt-2">{item.category}</p>

        <p className="text-gray-500">📍 {item.location}</p>

        {item.type === "sale" ? (
          <p className="text-green-600 text-2xl font-bold mt-3">
            ₹{item.price}
          </p>
        ) : (
          <p className="text-blue-600 text-2xl font-bold mt-3">
            ₹{item.rentPerDay}/day
          </p>
        )}

        <p className="mt-2">
          Stock: {item.quantity} {item.quantityType}
        </p>

        <div className="flex gap-3 mt-5">
          <Link
            to={`/listings/${item._id}`}
            className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700"
          >
            View Details
          </Link>

          {/* Only buyers can see Add To Cart */}
          {user?.role === "buyer" && (
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
            >
              Add To Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
