import Cart from "../models/Cart.js";
import Listing from "../models/Listing.js";

export const addToCart = async (req, res) => {
  try {
    const { listingId, quantity } = req.body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.listing.toString() === listingId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        listing: listingId,
        quantity,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.listing");

    if (!cart) {
      return res.status(404).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;

    cart.items.forEach((item) => {
      totalAmount += item.listing.price * item.quantity;
    });

    res.status(200).json({
      success: true,
      totalItems: cart.items.length,

      totalAmount,

      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { listingId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.listing.toString() !== listingId,
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { listingId, quantity } = req.body;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.listing.toString() === listingId,
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
