import Listing from "../models/Listing.js";

//create listing
export const createListing = async (req, res) => {
  try {
    const {
      type,
      category,
      title,
      description,
      image,
      price,
      rentPerDay,
      quantity,
      quantityType,
      location,
    } = req.body;

    const listing = await Listing.create({
      owner: req.user._id,

      type,
      category,
      title,
      description,
      image,
      price,
      rentPerDay,
      quantity,
      quantityType,
      location,
    });

    res.status(201).json({
      success: true,
      message: "Listing Created Successfully",
      listing,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//get all listings

export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate("owner", "name email").sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get single listing

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "owner",
      "name email",
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
