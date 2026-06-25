import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/listings/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setListings(res.data.listings);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchListings();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return <h1 className="text-center text-2xl mt-10">Loading...</h1>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Listings</h1>

        <Link
          to="/add-listing"
          className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
        >
          + Add Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <h2 className="text-xl text-gray-500">No listings found.</h2>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-56 object-cover"
              />

              <div className="p-5">
                <h2 className="text-2xl font-bold">{item.title}</h2>

                <p className="text-gray-500">{item.category}</p>

                <p className="mt-2">📍 {item.location}</p>

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
                    to={`/edit-listing/${item._id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-center"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteListing(item._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
