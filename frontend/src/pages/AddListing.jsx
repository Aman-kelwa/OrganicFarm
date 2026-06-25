import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AddListing = () => {
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
    quantityType: "kg",
    location: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!image) {
      return alert("Please select an image");
    }

    try {
      setLoading(true);

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

      alert(res.data.message);

      navigate("/my-listings");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Add New Listing</h1>

        {/* Image */}

        <div className="mb-8">
          <label className="font-semibold block mb-2">Product Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full border rounded-lg p-3"
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-4 h-60 rounded-xl object-cover"
            />
          )}
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
            placeholder="Seeds, Tractor, Fruits..."
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
            placeholder="Organic Wheat"
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

        {/* Price */}

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
              <option>kg</option>
              <option>quintal</option>
              <option>unit</option>
              <option>litre</option>
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
        {/* Submit Button */}

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-semibold transition disabled:bg-gray-400"
          >
            {loading ? "Creating Listing..." : "Create Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
