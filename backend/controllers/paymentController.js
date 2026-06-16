import Cart from "../models/Cart.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import Listing from "../models/Listing.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.listing");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;

    cart.items.forEach((item) => {
      totalAmount += item.listing.price * item.quantity;
    });

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      totalAmount,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Generate Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Verify Signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payment Signature",
      });
    }

    // Get User Cart
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.listing");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const createdOrders = [];

    // Create Orders
    for (const item of cart.items) {
      const listing = item.listing;

      // Stock Check
      if (listing.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${listing.quantity} ${listing.quantityType} of ${listing.title} available`,
        });
      }

      // Reduce Inventory
      listing.quantity = listing.quantity - item.quantity;

      // Mark unavailable if stock becomes zero
      if (listing.quantity === 0) {
        listing.available = false;
      }

      await listing.save();

      // Create Order
      const order = await Order.create({
        buyer: req.user._id,

        seller: listing.owner,

        listing: listing._id,

        quantity: item.quantity,

        totalPrice: listing.price * item.quantity,

        orderStatus: "confirmed",

        paymentStatus: "paid",

        paymentId: razorpay_payment_id,
      });

      createdOrders.push(order);
    }

    // Clear Cart
    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and orders created successfully",
      orders: createdOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
