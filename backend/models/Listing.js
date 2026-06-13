import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Sale or Rent
    type: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },

    // Crop, Dairy, Livestock, Tool, Seeds etc.
    category: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // Selling Price
    price: {
      type: Number,
      default: 0,
    },

    // Rental Price Per Day
    rentPerDay: {
      type: Number,
      default: 0,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    quantityType: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      required: true,
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
