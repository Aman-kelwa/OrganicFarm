import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const ListingDetails = () => {
  const { id } = useParams();

  const [listing, setListing] = useState(null);

  useEffect(() => {
    fetchListing();
  }, []);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);

      setListing(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!listing) {
    return <h1 className="p-10">Loading...</h1>;
  }

  return (
    <div className="p-10">
      <img
        src={listing.image}
        alt={listing.title}
        className="w-96 rounded-lg"
      />

      <h1 className="text-4xl font-bold mt-6">{listing.title}</h1>

      <p className="mt-4">{listing.description}</p>

      <p className="text-2xl text-green-600 mt-4">
        ₹{listing.type === "sale" ? listing.price : listing.rentPerDay}
      </p>

      <p className="mt-2">
        Stock: {listing.quantity} {listing.quantityType}
      </p>

      <p className="mt-2">📍 {listing.location}</p>
    </div>
  );
};

export default ListingDetails;
