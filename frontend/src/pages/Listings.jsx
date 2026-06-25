import { useEffect, useState } from "react";
import api from "../services/api";
import ListingCard from "../components/ListingCard";

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get("/listings");

      setListings(res.data.listings);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-2xl text-center">Loading Listings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">All Listings</h1>

      {listings.length === 0 ? (
        <div className="text-center text-2xl text-gray-500">
          No Listings Found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <ListingCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;
