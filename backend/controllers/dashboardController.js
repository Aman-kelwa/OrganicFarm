import Listing from "../models/Listing.js";
import Order from "../models/Order.js";

export const getSellerDashboard = async (req, res) => {
  try {
    // Total Listings
    const totalListings = await Listing.countDocuments({
      owner: req.user._id,
    });

    // Seller Orders
    const orders = await Order.find({
      seller: req.user._id,
    }).populate("listing", "title");

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.orderStatus === "pending",
    ).length;

    const completedOrders = orders.filter(
      (order) => order.orderStatus === "completed",
    ).length;

    // Revenue
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );

    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    res.status(200).json({
      success: true,

      totalListings,

      totalOrders,

      pendingOrders,

      completedOrders,

      totalRevenue,

      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getBuyerDashboard = async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user._id,
    }).populate("listing", "title");

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.orderStatus === "pending",
    ).length;

    const completedOrders = orders.filter(
      (order) => order.orderStatus === "completed",
    ).length;

    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    res.status(200).json({
      success: true,

      totalOrders,

      pendingOrders,

      completedOrders,

      totalSpent,

      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
