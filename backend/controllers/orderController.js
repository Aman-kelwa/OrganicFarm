import Order from "../models/Order.js";
import Listing from "../models/Listing.js";

export const createOrder = async (req, res) => {
  try {
    const { listingId, quantity } = req.body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    const totalPrice = listing.price * quantity;

    const order = await Order.create({
      buyer: req.user._id,

      seller: listing.owner,

      listing: listing._id,

      quantity,

      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Order Created Successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
