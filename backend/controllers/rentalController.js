import Rental from "../models/Rental.js";
import Listing from "../models/Listing.js";

export const createRental = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.type !== "rent") {
      return res.status(400).json({
        message: "This listing is not available for rent",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Calculate days
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const totalRent = totalDays * listing.rentPerDay;

    const rental = await Rental.create({
      renter: req.user._id,
      owner: listing.owner,
      listing: listing._id,

      startDate,
      endDate,

      totalDays,
      rentPerDay: listing.rentPerDay,
      totalRent,

      paymentStatus: "pending",
      rentalStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Rental Request Sent",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Buyer Rentals
// =========================================

export const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      renter: req.user._id,
    })
      .populate("listing", "title image")
      .populate("owner", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Seller Rentals
// =========================================

export const getSellerRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      owner: req.user._id,
    })
      .populate("listing", "title image")
      .populate("renter", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Update Rental Status
// =========================================

export const updateRentalStatus = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    rental.rentalStatus = req.body.rentalStatus;

    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental Status Updated",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Delete Rental
// =========================================

export const deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    await rental.deleteOne();

    res.status(200).json({
      success: true,
      message: "Rental Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
