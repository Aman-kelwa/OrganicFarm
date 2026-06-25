import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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
  }, []);

  const fetchListing = async () => {
    try {
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
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };

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

      alert("Listing Updated Successfully");

      navigate("/my-listings");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Edit Listing</h1>

        {/* Current / New Image */}

        <div className="mb-8">
          <label className="font-semibold block mb-2">Product Image</label>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-60 rounded-xl object-cover mb-4"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Type */}

        <div className="mb-5">
          <label className="font-semibold block mb-2">Listing Type</label>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        {/* Category */}

        <div className="mb-5">
          <label className="font-semibold block mb-2">Category</label>

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Title */}

        <div className="mb-5">
          <label className="font-semibold block mb-2">Title</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Description */}

        <div className="mb-5">
          <label className="font-semibold block mb-2">Description</label>

          <textarea
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Sale / Rent */}

        {formData.type === "sale" ? (
          <div className="mb-5">
            <label className="font-semibold block mb-2">Price (₹)</label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        ) : (
          <div className="mb-5">
            <label className="font-semibold block mb-2">Rent Per Day (₹)</label>

            <input
              type="number"
              name="rentPerDay"
              value={formData.rentPerDay}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        )}

        {/* Quantity */}

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="font-semibold block mb-2">Quantity</label>

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">Quantity Type</label>

            <select
              name="quantityType"
              value={formData.quantityType}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="unit">unit</option>
              <option value="litre">litre</option>
              <option value="hour">hour</option>
              <option value="day">day</option>
            </select>
          </div>
        </div>

        {/* Location */}

        <div className="mt-5">
          <label className="font-semibold block mb-2">Location</label>

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Update Button */}

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
