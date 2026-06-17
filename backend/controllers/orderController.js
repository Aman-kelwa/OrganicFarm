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

    if (quantity > listing.quantity) {
      return res.status(400).json({
        message: `Only ${listing.quantity} ${listing.quantityType} available`,
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

//get orders

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user._id,
    })
      .populate("listing", "title price image")
      .populate("seller", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//seller see orders
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      seller: req.user._id,
    })
      .populate("buyer", "name email")
      .populate("listing", "title image price")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//update status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only seller can update his orders
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    // Reduce inventory when order gets confirmed
    if (order.orderStatus !== "confirmed" && orderStatus === "confirmed") {
      const listing = await Listing.findById(order.listing);

      if (!listing) {
        return res.status(404).json({
          message: "Listing not found",
        });
      }

      // Stock validation
      if (listing.quantity < order.quantity) {
        return res.status(400).json({
          message: `Only ${listing.quantity} ${listing.quantityType} available`,
        });
      }

      // Reduce stock
      listing.quantity = listing.quantity - order.quantity;

      // Mark unavailable if stock becomes 0
      if (listing.quantity === 0) {
        listing.available = false;
      }

      await listing.save();
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//cancle order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only buyer can cancel
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    // Prevent multiple cancellations
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Order already cancelled",
      });
    }

    // Restore stock
    const listing = await Listing.findById(order.listing);

    if (listing) {
      listing.quantity += order.quantity;

      listing.available = true;

      await listing.save();
    }

    order.orderStatus = "cancelled";

    console.log("Logged User:", req.user._id);

    console.log("Order Buyer:", order.buyer);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
